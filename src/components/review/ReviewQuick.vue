<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { showToast } from 'vant'
import { useRouter } from 'vue-router'
import Compressor from 'compressorjs'
import type { Review } from '@/types'
import { usePlaceStore } from '@/stores/placeStore'
import RatingStar from './RatingStar.vue'

defineOptions({ name: 'ReviewQuick' })

const props = defineProps<{
  placeId?: number
  review?: Review
}>()

const emit = defineEmits<{
  submit: [data: Partial<Review>]
  cancel: []
}>()

const placeStore = usePlaceStore()

const selectedPlaceId = ref<number | undefined>(props.placeId)
const rating = ref(0)
const content = ref('')
const amount = ref('')
interface UploadItem {
  url?: string
  file?: File
  status?: '' | 'done' | 'uploading' | 'failed'
}

const photoList = ref<UploadItem[]>([])
const showPlacePicker = ref(false)

const selectedPlace = computed(() =>
  placeStore.places.find((p) => p.id === selectedPlaceId.value)
)
const placeLabel = computed(() => selectedPlace.value?.name || '请选择地点')
const maxContent = 500

const router = useRouter()

const placeActions = computed(() => [
  { name: '+ 新建店铺', id: -1 },
  ...placeStore.places.map((p) => ({ name: p.name, id: p.id })),
])

const onSelectPlace = (action: { name: string; id: number }) => {
  if (action.id === -1) {
    showPlacePicker.value = false
    router.push({ name: 'addPlace' })
    return
  }
  selectedPlaceId.value = action.id
  showPlacePicker.value = false
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

const handleSubmit = () => {
  if (!selectedPlaceId.value) {
    showToast('请选择地点')
    return
  }
  if (rating.value <= 0) {
    showToast('请评分')
    return
  }

  const reviewData: Partial<Review> = {
    placeId: selectedPlaceId.value,
    date: new Date(),
    rating: { overall: rating.value },
    content: content.value || undefined,
    amount: amount.value ? Number(amount.value) : undefined,
    photos: photoList.value.map((f) => f.url).filter(Boolean) as string[],
    createdAt: new Date(),
  }

  emit('submit', reviewData)
}

onMounted(() => {
  placeStore.fetchPlaces()
  if (props.review) {
    selectedPlaceId.value = props.review.placeId
    rating.value = props.review.rating?.overall || 0
    content.value = props.review.content || ''
    amount.value = props.review.amount?.toString() || ''
    if (props.review.photos) {
      photoList.value = props.review.photos.map((url) => ({ url, status: 'done' as const }))
    }
  }
})
</script>

<template>
  <div class="review-quick">
    <van-cell-group inset>
      <van-field
        :model-value="placeLabel"
        readonly
        is-link
        label="地点"
        placeholder="请选择地点"
        @click="showPlacePicker = true"
      />

      <van-field label="综合评分" center>
        <template #input>
          <RatingStar v-model="rating" />
        </template>
      </van-field>

      <van-field
        v-model="content"
        type="textarea"
        label="体验"
        placeholder="记录你的体验..."
        rows="3"
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

    <div class="photo-section">
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

    <van-action-sheet
      v-model:show="showPlacePicker"
      :actions="placeActions"
      @select="onSelectPlace"
      title="选择地点"
    />
  </div>
</template>

<style scoped>
.review-quick {
  padding-bottom: var(--safe-bottom);
}

.amount-prefix {
  margin-right: 4px;
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
}

.photo-section {
  padding: var(--spacing-lg);
}

.section-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: 0 var(--spacing-lg);
  margin-top: var(--spacing-xl);
}

.form-actions :deep(.van-button--primary) {
  box-shadow: var(--shadow-hard);
}

.form-actions :deep(.van-button--primary:active) {
  transform: translate(2px, 2px);
  box-shadow: var(--shadow-hard-sm);
}
</style>
