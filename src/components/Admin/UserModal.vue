<template>
  <div
    class="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div
        class="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white"
      >
        <h2 class="text-2xl font-bold text-gray-900">
          {{ modalTitle }}
        </h2>
        <button @click="close" class="text-gray-400 hover:text-gray-600 transition-colors">
          <i class="pi pi-times text-xl"></i>
        </button>
      </div>

      <div class="p-6">
        <!-- View Mode - Basic Personal Information -->
        <div v-if="isViewMode" class="space-y-4">
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
        </div>

        <!-- Edit/Add Mode - Form -->
        <div v-else class="space-y-4">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"> Full Name * </label>
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
            <label class="block text-sm font-medium text-gray-700 mb-2"> Email Address * </label>
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
            <label class="block text-sm font-medium text-gray-700 mb-2"> Password * </label>
            <input
              v-model="formData.password"
              type="password"
              placeholder="Enter password"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"> Phone Number </label>
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
            <label class="block text-sm font-medium text-gray-700 mb-2"> Address </label>
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
              <label class="block text-sm font-medium text-gray-700 mb-2"> Role </label>
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
              <label class="block text-sm font-medium text-gray-700 mb-2"> Status </label>
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
            <label class="block text-sm font-medium text-gray-700 mb-2"> Joined Date </label>
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
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface UserLike {
  id?: any
  backend_id?: any
  name?: string
  email?: string
  role?: string
  status?: string
  phone?: string
  address?: string
  joinedDate?: string
  total_orders?: number
  total_spent?: any
  last_order_date?: string
  recent_orders?: any[]
  recent_activity?: any[]
  password?: string
}

const props = defineProps<{ user: UserLike | null; mode: string }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: UserLike): void
}>()

const isViewMode = computed(() => props.mode === 'view')

const createFormFromProps = (p: UserLike | null) => {
  if (!p) {
    return {
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
      last_order_date: null,
    }
  }
  return {
    ...p,
    total_orders: p.total_orders || Math.floor(Math.random() * 20),
    total_spent: p.total_spent || (Math.random() * 1000).toFixed(2),
    last_order_date: p.last_order_date || new Date().toISOString().split('T')[0],
    recent_orders: p.recent_orders || [
      {
        id: 'ORD-001',
        date: new Date().toISOString().split('T')[0],
        amount: 89.99,
        status: 'delivered',
      },
    ],
    recent_activity: p.recent_activity || [
      { action: 'Placed order #ORD-001', timestamp: new Date().toLocaleString() },
    ],
  }
}

const formData = ref<UserLike>(createFormFromProps(props.user))

watch(
  () => props.user,
  (next) => {
    formData.value = createFormFromProps(next)
  },
  { immediate: true },
)

const modalTitle = computed(() =>
  props.mode === 'view' ? 'User Details' : props.mode === 'edit' ? 'Edit User' : 'Add New User',
)

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

const close = () => emit('close')
</script>
