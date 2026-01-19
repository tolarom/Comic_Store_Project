<template>
   <div><Header /></div>
  <div class="min-h-screen bg-gray-50 p-6 ml-[250px] mt-10">
    <div class="w-full">
      <!-- Breadcrumb -->
      <div class="flex items-center text-sm text-gray-600 mb-4">
        <i class="pi pi-home text-gray-400"></i>
        <span class="mx-2">/</span>
        <span>Profile</span>
      </div>

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p class="text-gray-600">Manage your profile information and settings.</p>
      </div>

      <!-- Profile Card -->
      <div class="bg-gray-200 rounded-lg p-8 mb-6">
        <div class="flex items-start gap-6">
          <!-- Avatar -->
          <div class="relative">
            <img
              :src="profileData.avatar"
              alt="Profile"
              class="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <button
              @click="triggerAvatarUpload"
              class="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
            >
              <i class="pi pi-camera text-sm"></i>
            </button>
            <input
              ref="avatarInput"
              @change="handleAvatarUpload"
              type="file"
              accept="image/*"
              class="hidden"
            />
          </div>

          <!-- Profile Info -->
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h2 class="text-2xl font-bold text-gray-900">{{ profileData.fullName }}</h2>
              <span class="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                Pro Member
              </span>
              <span class="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                Verified
              </span>
            </div>
            <p class="text-gray-700 mb-4">{{ profileData.position }} at {{ profileData.company }}</p>
            <p class="text-gray-600 mb-4">{{ profileData.bio }}</p>

            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="flex items-center gap-2 text-gray-700">
                <i class="pi pi-envelope text-gray-500"></i>
                <span>{{ profileData.email }}</span>
              </div>
              <div class="flex items-center gap-2 text-gray-700">
                <i class="pi pi-phone text-gray-500"></i>
                <span>{{ profileData.phone }}</span>
              </div>
              <div class="flex items-center gap-2 text-gray-700">
                <i class="pi pi-map-marker text-gray-500"></i>
                <span>{{ profileData.location }}</span>
              </div>
              <div class="flex items-center gap-2 text-gray-700">
                <i class="pi pi-calendar text-gray-500"></i>
                <span>Joined {{ profileData.joinedDate }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-300 mb-6">
        <div class="flex gap-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'pb-3 font-medium transition-colors relative',
              activeTab === tab.id
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            {{ tab.label }}
            <div
              v-if="activeTab === tab.id"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
            ></div>
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="bg-white rounded-lg shadow-sm p-8">
        <!-- Profile Details Tab -->
        <div v-if="activeTab === 'profile'">
          <h3 class="text-xl font-bold text-gray-900 mb-6">Personal Information</h3>

          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                v-model="profileData.fullName"
                type="text"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                v-model="profileData.email"
                type="email"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                v-model="profileData.phone"
                type="tel"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                v-model="profileData.location"
                type="text"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                v-model="profileData.bio"
                rows="4"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <input
                v-model="profileData.company"
                type="text"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Position
              </label>
              <input
                v-model="profileData.position"
                type="text"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div class="flex justify-end mt-6">
            <button
              @click="saveProfileChanges"
              class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <i class="pi pi-save"></i>
              Save Changes
            </button>
          </div>
        </div>

        <!-- Account Settings Tab -->
        <div v-if="activeTab === 'settings'">
          <h3 class="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h3>

          <div class="space-y-6">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="flex items-center justify-between py-4 border-b border-gray-100 last:border-0"
            >
              <div>
                <h4 class="font-semibold text-gray-900 mb-1">{{ notification.title }}</h4>
                <p class="text-sm text-gray-600">{{ notification.description }}</p>
              </div>
              <button
                @click="toggleNotification(notification.id)"
                :class="[
                  'relative w-14 h-7 rounded-full transition-colors',
                  notification.enabled ? 'bg-blue-600' : 'bg-gray-300'
                ]"
              >
                <span
                  :class="[
                    'absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform',
                    notification.enabled ? 'right-0.5' : 'left-0.5'
                  ]"
                ></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Security Tab -->
        <div v-if="activeTab === 'security'">
          <h3 class="text-xl font-bold text-gray-900 mb-6">Change Password</h3>

          <div class="max-w-2xl space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                v-model="passwordData.current"
                type="password"
                placeholder="Enter Current Password"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                v-model="passwordData.new"
                type="password"
                placeholder="Enter New Password"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                v-model="passwordData.confirm"
                type="password"
                placeholder="Confirm New Password"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>

            <div class="flex justify-end">
              <button
                @click="updatePassword"
                class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <i class="pi pi-lock"></i>
                Update Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import Header from '../../components/Admin/NavigationBar.vue';

export default {
  name: 'AdminProfile',
    components: {
    Header,
  },
  setup() {
    const activeTab = ref('profile');
    const avatarInput = ref(null);

    const tabs = ref([
      { id: 'profile', label: 'Profile Details' },
      { id: 'settings', label: 'Account Settings' },
      { id: 'security', label: 'Security' }
    ]);

    const profileData = ref({
      fullName: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '+(855) 123-4567',
      location: 'PhnomPenh, CAMBODIA',
      bio: 'Senior Product Designer with 8+ years of experience in creating user-centered designs for web and mobile applications. Passionate about building intuitive and accessible interfaces.',
      company: 'COMIC Inc.',
      position: 'Senior Product Designer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      joinedDate: 'January 2024'
    });

    const notifications = ref([
      {
        id: 'email',
        title: 'Email Notifications',
        description: 'Receive email notifications for important updates',
        enabled: true
      },
      {
        id: 'push',
        title: 'Push Notifications',
        description: 'Receive push notifications on your device',
        enabled: true
      },
      {
        id: 'digest',
        title: 'Weekly Digest',
        description: 'Get a weekly summary of your activity',
        enabled: true
      },
      {
        id: 'updates',
        title: 'Product Updates',
        description: 'Receive updates about new features and improvements',
        enabled: true
      }
    ]);

    const passwordData = ref({
      current: '',
      new: '',
      confirm: ''
    });

    const triggerAvatarUpload = () => {
      avatarInput.value.click();
    };

    const handleAvatarUpload = (event) => {
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
        profileData.value.avatar = e.target.result;
      };
      reader.readAsDataURL(file);
    };

    const toggleNotification = (id) => {
      const notification = notifications.value.find(n => n.id === id);
      if (notification) {
        notification.enabled = !notification.enabled;
      }
    };

    const saveProfileChanges = () => {
      // API call to save profile changes
      alert('Profile updated successfully!');
      console.log('Saving profile data:', profileData.value);
    };

    const updatePassword = () => {
      if (!passwordData.value.current || !passwordData.value.new || !passwordData.value.confirm) {
        alert('Please fill in all password fields');
        return;
      }

      if (passwordData.value.new !== passwordData.value.confirm) {
        alert('New passwords do not match');
        return;
      }

      if (passwordData.value.new.length < 8) {
        alert('Password must be at least 8 characters long');
        return;
      }

      // API call to update password
      alert('Password updated successfully!');
      console.log('Updating password');

      // Reset form
      passwordData.value = {
        current: '',
        new: '',
        confirm: ''
      };
    };

    return {
      activeTab,
      tabs,
      profileData,
      notifications,
      passwordData,
      avatarInput,
      triggerAvatarUpload,
      handleAvatarUpload,
      toggleNotification,
      saveProfileChanges,
      updatePassword
    };
  }
};
</script>

<style scoped>
/* Add any additional custom styles here */
</style>
