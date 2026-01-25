<template>
  <NavigationBar />
  <div class="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto mt-6">

      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
        <p class="text-gray-600">Manage your password and account preferences.</p>
      </div>

      <!-- Change Password Card -->
      <div class="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-6">
        <div class="mb-6 pb-4 border-b border-gray-200">
          <p class="text-xs uppercase tracking-wide text-gray-500 font-semibold">Security</p>
          <h2 class="text-xl font-bold text-gray-900 mt-1">Change Password</h2>
        </div>

        <!-- Error Message -->
        <div v-if="passwordError" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {{ passwordError }}
        </div>

        <!-- Success Message -->
        <div v-if="passwordMessage" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {{ passwordMessage }}
        </div>

        <div class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <input
              v-model="passwordForm.current"
              type="password"
              placeholder="Enter current password"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="Enter new password"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <input
                v-model="passwordForm.confirm"
                type="password"
                placeholder="Re-enter new password"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
          <button
            @click="resetPasswordForm"
            :disabled="isUpdatingPassword"
            class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
          <button
            @click="updatePassword"
            :disabled="isUpdatingPassword"
            class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <i v-if="isUpdatingPassword" class="pi pi-spin pi-spinner"></i>
            <span>{{ isUpdatingPassword ? 'Updating...' : 'Update Password' }}</span>
          </button>
        </div>
      </div>

      <!-- Danger Zone Card -->
      <div class="bg-white rounded-lg shadow-sm p-6 sm:p-8 border border-red-200">
        <div class="mb-6 pb-4 border-b border-red-100">
          <p class="text-xs uppercase tracking-wide text-red-500 font-semibold">Danger Zone</p>
          <h2 class="text-xl font-bold text-red-600 mt-1">Account Management</h2>
        </div>

        <div class="space-y-4">
          <!-- Disable Account -->
          <div class="flex items-center justify-between py-4 border-b border-gray-100">
            <div>
              <h3 class="font-semibold text-gray-900">Disable Account</h3>
              <p class="text-sm text-gray-600 mt-1">Temporarily disable your account. You can reactivate it anytime.</p>
            </div>
            <button
              @click="disableAccount"
              class="px-4 py-2 border border-yellow-300 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors font-medium whitespace-nowrap"
            >
              Disable
            </button>
          </div>

          <!-- Delete Account -->
          <div class="flex items-center justify-between py-4">
            <div>
              <h3 class="font-semibold text-gray-900">Delete Account</h3>
              <p class="text-sm text-gray-600 mt-1">Permanently delete your account and all associated data. This cannot be undone.</p>
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
  <FooterPage />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import NavigationBar from '@/components/client/NavigationBar.vue'
import FooterPage from '@/components/client/FooterPage.vue'
import { blockUser, deleteUser, changePassword } from '@/services/api'

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

const resetPasswordForm = () => {
  passwordForm.value = {
    current: '',
    newPassword: '',
    confirm: '',
  }
  passwordMessage.value = ''
  passwordError.value = ''
}

const updatePassword = async () => {
  passwordError.value = ''
  passwordMessage.value = ''

  if (!passwordForm.value.current || !passwordForm.value.newPassword || !passwordForm.value.confirm) {
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
  const confirmation = confirm(
    'Are you sure you want to disable your account? You can reactivate it anytime by logging in.',
  )
  if (confirmation && currentUser.value?.id) {
    try {
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
  const confirmation = prompt(
    'This action cannot be undone. All your data will be permanently deleted. Type "DELETE MY ACCOUNT" to confirm:',
  )
  if (confirmation === 'DELETE MY ACCOUNT' && currentUser.value?.id) {
    try {
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
</script>

<style scoped>
/* Additional styles if needed */
</style>
