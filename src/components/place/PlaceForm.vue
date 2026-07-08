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
const { getAllCustomCategories, addCustomCategory } = useDatabase()
const customCategories = ref<CustomCategory[]>([])

const showNewCatPopup = ref(false)
const newCatName = ref('')
const newCatColor = ref('#FF6B35')
const PRESET_COLORS = [
  '#FF6B35', '#E74C3C', '#E91E63', '#9C27B0',
  '#4A90D9', '#2196F3', '#00BCD4', '#009688',
  '#52C41A', '#8BC34A', '#FF9800', '#795548',
]

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

async function refreshCategories() {
  customCategories.value = await getAllCustomCategories()
}

async function handleCreateCategory() {
  const name = newCatName.value.trim()
  if (!name) {
    showToast('请输入分类名称')
    return
  }
  const exists = customCategories.value.find((c) => c.name === name)
  if (exists) {
    showToast('分类名称已存在')
    return
  }
  try {
    await addCustomCategory({ name, color: newCatColor.value, createdAt: new Date() })
    showToast('分类已创建')
    showNewCatPopup.value = false
    await refreshCategories()
  } catch {
    showToast('创建失败，请重试')
  }
}

function openNewCatPopup() {
  newCatName.value = ''
  newCatColor.value = PRESET_COLORS[0]
  showNewCatPopup.value = true
}

onMounted(async () => {
  await refreshCategories()
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
    <van-cell-group inset>
      <van-field
        v-model="form.name"
        label="店铺名称"
        placeholder="请输入店铺名称"
        :maxlength="50"
        required
      />
    </van-cell-group>

    <div class="section">
      <p class="section-label"><span class="required-star">*</span>分类</p>
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
        <div class="category-item category-add-btn" @click="openNewCatPopup">
          <van-icon name="plus" size="18" />
        </div>
      </div>
    </div>

    <van-cell-group inset>
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
    </van-cell-group>

    <div class="section">
      <p class="section-label">标签</p>
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

    <div class="section">
      <p class="section-label">照片 (最多9张)</p>
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
      <van-button round block plain @click="emit('cancel')">取消</van-button>
    </div>

    <van-popup
      v-model:show="showNewCatPopup"
      position="bottom"
      round
      :close-on-click-overlay="false"
    >
      <div class="new-cat-form">
        <h4 class="new-cat-title">新增分类</h4>
        <van-field
          v-model="newCatName"
          label="名称"
          placeholder="请输入分类名称"
          :maxlength="20"
        />
        <div class="color-section">
          <div class="color-label">颜色</div>
          <div class="color-grid">
            <span
              v-for="c in PRESET_COLORS"
              :key="c"
              :class="['color-swatch', { active: newCatColor === c }]"
              :style="{ backgroundColor: c }"
              @click="newCatColor = c"
            ></span>
          </div>
        </div>
        <div class="new-cat-actions">
          <van-button round block type="primary" @click="handleCreateCategory">创建</van-button>
          <van-button round block plain @click="showNewCatPopup = false">取消</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.place-form {
  padding-bottom: var(--spacing-xl);
}

.section {
  padding: var(--spacing-lg);
  margin: 0 var(--spacing-lg);
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
}

.section + .section {
  margin-top: var(--spacing-sm);
}

.section-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
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
  border: 1px solid var(--color-border);
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
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: 0 var(--spacing-lg);
  margin-top: var(--spacing-xl);
}

.category-item.category-add-btn {
  background: var(--color-bg);
  color: var(--color-text-secondary);
}

.category-item.category-add-btn:active {
  background: var(--color-primary);
  color: #fff;
}

.new-cat-form {
  padding: var(--spacing-xl) var(--spacing-lg);
  padding-bottom: calc(var(--spacing-xl) + var(--safe-bottom));
}

.new-cat-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-lg);
}

.color-section {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg-white);
  margin-top: 1px;
}

.color-label {
  font-size: var(--font-size-md);
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}

.color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.color-swatch {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  transition: border-color 0.15s;
}

.color-swatch.active {
  border-color: var(--color-text);
}

.new-cat-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}
</style>
