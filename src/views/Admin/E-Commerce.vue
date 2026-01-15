<template>
  <div class="min-h-screen bg-gray-50 p-6">
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
          <i class="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
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
            class="absolute right-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10"
          >
            <div
              v-for="category in categories"
              :key="category"
              @click="selectCategory(category)"
              :class="[
                'px-4 py-3 cursor-pointer transition-colors',
                selectedCategory === category ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
              ]"
            >
              {{ category }}
            </div>
          </div>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-if="filteredProducts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
          @view-details="openModal('view', $event)"
          @edit-product="openModal('edit', $event)"
          @delete-product="deleteProduct"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <i class="pi pi-inbox text-gray-300 text-6xl mb-4"></i>
        <h3 class="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
        <p class="text-gray-500">Try adjusting your search or filter criteria</p>
      </div>

      <!-- Product Modal -->
      <ProductModal
        v-if="modalState.isOpen"
        :product="modalState.product"
        :mode="modalState.mode"
        @close="closeModal"
        @save="handleSaveProduct"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, defineComponent } from 'vue';

// ProductCard Component
const ProductCard = defineComponent({
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  emits: ['view-details', 'edit-product', 'delete-product'],
  setup(props, { emit }) {
    const showMenu = ref(false);

    const toggleMenu = () => {
      showMenu.value = !showMenu.value;
    };

    const closeMenu = () => {
      showMenu.value = false;
    };

    const handleViewDetails = () => {
      emit('view-details', props.product);
      closeMenu();
    };

    const handleEdit = () => {
      emit('edit-product', props.product);
      closeMenu();
    };

    const handleDelete = () => {
      emit('delete-product', props.product);
      closeMenu();
    };

    return {
      showMenu,
      toggleMenu,
      closeMenu,
      handleViewDetails,
      handleEdit,
      handleDelete
    };
  },
  template: `
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow relative group">
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
        <img
          :src="product.image"
          :alt="product.name"
          class="w-full h-full object-contain"
        />
      </div>

      <!-- Product Info -->
      <div class="p-4">
        <h3 class="font-semibold text-gray-900 mb-1 line-clamp-2">
          {{ product.name }}
        </h3>
        <p class="text-sm text-gray-500 mb-3 line-clamp-1">
          {{ product.description }}
        </p>

        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-600">Stock:</span>
          <span class="text-sm font-semibold text-gray-900">{{ product.stock }} units</span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Sales:</span>
          <span class="text-sm font-semibold text-gray-900">{{ product.sales }}</span>
        </div>

        <div class="mt-3 pt-3 border-t border-gray-100">
          <span class="text-xl font-bold text-blue-600">\${{ product.price.toFixed(2) }}</span>
        </div>
      </div>
    </div>
  `
});

// ProductModal Component
const ProductModal = defineComponent({
  name: 'ProductModal',
  props: {
    product: {
      type: Object,
      default: null
    },
    mode: {
      type: String,
      required: true
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const formData = ref(props.product ? { ...props.product } : {
      name: '',
      description: '',
      price: '',
      stock: '',
      sales: 0,
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
      category: '#1 Categories'
    });

    const imageInputMode = ref('url'); // 'url' or 'file'
    const imagePreview = ref(formData.value.image);
    const selectedFileName = ref('');
    const fileInput = ref(null);

    const isViewMode = computed(() => props.mode === 'view');

    const updateImagePreview = () => {
      imagePreview.value = formData.value.image;
    };

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPG, PNG, GIF, or WebP)');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      selectedFileName.value = file.name;

      // Convert image to base64 for preview and storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target.result;
        formData.value.image = base64Image;
        imagePreview.value = base64Image;
      };
      reader.readAsDataURL(file);
    };

    const handleSubmit = () => {
      if (!formData.value.name || !formData.value.description || !formData.value.price || !formData.value.stock) {
        alert('Please fill in all required fields');
        return;
      }

      emit('save', {
        ...formData.value,
        price: parseFloat(formData.value.price),
        stock: parseInt(formData.value.stock),
        sales: parseInt(formData.value.sales || 0)
      });
    };

    const close = () => {
      emit('close');
    };

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
      close
    };
  },
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                <option>#1 Categories</option>
                <option>#2 Categories</option>
                <option>#3 Categories</option>
                <option>#4 Categories</option>
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
  `
});

export default {
  name: 'EcommercePage',
  components: {
    ProductCard,
    ProductModal
  },
  setup() {
    const searchQuery = ref('');
    const selectedCategory = ref('All Categories');
    const showCategoryDropdown = ref(false);
    const modalState = ref({ isOpen: false, mode: null, product: null });

    const categories = ref([
      'All Categories',
      '#1 Categories',
      '#2 Categories',
      '#3 Categories',
      '#4 Categories'
    ]);

    // Mock product data
    const products = ref([
      {
        id: 1,
        name: 'Cyberpunk: Edgerunners',
        description: 'David & Lucy Crew Neck Sweatshirt',
        price: 75.00,
        stock: 45,
        sales: 125,
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
        category: '#1 Categories'
      },
      {
        id: 2,
        name: 'Cyberpunk: Edgerunners',
        description: 'David & Lucy Crew Neck Sweatshirt',
        price: 75.00,
        stock: 45,
        sales: 125,
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
        category: '#2 Categories'
      },
      {
        id: 3,
        name: 'Cyberpunk: Edgerunners',
        description: 'David & Lucy Crew Neck Sweatshirt',
        price: 75.00,
        stock: 45,
        sales: 125,
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
        category: '#1 Categories'
      },
      {
        id: 4,
        name: 'Cyberpunk: Edgerunners',
        description: 'David & Lucy Crew Neck Sweatshirt',
        price: 75.00,
        stock: 45,
        sales: 125,
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
        category: '#3 Categories'
      },
      {
        id: 5,
        name: 'Cyberpunk: Edgerunners',
        description: 'David & Lucy Crew Neck Sweatshirt',
        price: 75.00,
        stock: 45,
        sales: 125,
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
        category: '#1 Categories'
      },
      {
        id: 6,
        name: 'Cyberpunk: Edgerunners',
        description: 'David & Lucy Crew Neck Sweatshirt',
        price: 75.00,
        stock: 45,
        sales: 125,
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
        category: '#2 Categories'
      },
      {
        id: 7,
        name: 'Cyberpunk: Edgerunners',
        description: 'David & Lucy Crew Neck Sweatshirt',
        price: 75.00,
        stock: 45,
        sales: 125,
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
        category: '#4 Categories'
      },
      {
        id: 8,
        name: 'Cyberpunk: Edgerunners',
        description: 'David & Lucy Crew Neck Sweatshirt',
        price: 75.00,
        stock: 45,
        sales: 125,
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
        category: '#1 Categories'
      }
    ]);

    const filteredProducts = computed(() => {
      let filtered = products.value;

      // Filter by category
      if (selectedCategory.value !== 'All Categories') {
        filtered = filtered.filter(p => p.category === selectedCategory.value);
      }

      // Filter by search query
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
        );
      }

      return filtered;
    });

    const toggleCategoryDropdown = () => {
      showCategoryDropdown.value = !showCategoryDropdown.value;
    };

    const selectCategory = (category) => {
      selectedCategory.value = category;
      showCategoryDropdown.value = false;
    };

    const openModal = (mode, product = null) => {
      modalState.value = { isOpen: true, mode, product };
    };

    const closeModal = () => {
      modalState.value = { isOpen: false, mode: null, product: null };
    };

    const handleSaveProduct = (productData) => {
      if (modalState.value.mode === 'add') {
        const newProduct = {
          ...productData,
          id: Math.max(...products.value.map(p => p.id)) + 1
        };
        products.value.push(newProduct);
      } else if (modalState.value.mode === 'edit') {
        const index = products.value.findIndex(p => p.id === modalState.value.product.id);
        if (index !== -1) {
          products.value[index] = { ...productData, id: modalState.value.product.id };
        }
      }
      closeModal();
    };

    const deleteProduct = (product) => {
      if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
        products.value = products.value.filter(p => p.id !== product.id);
      }
    };

    // API Integration Functions (commented out for frontend-only version)
    /*
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        products.value = data;
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    const createProduct = async (productData) => {
      try {
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
        const newProduct = await response.json();
        products.value.push(newProduct);
      } catch (error) {
        console.error('Error creating product:', error);
      }
    };

    const updateProduct = async (id, productData) => {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
        const updatedProduct = await response.json();
        const index = products.value.findIndex(p => p.id === id);
        if (index !== -1) {
          products.value[index] = updatedProduct;
        }
      } catch (error) {
        console.error('Error updating product:', error);
      }
    };

    const deleteProductAPI = async (id) => {
      try {
        await fetch(`/api/products/${id}`, {
          method: 'DELETE'
        });
        products.value = products.value.filter(p => p.id !== id);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    };
    */

    return {
      searchQuery,
      selectedCategory,
      showCategoryDropdown,
      categories,
      products,
      filteredProducts,
      modalState,
      toggleCategoryDropdown,
      selectCategory,
      openModal,
      closeModal,
      handleSaveProduct,
      deleteProduct
    };
  }
};
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
