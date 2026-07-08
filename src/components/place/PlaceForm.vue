<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { Place, Category, CustomCategory } from '@/types'
import { LABEL_TO_CATEGORY_KEY } from '@/types'
import type { UploaderFileListItem } from 'vant'
import Compressor from 'compressorjs'
import { showToast } from 'vant'
import { useDatabase } from '@/composables/useDatabase'

export interface PlaceFormData {
  name: string
  category: Category
  customCategory: string
  address: string
  lat: number
  lng: number
  phone: string
  businessHours: string
  tags: string[]
  photos: string[]
}

const props = withDefaults(defineProps<{
  place?: Place | null
}>(), {
  place: null,
})

const emit = defineEmits<{
  submit: [data: PlaceFormData]
  cancel: []
  pickLocation: []
}>()

const isEdit = computed(() => !!props.place)
const { getAllCustomCategories } = useDatabase()
const customCategories = ref<CustomCategory[]>([])

interface CategoryOption { value: Category; label: string; color: string }

const allCategoryItems = computed<CategoryOption[]>(() =>
  customCategories.value.map((c): CategoryOption => {
    const presetKey = LABEL_TO_CATEGORY_KEY[c.name]
    return {
      value: presetKey ?? 'custom',
      label: c.name,
      color: c.color,
    }
  })
)

function isCategoryActive(opt: CategoryOption): boolean {
  if (opt.value === 'custom') {
    if (form.category !== 'custom') return false
    return form.customCategory === opt.label || (!form.customCategory && opt.label === '自定义')
  }
  return form.category === opt.value && !form.customCategory
}

function selectCategory(opt: CategoryOption) {
  if (opt.value === 'custom') {
    form.category = 'custom'
    form.customCategory = opt.label === '自定义' ? '' : opt.label
  } else {
    form.category = opt.value
    form.customCategory = ''
  }
}

onMounted(async () => {
  customCategories.value = await getAllCustomCategories()
})

const form = reactive<PlaceFormData>({
  name: props.place?.name || '',
  category: (props.place?.category || 'restaurant') as Category,
  customCategory: props.place?.customCategory || '',
  address: props.place?.address || '',
  lat: props.place?.lat || 0,
  lng: props.place?.lng || 0,
  phone: props.place?.phone || '',
  businessHours: props.place?.businessHours || '',
  tags: [...(props.place?.tags || [])],
  photos: [...(props.place?.photos || [])],
})

const showCustomCategory = computed(() => form.category === 'custom')

const tagInputValue = ref('')
const tagInputVisible = ref(false)
const tagInputRef = ref<HTMLInputElement>()

const showTagInput = () => {
  tagInputVisible.value = true
  setTimeout(() => {
    tagInputRef.value?.focus()
  }, 100)
}

const addTag = () => {
  const val = tagInputValue.value.trim()
  if (val && !form.tags.includes(val)) {
    form.tags.push(val)
  }
  tagInputValue.value = ''
  tagInputVisible.value = false
}

const removeTag = (index: number) => {
  form.tags.splice(index, 1)
}

const fileList = ref<UploaderFileListItem[]>(
  form.photos.map(url => ({ content: url, isImage: true, status: 'done' as const }))
)

const compressPhoto = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.6,
      maxWidth: 800,
      success(result) {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(result)
      },
      error: reject,
    })
  })
}

const syncFormPhotos = () => {
  form.photos = fileList.value
    .filter(x => x.content)
    .map(x => x.content!) as string[]
}

const beforeRead = (file: File | File[]) => {
  const files = Array.isArray(file) ? file : [file]
  if (fileList.value.length + files.length > 9) {
    showToast('最多上传9张图片')
    return false
  }
  return true
}

const afterRead = async (item: UploaderFileListItem | UploaderFileListItem[]) => {
  const items = Array.isArray(item) ? item : [item]
  for (const f of items) {
    const idx = fileList.value.indexOf(f)
    if (f.file) {
      try {
        const base64 = await compressPhoto(f.file)
        fileList.value[idx] = { content: base64, isImage: true, status: 'done' as const }
      } catch {
        if (idx !== -1) fileList.value.splice(idx, 1)
        showToast('图片处理失败')
      }
    }
  }
  syncFormPhotos()
}

const onDeletePhoto = (detail: { index: number }) => {
  fileList.value.splice(detail.index, 1)
  syncFormPhotos()
}

const onOversize = () => {
  showToast('最多上传9张图片')
}

const validate = (): boolean => {
  if (!form.name.trim()) {
    showToast('请输入店铺名称')
    return false
  }
  if (!form.address.trim()) {
    showToast('请输入店铺地址')
    return false
  }
  if (showCustomCategory.value && !form.customCategory.trim()) {
    showToast('请输入自定义分类')
    return false
  }
  return true
}

const handleSubmit = () => {
  if (!validate()) return
  emit('submit', { ...form })
}

const handlePickLocation = () => {
  emit('pickLocation')
}

defineExpose({ form })
</script>

<template>
  <div class="place-form">
    <van-field
      v-model="form.name"
      label="店铺名称"
      placeholder="请输入店铺名称"
      :maxlength="50"
      required
    />

    <div class="form-section">
      <div class="section-label">
        <span class="required-star">*</span>分类
      </div>
      <div class="category-grid">
        <div
          v-for="(opt, idx) in allCategoryItems"
          :key="opt.value + '-' + idx"
          :class="['category-item', { active: isCategoryActive(opt) }]"
          @click="selectCategory(opt)"
        >
          <span class="category-dot" :style="{ backgroundColor: opt.color }"></span>
          <span class="category-label">{{ opt.label }}</span>
        </div>
      </div>
    </div>

    <van-field
      v-if="showCustomCategory"
      v-model="form.customCategory"
      label="自定义分类"
      placeholder="请输入自定义分类名称"
      required
    />

    <van-field
      v-model="form.address"
      label="地址"
      placeholder="请输入店铺地址"
      required
    >
      <template #button>
        <span class="pick-location-btn" @click="handlePickLocation">地图选点</span>
      </template>
    </van-field>

    <van-field
      v-model="form.phone"
      label="电话"
      type="tel"
      placeholder="请输入联系电话"
    />

    <van-field
      v-model="form.businessHours"
      label="营业时间"
      placeholder="09:00-22:00"
    />

    <div class="form-section">
      <div class="section-label">标签</div>
      <div class="tags-wrap">
        <van-tag
          v-for="(tag, index) in form.tags"
          :key="index"
          closeable
          size="medium"
          type="primary"
          @close="removeTag(index)"
        >
          {{ tag }}
        </van-tag>
        <div v-if="tagInputVisible" class="tag-input-wrapper">
          <input
            ref="tagInputRef"
            v-model="tagInputValue"
            class="tag-input"
            @blur="addTag"
            @keyup.enter="addTag"
          />
        </div>
        <van-tag v-else size="medium" type="primary" class="tag-add-btn" @click="showTagInput">
          <van-icon name="plus" size="12" />
        </van-tag>
      </div>
    </div>

    <div class="form-section">
      <div class="section-label">照片 (最多9张)</div>
      <van-uploader
        v-model="fileList"
        :max-count="9"
        accept="image/*"
        :before-read="beforeRead"
        :after-read="afterRead"
        @oversize="onOversize"
        @delete="onDeletePhoto"
      />
    </div>

    <div class="form-actions">
      <van-button round block type="primary" @click="handleSubmit">
        {{ isEdit ? '保存修改' : '添加店铺' }}
      </van-button>
    </div>
  </div>
</template>

<style scoped>
.place-form {
  padding-bottom: var(--spacing-xl);
}

.place-form :deep(.van-field) {
  margin-bottom: 1px;
}

.form-section {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg-white);
  margin-bottom: 1px;
}

.section-label {
  font-size: var(--font-size-md);
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}

.required-star {
  color: var(--color-danger);
  margin-right: 2px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: var(--spacing-md) var(--spacing-sm);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  transition: all 0.2s;
}

.category-item.active {
  background: var(--color-primary);
  color: #fff;
}

.category-item.active .category-dot {
  background: #fff !important;
}

.category-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  align-items: center;
}

.tag-input-wrapper {
  display: inline-block;
}

.tag-input {
  width: 80px;
  height: 22px;
  padding: 0 4px;
  font-size: var(--font-size-sm);
  background: var(--color-bg-white);
  color: var(--color-text);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
}

.tag-add-btn {
  cursor: pointer;
}

.pick-location-btn {
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  white-space: nowrap;
}

.form-actions {
  padding: var(--spacing-xl) var(--spacing-lg);
}
</style>
