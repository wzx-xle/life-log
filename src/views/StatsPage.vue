<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDatabase } from '@/composables/useDatabase'
import { useCategoryDisplay } from '@/composables/useCategoryDisplay'
import TrendChart from '@/components/stats/TrendChart.vue'
import CategoryPie from '@/components/stats/CategoryPie.vue'
import RatingBar from '@/components/stats/RatingBar.vue'
import type { Place, Review } from '@/types'

const router = useRouter()
const db = useDatabase()
const { loadCustomCategories, getLabel } = useCategoryDisplay()

const reviews = ref<Review[]>([])
const places = ref<Place[]>([])
const loading = ref(true)

const totalReviews = computed(() => reviews.value.length)
const totalAmount = computed(() => reviews.value.reduce((s, r) => s + (r.amount || 0), 0))

const uniquePlaceCount = computed(() => {
  const ids = new Set(reviews.value.map((r) => r.placeId))
  return ids.size
})

const topVenues = computed(() => {
  const countMap = new Map<number, number>()
  reviews.value.forEach((r) => {
    countMap.set(r.placeId, (countMap.get(r.placeId) || 0) + 1)
  })

  const placeMap = new Map<number, Place>()
  places.value.forEach((p) => {
    if (p.id !== undefined) placeMap.set(p.id, p)
  })

  return [...countMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([placeId, count]) => ({ place: placeMap.get(placeId)!, count }))
    .filter((v) => v.place)
})

async function loadData() {
  loading.value = true
  const [allReviews, allPlaces] = await Promise.all([
    db.getAllReviews(),
    db.getAllPlaces(),
    loadCustomCategories(),
  ])
  reviews.value = allReviews
  places.value = allPlaces
  loading.value = false
}

function goToPlace(placeId?: number) {
  if (placeId) router.push({ name: 'placeDetail', params: { id: placeId } })
}

function goToMap() {
  router.push({ name: 'reviews' })
}

onMounted(loadData)
</script>

<template>
  <div class="stats-page">
    <div class="page-title">数据统计</div>

    <div class="summary-cards">
      <div class="summary-card">
        <span class="summary-value">{{ totalReviews }}</span>
        <span class="summary-label">总记录数</span>
      </div>
      <div class="summary-card">
        <span class="summary-value">{{ uniquePlaceCount }}</span>
        <span class="summary-label">记录店铺数</span>
      </div>
      <div class="summary-card">
        <span class="summary-value">¥{{ totalAmount }}</span>
        <span class="summary-label">总消费金额</span>
      </div>
    </div>

    <van-loading v-if="loading" class="loading" type="spinner" />

    <template v-else>
      <div class="section">
        <div class="section-title">消费趋势</div>
        <TrendChart :reviews="reviews" />
      </div>

      <div class="section">
        <div class="section-title">分类消费占比</div>
        <CategoryPie :reviews="reviews" :places="places" @drilldown="() => {}" />
      </div>

      <div class="section">
        <div class="section-title">评分分布</div>
        <RatingBar :reviews="reviews" />
      </div>

      <div class="section">
        <div class="section-title">常去店铺 TOP5</div>
        <div v-if="topVenues.length === 0" class="empty-text">暂无数据</div>
        <van-cell
          v-for="(item, index) in topVenues"
          :key="item.place.id"
          :title="item.place.name"
          :label="`${getLabel(item.place)} · 到访 ${item.count} 次`"
          is-link
          @click="goToPlace(item.place.id!)"
        >
          <template #value>
            <span class="rank-badge">{{ index + 1 }}</span>
          </template>
        </van-cell>
      </div>

      <div class="action-bar">
        <van-button type="primary" block icon="location-o" @click="goToMap">
          足迹地图
        </van-button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.stats-page {
  padding: 16px;
  padding-bottom: calc(var(--safe-bottom) + 16px);
}

.page-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 16px;
}

.summary-cards {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.summary-card {
  flex: 1;
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  padding: 14px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.summary-value {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-primary);
  white-space: nowrap;
}

.summary-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.section {
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 12px;
}

.empty-text {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  padding: 24px 0;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.action-bar {
  margin-top: 12px;
}
</style>
