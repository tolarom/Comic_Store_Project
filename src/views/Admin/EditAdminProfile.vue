<template>
  <div><NavigationBar /></div>
  <div class="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 ml-[250px]">
    <div class="max-w-3xl mx-auto">
      <div class="mb-8">
        <button
          @click="goBack"
          class="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <i class="pi pi-arrow-left"></i>
          Back to Profile
        </button>
      </div>

      <h1 class="text-4xl font-bold text-blue-600 mb-12">Edit Profile</h1>

      <div class="bg-white rounded-2xl shadow-xl p-10">
        <!-- Loading State -->
        <div v-if="isFetching" class="flex items-center justify-center py-12">
          <div class="text-center">
            <i class="pi pi-spin pi-spinner text-blue-600 text-4xl mb-4"></i>
            <p class="text-gray-600">Loading profile...</p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {{ error }}
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {{ successMessage }}
        </div>

        <form v-if="!isFetching" @submit.prevent="saveProfile" class="space-y-6">
          <!-- Profile Picture -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
            <div class="flex flex-col items-center gap-6">
              <img
                :src="
                  previewUrl || form.image_url || 'https://via.placeholder.com/200x200.png?text=Profile+Picture'
                "
                alt="Profile Preview"
                class="w-40 h-40 rounded-full object-cover border-4 border-blue-200 shadow-lg"
              />
              <input
                ref="imageInput"
                type="file"
                accept="image/*"
                @change="onImageSelect"
                class="hidden"
              />
              <button
                type="button"
                @click="$refs.imageInput?.click()"
                class="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition"
              >
                <i class="pi pi-upload mr-2"></i>
                Change Picture
              </button>
              <p v-if="imageError" class="text-sm text-red-600">{{ imageError }}</p>
            </div>
          </div>

          <div class="border-t border-gray-300 pt-6"></div>

          <!-- Full Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              v-model="form.full_name"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <!-- Username -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              v-model="form.username"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled
            />
            <p class="text-xs text-gray-500 mt-1">Username cannot be changed</p>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              v-model="form.email"
              type="email"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              v-model="form.phone"
              type="tel"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <!-- Gender -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              v-model="form.gender"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <!-- Country -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <input
              v-model="form.country"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <!-- Address -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              v-model="form.address"
              rows="4"
              placeholder="Enter your full address"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            ></textarea>
          </div>

          <!-- Buttons -->
          <div class="flex gap-4 pt-6 border-t border-gray-300">
            <button
              type="button"
              @click="goBack"
              class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isLoading"
              class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <i v-if="isLoading" class="pi pi-spin pi-spinner"></i>
              <span>{{ isLoading ? 'Saving...' : 'Save Changes' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import NavigationBar from '../../components/Admin/NavigationBar.vue'
import { updateUser, getUserById } from '../../services/api'

const router = useRouter()
const { currentUser: user } = useAuth()

const isLoading = ref(false)
const isFetching = ref(false)
const error = ref('')
const successMessage = ref('')

const form = ref({
  username: '',
  email: '',
  full_name: '',
  phone: '',
  gender: '',
  country: '',
  address: '',
  image_url: '',
})

const previewUrl = ref('')
const imageFile = ref<File | null>(null)
const imageError = ref('')

const fetchFullUserProfile = async () => {
  try {
    if (!user.value?.id) return
    
    isFetching.value = true
    const fullUserData = await getUserById(user.value.id)
    
    form.value = {
      username: fullUserData.username || '',
      email: fullUserData.email || '',
      full_name: fullUserData.full_name || '',
      phone: fullUserData.phone || '',
      gender: fullUserData.gender || '',
      country: fullUserData.country || '',
      address: fullUserData.address || '',
      image_url: fullUserData.image_url || '',
    }
  } catch (err) {
    console.error('Error fetching user profile:', err)
    // Fallback to currentUser data if API call fails
    if (user.value) {
      form.value = {
        username: user.value.username || '',
        email: user.value.email || '',
        full_name: user.value.full_name || '',
        phone: user.value.phone || '',
        gender: user.value.gender || '',
        country: user.value.country || '',
        address: user.value.address || '',
        image_url: user.value.image_url || '',
      }
    }
  } finally {
    isFetching.value = false
  }
}

const onImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  imageError.value = ''
  
  if (!file) return
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    imageError.value = 'Please select a valid image file'
    return
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    imageError.value = 'Image size must be less than 5MB'
    return
  }
  
  imageFile.value = file
  
  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

onMounted(() => {
  fetchFullUserProfile()
})

const saveProfile = async () => {
  error.value = ''
  successMessage.value = ''

  try {
    isLoading.value = true

    if (!user.value?.id) {
      throw new Error('User ID not found. Please log in again.')
    }

    // Validate required fields
    if (!form.value.full_name || !form.value.email || !form.value.phone) {
      throw new Error('Please fill in all required fields')
    }

    const updateData: any = {
      email: form.value.email,
      full_name: form.value.full_name,
      phone: form.value.phone,
      gender: form.value.gender,
      country: form.value.country,
      address: form.value.address,
    }
    
    // Include image URL if it was updated
    if (previewUrl.value) {
      updateData.image_url = previewUrl.value
    }
    
    await updateUser(user.value.id, updateData)

    successMessage.value = 'Profile updated successfully!'

    // Update localStorage with new user data
    const updatedUser = {
      ...user.value,
      email: form.value.email,
      full_name: form.value.full_name,
      phone: form.value.phone,
      gender: form.value.gender,
      country: form.value.country,
      address: form.value.address,
      ...(previewUrl.value && { image_url: previewUrl.value }),
    }
    localStorage.setItem('user', JSON.stringify(updatedUser))

    setTimeout(() => {
      router.push({ name: 'AdminProfile' })
    }, 1500)
  } catch (err: any) {
    error.value = err?.message || 'Failed to update profile. Please try again.'
    console.error('Error updating profile:', err)
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.push({ name: 'AdminProfile' })
}
</script>

<style scoped>
button:hover {
  transform: translateY(-1px);
}
</style>
