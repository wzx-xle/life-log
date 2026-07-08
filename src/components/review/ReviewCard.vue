<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog } from 'vant'
import { useDatabase } from '@/composables/useDatabase'
import { useCategoryDisplay } from '@/composables/useCategoryDisplay'
import type { Review, Place } from '@/types'
import RatingStar from './RatingStar.vue'

defineOptions({ name: 'ReviewCard' })

const props = defineProps<{
  review: Review & { place?: Place }
}>()

const router = useRouter()
const { deleteReview } = useDatabase()
const { getColor } = useCategoryDisplay()

const emit = defineEmits<{
  deleted: [id: number]
}>()

const categoryColor = computed(() => {
  const place = props.review.place
  if (!place) return 'var(--color-text-light)'
  return getColor(place)
})

const contentPreview = computed(() => {
  const text = props.review.content || ''
  if (text.length > 50) return text.slice(0, 50) + '...'
  return text
})

const formattedDate = computed(() => {
  const d = new Date(props.review.date)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${m}-${day}`
})

const handleClick = () => {
  router.push({ name: 'editReview', params: { id: props.review.id } })
}

const handleDelete = () => {
  showConfirmDialog({
    title: '确认删除',
    message: '删除后不可恢复，确定要删除这条记录吗？',
  })
    .then(async () => {
      if (props.review.id != null) {
        await deleteReview(props.review.id)
        emit('deleted', props.review.id)
      }
    })
    .catch(() => {})
}
</script>

<template>
  <van-swipe-cell :right-width="65">
    <div class="review-card" @click="handleClick">
      <div class="card-header">
        <span class="place-name">
          <i class="category-dot" :style="{ backgroundColor: categoryColor }"></i>
          {{ review.place?.name || '未知地点' }}
        </span>
        <span class="review-date">{{ formattedDate }}</span>
      </div>

      <div class="card-rating" v-if="review.rating?.overall">
        <RatingStar :model-value="review.rating.overall" size="14px" />
      </div>

      <p class="card-content" v-if="review.content">{{ contentPreview }}</p>

      <div class="card-footer">
        <span class="card-amount" v-if="review.amount">
          ¥{{ review.amount }}
        </span>
        <div class="card-tags" v-if="review.tags && review.tags.length > 0">
          <van-tag
            v-for="tag in review.tags.slice(0, 3)"
            :key="tag"
            plain
            type="default"
          >{{ tag }}</van-tag>
        </div>
      </div>
    </div>

    <template #right>
      <van-button square type="danger" text="删除" class="delete-btn" @click.stop="handleDelete" />
    </template>
  </van-swipe-cell>
</template>

<style scoped>
.review-card {
  background: var(--color-bg-white);
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xs);
}

.place-name {
  font-size: var(--font-size-lg);
  font-weight: 500;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.category-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.review-date {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.card-rating {
  margin: var(--spacing-xs) 0;
}

.card-content {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: var(--spacing-xs) 0;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);
}

.card-amount {
  font-size: var(--font-size-md);
  color: var(--color-primary);
  font-weight: 500;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.delete-btn {
  height: 100%;
}
</style>
