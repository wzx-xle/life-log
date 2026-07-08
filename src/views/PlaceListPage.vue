<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlaceStore } from '@/stores/usePlaceStore'
import { useCategoryDisplay } from '@/composables/useCategoryDisplay'
import type { Place } from '@/types'

defineOptions({ name: 'PlaceListPage' })

const router = useRouter()
const store = usePlaceStore()
const { loadCustomCategories, getLabel, getColor } = useCategoryDisplay()
const loading = ref(true)

interface PlaceGroup {
  label: string
  items: Place[]
}

const placeGroups = computed<PlaceGroup[]>(() => {
  const groupMap: Record<string, Place[]> = {}

  for (const place of store.places) {
    const label = getLabel(place)
    if (!groupMap[label]) {
      groupMap[label] = []
    }
    groupMap[label].push(place)
  }

  return Object.entries(groupMap).map(([label, items]) => ({ label, items }))
})

const goToPlace = (id?: number) => {
  router.push({ name: 'placeDetail', params: { id } })
}

const goToAddPlace = () => {
  router.push({ name: 'addPlace' })
}

onMounted(async () => {
  await Promise.all([store.fetchPlaces(), loadCustomCategories()])
  loading.value = false
})
</script>

<template>
  <div class="place-list-page">
    <div class="page-header">
      <span class="page-title">店铺</span>
    </div>

    <van-loading v-if="loading" class="loading-wrap" />

    <template v-else-if="store.places.length > 0">
      <div v-for="group in placeGroups" :key="group.label" class="place-group">
        <div class="group-header">
          <span class="group-label">{{ group.label }}</span>
          <span class="group-count">{{ group.items.length }}家</span>
        </div>
        <div
          v-for="place in group.items"
          :key="place.id"
          class="place-item"
          @click="goToPlace(place.id)"
        >
          <div class="place-left">
            <span
              class="place-dot"
              :style="{ backgroundColor: getColor(place) }"
            ></span>
            <div class="place-info">
              <span class="place-name">{{ place.name }}</span>
              <span class="place-category">{{ getLabel(place) }}</span>
            </div>
          </div>
          <van-icon name="arrow" size="14" color="var(--color-text-light)" />
        </div>
      </div>
    </template>

    <van-empty v-else description="还没有店铺，点击右下角 + 添加" />

    <div class="fab" @click="goToAddPlace">
      <van-icon name="plus" size="24" color="#fff" />
    </div>
  </div>
</template>

<style scoped>
.place-list-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-bottom: var(--safe-bottom);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  background: var(--color-bg-white);
  border-bottom: var(--border-thick);
  position: sticky;
  top: 0;
  z-index: 10;
}

.page-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
  font-family: "Noto Serif SC", "Source Han Serif SC", "SimSun", serif;
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.place-group {
  margin-top: var(--spacing-sm);
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-lg);
}

.group-label {
  font-size: var(--font-size-md);
  font-weight: 700;
  color: var(--color-text);
  font-family: "Noto Serif SC", "Source Han Serif SC", "SimSun", serif;
  border-bottom: var(--border-thick);
  padding-bottom: var(--spacing-xs);
}

.group-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.place-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg-white);
  border-bottom: var(--border-thick);
  cursor: pointer;
}

.place-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.place-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.place-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.place-name {
  font-size: var(--font-size-md);
  color: var(--color-text);
}

.place-category {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.fab {
  position: fixed;
  right: var(--spacing-lg);
  bottom: calc(50px + var(--spacing-lg) + var(--safe-bottom));
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-hard);
  z-index: 20;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.fab:active {
  transform: translate(2px, 2px);
  box-shadow: var(--shadow-hard-sm);
}
</style>
