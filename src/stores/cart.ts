import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getCurrentUser,
  addItemToCart as apiAddItemToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
  clearCart as apiClearCart,
} from '@/services/api'

export const useCartStore = defineStore('cart', () => {
  const cartItems = ref(
    [] as Array<{
      id: number
      backend_id?: string
      name: string
      price: number
      quantity: number
      image: string
      selected: boolean
    }>,
  )

  // Helper function to get user-specific cart key
  const getCartKey = () => {
    const user = getCurrentUser()
    const userId = user?._id || (user as any)?.id || 'guest'
    return `cartItems_${userId}`
  }

  // Initialize cart from localStorage for current user
  const loadCart = () => {
    try {
      const cartKey = getCartKey()
      const raw = localStorage.getItem(cartKey)
      if (raw) {
        cartItems.value = JSON.parse(raw)
      } else {
        cartItems.value = []
      }
    } catch (e) {
      console.warn('Failed to parse cartItems from localStorage', e)
      cartItems.value = []
    }
  }

  // Save cart to localStorage for current user
  const saveCart = () => {
    try {
      const cartKey = getCartKey()
      localStorage.setItem(cartKey, JSON.stringify(cartItems.value))
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e)
    }
  }

  // Initialize cart on store creation
  loadCart()

  const addToCart = (product: {
    id: number
    backend_id?: string
    name: string
    price: number
    image: string
  }) => {
    const existing = cartItems.value.find((item) => item.id === product.id)
    if (existing) {
      existing.quantity++
    } else {
      cartItems.value.push({
        id: product.id,
        backend_id: product.backend_id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        selected: true,
      })
    }

    // Persist to user-specific localStorage
    saveCart()

    // if user is authenticated and backend_id available, sync to backend
    const user = getCurrentUser()
    const uid = user ? user._id || (user as any).id : null
    if (uid && product.backend_id) {
      void apiAddItemToCart(uid as string, product.backend_id, 1).catch((e) => {
        console.warn('Failed to sync addToCart to backend', e)
      })
    }
  }

  const removeFromCart = (id: number) => {
    const index = cartItems.value.findIndex((item) => item.id === id)
    if (index > -1) {
      const [removed] = cartItems.value.splice(index, 1)

      // Persist to user-specific localStorage
      saveCart()

      // sync removal
      const user = getCurrentUser()
      const uid = user ? user._id || (user as any).id : null
      if (removed && uid && removed.backend_id) {
        void apiRemoveCartItem(uid as string, removed.backend_id).catch((e) => {
          console.warn('Failed to sync removeFromCart to backend', e)
        })
      }
    }
  }

  const updateQuantity = (id: number, quantity: number) => {
    const item = cartItems.value.find((item) => item.id === id)
    if (item && quantity > 0) {
      item.quantity = quantity

      // Persist to user-specific localStorage
      saveCart()

      // sync
      const user = getCurrentUser()
      const uid = user ? user._id || (user as any).id : null
      if (uid && item.backend_id) {
        void apiUpdateCartItem(uid as string, item.backend_id, quantity).catch((e) => {
          console.warn('Failed to sync updateQuantity to backend', e)
        })
      }
    }
  }

  const selectItem = (id: number, selected: boolean) => {
    const item = cartItems.value.find((item) => item.id === id)
    if (item) {
      item.selected = selected
      saveCart()
    }
  }

  const selectAllItems = (selected: boolean) => {
    cartItems.value.forEach((item) => (item.selected = selected))
    saveCart()
  }

  const clearCart = () => {
    const prev = [...cartItems.value]
    
    // Remove user-specific cart from localStorage
    try {
      const cartKey = getCartKey()
      localStorage.removeItem(cartKey)
    } catch {}

    // Clear in-memory cart
    cartItems.value = []

    const user = getCurrentUser()
    const uid = user ? user._id || (user as any).id : null
    if (uid) {
      void apiClearCart(uid as string).catch((e) => {
        console.warn('Failed to clear cart on backend', e)
        // restore on failure
        cartItems.value = prev
        saveCart()
      })
    }
  }

  const removeSelectedItems = () => {
    const removed = cartItems.value.filter((item) => item.selected)
    cartItems.value = cartItems.value.filter((item) => !item.selected)

    // Persist to user-specific localStorage
    saveCart()

    // sync removals with backend (fire-and-forget)
    const user = getCurrentUser()
    const uid = user ? user._id || (user as any).id : null
    if (uid && removed.length > 0) {
      const removals = removed
        .filter((r) => r.backend_id)
        .map((r) => apiRemoveCartItem(uid as string, r.backend_id as string))

      if (removals.length > 0) {
        void Promise.allSettled(removals).then((results) => {
          const failed = results.filter((r) => r.status === 'rejected')
          if (failed.length > 0) {
            console.warn('Some removals failed to sync to backend', failed)
          }
        })
      }
    }
  }

  const subtotal = computed(() => {
    return cartItems.value
      .filter((item) => item.selected)
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
  })

  const shipping = computed(() => (subtotal.value >= 50 ? 0 : 5))

  const total = computed(() => subtotal.value + shipping.value)

  const isAllSelected = computed(() => {
    return cartItems.value.length > 0 && cartItems.value.every((item) => item.selected)
  })

  const totalItems = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    selectItem,
    selectAllItems,
    clearCart,
    removeSelectedItems,
    loadCart, // Export loadCart so it can be called on login
    subtotal,
    shipping,
    total,
    isAllSelected,
    totalItems,
  }
})
