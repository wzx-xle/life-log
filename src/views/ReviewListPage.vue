<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDatabase } from '@/composables/useDatabase'
import { usePlaceStore } from '@/stores/placeStore'
import type { Review, Place, Category, CustomCategory } from '@/types'
import { CATEGORY_LIST, LABEL_TO_CATEGORY_KEY } from '@/types'
import ReviewCard from '@/components/review/ReviewCard.vue'

defineOptions({ name: 'ReviewListPage' })

const router = useRouter()
const { getAllReviews, getAllCustomCategories } = useDatabase()
const placeStore = usePlaceStore()

const reviews = ref<(Review & { place?: Place })[]>([])
const loading = ref(true)
const searchKeyword = ref('')
const activeCategory = ref<string>('all')
const sortBy = ref<'time' | 'rating'>('time')
const customCats = ref<CustomCategory[]>([])

const categoryTabs = computed(() => {
  const tabs: { key: string; label: string }[] = [{ key: 'all', label: '全部' }]
  customCats.value.forEach((c) => {
    const presetKey = LABEL_TO_CATEGORY_KEY[c.name]
    tabs.push({ key: presetKey ?? c.name, label: c.name })
  })
  return tabs
})

const filteredReviews = computed(() => {
  let result = [...reviews.value]

  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    result = result.filter(
      (r) =>
        r.content?.toLowerCase().includes(kw) ||
        r.place?.name.toLowerCase().includes(kw)
    )
  }

  if (activeCategory.value !== 'all') {
    const cat = activeCategory.value
    const isPreset = CATEGORY_LIST.includes(cat as Category | 'all')
    if (isPreset) {
      result = result.filter((r) => r.place?.category === cat)
    } else {
      result = result.filter(
        (r) => r.place?.category === 'custom' && r.place?.customCategory === cat
      )
    }
  }

  if (sortBy.value === 'rating') {
    result.sort((a, b) => (b.rating?.overall || 0) - (a.rating?.overall || 0))
  }

  return result
})

interface ReviewGroup {
  label: string
  items: (Review & { place?: Place })[]
}

const reviewGroups = computed<ReviewGroup[]>(() => {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterdayStart = todayStart - 86400000
  const weekStart = todayStart - 7 * 86400000

  const groups: Record<string, (Review & { place?: Place })[]> = {
    今天: [],
    昨天: [],
    本周: [],
    更早: [],
  }

  for (const review of filteredReviews.value) {
    const rd = new Date(review.date)
    const reviewTime = new Date(rd.getFullYear(), rd.getMonth(), rd.getDate()).getTime()

    if (reviewTime === todayStart) {
      groups['今天'].push(review)
    } else if (reviewTime === yesterdayStart) {
      groups['昨天'].push(review)
    } else if (reviewTime >= weekStart) {
      groups['本周'].push(review)
    } else {
      groups['更早'].push(review)
    }
  }

  return (['今天', '昨天', '本周', '更早'] as const)
    .filter((key) => groups[key].length > 0)
    .map((key) => ({ label: key, items: groups[key] }))
})

const mapPlacesToReviews = (reviewList: Review[]) => {
  return reviewList.map((review) => ({
    ...review,
    place: placeStore.getPlaceById(review.placeId),
  }))
}

const loadData = async () => {
  loading.value = true
  try {
    await placeStore.fetchPlaces()
    const [allReviews, cats] = await Promise.all([
      getAllReviews(),
      getAllCustomCategories(),
    ])
    reviews.value = mapPlacesToReviews(allReviews)
    customCats.value = cats
  } finally {
    loading.value = false
  }
}

const handleReviewDeleted = (id: number) => {
  reviews.value = reviews.value.filter((r) => r.id !== id)
}

const goToMap = () => {
  router.push({ name: 'reviews' })
}

const goToAddReview = () => {
  router.push({ name: 'addReview' })
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="review-list-page">
    <van-search
      v-model="searchKeyword"
      placeholder="搜索体验内容或地点"
      shape="round"
      clearable
    />

    <div class="sort-bar">
      <div class="category-filter">
        <span
          v-for="tab in categoryTabs"
          :key="tab.key"
          :class="['filter-tab', { active: activeCategory === tab.key }]"
          @click="activeCategory = tab.key"
        >{{ tab.label }}</span>
      </div>
      <div class="sort-toggle" @click="sortBy = sortBy === 'time' ? 'rating' : 'time'">
        <van-icon :name="sortBy === 'time' ? 'clock-o' : 'star-o'" />
        <span>{{ sortBy === 'time' ? '时间' : '评分' }}</span>
      </div>
    </div>

    <div v-if="loading" class="loading-wrap">
      <van-loading type="spinner" />
    </div>

    <template v-else-if="reviewGroups.length > 0">
      <div v-for="group in reviewGroups" :key="group.label" class="review-group">
        <div class="group-header">
          <span class="group-label">{{ group.label }}</span>
          <span class="group-count">{{ group.items.length }}条</span>
        </div>
        <ReviewCard
          v-for="review in group.items"
          :key="review.id"
          :review="review"
          @deleted="handleReviewDeleted"
        />
      </div>
    </template>

    <div v-else class="empty-state">
      <van-empty description="还没有体验记录，去地图上添加吧">
        <van-button round type="primary" @click="goToMap">去地图</van-button>
      </van-empty>
    </div>

    <div class="fab" @click="goToAddReview">
      <van-icon name="plus" size="24" color="#fff" />
    </div>
  </div>
</template>

<style scoped>
.review-list-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-bottom: var(--safe-bottom);
}

.sort-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--color-bg-white);
  border-bottom: var(--border-thick);
  position: sticky;
  top: 0;
  z-index: 10;
}

.category-filter {
  display: flex;
  gap: var(--spacing-sm);
  overflow-x: auto;
  flex: 1;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.category-filter::-webkit-scrollbar {
  display: none;
}

.filter-tab {
  flex-shrink: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  padding: 4px var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: all 0.2s;
  cursor: pointer;
}

.filter-tab.active {
  color: var(--color-bg-white);
  background: var(--color-primary);
}

.sort-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  flex-shrink: 0;
  margin-left: var(--spacing-sm);
  cursor: pointer;
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.review-group {
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

.empty-state {
  padding-top: 120px;
}

.fab {
  position: fixed;
  right: var(--spacing-lg);
  bottom: calc(56px + var(--spacing-lg) + var(--safe-bottom));
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
