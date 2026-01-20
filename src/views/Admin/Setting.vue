<template>
  <div><Header /></div>
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
            </div>

            <div class="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
              <button
                @click="resetPasswordForm"
                class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
              <button
                @click="updatePassword"
                class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>

        <!-- Right column: account settings + danger -->
        <div class="space-y-6">
          <!-- Account Settings -->
          <div class="bg-white rounded-lg shadow-sm p-8">
            <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div>
                <p class="text-xs uppercase tracking-wide text-gray-500">Preferences</p>
                <h2 class="text-xl font-bold text-gray-900">Account Settings</h2>
              </div>
            </div>

            <div class="space-y-4">
              <div class="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h3 class="font-semibold text-gray-900">Email Notifications</h3>
                  <p class="text-sm text-gray-600">Updates about activity on your account</p>
                </div>
                <button
                  @click="toggleSetting('emailNotifications')"
                  :class="[
                    'relative w-14 h-7 rounded-full transition-colors',
                    accountSettings.emailNotifications ? 'bg-blue-600' : 'bg-gray-300',
                  ]"
                >
                  <span
                    :class="[
                      'absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform',
                      accountSettings.emailNotifications ? 'right-0.5' : 'left-0.5',
                    ]"
                  ></span>
                </button>
              </div>

              <div class="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h3 class="font-semibold text-gray-900">Marketing Emails</h3>
                  <p class="text-sm text-gray-600">Product news and feature updates</p>
                </div>
                <button
                  @click="toggleSetting('marketingEmails')"
                  :class="[
                    'relative w-14 h-7 rounded-full transition-colors',
                    accountSettings.marketingEmails ? 'bg-blue-600' : 'bg-gray-300',
                  ]"
                >
                  <span
                    :class="[
                      'absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform',
                      accountSettings.marketingEmails ? 'right-0.5' : 'left-0.5',
                    ]"
                  ></span>
                </button>
              </div>

              <div class="flex items-center justify-between py-3">
                <div>
                  <h3 class="font-semibold text-gray-900">Two-Factor Authentication</h3>
                  <p class="text-sm text-gray-600">Add an extra layer of security</p>
                </div>
                <button
                  @click="toggleSetting('twoFactorAuth')"
                  :class="[
                    'relative w-14 h-7 rounded-full transition-colors',
                    accountSettings.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-300',
                  ]"
                >
                  <span
                    :class="[
                      'absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform',
                      accountSettings.twoFactorAuth ? 'right-0.5' : 'left-0.5',
                    ]"
                  ></span>
                </button>
              </div>
            </div>

            <!-- Logout Button -->
            <div class="mt-6 pt-6 border-t border-gray-200">
              <button
                @click="handleLogout"
                class="w-full px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <i class="pi pi-sign-out"></i>
                Logout
              </button>
            </div>
          </div>

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
                  <h3 class="font-semibold text-gray-900">Deactivate Account</h3>
                  <p class="text-sm text-gray-600">Temporarily disable your account</p>
                </div>
                <button
                  @click="deactivateAccount"
                  class="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Deactivate
                </button>
              </div>

              <div class="flex items-center justify-between py-3">
                <div>
                  <h3 class="font-semibold text-gray-900">Delete Account</h3>
                  <p class="text-sm text-gray-600">Permanently delete your account and data</p>
                </div>
                <button
                  @click="deleteAccount"
                  class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Header from '../../components/Admin/NavigationBar.vue'

export default {
  name: 'SettingsPage',
  components: {
    Header,
  },
  setup() {
    const router = useRouter()
    
    const accountSettings = ref({
      emailNotifications: true,
      marketingEmails: true,
      twoFactorAuth: false,
    })

    const passwordForm = ref({
      current: '',
      newPassword: '',
      confirm: '',
    })

    const toggleSetting = (setting) => {
      accountSettings.value[setting] = !accountSettings.value[setting]
    }

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
    }

    const updatePassword = () => {
      if (
        !passwordForm.value.current ||
        !passwordForm.value.newPassword ||
        !passwordForm.value.confirm
      ) {
        alert('Please fill in all password fields')
        return
      }
      if (passwordForm.value.newPassword !== passwordForm.value.confirm) {
        alert('New passwords do not match')
        return
      }

      // API call to update password
      console.log('Updating password')
      alert('Password updated successfully')
      resetPasswordForm()
    }

    const deactivateAccount = () => {
      if (
        confirm(
          'Are you sure you want to deactivate your account? You can reactivate it anytime by logging in.',
        )
      ) {
        console.log('Deactivating account...')
        alert('Account deactivated')
      }
    }

    const deleteAccount = () => {
      const confirmation = prompt('This action cannot be undone. Type "DELETE" to confirm:')
      if (confirmation === 'DELETE') {
        console.log('Deleting account...')
        alert('Account deletion initiated')
      }
    }

    return {
      accountSettings,
      passwordForm,
      toggleSetting,
      handleLogout,
      resetPasswordForm,
      updatePassword,
      deactivateAccount,
      deleteAccount,
    }
  },
}
</script>

<style scoped>
/* Additional styles if needed */
</style>
