<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tabs = [
  { name: 'map', label: '地图', icon: 'location-o' },
  { name: 'reviews', label: '记录', icon: 'notes-o' },
  { name: 'add', label: '＋添加', icon: 'plus' },
  { name: 'stats', label: '统计', icon: 'chart-trending-o' },
  { name: 'settings', label: '设置', icon: 'setting-o' },
]

const active = (): string => {
  const name = String(route.name || '')
  if (name === 'map' || name.startsWith('places')) return 'map'
  if (name === 'reviews' || name.startsWith('reviews')) return 'reviews'
  if (name === 'stats') return 'stats'
  if (name === 'settings') return 'settings'
  return name || 'map'
}

const onTabClick = (tab: (typeof tabs)[number]) => {
  if (tab.name === 'add') {
    router.push({ name: 'addReview' })
    return
  }
  router.push({ name: tab.name })
}
</script>

<template>
  <div class="tab-bar safe-bottom" v-if="route.meta.tabBar">
    <div
      v-for="tab in tabs"
      :key="tab.name"
      :class="['tab-item', { active: active() === tab.name, 'tab-add': tab.name === 'add' }]"
      @click.stop="onTabClick(tab)"
    >
      <div class="tab-icon">
        <van-icon v-if="tab.name !== 'add'" :name="tab.icon" />
        <span v-else class="add-text">＋</span>
      </div>
      <span class="tab-label">{{ tab.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 50px;
  background: var(--color-bg-white);
  border-top: 1px solid var(--color-border);
  z-index: 100;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 4px 0;
  cursor: pointer;
}

.tab-item.active .tab-label {
  color: var(--color-primary);
}

.tab-add .tab-icon {
  background: var(--color-primary);
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -8px;
}

.add-text {
  font-size: 20px;
  font-weight: bold;
}

.tab-icon {
  font-size: 20px;
}

.tab-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}
</style>
