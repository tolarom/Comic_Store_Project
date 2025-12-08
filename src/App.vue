<template>
  <div id="app" class="w-full min-h-screen">
    <router-view />
  </div>
</template>


<script setup lang="ts">
// No redirect needed now
</script>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

body {
  font-family: 'Inter', sans-serif;
}
</style>
