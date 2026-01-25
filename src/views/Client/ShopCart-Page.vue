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
          <CartItem
            v-for="product in products"
            :key="product.id"
            :item="product"
            @remove="removeProduct"
            @update-quantity="updateQuantity"
            @select="selectItem"
          />
        </div>

        <!-- Empty Cart -->
        <div v-else class="text-center py-12 text-gray-500">
          <p class="text-xl">Your cart is empty</p>
          <router-link to="/client/shop" class="text-indigo-600 hover:underline mt-4 inline-block">
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
            <span class="font-medium">${{ shipping.toFixed(2) }}</span>
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
          v-if="products.length > 0"
          to="/client/checkout"
          class="block w-full mt-8 bg-indigo-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md"
        >
          Proceed to Checkout
        </router-link>

        <!-- Continue Shopping -->
        <router-link
          to="/client/shop"
          class="mt-4 flex items-center justify-center text-indigo-600 hover:underline font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Continue Shopping
        </router-link>
      </div>
    </div>
  </div>
  <FooterPage />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import NavigationBar from '../../components/client/NavigationBar.vue'
import CartItem from '../../components/client/cart-item.vue'
import { useCartStore } from '../../stores/cart'
import FooterPage from '../../components/client/FooterPage.vue'

const cartStore = useCartStore()

// Use cart items from store
const products = computed(() => cartStore.cartItems)

// Select All - now works perfectly both ways
const selectAll = computed({
  get: () => cartStore.isAllSelected,
  set: (value: boolean) => {
    cartStore.selectAllItems(value)
  },
})

const removeProduct = (id: number) => {
  cartStore.removeFromCart(id)
}

const updateQuantity = (id: number, quantity: number) => {
  cartStore.updateQuantity(id, quantity)
}

const selectItem = (id: number, selected: boolean) => {
  cartStore.selectItem(id, selected)
}

// Calculations
const subtotal = computed(() => cartStore.subtotal)
const shipping = computed(() => cartStore.shipping)
const total = computed(() => cartStore.total)
</script>

<style scoped>
/* Optional nice touch */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
