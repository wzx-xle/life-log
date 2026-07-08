<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlaceStore } from '@/stores/usePlaceStore'
import { useCategoryDisplay } from '@/composables/useCategoryDisplay'

defineOptions({ name: 'PlaceListPage' })

const router = useRouter()
const store = usePlaceStore()
const { loadCustomCategories, getLabel, getColor } = useCategoryDisplay()
const loading = ref(true)

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
      <van-icon name="plus" size="20" color="var(--color-primary)" @click="goToAddPlace" />
    </div>

    <van-loading v-if="loading" class="loading-wrap" />

    <template v-else-if="store.places.length > 0">
      <div
        v-for="place in store.places"
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
    </template>

    <van-empty v-else description="还没有店铺，点击右上角添加" />
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
  border-bottom: 1px solid var(--color-border);
}

.page-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.place-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg-white);
  border-bottom: 1px solid var(--color-border);
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
</style>
