<template>
  <div class="min-h-screen w-screen flex overflow-x-hidden relative">
    <div class="hidden md:block md:w-[40%] bg-black fixed top-0 left-0 h-screen z-10">
      <img :src="poster1" alt="Poster" class="w-full h-full object-cover" />
    </div>

    <div
      class="w-full md:w-[60%] md:ml-[40%] flex items-start justify-center p-6 md:p-16 bg-white overflow-y-auto min-h-screen"
    >
      <div class="w-full max-w-xl">
        <div class="text-center md:text-left mt-8 md:mt-0">
          <h1 class="text-4xl md:text-5xl font-lobster text-gray-900">Welcome To Our Store</h1>
          <p class="text-gray-400 mt-2">Step {{ currentStep }} of 2</p>
        </div>

        <!-- STEP 1: Basic Info -->
        <form v-if="currentStep === 1" @submit.prevent="nextStep" class="mt-8 space-y-6">
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
            class="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-md font-semibold transition flex items-center justify-center gap-2"
          >
            <span>Next</span>
            <i class="pi pi-arrow-right"></i>
          </button>

          <p class="text-center text-sm text-gray-700">
            Already have an account?
            <router-link to="/LoginPage" class="text-indigo-600 hover:underline"
              >Log In here</router-link
            >
          </p>
        </form>

        <!-- STEP 2: Additional Info -->
        <form v-if="currentStep === 2" @submit.prevent="onSubmit" class="mt-8 space-y-6">
          <!-- Error Message -->
          <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {{ error }}
          </div>

          <!-- Address -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Address</label>
            <input
              v-model="address"
              type="text"
              placeholder="Enter your address"
              class="mt-2 w-full border border-gray-200 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
          </div>

          <!-- Country -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Country</label>
            <input
              v-model="country"
              type="text"
              placeholder="Enter your country"
              class="mt-2 w-full border border-gray-200 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
          </div>

          <!-- Gender -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Gender</label>
            <select
              v-model="gender"
              class="mt-2 w-full border border-gray-200 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="flex gap-3">
            <button
              type="button"
              @click="previousStep"
              class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-md font-semibold transition flex items-center justify-center gap-2"
            >
              <i class="pi pi-arrow-left"></i>
              <span>Back</span>
            </button>
            <button
              type="submit"
              :disabled="isLoading"
              class="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-md font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <i v-if="isLoading" class="pi pi-spin pi-spinner"></i>
              <span>{{ isLoading ? 'Creating account...' : 'Sign Up' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../../composables/useAuth'
const poster1 = '/src/assets/poster1.png'

const { signUp, isLoading } = useAuth()

// Step tracking
const currentStep = ref(1)

// Step 1 fields
const fullName = ref('')
const phone = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)

// Step 2 fields
const address = ref('')
const country = ref('')
const gender = ref('')

const error = ref('')

const nextStep = () => {
  error.value = ''

  if (!fullName.value || !phone.value || !email.value || !password.value || !confirmPassword.value) {
    error.value = 'Please fill in all fields'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  if (password.value.length < 3) {
    error.value = 'Password must be at least 3 characters long'
    return
  }

  currentStep.value = 2
}

const previousStep = () => {
  currentStep.value = 1
  error.value = ''
}

const onSubmit = async () => {
  error.value = ''

  if (!address.value || !country.value || !gender.value) {
    error.value = 'Please fill in all fields'
    return
  }

  try {
    await signUp({
      username: email.value.split('@')[0],
      email: email.value,
      password: password.value,
      full_name: fullName.value,
      phone: phone.value,
      address: address.value,
      country: country.value,
      gender: gender.value,
    })
    // Router push is handled in useAuth
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Registration failed. Please try again.'
  }
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
  overflow-x: hidden !important;
}
</style>
