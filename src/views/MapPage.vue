<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMap } from '@/composables/useMap'
import { usePlaceStore } from '@/stores/usePlaceStore'
import { useDatabase } from '@/composables/useDatabase'
import PlaceCard from '@/components/map/PlaceCard.vue'
import type { Place } from '@/types'

const router = useRouter()
const {
  loadAMap,
  createMap,
  addMarker,
  clearMarkers,
  locateUser,
  reverseGeocode,
  destroyMap,
} = useMap()
const placeStore = usePlaceStore()
const db = useDatabase()

const mapRef = ref<any>(null)
const mapContainerRef = ref<HTMLElement | null>(null)
const searching = ref(false)

const searchText = ref('')
const selectedPlace = ref<Place | null>(null)
const averageRating = ref(0)
const showActionSheet = ref(false)
const longPressLng = ref(0)
const longPressLat = ref(0)
const longPressAddress = ref('')

let markerClickedFlag = false

function pixelToLngLat(map: any, containerX: number, containerY: number): [number, number] {
  const bounds = map.getBounds()
  const ne = bounds.getNorthEast()
  const sw = bounds.getSouthWest()
  const container = map.getContainer()
  const w = container.clientWidth
  const h = container.clientHeight

  const lng = sw.lng + (ne.lng - sw.lng) * (containerX / w)
  const lat = ne.lat + (sw.lat - ne.lat) * (containerY / h)

  return [lng, lat]
}

async function selectPlace(place: Place) {
  selectedPlace.value = place
  if (place.id != null) {
    const reviews = await db.getReviewsByPlaceId(place.id)
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + (r.rating?.overall || 0), 0)
      averageRating.value = sum / reviews.length
    } else {
      averageRating.value = 0
    }
  }
}

function addMarkerWithClick(map: any, place: Place) {
  const marker = addMarker(map, place)
  if (!marker || place.id == null) return marker

  marker.on('click', () => {
    markerClickedFlag = true
    const found = placeStore.getPlaceById(place.id!)
    if (found) {
      selectPlace(found)
    }
  })

  return marker
}

function syncMarkers(map: any) {
  clearMarkers(map)
  placeStore.places.forEach((p) => addMarkerWithClick(map, p))
}

async function onSearch() {
  const map = mapRef.value
  if (!map || !searchText.value.trim()) return

  searching.value = true
  try {
    const { searchPOI } = useMap()
    const results = await searchPOI(map, searchText.value.trim())
    if (results.length > 0) {
      const first = results[0]
      map.setZoomAndCenter(16, [first.location.lng, first.location.lat])
    }
  } finally {
    searching.value = false
  }
}

function onLocate() {
  const map = mapRef.value
  if (!map) return
  locateUser(map)
}

function onWriteReview(place: Place) {
  router.push({ name: 'addReview', query: { placeId: place.id?.toString() } })
}

function onViewDetail(place: Place) {
  router.push({ name: 'placeDetail', params: { id: place.id } })
}

function onCloseCard() {
  selectedPlace.value = null
  averageRating.value = 0
}

const actionSheetActions = [
  { name: 'addPlace', subname: '在此位置添加新店铺' },
]

function onActionSelect(action: any) {
  if (action.name === 'addPlace') {
    router.push({
      name: 'addPlace',
      query: {
        lat: longPressLat.value.toString(),
        lng: longPressLng.value.toString(),
        address: longPressAddress.value,
      },
    })
  }
  showActionSheet.value = false
}

let longPressTimer: ReturnType<typeof setTimeout> | null = null

function onTouchStart(e: TouchEvent) {
  longPressTimer = setTimeout(async () => {
    const map = mapRef.value
    if (!map) return

    const touch = e.touches[0] || e.changedTouches[0]
    if (!touch) return

    const container = mapContainerRef.value
    if (!container) return

    const rect = container.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    const [lng, lat] = pixelToLngLat(map, x, y)
    longPressLng.value = lng
    longPressLat.value = lat

    const address = await reverseGeocode(map, lng, lat)
    longPressAddress.value = address
    showActionSheet.value = true

    longPressTimer = null
  }, 500)
}

function onTouchEnd() {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

function onTouchMove() {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

function onMapClick() {
  if (markerClickedFlag) {
    markerClickedFlag = false
    return
  }
  selectedPlace.value = null
  averageRating.value = 0
}

onMounted(async () => {
  await loadAMap()
  const map = createMap('map-container')
  mapRef.value = map

  await placeStore.loadPlaces()
  placeStore.places.forEach((p) => addMarkerWithClick(map, p))

  map.on('click', onMapClick)

  const container = mapContainerRef.value
  if (container) {
    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchend', onTouchEnd)
    container.addEventListener('touchmove', onTouchMove)
  }
})

onUnmounted(() => {
  const container = mapContainerRef.value
  if (container) {
    container.removeEventListener('touchstart', onTouchStart)
    container.removeEventListener('touchend', onTouchEnd)
    container.removeEventListener('touchmove', onTouchMove)
  }

  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }

  if (mapRef.value) {
    destroyMap(mapRef.value)
    mapRef.value = null
  }
})

watch(
  () => placeStore.places,
  () => {
    const map = mapRef.value
    if (!map) return
    syncMarkers(map)
  },
  { deep: true }
)
</script>

<template>
  <div class="map-page">
    <div class="search-bar">
      <van-search
        v-model="searchText"
        placeholder="搜索地点"
        shape="round"
        @search="onSearch"
      />
    </div>

    <div
      id="map-container"
      ref="mapContainerRef"
      class="map-container"
    ></div>

    <div class="locate-btn" @click="onLocate">
      <van-icon name="aim" size="22" />
    </div>

    <PlaceCard
      v-if="selectedPlace"
      :place="selectedPlace"
      :average-rating="averageRating"
      @write-review="onWriteReview"
      @view-detail="onViewDetail"
      @close="onCloseCard"
    />

    <van-action-sheet
      v-model:show="showActionSheet"
      :actions="actionSheetActions"
      @select="onActionSelect"
      cancel-text="取消"
    />
  </div>
</template>

<style scoped>
.map-page {
  position: relative;
  width: 100%;
  height: calc(100vh - 50px);
  overflow: hidden;
}

.search-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 150;
}

.search-bar :deep(.van-search) {
  background: transparent;
  padding: 8px 12px;
}

.search-bar :deep(.van-search__content) {
  background: var(--color-bg-white);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.map-container {
  width: 100%;
  height: 100%;
}

.locate-btn {
  position: absolute;
  bottom: 76px;
  left: 12px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--color-border);
  z-index: 150;
  color: var(--color-text);
}
</style>
