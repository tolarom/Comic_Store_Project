<template>
  <div class="h-screen w-screen flex overflow-hidden">
    <div class="hidden md:flex md:w-[40%] bg-black">
      <img :src="poster1" alt="Poster" class="w-full h-full object-cover" />
    </div>

    <div class="w-full md:w-[60%] flex items-start justify-center p-6 md:p-16 bg-white">
      <div class="w-full max-w-xl">
        <div class="text-center md:text-left mt-8 md:mt-0">
          <h1 class="text-4xl md:text-5xl font-lobster text-gray-900">Welcome To Our Store</h1>
          <p class="text-gray-400 mt-2">Please enter your details</p>
        </div>

        <form @submit.prevent="onSubmit" class="mt-8 space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700">Email Address</label>
            <input v-model="email" type="email" placeholder="Enter your email"
                   class="mt-2 w-full border border-gray-200 rounded-md px-4 py-3" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Create Password</label>
            <input v-model="password" :type="showPassword? 'text':'password'"
                   placeholder="Enter your password"
                   class="mt-2 w-full border border-gray-200 rounded-md px-4 py-3" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Confirm your Password</label>
            <input v-model="confirmPassword" :type="showPassword? 'text':'password'"
                   placeholder="Enter your password"
                   class="mt-2 w-full border border-gray-200 rounded-md px-4 py-3" required />
          </div>

          <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

          <div class="flex items-center mt-1">
            <label class="inline-flex items-center text-sm text-gray-600">
              <input type="checkbox" class="mr-2" v-model="showPassword" /> Show Password
            </label>
          </div>

          <button type="submit" class="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-md font-semibold">
            Sign Up
          </button>

          <p class="text-center text-sm text-gray-700">
            Already have an account? <router-link to="/LoginPage" class="text-indigo-600">Log In here</router-link>
          </p>
             <!-- Divider -->
          <div class="mt-6 flex items-center">
            <div class="flex-1 border-t border-gray-300"></div>
            <span class="px-3 text-gray-400 text-sm">Or Log In With</span>
            <div class="flex-1 border-t border-gray-300"></div>
          </div>

          <div class="mt-6 flex justify-center gap-6">

            <!-- Google -->
            <button type="button" class="p-2 rounded-full hover:shadow">
              <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
                <path d="M44.5 20H24v8.5h11.9C34.6 32.9 30
                36 24 36c-7.7 0-14-6.3-14-14s6.3-14
                14-14c3.6 0 6.8 1.3 9.3 3.5l6.6-6.6C36.7
                2.8 30.7 0 24 0 10.7 0 0 10.7 0
                24s10.7 24 24 24c12 0 23-8.5
                23.9-20.4.1-1.3.1-2.6.1-3.6z"
                fill="#EA4335"/>
              </svg>
            </button>

            <!-- Facebook -->
            <button type="button" class="p-2 rounded-full hover:shadow">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                <path d="M22 12C22 6.48 17.52 2
                12 2S2 6.48 2 12c0 4.84 3.44
                8.84 7.94 9.79v-6.93H7.9v-2.86h2.04V9.7c0-2.02
                1.2-3.14 3.03-3.14.88 0 1.8.16
                1.8.16v1.98h-1.02c-1.01 0-1.32.63-1.32
                1.28v1.52h2.25l-.36 2.86h-1.89v6.93C18.56
                20.84 22 16.84 22 12z"
                fill="#1877F2"/>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import poster1 from '@/assets/poster1.png';


const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const error = ref('')

function onSubmit() {
  error.value = ''
  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters.'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }
  alert(`Signed up: ${email.value}`)
  email.value = password.value = confirmPassword.value = ''
  showPassword.value = false
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Lobster&display=swap');
.font-lobster{ font-family:'Lobster',cursive; }
#app{ max-width:none!important; width:100% !important; }
</style>
