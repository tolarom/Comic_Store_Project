<template>
  <div class="cart-item flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
    <input
      type="checkbox"
      :checked="item.selected"
      @change="toggleSelected"
      class="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
    />
    <div class="item-image flex-shrink-0">
      <img :src="item.image" :alt="item.name" class="w-16 h-20 object-cover rounded" />
    </div>
    <div class="item-name flex-1 font-semibold text-gray-800">
      {{ item.name }}
    </div>
    <div class="quantity-controls flex items-center gap-2">
      <button @click="decreaseQuantity" :disabled="item.quantity <= 1" class="qty-btn">-</button>
      <span class="quantity w-8 text-center">{{ item.quantity }}</span>
      <button @click="increaseQuantity" class="qty-btn">+</button>
    </div>
    <div class="price text-gray-600">${{ item.price.toFixed(2) }}/pcs</div>
    <div class="total font-bold text-gray-800">${{ (item.price * item.quantity).toFixed(2) }}</div>
    <button @click="removeItem" class="remove-btn text-red-500 hover:text-red-700">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
  selected: boolean
}

const props = defineProps<{
  item: CartItem
}>()

const emit = defineEmits<{
  remove: [id: number]
  updateQuantity: [id: number, quantity: number]
  select: [id: number, selected: boolean]
}>()

const removeItem = () => {
  emit('remove', props.item.id)
}

const increaseQuantity = () => {
  emit('updateQuantity', props.item.id, props.item.quantity + 1)
}

const decreaseQuantity = () => {
  if (props.item.quantity > 1) {
    emit('updateQuantity', props.item.id, props.item.quantity - 1)
  }
}

const toggleSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('select', props.item.id, target.checked)
}
</script>

<style scoped>
.cart-item {
  margin-bottom: 1rem;
}

.item-image img {
  width: 64px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.item-name {
  font-weight: 600;
  color: #333;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.qty-btn {
  width: 30px;
  height: 30px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity {
  font-weight: bold;
  min-width: 2rem;
  text-align: center;
}

.price {
  color: #666;
  min-width: 4rem;
  text-align: center;
}

.total {
  font-weight: bold;
  color: #333;
  min-width: 5rem;
  text-align: center;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  color: #dc2626;
}

.remove-btn:hover {
  background-color: #fef2f2;
  color: #b91c1c;
}
</style>
