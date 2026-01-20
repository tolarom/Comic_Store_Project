<template>
  <NavigationBar />
  <div class="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-blue-600 mb-2">Purchase History</h1>
        <p class="text-gray-600">View all your past orders</p>
      </div>

      <!-- Filter Tabs -->
      <div class="flex gap-3 mb-6 flex-wrap">
        <button
          v-for="status in orderStatuses"
          :key="status.value"
          @click="filterStatus = status.value"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-colors',
            filterStatus === status.value
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100',
          ]"
        >
          {{ status.label }}
        </button>
      </div>

      <!-- Orders List -->
      <div class="space-y-4">
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="bg-white rounded-lg shadow-sm p-6"
        >
          <div class="flex flex-wrap justify-between items-start gap-4 mb-4">
            <div>
              <p class="text-sm text-gray-600">Order #{{ order.id }}</p>
              <p class="text-sm text-gray-600">{{ formatDate(order.date) }}</p>
            </div>
            <span :class="getStatusClass(order.status)">{{ order.status }}</span>
          </div>

          <div class="space-y-3">
            <div v-for="item in order.items" :key="item.id" class="flex gap-4">
              <img :src="item.image" :alt="item.name" class="w-16 h-16 object-cover rounded" />
              <div class="flex-1">
                <h4 class="font-semibold">{{ item.name }}</h4>
                <p class="text-sm text-gray-600">
                  Qty: {{ item.quantity }} × ${{ item.price.toFixed(2) }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-bold">${{ (item.price * item.quantity).toFixed(2) }}</p>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
            <div class="text-lg font-bold">Total: ${{ order.total.toFixed(2) }}</div>
            <div class="flex gap-3">
              <button
                v-if="order.status === 'delivered'"
                @click="rateOrder(order.id)"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Rate Order
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="filteredOrders.length === 0"
          class="bg-white rounded-lg shadow-sm p-12 text-center"
        >
          <i class="pi pi-shopping-bag text-gray-300 text-6xl mb-4"></i>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">No orders found</h3>
          <p class="text-gray-500 mb-6">
            {{
              filterStatus === 'all'
                ? "You haven't made any purchases yet"
                : `No ${filterStatus} orders`
            }}
          </p>
          <router-link
            to="/client/products"
            class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Shopping
          </router-link>
        </div>
      </div>
    </div>
  </div>
    <FooterPage />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import NavigationBar from '@/components/client/NavigationBar.vue'
import { useRatingSessionStore } from '@/stores/ratingSession'
import FooterPage from '@/components/client/FooterPage.vue'

const router = useRouter()
const ratingSessionStore = useRatingSessionStore()
const filterStatus = ref('all')

const orders = ref([
  {
    id: 'ORD-2026-001',
    date: '2026-01-15T10:30:00',
    total: 89.99,
    status: 'delivered',
    items: [
      {
        id: '1',
        name: 'Spider-Man Vol 1',
        price: 29.99,
        quantity: 2,
        image: '/images/placeholder.jpg',
      },
      {
        id: '2',
        name: 'Batman Issue #1',
        price: 30.01,
        quantity: 1,
        image: '/images/placeholder.jpg',
      },
    ],
  },
  {
    id: 'ORD-2026-002',
    date: '2026-01-18T14:20:00',
    total: 45.5,
    status: 'shipped',
    items: [
      {
        id: '3',
        name: 'X-Men Collection',
        price: 45.5,
        quantity: 1,
        image: '/images/placeholder.jpg',
      },
    ],
  },
  {
    id: 'ORD-2026-003',
    date: '2026-01-19T09:15:00',
    total: 120.0,
    status: 'processing',
    items: [
      {
        id: '4',
        name: 'Marvel Complete Set',
        price: 120.0,
        quantity: 1,
        image: '/images/placeholder.jpg',
      },
    ],
  },
  {
    id: 'ORD-2026-004',
    date: '2026-01-10T16:45:00',
    total: 67.98,
    status: 'pending',
    items: [
      {
        id: '5',
        name: 'Wonder Woman #1',
        price: 25.99,
        quantity: 2,
        image: '/images/placeholder.jpg',
      },
      {
        id: '6',
        name: 'The Flash Comics',
        price: 16.0,
        quantity: 1,
        image: '/images/placeholder.jpg',
      },
    ],
  },
])

const orderStatuses = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
]

const filteredOrders = computed(() => {
  if (filterStatus.value === 'all') {
    return orders.value
  }
  return orders.value.filter((order) => order.status === filterStatus.value)
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getStatusClass = (status: string) => {
  const classes = {
    pending: 'px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700',
    processing: 'px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700',
    shipped: 'px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700',
    delivered: 'px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700',
  }
  return classes[status] || 'px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700'
}

const rateOrder = (orderId: string) => {
  const order = orders.value.find((o) => o.id === orderId)
  if (order) {
    ratingSessionStore.setItems(
      order.items.map((item) => ({
        id: item.id,
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        price: item.price,
      })),
    )
    router.push('/client/rating')
  }
}
</script>
