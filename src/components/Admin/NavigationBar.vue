<template>
  <div>
    <!-- Navigation Bar -->
    <nav class="bg-gradient-to-r from-indigo-600 to-blue-500 shadow-lg fixed top-0 left-0 right-0 z-50">
      <div class="flex items-center justify-between h-14 px-4">
        <!-- Left Section - Logo -->
        <div class="flex items-center gap-4">
          <div class="flex items-center">
            <router-link to="/">
              <img src="/logo.png" alt="" class="h-[30px] w-[100px]" />
            </router-link>
          </div>
        </div>

        <!-- Right Section - Theme, Notifications, User -->
        <div class="flex items-center gap-1 md:gap-2">
          <!-- Theme Toggle -->
          <div class="relative">
            <button
              @click="toggleThemeMenu"
              class="text-white hover:bg-white/10 p-1.5 md:p-2 rounded-lg transition-colors"
              :title="themeMode === 'light' ? 'Light Mode' : themeMode === 'dark' ? 'Dark Mode' : 'System Theme'"
            >
              <i :class="getThemeIcon()" class="text-lg md:text-xl"></i>
            </button>
            <!-- Theme Dropdown -->
            <div
              v-if="showThemeMenu"
              class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 overflow-hidden"
            >
              <button
                @click="setTheme('light')"
                :class="[
                  'w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors',
                  themeMode === 'light' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                ]"
              >
                <i class="pi pi-sun text-lg"></i>
                <span>Light Mode</span>
              </button>
              <button
                @click="setTheme('dark')"
                :class="[
                  'w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors',
                  themeMode === 'dark' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                ]"
              >
                <i class="pi pi-moon text-lg"></i>
                <span>Dark Mode</span>
              </button>
              <button
                @click="setTheme('system')"
                :class="[
                  'w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors',
                  themeMode === 'system' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                ]"
              >
                <i class="pi pi-desktop text-lg"></i>
                <span>System</span>
              </button>
            </div>
          </div>

          <!-- Notifications -->
          <div class="relative">
            <button
              @click="toggleNotifications"
              class="text-white hover:bg-white/10 p-1.5 md:p-2 rounded-lg transition-colors"
            >
              <i class="pi pi-bell text-lg md:text-xl"></i>
              <span
                v-if="notificationCount > 0"
                class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
              >
                {{ notificationCount }}
              </span>
            </button>
            <!-- Notifications Dropdown -->
            <div
              v-if="showNotifications"
              class="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-100"
            >
              <!-- Header -->
              <div class="px-6 py-5 bg-gradient-to-r from-indigo-500 to-blue-500">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="font-bold text-white text-lg">Notifications</h3>
                    <p class="text-blue-100 text-xs mt-1">{{ notificationCount }} new updates</p>
                  </div>
                  <div class="bg-white/20 px-3 py-1 rounded-full">
                    <span class="text-white text-sm font-semibold">{{ notificationCount }}</span>
                  </div>
                </div>
              </div>

              <!-- Content -->
              <div class="max-h-[400px] overflow-y-auto">
                <div
                  v-for="notification in notifications"
                  :key="notification.id"
                  class="px-6 py-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-all duration-200 group"
                  @click="handleNotificationClick(notification)"
                >
                  <div class="flex items-start gap-4">
                    <!-- Icon -->
                    <div
                      :class="[
                        'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                        notification.type === 'success'
                          ? 'bg-green-100'
                          : notification.type === 'warning'
                            ? 'bg-yellow-100'
                            : notification.type === 'error'
                              ? 'bg-red-100'
                              : 'bg-blue-100'
                      ]"
                    >
                      <i
                        :class="[
                          'text-lg',
                          notification.type === 'success'
                            ? 'pi pi-check text-green-600'
                            : notification.type === 'warning'
                              ? 'pi pi-exclamation-triangle text-yellow-600'
                              : notification.type === 'error'
                                ? 'pi pi-times text-red-600'
                                : 'pi pi-bell text-blue-600'
                        ]"
                      ></i>
                    </div>

                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-start justify-between">
                        <p class="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {{ notification.title }}
                        </p>
                        <span
                          v-if="notification.type === 'success'"
                          class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex-shrink-0"
                        >
                          ✓ Done
                        </span>
                      </div>
                      <p class="text-sm text-gray-600 mt-1 leading-relaxed">{{ notification.text }}</p>
                      <div class="flex items-center justify-between mt-2.5">
                        <p class="text-xs text-gray-400">{{ notification.time }}</p>
                        <button class="text-xs text-blue-600 hover:text-blue-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          View
                        </button>
                      </div>
                    </div>

                    <!-- Close button -->
                    <button class="text-gray-300 hover:text-gray-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <i class="pi pi-times text-lg"></i>
                    </button>
                  </div>
                </div>

                <!-- Empty state -->
                <div v-if="notifications.length === 0" class="px-6 py-12 text-center">
                  <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="pi pi-inbox text-gray-400 text-2xl"></i>
                  </div>
                  <p class="text-sm font-medium text-gray-600">All caught up!</p>
                  <p class="text-xs text-gray-500 mt-1">You have no new notifications</p>
                </div>
              </div>

              <!-- Footer -->
              <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <button
                  class="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  @click="markAllAsRead"
                >
                  Mark all as read
                </button>
                <button
                  class="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  @click="viewAllNotifications"
                >
                  View all →
                </button>
              </div>
            </div>
          </div>

          <!-- User Profile (Desktop) -->
          <div class="relative hidden md:block">
            <button
              @click="toggleUserMenu"
              class="flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
            >
              <div
                class="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm"
              >
                {{ userData.avatar }}
              </div>
              <div class="hidden lg:block text-left">
                <div class="text-white text-sm font-medium">{{ userData.name }}</div>
                <div class="text-blue-100 text-xs">{{ userData.email }}</div>
              </div>
            </button>
            <!-- User Dropdown -->
            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 overflow-hidden"
            >
              <div class="px-4 py-3 border-b">
                <p class="font-semibold text-gray-900">{{ userData.name }}</p>
                <p class="text-sm text-gray-500">{{ userData.email }}</p>
              </div>
              <div class="py-2">
                <button
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="goToProfile"
                >
                  Profile Settings
                </button>
                <button
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="goToMyComics"
                >
                  My Comics
                </button>
                <button
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="goToPreferences"
                >
                  Preferences
                </button>
              </div>
              <div class="border-t py-2">
                <router-link to="/LoginPage"
                  class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Logout
                </router-link>
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
              {{ userData.avatar }}
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
export default {
  name: 'ComicNavbar',

  data() {
    return {
      showNotifications: false,
      showUserMenu: false,
      showThemeMenu: false,
      sidebarOpen: true,
      themeMode: 'system',
      userData: {
        name: 'Admin User',
        email: 'rom_tola@example.com',
        avatar: 'AS'
      },
      orders: [
        {
          _id: 'ORD-2026-001',
          user_name: 'John Doe',
          user_email: 'john@example.com',
          created_at: '2026-01-21T10:30:00',
          total_amount: 89.99,
          status: 'pending',
          delivery_method: 'shipping',
          items: [{ name: 'Spider-Man Vol 1', quantity: 2, price: 29.99 }]
        },
        {
          _id: 'ORD-2026-002',
          user_name: 'Jane Smith',
          user_email: 'jane@example.com',
          created_at: '2026-01-21T14:20:00',
          total_amount: 45.50,
          status: 'processing',
          delivery_method: 'pickup',
          items: [{ name: 'X-Men Collection', quantity: 1, price: 45.50 }]
        }
      ],
      menuItems: [
        {
          name: 'Dashboard',
          icon: 'pi pi-chart-bar',
          link: '/admin/dashboard'
        },
        {
          name: 'Analytics',
          icon: 'pi pi-chart-line',
          link: '/admin/analytics'
        },
        {
          name: 'E-Commerce',
          icon: 'pi pi-shopping-bag',
          link: '/admin/e-commerce'
        },
        {
          name: 'Orders',
          icon: 'pi pi-inbox',
          link: '/admin/orders'
        },
        {
          name: 'User Control',
          icon: 'pi pi-users',
          link: '/admin/users'
        },
        {
          name: 'Profile',
          icon: 'pi pi-user',
          link: '/admin/profile'
        },
        {
          name: 'Settings',
          icon: 'pi pi-cog',
          link: '/admin/setting'
        }
      ]
    }
  },

  computed: {
    notifications() {
      return this.orders.map((order, index) => ({
        id: index + 1,
        title: 'New Order',
        text: `${order.user_name} placed an order for $${order.total_amount.toFixed(2)} - ${order.items.map(i => i.name).join(', ')}`,
        time: this.getTimeAgo(order.created_at),
        type: 'success',
        order_id: order._id,
        customer_name: order.user_name,
        amount: order.total_amount
      }))
    },

    notificationCount() {
      return this.notifications.length
    }
  },

  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },

  methods: {
    handleClickOutside(event) {
      const target = event.target
      if (!target.closest('.relative')) {
        this.showThemeMenu = false
        this.showNotifications = false
        this.showUserMenu = false
      }
    },

    toggleThemeMenu() {
      this.showThemeMenu = !this.showThemeMenu
      this.showNotifications = false
      this.showUserMenu = false
    },

    toggleNotifications() {
      this.showNotifications = !this.showNotifications
      this.showThemeMenu = false
      this.showUserMenu = false
    },

    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu
      this.showThemeMenu = false
      this.showNotifications = false
    },

    getThemeIcon() {
      if (this.themeMode === 'light') return 'pi pi-sun'
      if (this.themeMode === 'dark') return 'pi pi-moon'
      return 'pi pi-desktop'
    },

    getTimeAgo(dateString) {
      const date = new Date(dateString)
      const now = new Date()
      const seconds = Math.floor((now - date) / 1000)
      
      if (seconds < 60) return 'just now'
      const minutes = Math.floor(seconds / 60)
      if (minutes < 60) return `${minutes}m ago`
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours}h ago`
      const days = Math.floor(hours / 24)
      return `${days}d ago`
    },

    setTheme(mode) {
      this.themeMode = mode
      this.showThemeMenu = false
      console.log('Theme mode set to:', mode)
    },

    toggleSidebar() {
      // Sidebar is always open, no toggle needed
    },

    closeSidebar() {
      // Sidebar is always open, no close needed
    },

    handleNotificationClick(notification) {
      console.log('Notification clicked:', notification)
      this.showNotifications = false
    },

    markAllAsRead() {
      console.log('Mark all notifications as read')
    },

    viewAllNotifications() {
      this.showNotifications = false
      console.log('View all notifications')
    },

    goToProfile() {
      this.showUserMenu = false
      console.log('Go to profile')
    },

    goToMyComics() {
      this.showUserMenu = false
      console.log('Go to my comics')
    },

    goToPreferences() {
      this.showUserMenu = false
      console.log('Go to preferences')
    },

    handleLogout() {
      console.log('Logout')
    }
  }
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
