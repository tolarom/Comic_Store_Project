<template>
  <div class="w-full pt-[108px]">
    <!-- Top banner -->
    <div
      class="w-full bg-gray-600 text-white text-center py-2 text-sm fixed left-0 right-0 z-50 transition-all duration-500 ease-in-out"
      :class="isVisible ? 'top-0 opacity-100' : '-top-[32px] opacity-0'"
    >
      FREE SHIPPING ON ORDERS $50+
    </div>

    <!-- Navbar -->
    <nav
      class="bg-[#5F6FFF] fixed p-4 text-white text-sm flex justify-between h-[62px] items-center w-full z-50 transition-all duration-500 ease-in-out"
      :class="[isVisible ? 'top-[32px] shadow-lg' : '-top-[64px] shadow-none']"
    >
      <!-- Logo -->
      <router-link to="/">
        <img src="/logo.png" alt="Logo" class="h-[30px]" />
      </router-link>

      <!-- Search -->
      <div class="relative flex-1 max-w-[800px] flex items-center">
        <div class="flex items-center gap-3 w-full">
          <div
            class="w-full bg-white rounded-full flex items-center px-6 py-2 gap-3 shadow-md transition-all duration-300 h-[38px]"
            :class="show ? 'ring-2 ring-white ring-opacity-50' : ''"
          >
            <i class="pi pi-search text-gray-400 text-lg"></i>
            <input
              ref="searchInput"
              v-model="query"
              @focus="handleFocus"
              @blur="hideDropdown"
              @keydown.enter="handleSearch"
              @keydown.esc="clearSearch"
              @keydown.down.prevent="navigateDown"
              @keydown.up.prevent="navigateUp"
              type="text"
              placeholder="Search for manga, figures, apparel..."
              class="w-full outline-none text-black text-sm placeholder:text-gray-400"
            />
            <button
              v-if="query"
              @click="clearSearch"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i class="pi pi-times"></i>
            </button>
          </div>
          <button
            @click="handleSearch"
            class="bg-white text-[#5F6FFF] px-7 py-2 rounded-full font-semibold hover:bg-opacity-90 transition-all duration-300 shadow-md hover:bg-gray-300 whitespace-nowrap h-[38px] cursor-pointer"
          >
            Search
          </button>
        </div>

        <!-- Redesigned Dropdown -->
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-1"
        >
          <div
            v-if="show && (filteredItems.length || query)"
            class="absolute top-full mt-2 w-full bg-white text-black rounded-xl shadow-xl overflow-hidden border border-gray-200 z-50"
          >
            <!-- Search suggestions -->
            <div v-if="filteredItems.length">
              <div class="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Popular Searches
                </p>
              </div>
              <div class="py-1 max-h-[380px] overflow-y-auto elegant-scrollbar">
                <div
                  v-for="(item, index) in filteredItems"
                  :key="item"
                  @mousedown="selectItem(item)"
                  @mouseenter="highlightedIndex = index"
                  class="px-4 py-2.5 cursor-pointer transition-all duration-150 flex items-center gap-3 group"
                  :class="
                    highlightedIndex === index ? 'bg-[#5F6FFF] text-white' : 'hover:bg-gray-50'
                  "
                >
                  <div
                    class="flex items-center justify-center w-8 h-8 rounded-lg transition-all"
                    :class="highlightedIndex === index ? 'bg-white bg-opacity-20' : 'bg-gray-100'"
                  >
                    <i
                      class="pi pi-search text-sm"
                      :class="highlightedIndex === index ? 'text-white' : 'text-gray-500'"
                    ></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p
                      class="text-sm font-medium truncate"
                      :class="highlightedIndex === index ? 'text-white' : 'text-gray-800'"
                      v-html="highlightQuery(item)"
                    ></p>
                  </div>
                  <i
                    class="pi pi-arrow-right text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    :class="highlightedIndex === index ? 'text-white' : 'text-gray-400'"
                  ></i>
                </div>
              </div>
            </div>

            <!-- No results -->
            <div v-else-if="query && !filteredItems.length" class="px-6 py-10 text-center">
              <div
                class="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3"
              >
                <i class="pi pi-inbox text-2xl text-gray-400"></i>
              </div>
              <p class="text-sm font-semibold text-gray-700 mb-1">No matches found</p>
              <p class="text-xs text-gray-500">Try searching with different keywords</p>
            </div>
          </div>
        </transition>
      </div>

      <!-- Icons -->
      <div class="flex gap-4 text-lg">
        <div class="relative">
          <button
            @click="showProfileMenu = !showProfileMenu"
            class="cursor-pointer focus:outline-none"
          >
            <i class="pi pi-user text-2xl"></i>
          </button>
          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-95 -translate-y-2"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 -translate-y-2"
          >
            <div
              v-if="showProfileMenu"
              class="absolute right-0 mt-[12px] bg-white text-black rounded-lg shadow-xl min-w-[160px] py-2 z-50 border border-gray-100 overflow-hidden"
            >
              <router-link
                to="/client/profile"
                class="block px-4 py-2.5 hover:bg-[#5F6FFF] hover:text-white transition-colors flex items-center gap-2"
                @click="showProfileMenu = false"
              >
                <i class="pi pi-user"></i>
                Profile
              </router-link>
              <router-link
                to="/client/orders"
                class="block px-4 py-2.5 hover:bg-[#5F6FFF] hover:text-white transition-colors flex items-center gap-2"
                @click="showProfileMenu = false"
              >
                <i class="pi pi-shopping-bag"></i>
                My Orders
              </router-link>
              <router-link
                to="/client/settings"
                class="block px-4 py-2.5 hover:bg-[#5F6FFF] hover:text-white transition-colors flex items-center gap-2"
                @click="showProfileMenu = false"
              >
                <i class="pi pi-cog"></i>
                Settings
              </router-link>
            </div>
          </transition>
        </div>
        <router-link to="/client/cart" class="relative">
          <i class="pi pi-shopping-cart text-2xl"></i>
          <span
            v-if="cartStore.totalItems > 0"
            class="absolute top-3 right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
          >
            {{ cartStore.totalItems }}
          </span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useProductsStore } from '@/data/products'
import { useScrollDirection } from '@/composables/useScrollDirection'
import { useSearch } from '@/composables/useSearch'

const cartStore = useCartStore()
const productsStore = useProductsStore()
const { setSearchQuery, clearSearchQuery } = useSearch()

const query = ref('')
const show = ref(false)
const searchInput = ref(null)
const highlightedIndex = ref(-1)
const showProfileMenu = ref(false)

// Close dropdown on scroll, but keep navbar visible when search is active
const closeDropdown = () => {
  if (show.value) {
    show.value = false
    // Blur the search input when scrolling
    if (searchInput.value) {
      searchInput.value.blur()
    }
  }
}

const { isVisible } = useScrollDirection({
  threshold: 50,
  onScroll: closeDropdown,
  shouldHide: () => !show.value, // Don't hide navbar when search dropdown is open
})

// Handle focus to show navbar and dropdown
function handleFocus() {
  show.value = true
  isVisible.value = true // Force navbar to show when searching
}

// Get unique product titles and subtitles from the store
const searchableItems = computed(() => {
  const products = productsStore.products
  const items = new Set<string>()

  products.forEach((product) => {
    items.add(product.title)
    if (product.subtitle) {
      items.add(product.subtitle)
    }
  })

  return Array.from(items)
})

const filteredItems = computed(() => {
  if (!query.value || query.value.length < 2) return []
  return searchableItems.value
    .filter((item) => item.toLowerCase().includes(query.value.toLowerCase()))
    .slice(0, 6) // Limit to 6 results
})

function selectItem(item) {
  query.value = item
  show.value = false
  highlightedIndex.value = -1
  setSearchQuery(item)
}

function handleSearch() {
  if (!query.value.trim()) return
  show.value = false
  setSearchQuery(query.value)
}

function clearSearch() {
  query.value = ''
  show.value = false
  highlightedIndex.value = -1
  clearSearchQuery()
  searchInput.value?.focus()
}

function hideDropdown() {
  // Delay to allow click selection
  setTimeout(() => {
    show.value = false
    highlightedIndex.value = -1
  }, 200)
}

function navigateDown() {
  if (!filteredItems.value.length) return
  highlightedIndex.value = Math.min(highlightedIndex.value + 1, filteredItems.value.length - 1)
}

function navigateUp() {
  highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1)
}

function highlightQuery(text) {
  if (!query.value) return text
  const regex = new RegExp(`(${query.value})`, 'gi')
  return text.replace(regex, '<span class="font-bold text-[#5F6FFF]">$1</span>')
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.elegant-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.elegant-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.elegant-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.elegant-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
