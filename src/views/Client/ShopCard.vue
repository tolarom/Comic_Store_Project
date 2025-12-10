<template>
  <NavigationBar />
  <div class="min-h-screen bg-gray-100 py-24 px-4 sm:px-6 lg:px-20">
    <div class="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Product List -->
      <div class="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Shopping Cart</h1>

        <!-- Select All -->
        <div class="flex items-center mb-6 pb-4 border-b">
          <input
            type="checkbox"
            v-model="selectAll"
            class="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
          />
          <span class="ml-3 text-lg font-medium text-gray-700">Select All</span>
        </div>

        <!-- Cart Items -->
        <div v-if="products.length > 0" class="space-y-4">
          <div
            v-for="(product, index) in products"
            :key="product.id"
            class="flex items-center justify-between py-4 border-b last:border-0"
          >
            <!-- Checkbox + Product Info -->
            <div class="flex items-center space-x-4">
              <input
                type="checkbox"
                v-model="product.selected"
                class="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
              />

              <div class="w-20 h-20 bg-gray-200 border-2 border-dashed rounded-lg"></div>

              <div>
                <p class="font-semibold text-gray-800">{{ product.name }}</p>
                <p class="text-sm text-gray-500">${{ product.price.toFixed(2) }} / pcs</p>
              </div>
            </div>

            <!-- Quantity & Remove -->
            <div class="flex items-center space-x-3">
              <button
                @click="decreaseQuantity(index)"
                class="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg font-bold"
                :disabled="product.quantity <= 1"
              >
                −
              </button>

              <span class="w-12 text-center font-medium">{{ product.quantity }}</span>

              <button
                @click="increaseQuantity(index)"
                class="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg font-bold"
              >
                +
              </button>

              <button
                @click="removeProduct(index)"
                class="ml-4 text-red-500 hover:text-red-700 transition"
                title="Remove item"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty Cart -->
        <div v-else class="text-center py-12 text-gray-500">
          <p class="text-xl">Your cart is empty</p>
          <router-link to="/shop" class="text-indigo-600 hover:underline mt-4 inline-block">
            Continue Shopping →
          </router-link>
        </div>
      </div>

      <!-- Payment Summary -->
      <div class="bg-white rounded-xl shadow-lg p-6 h-fit">
        <h2 class="text-2xl font-bold text-indigo-600 mb-6">Order Summary</h2>

        <div class="space-y-3 text-gray-700">
          <div class="flex justify-between">
            <span>Subtotal</span>
            <span class="font-medium">${{ subtotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Shipping</span>
            <span class="font-medium">$5.00</span>
          </div>
          <div class="border-t pt-3 mt-3">
            <div class="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span class="text-indigo-600">${{ total.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Checkout Button -->
        <router-link
          to="/checkout"
          class="block w-full mt-8 bg-indigo-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md"
        >
          Proceed to Checkout
        </router-link>

        <!-- Continue Shopping -->
        <router-link
          to="/shop"
          class="mt-4 flex items-center justify-center text-indigo-600 hover:underline font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Continue Shopping
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import NavigationBar from '@/components/client/NavigationBar.vue'

const router = useRouter()

// Sample products in cart (you'll replace this with Pinia/store later)
const products = ref([
  { id: 1, name: 'Batman: The Killing Joke', price: 15.99, quantity: 1, selected: true },
  { id: 2, name: 'One Piece Vol. 100', price: 9.99, quantity: 2, selected: true },
  { id: 3, name: 'Spider-Man Funko Pop', price: 12.50, quantity: 1, selected: false },
])

// Select All - now works perfectly both ways
const selectAll = computed({
  get: () => products.value.length > 0 && products.value.every(p => p.selected),
  set: (value: boolean) => {
    products.value.forEach(p => (p.selected = value))
  }
})

// Quantity controls
const increaseQuantity = (index: number) => {
  products.value[index].quantity++
}

const decreaseQuantity = (index: number) => {
  if (products.value[index].quantity > 1) {
    products.value[index].quantity--
  }
}

const removeProduct = (index: number) => {
  products.value.splice(index, 1)
}

// Calculations
const subtotal = computed(() => {
  return products.value
    .filter(p => p.selected)
    .reduce((sum, p) => sum + p.price * p.quantity, 0)
})

const total = computed(() => subtotal.value + 5) // + shipping
</script>

<style scoped>
/* Optional nice touch */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>