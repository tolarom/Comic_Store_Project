<template>
  <div><Header /></div>
  <div class="min-h-screen bg-gray-50 p-6 ml-[250px] mt-10">
    <div class="mx-auto">
      <!-- Breadcrumb -->
      <div class="flex items-center text-sm text-gray-600 mb-4">
        <i class="pi pi-home text-gray-400"></i>
        <span class="mx-2">/</span>
        <span>User Control</span>
      </div>

      <!-- Header -->
      <div class="flex justify-between items-start mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p class="text-gray-600">Manage customer accounts and permissions.</p>
        </div>
        <button
          @click="openModal('add')"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <i class="pi pi-plus"></i>
          Add User
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total Users</p>
              <p class="text-2xl font-bold text-gray-900">{{ users.length }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-users text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Active Users</p>
              <p class="text-2xl font-bold text-green-600">{{ activeUsers }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-check-circle text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Admin Users</p>
              <p class="text-2xl font-bold text-purple-600">{{ adminUsers }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-shield text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Blocked Users</p>
              <p class="text-2xl font-bold text-red-600">{{ blockedUsers }}</p>
            </div>
            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-ban text-red-600 text-xl"></i>
            </div>
          </div>
        </div>
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
            placeholder="Search users by name, email..."
            class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div class="relative">
          <button
            @click="toggleRoleDropdown"
            class="px-4 py-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-2 min-w-[200px] justify-between transition-colors"
          >
            <div class="flex items-center gap-2">
              <i class="pi pi-filter text-gray-600"></i>
              <span>{{ selectedRole }}</span>
            </div>
            <i class="pi pi-chevron-down text-gray-600 text-xs"></i>
          </button>

          <div
            v-if="showRoleDropdown"
            class="absolute right-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10"
          >
            <div
              v-for="role in roles"
              :key="role"
              @click="selectRole(role)"
              :class="[
                'px-4 py-3 cursor-pointer transition-colors',
                selectedRole === role ? 'bg-blue-600 text-white' : 'hover:bg-gray-50',
              ]"
            >
              {{ role }}
            </div>
          </div>
        </div>

        <div class="relative">
          <button
            @click="toggleStatusDropdown"
            class="px-4 py-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-2 min-w-[150px] justify-between transition-colors"
          >
            <span>{{ selectedStatus }}</span>
            <i class="pi pi-chevron-down text-gray-600 text-xs"></i>
          </button>

          <div
            v-if="showStatusDropdown"
            class="absolute right-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10"
          >
            <div
              v-for="status in statuses"
              :key="status"
              @click="selectStatus(status)"
              :class="[
                'px-4 py-3 cursor-pointer transition-colors',
                selectedStatus === status ? 'bg-blue-600 text-white' : 'hover:bg-gray-50',
              ]"
            >
              {{ status }}
            </div>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Joined Date
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="user in filteredUsers"
                :key="user.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                      :class="getAvatarColor(user.id)"
                    >
                      {{ user.name.substring(0, 2).toUpperCase() }}
                    </div>
                    <div>
                      <div class="font-medium text-gray-900">{{ user.name }}</div>
                      <div class="text-sm text-gray-500">ID: {{ user.id }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-700">{{ user.email }}</td>
                <td class="px-6 py-4">
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-semibold',
                      user.role === 'Admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700',
                    ]"
                  >
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-semibold',
                      user.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700',
                    ]"
                  >
                    {{ user.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-700">{{ formatDate(user.joinedDate) }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <button
                      @click="openModal('view', user)"
                      class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <i class="pi pi-eye"></i>
                    </button>
                    <button
                      @click="openModal('edit', user)"
                      class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit User"
                    >
                      <i class="pi pi-pencil"></i>
                    </button>
                    <button
                      @click="toggleUserStatus(user)"
                      :class="[
                        'p-2 rounded-lg transition-colors',
                        user.status === 'Active'
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-green-600 hover:bg-green-50',
                      ]"
                      :title="user.status === 'Active' ? 'Block User' : 'Activate User'"
                    >
                      <i :class="user.status === 'Active' ? 'pi pi-ban' : 'pi pi-check-circle'"></i>
                    </button>
                    <button
                      @click="deleteUser(user)"
                      class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete User"
                    >
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="filteredUsers.length === 0" class="text-center py-12">
            <i class="pi pi-users text-gray-300 text-6xl mb-4"></i>
            <h3 class="text-xl font-semibold text-gray-600 mb-2">No users found</h3>
            <p class="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        </div>
      </div>

      <!-- User Modal -->
      <UserModal
        v-if="modalState.isOpen"
        :user="modalState.user"
        :mode="modalState.mode"
        @close="closeModal"
        @save="handleSaveUser"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, defineComponent } from 'vue'
import Header from '../../components/Admin/NavigationBar.vue'
import { useUsersStore } from '@/data/users'

// UserModal Component
const UserModal = defineComponent({
  name: 'UserModal',
  props: {
    user: {
      type: Object,
      default: null,
    },
    mode: {
      type: String,
      required: true,
    },
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    // Enhanced user data with additional fields for view mode
    const formData = ref(
      props.user
        ? {
            ...props.user,
            total_orders: props.user.total_orders || Math.floor(Math.random() * 20),
            total_spent: props.user.total_spent || (Math.random() * 1000).toFixed(2),
            last_order_date: props.user.last_order_date || '2026-01-15',
            recent_orders: props.user.recent_orders || [
              { id: 'ORD-001', date: '2026-01-15', amount: 89.99, status: 'delivered' },
              { id: 'ORD-002', date: '2026-01-10', amount: 45.5, status: 'shipped' },
              { id: 'ORD-003', date: '2026-01-05', amount: 120.0, status: 'processing' },
            ],
            recent_activity: props.user.recent_activity || [
              { action: 'Placed order #ORD-001', timestamp: '2026-01-15 10:30 AM' },
              { action: 'Updated profile information', timestamp: '2026-01-12 03:45 PM' },
              { action: 'Changed password', timestamp: '2026-01-08 09:20 AM' },
            ],
          }
        : {
            name: '',
            email: '',
            password: '',
            role: 'Customer',
            status: 'Active',
            phone: '',
            address: '',
            joinedDate: new Date().toISOString().split('T')[0],
            total_orders: 0,
            total_spent: 0,
            recent_orders: [],
            recent_activity: [],
          },
    )

    const isViewMode = computed(() => props.mode === 'view')

    const handleSubmit = () => {
      if (!formData.value.name || !formData.value.email) {
        alert('Please fill in name and email')
        return
      }

      if (props.mode === 'add' && !formData.value.password) {
        alert('Please provide a password for new user')
        return
      }

      emit('save', { ...formData.value })
    }

    const close = () => {
      emit('close')
    }

    return {
      formData,
      isViewMode,
      handleSubmit,
      close,
    }
  },
  template: `
    <div class="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 class="text-2xl font-bold text-gray-900">
            {{ mode === 'view' ? 'User Details' : mode === 'edit' ? 'Edit User' : 'Add New User' }}
          </h2>
          <button
            @click="close"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i class="pi pi-times text-xl"></i>
          </button>
        </div>

        <div class="p-6">
          <!-- View Mode - Enhanced Details -->
          <div v-if="isViewMode" class="space-y-6">
            <!-- User Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-blue-800 font-medium">Total Orders</p>
                    <p class="text-2xl font-bold text-blue-600">{{ formData.total_orders || 0 }}</p>
                  </div>
                  <i class="pi pi-shopping-cart text-blue-600 text-2xl"></i>
                </div>
              </div>
              <div class="bg-green-50 rounded-lg p-4 border border-green-200">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-green-800 font-medium">Total Spent</p>
                    <p class="text-2xl font-bold text-green-600">\${{ (formData.total_spent || 0).toFixed(2) }}</p>
                  </div>
                  <i class="pi pi-dollar text-green-600 text-2xl"></i>
                </div>
              </div>
              <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-purple-800 font-medium">Last Order</p>
                    <p class="text-sm font-bold text-purple-600">{{ formData.last_order_date || 'N/A' }}</p>
                  </div>
                  <i class="pi pi-calendar text-purple-600 text-2xl"></i>
                </div>
              </div>
            </div>

            <!-- Personal Information -->
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <i class="pi pi-user"></i>
                Personal Information
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-600">Full Name</p>
                  <p class="font-medium text-gray-900">{{ formData.name }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Email Address</p>
                  <p class="font-medium text-gray-900">{{ formData.email }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Phone Number</p>
                  <p class="font-medium text-gray-900">{{ formData.phone || 'Not provided' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Joined Date</p>
                  <p class="font-medium text-gray-900">{{ new Date(formData.joinedDate).toLocaleDateString() }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Role</p>
                  <span :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold inline-block',
                    formData.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  ]">
                    {{ formData.role }}
                  </span>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Account Status</p>
                  <span :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold inline-block',
                    formData.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  ]">
                    {{ formData.status }}
                  </span>
                </div>
              </div>
              <div v-if="formData.address" class="mt-4">
                <p class="text-sm text-gray-600">Address</p>
                <p class="font-medium text-gray-900">{{ formData.address }}</p>
              </div>
            </div>

            <!-- Recent Orders -->
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <i class="pi pi-list"></i>
                Recent Orders
              </h3>
              <div v-if="formData.recent_orders && formData.recent_orders.length > 0" class="space-y-2">
                <div
                  v-for="order in formData.recent_orders"
                  :key="order.id"
                  class="flex justify-between items-center p-3 bg-white rounded border border-gray-200"
                >
                  <div>
                    <p class="font-medium text-gray-900">#{{ order.id }}</p>
                    <p class="text-sm text-gray-500">{{ order.date }}</p>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold text-gray-900">\${{ order.amount.toFixed(2) }}</p>
                    <span :class="[
                      'px-2 py-1 rounded text-xs font-semibold',
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    ]">
                      {{ order.status }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-6 text-gray-500">
                <i class="pi pi-shopping-cart text-3xl mb-2"></i>
                <p>No orders yet</p>
              </div>
            </div>

            <!-- Activity Log -->
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <i class="pi pi-history"></i>
                Recent Activity
              </h3>
              <div class="space-y-2 max-h-40 overflow-y-auto">
                <div v-for="(activity, index) in formData.recent_activity || []" :key="index" 
                     class="flex items-start gap-3 p-2">
                  <div class="w-2 h-2 bg-blue-600 rounded-full mt-1.5"></div>
                  <div class="flex-1">
                    <p class="text-sm text-gray-700">{{ activity.action }}</p>
                    <p class="text-xs text-gray-500">{{ activity.timestamp }}</p>
                  </div>
                </div>
                <div v-if="!formData.recent_activity || formData.recent_activity.length === 0" 
                     class="text-center py-4 text-gray-500 text-sm">
                  No recent activity
                </div>
              </div>
            </div>
          </div>

          <!-- Edit/Add Mode - Form -->
          <div v-else class="space-y-4">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                v-model="formData.name"
                type="text"
                placeholder="Enter full name"
                :disabled="isViewMode"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                v-model="formData.email"
                type="email"
                placeholder="user@example.com"
                :disabled="isViewMode"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>

            <!-- Password (only for add mode) -->
            <div v-if="mode === 'add'">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                v-model="formData.password"
                type="password"
                placeholder="Enter password"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                v-model="formData.phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                :disabled="isViewMode"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>

            <!-- Address -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                v-model="formData.address"
                placeholder="Enter address"
                :disabled="isViewMode"
                rows="2"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              ></textarea>
            </div>

            <!-- Role and Status -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  v-model="formData.role"
                  :disabled="isViewMode"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                >
                  <option>Customer</option>
                  <option>Admin</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  v-model="formData.status"
                  :disabled="isViewMode"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                >
                  <option>Active</option>
                  <option>Blocked</option>
                </select>
              </div>
            </div>

            <!-- Joined Date (view/edit only) -->
            <div v-if="mode !== 'add'">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Joined Date
              </label>
              <input
                v-model="formData.joinedDate"
                type="date"
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
              {{ mode === 'edit' ? 'Save Changes' : 'Add User' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})

export default {
  name: 'UserControl',
  components: {
    UserModal,
    Header,
  },
  setup() {
    const usersStore = useUsersStore()
    const searchQuery = ref('')
    const selectedRole = ref('All Roles')
    const selectedStatus = ref('All Status')
    const showRoleDropdown = ref(false)
    const showStatusDropdown = ref(false)
    const modalState = ref({ isOpen: false, mode: null, user: null })

    const roles = ref(['All Roles', 'Customer', 'Admin'])
    const statuses = ref(['All Status', 'Active', 'Blocked'])

    const filteredUsers = computed(() => {
      let filtered = usersStore.users

      // Filter by role
      if (selectedRole.value !== 'All Roles') {
        filtered = filtered.filter((u) => u.role === selectedRole.value)
      }

      // Filter by status
      if (selectedStatus.value !== 'All Status') {
        filtered = filtered.filter((u) => u.status === selectedStatus.value)
      }

      // Filter by search query
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(
          (u) =>
            u.name.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query) ||
            u.id.toString().includes(query),
        )
      }

      return filtered
    })

    const activeUsers = computed(() => usersStore.users.filter((u) => u.status === 'Active').length)
    const adminUsers = computed(() => usersStore.users.filter((u) => u.role === 'Admin').length)
    const blockedUsers = computed(
      () => usersStore.users.filter((u) => u.status === 'Blocked').length,
    )

    const toggleRoleDropdown = () => {
      showRoleDropdown.value = !showRoleDropdown.value
      showStatusDropdown.value = false
    }

    const toggleStatusDropdown = () => {
      showStatusDropdown.value = !showStatusDropdown.value
      showRoleDropdown.value = false
    }

    const selectRole = (role) => {
      selectedRole.value = role
      showRoleDropdown.value = false
    }

    const selectStatus = (status) => {
      selectedStatus.value = status
      showStatusDropdown.value = false
    }

    const openModal = (mode, user = null) => {
      modalState.value = { isOpen: true, mode, user }
    }

    const closeModal = () => {
      modalState.value = { isOpen: false, mode: null, user: null }
    }

    const handleSaveUser = (userData) => {
      if (modalState.value.mode === 'add') {
        usersStore.addUser(userData)
      } else if (modalState.value.mode === 'edit') {
        usersStore.updateUser(userData.id, userData)
      }
      closeModal()
    }

    const toggleUserStatus = (user) => {
      const newStatus = user.status === 'Active' ? 'Blocked' : 'Active'
      const action = newStatus === 'Blocked' ? 'block' : 'activate'

      if (confirm(`Are you sure you want to ${action} "${user.name}"?`)) {
        usersStore.toggleUserStatus(user.id)
      }
    }

    const deleteUser = (user) => {
      if (
        confirm(`Are you sure you want to delete "${user.name}"? This action cannot be undone.`)
      ) {
        usersStore.deleteUser(user.id)
      }
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    }

    const getAvatarColor = (id) => {
      const colors = [
        'bg-blue-500',
        'bg-green-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-indigo-500',
        'bg-red-500',
        'bg-yellow-500',
        'bg-teal-500',
      ]
      return colors[id % colors.length]
    }

    return {
      searchQuery,
      selectedRole,
      selectedStatus,
      showRoleDropdown,
      showStatusDropdown,
      roles,
      statuses,
      users: computed(() => usersStore.users),
      filteredUsers,
      activeUsers,
      adminUsers,
      blockedUsers,
      modalState,
      toggleRoleDropdown,
      toggleStatusDropdown,
      selectRole,
      selectStatus,
      openModal,
      closeModal,
      handleSaveUser,
      toggleUserStatus,
      deleteUser,
      formatDate,
      getAvatarColor,
    }
  },
}
</script>

<style scoped>
/* Custom scrollbar for table */
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
