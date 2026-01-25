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

      <!-- Loading State -->
      <div v-if="isLoading" class="bg-white rounded-lg shadow-sm p-12 text-center">
        <i class="pi pi-spin pi-spinner text-blue-600 text-6xl mb-4"></i>
        <p class="text-gray-600">Loading your orders...</p>
      </div>

      <!-- Orders List -->
      <div v-else class="space-y-4">
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="bg-white rounded-lg shadow-sm p-6"
        >
          <div class="flex flex-wrap justify-between items-start gap-4 mb-4">
            <div>
              <p class="text-sm text-gray-600">Order #{{ order.id }}</p>
              <p class="text-sm text-gray-600">{{ formatDate(order.date) }}</p>
              <p
                class="text-sm font-medium mt-1"
                :class="
                  order.order_type === 'pickup' && order.status === 'delivered'
                    ? 'text-green-600'
                    : order.order_type === 'pickup'
                      ? 'text-purple-600'
                      : 'text-blue-600'
                "
              >
                <i
                  :class="order.order_type === 'pickup' ? 'pi pi-shopping-bag' : 'pi pi-truck'"
                ></i>
                {{
                  order.order_type === 'pickup'
                    ? order.status === 'delivered'
                      ? 'Picked Up ✓'
                      : 'Pickup'
                    : 'Delivery'
                }}
              </p>
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
                v-if="isOrderComplete(order)"
                @click="rateOrder(order.id)"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
              >
                <i class="pi pi-star"></i>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavigationBar from '../../components/client/NavigationBar.vue'
import { useRatingSessionStore } from '../../stores/ratingSession'
import FooterPage from '../../components/client/FooterPage.vue'
import { useAuth } from '../../composables/useAuth'
import { getUserOrders, getProductById } from '../../services/api'

const router = useRouter()
const ratingSessionStore = useRatingSessionStore()
const { currentUser } = useAuth()
const filterStatus = ref('all')
const isLoading = ref(true)

interface OrderItemDisplay {
  id: string
  product_id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface OrderDisplay {
  id: string
  date: string
  total: number
  status: string
  order_type?: string
  items: OrderItemDisplay[]
}

const orders = ref<OrderDisplay[]>([])

// Load user orders from API
const loadOrders = async () => {
  if (!currentUser.value) {
    isLoading.value = false
    return
  }

  try {
    isLoading.value = true

    // Extract user ID
    let userId = ''
    if (currentUser.value._id) {
      if (typeof currentUser.value._id === 'string') {
        userId = currentUser.value._id
      } else if ((currentUser.value._id as any).$oid) {
        userId = (currentUser.value._id as any).$oid
      }
    } else if ((currentUser.value as any).id) {
      userId = String((currentUser.value as any).id)
    }

    if (!userId) {
      console.warn('No user ID found')
      isLoading.value = false
      return
    }

    // Fetch orders for this user
    const userOrders = await getUserOrders(userId)

    // Transform orders to display format with product details
    const ordersWithDetails = await Promise.all(
      userOrders.map(async (order) => {
        const items = await Promise.all(
          order.products.map(async (product) => {
            try {
              // Fetch product details
              const productDetails = await getProductById(product.product_id)
              return {
                id: product.product_id,
                product_id: product.product_id,
                name: productDetails.title || 'Unknown Product',
                price: product.price,
                quantity: product.quantity,
                image: productDetails.image_url || '/images/placeholder.jpg',
              }
            } catch (err) {
              console.warn(`Failed to load product ${product.product_id}:`, err)
              return {
                id: product.product_id,
                product_id: product.product_id,
                name: 'Product Unavailable',
                price: product.price,
                quantity: product.quantity,
                image: '/images/placeholder.jpg',
              }
            }
          }),
        )

        return {
          id: order._id || order.id || 'unknown',
          date: order.created_at || new Date().toISOString(),
          total: order.total_price,
          status: order.status,
          order_type: order.order_type || 'shipping',
          items,
        }
      }),
    )

    orders.value = ordersWithDetails
  } catch (error) {
    console.error('Failed to load orders:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadOrders()
})

const orderStatuses = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'completed', label: 'Completed' },
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
    completed: 'px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700',
  }
  return classes[status] || 'px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700'
}

const isOrderComplete = (order: OrderDisplay): boolean => {
  // Order is complete if status is delivered or complete
  return order.status === 'delivered' || order.status === 'completed'
}

const rateOrder = (orderId: string) => {
  const order = orders.value.find((o) => o.id === orderId)
  if (order) {
    ratingSessionStore.setItems(
      order.items.map((item) => ({
        id: parseInt(item.id) || 0,
        backend_id: item.product_id,
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
