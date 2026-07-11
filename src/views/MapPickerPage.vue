<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { mapPickResult } from '@/composables/mapPickState'

const router = useRouter()
const mapContainer = ref<HTMLDivElement>()
const loading = ref(true)

let mapInstance: any = null
let geocoderInstance: any = null
let placeSearchInstance: any = null
let cleanupFns: (() => void)[] = []
let refreshTimer: ReturnType<typeof setTimeout> | null = null

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY
const AMAP_SECURITY_CODE = import.meta.env.VITE_AMAP_SECURITY_CODE
const AMAP_URL = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&plugin=AMap.Geocoder,AMap.Geolocation,AMap.PlaceSearch`

interface PoiItem {
  id: string
  name: string
  address: string
  lng: number
  lat: number
  distance?: number
}

const DEFAULT_CENTER: [number, number] = [116.397428, 39.90923]

const centerLng = ref(DEFAULT_CENTER[0])
const centerLat = ref(DEFAULT_CENTER[1])
const centerAddress = ref('定位中...')
const nearbyPois = ref<PoiItem[]>([])

// 两种选择模式：'center'=中心跟随（服务 GPS 漂移纠偏），'poi'=冻结到某周边地点
const mode = ref<'center' | 'poi'>('center')
const selectedPoi = ref<PoiItem | null>(null)

const selectedResult = computed(() => {
  if (mode.value === 'poi' && selectedPoi.value) {
    const p = selectedPoi.value
    return { lat: p.lat, lng: p.lng, address: p.address || p.name, name: p.name }
  }
  // 中心模式（当前位置）无 POI 名称，name 置空——回填端以空判定跳过覆盖店铺名称
  return { lat: centerLat.value, lng: centerLng.value, address: centerAddress.value, name: '' }
})

// 按 POI 唯一 id 判定选中：同一建筑内多个 POI 常共享坐标，用坐标会误选多个
const isPoiActive = (p: PoiItem) =>
  mode.value === 'poi' && !!selectedPoi.value && p.id === selectedPoi.value.id

// ---- AMAP 服务封装 ----
const reverseGeocode = (lng: number, lat: number) => {
  if (!geocoderInstance) return
  geocoderInstance.getAddress([lng, lat], (_status: string, result: any) => {
    if (result?.regeocode?.formattedAddress) {
      centerAddress.value = result.regeocode.formattedAddress
    }
  })
}

const searchNearBy = (lng: number, lat: number) => {
  if (!placeSearchInstance) return
  placeSearchInstance.searchNearBy('', [lng, lat], 1000, (_status: string, result: any) => {
    const pois = result?.poiList?.pois
    if (Array.isArray(pois)) {
      nearbyPois.value = pois.map((p: any, i: number): PoiItem => ({
        id: p.id || `${p.location?.lng},${p.location?.lat},${i}`,
        name: p.name,
        address: typeof p.address === 'string' && p.address ? p.address : p.name,
        lng: p.location.lng,
        lat: p.location.lat,
        distance: typeof p.distance === 'number' ? Math.round(p.distance) : undefined,
      }))
    } else {
      // 检索失败/无结果：保留“当前位置”首项即可，不清成空白也无妨
      nearbyPois.value = []
    }
  })
}

const refreshForCenter = (lng: number, lat: number) => {
  reverseGeocode(lng, lat)
  searchNearBy(lng, lat)
}

// 防抖刷新（拖动地图连续 moveend 时降频）
const scheduleRefresh = (lng: number, lat: number) => {
  if (refreshTimer) clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => refreshForCenter(lng, lat), 450)
}

// 显式跳转中心（定位结果 / 点选 POI / 点击地图）：setCenter 触发 moveend 统一处理刷新。
// immediately=true 关闭平移动画：避免从默认中心飞到用户位置的动画途中一路加载/取消瓦片。
const goTo = (lng: number, lat: number) => {
  mapInstance.setCenter([lng, lat], true)
}

// ---- 列表交互 ----
const selectCenter = () => {
  mode.value = 'center'
  selectedPoi.value = null
}

const selectPoi = (p: PoiItem) => {
  mode.value = 'poi'
  selectedPoi.value = p
  goTo(p.lng, p.lat) // 定位到该项（冻结选择不受 moveend 影响）
}

const onConfirm = () => {
  mapPickResult.value = { ...selectedResult.value }
  router.back()
}

const onCancel = () => {
  mapPickResult.value = null
  router.back()
}

// ---- 地图初始化 ----
const initMap = () => {
  if (!mapContainer.value) return
  const AMap = (window as any).AMap

  mapInstance = new AMap.Map(mapContainer.value, {
    zoom: 15,
    center: DEFAULT_CENTER,
  })

  mapInstance.plugin(['AMap.Geocoder', 'AMap.Geolocation', 'AMap.PlaceSearch'], () => {
    geocoderInstance = new AMap.Geocoder({})
    placeSearchInstance = new AMap.PlaceSearch({ pageSize: 20 })

    const geolocation = new AMap.Geolocation({ enableHighAccuracy: true, timeout: 5000 })
    geolocation.getCurrentPosition((status: string, result: any) => {
      if (status === 'complete' && result.position) {
        goTo(result.position.lng, result.position.lat)
      } else {
        // 定位失败：以默认中心立即刷新，避免地址栏/列表停在“定位中...”
        const c = mapInstance.getCenter()
        centerLng.value = c.getLng()
        centerLat.value = c.getLat()
        refreshForCenter(c.getLng(), c.getLat())
      }
      loading.value = false
    })
  })

  // 拖动/点击改变中心 → 更新中心状态并防抖刷新（中心跟随模式下选择随之更新）
  mapInstance.on('moveend', () => {
    const c = mapInstance.getCenter()
    centerLng.value = c.getLng()
    centerLat.value = c.getLat()
    scheduleRefresh(c.getLng(), c.getLat())
  })

  mapInstance.on('click', (e: any) => {
    goTo(e.lnglat.getLng(), e.lnglat.getLat())
  })
}

const loadMap = () => {
  if ((window as any).AMap) {
    initMap()
    return
  }
  // JSAPI 2.0：安全密钥必须在脚本加载前设置，否则 Geocoder/PlaceSearch/Geolocation 调用失败
  ;(window as any)._AMapSecurityConfig = { securityJsCode: AMAP_SECURITY_CODE }

  const script = document.createElement('script')
  script.src = AMAP_URL
  script.onload = initMap
  script.onerror = () => {
    loading.value = false
    centerAddress.value = '地图加载失败'
  }
  document.head.appendChild(script)
  cleanupFns.push(() => script.remove())
}

onMounted(loadMap)
onUnmounted(() => {
  if (refreshTimer) clearTimeout(refreshTimer)
  cleanupFns.forEach((fn) => fn())
  if (mapInstance) {
    mapInstance.destroy()
    mapInstance = null
  }
})
</script>

<template>
  <div class="map-picker-page">
    <div class="map-section">
      <div ref="mapContainer" class="map-container">
        <div v-if="loading" class="map-loading">加载地图...</div>
        <div class="pin-center">
          <div class="pin-dot"></div>
        </div>
      </div>
    </div>

    <div class="list-section">
      <div class="list-hint">选择地址（拖动地图可纠正定位）</div>
      <div class="addr-list">
        <div
          :class="['addr-item', { active: mode === 'center' }]"
          @click="selectCenter"
        >
          <div class="addr-name">当前位置</div>
          <div class="addr-detail">{{ centerAddress }}</div>
        </div>
        <div
          v-for="poi in nearbyPois"
          :key="poi.id"
          :class="['addr-item', { active: isPoiActive(poi) }]"
          @click="selectPoi(poi)"
        >
          <div class="addr-name">{{ poi.name }}</div>
          <div class="addr-detail">
            {{ poi.address }}
            <span v-if="poi.distance != null" class="addr-dist">· {{ poi.distance }}m</span>
          </div>
        </div>
      </div>
    </div>

    <div class="selected-summary">
      <span class="summary-label">已选</span>
      <span class="summary-addr">{{ selectedResult.address || '—' }}</span>
    </div>

    <div class="bottom-bar safe-bottom">
      <van-button plain round class="cancel-btn" @click="onCancel">取消</van-button>
      <van-button round type="primary" class="confirm-btn" @click="onConfirm">确认</van-button>
    </div>
  </div>
</template>

<style scoped>
.map-picker-page {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.map-section {
  height: 45vh;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
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

.list-section {
  flex: 1;
  overflow-y: auto;
  background: var(--color-bg-white);
}

.list-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  padding: var(--spacing-sm) var(--spacing-lg);
}

.addr-item {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  border-left: 3px solid transparent;
}

.addr-item.active {
  background: rgba(255, 107, 53, 0.08);
  border-left-color: var(--color-primary);
}

.addr-name {
  font-size: var(--font-size-md);
  color: var(--color-text);
  margin-bottom: 2px;
}

.addr-item.active .addr-name {
  color: var(--color-primary);
  font-weight: 600;
}

.addr-detail {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.addr-dist {
  color: var(--color-text-secondary);
}

.selected-summary {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--color-bg-white);
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.summary-label {
  font-size: var(--font-size-sm);
  color: #fff;
  background: var(--color-primary);
  border-radius: var(--radius-sm);
  padding: 1px 6px;
  flex-shrink: 0;
}

.summary-addr {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bottom-bar {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg-white);
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.cancel-btn {
  flex: 1;
}

.confirm-btn {
  flex: 1;
}
</style>
