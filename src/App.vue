<script setup lang="ts">
import TabBar from '@/components/common/TabBar.vue'
</script>

<template>
  <div class="app-root">
    <router-view v-slot="{ Component }">
      <transition name="page-slide" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <TabBar />
  </div>
</template>

<style>
.app-root {
  width: 100%;
  min-height: 100vh;
  padding-bottom: 50px;
}

.page-slide-enter-active,
.page-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
