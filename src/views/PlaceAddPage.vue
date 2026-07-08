<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Place, Category } from '@/types'
import { useDatabase } from '@/composables/useDatabase'
import { usePlaceStore } from '@/stores/usePlaceStore'
import { mapPickResult } from '@/composables/mapPickState'
import PlaceForm from '@/components/place/PlaceForm.vue'
import type { PlaceFormData } from '@/components/place/PlaceForm.vue'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()
const { addPlace: dbAddPlace } = useDatabase()
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

watch(mapPickResult, (val) => {
  if (val && placeFormRef.value) {
    const form = placeFormRef.value.form
    form.lat = val.lat
    form.lng = val.lng
    form.address = val.address || ''
    mapPickResult.value = null
  }
})

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
    const id = await dbAddPlace(place)
    place.id = id as number
    store.addPlace(place)
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
    <van-nav-bar title="添加店铺" left-text="返回" left-arrow @click-left="onCancel" />
    <PlaceForm
      ref="placeFormRef"
      :place="prefillQuery"
      @submit="onSubmit"
      @cancel="onCancel"
      @pick-location="onPickLocation"
    />
  </div>
</template>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  background: var(--color-bg);
}

.page-wrapper :deep(.van-nav-bar) {
  background: var(--color-bg-white);
}
</style>
