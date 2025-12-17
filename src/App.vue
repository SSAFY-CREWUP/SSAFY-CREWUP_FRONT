<script setup>
import Navbar from './components/common/Navbar.vue'
import Footer from './components/common/Footer.vue'
</script>

<template>
  <Navbar v-if="!$route.meta.hideNavbar" />
  <main>
    <RouterView />
  </main>
  <Footer v-if="!$route.meta.hideFooter" />
</template>

<style scoped>
/* No scoped styles needed for App.vue as layout is handled in main.css */
</style>
