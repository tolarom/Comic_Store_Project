<template>
  <div><Header /></div>
  <div class="min-h-screen bg-gray-50 p-6 ml-[250px] mt-10">
    <div class="w-full">
      <!-- Breadcrumb -->
      <div class="flex items-center text-sm text-gray-600 mb-4">
        <i class="pi pi-home text-gray-400"></i>
        <span class="mx-2">/</span>
        <span>Settings</span>
      </div>

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p class="text-gray-600">Manage your account settings and preferences.</p>
      </div>

      <!-- Settings Card -->
      <div class="bg-white rounded-lg shadow-sm p-8">
        <!-- Section Header -->
        <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">Profile Information</h2>
          <button class="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
            Public
          </button>
        </div>

        <!-- Profile Photo -->
        <div class="mb-8">
          <label class="block text-sm font-medium text-gray-700 mb-3">
            Profile Photo
          </label>
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {{ getInitials(settingsData.firstName, settingsData.lastName) }}
            </div>
            <div class="flex gap-3">
              <button
                @click="triggerPhotoUpload"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <i class="pi pi-camera"></i>
                Change Photo
              </button>
              <button
                @click="removePhoto"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <i class="pi pi-trash"></i>
                Remove
              </button>
            </div>
            <input
              ref="photoInput"
              @change="handlePhotoUpload"
              type="file"
              accept="image/*"
              class="hidden"
            />
          </div>
        </div>

        <!-- Name Fields -->
        <div class="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              v-model="settingsData.firstName"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              v-model="settingsData.lastName"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <!-- Email Field -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            v-model="settingsData.email"
            type="email"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p class="text-xs text-gray-500 mt-2">Your email is private.</p>
        </div>

        <!-- Username Field -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            v-model="settingsData.username"
            type="text"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p class="text-xs text-gray-500 mt-2">This will be your public username.</p>
        </div>

        <!-- Bio Field -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            v-model="settingsData.bio"
            rows="4"
            maxlength="180"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
          <p class="text-xs text-gray-500 mt-2">
            Brief description for your profile. Max 180 characters.
          </p>
        </div>

        <!-- Website and Location -->
        <div class="grid grid-cols-2 gap-6 mb-8">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              v-model="settingsData.website"
              type="url"
              placeholder="https://johndoe.com"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              v-model="settingsData.location"
              type="text"
              placeholder="San Francisco, CA"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            @click="cancelChanges"
            class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="saveChanges"
            class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>

      <!-- Account Settings Section -->
      <div class="bg-white rounded-lg shadow-sm p-8 mt-6">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Account Settings</h2>

        <!-- Email Preferences -->
        <div class="space-y-4">
          <div class="flex items-center justify-between py-4 border-b border-gray-100">
            <div>
              <h3 class="font-semibold text-gray-900">Email Notifications</h3>
              <p class="text-sm text-gray-600">Receive email updates about your account activity</p>
            </div>
            <button
              @click="toggleSetting('emailNotifications')"
              :class="[
                'relative w-14 h-7 rounded-full transition-colors',
                accountSettings.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
              ]"
            >
              <span
                :class="[
                  'absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform',
                  accountSettings.emailNotifications ? 'right-0.5' : 'left-0.5'
                ]"
              ></span>
            </button>
          </div>

          <div class="flex items-center justify-between py-4 border-b border-gray-100">
            <div>
              <h3 class="font-semibold text-gray-900">Marketing Emails</h3>
              <p class="text-sm text-gray-600">Receive emails about new features and updates</p>
            </div>
            <button
              @click="toggleSetting('marketingEmails')"
              :class="[
                'relative w-14 h-7 rounded-full transition-colors',
                accountSettings.marketingEmails ? 'bg-blue-600' : 'bg-gray-300'
              ]"
            >
              <span
                :class="[
                  'absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform',
                  accountSettings.marketingEmails ? 'right-0.5' : 'left-0.5'
                ]"
              ></span>
            </button>
          </div>

          <div class="flex items-center justify-between py-4">
            <div>
              <h3 class="font-semibold text-gray-900">Two-Factor Authentication</h3>
              <p class="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <button
              @click="toggleSetting('twoFactorAuth')"
              :class="[
                'relative w-14 h-7 rounded-full transition-colors',
                accountSettings.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-300'
              ]"
            >
              <span
                :class="[
                  'absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform',
                  accountSettings.twoFactorAuth ? 'right-0.5' : 'left-0.5'
                ]"
              ></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="bg-white rounded-lg shadow-sm p-8 mt-6 border border-red-200">
        <h2 class="text-xl font-bold text-red-600 mb-6">Danger Zone</h2>

        <div class="space-y-4">
          <div class="flex items-center justify-between py-4 border-b border-gray-100">
            <div>
              <h3 class="font-semibold text-gray-900">Deactivate Account</h3>
              <p class="text-sm text-gray-600">Temporarily disable your account</p>
            </div>
            <button
              @click="deactivateAccount"
              class="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              Deactivate
            </button>
          </div>

          <div class="flex items-center justify-between py-4">
            <div>
              <h3 class="font-semibold text-gray-900">Delete Account</h3>
              <p class="text-sm text-gray-600">Permanently delete your account and all data</p>
            </div>
            <button
              @click="deleteAccount"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import Header from '../../components/Admin/NavigationBar.vue';

export default {
  name: 'SettingsPage',
    components: {
    Header,
  },
  setup() {
    const photoInput = ref(null);
    const originalSettings = ref(null);

    const settingsData = ref({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      username: 'johndoe',
      bio: 'Product designer and developer',
      website: 'https://johndoe.com',
      location: 'San Francisco, CA',
      profilePhoto: null
    });

    const accountSettings = ref({
      emailNotifications: true,
      marketingEmails: true,
      twoFactorAuth: false
    });

    // Store original settings for cancel functionality
    originalSettings.value = JSON.parse(JSON.stringify(settingsData.value));

    const getInitials = (firstName, lastName) => {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const triggerPhotoUpload = () => {
      photoInput.value.click();
    };

    const handlePhotoUpload = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPG, PNG, GIF, or WebP)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        settingsData.value.profilePhoto = e.target.result;
      };
      reader.readAsDataURL(file);
    };

    const removePhoto = () => {
      if (confirm('Are you sure you want to remove your profile photo?')) {
        settingsData.value.profilePhoto = null;
      }
    };

    const toggleSetting = (setting) => {
      accountSettings.value[setting] = !accountSettings.value[setting];
    };

    const saveChanges = () => {
      // API call to save settings
      console.log('Saving settings:', settingsData.value);
      alert('Settings saved successfully!');
      originalSettings.value = JSON.parse(JSON.stringify(settingsData.value));
    };

    const cancelChanges = () => {
      settingsData.value = JSON.parse(JSON.stringify(originalSettings.value));
    };

    const deactivateAccount = () => {
      if (confirm('Are you sure you want to deactivate your account? You can reactivate it anytime by logging in.')) {
        console.log('Deactivating account...');
        alert('Account deactivated');
      }
    };

    const deleteAccount = () => {
      const confirmation = prompt('This action cannot be undone. Type "DELETE" to confirm:');
      if (confirmation === 'DELETE') {
        console.log('Deleting account...');
        alert('Account deletion initiated');
      }
    };

    return {
      photoInput,
      settingsData,
      accountSettings,
      getInitials,
      triggerPhotoUpload,
      handlePhotoUpload,
      removePhoto,
      toggleSetting,
      saveChanges,
      cancelChanges,
      deactivateAccount,
      deleteAccount
    };
  }
};
</script>

<style scoped>
/* Additional styles if needed */
</style>
