import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const cartItems = ref(
    [] as Array<{
      id: number
      name: string
      price: number
      quantity: number
      image: string
      selected: boolean
    }>,
  )

  const addToCart = (product: { id: number; name: string; price: number; image: string }) => {
    const existing = cartItems.value.find((item) => item.id === product.id)
    if (existing) {
      existing.quantity++
    } else {
      cartItems.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        selected: true,
      })
    }
  }

  const removeFromCart = (id: number) => {
    const index = cartItems.value.findIndex((item) => item.id === id)
    if (index > -1) {
      cartItems.value.splice(index, 1)
    }
  }

  const updateQuantity = (id: number, quantity: number) => {
    const item = cartItems.value.find((item) => item.id === id)
    if (item && quantity > 0) {
      item.quantity = quantity
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
    cartItems.value.length = 0
  }

  const removeSelectedItems = () => {
    cartItems.value = cartItems.value.filter(item => !item.selected)
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
