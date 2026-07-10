<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import TabBar from '@/components/common/TabBar.vue'

// 自动锁定为“闲置超时”：用户有操作时刷新 unlock_time，避免长时间编辑等操作后
// 保存触发导航被误判超时而弹锁屏。安全门控：仅续期“当前仍有效”的会话——
// 未解锁(unlock_time=0)或已过期的会话不续期，防止锁屏输入延长会话绕过验证。
let lastRefresh = 0
function refreshUnlockTime() {
  if (localStorage.getItem('pwd_enabled') !== 'true') return
  const unlockTime = Number(sessionStorage.getItem('unlock_time') || '0')
  if (unlockTime === 0) return
  const mins = Number(localStorage.getItem('auto_lock_minutes') || '5')
  if (mins > 0 && Date.now() - unlockTime > mins * 60 * 1000) return
  const now = Date.now()
  if (now - lastRefresh < 20000) return // 节流：最多每 20s 写一次
  lastRefresh = now
  sessionStorage.setItem('unlock_time', String(now))
}

// 捕获阶段监听：window 捕获处理器最先触发，即使地图等子组件对手势事件
// stopPropagation 也拦不住，确保地图选点等长交互页面同样能续期。
const activityEvents = ['pointerdown', 'keydown', 'touchstart']
const listenerOpts = { capture: true, passive: true }
onMounted(() => activityEvents.forEach((e) => window.addEventListener(e, refreshUnlockTime, listenerOpts)))
onUnmounted(() => activityEvents.forEach((e) => window.removeEventListener(e, refreshUnlockTime, listenerOpts)))
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
