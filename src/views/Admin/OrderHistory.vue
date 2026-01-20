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
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                <span :class="getStatusClass(order.status)">{{ order.status }}</span>
              </td>
              <td class="px-6 py-4">
                <select
                  v-model="order.status"
                  @change="updateOrderStatus(order)"
                  class="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
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
import { ref, computed } from 'vue'
import Header from '@/components/Admin/NavigationBar.vue'

const searchQuery = ref('')
const statusFilter = ref('all')

const orders = ref([
  {
    _id: 'ORD-2026-001',
    user_name: 'John Doe',
    user_email: 'john@example.com',
    created_at: '2026-01-15T10:30:00',
    total_amount: 89.99,
    status: 'delivered',
    items: [
      { name: 'Spider-Man Vol 1', quantity: 2, price: 29.99 },
      { name: 'Batman Issue #1', quantity: 1, price: 30.01 }
    ]
  },
  {
    _id: 'ORD-2026-002',
    user_name: 'Jane Smith',
    user_email: 'jane@example.com',
    created_at: '2026-01-18T14:20:00',
    total_amount: 45.50,
    status: 'shipped',
    items: [
      { name: 'X-Men Collection', quantity: 1, price: 45.50 }
    ]
  },
  {
    _id: 'ORD-2026-003',
    user_name: 'Bob Johnson',
    user_email: 'bob@example.com',
    created_at: '2026-01-19T09:15:00',
    total_amount: 120.00,
    status: 'processing',
    items: [
      { name: 'Marvel Complete Set', quantity: 1, price: 120.00 }
    ]
  },
  {
    _id: 'ORD-2026-004',
    user_name: 'Alice Brown',
    user_email: 'alice@example.com',
    created_at: '2026-01-10T16:45:00',
    total_amount: 67.98,
    status: 'pending',
    items: [
      { name: 'Wonder Woman #1', quantity: 2, price: 25.99 },
      { name: 'The Flash Comics', quantity: 1, price: 16.00 }
    ]
  }
])

const filteredOrders = computed(() => {
  let filtered = orders.value

  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(order => order.status === statusFilter.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      order =>
        order._id.toLowerCase().includes(query) ||
        order.user_name.toLowerCase().includes(query) ||
        order.user_email.toLowerCase().includes(query)
    )
  }

  return filtered
})

const pendingOrders = computed(() => orders.value.filter(o => o.status === 'pending').length)
const shippedOrders = computed(() => orders.value.filter(o => o.status === 'shipped').length)
const deliveredOrders = computed(() => orders.value.filter(o => o.status === 'delivered').length)

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const getStatusClass = (status: string) => {
  const classes = {
    pending: 'px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700',
    processing: 'px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700',
    shipped: 'px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700',
    delivered: 'px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700',
    cancelled: 'px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700'
  }
  return classes[status] || 'px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700'
}

const updateOrderStatus = (order: any) => {
  console.log('Order status updated:', order._id, order.status)
}
</script>
