<template>
  <NavigationBar />
  <div class="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
    <div
      class="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-8 sm:p-10"
    >
      <h1 class="text-3xl font-bold text-gray-900 mb-3">Rate Your Items</h1>
      <p class="text-gray-600 mb-8">Please rate each item from your recent order.</p>

      <!-- Info banner -->
      <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p class="text-sm text-blue-800">
          <strong>Note:</strong> To submit ratings, the backend server must be running on <code class="bg-blue-100 px-2 py-1 rounded">http://localhost:8080</code>
        </p>
      </div>

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
          <div class="flex-1">
            <label class="sr-only">Comment for {{ item.name }}</label>
            <textarea
              v-model="feedbackFor(item.id).comment"
              maxlength="500"
              rows="3"
              class="w-full border border-gray-200 rounded-md p-2 text-sm resize-none"
              placeholder="Write a comment (optional)"
            ></textarea>
            <div class="text-xs text-gray-400 mt-1">{{ (feedbackFor(item.id).comment || '').length }} / 500</div>
          </div>
        </div>


        <div class="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            class="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            :disabled="!canSubmit || isSubmitting"
            @click="submitFeedback"
          >
            {{ isSubmitting ? 'Submitting...' : 'Submit Ratings' }}
          </button>
          <button
            class="flex-1 bg-gray-100 text-gray-800 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition"
            @click="goHome"
            :disabled="isSubmitting"
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
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import StarRating from 'vue-star-rating'
import NavigationBar from '../../components/client/NavigationBar.vue'
import FooterPage from '../../components/client/FooterPage.vue'
import { useRatingSessionStore } from '../../stores/ratingSession'
import { getCurrentUser, createRating } from '../../services/api'

const router = useRouter()
const ratingStore = useRatingSessionStore()
const isSubmitting = ref(false)

const items = computed(() => ratingStore.items)

// feedbackMap keeps per-item rating and comment
const feedbackMap = reactive<{ [key: number]: { rating: number; comment: string } }>({})

const feedbackFor = (id: number) => {
  if (!feedbackMap[id]) {
    feedbackMap[id] = { rating: 0, comment: '' }
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

const submitFeedback = async () => {
  try {
    isSubmitting.value = true

    // Get current user
    const currentUser = getCurrentUser()
    if (!currentUser || !currentUser.id && !currentUser._id) {
      alert('Please log in to submit ratings')
      router.push('/auth/login')
      return
    }

    // Extract user ID as string (handle MongoDB ObjectId objects)
    let userId = currentUser.id || currentUser._id || ''
    if (typeof userId === 'object' && userId !== null) {
      userId = (userId as any).$oid || String(userId)
    }
    userId = String(userId) // Ensure it's a string

    // Submit each rating to API
    const ratingPromises = items.value.map((item) => {
      const productId = item.backend_id || String(item.id)
      const rating = Math.round(feedbackFor(item.id).rating || 0) // Ensure integer
      const review = feedbackFor(item.id).comment || '' // Ensure string (allow empty)

      const payload = {
        product_id: productId,
        user_id: userId,
        rating: rating, // 1-5 integer
        review: review, // string (can be empty)
      }

      console.log('Submitting rating payload:', JSON.stringify(payload, null, 2))

      return createRating(payload)
    })

    await Promise.all(ratingPromises)

    alert('Ratings submitted successfully!')
    ratingStore.clear()
    router.push('/client/orders')
  } catch (error: any) {
    console.error('Error submitting ratings:', error)
    const errorMessage = error?.response?.data?.message || 
                         error?.message || 
                         'Failed to connect to server. Please check if the backend is running on http://localhost:8080'
    alert(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

const goHome = () => {
  ratingStore.clear()
  router.push('/client/orders')
}
</script>
