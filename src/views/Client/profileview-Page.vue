<template>
  <NavigationBar></NavigationBar>
  <div class="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
    <div class="max-w-5xl mx-auto">
      <h1 class="text-4xl font-bold text-blue-600 mb-12">My Profile</h1>

      <div class="grid md:grid-cols-2 gap-10 items-start">
        <!-- Left: Avatar + Buttons -->
        <div class="flex flex-col items-center">
          <div class="relative">
            <img
              :src="
                profilePicture || 'https://via.placeholder.com/300x300.png?text=Profile+Picture'
              "
              alt="Profile"
              class="w-64 h-64 rounded-full object-cover border-8 border-white shadow-2xl"
            />
            <button
              @click="$refs.fileInput.click()"
              class="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition cursor-pointer"
              title="Change avatar"
            >
              <svg
                class="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleProfilePictureUpload"
              class="hidden"
            />
          </div>

          <div class="mt-8 space-y-4 w-48">
            <button
              @click="logout"
              class="w-full py-3 border border-red-500 text-red-600 rounded-lg font-medium hover:bg-red-50 transition"
            >
              Log out
            </button>
          </div>
        </div>

        <!-- Right: User Information Card or Edit Form -->
        <div class="bg-gray-100 rounded-2xl shadow-xl p-10">
          <!-- View Mode -->
          <div v-if="!isEditingMode">
            <h2 class="text-2xl font-bold text-blue-600 mb-8">User Information</h2>

            <div class="space-y-6 text-lg">
              <div class="flex justify-between py-3 border-b border-gray-300">
                <span class="font-medium text-gray-600">Name:</span>
                <span class="font-semibold">{{ fullName }}</span>
              </div>
              <div class="flex justify-between py-3 border-b border-gray-300">
                <span class="font-medium text-gray-600">Email:</span>
                <span class="font-semibold">{{ email }}</span>
              </div>
              <div class="flex justify-between py-3 border-b border-gray-300">
                <span class="font-medium text-gray-600">Phone Number:</span>
                <span class="font-semibold">{{ phoneNumber }}</span>
              </div>
              <div class="flex justify-between py-3 border-b border-gray-300">
                <span class="font-medium text-gray-600">Gender:</span>
                <span class="font-semibold">{{ gender }}</span>
              </div>
              <div class="flex justify-between py-3">
                <span class="font-medium text-gray-600">Country:</span>
                <span class="font-semibold">{{ country }}</span>
              </div>
            </div>

            <div class="mt-10 text-right">
              <button
                @click="toggleEditMode"
                class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
              >
                Edit Information
              </button>
            </div>
          </div>

          <!-- Edit Mode -->
          <div v-if="isEditingMode">
            <h2 class="text-2xl font-bold text-blue-600 mb-8">Edit Information</h2>

            <form @submit.prevent="saveProfile" class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  v-model="editForm.fullName"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  v-model="editForm.email"
                  type="email"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  v-model="editForm.phoneNumber"
                  type="tel"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  v-model="editForm.gender"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  v-model="editForm.country"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div class="flex gap-4 mt-8">
                <button
                  type="submit"
                  class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  @click="cancelEdit"
                  class="flex-1 bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-500 transition shadow-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
  <FooterPage />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import NavigationBar from '@/components/client/NavigationBar.vue'
import FooterPage from '@/components/client/FooterPage.vue'
const router = useRouter()

// Profile data
const fullName = ref('John Doe')
const email = ref('john.doe@example.com')
const phoneNumber = ref('+1 (555) 123-4567')
const gender = ref('Male')
const country = ref('United States')
const profilePicture = ref('https://via.placeholder.com/300x300.png?text=Profile+Picture')

// Edit mode state
const isEditingMode = ref(false)
const editForm = ref({
  fullName: fullName.value,
  email: email.value,
  phoneNumber: phoneNumber.value,
  gender: gender.value,
  country: country.value,
})

const toggleEditMode = () => {
  if (isEditingMode.value) {
    cancelEdit()
  } else {
    isEditingMode.value = true
    editForm.value = {
      fullName: fullName.value,
      email: email.value,
      phoneNumber: phoneNumber.value,
      gender: gender.value,
      country: country.value,
    }
  }
}

const saveProfile = () => {
  // Update profile data
  fullName.value = editForm.value.fullName
  email.value = editForm.value.email
  phoneNumber.value = editForm.value.phoneNumber
  gender.value = editForm.value.gender
  country.value = editForm.value.country

  // Save to localStorage (persist across sessions)
  localStorage.setItem(
    'userProfile',
    JSON.stringify({
      fullName: fullName.value,
      email: email.value,
      phoneNumber: phoneNumber.value,
      gender: gender.value,
      country: country.value,
    }),
  )

  isEditingMode.value = false
}

const cancelEdit = () => {
  isEditingMode.value = false
}

const handleProfilePictureUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (file) {
    const reader = new FileReader()
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result as string
      profilePicture.value = result
      // Save to localStorage
      localStorage.setItem('profilePicture', result)
    }
    reader.readAsDataURL(file)
  }

  // Reset input so the same file can be selected again
  input.value = ''
}

const logout = () => {
  // Clear user session (example)
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('userProfile')

  // Redirect to home or login
  router.push('/LoginPage')
}
</script>

<style scoped>
/* Optional: add subtle animation on hover */
button:hover {
  transform: translateY(-1px);
}
</style>
