<template>
  <div><NavigationBar /></div>
  <div class="min-h-screen bg-gray-50 p-6 ml-[250px] mt-10">
    <div class="mx-auto">
      <!-- Breadcrumb -->
      <div class="flex items-center text-sm text-gray-600 mb-4">
        <i class="pi pi-home text-gray-400"></i>
        <span class="mx-2">/</span>
        <span>Settings</span>
      </div>

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p class="text-gray-600">Manage your account profile, password, and preferences.</p>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Left column: password -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Change Password Card -->
          <div class="bg-white rounded-lg shadow-sm p-8">
            <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div>
                <p class="text-xs uppercase tracking-wide text-gray-500">Security</p>
                <h2 class="text-xl font-bold text-gray-900">Change Password</h2>
              </div>
            </div>

            <div class="space-y-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  v-model="passwordForm.current"
                  type="password"
                  placeholder="Enter current password"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    v-model="passwordForm.newPassword"
                    type="password"
                    placeholder="Enter new password"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2"
                    >Confirm New Password</label
                  >
                  <input
                    v-model="passwordForm.confirm"
                    type="password"
                    placeholder="Re-enter new password"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <!-- Error Message -->
              <div v-if="passwordError" class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {{ passwordError }}
              </div>

              <!-- Success Message -->
              <div v-if="passwordMessage" class="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                {{ passwordMessage }}
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
              <button
                @click="resetPasswordForm"
                :disabled="isUpdatingPassword"
                class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
              <button
                @click="updatePassword"
                :disabled="isUpdatingPassword"
                class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <i v-if="isUpdatingPassword" class="pi pi-spin pi-spinner"></i>
                <span>{{ isUpdatingPassword ? 'Updating...' : 'Update Password' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Right column: danger zone -->
        <div class="space-y-6">
          <!-- Danger Zone -->
          <div class="bg-white rounded-lg shadow-sm p-8 border border-red-200">
            <div class="flex items-center justify-between mb-6 pb-4 border-b border-red-100">
              <div>
                <p class="text-xs uppercase tracking-wide text-red-500">Danger</p>
                <h2 class="text-xl font-bold text-red-600">Danger Zone</h2>
              </div>
            </div>

            <div class="space-y-4">
              <div class="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h3 class="font-semibold text-gray-900">Disable Account</h3>
                  <p class="text-sm text-gray-600">Temporarily disable your account. You can reactivate it anytime.</p>
                </div>
                <button
                  @click="disableAccount"
                  class="px-4 py-2 border border-yellow-300 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors font-medium whitespace-nowrap"
                >
                  Disable
                </button>
              </div>

              <div class="flex items-center justify-between py-3">
                <div>
                  <h3 class="font-semibold text-gray-900">Delete Account</h3>
                  <p class="text-sm text-gray-600">Permanently delete your account and all associated data. This cannot be undone.</p>
                </div>
                <button
                  @click="deleteAccount"
                  class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium whitespace-nowrap"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import NavigationBar from '../../components/Admin/NavigationBar.vue'
import { blockUser, deleteUser, changePassword } from '../../services/api'

export default {
  name: 'SettingsPage',
  components: {
    NavigationBar,
  },
  setup() {
    const router = useRouter()
    const { currentUser, logout } = useAuth()
    
    const passwordForm = ref({
      current: '',
      newPassword: '',
      confirm: '',
    })

    const isUpdatingPassword = ref(false)
    const passwordMessage = ref('')
    const passwordError = ref('')

    const handleLogout = () => {
      if (confirm('Are you sure you want to logout?')) {
        // Clear authentication data
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        localStorage.removeItem('userRole')
        
        // Redirect to login page
        router.push('/loginPage')
      }
    }

    const resetPasswordForm = () => {
      passwordForm.value = { current: '', newPassword: '', confirm: '' }
      passwordMessage.value = ''
      passwordError.value = ''
    }

    const updatePassword = async () => {
      passwordError.value = ''
      passwordMessage.value = ''

      if (
        !passwordForm.value.current ||
        !passwordForm.value.newPassword ||
        !passwordForm.value.confirm
      ) {
        passwordError.value = 'Please fill in all password fields'
        return
      }
      if (passwordForm.value.newPassword !== passwordForm.value.confirm) {
        passwordError.value = 'New passwords do not match'
        return
      }

      if (passwordForm.value.newPassword.length < 3) {
        passwordError.value = 'Password must be at least 3 characters long'
        return
      }

      try {
        isUpdatingPassword.value = true
        const message = await changePassword(passwordForm.value.current, passwordForm.value.newPassword)
        passwordMessage.value = message
        resetPasswordForm()
        alert('Password changed successfully. Please log in again.')
      } catch (err: any) {
        passwordError.value = err.message || 'Failed to change password. Please try again.'
      } finally {
        isUpdatingPassword.value = false
      }
    }

    const disableAccount = async () => {
      if (
        confirm(
          'Are you sure you want to disable your account? You can reactivate it anytime by logging in.',
        )
      ) {
        try {
          if (!currentUser.value?.id) {
            alert('User ID not found. Please log in again.')
            return
          }
          await blockUser(currentUser.value.id)
          alert('Your account has been disabled. You can reactivate it by logging in.')
          logout()
          router.push('/loginPage')
        } catch (err: any) {
          alert(err?.message || 'Failed to disable account')
        }
      }
    }

    const deleteAccount = async () => {
      const confirmation = prompt('This action cannot be undone. Type "DELETE MY ACCOUNT" to confirm:')
      if (confirmation === 'DELETE MY ACCOUNT') {
        try {
          if (!currentUser.value?.id) {
            alert('User ID not found. Please log in again.')
            return
          }
          await deleteUser(currentUser.value.id)
          
          // Clear authentication data
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
          localStorage.removeItem('userRole')
          
          alert('Your account has been permanently deleted.')
          router.push('/loginPage')
        } catch (err: any) {
          alert(err?.message || 'Failed to delete account')
        }
      } else if (confirmation !== null) {
        alert('Account deletion cancelled. Please type the exact phrase to confirm.')
      }
    }

    return {
      passwordForm,
      isUpdatingPassword,
      passwordMessage,
      passwordError,
      handleLogout,
      resetPasswordForm,
      updatePassword,
      disableAccount,
      deleteAccount,
    }
  },
}
</script>

<style scoped>
/* Additional styles if needed */
</style>
