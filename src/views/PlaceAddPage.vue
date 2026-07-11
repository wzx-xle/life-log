<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Place, Category } from '@/types'
import { usePlaceStore } from '@/stores/usePlaceStore'
import { mapPickResult } from '@/composables/mapPickState'
import PlaceForm from '@/components/place/PlaceForm.vue'
import type { PlaceFormData } from '@/components/place/PlaceForm.vue'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()
const store = usePlaceStore()

const prefillQuery = computed(() => {
  const { lat, lng } = route.query
  if (lat && lng) {
    return {
      name: '',
      category: 'restaurant' as Category,
      address: '',
      lat: Number(lat),
      lng: Number(lng),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Place
  }
  return null
})

const placeFormRef = ref<InstanceType<typeof PlaceForm>>()

const applyPickResult = async (val: { lat: number; lng: number; address: string; name: string } | null) => {
  if (!val) return
  await nextTick()
  if (!placeFormRef.value) return
  const form = placeFormRef.value.form
  form.lat = val.lat
  form.lng = val.lng
  form.address = val.address || ''
  // 名称仅在选中具体 POI（name 非空）时覆盖；选"当前位置"/取消不动已填名称
  if (val.name) form.name = val.name
  mapPickResult.value = null
}

watch(mapPickResult, applyPickResult)

// 应用无 keep-alive：从选点页返回时本页重新挂载，watch 会错过已写入的共享结果，
// 故挂载时主动应用一次。
onMounted(() => applyPickResult(mapPickResult.value))

const onSubmit = async (data: PlaceFormData) => {
  const place = {
    ...data,
    customCategory: data.customCategory || undefined,
    tags: data.tags.length > 0 ? data.tags : undefined,
    photos: data.photos.length > 0 ? data.photos : undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Place

  try {
    await store.addPlace(place)
    showToast('添加成功')
    setTimeout(() => router.back(), 300)
  } catch (err: any) {
    showToast(err?.message || '添加失败，请重试')
  }
}

const onCancel = () => {
  router.back()
}

const onPickLocation = () => {
  router.push({ name: 'mapPick' })
}
</script>

<template>
  <div class="page-wrapper">
    <van-nav-bar title="添加店铺" left-arrow @click-left="onCancel" />
    <div class="page-content">
      <PlaceForm
        ref="placeFormRef"
        :place="prefillQuery"
        @submit="onSubmit"
        @cancel="onCancel"
        @pick-location="onPickLocation"
      />
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
  border-bottom: 1px solid var(--color-border);
}

.page-content {
  padding: var(--spacing-lg);
}
</style>
