import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { User, CreateUserRequest } from '@/services/api'
import { 
  register as apiRegister,
  login as apiLogin,
  logout as apiLogout,
} from '@/services/api'
import { useCartStore } from '@/stores/cart'

// Auth state
const currentUser = ref<User | null>(null)
const authToken = ref<string | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

export function useAuth() {
  const router = useRouter()

  // Initialize from localStorage
  const initializeAuth = () => {
    const storedToken = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('user')

    if (storedToken) {
      authToken.value = storedToken
    }

    if (storedUser) {
      try {
        currentUser.value = JSON.parse(storedUser)
      } catch (e) {
        console.error('Failed to parse stored user:', e)
        localStorage.removeItem('user')
      }
    }
  }

  // Login with backend API
  const login = async (email: string, password: string) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await apiLogin(email, password)
      
      authToken.value = response.token
      currentUser.value = response.user

      // Load user-specific cart
      const cartStore = useCartStore()
      cartStore.loadCart()

      // Redirect based on role
      if (response.user.role === 'admin') {
        await router.push({ name: 'Dashboard' })
      } else {
        await router.push({ name: 'Homeview' })
      }
      
      return response.user
    } catch (err: any) {
      const errorMsg = err?.message || 'Login failed'
      error.value = errorMsg
      throw new Error(errorMsg)
    } finally {
      isLoading.value = false
    }
  }

  // Register with backend API
  const signUp = async (userData: CreateUserRequest) => {
    try {
      isLoading.value = true
      error.value = null

      const newUser = await apiRegister(userData)

      // Clear any existing auth data before redirecting to login
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      authToken.value = null
      currentUser.value = null

      // Redirect to login page after successful signup
      await router.push({ name: 'LoginPage' })
      
      return newUser
    } catch (err: any) {
      const errorMsg = err?.message || 'Registration failed'
      error.value = errorMsg
      throw new Error(errorMsg)
    } finally {
      isLoading.value = false
    }
  }

  // Logout
  const logout = () => {
    // Clear user cart
    const cartStore = useCartStore()
    cartStore.clearCart()
    
    // Clear auth
    apiLogout()
    authToken.value = null
    currentUser.value = null
    
    // Load guest cart
    cartStore.loadCart()
    
    router.push({ name: 'LoginPage' })
  }

  // Update current user profile
  const updateProfile = (updatedUser: User) => {
    currentUser.value = updatedUser
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  // Computed properties
  const isAuthenticated = computed(() => !!authToken.value && !!currentUser.value)
  const isAdmin = computed(() => currentUser.value?.role === 'admin')

  return {
    // State
    currentUser,
    authToken,
    isLoading,
    error,

    // Computed
    isAuthenticated,
    isAdmin,

    // Methods
    login,
    signUp,
    logout,
    initializeAuth,
    updateProfile,
  }
}
