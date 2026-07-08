<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDatabase } from '@/composables/useDatabase'
import { showToast, showConfirmDialog } from 'vant'
import type { CustomCategory } from '@/types'

defineOptions({ name: 'CategoryManagePage' })

const router = useRouter()
const db = useDatabase()

const categories = ref<CustomCategory[]>([])
const showForm = ref(false)
const editingCategory = ref<CustomCategory | null>(null)
const formName = ref('')
const formColor = ref('#FF6B35')

const PRESET_COLORS = [
  '#FF6B35', '#E74C3C', '#E91E63', '#9C27B0',
  '#4A90D9', '#2196F3', '#00BCD4', '#009688',
  '#52C41A', '#8BC34A', '#FF9800', '#795548',
]

async function loadCategories() {
  categories.value = await db.getAllCustomCategories()
}

function goBack() {
  router.back()
}

function openAdd() {
  editingCategory.value = null
  formName.value = ''
  formColor.value = PRESET_COLORS[0]
  showForm.value = true
}

function openEdit(cat: CustomCategory) {
  editingCategory.value = cat
  formName.value = cat.name
  formColor.value = cat.color
  showForm.value = true
}

async function handleFormSubmit() {
  const name = formName.value.trim()
  if (!name) {
    showToast('请输入分类名称')
    return
  }
  const existing = categories.value.find(
    (c) => c.name === name && c.id !== editingCategory.value?.id
  )
  if (existing) {
    showToast('分类名称已存在')
    return
  }

  if (editingCategory.value?.id != null) {
    const oldName = editingCategory.value.name
    await db.updateCustomCategory(editingCategory.value.id, { name, color: formColor.value })
    if (oldName !== name) {
      await db.renameCustomCategoryInPlaces(oldName, name)
    }
  } else {
    await db.addCustomCategory({ name, color: formColor.value, createdAt: new Date() })
  }

  showForm.value = false
  showToast(editingCategory.value?.id != null ? '分类已更新' : '分类已创建')
  await loadCategories()
}

async function handleDelete(cat: CustomCategory) {
  try {
    await showConfirmDialog({
      title: '删除分类',
      message: `确定要删除"${cat.name}"分类吗？使用该分类的店铺不受影响。`,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  if (cat.id != null) {
    await db.deleteCustomCategory(cat.id)
    showToast('分类已删除')
    await loadCategories()
  }
}

onMounted(() => {
  loadCategories()
})
</script>

<template>
  <div class="page-wrapper">
    <van-nav-bar title="分类管理" left-arrow @click-left="goBack" />

    <div class="page-content">
      <div v-if="categories.length === 0" class="empty-state">
        <van-empty description="暂无分类，点击下方按钮创建" />
      </div>

      <van-cell-group v-else inset>
        <van-cell
          v-for="cat in categories"
          :key="cat.id"
          center
          @click="openEdit(cat)"
        >
          <template #icon>
            <span class="color-dot" :style="{ backgroundColor: cat.color }"></span>
          </template>
          <template #title>
            <span class="cat-name">{{ cat.name }}</span>
            <van-tag v-if="cat.isPreset" type="warning" class="preset-tag">预设</van-tag>
          </template>
          <template #right-icon>
            <van-button
              size="small"
              type="danger"
              plain
              @click.stop="handleDelete(cat)"
            >
              删除
            </van-button>
          </template>
        </van-cell>
      </van-cell-group>

      <div class="add-btn-wrap">
        <van-button type="primary" block round @click="openAdd">新增分类</van-button>
      </div>

    </div>

    <van-popup
      v-model:show="showForm"
      position="bottom"
      round
      :close-on-click-overlay="false"
    >
      <div class="form-content">
        <h3 class="form-title">{{ editingCategory ? '编辑分类' : '新增分类' }}</h3>

        <van-field
          v-model="formName"
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
              :class="['color-swatch', { active: formColor === c }]"
              :style="{ backgroundColor: c }"
              @click="formColor = c"
            ></span>
          </div>
          <van-field
            v-model="formColor"
            label="自定义色值"
            placeholder="#FF6B35"
            :maxlength="7"
          />
        </div>

        <div class="form-actions">
          <van-button round block type="primary" @click="handleFormSubmit">
            {{ editingCategory ? '保存修改' : '创建分类' }}
          </van-button>
          <van-button round block type="default" @click="showForm = false">
            取消
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  background: var(--color-bg);
}

.page-wrapper :deep(.van-nav-bar) {
  position: sticky;
  top: 0;
  z-index: 10;
}

.page-content {
  padding-top: var(--spacing-lg);
}

.empty-state {
  padding-top: 60px;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 10px;
  flex-shrink: 0;
}

.cat-name {
  vertical-align: middle;
}

.preset-tag {
  margin-left: 6px;
  vertical-align: middle;
}

.add-btn-wrap {
  padding: 24px 16px;
}

.form-content {
  padding: 24px 16px;
  padding-bottom: calc(24px + var(--safe-bottom));
}

.form-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 16px;
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
  margin-bottom: var(--spacing-md);
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

.form-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: 24px;
}
</style>
