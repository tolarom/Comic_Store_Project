<template>
  <NavigationBar />
  <div v-if="product" class="max-w-7xl mx-auto px-6 py-10 mt-10">
    <!-- Back Button -->
    <button
      @click="goBack"
      class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
          clip-rule="evenodd"
        />
      </svg>
      <span class="font-medium">Back</span>
    </button>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <!-- LEFT: Main Image Only -->
      <div class="flex">
        <div class="flex-1">
          <img
            :src="mainImage"
            class="w-full h-auto max-h-screen object-contain rounded-lg shadow-lg"
            alt="Product main view"
          />
        </div>
      </div>

      <!-- RIGHT: Product Info -->
      <div class="flex flex-col justify-start">
        <h1 class="text-3xl font-bold uppercase text-gray-900">{{ product.title }}</h1>
        <p class="text-gray-500 mt-1 text-lg">{{ product.subtitle }}</p>

        <!-- Rating -->
        <div class="flex items-center gap-3 mt-4">
          <StarRating :rating="avgRating" :read-only="true" :increment="0.1" :star-size="25" />
          <span class="text-gray-500">({{ ratings.length }} review{{ ratings.length === 1 ? '' : 's' }})</span>
        </div>

        <!-- Price -->
        <div class="flex items-center gap-4 mt-6">
          <span class="text-3xl font-bold text-red-500">${{ displayPrice }}</span>
          <span v-if="product.discount" class="text-xl text-gray-400 line-through">${{ Number(product.price).toFixed(2) }}</span>
          <span v-if="product.discount" class="ml-3 text-sm text-green-600">({{ Number(product.discount) }}% off)</span>
        </div>

        <hr class="my-8 border-gray-300" />

        <!-- Description -->
        <p class="text-gray-600 text-base leading-relaxed">{{ product.description }}</p>

        

        <!-- Quantity Selector -->
        <div class="mt-8 flex items-center gap-6">
          <p class="font-semibold text-lg">Quantity:</p>
          <div class="flex items-center border-2 border-gray-300 rounded-md">
            <button class="px-5 py-3 hover:bg-gray-100 transition" @click="qty > 1 && qty--">
              −
            </button>
            <span class="px-6 py-3 border-x-2 border-gray-300 font-medium">{{ qty }}</span>
            <button class="px-5 py-3 hover:bg-gray-100 transition" @click="qty++">+</button>
          </div>
        </div>

        <!-- Add to Cart Button -->
        <button
          class="mt-10 w-full bg-indigo-600 text-white py-5 rounded-lg font-bold text-lg hover:bg-indigo-700 transition shadow-md"
          @click="onAddToCart"
        >
          ADD TO CART
        </button>
      </div>
      
    </div>
    <!-- Reviews -->
        <section class="mt-8">
          <hr>
          <h3 class="text-xl font-semibold mb-4">Customer reviews</h3>

          <div v-if="loadingRatings" class="text-gray-500">Loading reviews…</div>
          <div v-else>
            <div v-if="ratings.length === 0" class="text-gray-500 mb-4">No reviews yet — be the first to review.</div>

            <ul class="space-y-4 mb-6">
              <li v-for="r in ratings" :key="r._id || r.id" class="border-b pb-4">
                <div class="flex items-center gap-3">
                  <StarRating :rating="r.rating" :read-only="true" :increment="0.1" :star-size="18" />
                  <span class="text-sm text-gray-600">{{ new Date(r.created_at || r.updated_at || Date.now()).toLocaleDateString() }}</span>
                </div>
                <p class="mt-2 text-gray-700">{{ r.review }}</p>
              </li>
            </ul>
          </div>
        </section>
  </div>
  <div v-else class="max-w-7xl mx-auto px-6 py-20 text-center text-gray-500">Loading product…</div>
  <FooterPage />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductsStore } from '@/data/products'
import { useCartStore } from '@/stores/cart'
import FooterPage from '@/components/client/FooterPage.vue'
import NavigationBar from '@/components/client/NavigationBar.vue'
import StarRating from 'vue-star-rating'
import { getRatingsByProduct } from '@/services/api'

const route = useRoute()
const router = useRouter()
const productsStore = useProductsStore()
const cartStore = useCartStore()

const product = computed(() => {
  const id = Number(route.params.id)
  return Number.isFinite(id) ? productsStore.getById(id) : undefined
})

const mainImage = ref<string | undefined>(undefined)
const qty = ref(1)

watch(
  product,
  (p) => {
    if (p) {
      mainImage.value = p.image
      qty.value = 1
    }
  },
  { immediate: true },
)

const displayPrice = computed(() => {
  const p = product.value
  if (!p) return '0.00'
  const price = p.discount ? p.price * (1 - p.discount / 100) : p.price
  return price.toFixed(2)
})

const onAddToCart = () => {
  const p = product.value
  if (!p) return
  const price = p.discount ? p.price * (1 - p.discount / 100) : p.price

  // Add item(s) to cart based on quantity
  for (let i = 0; i < qty.value; i++) {
    cartStore.addToCart({ id: p.id, backend_id: (p as any).backend_id, name: p.title, price, image: p.image })
  }

  // Reset quantity after adding
  qty.value = 1
}

// --- Reviews state & actions ---
const ratings = ref<Array<any>>([])
const loadingRatings = ref(false)

const avgRating = computed(() => {
  if (ratings.value.length === 0) return 0
  const sum = ratings.value.reduce((s, r) => s + (r.rating || 0), 0)
  return sum / ratings.value.length
})

const loadRatings = async () => {
  const p = product.value
  if (!p || !p.backend_id) {
    console.debug('[Product-detail] product or backend_id missing:', p)
    return
  }
  loadingRatings.value = true
  try {
    console.debug('[Product-detail] loading ratings for backend_id:', String(p.backend_id))
    const resp = await getRatingsByProduct(String(p.backend_id))
    console.debug('[Product-detail] ratings API response:', resp)
    ratings.value = Array.isArray(resp) ? resp : []
  } catch (e) {
    console.error('Failed to load ratings', e)
    ratings.value = []
  } finally {
    loadingRatings.value = false
  }
}

// no submission UI — reviews are read-only

onMounted(async () => {
  // Ensure products are loaded (in case user navigated directly to detail page)
  try {
    const p = product.value
    if (!p || !p.backend_id) {
      // fetch products into store so `product` computed can resolve
      await productsStore.fetchProducts()
    }
  } catch (e) {
    console.error('Failed to fetch products before loading ratings', e)
  }

  // Now load ratings (if product is available)
  await loadRatings()
})

const goBack = () => {
  router.back()
}
</script>

<style scoped>
/* Optional: Add any custom styles here */
</style>
