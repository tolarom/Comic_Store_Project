<template>
  <SearchBar />

  <div class="product-listing container mx-auto py-8 w-full">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6 border-b border-gray-300 pb-4">
      <div class="flex flex-col">
        <h2 class="text-lg font-semibold">Products</h2>
        <p class="text-sm text-gray-600">{{ productCountDisplay }}</p>
      </div>

      <div class="flex gap-4 items-center">
        <!-- Category Filter -->
        <div class="category-filter">
          <label class="text-sm mr-2">CATEGORY:</label>
          <select
            class="border border-gray-400 rounded px-3 py-1 text-sm"
            v-model="selectedCategory"
          >
            <option value="all">All Categories</option>
            <option value="comics">Comics</option>
            <option value="manga">Manga</option>
            <option value="graphic-novels">Graphic Novels</option>
            <option value="merchandise">Merchandise</option>
          </select>
        </div>

        <!-- Sort By -->
        <div class="sort-by">
          <label class="text-sm mr-2">SORT BY:</label>
          <select class="border border-gray-400 rounded px-3 py-1 text-sm" v-model="sortOption">
            <option value="default">default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="alpha-asc">Alphabet: A to Z</option>
            <option value="alpha-desc">Alphabet: Z to A</option>
          </select>
        </div>
      </div>
    </div>
  </div>

  <div class="products-section">
    <h2 class="section-title">Products</h2>
    <transition-group name="products" tag="div" class="products-grid">
      <ProductCard
        v-for="product in paginatedProducts"
        :key="product.id"
        :product="product"
        @add-to-cart="addToCart"
      />
    </transition-group>

    <!-- Pagination Controls -->
    <div v-if="totalPages > 1" class="pagination-controls">
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="pagination-btn"
        :class="{ disabled: currentPage === 1 }"
      >
        <i class="pi pi-chevron-left"></i>
        Previous
      </button>

      <div class="page-info">
        <span class="page-numbers">
          <button
            v-for="page in displayedPages"
            :key="page"
            @click="goToPage(page)"
            class="page-number"
            :class="{ active: page === currentPage }"
          >
            {{ page }}
          </button>
        </span>
      </div>

      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="pagination-btn"
        :class="{ disabled: currentPage === totalPages }"
      >
        Next
        <i class="pi pi-chevron-right"></i>
      </button>
    </div>
  </div>
  <FooterPage />
</template>

<script setup lang="ts">
import SearchBar from '@/components/client/SearchBar.vue'
import ProductCard from '@/components/client/product-card.vue'
import FooterPage from '@/components/client/FooterPage.vue'
import { ref, computed, watch, onMounted } from 'vue'
import { useProductsStore, type ProductItem } from '@/data/products'
import { useCartStore } from '@/stores/cart'
import { useSearch } from '@/composables/useSearch'
import { useRoute, useRouter } from 'vue-router'

const cartStore = useCartStore()
const { searchQuery } = useSearch()

const productsStore = useProductsStore()
const products = computed(() => productsStore.products)
const route = useRoute()
const router = useRouter()

const productQuantity = computed(() => products.value.length)

const sortOption = ref<'default' | 'price-low' | 'price-high' | 'alpha-asc' | 'alpha-desc'>(
  'default',
)
const selectedCategory = ref<string>('all')

// Pagination
const currentPage = ref(1)
const itemsPerPage = 12

// Reset page when search query or category changes
watch([searchQuery, selectedCategory], () => {
  currentPage.value = 1
})

// Initialize category from query param (e.g., /client/products?category=manga)
onMounted(() => {
  const cat = route.query.category
  if (typeof cat === 'string' && cat.trim().length > 0) {
    selectedCategory.value = cat.toLowerCase()
  }
})

// Keep URL in sync when user changes category via dropdown
watch(selectedCategory, (cat) => {
  const newQuery: Record<string, any> = { ...route.query }
  if (cat === 'all') {
    delete newQuery.category
  } else {
    newQuery.category = cat
  }
  router.replace({ query: newQuery })
})

// Reflect external route changes (e.g., back/forward navigation)
watch(
  () => route.query.category,
  (cat) => {
    const normalized = typeof cat === 'string' ? cat.toLowerCase() : 'all'
    if (normalized !== selectedCategory.value) {
      selectedCategory.value = normalized
    }
  }
)

const sortedProducts = computed<ProductItem[]>(() => {
  let productsCopy = [...products.value]

  if (selectedCategory.value !== 'all') {
    productsCopy = productsCopy.filter(
      (product) => product.category?.toLowerCase() === selectedCategory.value,
    )
  }

  // Filter by
  // Filter by search query
  if (searchQuery.value && searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    productsCopy = productsCopy.filter(
      (product) =>
        product.title.toLowerCase().includes(query) ||
        product.subtitle.toLowerCase().includes(query),
    )
  }

  switch (sortOption.value) {
    case 'default':
      return productsCopy
    case 'price-low':
      return productsCopy.sort((a, b) => a.price - b.price)
    case 'price-high':
      return productsCopy.sort((a, b) => b.price - a.price)
    case 'alpha-asc':
      return productsCopy.sort((a, b) => a.title.localeCompare(b.title))
    case 'alpha-desc':
      return productsCopy.sort((a, b) => b.title.localeCompare(a.title))
    default:
      return productsCopy
  }
})

const totalPages = computed(() => Math.ceil(sortedProducts.value.length / itemsPerPage))

const productCountDisplay = computed(() => {
  const filtered = sortedProducts.value.length
  const total = productQuantity.value

  if (searchQuery.value && searchQuery.value.trim()) {
    return `Showing ${filtered} of ${total} products (filtered)`
  }
  return `Showing all ${total} products`
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return sortedProducts.value.slice(start, end)
})

const displayedPages = computed(() => {
  const pages = []
  const maxVisible = 5
  let startPage = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  const endPage = Math.min(totalPages.value, startPage + maxVisible - 1)

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  return pages
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const goToPage = (page: number) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const addToCart = (product: ProductItem) => {
  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price

  cartStore.addToCart({
    id: product.id,
    name: product.title,
    price: discountedPrice,
    image: product.image,
  })
}
</script>

<style scoped>
.product-listing {
  font-family: Arial, sans-serif;
}

select {
  background: white;
}

.products-section {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.section-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
  gap: 1rem;
  justify-items: center;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
  padding: 2rem 0;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #5f6fff;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(.disabled) {
  background: #4a5dd8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(95, 111, 255, 0.3);
}

.pagination-btn.disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

.page-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-number {
  min-width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e5e7eb;
  background: white;
  color: #374151;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-number:hover {
  border-color: #5f6fff;
  color: #5f6fff;
  transform: translateY(-2px);
}

.page-number.active {
  background: #5f6fff;
  color: white;
  border-color: #5f6fff;
}

/* Product transition animations */
.products-enter-active,
.products-leave-active {
  transition: all 0.4s ease;
}

.products-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.products-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}

.products-move {
  transition: transform 0.4s ease;
}
</style>
