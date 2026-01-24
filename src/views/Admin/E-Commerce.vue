<template>
  <div><NavigationBar /></div>
  <div class="min-h-screen bg-gray-50 p-6 ml-[250px] mt-10">
    <div class="mx-auto">
      <!-- Breadcrumb -->
      <div class="flex items-center text-sm text-gray-600 mb-4">
        <i class="pi pi-home text-gray-400"></i>
        <span class="mx-2">/</span>
        <span>E-Commerce</span>
      </div>

      <!-- Header -->
      <div class="flex justify-between items-start mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Products</h1>
          <p class="text-gray-600">Manage your product inventory and listings.</p>
        </div>
        <button
          @click="openModal('add')"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <i class="pi pi-plus"></i>
          Add Product
        </button>
      </div>

      <!-- Search and Filter Bar -->
      <div class="flex gap-4 mb-6">
        <div class="flex-1 relative">
          <i
            class="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          ></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search products..."
            class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div class="relative">
          <button
            @click="toggleCategoryDropdown"
            class="px-4 py-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-2 min-w-[200px] justify-between transition-colors"
          >
            <div class="flex items-center gap-2">
              <i class="pi pi-filter text-gray-600"></i>
              <span>{{ selectedCategory }}</span>
            </div>
            <i class="pi pi-chevron-down text-gray-600 text-xs"></i>
          </button>

          <!-- Dropdown Menu -->
          <div
            v-if="showCategoryDropdown"
            class="absolute right-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]"
          >
            <div
              v-for="category in categories"
              :key="category"
              @click="selectCategory(category)"
              :class="[
                'px-4 py-3 cursor-pointer transition-colors',
                selectedCategory === category ? 'bg-blue-600 text-white' : 'hover:bg-gray-50',
              ]"
            >
              {{ category }}
            </div>
          </div>
        </div>
      </div>

      <!-- Products Grid -->
      <div
        v-if="filteredProducts.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <ProductCard
          v-for="product in paginatedProducts"
          :key="product.id"
          :product="product"
          @view-details="openModal('view', $event)"
          @edit-product="openModal('edit', $event)"
          @delete-product="deleteProduct"
        />
      </div>

      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-4 mt-8">
        <button
          @click="previousPage"
          :disabled="currentPage === 1"
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <i class="pi pi-chevron-left text-sm"></i>
          Previous
        </button>
        
        <div class="flex items-center gap-2">
          <span class="text-gray-600 font-medium">Page</span>
          <span class="px-3 py-1 bg-blue-600 text-white rounded-lg font-semibold">
            {{ currentPage }}
          </span>
          <span class="text-gray-600">of {{ totalPages }}</span>
        </div>

        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          Next
          <i class="pi pi-chevron-right text-sm"></i>
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="filteredProducts.length === 0" class="text-center py-16">
        <i class="pi pi-inbox text-gray-300 text-6xl mb-4"></i>
        <h3 class="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
        <p class="text-gray-500">Try adjusting your search or filter criteria</p>
      </div>

      <!-- Product Modal -->
      <ProductModal
        v-if="modalState.isOpen"
        :product="modalState.product"
        :mode="modalState.mode"
        :categories="categories"
        @close="closeModal"
        @save="handleSaveProduct"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, defineComponent, onMounted } from 'vue'
import ProductCard from '../../components/Admin/ProductCard.vue'

// ProductModal Component
const ProductModal = defineComponent({
  name: 'ProductModal',
  props: {
    product: {
      type: Object,
      default: null,
    },
    mode: {
      type: String,
      required: true,
    },
    categories: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const formData = ref(
      props.product
        ? { ...props.product }
        : {
            name: '',
            description: '',
            price: '',
            stock: '',
            sales: 0,
            rating: 0,
            reviewCount: 0,
            image: '',
            category: (props.categories && props.categories.length && props.categories[0]) || 'comics',
            discount: 0,
          },
    )

    const imageInputMode = ref('url') // 'url' or 'file'
    const imagePreview = ref(formData.value.image)
    const selectedFileName = ref('')
    const fileInput = ref(null)

    const isViewMode = computed(() => props.mode === 'view')

    const updateImagePreview = () => {
      imagePreview.value = formData.value.image
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (!file) return

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPG, PNG, GIF, or WebP)')
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      selectedFileName.value = file.name

      // Convert image to base64 for preview and storage
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64Image = e.target.result
        formData.value.image = base64Image
        imagePreview.value = base64Image
      }
      reader.readAsDataURL(file)
    }

    const handleSubmit = () => {
      if (
        !formData.value.name ||
        !formData.value.description ||
        !formData.value.price ||
        !formData.value.stock
      ) {
        alert('Please fill in all required fields')
        return
      }

      emit('save', {
        ...formData.value,
        price: parseFloat(formData.value.price),
        stock: parseInt(formData.value.stock),
        sales: parseInt(formData.value.sales || 0),
      })
    }

    const close = () => {
      emit('close')
    }

    return {
      formData,
      isViewMode,
      imageInputMode,
      imagePreview,
      selectedFileName,
      fileInput,
      updateImagePreview,
      handleFileUpload,
      handleSubmit,
      close,
    }
  },
  template: `
    <div class="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900">
            {{ mode === 'view' ? 'Product Details' : mode === 'edit' ? 'Edit Product' : 'Add New Product' }}
          </h2>
          <button
            @click="close"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i class="pi pi-times text-xl"></i>
          </button>
        </div>

        <div class="p-6">
          <div class="space-y-4">
            <!-- Product Image -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>
              <div class="aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-3">
                <img
                  :src="imagePreview"
                  alt="Product preview"
                  class="w-full h-full object-contain"
                />
              </div>

              <div v-if="!isViewMode" class="space-y-3">
                <!-- Tab selector -->
                <div class="flex gap-2 border-b border-gray-200">
                  <button
                    @click="imageInputMode = 'url'"
                    :class="[
                      'px-4 py-2 font-medium transition-colors',
                      imageInputMode === 'url'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    ]"
                  >
                    <i class="pi pi-link mr-2"></i>URL
                  </button>
                  <button
                    @click="imageInputMode = 'file'"
                    :class="[
                      'px-4 py-2 font-medium transition-colors',
                      imageInputMode === 'file'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    ]"
                  >
                    <i class="pi pi-upload mr-2"></i>Upload File
                  </button>
                </div>

                <!-- URL Input -->
                <input
                  v-if="imageInputMode === 'url'"
                  v-model="formData.image"
                  @input="updateImagePreview"
                  type="text"
                  placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <!-- File Upload -->
                <div v-if="imageInputMode === 'file'">
                  <input
                    ref="fileInput"
                    @change="handleFileUpload"
                    type="file"
                    accept="image/*"
                    class="hidden"
                  />
                  <button
                    @click="$refs.fileInput.click()"
                    class="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
                  >
                    <i class="pi pi-cloud-upload text-xl"></i>
                    <span>{{ selectedFileName || 'Click to select image from computer' }}</span>
                  </button>
                  <p class="text-xs text-gray-500 mt-2">Supported formats: JPG, PNG, GIF, WebP (Max 5MB)</p>
                </div>
              </div>
            </div>

            <!-- Product Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                v-model="formData.name"
                type="text"
                placeholder="Enter product name"
                :disabled="isViewMode"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>

            <!-- Subtitle removed per request -->

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                v-model="formData.description"
                placeholder="Enter product description"
                :disabled="isViewMode"
                rows="3"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              ></textarea>
            </div>

            <!-- Category -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
                <select
                  v-model="formData.category"
                  :disabled="isViewMode"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                >
                  <option
                    v-for="cat in categories"
                    :key="cat"
                    :value="cat"
                  >
                    {{ cat }}
                  </option>
                </select>
            </div>

            <!-- Price and Stock -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Price ($) *
                </label>
                <input
                  v-model="formData.price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  :disabled="isViewMode"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Stock *
                </label>
                <input
                  v-model="formData.stock"
                  type="number"
                  placeholder="0"
                  :disabled="isViewMode"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>
            </div>

            <!-- Discount -->
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
              <input
                v-model.number="formData.discount"
                type="number"
                min="0"
                max="100"
                step="0.01"
                :disabled="isViewMode"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>

            <!-- Sales -->
            <div v-if="mode !== 'add'">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Total Sales
              </label>
              <input
                v-model="formData.sales"
                type="number"
                disabled
                class="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
              />
            </div>

            <!-- Rating -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div class="flex items-center gap-3">
                <div class="flex items-center">
                  <span v-for="star in 5" :key="star" class="text-2xl">
                    <i :class="star <= Math.floor(formData.rating || 0) ? 'pi pi-star-fill text-yellow-400' : 'pi pi-star text-gray-300'"></i>
                  </span>
                </div>
                <span class="text-lg font-semibold text-gray-700">{{ (formData.rating || 0).toFixed(1) }}</span>
                <span v-if="formData.reviewCount" class="text-sm text-gray-500">({{ formData.reviewCount }} reviews)</span>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 mt-6">
            <button
              @click="close"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {{ isViewMode ? 'Close' : 'Cancel' }}
            </button>
            <button
              v-if="!isViewMode"
              @click="handleSubmit"
              class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <i class="pi pi-save"></i>
              {{ mode === 'edit' ? 'Save Changes' : 'Add Product' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
import NavigationBar from '../../components/Admin/NavigationBar.vue'
import {
  getAllProducts as apiGetAllProducts,
  createProduct as apiCreateProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct,
  getAllCategories as apiGetAllCategories,
} from '@/services/api'

export default {
  name: 'EcommercePage',
  components: {
    ProductCard,
    ProductModal,
    NavigationBar,
  },
  setup() {
    const searchQuery = ref('')
    const selectedCategory = ref('All Categories')
    const showCategoryDropdown = ref(false)
    const modalState = ref({ isOpen: false, mode: null, product: null })
    const currentPage = ref(1)
    const itemsPerPage = 12

    const categories = ref(['All Categories'])

    const products = ref([])

    const normalizeId = (raw) => {
      if (!raw) return null
      if (typeof raw === 'string') return raw
      if (raw.$oid) return raw.$oid
      if (raw.toString && typeof raw.toString === 'function') return raw.toString()
      return String(raw)
    }
    const loadProducts = async () => {
      try {
        const resp = await apiGetAllProducts()

        products.value = (resp || []).map((p) => ({
          id: normalizeId(p._id) || normalizeId(p.id),
          name: p.title || p.name,
          description: p.description || p.subtitle || '',
          price: p.price || 0,
            discount: p.discount || p.discount_percent || 0,
          stock: p.stock || 0,
          sales: p.sales || 0,
          rating: p.rating || 0,
          reviewCount: p.reviewCount || 0,
          image: p.image_url || p.image || '',
          category: p.category || 'comics',
          subtitle: p.subtitle || '',
          backend: p,
        }))
      } catch (e) {
        console.error('Error loading products from API', e)
      }
    }

    const loadCategories = async () => {
      try {
        const cats = await apiGetAllCategories()
        if (Array.isArray(cats) && cats.length) {
          const names = cats.map((c) => c.name || c.slug || c)
          categories.value = [ ...Array.from(new Set(names))]
        }
      } catch (e) {
        console.warn('Failed to load categories, using defaults', e)
        categories.value = ['All Categories', 'comics', 'manga', 'graphic-novels', 'merchandise']
      }
    }

    onMounted(() => {
      loadProducts()
      loadCategories()
    })

    const filteredProducts = computed(() => {
      let filtered = products.value

      // Filter by category
      if (selectedCategory.value !== 'All Categories') {
        filtered = filtered.filter((p) => p.category === selectedCategory.value)
      }

      // Filter by search query
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(
          (p) =>
            String(p.name).toLowerCase().includes(query) || String(p.description || '').toLowerCase().includes(query),
        )
      }

      return filtered
    })

    const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage))

    const paginatedProducts = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredProducts.value.slice(start, end)
    })

    const toggleCategoryDropdown = () => {
      showCategoryDropdown.value = !showCategoryDropdown.value
    }

    const selectCategory = (category) => {
      selectedCategory.value = category
      showCategoryDropdown.value = false
      currentPage.value = 1 // Reset to first page when changing category
    }

    const nextPage = () => {
      if (currentPage.value < totalPages.value) currentPage.value++
    }

    const previousPage = () => {
      if (currentPage.value > 1) currentPage.value--
    }

    const openModal = (mode, product = null) => {
      modalState.value = { isOpen: true, mode, product }
    }

    const closeModal = () => {
      modalState.value = { isOpen: false, mode: null, product: null }
    }

    const handleSaveProduct = async (productData) => {
        const payload = {
        title: productData.name,
        description: productData.description,
        price: Number(productData.price) || 0,
        category: productData.category || 'comics',
        stock: Number(productData.stock) || 0,
        image_url: productData.image || '',
        discount: Number(productData.discount) || 0,
      }
      try {
        if (modalState.value.mode === 'add') {
          console.debug('[E-Commerce] POST /api/products', payload)
          const created = await apiCreateProduct(payload)
          products.value.unshift({
            id: created._id || created.id,
            name: created.title,
            description: created.description,
            price: created.price,
            discount: created.discount || created.discount_percent || 0,
            stock: created.stock,
            image: created.image_url || '',
            category: created.category,
            backend: created,
          })
        } else if (modalState.value.mode === 'edit') {
          const id = normalizeId(productData.id || productData._id || productData.backend?._id)
          console.debug('[E-Commerce] PUT /api/products/' + id, {
            title: payload.title,
            description: payload.description,
            price: payload.price,
            category: payload.category,
            stock: payload.stock,
            image_url: payload.image_url,
          })
          await apiUpdateProduct(String(id), {
            title: payload.title,
            description: payload.description,
            price: payload.price,
            category: payload.category,
            stock: payload.stock,
            image_url: payload.image_url,
            discount: payload.discount,
          })
          const idx = products.value.findIndex((p) => String(p.id) === String(id))
          if (idx !== -1) products.value[idx] = { ...products.value[idx], ...payload }
        }
        closeModal()
      } catch (e) {
        console.error('Failed to save product via API', e)
        try {
          if (e?.response) console.error('Server response:', e.response.data)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (__) {}
        alert('Failed to save product. Check console for details.')
      }
    }

    const deleteProduct = async (product) => {
      if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return
      try {
        const id = normalizeId(product.id || product._id || product.backend?._id)
        console.debug('[E-Commerce] DELETE /api/products/' + id)
        await apiDeleteProduct(String(id))
        products.value = products.value.filter((p) => String(p.id) !== String(id))
      } catch (e) {
        console.error('Failed to delete product via API', e)
        try {
          if (e?.response) console.error('Server response:', e.response.data)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (__) {}
        alert('Failed to delete product. Check console for details.')
      }
    }

    return {
      searchQuery,
      selectedCategory,
      showCategoryDropdown,
      categories,
      products,
      filteredProducts,
      paginatedProducts,
      totalPages,
      currentPage,
      modalState,
      toggleCategoryDropdown,
      selectCategory,
      openModal,
      closeModal,
      handleSaveProduct,
      deleteProduct,
      nextPage,
      previousPage,
    }
  },
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
