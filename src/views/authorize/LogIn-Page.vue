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
          <h1 class="text-4xl  md:text-5xl font-lobster text-gray-900">Welcome Back</h1>
          <p class="text-gray-500 py-5 ">Please enter your details</p>
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
              :disabled="isLoginAttemptLocked"
              class="mt-2 w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-400 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
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
              :disabled="isLoginAttemptLocked"
              class="mt-2 w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-400 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            />
          </div>

          <!-- Show pass + forgot -->
          <div class="flex justify-between items-center text-sm">
            <label class="flex items-center text-gray-600">
              <input type="checkbox" v-model="showPassword" :disabled="isLoginAttemptLocked" class="mr-2" />
              Show Password
            </label>
            <a href="#" class="text-indigo-600 hover:underline">Forgot password?</a>
          </div>

          <!-- Lock Warning -->
          <div v-if="isLoginAttemptLocked" class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
            Too many login attempts. Please try again in {{ lockoutTimeRemaining }} seconds.
          </div>

          <!-- Login button -->
          <button
            type="submit"
            :disabled="isLoginAttemptLocked || !email || !password"
            class="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-lg text-lg transition mt-5 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {{ isLoading ? 'Logging in...' : 'Log In' }}
          </button>

          <p class="text-center text-sm text-gray-700">
            Don't have an account?
              <router-link to="/SignUpPage" class="text-indigo-600">Sign Up here</router-link>
          </p>
          <!-- <div>my good code</div> -->
          <!-- Divider -->
          <div class=" flex items-center">
            <div class="flex-1 border-t border-gray-300"></div>
            <span class="px-3 text-gray-400 text-sm">Or Log In With</span>
            <div class="flex-1 border-t border-gray-300"></div>
          </div>

          <!-- Social Icons -->
          <div class=" flex justify-center gap-6">

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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import poster1 from '@/assets/poster1.png'

const router = useRouter()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const isLoading = ref(false)

// Security: Login attempt limiting
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 300 // 5 minutes in seconds
let loginAttempts = 0
let lockoutTimer: number | null = null
const isLoginAttemptLocked = ref(false)
const lockoutTimeRemaining = ref(0)

// Load login attempts from sessionStorage (reset on browser close)
const loadLoginAttempts = () => {
  const stored = sessionStorage.getItem('loginAttempts')
  const storedTime = sessionStorage.getItem('loginAttemptTime')

  if (stored && storedTime) {
    const timePassed = Math.floor((Date.now() - parseInt(storedTime)) / 1000)
    if (timePassed < LOCKOUT_DURATION) {
      loginAttempts = parseInt(stored)
      if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        activateLockout(LOCKOUT_DURATION - timePassed)
      }
    } else {
      resetLoginAttempts()
    }
  }
}

const activateLockout = (duration: number) => {
  isLoginAttemptLocked.value = true
  lockoutTimeRemaining.value = duration

  lockoutTimer = window.setInterval(() => {
    lockoutTimeRemaining.value--
    if (lockoutTimeRemaining.value <= 0) {
      resetLoginAttempts()
    }
  }, 1000)
}

const recordFailedAttempt = () => {
  loginAttempts++
  sessionStorage.setItem('loginAttempts', loginAttempts.toString())
  sessionStorage.setItem('loginAttemptTime', Date.now().toString())

  if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
    activateLockout(LOCKOUT_DURATION)
  }
}

const resetLoginAttempts = () => {
  loginAttempts = 0
  isLoginAttemptLocked.value = false
  lockoutTimeRemaining.value = 0
  sessionStorage.removeItem('loginAttempts')
  sessionStorage.removeItem('loginAttemptTime')
  if (lockoutTimer) {
    clearInterval(lockoutTimer)
  }
}

// Validate password requirements
const validatePassword = (pwd: string): { valid: boolean; message: string } => {
  if (pwd.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' }
  }
  if (!/[A-Z]/.test(pwd) && !/[0-9]/.test(pwd)) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter or number',
    }
  }
  return { valid: true, message: '' }
}

// Sanitize input to prevent XSS
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>"']/g, '')
}

const onSubmit = async () => {
  if (isLoginAttemptLocked.value) {
    errorMessage.value = 'Too many login attempts. Please try again later.'
    return
  }

  errorMessage.value = ''
  const sanitizedEmail = sanitizeInput(email.value)
  const sanitizedPassword = sanitizeInput(password.value)

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(sanitizedEmail)) {
    errorMessage.value = 'Please enter a valid email address'
    recordFailedAttempt()
    return
  }

  // Validate password
  const passwordValidation = validatePassword(sanitizedPassword)
  if (!passwordValidation.valid) {
    errorMessage.value = passwordValidation.message
    recordFailedAttempt()
    return
  }

  isLoading.value = true

  try {
    // Simulate API call - replace with actual backend authentication
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock validation - replace with real backend
    if (sanitizedEmail && sanitizedPassword) {
      // Save auth token (should come from backend)
      localStorage.setItem('authToken', 'mock-jwt-token-' + Date.now())
      localStorage.setItem('userEmail', sanitizedEmail)

      // Reset attempts on successful login
      resetLoginAttempts()
      errorMessage.value = ''

      // Redirect to home
      setTimeout(() => {
        router.push('/')
      }, 500)
    } else {
      errorMessage.value = 'Invalid credentials. Please try again.'
      recordFailedAttempt()
    }
  } catch (error) {
    errorMessage.value = 'Login failed. Please try again later.'
    recordFailedAttempt()
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadLoginAttempts()
})

onUnmounted(() => {
  if (lockoutTimer) {
    clearInterval(lockoutTimer)
  }
})
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
