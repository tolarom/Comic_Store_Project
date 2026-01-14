<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <!-- Back to Cart Button -->
      <router-link
        to="/shopcart"
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

            <!-- City / State / Zip -->
            <div v-if="shippingMethod === 'delivery'" class="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >City <span class="text-red-500">*</span></label
                >
                <input
                  v-model="form.city"
                  type="text"
                  :required="shippingMethod === 'delivery'"
                  placeholder="New York"
                  class="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >State <span class="text-red-500">*</span></label
                >
                <input
                  v-model="form.state"
                  type="text"
                  :required="shippingMethod === 'delivery'"
                  placeholder="NY"
                  class="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Zip Code <span class="text-red-500">*</span></label
                >
                <input
                  v-model="form.zip"
                  type="text"
                  :required="shippingMethod === 'delivery'"
                  placeholder="10001"
                  class="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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

  <!-- Success Modal -->
  <transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="showSuccessModal"
      class="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      @click="closeModal"
    >
      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 scale-95 translate-y-4"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 translate-y-4"
      >
        <div
          v-if="showSuccessModal"
          @click.stop
          class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
        >
          <!-- Success Icon -->
          <div class="flex justify-center mb-6">
            <div class="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                class="w-12 h-12 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
          </div>

          <!-- Success Message -->
          <h3 class="text-2xl font-bold text-gray-800 text-center mb-3">
            Order Placed Successfully!
          </h3>
          <p class="text-gray-600 text-center mb-6">
            Thank you for shopping with us. Your order has been confirmed and will be processed
            shortly.
          </p>

          <!-- Order Details -->
          <div class="bg-gray-50 rounded-xl p-4 mb-6">
            <div class="flex justify-between text-sm mb-2">
              <span class="text-gray-600">Order Total:</span>
              <span class="font-bold text-gray-800">${{ grandTotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm mb-2">
              <span class="text-gray-600">Items:</span>
              <span class="font-medium text-gray-800">{{ cartItems.length }} product(s)</span>
            </div>
            <div class="flex justify-between text-sm mb-2">
              <span class="text-gray-600">Delivery Method:</span>
              <span class="font-medium text-gray-800 capitalize">{{ shippingMethod }}</span>
            </div>
            <div v-if="shippingMethod === 'delivery'" class="flex justify-between text-sm">
              <span class="text-gray-600">Location:</span>
              <span class="font-medium text-gray-800"
                >{{ country }}, {{ form.city }}, {{ form.state }}</span
              >
            </div>
            <div class="flex justify-between text-sm mb-2">
              <span class="text-gray-600">Phone Number:</span>
              <span class="font-medium text-gray-800 capitalize">{{ form.phone }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="grid gap-3 sm:grid-cols-2">
            <button
              @click="goToRating"
              class="w-full px-6 py-3 bg-white text-blue-600 border border-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-sm"
            >
              Leave a Rating
            </button>
            <button
              @click="closeModal"
              class="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </transition>
    </div>
  </transition>
  <FooterPage />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useRatingSessionStore } from '@/stores/ratingSession'
import FooterPage from '@/components/client/FooterPage.vue'

const cartStore = useCartStore()
const ratingSessionStore = useRatingSessionStore()
const shippingMethod = ref<'delivery' | 'pickup'>('delivery')

const form = ref({
  fullName: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  state: '',
  zip: '',
  agreeToTerms: false,
})

const isPlacingOrder = ref(false)
const showSuccessModal = ref(false)
const router = useRouter()

// Load user profile from localStorage
const loadUserProfile = () => {
  const savedProfile = localStorage.getItem('userProfile')
  if (savedProfile) {
    try {
      const profile = JSON.parse(savedProfile)
      form.value.fullName = profile.fullName || ''
      form.value.email = profile.email || ''
      form.value.phone = profile.phoneNumber || ''
      form.value.country = profile.country || ''
    } catch (e) {
      console.log('Could not parse user profile')
    }
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
  const hasAddress =
    shippingMethod.value === 'pickup' ||
    (form.value.country && form.value.city && form.value.state && form.value.zip)
  return cartItems.value.length > 0 && hasBasicInfo && hasAddress
})

// Submit order
const placeOrder = () => {
  if (!canCheckout.value) {
    alert('Please fill in all required fields and agree to terms.')
    return
  }

  isPlacingOrder.value = true

  // Simulate payment processing
  setTimeout(() => {
    isPlacingOrder.value = false
    showSuccessModal.value = true
  }, 2000)
}

// Close modal and redirect
const closeModal = () => {
  showSuccessModal.value = false
  cartStore.removeSelectedItems()
  setTimeout(() => {
    router.push('/')
  }, 300)
}

const goToRating = () => {
  // Capture purchased items for rating before clearing cart
  ratingSessionStore.setItems(
    cartItems.value.map((item) => ({
      id: item.id,
      name: item.name,
      image: item.image,
      quantity: item.quantity,
      price: item.price,
    })),
  )

  showSuccessModal.value = false
  cartStore.removeSelectedItems()
  setTimeout(() => {
    router.push('/rating')
  }, 300)
}
</script>

<style scoped>
input:focus,
button:focus {
  outline: none;
}
</style>
