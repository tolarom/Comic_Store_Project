<template>
  <div class="h-screen w-screen flex overflow-hidden">
    <div class="hidden md:flex w-[40%] bg-black">
       <img :src="poster1" alt="Poster" class="w-full h-full object-cover" />
    </div>
    <!-- RIGHT SIDE (60%) -->
    <div class="w-full md:w-[60%] flex items-center justify-center p-6 md:p-12 bg-white">
      <div class="w-full max-w-xl">

        <!-- Title -->
        <div class="text-center md:text-left mt-2 md:mt-0">
          <h1 class="text-4xl md:text-5xl font-lobster text-gray-900">Welcome Back</h1>
          <p class="text-gray-500 py-5">Please enter your details</p>
        </div>

        <!-- FORM -->
        <form class="mt-3 space-y-6" @submit.prevent="onSubmit">
          <!-- Error Message -->
          <div v-if="errorMessage" class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {{ errorMessage }}
          </div>

          <!-- Email -->
          <div>
            <label class="text-sm font-medium text-gray-700">Email Address</label>
            <input
              v-model="email"
              type="email"
              placeholder="Enter your email"
              class="mt-2 w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
          </div>

          <!-- Password -->
          <div>
            <label class="text-sm font-medium text-gray-700">Password</label>
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              class="mt-2 w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
          </div>

          <!-- Show password -->
          <div class="flex items-center text-sm">
            <label class="flex items-center text-gray-600">
              <input type="checkbox" v-model="showPassword" class="mr-2" />
              Show Password
            </label>
          </div>

          <!-- Login button -->
          <button
            type="submit"
            class="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-lg text-lg transition"
          >
            Log In
          </button>

          <p class="text-center text-sm text-gray-700">
            Don't have an account?
            <router-link to="/SignUpPage" class="text-indigo-600 hover:underline">Sign Up here</router-link>
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
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')

const onSubmit = () => {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Please fill in all fields'
    return
  }

  // Save user info
  localStorage.setItem('authToken', 'mock-jwt-token-' + Date.now())
  localStorage.setItem('userEmail', email.value)

  // Redirect to home
  router.push('/')
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
