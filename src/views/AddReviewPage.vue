<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useDatabase } from '@/composables/useDatabase'
import type { Review } from '@/types'
import ReviewFull from '@/components/review/ReviewFull.vue'

defineOptions({ name: 'AddReviewPage' })

const route = useRoute()
const router = useRouter()
const { addReview, updateReview, getReviewById } = useDatabase()

const isEdit = computed(() => !!route.params.id)
const pageTitle = computed(() => (isEdit.value ? '编辑记录' : '添加记录'))

const placeId = computed(() => {
  const id = route.query.placeId
  return id ? Number(id) : undefined
})

const existingReview = ref<Review | undefined>(undefined)
const ready = ref(!isEdit.value)

const handleSubmit = async (data: Partial<Review>) => {
  try {
    if (isEdit.value && route.params.id) {
      await updateReview(Number(route.params.id), data)
      showToast('更新成功')
    } else {
      await addReview({
        placeId: data.placeId!,
        date: data.date || new Date(),
        rating: data.rating || {},
        content: data.content,
        amount: data.amount,
        items: data.items,
        photos: data.photos,
        willRevisit: data.willRevisit,
        tags: data.tags,
        createdAt: new Date(),
      })
      showToast('添加成功')
    }
    router.back()
  } catch {
    showToast('保存失败，请重试')
  }
}

const handleCancel = () => {
  router.back()
}

onMounted(async () => {
  if (isEdit.value && route.params.id) {
    const review = await getReviewById(Number(route.params.id))
    if (review) {
      existingReview.value = review
    }
    ready.value = true
  }
})
</script>

<template>
  <div class="add-review-page">
    <van-nav-bar
      :title="pageTitle"
      left-arrow
      @click-left="handleCancel"
    />

    <ReviewFull
      v-if="ready"
      :key="existingReview?.id"
      :place-id="existingReview?.placeId || placeId"
      :review="existingReview"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>

<style scoped>
.add-review-page {
  min-height: 100vh;
  background: var(--color-bg);
}
</style>
