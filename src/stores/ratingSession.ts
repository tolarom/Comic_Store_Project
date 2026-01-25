import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface RateableItem {
  id: number
  backend_id: string
  name: string
  image: string
  quantity: number
  price: number
}

export interface ItemFeedback {
  id: number
  rating: number
  comment: string
}

export const useRatingSessionStore = defineStore('ratingSession', () => {
  const items = ref<RateableItem[]>([])

  const setItems = (newItems: RateableItem[]) => {
    items.value = [...newItems]
  }

  const clear = () => {
    items.value = []
  }

  return { items, setItems, clear }
})
