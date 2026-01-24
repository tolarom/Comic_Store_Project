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

  // initialize from localStorage
  try {
    const raw = localStorage.getItem('cartItems')
    if (raw) cartItems.value = JSON.parse(raw)
  } catch (e) {
    console.warn('Failed to parse cartItems from localStorage', e)
  }

  const addToCart = (product: { id: number; backend_id?: string; name: string; price: number; image: string }) => {
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

    // persist locally
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems.value))
    } catch {}

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

      // persist locally
      try {
        localStorage.setItem('cartItems', JSON.stringify(cartItems.value))
      } catch {}

      // sync removal
      const user = getCurrentUser()
      const uid = user ? user._id || (user as any).id : null
      if (uid && removed.backend_id) {
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

      // persist locally
      try {
        localStorage.setItem('cartItems', JSON.stringify(cartItems.value))
      } catch {}

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
    }
  }

  const selectAllItems = (selected: boolean) => {
    cartItems.value.forEach((item) => (item.selected = selected))
  }

  const clearCart = () => {
    const prev = [...cartItems.value]
    cartItems.value.length = 0

    try {
      localStorage.removeItem('cartItems')
    } catch {}

    const user = getCurrentUser()
    const uid = user ? user._id || (user as any).id : null
    if (uid) {
      void apiClearCart(uid as string).catch((e) => {
        console.warn('Failed to clear cart on backend', e)
        // restore on failure
        cartItems.value = prev
      })
    }
  }

  const removeSelectedItems = () => {
    const removed = cartItems.value.filter((item) => item.selected)
    cartItems.value = cartItems.value.filter((item) => !item.selected)

    // persist locally
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems.value))
    } catch {}

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
    subtotal,
    shipping,
    total,
    isAllSelected,
    totalItems,
  }
})
