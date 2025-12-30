<template>
  <div>
    <!-- Navigation Bar -->
    <nav class="bg-gradient-to-r from-indigo-600 to-blue-500 shadow-lg relative z-50">
      <div class="flex items-center justify-between h-14 px-4">
        <!-- Left Section - Logo and Menu -->
        <div class="flex items-center gap-4">
          <div class="flex items-center ">
            <router-link to="/"><img src="/logo.png" alt="" class="h-[30px] w-[100px]"></router-link>
          </div>
          <span class="mx-2 text-gray-400 ml-4 md:ml-12 lg:ml-30">&vert;</span>

          <button
            class="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
            @click="toggleSidebar"
          >
            <i class="pi pi-bars text-2xl"></i>
          </button>
        </div>

        <!-- Center Section - Search -->
        <div class="flex-1 max-w-md mx-4">
          <!-- Desktop Search Bar -->
          <div class="relative hidden md:block">
            <!-- Search Icon -->
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10">
              <i class="pi pi-search text-xl"></i>
            </span>

            <!-- Search Input -->
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search..."
              @keydown.enter="handleSearch"
              class="w-full pl-10 pr-4 py-2.5 rounded-[10px]
                    border border-gray-300
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    transition-all duration-200 bg-white"
            />
          </div>

          <!-- Mobile Search Icon -->
          <button
            @click="toggleMobileSearch"
            class="md:hidden text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
          >
            <i class="pi pi-search text-xl"></i>
          </button>
        </div>

        <!-- Right Section - Theme Toggle, Notifications and User -->
        <div class="flex items-center gap-1 md:gap-2">
          <!-- Theme Toggle Button with Dropdown -->
          <div class="relative">
            <button
              @click="showThemeMenu = !showThemeMenu"
              class="text-white hover:bg-white/10 p-1.5 md:p-2 rounded-lg transition-colors"
              :title="themeMode === 'light' ? 'Light Mode' : themeMode === 'dark' ? 'Dark Mode' : 'System Theme'"
            >
              <i :class="getThemeIcon()" class="text-lg md:text-xl"></i>
            </button>

            <!-- Theme Menu Dropdown -->
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

          <!-- Notifications Icon with Badge -->
          <div class="relative">
            <button
              @click="showNotifications = !showNotifications"
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
              class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 overflow-hidden"
            >
              <div class="px-4 py-3 border-b bg-gray-50">
                <h3 class="font-semibold text-gray-900">Notifications</h3>
              </div>
              <div class="max-h-96 overflow-y-auto">
                <div
                  v-for="notification in notifications"
                  :key="notification.id"
                  class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  @click="handleNotificationClick(notification)"
                >
                  <p class="text-sm text-gray-800">{{ notification.text }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ notification.time }}</p>
                </div>
              </div>
              <div class="px-4 py-3 border-t bg-gray-50">
                <button
                  class="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  @click="viewAllNotifications"
                >
                  View all notifications
                </button>
              </div>
            </div>
          </div>

          <!-- User Profile Dropdown (Desktop) -->
          <div class="relative hidden md:block">
            <button
              @click="showUserMenu = !showUserMenu"
              class="flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
            >
              <div class="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {{ userData.avatar }}
              </div>
              <div class="hidden lg:block text-left">
                <div class="text-white text-sm font-medium">{{ userData.name }}</div>
                <div class="text-blue-100 text-xs">{{ userData.email }}</div>
              </div>
            </button>

            <!-- User Menu Dropdown -->
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
                <button
                  class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  @click="handleLogout"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          <!-- User Avatar Icon (Mobile) -->
          <button
            @click="showUserMenu = !showUserMenu"
            class="md:hidden text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
          >
            <div class="w-7 h-7 bg-rose-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
              {{ userData.avatar }}
            </div>
          </button>

          <!-- Mobile User Menu Dropdown -->
          <div
            v-if="showUserMenu"
            class="md:hidden absolute right-4 top-16 w-56 bg-white rounded-lg shadow-xl z-50 overflow-hidden"
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
              <button
                class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                @click="handleLogout"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Mobile Search Overlay -->
    <div
      v-if="showMobileSearch"
      class="md:hidden fixed top-14 left-0 right-0 bg-white shadow-lg z-40 p-4"
    >
      <div class="relative">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
          <i class="pi pi-search text-xl"></i>
        </span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search..."
          @keydown.enter="handleSearch"
          class="w-full pl-10 pr-4 py-2.5 rounded-[10px]
                border border-gray-300
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition-all duration-200"
          autofocus
        />
      </div>
    </div>

    <!-- Sidebar Overlay (only covers content below navbar) -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 top-14  bg-opacity-50 z-30 transition-opacity duration-300"
      @click="closeSidebar"
    >
      <!-- Sidebar -->
      <aside
        class="absolute left-0 top-0 h-full w-64 bg-white shadow-2xl transform transition-transform duration-300"
        :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
        @click.stop
      >
        <div class="p-4">
          <!-- Menu Items -->
          <nav class="space-y-1">
            <a
              v-for="item in menuItems"
              :key="item.name"
              :href="item.link"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                item.active
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              ]"
              @click.prevent="navigateTo(item)"
            >
              <!-- Icon placeholder - Replace with your icons -->
              <span class="text-xl">{{ item.iconPlaceholder }}</span>
              <span class="font-medium">{{ item.name }}</span>
            </a>
          </nav>
        </div>
      </aside>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ComicNavbar',
  data() {
    return {
      searchQuery: '',
      showNotifications: false,
      showUserMenu: false,
      showThemeMenu: false,
      sidebarOpen: false,
      showMobileSearch: false,
      themeMode: 'system', // 'light', 'dark', or 'system'
      notificationCount: 2,
      userData: {
        name: 'Admin User',
        email: 'rom_tola@example.com',
        avatar: 'AS'
      },
      notifications: [
        { id: 1, text: 'New comment on your post', time: '5m ago' },
        { id: 2, text: 'Your subscription is expiring soon', time: '1h ago' }
      ],
      menuItems: [
        {
          name: 'Dashboard',
          iconPlaceholder: '📊',
          link: '/admin/dashboard',
          active: true
        },
        {
          name: 'Analytics',
          iconPlaceholder: '📈',
          link: '/analytics',
          active: false
        },
        {
          name: 'E-Commerce',
          iconPlaceholder: '🛒',
          link: '/ecommerce',
          active: false
        },
        {
          name: 'Profile',
          iconPlaceholder: '👤',
          link: '/profile',
          active: false
        },
        {
          name: 'Settings',
          iconPlaceholder: '⚙️',
          link: '/settings',
          active: false
        }
      ]
    }
  },
  methods: {
    handleSearch() {
      console.log('Searching for:', this.searchQuery);
      this.showMobileSearch = false;
      // TODO: Implement backend search API call
    },
    toggleMobileSearch() {
      this.showMobileSearch = !this.showMobileSearch;
    },
    getThemeIcon() {
      if (this.themeMode === 'light') return 'pi pi-sun';
      if (this.themeMode === 'dark') return 'pi pi-moon';
      return 'pi pi-desktop'; // system
    },
    setTheme(mode) {
      this.themeMode = mode;
      this.showThemeMenu = false;
      console.log('Theme mode set to:', mode);
      // TODO: Implement actual theme switching logic
      // Example:
      // if (mode === 'system') {
      //   const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      //   document.documentElement.classList.toggle('dark', prefersDark);
      // } else {
      //   document.documentElement.classList.toggle('dark', mode === 'dark');
      // }
    },
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },
    closeSidebar() {
      this.sidebarOpen = false;
    },
    handleNotificationClick(notification) {
      console.log('Notification clicked:', notification);
      this.showNotifications = false;
      // TODO: Mark notification as read and navigate to relevant page
    },
    viewAllNotifications() {
      this.showNotifications = false;
      console.log('View all notifications');
      // TODO: Navigate to notifications page
    },
    goToProfile() {
      this.showUserMenu = false;
      console.log('Go to profile');
    },
    goToMyComics() {
      this.showUserMenu = false;
      console.log('Go to my comics');
    },
    goToPreferences() {
      this.showUserMenu = false;
      console.log('Go to preferences');
    },
    handleLogout() {
      console.log('Logout');
      // TODO: Implement logout
    },
    navigateTo(item) {
    console.log('Navigating to:', item.name);
    this.menuItems.forEach(menuItem => {
      menuItem.active = menuItem.name === item.name;
    });
}

  }
}
</script>

<style scoped>
svg {
  width: 100%;
  height: auto;
  max-width: 100%;
}

</style>
