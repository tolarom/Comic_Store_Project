<template>
  <div class="min-h-screen w-screen flex">
    <div class="hidden md:flex md:w-[40%] bg-black sticky top-0 h-screen">
      <img :src="poster1" alt="Poster" class="w-full h-full object-cover" />
    </div>

    <div class="w-full md:w-[60%] flex items-start justify-center p-6 md:p-16 bg-white overflow-y-vertical">
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

          <!-- Success Message -->
          <div v-if="successMessage" class="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {{ successMessage }}
          </div>

          <!-- Full Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Full Name</label>
            <input v-model="fullName" type="text" placeholder="Enter your full name"
                   :disabled="isSigningUp"
                   class="mt-2 w-full border border-gray-200 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-400 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed" required />
            <p v-if="fullName && fullName.length < 2" class="text-sm text-red-600 mt-1">Name must be at least 2 characters</p>
          </div>

          <!-- Phone Number -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Phone Number</label>
            <input v-model="phone" type="tel" placeholder="Enter your phone number"
                   :disabled="isSigningUp"
                   class="mt-2 w-full border border-gray-200 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-400 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed" required />
            <p v-if="phone && !isValidPhone(phone)" class="text-sm text-red-600 mt-1">Please enter a valid phone number</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Email Address</label>
            <input v-model="email" type="email" placeholder="Enter your email"
                   :disabled="isSigningUp"
                   class="mt-2 w-full border border-gray-200 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-400 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed" required />
            <p v-if="email && !isValidEmail(email)" class="text-sm text-red-600 mt-1">Please enter a valid email address</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Create Password</label>
            <input v-model="password" :type="showPassword ? 'text' : 'password'"
                   placeholder="Enter your password"
                   :disabled="isSigningUp"
                   @input="updatePasswordStrength"
                   class="mt-2 w-full border border-gray-200 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-400 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed" required />
            
            <!-- Password Strength Indicator -->
            <div v-if="password" class="mt-3">
              <div class="flex items-center gap-2">
                <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div :class="['h-full transition-all', getPasswordStrengthColor(passwordStrength)]"
                       :style="{ width: (passwordStrength / 5) * 100 + '%' }"></div>
                </div>
                <span class="text-xs font-medium" :class="getPasswordStrengthClass(passwordStrength)">{{ getPasswordStrengthText(passwordStrength) }}</span>
              </div>
              <ul class="mt-2 text-xs text-gray-600 space-y-1">
                <li :class="password.length >= 8 ? 'text-green-600' : ''">✓ At least 8 characters</li>
                <li :class="/[A-Z]/.test(password) ? 'text-green-600' : ''">✓ Uppercase letter</li>
                <li :class="/[a-z]/.test(password) ? 'text-green-600' : ''">✓ Lowercase letter</li>
                <li :class="/[0-9]/.test(password) ? 'text-green-600' : ''">✓ Number</li>
                <li :class="/[!@#$%^&*]/.test(password) ? 'text-green-600' : ''">✓ Special character (!@#$%^&*)</li>
              </ul>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Confirm your Password</label>
            <input v-model="confirmPassword" :type="showPassword ? 'text' : 'password'"
                   placeholder="Confirm your password"
                   :disabled="isSigningUp"
                   class="mt-2 w-full border border-gray-200 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-400 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed" required />
            <p v-if="confirmPassword && password !== confirmPassword" class="text-sm text-red-600 mt-1">Passwords do not match</p>
            <p v-if="confirmPassword && password === confirmPassword" class="text-sm text-green-600 mt-1">✓ Passwords match</p>
          </div>

          <div class="flex items-center mt-1">
            <label class="inline-flex items-center text-sm text-gray-600">
              <input type="checkbox" class="mr-2" v-model="showPassword" :disabled="isSigningUp" /> Show Password
            </label>
          </div>

          <button type="submit" 
                  :disabled="isSigningUp || !email || !password || !confirmPassword || !fullName || !phone || !isPasswordValid(password) || password !== confirmPassword || !isValidPhone(phone) || fullName.length < 2"
                  class="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-md font-semibold transition disabled:bg-gray-400 disabled:cursor-not-allowed">
            {{ isSigningUp ? 'Creating Account...' : 'Sign Up' }}
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
const successMessage = ref('')
const isSigningUp = ref(false)
const passwordStrength = ref(0)

// Phone validation
const isValidPhone = (phoneStr: string): boolean => {
  // Accept various phone formats: (123) 456-7890, 123-456-7890, 1234567890, +1 123 456 7890, etc.
  const phoneRegex = /^[\d\s\-\+\(\)]+$/
  const digitsOnly = phoneStr.replace(/\D/g, '')
  return phoneRegex.test(phoneStr) && digitsOnly.length >= 10
}

// Email validation
const isValidEmail = (emailStr: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(emailStr)
}

// Password strength calculation
const calculatePasswordStrength = (pwd: string): number => {
  let strength = 0

  if (pwd.length >= 8) strength++
  if (pwd.length >= 12) strength++
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
  if (/[0-9]/.test(pwd)) strength++
  if (/[!@#$%^&*]/.test(pwd)) strength++

  return Math.min(strength, 5)
}

const updatePasswordStrength = () => {
  passwordStrength.value = calculatePasswordStrength(password.value)
}

const getPasswordStrengthColor = (strength: number): string => {
  const colors = {
    0: 'bg-gray-300',
    1: 'bg-red-500',
    2: 'bg-orange-500',
    3: 'bg-yellow-500',
    4: 'bg-blue-500',
    5: 'bg-green-500',
  }
  return colors[strength as keyof typeof colors] || 'bg-gray-300'
}

const getPasswordStrengthClass = (strength: number): string => {
  const classes = {
    0: 'text-gray-600',
    1: 'text-red-600',
    2: 'text-orange-600',
    3: 'text-yellow-600',
    4: 'text-blue-600',
    5: 'text-green-600',
  }
  return classes[strength as keyof typeof classes] || 'text-gray-600'
}

const getPasswordStrengthText = (strength: number): string => {
  const texts = {
    0: 'Very Weak',
    1: 'Weak',
    2: 'Fair',
    3: 'Good',
    4: 'Strong',
    5: 'Very Strong',
  }
  return texts[strength as keyof typeof texts] || 'Very Weak'
}

// Validate password requirements
const isPasswordValid = (pwd: string): boolean => {
  if (pwd.length < 8) return false
  if (!/[a-z]/.test(pwd)) return false
  if (!/[A-Z]/.test(pwd)) return false
  if (!/[0-9]/.test(pwd)) return false
  if (!/[!@#$%^&*]/.test(pwd)) return false
  return true
}

// Sanitize input to prevent XSS
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>"']/g, '')
}

const onSubmit = async () => {
  error.value = ''
  successMessage.value = ''

  // Sanitize inputs
  const sanitizedEmail = sanitizeInput(email.value)
  const sanitizedFullName = sanitizeInput(fullName.value)
  const sanitizedPhone = sanitizeInput(phone.value)
  const sanitizedPassword = sanitizeInput(password.value)
  const sanitizedConfirmPassword = sanitizeInput(confirmPassword.value)

  // Validate full name
  if (sanitizedFullName.length < 2) {
    error.value = 'Full name must be at least 2 characters'
    return
  }

  // Validate phone
  if (!isValidPhone(sanitizedPhone)) {
    error.value = 'Please enter a valid phone number (at least 10 digits)'
    return
  }

  // Validate email
  if (!isValidEmail(sanitizedEmail)) {
    error.value = 'Please enter a valid email address'
    return
  }

  // Validate password requirements
  if (!isPasswordValid(sanitizedPassword)) {
    error.value = 'Password must contain: 8+ characters, uppercase, lowercase, number, and special character (!@#$%^&*)'
    return
  }

  // Check if passwords match
  if (sanitizedPassword !== sanitizedConfirmPassword) {
    error.value = 'Passwords do not match'
    return
  }

  isSigningUp.value = true

  try {
    // Simulate API call - replace with actual backend
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock signup - replace with real backend API
    localStorage.setItem('userEmail', sanitizedEmail)
    localStorage.setItem('userProfile', JSON.stringify({
      fullName: sanitizedFullName,
      email: sanitizedEmail,
      phoneNumber: sanitizedPhone,
      gender: 'Not specified',
      country: 'Not specified',
    }))
    localStorage.setItem('hasAccount', 'true')

    successMessage.value = 'Account created successfully! Redirecting to login...'

    setTimeout(() => {
      email.value = fullName.value = phone.value = password.value = confirmPassword.value = ''
      showPassword.value = false
      passwordStrength.value = 0
      router.push('/LoginPage')
    }, 1500)
  } catch (err) {
    error.value = 'Signup failed. Please try again later.'
  } finally {
    isSigningUp.value = false
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Lobster&display=swap');
.font-lobster{ font-family:'Lobster',cursive; }
#app{ max-width:none!important; width:100% !important; }
</style>
