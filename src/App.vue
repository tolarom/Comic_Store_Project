<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuth } from './composables/useAuth'
import { onMounted } from 'vue'

const { initializeAuth } = useAuth()

onMounted(() => {
  initializeAuth()
})
</script>

<template>
  <RouterView />
</template>
