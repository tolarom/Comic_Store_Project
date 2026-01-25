<template>
  <div>
    <!-- Navigation Bar -->
    <nav
      class="bg-gradient-to-r from-indigo-600 to-blue-500 shadow-lg fixed top-0 left-0 right-0 z-50"
    >
      <div class="flex items-center justify-between h-14 px-4">
        <!-- Left Section - Logo -->
        <div class="flex items-center gap-4">
          <div class="flex items-center">
            <router-link to="/">
              <img src="/logo.png" alt="" class="h-[30px] w-[100px]" />
            </router-link>
          </div>
        </div>

        <!-- Right Section - User -->
        <div class="flex items-center gap-1 md:gap-2">
          <!-- User Profile (Desktop) -->
          <div class="relative hidden md:block">
            <button
              @click="toggleUserMenu"
              class="flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
            >
              <div
                class="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm"
              >
                {{ getInitials(currentUser?.full_name || currentUser?.username || 'User') }}
              </div>
              <div class="hidden lg:block text-left">
                <div class="text-white text-sm font-medium">
                  {{ currentUser?.full_name || currentUser?.username || 'Admin User' }}
                </div>
                <div class="text-blue-100 text-xs">
                  {{ currentUser?.email || 'admin@example.com' }}
                </div>
              </div>
            </button>
            <!-- User Dropdown -->
            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 overflow-hidden"
            >
              <div class="border-t py-2">
                <button
                  class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 font-medium"
                  @click="handleLogout"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          <!-- Mobile User Avatar -->
          <button
            @click="toggleUserMenu"
            class="md:hidden text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
          >
            <div
              class="w-7 h-7 bg-rose-500 rounded-full flex items-center justify-center text-white font-bold text-xs"
            >
              {{ getInitials(currentUser?.full_name || currentUser?.username || 'User') }}
            </div>
          </button>
        </div>
      </div>
    </nav>

    <!-- Sidebar - Always Open (No Overlay) -->
    <aside
      class="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 bg-white shadow-2xl z-50 overflow-y-auto"
    >
      <div class="p-4">
        <nav class="space-y-1">
          <router-link
            v-for="item in menuItems"
            :key="item.name"
            :to="item.link"
            class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
            exact-active-class="bg-blue-50 text-blue-600 font-medium"
          >
            <i :class="['text-xl', item.icon]"></i>
            <span class="font-medium">{{ item.name }}</span>
          </router-link>
        </nav>
      </div>
    </aside>
  </div>
</template>

<script lang="ts">
import { useAuth } from '../../composables/useAuth'

export default {
  name: 'ComicNavbar',

  setup() {
    const { currentUser, logout } = useAuth()
    return {
      currentUser,
      logout,
    }
  },

  data() {
    return {
      showUserMenu: false,
      sidebarOpen: true,
      menuItems: [
        {
          name: 'Dashboard',
          icon: 'pi pi-chart-bar',
          link: '/admin/dashboard',
        },
        {
          name: 'E-Commerce',
          icon: 'pi pi-shopping-bag',
          link: '/admin/e-commerce',
        },
        {
          name: 'Orders',
          icon: 'pi pi-inbox',
          link: '/admin/orders',
        },
        {
          name: 'User Control',
          icon: 'pi pi-users',
          link: '/admin/users',
        },
        {
          name: 'Profile',
          icon: 'pi pi-user',
          link: '/admin/profile',
        },
        {
          name: 'Settings',
          icon: 'pi pi-cog',
          link: '/admin/setting',
        },
      ],
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },

  methods: {
    handleClickOutside(event: Event) {
      const target = event.target as HTMLElement
      if (!target.closest('.relative')) {
        this.showUserMenu = false
      }
    },

    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu
    },

    handleLogout() {
      this.showUserMenu = false
      this.logout()
    },

    getInitials(name: string) {
      if (!name) return 'U'
      return name
        .split(' ')
        .slice(0, 2)
        .map((word: string) => word[0])
        .join('')
        .toUpperCase()
    },
  },
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
