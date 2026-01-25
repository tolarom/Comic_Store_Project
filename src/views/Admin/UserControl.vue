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
      <div v-if="lastApiError" class="mb-4">
        <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          <strong class="font-semibold">API Error:</strong>
          <span class="block text-sm">{{ lastApiError }}</span>
        </div>
      </div>
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

<script lang="ts">
import { ref, computed, onMounted } from 'vue'
import Header from '../../components/Admin/NavigationBar.vue'
import UserModal from '@/components/Admin/UserModal.vue'
import {
  getAllUsers as apiGetAllUsers,
  getUserById as apiGetUserById,
  register as apiRegister,
  updateUser as apiUpdateUser,
  deleteUser as apiDeleteUser,
  blockUser as apiBlockUser,
  activateUser as apiActivateUser,
  updateUserActive as apiUpdateUserActive,
} from '@/services/api'

// UserModal is implemented as a separate SFC to ensure template compilation

export default {
  name: 'UserControl',
  components: {
    UserModal,
    Header,
  },
  setup() {
    const users = ref([])
    const loading = ref(false)
    const error = ref(null)
    const lastApiError = ref(null)

    const normalizeId = (raw) => {
      if (!raw) return null
      if (typeof raw === 'string') return raw
      if (typeof raw === 'object') {
        if (raw.$oid) return raw.$oid
        if (raw['$oid']) return raw['$oid']
        if (raw.id) return raw.id
        try {
          return String(raw)
        } catch {
          return null
        }
      }
      return String(raw)
    }

    // Local persistence for status overrides when backend does not expose status
    const STATUS_OVERRIDES_KEY = 'userStatusOverrides'

    const readStatusOverrides = () => {
      try {
        const raw = localStorage.getItem(STATUS_OVERRIDES_KEY)
        return raw ? JSON.parse(raw) : {}
      } catch {
        return {}
      }
    }

    const writeStatusOverrides = (obj) => {
      try {
        localStorage.setItem(STATUS_OVERRIDES_KEY, JSON.stringify(obj))
      } catch (e) {
        console.warn('Failed to write status overrides', e)
      }
    }

    const setStatusOverride = (key, status) => {
      const o = readStatusOverrides()
      if (status === 'Active') {
        delete o[key]
      } else {
        o[key] = status
      }
      writeStatusOverrides(o)
    }

    const getStatusOverride = (key) => {
      const o = readStatusOverrides()
      return o[key]
    }

    const formatApiError = (e) => {
      try {
        if (!e) return 'Unknown error'
        if (e.response) {
          const status = e.response.status
          const data = e.response.data
          return `HTTP ${status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`
        }
        return e.message || String(e)
      } catch (err) {
        return String(err)
      }
    }

    const loadUsers = async () => {
      loading.value = true
      error.value = null
      try {
        const resp = await apiGetAllUsers()
        // normalize backend users into expected UI fields
        users.value = (resp || []).map((u, idx) => ({
          id: idx + 1,
          backend_id: normalizeId(u._id) || normalizeId(u.id) || null,
          name: u.full_name || u.username || 'Unknown',
          email: u.email || '',
          role: u.role && (u.role === 'admin' || u.role === 'Admin') ? 'Admin' : 'Customer',
          // Normalize status from backend (support `status` or `active`, various casing)
          status: (() => {
            const s = u.status ?? u.active ?? ''
            const base = !s ? 'Active' : (String(s).toLowerCase() === 'blocked' ? 'Blocked' : 'Active')
            // apply persisted override if present (keyed by backend id when available)
            const key = normalizeId(u._id) || normalizeId(u.id) || `local:${idx + 1}`
            const override = getStatusOverride(key)
            return override || base
          })(),
          phone: u.phone || '',
          address: u.address || '',
          joinedDate: u.created_at
            ? new Date(u.created_at).toISOString().split('T')[0]
            : u.joinedDate || new Date().toISOString().split('T')[0],
        }))
      } catch (e) {
        console.error('Failed to load users from API', e)
        error.value = e
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      void loadUsers()
    })
    const searchQuery = ref('')
    const selectedRole = ref('All Roles')
    const selectedStatus = ref('All Status')
    const showRoleDropdown = ref(false)
    const showStatusDropdown = ref(false)
    const modalState = ref({ isOpen: false, mode: null, user: null })

    const roles = ref(['All Roles', 'Customer', 'Admin'])
    const statuses = ref(['All Status', 'Active', 'Blocked'])

    const filteredUsers = computed(() => {
      let filtered = users.value

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

    const activeUsers = computed(() => users.value.filter((u) => u.status === 'Active').length)
    const adminUsers = computed(() => users.value.filter((u) => u.role === 'Admin').length)
    const blockedUsers = computed(() => users.value.filter((u) => u.status === 'Blocked').length)

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

    const openModal = async (mode, user = null) => {
      // mode 'add' doesn't need backend fetch
      if (!user || mode === 'add') {
        modalState.value = { isOpen: true, mode, user }
        return
      }

      // Try to fetch full details from backend when possible
      const backendId = normalizeId(user.backend_id) || normalizeId(user.id)
      if (backendId) {
        try {
          const apiUser = await apiGetUserById(String(backendId))
          // map backend user to UI shape expected by modal
          const mapped = {
            id: user.id || null,
            backend_id: normalizeId(apiUser._id) || normalizeId(apiUser.id) || null,
            name: apiUser.full_name || apiUser.username || user.name,
            email: apiUser.email || user.email,
            role: apiUser.role && (apiUser.role === 'admin' || apiUser.role === 'Admin') ? 'Admin' : 'Customer',
            status: apiUser.active && apiUser.active.toLowerCase() === 'blocked' ? 'Blocked' : 'Active',
            phone: apiUser.phone || user.phone || '',
            address: apiUser.address || user.address || '',
            joinedDate: apiUser.created_at ? new Date(apiUser.created_at).toISOString().split('T')[0] : (user.joinedDate || new Date().toISOString().split('T')[0]),
            // detail-only fields for the modal
            total_orders: (apiUser && apiUser.total_orders) || user.total_orders || Math.floor(Math.random() * 20),
            total_spent: (apiUser && apiUser.total_spent) || user.total_spent || (Math.random() * 1000).toFixed(2),
            last_order_date: (apiUser && apiUser.last_order_date) || user.last_order_date || null,
            recent_orders: (apiUser && apiUser.recent_orders) || user.recent_orders || [],
            recent_activity: (apiUser && apiUser.recent_activity) || user.recent_activity || [],
          }
          // apply any persisted override for this backend id
          const overrideKey = mapped.backend_id || mapped.id || null
          if (overrideKey) {
            const ov = getStatusOverride(overrideKey)
            if (ov) mapped.status = ov
          }
          modalState.value = { isOpen: true, mode, user: mapped }
          return
        } catch (e) {
          console.warn('Failed to fetch user details from API, falling back to local user object', e)
        }
      }

      // fallback: open modal with local/user-provided data
      modalState.value = { isOpen: true, mode, user }
    }

    const closeModal = () => {
      modalState.value = { isOpen: false, mode: null, user: null }
    }

    const handleSaveUser = async (userData) => {
      try {
        if (modalState.value.mode === 'add') {
          // map UI fields to backend create user fields
          const payload = {
            username: (userData.email || '').split('@')[0],
            email: userData.email,
            password: userData.password || 'ChangeMe123!',
            full_name: userData.name,
            address: userData.address || '',
            phone: userData.phone || '',
            role: userData.role && userData.role === 'Admin' ? 'admin' : 'customer',
          }
          try {
            await apiRegister(payload)
            await loadUsers()
          } catch (e) {
            // fallback: add locally so UI reflects change
            console.warn('API create failed, falling back to local add', e)
            const newId = users.value.length ? Math.max(...users.value.map((u) => u.id)) + 1 : 1
            users.value.push({
              id: newId,
              backend_id: null,
              name: payload.full_name,
              email: payload.email,
              role: payload.role === 'admin' ? 'Admin' : 'Customer',
              status: 'Active',
              phone: payload.phone,
              address: payload.address,
              joinedDate: new Date().toISOString().split('T')[0],
            })
          }
        } else if (modalState.value.mode === 'edit') {
          // update backend user by backend_id
          const backendId = normalizeId(userData.backend_id)
          const updates = {
            full_name: userData.name,
            email: userData.email,
            address: userData.address,
            phone: userData.phone,
            role: userData.role && userData.role === 'Admin' ? 'admin' : 'customer',
          }

          if (backendId) {
            try {
              console.debug('API updateUser', { id: String(backendId), updates })
              await apiUpdateUser(String(backendId), updates)
              await loadUsers()
            } catch (e) {
              console.warn('API update failed, falling back to local update', e)
              const msg = formatApiError(e)
              console.error('updateUser error full:', e)
              lastApiError.value = msg
              try {
                alert('Update failed: ' + msg)
              } catch (err) {
                console.error('Error showing update alert', err)
              }
              // fallback: update local entry
              const idx = users.value.findIndex((u) => u.backend_id === backendId)
              if (idx !== -1) {
                users.value[idx] = {
                  ...users.value[idx],
                  ...{
                    name: userData.name,
                    email: userData.email,
                    address: userData.address,
                    phone: userData.phone,
                    role: userData.role === 'Admin' ? 'Admin' : 'Customer',
                  },
                }
              }
            }
          } else {
            // no backend id - just update locally
            const idx = users.value.findIndex((u) => u.id === userData.id)
            if (idx !== -1) {
              users.value[idx] = {
                ...users.value[idx],
                ...{
                  name: userData.name,
                  email: userData.email,
                  address: userData.address,
                  phone: userData.phone,
                  role: userData.role === 'Admin' ? 'Admin' : 'Customer',
                },
              }
            }
          }
        }

        // close modal
        closeModal()
      } catch (e) {
        console.error('Failed to save user', e)
        alert('Failed to save user')
      }
    }

    const toggleUserStatus = async (user) => {
      const newStatus = user.status === 'Active' ? 'Blocked' : 'Active'
      const action = newStatus === 'Blocked' ? 'block' : 'activate'

      if (!confirm(`Are you sure you want to ${action} "${user.name}"?`)) return

      // Normalize backend id (try both backend_id and id)
      const backendId = normalizeId(user.backend_id) || normalizeId(user.id)
      // API expects `active: 'active' | 'blocked'` (lowercase)
      const apiStatus = newStatus === 'Active' ? 'active' : 'blocked'

      const idx = users.value.findIndex((u) => u.id === user.id || normalizeId(u.backend_id) === normalizeId(user.backend_id))
      const previousStatus = idx !== -1 ? users.value[idx].status : null

      // Optimistic update
      if (idx !== -1) users.value[idx].status = newStatus

      try {
        // If no backend id, persist override locally and return
        if (!backendId) {
          const key = user.id ? `local:${user.id}` : `local:${idx + 1}`
          if (key) setStatusOverride(key, newStatus)
          return
        }

        // Try server endpoints in order of preference:
        // 1) POST /api/users/{id}/block or /activate
        // 2) PUT /api/users/{id} with { active: 'blocked'|'active' }
        // 3) PUT /api/users/{id} with { active: boolean }
        // 4) Fallback to legacy { status: 'Active'|'Blocked' }
        let succeeded = false

        try {
          if (newStatus === 'Blocked') {
            await apiBlockUser(String(backendId))
          } else {
            await apiActivateUser(String(backendId))
          }
          succeeded = true
        } catch (err) {
          console.warn('POST block/activate failed, will try PUT payloads', err)
        }

        if (!succeeded) {
          try {
            await apiUpdateUserActive(String(backendId), apiStatus)
            succeeded = true
          } catch (err) {
            console.warn('PUT { active: string } failed, trying boolean', err)
          }
        }

        if (!succeeded) {
          try {
            await apiUpdateUserActive(String(backendId), apiStatus === 'active')
            succeeded = true
          } catch (err) {
            console.warn('PUT { active: boolean } failed, trying legacy status field', err)
          }
        }

        if (!succeeded) {
          try {
            await apiUpdateUser(String(backendId), { status: newStatus })
            succeeded = true
          } catch (err) {
            console.warn('PUT { status } failed', err)
          }
        }

        if (succeeded) {
          const key = backendId || (user.id ? `local:${user.id}` : `local:${idx + 1}`)
          if (key) setStatusOverride(key, newStatus)
          if (idx !== -1) users.value[idx].status = newStatus
          return
        }

        throw new Error('All update attempts failed')
      } catch (e) {
        console.error('Failed to toggle user status', e)
        // revert optimistic change
        if (idx !== -1) users.value[idx].status = previousStatus
        const msg = formatApiError(e)
        lastApiError.value = msg
        try {
          alert('Failed to change user status: ' + msg)
        } catch (err) {
          console.error('Error showing toggle status alert', err)
        }
      }
    }

    const deleteUser = async (user) => {
      if (!confirm(`Are you sure you want to delete "${user.name}"? This action cannot be undone.`))
        return
      try {
        const backendId = normalizeId(user.backend_id)
        if (!backendId) throw new Error('Missing backend id')
        console.debug('API deleteUser', { id: backendId })
        await apiDeleteUser(String(backendId))
        // refresh
        await loadUsers()
      } catch (e) {
        console.error('Failed to delete user', e)
        const msg = formatApiError(e)
        lastApiError.value = msg
        try {
          console.error('deleteUser error full:', e)
          alert('Failed to delete user: ' + msg)
        } catch (err) {
          console.error('Error showing delete alert', err)
        }
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
      users: computed(() => users.value),
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
      loading,
      error,
      lastApiError,
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
