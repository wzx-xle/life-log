<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { showToast } from 'vant'
import Compressor from 'compressorjs'
import type { Review, ConsumptionItem, Place } from '@/types'
import { usePlaceStore } from '@/stores/placeStore'
import { useCategoryDisplay } from '@/composables/useCategoryDisplay'
import RatingStar from './RatingStar.vue'

defineOptions({ name: 'ReviewFull' })

const props = defineProps<{
  placeId?: number
  review?: Review
}>()

const emit = defineEmits<{
  submit: [data: Partial<Review>]
  cancel: []
}>()

const placeStore = usePlaceStore()
const { loadCustomCategories, getLabel } = useCategoryDisplay()

const selectedPlaceId = ref<number | undefined>(props.placeId)
const dateStr = ref(formatDateStr(new Date()))
const ratingService = ref(0)
const ratingEnv = ref(0)
const ratingValue = ref(0)
const ratingOverall = ref(0)
const content = ref('')
const amount = ref('')
interface UploadItem {
  url?: string
  file?: File
  status?: '' | 'done' | 'uploading' | 'failed'
}

const photoList = ref<UploadItem[]>([])
const consumptionItems = ref<ConsumptionItem[]>([])
const tags = ref<string[]>([])
const tagInput = ref('')
const willRevisit = ref<boolean | null>(null)
const showPlacePicker = ref(false)

const maxContent = 2000

const selectedPlace = computed(() =>
  placeStore.places.find((p) => p.id === selectedPlaceId.value)
)
const placeLabel = computed(() => selectedPlace.value?.name || '请选择地点')

const pickerCategory = ref('全部')

const pickerCategories = computed(() => {
  const cats = new Set<string>()
  placeStore.places.forEach((p) => {
    cats.add(getLabel(p))
  })
  return ['全部', ...Array.from(cats)]
})

const filteredPickerPlaces = computed<Place[]>(() => {
  if (pickerCategory.value === '全部') return placeStore.places
  return placeStore.places.filter((p) => getLabel(p) === pickerCategory.value)
})

const selectPickerCategory = (cat: string) => {
  pickerCategory.value = cat
}

const selectPlace = (id: number) => {
  selectedPlaceId.value = id
  showPlacePicker.value = false
}

function formatDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.6,
      maxWidth: 800,
      success(result) {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(result)
      },
      error: reject,
    })
  })
}

const afterRead = async (items: UploadItem | UploadItem[]) => {
  const item = Array.isArray(items) ? items[0] : items
  if (!item.file) return
  try {
    item.url = await compressImage(item.file)
    item.status = 'done'
  } catch {
    item.status = 'failed'
    showToast('图片处理失败')
  }
}

const addConsumptionItem = () => {
  consumptionItems.value.push({ name: '', price: 0 })
}

const removeConsumptionItem = (index: number) => {
  consumptionItems.value.splice(index, 1)
}

const addTag = () => {
  const val = tagInput.value.trim()
  if (!val) return
  if (tags.value.includes(val)) {
    showToast('标签已存在')
    return
  }
  tags.value.push(val)
  tagInput.value = ''
}

const removeTag = (tag: string) => {
  tags.value = tags.value.filter((t) => t !== tag)
}

const handleSubmit = () => {
  if (!selectedPlaceId.value) {
    showToast('请选择地点')
    return
  }
  if (ratingOverall.value <= 0 && ratingService.value <= 0 && ratingEnv.value <= 0 && ratingValue.value <= 0) {
    showToast('请至少完成一项评分')
    return
  }

  const reviewData: Partial<Review> = {
    placeId: selectedPlaceId.value,
    date: new Date(dateStr.value),
    rating: {
      service: ratingService.value || undefined,
      environment: ratingEnv.value || undefined,
      value: ratingValue.value || undefined,
      overall: ratingOverall.value || undefined,
    },
    content: content.value || undefined,
    amount: amount.value ? Number(amount.value) : undefined,
    items: consumptionItems.value.length > 0 ? [...consumptionItems.value] : undefined,
    photos: photoList.value.map((f) => f.url).filter(Boolean) as string[],
    willRevisit: willRevisit.value,
    tags: tags.value.length > 0 ? [...tags.value] : undefined,
    createdAt: new Date(),
  }

  emit('submit', reviewData)
}

const applyReviewData = (review?: Review) => {
  if (!review) return
  selectedPlaceId.value = review.placeId
  if (review.date) {
    dateStr.value = formatDateStr(new Date(review.date))
  }
  ratingService.value = review.rating?.service || 0
  ratingEnv.value = review.rating?.environment || 0
  ratingValue.value = review.rating?.value || 0
  ratingOverall.value = review.rating?.overall || 0
  content.value = review.content || ''
  amount.value = review.amount?.toString() || ''
  if (review.photos) {
    photoList.value = review.photos.map((url) => ({ url, status: 'done' as const }))
  }
  if (review.items) {
    consumptionItems.value = [...review.items]
  }
  if (review.tags) {
    tags.value = [...review.tags]
  }
  willRevisit.value = review.willRevisit ?? null
}

watch(() => props.review, (newVal) => {
  if (newVal) applyReviewData(newVal)
}, { immediate: true })

onMounted(async () => {
  await Promise.all([placeStore.fetchPlaces(), loadCustomCategories()])
})
</script>

<template>
  <div class="review-full">
    <van-cell-group inset>
      <van-field
        :model-value="placeLabel"
        readonly
        is-link
        label="地点"
        placeholder="请选择地点"
        @click="showPlacePicker = true"
      />

      <van-field
        v-model="dateStr"
        type="date"
        label="日期"
      />
    </van-cell-group>

    <div class="rating-section">
      <p class="section-label">详细评分</p>
      <div class="rating-rows">
        <div class="rating-row">
          <span class="rating-label">服务态度</span>
          <RatingStar v-model="ratingService" size="22px" />
        </div>
        <div class="rating-row">
          <span class="rating-label">环境卫生</span>
          <RatingStar v-model="ratingEnv" size="22px" />
        </div>
        <div class="rating-row">
          <span class="rating-label">性价比</span>
          <RatingStar v-model="ratingValue" size="22px" />
        </div>
        <div class="rating-row">
          <span class="rating-label">综合推荐</span>
          <RatingStar v-model="ratingOverall" size="22px" />
        </div>
      </div>
    </div>

    <van-cell-group inset>
      <van-field
        v-model="content"
        type="textarea"
        label="详细体验"
        placeholder="详细记录你的体验..."
        rows="4"
        :maxlength="maxContent"
        show-word-limit
        autosize
      />

      <van-field
        v-model="amount"
        type="number"
        label="消费金额"
        placeholder="输入金额"
        clearable
      >
        <template #left-icon>
          <span class="amount-prefix">¥</span>
        </template>
      </van-field>
    </van-cell-group>

    <div class="section">
      <div class="section-header">
        <p class="section-label">消费明细</p>
        <van-button size="small" plain type="primary" @click="addConsumptionItem">添加</van-button>
      </div>
      <div v-if="consumptionItems.length > 0" class="consumption-list">
        <div
          v-for="(item, index) in consumptionItems"
          :key="index"
          class="consumption-row"
        >
          <van-field v-model="item.name" placeholder="项目名称" />
          <van-field v-model.number="item.price" type="number" placeholder="价格" />
          <van-button
            size="small"
            icon="cross"
            type="danger"
            plain
            @click="removeConsumptionItem(index)"
          />
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <p class="section-label">标签</p>
      </div>
      <div class="tag-input-row">
        <van-field v-model="tagInput" placeholder="输入标签" />
        <van-button size="small" type="primary" @click="addTag">添加</van-button>
      </div>
      <div class="tag-list" v-if="tags.length > 0">
        <van-tag
          v-for="tag in tags"
          :key="tag"
          closeable
          size="medium"
          type="primary"
          @close="removeTag(tag)"
        >{{ tag }}</van-tag>
      </div>
    </div>

    <div class="section">
      <p class="section-label">是否会再次光顾</p>
      <van-radio-group v-model="willRevisit" direction="horizontal">
        <van-radio :name="true">会</van-radio>
        <van-radio :name="false">不会</van-radio>
        <van-radio :name="null">不确定</van-radio>
      </van-radio-group>
    </div>

    <div class="section">
      <p class="section-label">照片 (最多9张)</p>
      <van-uploader
        v-model="photoList"
        :max-count="9"
        :after-read="afterRead"
        accept="image/*"
        :preview-full-image="true"
      />
    </div>

    <div class="form-actions">
      <van-button round block type="primary" @click="handleSubmit">提交记录</van-button>
      <van-button round block plain @click="emit('cancel')">取消</van-button>
    </div>

    <van-popup
      v-model:show="showPlacePicker"
      position="bottom"
      round
      :style="{ height: '60%' }"
    >
      <div class="place-picker">
        <h4 class="picker-title">选择地点</h4>
        <div class="picker-body">
          <div class="picker-left">
            <div
              v-for="cat in pickerCategories"
              :key="cat"
              :class="['picker-cat', { active: pickerCategory === cat }]"
              @click="selectPickerCategory(cat)"
            >{{ cat }}</div>
          </div>
          <div class="picker-right">
            <div
              v-for="place in filteredPickerPlaces"
              :key="place.id"
              class="picker-place"
              @click="selectPlace(place.id!)"
            >
              <span class="picker-place-name">{{ place.name }}</span>
              <span class="picker-place-cat">{{ getLabel(place) }}</span>
            </div>
            <div v-if="filteredPickerPlaces.length === 0" class="picker-empty">
              暂无店铺
            </div>
          </div>
        </div>
        <div class="picker-footer">
          <van-button block round plain @click="showPlacePicker = false">取消</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.review-full {
  padding-bottom: var(--safe-bottom);
}

.amount-prefix {
  margin-right: 4px;
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
}

.rating-section {
  padding: var(--spacing-lg);
}

.section-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
}

.rating-rows {
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) 0;
}

.rating-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-lg);
}

.rating-label {
  font-size: var(--font-size-md);
  color: var(--color-text);
}

.section {
  padding: var(--spacing-lg);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.section-header .section-label {
  margin-bottom: 0;
}

.consumption-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.consumption-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  padding: var(--spacing-xs) var(--spacing-sm);
}

.consumption-row .van-field {
  flex: 1;
  padding: 0;
}

.tag-input-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.tag-input-row .van-field {
  flex: 1;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: 0 var(--spacing-lg);
  margin-top: var(--spacing-xl);
}

/* Two-column place picker */
.place-picker {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.picker-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
  text-align: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.picker-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.picker-left {
  width: 100px;
  background: var(--color-bg);
  overflow-y: auto;
  flex-shrink: 0;
}

.picker-cat {
  padding: var(--spacing-md) var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-align: center;
  cursor: pointer;
  border-left: 3px solid transparent;
}

.picker-cat.active {
  color: var(--color-primary);
  background: var(--color-bg-white);
  border-left-color: var(--color-primary);
}

.picker-right {
  flex: 1;
  overflow-y: auto;
  background: var(--color-bg-white);
}

.picker-place {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
}

.picker-place-name {
  font-size: var(--font-size-md);
  color: var(--color-text);
}

.picker-place-cat {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.picker-empty {
  text-align: center;
  padding: var(--spacing-xl) 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.picker-footer {
  padding: var(--spacing-md) var(--spacing-lg);
  padding-bottom: calc(var(--spacing-md) + var(--safe-bottom));
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}
</style>
