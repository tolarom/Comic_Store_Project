<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <!-- Back to Cart Button -->
      <router-link
        to="/client/cart"
        class="inline-flex items-center gap-2 mb-8 text-blue-600 hover:text-blue-800 font-medium transition"
      >
        <svg class="w-6 h-6 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        Back to Cart
      </router-link>

      <h1 class="text-4xl font-bold text-blue-600 mb-10">Checkout</h1>

      <div class="grid lg:grid-cols-2 gap-12">
        <!-- Left: Shipping Information -->
        <div>
          <h2 class="text-2xl font-semibold text-blue-600 mb-8">Shipping Information</h2>

          <!-- Delivery / Pick Up -->
          <div class="flex gap-12 mb-10">
            <label class="flex items-center gap-4 cursor-pointer">
              <input
                type="radio"
                name="shippingMethod"
                value="delivery"
                v-model="shippingMethod"
                class="w-6 h-6 text-blue-600 focus:ring-blue-500"
              />
              <span class="text-xl font-medium">Delivery</span>
            </label>
            <label class="flex items-center gap-4 cursor-pointer">
              <input
                type="radio"
                name="shippingMethod"
                value="pickup"
                v-model="shippingMethod"
                class="w-6 h-6 text-blue-600 focus:ring-blue-500"
              />
              <span class="text-xl font-medium">Pick Up</span>
            </label>
          </div>

          <form @submit.prevent="placeOrder" class="space-y-6">
            <!-- Full Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.fullName"
                type="text"
                required
                placeholder="John Doe"
                class="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.email"
                type="email"
                required
                placeholder="john@example.com"
                class="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.phone"
                type="tel"
                required
                placeholder="+1 (555) 123-4567"
                class="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <!-- Country -->
            <div v-if="shippingMethod === 'delivery'">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Country <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.country"
                type="text"
                :required="shippingMethod === 'delivery'"
                placeholder="United States"
                class="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <!-- Address -->
            <div v-if="shippingMethod === 'delivery'">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Address <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="form.address"
                :required="shippingMethod === 'delivery'"
                placeholder="123 Main St, Apt 4B, New York, NY 10001"
                rows="3"
                class="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              ></textarea>
            </div>

            <!-- Terms & Conditions -->
            <label class="flex items-start gap-4 mt-10 cursor-pointer">
              <input
                v-model="form.agreeToTerms"
                type="checkbox"
                required
                class="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span class="text-base text-gray-600 leading-relaxed">
                I have read and agree to the
                <a href="#" class="text-blue-600 underline hover:text-blue-800"
                  >Terms and Conditions</a
                >
                and
                <a href="#" class="text-blue-600 underline hover:text-blue-800">Privacy Policy</a>
              </span>
            </label>
          </form>
        </div>

        <!-- Right: Order Summary (connected to real cart data) -->
        <div class="lg:sticky lg:top-8 h-fit">
          <h2 class="text-2xl font-semibold text-blue-600 mb-8">Order Summary</h2>

          <div class="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <!-- Selected Cart Items -->
            <div class="space-y-6 mb-8 max-h-96 overflow-y-auto">
              <div
                v-for="item in cartItems"
                :key="item.id"
                class="flex gap-5 pb-4 border-b last:border-0"
              >
                <div
                  class="w-24 h-24 bg-gray-200 border-2 border-dashed border-gray-300 rounded-xl flex-shrink-0 bg-cover bg-center"
                  :style="{ backgroundImage: `url(${item.image || '/placeholder.jpg'})` }"
                />
                <div class="flex-1">
                  <p class="font-semibold text-gray-900">{{ item.name }}</p>
                  <p class="text-sm text-gray-500 mt-1">
                    {{ item.quantity }} × ${{ item.price.toFixed(2) }}
                  </p>
                </div>
                <p class="font-bold text-gray-900">
                  ${{ (item.price * item.quantity).toFixed(2) }}
                </p>
              </div>
            </div>

            <!-- Pricing Breakdown -->
            <div class="border-t-2 border-gray-200 pt-6 space-y-4">
              <div class="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${{ subtotal.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>${{ shippingCost.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Tax (8%)</span>
                <span>${{ tax.toFixed(2) }}</span>
              </div>

              <div
                class="flex justify-between text-2xl font-bold text-gray-900 pt-6 border-t-2 border-gray-300"
              >
                <span>Total</span>
                <span class="text-blue-600">${{ grandTotal.toFixed(2) }}</span>
              </div>
            </div>

            <!-- Pay Now Button -->
            <button
              @click="placeOrder"
              :disabled="!canCheckout"
              class="w-full mt-10 bg-blue-600 text-white text-lg font-semibold py-5 rounded-2xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 shadow-lg"
            >
              {{ isPlacingOrder ? 'Processing...' : 'Pay Now' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <FooterPage />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../../stores/cart'
import FooterPage from '../../components/client/FooterPage.vue'
import {
  createOrder,
  getCurrentUser,
  updateProduct,
  getProductById,
  getUserById,
} from '../../services/api'
import { useAuth } from '../../composables/useAuth'

const cartStore = useCartStore()
const { currentUser } = useAuth()
const shippingMethod = ref<'delivery' | 'pickup'>('delivery')

const form = ref({
  fullName: '',
  email: '',
  phone: '',
  country: '',
  address: '',
  agreeToTerms: false,
})

const isPlacingOrder = ref(false)
const isLoadingProfile = ref(false)
const router = useRouter()

// Load user information from API to get complete data
const loadUserProfile = async () => {
  if (!currentUser.value?.id) return

  try {
    isLoadingProfile.value = true
    const fullUserData = await getUserById(currentUser.value.id)

    // Populate form with complete user data
    form.value.fullName = fullUserData.full_name || ''
    form.value.email = fullUserData.email || ''
    form.value.phone = fullUserData.phone || ''
    form.value.country = fullUserData.country || ''
    form.value.address = fullUserData.address || ''
  } catch (err) {
    console.error('Error loading user profile:', err)
    // Fallback to currentUser data if API call fails
    if (currentUser.value) {
      form.value.fullName = currentUser.value.full_name || ''
      form.value.email = currentUser.value.email || ''
      form.value.phone = currentUser.value.phone || ''
      form.value.country = currentUser.value.country || ''
      form.value.address = currentUser.value.address || ''
    }
  } finally {
    isLoadingProfile.value = false
  }
}

onMounted(() => {
  loadUserProfile()
})

// Use only selected cart items for checkout
const cartItems = computed(() => cartStore.cartItems.filter((item) => item.selected))

// Calculations - use selected cart items for checkout
const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})
const shippingCost = computed(() => {
  if (shippingMethod.value === 'pickup') return 0.0
  return subtotal.value >= 50 ? 0.0 : 5.0
})
const tax = computed(() => subtotal.value * 0.08)
const grandTotal = computed(() => subtotal.value + shippingCost.value + tax.value)

const canCheckout = computed(() => {
  const hasBasicInfo =
    form.value.fullName && form.value.email && form.value.phone && form.value.agreeToTerms
  const hasAddress = shippingMethod.value === 'pickup' || (form.value.country && form.value.address)
  return cartItems.value.length > 0 && hasBasicInfo && hasAddress
})

// Submit order
const placeOrder = async () => {
  if (!canCheckout.value) {
    alert('Please fill in all required fields and agree to terms.')
    return
  }

  isPlacingOrder.value = true

  try {
    // Build order items from selected cart items
    const items = cartItems.value.map((it) => {
      // Ensure product_id is always a string, handle object cases
      let productId = ''
      if (it.backend_id) {
        productId =
          typeof it.backend_id === 'object'
            ? (it.backend_id as any).$oid || String(it.backend_id)
            : String(it.backend_id)
      } else {
        productId = String(it.id)
      }

      return {
        product_id: productId,
        quantity: it.quantity,
        price: it.price,
      }
    })

    // Determine user id (authenticated user or guest email)
    const user = getCurrentUser()
    let uid = ''
    if (user) {
      // Handle ObjectId format properly
      if (user._id) {
        if (typeof user._id === 'string') {
          uid = user._id
        } else if ((user._id as any).$oid) {
          uid = (user._id as any).$oid
        } else {
          uid = String(user._id)
        }
      } else if ((user as any).id) {
        uid = String((user as any).id)
      }
    }

    // Fallback to email if no user ID found
    if (!uid) {
      uid = form.value.email || `guest-${Date.now()}`
    }

    const orderPayload = {
      user_id: uid,
      products: items,
      total_price: Number(grandTotal.value),
      order_type: shippingMethod.value === 'delivery' ? 'shipping' : 'pickup',
    }

    // Create order on backend
    await createOrder(orderPayload)

    // Update product stock for each ordered item
    try {
      for (const item of items) {
        try {
          // Get current product data
          const product = await getProductById(item.product_id)
          if (product && product.stock >= item.quantity) {
            // Reduce stock by the ordered quantity
            await updateProduct(item.product_id, {
              stock: product.stock - item.quantity,
            })
          }
        } catch (err) {
          console.warn(`Failed to update stock for product ${item.product_id}:`, err)
        }
      }
    } catch (err) {
      console.warn('Some products failed to update stock:', err)
    }

    // On success, remove purchased items from cart, show alert and redirect
    cartStore.removeSelectedItems()
    alert('Order placed successfully! Thank you for shopping with us.')
    router.push('/')
  } catch (e) {
    console.error('Failed to place order:', e)
    alert('Failed to place order. Please try again.')
  } finally {
    isPlacingOrder.value = false
  }
}
</script>

<style scoped>
input:focus,
button:focus {
  outline: none;
}
</style>
