<template>
  <div class="w-full">
    <!-- Top banner -->
    <div class="w-full bg-gray-600 text-white text-center py-2 text-sm fixed top-0 left-0 right-0 z-50">
      FREE SHIPPING ON ORDERS $50+
    </div>

    <!-- Navbar -->
    <nav class="bg-[#5F6FFF] fixed top-[32px] p-4 text-white text-sm flex justify-between items-center w-full z-50">
      <!-- Logo -->
      <router-link to="/">
        <img src="/logo.png" alt="Logo" class="h-[30px]" />
      </router-link>

      <!-- Search -->
      <div class="relative">
        <div
          class="w-[800px] h-[40px] bg-white rounded-full flex items-center px-4 gap-2"
        >
          <i class="pi pi-search text-gray-500"></i>
          <input
            v-model="query"
            @focus="show = true"
            @blur="hideDropdown"
            type="text"
            placeholder="Search products..."
            class="w-full outline-none text-black"   
          />
        </div>

        <!-- Prediction Dropdown -->
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div
            v-if="show && filteredItems.length"
            class="absolute mt-2 w-[800px] bg-black text-white rounded-lg shadow-lg p-2"
          >
            <div
              v-for="item in filteredItems"
              :key="item"
              @mousedown="selectItem(item)"
              class="px-4 py-2 rounded cursor-pointer hover:bg-gray-700"
            >
              {{ item }}
            </div>
          </div>
        </transition>
      </div>

      <!-- Icons -->
      <div class="flex gap-4 text-lg">
        <router-link to="/profile">
          <i class="pi pi-user text-2xl"></i>
        </router-link>
        <router-link to="/shopcard">
          <i class="pi pi-shopping-cart text-2xl"></i>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const query = ref("");
const show = ref(false);

// Example prediction data (replace with API later)
const items = [
  "Naruto Manga",
  "One Piece Figure",
  "Attack on Titan Poster",
  "Dragon Ball T-Shirt",
  "Marvel Comic",
  "DC Batman Figure",
];

const filteredItems = computed(() => {
  if (!query.value) return [];
  return items.filter(item =>
    item.toLowerCase().includes(query.value.toLowerCase())
  );
});

function selectItem(item) {
  query.value = item;
  show.value = false;
}

function hideDropdown() {
  // Delay to allow click selection
  setTimeout(() => (show.value = false), 150);
}
</script>
