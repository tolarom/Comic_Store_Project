<template>
  <NavigationBar></NavigationBar>
  <div class="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
    <div class="max-w-5xl mx-auto">
      <h1 class="text-4xl font-bold text-blue-600 mb-12">My Profile</h1>

      <div class="grid md:grid-cols-2 gap-10 items-start">
        <!-- Left: Avatar + Buttons -->
        <div class="flex flex-col items-center">
          <div class="relative">
            <img
              :src="
                fullUserData?.image_url || 'https://via.placeholder.com/300x300.png?text=Profile+Picture'
              "
              alt="Profile"
              class="w-64 h-64 rounded-full object-cover border-8 border-white shadow-2xl"
            />
          </div>

          <div class="mt-8 space-y-4 w-48">
            <button
              @click="goToEditProfile"
              class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Edit Profile
            </button>
            <button
              @click="logout"
              class="w-full py-3 border border-red-500 text-red-600 rounded-lg font-medium hover:bg-red-50 transition"
            >
              Log out
            </button>
          </div>
        </div>

        <!-- Right: User Information Card (View Only) -->
        <div class="bg-white rounded-2xl shadow-xl p-10">
          <h2 class="text-2xl font-bold text-blue-600 mb-8">User Information</h2>

          <div v-if="!isLoading && fullUserData" class="space-y-6 text-lg">
            <div class="flex justify-between py-3 border-b border-gray-300">
              <span class="font-medium text-gray-600">Name:</span>
              <span class="font-semibold">{{ fullUserData.full_name }}</span>
            </div>
            <div class="flex justify-between py-3 border-b border-gray-300">
              <span class="font-medium text-gray-600">Username:</span>
              <span class="font-semibold">{{ fullUserData.username }}</span>
            </div>
            <div class="flex justify-between py-3 border-b border-gray-300">
              <span class="font-medium text-gray-600">Email:</span>
              <span class="font-semibold">{{ fullUserData.email }}</span>
            </div>
            <div class="flex justify-between py-3 border-b border-gray-300">
              <span class="font-medium text-gray-600">Phone Number:</span>
              <span class="font-semibold">{{ fullUserData.phone || 'Not provided' }}</span>
            </div>
            <div class="flex justify-between py-3 border-b border-gray-300">
              <span class="font-medium text-gray-600">Gender:</span>
              <span class="font-semibold capitalize">{{ fullUserData.gender || 'Not provided' }}</span>
            </div>
            <div class="flex justify-between py-3 border-b border-gray-300">
              <span class="font-medium text-gray-600">Country:</span>
              <span class="font-semibold">{{ fullUserData.country || 'Not provided' }}</span>
            </div>
            <div class="flex justify-between py-3">
              <span class="font-medium text-gray-600">Address:</span>
              <span class="font-semibold text-right">{{ fullUserData.address || 'Not provided' }}</span>
            </div>
            <div class="flex justify-between py-3 border-t border-gray-300">
              <span class="font-medium text-gray-600">Role:</span>
              <span class="font-semibold capitalize px-3 py-1 bg-blue-100 text-blue-800 rounded-full">{{ fullUserData.role }}</span>
            </div>
          </div>

          <div v-else class="text-center py-12">
            <p class="text-gray-500">{{ isLoading ? 'Loading user information...' : 'No user data available' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import NavigationBar from '../../components/client/NavigationBar.vue'
import { logout as apiLogout, getUserById } from '../../services/api'

const router = useRouter()
const { currentUser: user } = useAuth()
const fullUserData = ref(user.value)
const isLoading = ref(false)

const fetchFullUserProfile = async () => {
  if (!user.value?.id) return

  try {
    isLoading.value = true
    const userProfile = await getUserById(user.value.id)
    fullUserData.value = userProfile
  } catch (err) {
    console.error('Failed to fetch full user profile:', err)
    // Use the basic user data from auth if fetch fails
    fullUserData.value = user.value
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchFullUserProfile()
})

const goToEditProfile = () => {
  router.push({ name: 'EditProfile' })
}

const logout = () => {
  apiLogout()
  router.push({ name: 'LoginPage' })
}
</script>

<style scoped>
button:hover {
  transform: translateY(-1px);
}
</style>
