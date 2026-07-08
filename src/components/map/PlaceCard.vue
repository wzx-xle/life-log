<script setup lang="ts">
import type { Place } from '@/types'
import { useCategoryDisplay } from '@/composables/useCategoryDisplay'

const { getLabel, getColor } = useCategoryDisplay()

defineProps<{
  place: Place
  averageRating: number
}>()

const emit = defineEmits<{
  writeReview: [place: Place]
  viewDetail: [place: Place]
  close: []
}>()

const starArray = Array.from({ length: 5 }, (_, i) => i + 1)
</script>

<template>
  <div class="place-card">
    <div class="card-header">
      <h3 class="place-name">{{ place.name }}</h3>
      <button class="close-btn" @click="emit('close')">
        <van-icon name="cross" size="16" />
      </button>
    </div>

    <div class="card-body">
      <div class="rating-row">
        <span class="stars">
          <template v-for="n in starArray" :key="n">
            <span v-if="n <= Math.round(averageRating)" class="star filled">★</span>
            <span v-else class="star empty">★</span>
          </template>
        </span>
        <span class="rating-num" v-if="averageRating > 0">{{ averageRating.toFixed(1) }}</span>
        <span class="rating-num dim" v-else>暂无评分</span>
      </div>

      <div class="info-row">
        <span class="category-tag" :style="{ background: getColor(place) }">
          {{ getLabel(place) }}
        </span>
        <span class="address">{{ place.address }}</span>
      </div>
    </div>

    <div class="card-actions">
      <van-button type="primary" round block @click="emit('writeReview', place)">
        写记录
      </van-button>
      <van-button plain round block @click="emit('viewDetail', place)">
        查看详情
      </van-button>
    </div>
  </div>
</template>

<style scoped>
.place-card {
  position: fixed;
  bottom: 60px;
  left: 12px;
  right: 12px;
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  border: var(--border-thick);
  box-shadow: var(--shadow-hard);
  padding: var(--spacing-lg);
  z-index: 200;
  animation: slideUp 0.25s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.place-name {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.close-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.card-body {
  margin-bottom: var(--spacing-md);
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: var(--spacing-sm);
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 16px;
  line-height: 1;
}

.star.filled {
  color: var(--color-star-active);
}

.star.empty {
  color: var(--color-star-inactive);
}

.rating-num {
  font-size: var(--font-size-sm);
  color: var(--color-star-active);
  font-weight: 600;
}

.rating-num.dim {
  color: var(--color-text-secondary);
  font-weight: 400;
}

.info-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.category-tag {
  font-size: var(--font-size-xs);
  color: #fff;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
}

.address {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-actions {
  display: flex;
  gap: var(--spacing-sm);
}
</style>
