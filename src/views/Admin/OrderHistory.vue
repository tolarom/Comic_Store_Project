<template>
  <div><Header /></div>
  <div class="min-h-screen bg-gray-50 p-6 ml-[250px] mt-10">
    <div class="mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
        <p class="text-gray-600">View and manage customer orders</p>
      </div>

      <!-- Simple Stats -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <p class="text-sm text-gray-600">Total</p>
          <p class="text-2xl font-bold text-gray-900">{{ orders.length }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <p class="text-sm text-gray-600">Pending</p>
          <p class="text-2xl font-bold text-yellow-600">{{ pendingOrders }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <p class="text-sm text-gray-600">Shipped</p>
          <p class="text-2xl font-bold text-blue-600">{{ shippedOrders }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <p class="text-sm text-gray-600">Delivered</p>
          <p class="text-2xl font-bold text-green-600">{{ deliveredOrders }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <p class="text-sm text-gray-600">Pickups</p>
          <p class="text-2xl font-bold text-purple-600">{{ pickupOrders }}</p>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div class="flex gap-4">
          <div class="relative flex-1">
            <i class="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search by order ID or customer..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            v-model="statusFilter"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
          <select
            v-model="deliveryFilter"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Delivery</option>
            <option value="shipping">Shipping</option>
            <option value="pickup">Pickup</option>
          </select>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Delivery</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="order in filteredOrders" :key="order._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 font-mono text-sm text-blue-600">#{{ order._id }}</td>
              <td class="px-6 py-4">
                <div class="font-medium">{{ order.user_name }}</div>
                <div class="text-sm text-gray-500">{{ order.user_email }}</div>
              </td>
              <td class="px-6 py-4 text-sm">{{ formatDate(order.created_at) }}</td>
              <td class="px-6 py-4 font-semibold">${{ order.total_amount.toFixed(2) }}</td>
              <td class="px-6 py-4">
                <span :class="getDeliveryClass(order.delivery_method)">
                  {{ order.delivery_method === 'pickup' ? 'Pickup' : 'Shipping' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span :class="getStatusClass(order.status)">{{ order.status }}</span>
              </td>
              <td class="px-6 py-4">
                <select
                  v-model="order.status"
                  @change="updateOrderStatus(order)"
                  class="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <template v-if="order.delivery_method === 'pickup'">
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </template>
                  <template v-else>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </template>
                </select>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredOrders.length === 0" class="text-center py-12">
          <i class="pi pi-shopping-cart text-gray-300 text-5xl mb-3"></i>
          <h3 class="text-lg font-semibold text-gray-600 mb-1">No orders found</h3>
          <p class="text-sm text-gray-500">Try adjusting your search or filter</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Header from '@/components/Admin/NavigationBar.vue'
import {
  getAllOrders as apiGetAllOrders,
  updateOrderStatus as apiUpdateOrderStatus,
  getAllUsers as apiGetAllUsers,
} from '@/services/api'

const searchQuery = ref('')
const statusFilter = ref('all')
const deliveryFilter = ref('all')

const orders = ref<any[]>([])
const loading = ref(false)

const loadOrders = async () => {
  loading.value = true
  try {
    const [fetchedOrders, users] = await Promise.all([
      apiGetAllOrders().catch((e) => {
        console.warn('Failed to fetch orders from API', e)
        return [] as any[]
      }),
      apiGetAllUsers().catch(() => []),
    ])

    const normalizeId = (raw: any) => {
      if (!raw) return null
      if (typeof raw === 'string') return raw
      if (raw.$oid) return raw.$oid
      if (raw.toString && typeof raw.toString === 'function') return raw.toString()
      return String(raw)
    }
    const userMap = new Map<string, any>()
    users.forEach((u: any) => {
      const keys = [normalizeId(u._id), normalizeId(u.id), u.username, String(u.email || '')]
      keys.forEach((k) => {
        if (k) userMap.set(String(k), u)
      })
    })

    orders.value = (fetchedOrders || []).map((o: any) => {
      const id = normalizeId(o._id) || normalizeId(o.id) || normalizeId(o.order_id) || `ORD-${Math.random().toString(36).slice(2, 9)}`
      // attempt to resolve user via multiple possible keys
      const rawUserId = o.user_id || (o.user && (o.user._id || o.user.id))
      const nUserId = normalizeId(rawUserId)
      let user = o.user || (nUserId && userMap.get(String(nUserId))) || userMap.get(String(rawUserId)) || {}
      if ((!user || Object.keys(user).length === 0) && o.user_email) {
        // fallback: try find by email
        user = users.find((uu: any) => String(uu.email || '').toLowerCase() === String(o.user_email || '').toLowerCase()) || {}
      }
      return {
        _id: id,
        user_name: user.full_name || user.username || user.name || 'Unknown',
        user_email: user.email || '',
        created_at: o.created_at || o.createdAt || new Date().toISOString(),
        total_amount: o.total_price || o.total_amount || 0,
        status: o.status || 'pending',
        delivery_method: o.order_type || o.delivery_method || o.delivery || 'shipping',
        items: (o.products || o.items || []).map((it: any) => ({
          name: it.name || it.product_id || 'Product',
          quantity: it.quantity || it.qty || 1,
          price: it.price || 0,
        })),
      }
    })
  } catch (e) {
    console.error('Error loading orders:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrders()
})

const filteredOrders = computed(() => {
  let filtered = orders.value

  if (statusFilter.value !== 'all') {
    filtered = filtered.filter((order: any) => order.status === statusFilter.value)
  }

  if (deliveryFilter.value !== 'all') {
    filtered = filtered.filter((order: any) => order.delivery_method === deliveryFilter.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (order: any) =>
        String(order._id).toLowerCase().includes(query) ||
        String(order.user_name || '').toLowerCase().includes(query) ||
        String(order.user_email || '').toLowerCase().includes(query),
    )
  }

  return filtered
})

const pendingOrders = computed(() => orders.value.filter((o: any) => o.status === 'pending').length)
const shippedOrders = computed(() => orders.value.filter((o: any) => o.status === 'shipped').length)
const deliveredOrders = computed(() => orders.value.filter((o: any) => o.status === 'delivered').length)
const pickupOrders = computed(() => orders.value.filter((o: any) => o.delivery_method === 'pickup').length)

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700',
    processing: 'px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700',
    shipped: 'px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700',
    delivered: 'px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700',
    completed: 'px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700',
    cancelled: 'px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700',
  }
  return classes[status] || 'px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700'
}

const getDeliveryClass = (method: string) => {
  const classes: Record<string, string> = {
    pickup: 'px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700',
    shipping: 'px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700',
  }
  return classes[method] || 'px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700'
}

const updateOrderStatus = async (order: any) => {
  const previous = order.status
  try {
    if (!order._id) throw new Error('Missing order id')
    await apiUpdateOrderStatus(String(order._id), order.status as any)
    // refresh list from server
    await loadOrders()
  } catch (e) {
    console.error('Failed to update order status on server, applying locally', e)
    alert('Failed to update order on server — update applied locally')
    const idx = orders.value.findIndex((o: any) => o._id === order._id)
    if (idx !== -1) orders.value[idx].status = order.status
  }
}
</script>
