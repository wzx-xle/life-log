<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Place } from '@/types'
import { useDatabase } from '@/composables/useDatabase'
import { usePlaceStore } from '@/stores/usePlaceStore'
import { mapPickResult } from '@/composables/mapPickState'
import PlaceForm from '@/components/place/PlaceForm.vue'
import type { PlaceFormData } from '@/components/place/PlaceForm.vue'
import { showToast, showConfirmDialog } from 'vant'

const route = useRoute()
const router = useRouter()
const { getPlaceById, deletePlace, getPlaceReviewCount } = useDatabase()
const store = usePlaceStore()

const place = ref<Place | null>(null)
const loading = ref(true)
const placeFormRef = ref<InstanceType<typeof PlaceForm>>()

const loadPlace = async () => {
  const id = Number(route.params.id)
  if (!id) {
    router.replace({ name: 'reviews' })
    return
  }
  const p = await getPlaceById(id)
  if (!p) {
    showToast('店铺不存在')
    router.replace({ name: 'reviews' })
    return
  }
  place.value = p
  loading.value = false
}

const applyPickResult = async (val: { lat: number; lng: number; address: string } | null) => {
  if (!val || !placeFormRef.value) return
  await nextTick()
  const form = placeFormRef.value.form
  form.lat = val.lat
  form.lng = val.lng
  form.address = val.address || ''
  mapPickResult.value = null
}

watch(mapPickResult, applyPickResult)

onMounted(async () => {
  await loadPlace()
})

const onSubmit = async (data: PlaceFormData) => {
  if (!place.value?.id) return
  const updates: Partial<Place> = {
    ...data,
    customCategory: data.customCategory || undefined,
    tags: data.tags.length > 0 ? data.tags : undefined,
    photos: data.photos.length > 0 ? data.photos : undefined,
    updatedAt: new Date(),
  }
  try {
    await store.updatePlace({ ...place.value, ...updates })
    showToast('保存成功')
    router.push({ name: 'placeDetail', params: { id: place.value.id } })
  } catch {
    showToast('保存失败，请重试')
  }
}

const onCancel = () => {
  router.back()
}

const onPickLocation = () => {
  router.push({ name: 'mapPick' })
}

const handleDelete = async () => {
  if (!place.value?.id) return
  const count = await getPlaceReviewCount(place.value.id)
  const message = count > 0
    ? `该店铺有 ${count} 条消费记录，删除店铺将同时删除所有相关记录，确定删除吗？`
    : '确定删除该店铺吗？'
  try {
    await showConfirmDialog({
      title: '删除店铺',
      message,
      confirmButtonColor: 'var(--color-danger)',
    })
    await deletePlace(place.value.id)
    store.removePlace(place.value.id)
    showToast('已删除')
    router.push({ name: 'reviews' })
  } catch {
    // cancelled
  }
}
</script>

<template>
  <div class="page-wrapper">
    <van-nav-bar title="编辑店铺" left-arrow @click-left="onCancel">
      <template #right>
        <van-icon name="delete-o" size="20" color="var(--color-danger)" @click="handleDelete" />
      </template>
    </van-nav-bar>
    <van-loading v-if="loading" class="loading-center" />
    <PlaceForm
      v-else
      ref="placeFormRef"
      :place="place"
      @submit="onSubmit"
      @cancel="onCancel"
      @pick-location="onPickLocation"
    />
    <div class="cancel-wrap">
      <van-button round block plain @click="onCancel">取消</van-button>
    </div>
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
  background: var(--color-bg-white);
}

.loading-center {
  display: flex;
  justify-content: center;
  padding-top: 40px;
}

.cancel-wrap {
  padding: var(--spacing-md) var(--spacing-lg);
  padding-bottom: calc(var(--spacing-xl) + var(--safe-bottom));
}
</style>
