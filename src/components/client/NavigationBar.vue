<template>
  <div class="w-full">
    <!-- Top Banner -->
    <div class="w-full bg-gray-600 text-white text-center py-2 text-sm fixed top-0 left-0 right-0 z-50">
      FREE SHIPPING ON ORDERS $50+
    </div>

    <!-- Navbar -->
    <nav class="bg-[#5F6FFF] fixed top-[32px] p-4 text-white text-sm flex justify-between items-center w-full z-50">
      
      <!-- Logo -->
      <div class="text-2xl font-bold cursor-pointer">
        <router-link to="/"><img src="/logo.png" alt="" class="h-[30px]"></router-link>
      </div>

      <!-- Desktop Menu -->
      <ul class="hidden md:flex gap-6 items-center">
        <li><router-link to="/new" class="hover:text-gray-200">NEW ARRIVALS</router-link></li>
        <li><router-link to="/best" class="hover:text-gray-200">BEST SELLERS</router-link></li>

        <!-- Dropdowns -->
        <li class="relative" v-for="(menu, index) in dropdowns" :key="index">
          <button @click="toggleDropdown(index)" class="flex items-center gap-1 hover:text-gray-200 ">
            {{ menu.title }} <span class="pi pi-angle-down"></span>
          </button>

          <ul v-if="menu.open" class="absolute left-0 mt-[20px] bg-white text-black rounded-lg shadow-lg min-w-[160px] py-2 z-50 border border-gray">
            <li v-for="(item, i) in menu.items" :key="i">
              <router-link class="block px-4 py-2 hover:bg-gray-200" :to="item.link">{{ item.name }}</router-link>
            </li>
          </ul>
        </li>
      </ul>

      <!-- Right Icons -->
      <div class="hidden md:flex gap-4 text-lg">
        <router-link to="/searchbar" class="cursor-pointer">
      <i class="pi pi-search text-2xl"></i>
    </router-link>  
        <router-link to="/profile" class="cursor-pointer">
      <i class="pi pi-user text-2xl"></i>
    </router-link>  
        <router-link to="/shopcard" class="cursor-pointer">
      <i class="pi pi-shopping-cart text-2xl"></i>
    </router-link>        
      </div>

      <!-- Mobile Hamburger -->
      <div class="md:hidden cursor-pointer text-2xl" @click="isMenuOpen = !isMenuOpen">
        <span class="pi pi-bars"></span>
      </div>
    </nav>

    <!-- Mobile Menu -->
    <div v-if="isMenuOpen" class="md:hidden bg-[#5F6FFF] text-white flex flex-col space-y-3 fixed top-[82px] left-0 right-0 z-40 p-4">
      <router-link to="/new">NEW ARRIVALS</router-link>
      <router-link to="/best">BEST SELLERS</router-link>
      <div v-for="(menu, index) in dropdowns" :key="index">
        <button @click="toggleDropdown(index)" class="w-full text-left flex justify-between items-center">
          {{ menu.title }} <span class="pi pi-angle-down"></span>
        </button>
        <ul v-if="menu.open" class="bg-white text-black rounded-lg shadow-lg py-2 mt-1">
          <li v-for="(item, i) in menu.items" :key="i">
            <router-link class="block px-4 py-2 hover:bg-gray-200" :to="item.link">{{ item.name }}</router-link>
          </li>
        </ul>
      </div>
    </div>

    <!-- Spacer -->
    <div class="h-[82px] md:h-[50px]"></div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import logo from '@/assets/logo.png'

const isMenuOpen = ref(false)

// Dropdown menus
const dropdowns = reactive([
  {
    title: 'BOOKS',
    open: false,
    items: [
      { name: 'Manga', link: '/books/manga' },
      { name: 'Novels', link: '/books/novel' },
      { name: 'Comics', link: '/books/comics' },
    ]
  },
  {
    title: 'CLOTHES',
    open: false,
    items: [
      { name: 'T-Shirts', link: '/clothes/tshirt' },
      { name: 'Hoodies', link: '/clothes/hoodie' },
    ]
  },
  {
    title: 'FIGURES',
    open: false,
    items: [
      { name: 'Anime Figures', link: '/figures/anime' },
      { name: 'Game Figures', link: '/figures/game' },
    ]
  },
  {
    title: 'ACCESSORIES',
    open: false,
    items: [
      { name: 'Bags', link: '/accessories/bags' },
      { name: 'Hats', link: '/accessories/hats' },
    ]
  },
  {
    title: 'SHOP BY SERIES',
    open: false,
    items: [
      { name: 'Series 1', link: '/series/1' },
      { name: 'Series 2', link: '/series/2' },
    ]
  },
])

const toggleDropdown = (index) => {
  dropdowns.forEach((d, i) => {
    if(i === index) {
      d.open = !d.open
    } else {
      d.open = false
    }
  })
}
</script>

<style scoped>
/* optional: you can add hover effects or transitions here */
</style>