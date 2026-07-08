<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const mapContainer = ref<HTMLDivElement>()
const addressText = ref('拖动地图选择位置')
const loading = ref(true)
let mapInstance: any = null
let geocoderInstance: any = null

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY
const AMAP_URL = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&plugin=AMap.Geocoder`

let cleanupFns: (() => void)[] = []

const onConfirm = async () => {
  if (!mapInstance || !geocoderInstance) return
  const center = mapInstance.getCenter()
  const lng = center.getLng()
  const lat = center.getLat()

  geocoderInstance.getAddress([lng, lat], (_status: string, result: any) => {
    const addr = result?.regeocode?.formattedAddress || ''
    sessionStorage.setItem('mapPickResult', JSON.stringify({ lat, lng, address: addr }))
    router.back()
  })
}

const onBack = () => {
  sessionStorage.removeItem('mapPickResult')
  router.back()
}

const loadMap = () => {
  if ((window as any).AMap) {
    initMap()
    return
  }

  const script = document.createElement('script')
  script.src = AMAP_URL
  script.onload = initMap
  script.onerror = () => {
    loading.value = false
    addressText.value = '地图加载失败'
  }
  document.head.appendChild(script)
  cleanupFns.push(() => script.remove())
}

const initMap = () => {
  if (!mapContainer.value) return
  const AMap = (window as any).AMap

  mapInstance = new AMap.Map(mapContainer.value, {
    zoom: 16,
    center: [116.397428, 39.90923],
  })

  mapInstance.plugin(['AMap.Geocoder'], () => {
    geocoderInstance = new AMap.Geocoder({})
  })

  mapInstance.on('moveend', () => {
    const center = mapInstance.getCenter()
    const lng = center.getLng()
    const lat = center.getLat()
    if (geocoderInstance) {
      geocoderInstance.getAddress([lng, lat], (_status: string, result: any) => {
        if (result?.regeocode?.formattedAddress) {
          addressText.value = result.regeocode.formattedAddress
        }
      })
    }
  })

  loading.value = false
}

onMounted(loadMap)
onUnmounted(() => cleanupFns.forEach((fn) => fn()))
</script>

<template>
  <div class="map-picker-page">
    <div class="map-picker-header">
      <span class="back-btn" @click="onBack">取消</span>
      <span class="hint-text">拖动地图，将目标对准十字星</span>
      <span class="confirm-btn" @click="onConfirm">确认</span>
    </div>

    <div ref="mapContainer" class="map-container">
      <div v-if="loading" class="map-loading">加载地图...</div>
      <div class="crosshair">
        <div class="crosshair-h"></div>
        <div class="crosshair-v"></div>
      </div>
      <div class="address-bar">{{ addressText }}</div>
    </div>
  </div>
</template>

<style scoped>
.map-picker-page {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.map-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4.26667vw;
  height: 11.73333vw;
  background: #fff;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.back-btn {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
}

.confirm-btn {
  font-size: var(--font-size-md);
  color: var(--color-primary);
  font-weight: 600;
}

.hint-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
}

.map-container {
  flex: 1;
  position: relative;
}

.map-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
  z-index: 1;
}

.crosshair {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}

.crosshair-h {
  position: absolute;
  top: 50%;
  left: 8vw;
  right: 8vw;
  height: 1px;
  background: var(--color-primary);
  transform: translateY(-50%);
}

.crosshair-v {
  position: absolute;
  top: 8vh;
  bottom: 8vh;
  left: 50%;
  width: 1px;
  background: var(--color-primary);
  transform: translateX(-50%);
}

.address-bar {
  position: absolute;
  bottom: 4.26667vw;
  left: 4.26667vw;
  right: 4.26667vw;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 2.66667vw 3.73333vw;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  z-index: 10;
  text-align: center;
}
</style>
