<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <!-- Back to Cart Button -->
      <router-link
        to="/shopcard"
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
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Country <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.country"
                type="text"
                required
                placeholder="United States"
                class="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <!-- City / State / Zip -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">City <span class="text-red-500">*</span></label>
                <input
                  v-model="form.city"
                  type="text"
                  required
                  placeholder="New York"
                  class="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  v-model="form.state"
                  type="text"
                  placeholder="NY"
                  class="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Zip Code <span class="text-red-500">*</span></label>
                <input
                  v-model="form.zip"
                  type="text"
                  required
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
                <a href="#" class="text-blue-600 underline hover:text-blue-800">Terms and Conditions</a>
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
            <!-- Cart Items from real data -->
            <div class="space-y-6 mb-8 max-h-96 overflow-y-auto">
              <div v-for="item in cartItems" :key="item.id" class="flex gap-5 pb-4 border-b last:border-0">
                <div class="w-24 h-24 bg-gray-200 border-2 border-dashed border-gray-300 rounded-xl flex-shrink-0 bg-cover bg-center" 
                     :style="{ backgroundImage: `url(${item.image || '/placeholder.jpg'})` }" />
                <div class="flex-1">
                  <p class="font-semibold text-gray-900">{{ item.name }}</p>
                  <p class="text-sm text-gray-500 mt-1">{{ item.quantity }} × ${{ item.price.toFixed(2) }}</p>
                </div>
                <p class="font-bold text-gray-900">${{ (item.price * item.quantity).toFixed(2) }}</p>
              </div>

              <div v-if="cartItems.length === 0" class="text-center py-8 text-gray-500">
                Your cart is empty
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

              <div class="flex justify-between text-2xl font-bold text-gray-900 pt-6 border-t-2 border-gray-300">
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// Fake cart data (replace with Pinia store later)
const cartItems = ref([
  { id: 1, name: 'Batman: Year One', price: 18.99, quantity: 1 },
  { id: 2, name: 'One Piece Vol. 104', price: 9.99, quantity: 2 },
  { id: 3, name: 'Spider-Man T-Shirt', price: 24.99, quantity: 1 },
])

const shippingMethod = ref<'delivery' | 'pickup'>('delivery')

const form = ref({
  fullName: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  state: '',
  zip: '',
  agreeToTerms: false
})

const isPlacingOrder = ref(false)
const router = useRouter()

// Calculations
const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const shippingCost = computed(() => (shippingMethod.value === 'delivery' ? 8.99 : 0))
const tax = computed(() => subtotal.value * 0.08)
const grandTotal = computed(() => subtotal.value + shippingCost.value + tax.value)

const canCheckout = computed(() => {
  return form.value.fullName &&
         form.value.email &&
         form.value.phone &&
         form.value.country &&
         form.value.city &&
         form.value.zip &&
         form.value.agreeToTerms
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
    alert('Order placed successfully! Thank you for shopping!')
    router.push('/order-success') // Create this page later
  }, 2000)
}
</script>

<style scoped>
input:focus, button:focus {
  outline: none;
}
</style>