<template>
  <div
    class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow relative group"
  >
    <!-- Three Dots Menu -->
    <div class="absolute top-3 right-3 z-10">
      <button
        @click.stop="toggleMenu"
        class="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition-colors"
      >
        <i class="pi pi-ellipsis-v text-sm"></i>
      </button>

      <!-- Dropdown Menu -->
      <div
        v-if="showMenu"
        @click.stop
        class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg"
      >
        <button
          @click="handleViewDetails"
          class="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 transition-colors"
        >
          <i class="pi pi-eye text-blue-600"></i>
          <span class="text-gray-700">View Details</span>
        </button>
        <button
          @click="handleEdit"
          class="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 transition-colors"
        >
          <i class="pi pi-pencil text-gray-600"></i>
          <span class="text-gray-700">Edit Product</span>
        </button>
        <button
          @click="handleDelete"
          class="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center gap-3 transition-colors"
        >
          <i class="pi pi-trash text-red-600"></i>
          <span class="text-red-600">Delete</span>
        </button>
      </div>
    </div>

    <!-- Product Image -->
    <div class="aspect-square bg-gray-100 flex items-center justify-center p-6">
      <img :src="product.image" :alt="product.name" class="w-full h-full object-contain" />
    </div>

    <!-- Product Info -->
    <div class="p-4">
      <h3 class="font-semibold text-gray-900 mb-1 line-clamp-2">
        {{ product.name }}
      </h3>
      <p v-if="product.category" class="text-xs text-gray-500 mb-2 line-clamp-1">
        {{ product.category }}
      </p>
      <p class="text-sm text-gray-500 mb-3 line-clamp-1">
        {{ product.description }}
      </p>

      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-gray-600">Stock:</span>
        <span class="text-sm font-semibold text-gray-900">{{ product.stock }} units</span>
      </div>


      <div class="mt-3 pt-3 border-t border-gray-100">
        <span class="text-xl font-bold text-blue-600">${{ product.price.toFixed(2) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type Product = {
  id: number
  name: string
  description: string
  price: number
  stock: number
  sales: number
  image: string
  category?: string
}

const props = defineProps<{ product: Product }>()
const emit = defineEmits<{
  (e: 'view-details', product: Product): void
  (e: 'edit-product', product: Product): void
  (e: 'delete-product', product: Product): void
}>()

const showMenu = ref(false)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const closeMenu = () => {
  showMenu.value = false
}

const handleViewDetails = () => {
  emit('view-details', props.product)
  closeMenu()
}

const handleEdit = () => {
  emit('edit-product', props.product)
  closeMenu()
}

const handleDelete = () => {
  emit('delete-product', props.product)
  closeMenu()
}

</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
