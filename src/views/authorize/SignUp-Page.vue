<template>
  <div class="min-h-screen w-screen flex">
    <div class="hidden md:flex md:w-[40%] bg-black sticky top-0 h-screen">
      <img :src="poster1" alt="Poster" class="w-full h-full object-cover" />
    </div>

    <div
      class="w-full md:w-[60%] flex items-start justify-center p-6 md:p-16 bg-white overflow-y-vertical"
    >
      <div class="w-full max-w-xl">
        <div class="text-center md:text-left mt-8 md:mt-0">
          <h1 class="text-4xl md:text-5xl font-lobster text-gray-900">Welcome To Our Store</h1>
          <p class="text-gray-400 mt-2">Please enter your details</p>
        </div>

        <form @submit.prevent="onSubmit" class="mt-8 space-y-6">
          <!-- Error Message -->
          <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {{ error }}
          </div>

          <!-- Full Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              v-model="fullName"
              type="text"
              placeholder="Enter your full name"
              class="mt-2 w-full border border-gray-200 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
          </div>

          <!-- Phone Number -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              v-model="phone"
              type="tel"
              placeholder="Enter your phone number"
              class="mt-2 w-full border border-gray-200 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              v-model="email"
              type="email"
              placeholder="Enter your email"
              class="mt-2 w-full border border-gray-200 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Create Password</label>
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              class="mt-2 w-full border border-gray-200 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Confirm your Password</label>
            <input
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Confirm your password"
              class="mt-2 w-full border border-gray-200 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
          </div>

          <div class="flex items-center">
            <label class="inline-flex items-center text-sm text-gray-600">
              <input type="checkbox" class="mr-2" v-model="showPassword" /> Show Password
            </label>
          </div>

          <button
            type="submit"
            class="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-md font-semibold transition"
          >
            Sign Up
          </button>

          <p class="text-center text-sm text-gray-700">
            Already have an account?
            <router-link to="/LoginPage" class="text-indigo-600 hover:underline"
              >Log In here</router-link
            >
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import poster1 from '@/assets/poster1.png'

const router = useRouter()
const email = ref('')
const fullName = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const error = ref('')

const onSubmit = () => {
  error.value = ''

  if (
    !fullName.value ||
    !phone.value ||
    !email.value ||
    !password.value ||
    !confirmPassword.value
  ) {
    error.value = 'Please fill in all fields'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  // Save user info
  localStorage.setItem('userEmail', email.value)
  localStorage.setItem(
    'userProfile',
    JSON.stringify({
      fullName: fullName.value,
      email: email.value,
      phoneNumber: phone.value,
      gender: 'Not specified',
      country: 'Not specified',
    }),
  )
  localStorage.setItem('hasAccount', 'true')

  // Redirect to login
  router.push('/LoginPage')
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Lobster&display=swap');
.font-lobster {
  font-family: 'Lobster', cursive;
}
#app {
  max-width: none !important;
  width: 100% !important;
}
</style>
