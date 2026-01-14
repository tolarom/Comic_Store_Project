<template>
  <NavigationBar />
  <div class="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
    <div
      class="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-8 sm:p-10"
    >
      <h1 class="text-3xl font-bold text-gray-900 mb-3">Rate Your Items</h1>
      <p class="text-gray-600 mb-8">Please rate each item from your recent order.</p>

      <div v-if="items.length" class="space-y-6">
        <div
          v-for="item in items"
          :key="item.id"
          class="border border-gray-200 rounded-xl p-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6"
        >
          <div class="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border">
            <img :src="item.image" alt="item" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1 space-y-3">
            <div>
              <p class="font-semibold text-gray-900">{{ item.name }}</p>
              <p class="text-sm text-gray-500">
                Qty: {{ item.quantity }} · ${{ item.price.toFixed(2) }}
              </p>
            </div>

            <div class="flex items-center gap-3">
              <StarRating
                v-model:rating="feedbackFor(item.id).rating"
                :increment="0.5"
                :star-size="28"
              />
              <span class="text-gray-700 text-sm">{{ feedbackFor(item.id).rating }} / 5</span>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            class="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            :disabled="!canSubmit"
            @click="submitFeedback"
          >
            Submit Ratings
          </button>
          <button
            class="flex-1 bg-gray-100 text-gray-800 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition"
            @click="goHome"
          >
            Skip for now
          </button>
        </div>
      </div>

      <div v-else class="text-center text-gray-500 py-12">No items to rate.</div>
    </div>
  </div>
  <FooterPage />
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import StarRating from 'vue-star-rating'
import NavigationBar from '@/components/client/NavigationBar.vue'
import FooterPage from '@/components/client/FooterPage.vue'
import { useRatingSessionStore } from '@/stores/ratingSession'

const router = useRouter()
const ratingStore = useRatingSessionStore()

const items = computed(() => ratingStore.items)

// feedbackMap keeps per-item rating and comment
const feedbackMap = reactive<{ [key: number]: { rating: number } }>({})

const feedbackFor = (id: number) => {
  if (!feedbackMap[id]) {
    feedbackMap[id] = { rating: 0 }
  }
  return feedbackMap[id]
}

const ensureEntries = () => {
  items.value.forEach((item) => {
    feedbackFor(item.id)
  })
}

onMounted(() => {
  ensureEntries()
  if (!items.value.length) {
    router.push('/')
  }
})

const canSubmit = computed(() => {
  if (!items.value.length) return false
  return items.value.every((item) => (feedbackMap[item.id]?.rating || 0) > 0)
})

const submitFeedback = () => {
  const payload = items.value.map((item) => ({
    id: item.id,
    rating: feedbackFor(item.id).rating || 0,
  }))

  // TODO: send to backend when available
  console.log('Feedback submitted:', payload)

  ratingStore.clear()
  router.push('/')
}

const goHome = () => {
  ratingStore.clear()
  router.push('/')
}
</script>
