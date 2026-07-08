<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Place, Review } from '@/types'
import { useDatabase } from '@/composables/useDatabase'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()
const { getPlaceById, getReviewsByPlaceId, getPlaceReviewCount } = useDatabase()

const place = ref<Place | null>(null)
const reviews = ref<Review[]>([])
const reviewCount = ref(0)
const loading = ref(true)

const placeId = computed(() => Number(route.params.id))

const categoryLabels: Record<string, string> = {
  restaurant: '餐饮',
  hotel: '住宿',
  retail: '零售',
  service: '生活服务',
  entertainment: '娱乐休闲',
  custom: '自定义',
}

const categoryColors: Record<string, string> = {
  restaurant: 'var(--color-restaurant)',
  hotel: 'var(--color-hotel)',
  retail: 'var(--color-retail)',
  service: 'var(--color-service)',
  entertainment: 'var(--color-entertainment)',
  custom: 'var(--color-custom)',
}

const getCategoryColor = (cat: string) => categoryColors[cat] || 'var(--color-custom)'
const getCategoryLabel = (cat: string) => categoryLabels[cat] || cat

const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0
  const sum = reviews.value.reduce((acc, r) => acc + (r.rating?.overall || 0), 0)
  return sum / reviews.value.length
})

const fullStars = computed(() => Math.round(averageRating.value))

const phoneDisplay = computed(() => place.value?.phone
  ? place.value.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3')
  : '')

const fetchData = async () => {
  const id = placeId.value
  if (!id) {
    router.replace({ name: 'reviews' })
    return
  }
  loading.value = true
  const p = await getPlaceById(id)
  if (!p) {
    showToast('店铺不存在')
    router.replace({ name: 'reviews' })
    return
  }
  place.value = p
  const [revs, count] = await Promise.all([
    getReviewsByPlaceId(id),
    getPlaceReviewCount(id),
  ])
  reviews.value = revs
  reviewCount.value = count
  loading.value = false
}

onMounted(fetchData)
watch(placeId, () => {
  if (placeId.value) fetchData()
})

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'reviews' })
  }
}

const openNavigation = () => {
  if (!place.value) return
  const { name, lat, lng } = place.value
  window.open(
    `https://uri.amap.com/navigation?to=${lng},${lat},${encodeURIComponent(name)}&mode=car&coordinate=gaode`,
    '_blank'
  )
}

const callPhone = () => {
  if (place.value?.phone) {
    window.open(`tel:${place.value.phone}`, '_self')
  }
}

const formatDate = (d: Date | string) => {
  const date = new Date(d)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const formatAmount = (amount?: number) => {
  if (!amount) return ''
  return `¥${amount.toFixed(2)}`
}

const goEditPlace = () => {
  router.push({ name: 'editPlace', params: { id: placeId.value } })
}

const goAddReview = () => {
  router.push({ name: 'addReview', query: { placeId: placeId.value } })
}

const goEditReview = (reviewId: number) => {
  router.push({ name: 'editReview', params: { id: reviewId } })
}
</script>

<template>
  <div class="page-wrapper">
    <van-nav-bar title="店铺详情" left-text="返回" left-arrow @click-left="goBack" />

    <van-loading v-if="loading" class="loading-center" />

    <template v-else-if="place">
      <div class="photo-section">
        <van-swipe
          v-if="place.photos && place.photos.length > 0"
          :autoplay="3000"
          indicator-color="white"
          class="photo-swipe"
        >
          <van-swipe-item v-for="(photo, index) in place.photos" :key="index">
            <div class="photo-slide">
              <img :src="photo" class="photo-image" />
            </div>
          </van-swipe-item>
        </van-swipe>
        <div
          v-else
          class="photo-placeholder"
          :style="{ backgroundColor: getCategoryColor(place.category) }"
        >
          <van-icon name="shop-o" size="48" color="#fff" />
          <span class="placeholder-text">{{ getCategoryLabel(place.category) }}</span>
        </div>
      </div>

      <div class="info-header">
        <h2 class="place-name">{{ place.name }}</h2>
        <span
          class="category-badge"
          :style="{ backgroundColor: getCategoryColor(place.category) }"
        >
          {{ place.customCategory || getCategoryLabel(place.category) }}
        </span>
      </div>

      <div v-if="reviews.length > 0" class="rating-card">
        <div class="rating-score">
          <span class="score-number">{{ averageRating.toFixed(1) }}</span>
          <span class="score-total">/5</span>
        </div>
        <div class="rating-stars">
          <van-icon
            v-for="i in 5"
            :key="i"
            :name="i <= fullStars ? 'star' : 'star-o'"
            :color="i <= fullStars ? 'var(--color-star-active)' : 'var(--color-star-inactive)'"
            size="16"
          />
        </div>
        <span class="rating-count">{{ reviews.length }} 条记录</span>
      </div>

      <div class="info-cards">
        <div class="info-card">
          <van-icon name="location-o" size="16" color="var(--color-text-secondary)" />
          <span class="info-text">{{ place.address }}</span>
        </div>
        <div v-if="place.phone" class="info-card info-card-tap" @click="callPhone">
          <van-icon name="phone-o" size="16" color="var(--color-text-secondary)" />
          <span class="info-text">{{ phoneDisplay }}</span>
          <van-icon name="arrow" size="12" color="var(--color-text-light)" />
        </div>
        <div v-if="place.businessHours" class="info-card">
          <van-icon name="clock-o" size="16" color="var(--color-text-secondary)" />
          <span class="info-text">{{ place.businessHours }}</span>
        </div>
      </div>

      <div v-if="place.tags && place.tags.length > 0" class="tags-section">
        <van-tag
          v-for="(tag, index) in place.tags"
          :key="index"
          size="medium"
          type="primary"
          plain
        >
          {{ tag }}
        </van-tag>
      </div>

      <div class="action-buttons">
        <van-button
          icon="guide-o"
          type="primary"
          round
          @click="openNavigation"
        >
          导航
        </van-button>
        <van-button
          v-if="place.phone"
          icon="phone-o"
          type="default"
          round
          @click="callPhone"
        >
          电话
        </van-button>
      </div>

      <div class="reviews-section">
        <div class="reviews-header">
          <span class="reviews-title">消费记录</span>
          <span class="reviews-count">{{ reviews.length }} 条</span>
        </div>

        <div v-if="reviews.length === 0" class="reviews-empty">
          <van-empty description="暂无消费记录" />
        </div>

        <div
          v-for="review in reviews"
          :key="review.id"
          class="review-item"
          @click="goEditReview(review.id!)"
        >
          <div class="review-top">
            <span class="review-date">{{ formatDate(review.date) }}</span>
            <span v-if="review.amount" class="review-amount">{{ formatAmount(review.amount) }}</span>
          </div>
          <div v-if="review.rating?.overall" class="review-rating">
            <van-icon
              v-for="i in 5"
              :key="i"
              :name="i <= (review.rating.overall || 0) ? 'star' : 'star-o'"
              :color="i <= (review.rating.overall || 0) ? 'var(--color-star-active)' : 'var(--color-star-inactive)'"
              size="12"
            />
          </div>
          <div v-if="review.content" class="review-content text-ellipsis">{{ review.content }}</div>
          <div v-if="review.tags && review.tags.length > 0" class="review-tags">
            <van-tag
              v-for="(tag, idx) in review.tags"
              :key="idx"
              size="medium"
              type="primary"
              plain
            >
              {{ tag }}
            </van-tag>
          </div>
        </div>
      </div>

      <div class="bottom-bar safe-bottom">
        <van-button round block type="default" @click="goEditPlace">编辑店铺</van-button>
        <van-button round block type="primary" @click="goAddReview">写记录</van-button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  background: var(--color-bg);
  padding-bottom: 64px;
}

.page-wrapper :deep(.van-nav-bar) {
  background: var(--color-bg-white);
}

.loading-center {
  display: flex;
  justify-content: center;
  padding-top: 40px;
}

.photo-section {
  position: relative;
}

.photo-swipe {
  height: 200px;
}

.photo-slide {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.placeholder-text {
  font-size: var(--font-size-sm);
  color: rgba(255, 255, 255, 0.8);
}

.info-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--color-bg-white);
}

.place-name {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text);
  flex: 1;
}

.category-badge {
  padding: 2px 10px;
  border-radius: var(--radius-round);
  font-size: var(--font-size-xs);
  color: #fff;
  white-space: nowrap;
}

.rating-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg-white);
  margin-bottom: 1px;
}

.rating-score {
  display: flex;
  align-items: baseline;
}

.score-number {
  font-size: var(--font-size-xxl);
  font-weight: 700;
  color: var(--color-text);
}

.score-total {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-left: 2px;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.rating-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-left: auto;
}

.info-cards {
  background: var(--color-bg-white);
  margin-bottom: 1px;
}

.info-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
}

.info-card + .info-card {
  border-top: 1px solid var(--color-border);
}

.info-card-tap:active {
  background: var(--color-bg);
}

.info-text {
  flex: 1;
  font-size: var(--font-size-md);
  color: var(--color-text);
}

.tags-section {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg-white);
  margin-bottom: 1px;
}

.action-buttons {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--color-bg-white);
  margin-bottom: var(--spacing-sm);
}

.action-buttons .van-button {
  flex: 1;
}

.reviews-section {
  background: var(--color-bg-white);
  margin-bottom: var(--spacing-sm);
}

.reviews-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  padding-bottom: var(--spacing-sm);
}

.reviews-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.reviews-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.reviews-empty {
  padding-bottom: var(--spacing-xl);
}

.review-item {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  transition: background 0.15s;
}

.review-item:active {
  background: var(--color-bg);
}

.review-item:last-child {
  border-bottom: none;
}

.review-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.review-date {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.review-amount {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-primary);
}

.review-rating {
  display: flex;
  gap: 1px;
  margin-bottom: 4px;
}

.review-content {
  font-size: var(--font-size-md);
  color: var(--color-text);
  margin-bottom: 4px;
}

.review-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg-white);
  border-top: 1px solid var(--color-border);
  z-index: 50;
}

.bottom-bar .van-button {
  flex: 1;
}
</style>
