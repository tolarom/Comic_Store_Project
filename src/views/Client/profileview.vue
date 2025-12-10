<template>
    <NavigationBar></NavigationBar>
  <div class="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
    <div class="max-w-5xl mx-auto">
      <h1 class="text-4xl font-bold text-blue-600 text-center mb-12">My Profile</h1>

      <div class="grid md:grid-cols-2 gap-10 items-start">
        <!-- Left: Avatar + Buttons -->
        <div class="flex flex-col items-center">
          <div class="relative">
            <img
              src="https://randomuser.me/api/portraits/men/75.jpg"
              alt="Profile"
              class="w-64 h-64 rounded-full object-cover border-8 border-white shadow-2xl"
            />
            <button
              class="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition"
              title="Change avatar"
            >
              <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          <div class="mt-8 space-y-4 w-48">
            <button class="w-full py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition">
              Edit
            </button>
            <button
              @click="logout"
              class="w-full py-3 border border-red-500 text-red-600 rounded-lg font-medium hover:bg-red-50 transition"
            >
              Log out
            </button>
          </div>
        </div>

        <!-- Right: User Information Card -->
        <div class="bg-gray-100 rounded-2xl shadow-xl p-10">
          <h2 class="text-2xl font-bold text-blue-600 mb-8">User Information</h2>

          <div class="space-y-6 text-lg">
            <div class="flex justify-between py-3 border-b border-gray-300">
              <span class="font-medium text-gray-600">Name:</span>
              <span class="font-semibold">Rom Tola</span>
            </div>
            <div class="flex justify-between py-3 border-b border-gray-300">
              <span class="font-medium text-gray-600">Email:</span>
              <span class="font-semibold">tolarom@gmail.com</span>
            </div>
            <div class="flex justify-between py-3 border-b border-gray-300">
              <span class="font-medium text-gray-600">Phone Number:</span>
              <span class="font-semibold">0123456789</span>
            </div>
            <div class="flex justify-between py-3 border-b border-gray-300">
              <span class="font-medium text-gray-600">Gender:</span>
              <span class="font-semibold">Male</span>
            </div>
            <div class="flex justify-between py-3">
              <span class="font-medium text-gray-600">Country:</span>
              <span class="font-semibold">Cambodia</span>
            </div>
          </div>

          <div class="mt-10 text-right">
            <button class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md">
              Edit Information
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import NavigationBar from '@/components/client/NavigationBar.vue'

const router = useRouter()

const logout = () => {
  // Clear user session (example)
  localStorage.removeItem('token')
  localStorage.removeItem('user')

  // Redirect to home or login
  router.push('/')
}
</script>

<style scoped>
/* Optional: add subtle animation on hover */
button:hover {
  transform: translateY(-1px);
}
</style>