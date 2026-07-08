<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { mapPickResult } from '@/composables/mapPickState'

const router = useRouter()
const mapContainer = ref<HTMLDivElement>()
const addressText = ref('定位中...')
const loading = ref(true)
let mapInstance: any = null
let geocoderInstance: any = null
let centerMarker: any = null

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY
const AMAP_URL = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&plugin=AMap.Geocoder,AMap.Geolocation`

let cleanupFns: (() => void)[] = []

const reverseGeocode = (lng: number, lat: number) => {
  if (!geocoderInstance) return
  geocoderInstance.getAddress([lng, lat], (_status: string, result: any) => {
    if (result?.regeocode?.formattedAddress) {
      addressText.value = result.regeocode.formattedAddress
    }
  })
}

const updateCenterMarker = (lng: number, lat: number) => {
  const AMap = (window as any).AMap
  if (centerMarker) {
    mapInstance.remove(centerMarker)
  }
  centerMarker = new AMap.Marker({
    position: [lng, lat],
    icon: new AMap.Icon({
      size: new AMap.Size(25, 35),
      image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
      imageSize: new AMap.Size(25, 35),
      imageOffset: new AMap.Pixel(0, 0),
    }),
    offset: new AMap.Pixel(-12, -35),
  })
  mapInstance.add(centerMarker)
}

const setCenter = (lng: number, lat: number) => {
  mapInstance.setCenter([lng, lat])
  updateCenterMarker(lng, lat)
  reverseGeocode(lng, lat)
}

const onConfirm = () => {
  const center = mapInstance.getCenter()
  mapPickResult.value = {
    lat: center.getLat(),
    lng: center.getLng(),
    address: addressText.value,
  }
  router.back()
}

const onCancel = () => {
  mapPickResult.value = null
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

  mapInstance.plugin(['AMap.Geocoder', 'AMap.Geolocation'], () => {
    geocoderInstance = new AMap.Geocoder({})

    const geolocation = new AMap.Geolocation({ enableHighAccuracy: true, timeout: 5000 })
    geolocation.getCurrentPosition((status: string, result: any) => {
      if (status === 'complete' && result.position) {
        const { lng, lat } = result.position
        setCenter(lng, lat)
      }
      loading.value = false
    })
  })

  mapInstance.on('click', (e: any) => {
    setCenter(e.lnglat.getLng(), e.lnglat.getLat())
  })

  mapInstance.on('moveend', () => {
    const center = mapInstance.getCenter()
    updateCenterMarker(center.getLng(), center.getLat())
    reverseGeocode(center.getLng(), center.getLat())
  })

  // initial pin
  setTimeout(() => {
    const center = mapInstance.getCenter()
    updateCenterMarker(center.getLng(), center.getLat())
  }, 500)
}

onMounted(loadMap)
onUnmounted(() => {
  cleanupFns.forEach((fn) => fn())
  if (mapInstance) {
    mapInstance.destroy()
    mapInstance = null
  }
})
</script>

<template>
  <div class="map-picker-page">
    <div class="map-container-wrapper">
      <div ref="mapContainer" class="map-container">
        <div v-if="loading" class="map-loading">加载地图...</div>
        <div class="pin-center">
          <div class="pin-dot"></div>
        </div>
      </div>
      <div class="address-bar" v-if="!loading">{{ addressText }}</div>
    </div>

    <div class="bottom-bar safe-bottom">
      <van-button plain round class="cancel-btn" @click="onCancel">取消</van-button>
      <van-button round type="primary" class="confirm-btn" @click="onConfirm">确认位置</van-button>
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

.map-container-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.map-container {
  width: 100%;
  height: 100%;
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
  background: #fff;
}

.pin-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  pointer-events: none;
}

.pin-dot {
  width: 3.2vw;
  height: 3.2vw;
  border-radius: 50%;
  background: var(--color-primary);
  border: 0.8vw solid rgba(255, 107, 53, 0.3);
  box-shadow: 0 0 2.66667vw rgba(255, 107, 53, 0.3);
}

.address-bar {
  position: absolute;
  top: 4.26667vw;
  left: 4.26667vw;
  right: 4.26667vw;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 2.66667vw 3.73333vw;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  z-index: 10;
  text-align: center;
}

.bottom-bar {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: #fff;
  flex-shrink: 0;
}

.cancel-btn {
  flex: 1;
}

.confirm-btn {
  flex: 1;
}
</style>
