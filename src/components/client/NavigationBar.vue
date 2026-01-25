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

      <div class="hidden md:flex gap-4 text-lg items-center">
        <router-link to="/client/products" class="cursor-pointer">
          <i class="pi pi-search text-2xl"></i>
        </router-link>
        <div class="relative">
          <button
            @click="showProfileMenu = !showProfileMenu"
            class="cursor-pointer flex items-center gap-2"
          >
            <div v-if="currentUser" class="flex items-center gap-2">
              <i class="pi pi-user text-2xl"></i>
              <span class="text-sm font-medium hidden lg:block">{{ currentUser.full_name }}</span>
            </div>
            <i v-else class="pi pi-user text-2xl"></i>
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
              class="absolute right-0 mt-[12px] bg-white text-black rounded-lg shadow-xl min-w-[200px] py-2 z-50 border border-gray-100 overflow-hidden"
            >
              <div v-if="currentUser" class="px-4 py-3 border-b border-gray-100">
                <p class="font-semibold text-sm">{{ currentUser.full_name }}</p>
                <p class="text-xs text-gray-500">{{ currentUser.email }}</p>
              </div>
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
              <button
                v-if="isAuthenticated"
                @click="handleLogout"
                class="w-full text-left block px-4 py-2.5 hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2 border-t border-gray-100"
              >
                <i class="pi pi-sign-out"></i>
                Logout
              </button>
              <router-link
                v-else
                to="/LoginPage"
                class="block px-4 py-2.5 hover:bg-[#5F6FFF] hover:text-white transition-colors flex items-center gap-2 border-t border-gray-100"
                @click="showProfileMenu = false"
              >
                <i class="pi pi-sign-in"></i>
                Login
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
    </nav>

    <!-- Spacer -->
    <div class="h-[50px]"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useCartStore } from '../../stores/cart'
import { useScrollDirection } from '../../composables/useScrollDirection'
import { useAuth } from '../../composables/useAuth'
import { getAllGroups, getCategoriesByGroup } from '../../services/api'

const cartStore = useCartStore()
const { currentUser, isAuthenticated, logout } = useAuth()
const showProfileMenu = ref(false)

// Dropdown menus (populated from backend groups/categories)
const dropdowns = reactive(
  [] as Array<{ title: string; open: boolean; items: Array<{ name: string; link: string }> }>,
)

const fetchNavGroups = async () => {
  try {
    const groups = await getAllGroups()

    if (!groups || groups.length === 0) {
      // fallback
      dropdowns.push({
        title: 'SHOP',
        open: false,
        items: [{ name: 'All', link: '/client/products' }],
      })
      return
    }

    // Fetch categories in parallel for all groups
    const fetches = groups.map(async (g) => {
      // normalize group id to string - backend returns _id: { $oid: '...' }
      let groupId = ''
      if ((g as any)._id) {
        const raw = (g as any)._id
        groupId = raw.$oid ?? String(raw)
      } else if ((g as any).id) {
        groupId = String((g as any).id)
      } else if ((g as any).slug) {
        groupId = String((g as any).slug)
      }
      if (!groupId) {
        return {
          title: g.name,
          items: [],
        }
      }
      try {
        const categories = await getCategoriesByGroup(groupId)
        return {
          title: g.name,
          items: categories.map((c) => ({
            name: c.name,
            link: `/client/products?category=${encodeURIComponent(c.slug ?? c.name)}`,
          })),
        }
      } catch (e) {
        return {
          title: g.name,
          items: [],
        }
      }
    })

    const results = await Promise.all(fetches)
    results.forEach((r) => dropdowns.push({ title: r.title, open: false, items: r.items }))
  } catch (err) {
    // on error, provide a reasonable fallback
    if (dropdowns.length === 0) {
      dropdowns.push({
        title: 'SHOP',
        open: false,
        items: [{ name: 'Products', link: '/client/products' }],
      })
    }
  }
}

onMounted(() => {
  fetchNavGroups()
})

// Close all dropdowns
const closeAllDropdowns = () => {
  dropdowns.forEach((d) => (d.open = false))
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

const handleLogout = () => {
  showProfileMenu.value = false
  logout()
}
</script>

<style scoped></style>
