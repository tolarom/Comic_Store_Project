import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { User } from '@/services/api'
import { register as apiRegister } from '@/services/api'

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

    console.log('initializeAuth: storedToken:', storedToken)
    console.log('initializeAuth: storedUser:', storedUser)

    if (storedToken) {
      authToken.value = storedToken
    }

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        console.log('initializeAuth: parsed user:', parsedUser)
        currentUser.value = parsedUser
        console.log('initializeAuth: currentUser.value set to:', currentUser.value)
      } catch (e) {
        console.error('Failed to parse stored user:', e)
        localStorage.removeItem('user')
      }
    }
  }

  // Login - for now, create a simple client-side auth
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const login = async (email: string, _password: string) => {
    try {
      isLoading.value = true
      error.value = null

      // Since backend doesn't have login endpoint yet,
      // we'll create a simple client-side auth
      // In production, backend should have /api/auth/login

      // Create a user object from email with better default values
      const fakeToken = `token_${Date.now()}`
      const username = email.split('@')[0] || 'user'
      const fakeUser: User = {
        email,
        username,
        full_name: username.charAt(0).toUpperCase() + username.slice(1), // Capitalize first letter
        address: '123 Main Street',
        phone: '+1 (555) 123-4567',
        role: 'customer',
      }

      console.log('Login: Saving user to localStorage:', fakeUser)

      // Store in localStorage
      localStorage.setItem('authToken', fakeToken)
      localStorage.setItem('user', JSON.stringify(fakeUser))

      authToken.value = fakeToken
      currentUser.value = fakeUser

      console.log('Login: Auth state updated. currentUser:', currentUser.value)

      // Redirect to home
      await router.push({ name: 'Homeview' })
      return fakeUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Register - call backend API
  const signUp = async (userData: User & { password: string }) => {
    try {
      isLoading.value = true
      error.value = null

      const newUser = await apiRegister(userData)

      // Auto-login after registration
      const fakeToken = `token_${Date.now()}`
      localStorage.setItem('authToken', fakeToken)
      localStorage.setItem('user', JSON.stringify(newUser))

      authToken.value = fakeToken
      currentUser.value = newUser

      // Redirect to home
      await router.push({ name: 'Homeview' })
      return newUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Registration failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Logout
  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    authToken.value = null
    currentUser.value = null
    router.push({ name: 'LoginPage' })
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
  }
}
