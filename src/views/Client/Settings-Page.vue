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
            class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Clear
          </button>
          <button
            @click="updatePassword"
            class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            Update Password
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
import NavigationBar from '@/components/client/NavigationBar.vue'
import FooterPage from '@/components/client/FooterPage.vue'

const router = useRouter()

const passwordForm = ref({
  current: '',
  newPassword: '',
  confirm: '',
})

const resetPasswordForm = () => {
  passwordForm.value = {
    current: '',
    newPassword: '',
    confirm: '',
  }
}

const updatePassword = () => {
  if (!passwordForm.value.current || !passwordForm.value.newPassword || !passwordForm.value.confirm) {
    alert('Please fill in all password fields')
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirm) {
    alert('New passwords do not match')
    return
  }

  if (passwordForm.value.newPassword.length < 8) {
    alert('Password must be at least 8 characters long')
    return
  }

  // Here you would typically make an API call to update the password
  console.log('Updating password...')
  alert('Password updated successfully!')
  resetPasswordForm()
}

const disableAccount = () => {
  const confirmation = confirm(
    'Are you sure you want to disable your account? You can reactivate it anytime by logging in.',
  )
  if (confirmation) {
    console.log('Disabling account...')
    alert('Your account has been disabled. You can reactivate it by logging in.')
    // Here you would typically make an API call to disable the account
    // Then redirect to home or login
    router.push('/')
  }
}

const deleteAccount = () => {
  const confirmation = prompt(
    'This action cannot be undone. All your data will be permanently deleted. Type "DELETE MY ACCOUNT" to confirm:',
  )
  if (confirmation === 'DELETE MY ACCOUNT') {
    console.log('Deleting account...')
    
    // Clear authentication data
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    
    alert('Your account has been permanently deleted.')
    // Redirect to home
    router.push('/')
  } else if (confirmation !== null) {
    alert('Account deletion cancelled. Please type the exact phrase to confirm.')
  }
}
</script>

<style scoped>
/* Additional styles if needed */
</style>
