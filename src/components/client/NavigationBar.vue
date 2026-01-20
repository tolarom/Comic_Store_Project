<template>
  <div class="w-full">
    <div
      class="w-full bg-gray-600 text-white text-center py-2 text-sm fixed left-0 right-0 z-50 transition-all duration-500 ease-in-out"
      :class="isNavVisible ? 'top-0 opacity-100' : '-top-[32px] opacity-0'"
    >
      FREE SHIPPING ON ORDERS $50+
    </div>
    <nav
      class="bg-[#5F6FFF] fixed p-4 text-white text-sm flex justify-between items-center w-full z-50 transition-all duration-500 ease-in-out"
      :class="[isNavVisible ? 'top-[32px] shadow-lg' : '-top-[64px] shadow-none']"
    >
      <div class="text-2xl font-bold cursor-pointer">
        <router-link to="/"><img src="/logo.png" alt="" class="h-[30px]" /></router-link>
      </div>
      <ul class="hidden md:flex gap-6 items-center">
        <li><router-link to="/new" class="hover:text-gray-200">NEW ARRIVALS</router-link></li>
        <li class="relative" v-for="(menu, index) in dropdowns" :key="index">
          <button
            @click="toggleDropdown(index)"
            class="flex items-center gap-1.5 hover:text-gray-200 transition-all duration-200 group cursor-pointer"
          >
            {{ menu.title }}
            <span
              class="pi pi-chevron-down text-xs transition-transform duration-200"
              :class="menu.open ? 'rotate-180' : ''"
            ></span>
          </button>
          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-95 -translate-y-2"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 -translate-y-2"
          >
            <ul
              v-if="menu.open"
              class="absolute left-0 mt-[20px] bg-white text-black rounded-xl shadow-xl min-w-[180px] py-2 z-50 border border-gray-100 overflow-hidden"
            >
              <li v-for="(item, i) in menu.items" :key="i">
                <router-link
                  class="block px-4 py-2.5 hover:bg-[#5F6FFF] hover:text-white transition-colors duration-150 flex items-center gap-2 group/item"
                  :to="item.link"
                >
                  <i
                    class="pi pi-circle-fill text-[6px] opacity-50 group-hover/item:opacity-100 transition-opacity"
                  ></i>
                  {{ item.name }}
                </router-link>
              </li>
            </ul>
          </transition>
        </li>
      </ul>

      <div class="hidden md:flex gap-4 text-lg">
        <router-link to="/client/products" class="cursor-pointer">
          <i class="pi pi-search text-2xl"></i>
        </router-link>
        <div class="relative">
          <button @click="showProfileMenu = !showProfileMenu" class="cursor-pointer">
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
        <router-link to="/client/cart" class="cursor-pointer relative">
          <i class="pi pi-shopping-cart text-2xl"></i>
          <span
            v-if="cartStore.totalItems > 0"
            class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
          >
            {{ cartStore.totalItems }}
          </span>
        </router-link>
      </div>
      <div class="md:hidden cursor-pointer text-2xl" @click="isMenuOpen = !isMenuOpen">
        <span class="pi pi-bars"></span>
      </div>
    </nav>

    <!-- Mobile Menu -->
    <div
      v-if="isMenuOpen"
      class="md:hidden bg-[#5F6FFF] text-white flex flex-col space-y-3 fixed left-0 right-0 z-40 p-4 transition-all duration-500 ease-in-out"
      :class="isNavVisible ? 'top-[82px] opacity-100' : '-top-[200px] opacity-0'"
    >
      <router-link to="/new">NEW ARRIVALS</router-link>
      <div v-for="(menu, index) in dropdowns" :key="index">
        <button
          @click="toggleDropdown(index)"
          class="w-full text-left flex justify-between items-center py-2"
        >
          {{ menu.title }}
          <span
            class="pi pi-chevron-down text-xs transition-transform duration-200"
            :class="menu.open ? 'rotate-180' : ''"
          ></span>
        </button>
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-96"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 max-h-96"
          leave-to-class="opacity-0 max-h-0"
        >
          <ul
            v-if="menu.open"
            class="bg-white text-black rounded-lg shadow-lg py-2 mt-2 ml-4 overflow-hidden"
          >
            <li v-for="(item, i) in menu.items" :key="i">
              <router-link
                class="block px-4 py-2 hover:bg-[#5F6FFF] hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                :to="item.link"
              >
                <i class="pi pi-circle-fill text-[6px]"></i>
                {{ item.name }}
              </router-link>
            </li>
          </ul>
        </transition>
      </div>
    </div>

    <!-- Spacer -->
    <div class="h-[82px] md:h-[50px]"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useScrollDirection } from '@/composables/useScrollDirection'
import logo from '@/assets/logo.png'

const cartStore = useCartStore()
const isMenuOpen = ref(false)
const showProfileMenu = ref(false)

// Dropdown menus
const dropdowns = reactive([
  {
    title: 'BOOKS',
    open: false,
    items: [
      { name: 'Manga', link: '/books/manga' },
      { name: 'Novels', link: '/books/novel' },
      { name: 'Comics', link: '/books/comics' },
    ],
  },
  {
    title: 'CLOTHES',
    open: false,
    items: [
      { name: 'T-Shirts', link: '/clothes/tshirt' },
      { name: 'Hoodies', link: '/clothes/hoodie' },
    ],
  },
  {
    title: 'FIGURES',
    open: false,
    items: [
      { name: 'Anime Figures', link: '/figures/anime' },
      { name: 'Game Figures', link: '/figures/game' },
    ],
  },
  {
    title: 'ACCESSORIES',
    open: false,
    items: [
      { name: 'Bags', link: '/accessories/bags' },
      { name: 'Hats', link: '/accessories/hats' },
    ],
  },
])

// Close all dropdowns and mobile menu
const closeAllDropdowns = () => {
  dropdowns.forEach((d) => (d.open = false))
  isMenuOpen.value = false
}

// Use scroll direction composable with auto-close on scroll
const { isVisible: isNavVisible } = useScrollDirection({
  threshold: 50,
  onScroll: closeAllDropdowns,
})

const toggleDropdown = (index) => {
  dropdowns.forEach((d, i) => {
    if (i === index) {
      d.open = !d.open
    } else {
      d.open = false
    }
  })
}
</script>

<style scoped>

</style>
