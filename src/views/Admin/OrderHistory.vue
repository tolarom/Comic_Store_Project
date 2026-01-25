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
          <p class="text-sm text-gray-600">Total Orders</p>
          <p class="text-2xl font-bold text-gray-900">{{ activeOrdersCount }}</p>
          <p class="text-xs text-gray-500 mt-1">{{ cancelledOrdersCount }} cancelled</p>
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
          <p class="text-sm text-gray-600">Total Revenue</p>
          <p class="text-2xl font-bold text-purple-600">${{ totalRevenue.toFixed(2) }}</p>
          <p class="text-xs text-gray-500 mt-1">Excl. cancelled</p>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div class="flex gap-4">
          <div class="relative flex-1">
            <i
              class="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            ></i>
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
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Order ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Customer
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Total
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Delivery
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Actions
              </th>
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
                <div class="flex flex-col gap-2">
                  <div class="flex items-center gap-2">
                    <i :class="getStatusIcon(order.status)" class="text-sm"></i>
                    <span :class="getStatusClass(order.status)">
                      {{ getStatusLabel(order.status) }}
                    </span>
                  </div>
                  <!-- Status Progress Bar -->
                  <div class="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      :class="getStatusProgressClass(order.status)"
                      :style="{ width: getStatusProgress(order.status, order.delivery_method) }"
                      class="h-1.5 rounded-full transition-all duration-300"
                    ></div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <button
                    @click="openOrderDetail(order)"
                    class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <i class="pi pi-eye text-xs"></i>
                    View
                  </button>

                  <div class="relative group">
                    <button
                      @click="toggleStatusMenu(order._id, $event)"
                      class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center gap-1"
                      :class="{ 'bg-gray-50': activeStatusMenu === order._id }"
                      :ref="
                        (el) => {
                          if (el) buttonRefs[order._id] = el
                        }
                      "
                    >
                      <i class="pi pi-refresh text-xs"></i>
                      Update
                    </button>

                    <!-- Status Dropdown Menu -->
                    <div
                      v-if="activeStatusMenu === order._id"
                      :class="[
                        'fixed w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50',
                      ]"
                      :style="{
                        top: dropdownPosition === 'top' ? (dropdownTop - 320) + 'px' : (dropdownTop + 40) + 'px',
                        right: 'auto',
                        left: (dropdownLeft - 224) + 'px',
                      }"
                    >
                      <div class="p-2">
                        <p class="text-xs font-semibold text-gray-500 uppercase px-3 py-1">
                          Change Status
                        </p>
                        <template v-if="order.delivery_method === 'pickup'">
                          <button
                            v-for="status in pickupStatuses"
                            :key="status.value"
                            @click="changeOrderStatus(order, status.value)"
                            :disabled="order.status === status.value"
                            class="w-full text-left px-3 py-2 rounded hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            :class="{
                              'bg-gray-100 cursor-not-allowed opacity-50':
                                order.status === status.value,
                            }"
                          >
                            <i :class="status.icon" :style="{ color: status.color }"></i>
                            <div class="flex-1">
                              <div class="text-sm font-medium">{{ status.label }}</div>
                              <div class="text-xs text-gray-500">{{ status.description }}</div>
                            </div>
                            <i
                              v-if="order.status === status.value"
                              class="pi pi-check text-green-600"
                            ></i>
                          </button>
                        </template>
                        <template v-else>
                          <button
                            v-for="status in shippingStatuses"
                            :key="status.value"
                            @click="changeOrderStatus(order, status.value)"
                            :disabled="order.status === status.value"
                            class="w-full text-left px-3 py-2 rounded hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            :class="{
                              'bg-gray-100 cursor-not-allowed opacity-50':
                                order.status === status.value,
                            }"
                          >
                            <i :class="status.icon" :style="{ color: status.color }"></i>
                            <div class="flex-1">
                              <div class="text-sm font-medium">{{ status.label }}</div>
                              <div class="text-xs text-gray-500">{{ status.description }}</div>
                            </div>
                            <i
                              v-if="order.status === status.value"
                              class="pi pi-check text-green-600"
                            ></i>
                          </button>
                        </template>
                      </div>
                    </div>
                  </div>
                </div>
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

      <!-- Order Detail Modal -->
      <div
        v-if="showDetailModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      >
        <div class="bg-white rounded-lg w-11/12 max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h2 class="text-2xl font-bold">Order Details</h2>
              <p class="text-sm text-gray-500 mt-1">
                Order ID: <span class="font-mono">#{{ selectedOrder?._id }}</span>
              </p>
            </div>
            <button
              @click="closeDetailModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i class="pi pi-times text-xl"></i>
            </button>
          </div>

          <!-- Status Timeline -->
          <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 class="font-semibold mb-3 flex items-center gap-2">
              <i class="pi pi-clock text-blue-600"></i>
              Order Timeline
            </h3>
            <div class="relative">
              <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
              <div
                v-for="(step, idx) in getOrderTimeline(selectedOrder)"
                :key="idx"
                class="relative flex items-start gap-4 mb-4 last:mb-0"
              >
                <div
                  :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center z-10',
                    step.completed
                      ? 'bg-green-500 text-white'
                      : step.current
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300 text-gray-600',
                  ]"
                >
                  <i :class="step.icon" class="text-sm"></i>
                </div>
                <div class="flex-1 pt-1">
                  <div
                    class="font-medium"
                    :class="step.completed || step.current ? 'text-gray-900' : 'text-gray-500'"
                  >
                    {{ step.label }}
                  </div>
                  <div class="text-sm text-gray-500">{{ step.description }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 bg-gray-50 rounded-lg">
                <h3 class="font-semibold flex items-center gap-2 mb-2">
                  <i class="pi pi-user text-blue-600"></i>
                  Customer
                </h3>
                <p class="text-sm font-medium">{{ selectedOrder?.user_name }}</p>
                <p class="text-sm text-gray-600">{{ selectedOrder?.user_email }}</p>
              </div>
              <div class="p-4 bg-gray-50 rounded-lg">
                <h3 class="font-semibold flex items-center gap-2 mb-2">
                  <i class="pi pi-calendar text-blue-600"></i>
                  Order Date
                </h3>
                <p class="text-sm">{{ formatDate(selectedOrder?.created_at) }}</p>
              </div>
            </div>

            <div>
              <h3 class="font-semibold flex items-center gap-2 mb-3">
                <i class="pi pi-shopping-cart text-blue-600"></i>
                Order Items
              </h3>
              <div class="border rounded-lg overflow-hidden">
                <div
                  v-for="(it, idx) in selectedOrder?.items || []"
                  :key="idx"
                  class="flex justify-between items-center px-4 py-3 border-b last:border-b-0 hover:bg-gray-50"
                >
                  <div class="flex-1">
                    <div class="font-medium">{{ it.name }}</div>
                    <div class="text-sm text-gray-500">Quantity: {{ it.quantity }}</div>
                  </div>
                  <div class="font-semibold text-lg">${{ Number(it.price).toFixed(2) }}</div>
                </div>
              </div>
            </div>

            <div class="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <div>
                <h3 class="font-semibold flex items-center gap-2">
                  <i class="pi pi-truck text-blue-600"></i>
                  Delivery Method
                </h3>
                <div class="text-sm mt-1">
                  {{
                    selectedOrder?.delivery_method === 'pickup' ? 'Store Pickup' : 'Home Delivery'
                  }}
                </div>
              </div>
              <div class="text-right">
                <h3 class="font-semibold text-gray-600">Total Amount</h3>
                <div class="text-2xl font-bold text-blue-600">
                  ${{ (selectedOrder?.total_amount || 0).toFixed(2) }}
                </div>
              </div>
            </div>

            <div class="flex gap-2 justify-end pt-4 border-t">
              <button
                @click="closeDetailModal"
                class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Header from '../../components/Admin/NavigationBar.vue'
import {
  getAllOrders as apiGetAllOrders,
  updateOrderStatus as apiUpdateOrderStatus,
  getAllUsers as apiGetAllUsers,
} from '../../services/api'
import { getAllProducts as apiGetAllProducts } from '../../services/api'

const searchQuery = ref('')
const statusFilter = ref('all')
const deliveryFilter = ref('all')

const orders = ref<any[]>([])
const loading = ref(false)
const activeStatusMenu = ref<string | null>(null)
const dropdownPosition = ref<'top' | 'bottom'>('bottom')
const dropdownTop = ref(0)
const dropdownLeft = ref(0)
const buttonRefs: Record<string, HTMLElement> = {}

// Status configurations
const shippingStatuses = [
  {
    value: 'pending',
    label: 'Pending',
    description: 'Order received',
    icon: 'pi pi-clock',
    color: '#f59e0b',
  },
  {
    value: 'processing',
    label: 'Processing',
    description: 'Preparing order',
    icon: 'pi pi-spin pi-spinner',
    color: '#3b82f6',
  },
  {
    value: 'shipped',
    label: 'Shipped',
    description: 'Out for delivery',
    icon: 'pi pi-truck',
    color: '#8b5cf6',
  },
  {
    value: 'delivered',
    label: 'Delivered',
    description: 'Order completed',
    icon: 'pi pi-check-circle',
    color: '#10b981',
  },
]

const pickupStatuses = [
  {
    value: 'pending',
    label: 'Pending',
    description: 'Order received',
    icon: 'pi pi-clock',
    color: '#f59e0b',
  },
  {
    value: 'processing',
    label: 'Processing',
    description: 'Preparing for pickup',
    icon: 'pi pi-spin pi-spinner',
    color: '#3b82f6',
  },
  {
    value: 'completed',
    label: 'Ready for Pickup',
    description: 'Ready to collect',
    icon: 'pi pi-check-circle',
    color: '#10b981',
  },
]

const toggleStatusMenu = (orderId: string, event?: Event) => {
  if (activeStatusMenu.value === orderId) {
    activeStatusMenu.value = null
  } else {
    activeStatusMenu.value = orderId

    // Calculate dropdown position
    if (event) {
      const button = event.currentTarget as HTMLElement
      const buttonRect = button.getBoundingClientRect()
      const dropdownHeight = 320 // Height of dropdown
      const navbarHeight = 100 // Height of navbar/header
      const spaceBelow = window.innerHeight - buttonRect.bottom
      const spaceAbove = buttonRect.top - navbarHeight

      // Store button position for fixed positioning
      dropdownTop.value = buttonRect.top
      dropdownLeft.value = buttonRect.right

      // Show dropdown above if there's not enough space below and there's more space above
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        dropdownPosition.value = 'top'
      } else {
        dropdownPosition.value = 'bottom'
      }
    }
  }
}

const changeOrderStatus = async (order: any, newStatus: string) => {
  order.status = newStatus
  activeStatusMenu.value = null
  await updateOrderStatus(order)
}

const loadOrders = async () => {
  loading.value = true
  try {
    const [fetchedOrders, users, products] = await Promise.all([
      apiGetAllOrders().catch((e) => {
        console.warn('Failed to fetch orders from API', e)
        return [] as any[]
      }),
      apiGetAllUsers().catch(() => []),
      apiGetAllProducts().catch(() => []),
    ])

    const normalizeId = (raw: any) => {
      if (raw === null || raw === undefined) return ''
      if (typeof raw === 'string') return raw
      if (typeof raw === 'number') return String(raw)
      if (raw && typeof raw === 'object') {
        if (raw.$oid) return String(raw.$oid)
        if (raw._id && typeof raw._id === 'object' && raw._id.$oid) return String(raw._id.$oid)
        if (raw._id && typeof raw._id === 'string') return String(raw._id)
        if (raw.id) return String(raw.id)
      }
      if (raw.toString && typeof raw.toString === 'function') return raw.toString()
      return String(raw)
    }
    // build product id -> title/name map
    const productTitleMap = new Map<string, string>()
    ;(products || []).forEach((p: any) => {
      const key = normalizeId(p._id) || normalizeId(p.id) || ''
      if (key) productTitleMap.set(String(key), String(p.title || p.name || ''))
    })
    const userMap = new Map<string, any>()
    users.forEach((u: any) => {
      const keys = [normalizeId(u._id), normalizeId(u.id), u.username, String(u.email || '')]
      keys.forEach((k) => {
        if (k) userMap.set(String(k), u)
      })
    })

    orders.value = (fetchedOrders || []).map((o: any) => {
      const id =
        normalizeId(o._id) ||
        normalizeId(o.id) ||
        normalizeId(o.order_id) ||
        `ORD-${Math.random().toString(36).slice(2, 9)}`
      // attempt to resolve user via multiple possible keys
      const rawUserId = o.user_id || (o.user && (o.user._id || o.user.id))
      const nUserId = normalizeId(rawUserId)
      let user =
        o.user || (nUserId && userMap.get(String(nUserId))) || userMap.get(String(rawUserId)) || {}
      if ((!user || Object.keys(user).length === 0) && o.user_email) {
        // fallback: try find by email
        user =
          users.find(
            (uu: any) =>
              String(uu.email || '').toLowerCase() === String(o.user_email || '').toLowerCase(),
          ) || {}
      }
      return {
        _id: id,
        user_name: user.full_name || user.username || user.name || 'Unknown',
        user_email: user.email || '',
        created_at: o.created_at || o.createdAt || new Date().toISOString(),
        total_amount: o.total_price || o.total_amount || 0,
        status: o.status || 'pending',
        delivery_method: o.order_type || o.delivery_method || o.delivery || 'shipping',
        items: (o.products || o.items || []).map((it: any) => {
          const rawPid = it.product_id || it.product || it.id || null
          const pid = normalizeId(rawPid)
          const resolved =
            it.name ||
            (pid && productTitleMap.get(String(pid))) ||
            it.product_name ||
            it.product_id ||
            'Product'
          return {
            name: resolved,
            quantity: it.quantity || it.qty || 1,
            price: it.price || 0,
          }
        }),
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
  // Close status menu when clicking outside
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative.group')) {
    activeStatusMenu.value = null
  }
}

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
        String(order.user_name || '')
          .toLowerCase()
          .includes(query) ||
        String(order.user_email || '')
          .toLowerCase()
          .includes(query),
    )
  }

  return filtered
})

const pendingOrders = computed(() => orders.value.filter((o: any) => o.status === 'pending').length)
const shippedOrders = computed(() => orders.value.filter((o: any) => o.status === 'shipped').length)
const deliveredOrders = computed(
  () => orders.value.filter((o: any) => o.status === 'delivered').length,
)
const activeOrdersCount = computed(
  () => orders.value.filter((o: any) => o.status !== 'cancelled').length,
)
const cancelledOrdersCount = computed(
  () => orders.value.filter((o: any) => o.status === 'cancelled').length,
)
const totalRevenue = computed(() =>
  orders.value
    .filter((o: any) => o.status !== 'cancelled')
    .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0),
)

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

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    pending: 'pi pi-clock text-yellow-600',
    processing: 'pi pi-spin pi-spinner text-blue-600',
    shipped: 'pi pi-truck text-purple-600',
    delivered: 'pi pi-check-circle text-green-600',
    completed: 'pi pi-check-circle text-emerald-600',
    cancelled: 'pi pi-times-circle text-red-600',
  }
  return icons[status] || 'pi pi-circle text-gray-600'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }
  return labels[status] || status.charAt(0).toUpperCase() + status.slice(1)
}

const getStatusProgress = (status: string, deliveryMethod: string) => {
  if (deliveryMethod === 'pickup') {
    const progress: Record<string, string> = {
      pending: '25%',
      processing: '50%',
      completed: '100%',
      cancelled: '100%',
    }
    return progress[status] || '0%'
  } else {
    const progress: Record<string, string> = {
      pending: '20%',
      processing: '40%',
      shipped: '70%',
      delivered: '100%',
      cancelled: '100%',
    }
    return progress[status] || '0%'
  }
}

const getStatusProgressClass = (status: string) => {
  if (status === 'cancelled') {
    return 'bg-red-500'
  } else if (status === 'delivered' || status === 'completed') {
    return 'bg-green-500'
  } else if (status === 'shipped') {
    return 'bg-purple-500'
  } else if (status === 'processing') {
    return 'bg-blue-500'
  } else {
    return 'bg-yellow-500'
  }
}

const getOrderTimeline = (order: any) => {
  if (!order) return []

  const currentStatus = order.status
  const isPickup = order.delivery_method === 'pickup'

  if (isPickup) {
    const steps = [
      {
        label: 'Order Placed',
        description: 'Order has been received',
        icon: 'pi pi-shopping-cart',
        status: 'pending',
      },
      {
        label: 'Processing',
        description: 'Preparing your order',
        icon: 'pi pi-cog',
        status: 'processing',
      },
      {
        label: 'Ready for Pickup',
        description: 'Your order is ready to collect',
        icon: 'pi pi-check-circle',
        status: 'completed',
      },
    ]

    const statusOrder = ['pending', 'processing', 'completed']
    const currentIndex = statusOrder.indexOf(currentStatus)

    return steps.map((step, index) => ({
      ...step,
      completed: index < currentIndex || (currentStatus === 'completed' && index <= 2),
      current: statusOrder[index] === currentStatus,
    }))
  } else {
    const steps = [
      {
        label: 'Order Placed',
        description: 'Order has been received',
        icon: 'pi pi-shopping-cart',
        status: 'pending',
      },
      {
        label: 'Processing',
        description: 'Preparing your order',
        icon: 'pi pi-cog',
        status: 'processing',
      },
      {
        label: 'Shipped',
        description: 'Order is on its way',
        icon: 'pi pi-truck',
        status: 'shipped',
      },
      {
        label: 'Delivered',
        description: 'Order has been delivered',
        icon: 'pi pi-check-circle',
        status: 'delivered',
      },
    ]

    const statusOrder = ['pending', 'processing', 'shipped', 'delivered']
    const currentIndex = statusOrder.indexOf(currentStatus)

    return steps.map((step, index) => ({
      ...step,
      completed: index < currentIndex || (currentStatus === 'delivered' && index <= 3),
      current: statusOrder[index] === currentStatus,
    }))
  }
}

const getDeliveryClass = (method: string) => {
  const classes: Record<string, string> = {
    pickup: 'px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700',
    shipping: 'px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700',
  }
  return classes[method] || 'px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700'
}

const updateOrderStatus = async (order: any) => {
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

// Order detail modal state
const selectedOrder = ref<any | null>(null)
const showDetailModal = ref(false)

const openOrderDetail = (order: any) => {
  selectedOrder.value = order
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedOrder.value = null
}
</script>
