<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tabs = [
  { name: 'reviews', label: '记录', icon: 'notes-o' },
  { name: 'places', label: '店铺', icon: 'shop-o' },
  { name: 'stats', label: '统计', icon: 'chart-trending-o' },
  { name: 'settings', label: '设置', icon: 'setting-o' },
]

const active = (): string => {
  const name = String(route.name || '')
  if (name === 'reviews' || name === 'editReview' || name === 'addReview') return 'reviews'
  if (name === 'places' || name === 'placeDetail' || name === 'addPlace' || name === 'editPlace') return 'places'
  if (name === 'stats') return 'stats'
  if (name === 'settings') return 'settings'
  return 'reviews'
}

const onTabClick = (tab: (typeof tabs)[number]) => {
  router.push({ name: tab.name })
}
</script>

<template>
  <div class="tab-bar safe-bottom" v-if="route.meta.tabBar">
    <div
      v-for="tab in tabs"
      :key="tab.name"
      :class="['tab-item', { active: active() === tab.name }]"
      @click.stop="onTabClick(tab)"
    >
      <div class="tab-icon">
        <van-icon :name="tab.icon" size="22" />
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
  height: 56px;
  background: var(--color-bg-white);
  border-top: var(--border-thick);
  z-index: 100;
  padding-top: var(--spacing-xs)
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
  color: var(--color-text);
  font-weight: 700;
}

.tab-item .tab-icon {
  font-size: 22px;
}

.tab-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}
</style>
