import type { Place, Category } from '@/types'

declare global {
  interface Window {
    AMap: any
  }
}

export const CATEGORY_MARKER_COLORS: Record<Category, string> = {
  restaurant: '#FF6B35',
  hotel: '#4A90D9',
  retail: '#52C41A',
  service: '#8B5CF6',
  entertainment: '#F5A623',
  custom: '#9E9E9E',
}

const AMAP_URL = `https://webapi.amap.com/maps?v=2.0&key=${import.meta.env.VITE_AMAP_KEY}&plugin=AMap.Geolocation,AMap.PlaceSearch,AMap.Geocoder`

interface MapInstance {
  map: any
  markers: Map<number, any>
}

const instanceByMap = new WeakMap<any, MapInstance>()
let amapLoadPromise: Promise<void> | null = null

export function useMap() {
  function loadAMap(): Promise<void> {
    if (amapLoadPromise) return amapLoadPromise
    if (window.AMap) {
      amapLoadPromise = Promise.resolve()
      return amapLoadPromise
    }

    amapLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = AMAP_URL
      script.onload = () => resolve()
      script.onerror = () => {
        amapLoadPromise = null
        reject(new Error('Failed to load AMap'))
      }
      document.head.appendChild(script)
    })

    return amapLoadPromise
  }

  function createMap(containerId: string) {
    const map = new window.AMap.Map(containerId, {
      zoom: 14,
      center: [116.397428, 39.90923],
      resizeEnable: true,
    })

    const instance: MapInstance = { map, markers: new Map() }
    instanceByMap.set(map, instance)

    return map
  }

  function getInstance(map: any): MapInstance | undefined {
    return instanceByMap.get(map)
  }

  function createMarkerContent(place: Place): HTMLElement {
    const color = CATEGORY_MARKER_COLORS[place.category]
    const container = document.createElement('div')
    container.style.display = 'flex'
    container.style.flexDirection = 'column'
    container.style.alignItems = 'center'

    const circle = document.createElement('div')
    circle.style.cssText = `width:24px;height:24px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);`

    const label = document.createElement('span')
    label.style.cssText = 'font-size:10px;color:#333;background:rgba(255,255,255,0.9);padding:1px 4px;border-radius:4px;margin-top:2px;max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'
    label.textContent = place.name

    container.appendChild(circle)
    container.appendChild(label)

    return container
  }

  function addMarker(map: any, place: Place): any {
    const instance = getInstance(map)
    if (!instance) return null

    const content = createMarkerContent(place)
    const marker = new window.AMap.Marker({
      position: [place.lng, place.lat],
      content,
      offset: new window.AMap.Pixel(-12, -30),
      zIndex: 100,
    })

    marker.setMap(map)

    if (place.id != null) {
      marker.extData = { placeId: place.id }
      instance.markers.set(place.id, marker)
    }

    return marker
  }

  function removeMarker(map: any, placeId: number) {
    const instance = getInstance(map)
    if (!instance) return

    const marker = instance.markers.get(placeId)
    if (marker) {
      marker.setMap(null)
      instance.markers.delete(placeId)
    }
  }

  function updateMarker(map: any, place: Place) {
    if (place.id != null) {
      removeMarker(map, place.id)
    }
    addMarker(map, place)
  }

  function clearMarkers(map: any) {
    const instance = getInstance(map)
    if (!instance) return

    instance.markers.forEach((marker) => {
      marker.setMap(null)
    })
    instance.markers.clear()
  }

  function locateUser(map: any): Promise<void> {
    return new Promise((resolve) => {
      window.AMap.plugin('AMap.Geolocation', () => {
        const geolocation = new window.AMap.Geolocation({
          enableHighAccuracy: true,
          timeout: 10000,
          zoomToAccuracy: true,
        })
        map.addControl(geolocation)
        geolocation.getCurrentPosition((status: string, result: any) => {
          if (status === 'complete' && result.position) {
            map.setZoomAndCenter(16, [result.position.lng, result.position.lat])
          }
          resolve()
        })
      })
    })
  }

  let searchTimer: ReturnType<typeof setTimeout> | null = null

  function searchPOI(_map: any, keyword: string): Promise<any[]> {
    return new Promise((resolve) => {
      if (searchTimer) clearTimeout(searchTimer)
      searchTimer = setTimeout(() => {
        window.AMap.plugin('AMap.PlaceSearch', () => {
          const placeSearch = new window.AMap.PlaceSearch({
            pageSize: 10,
          })
          placeSearch.search(keyword, (status: string, result: any) => {
            if (status === 'complete' && result.poiList) {
              resolve(result.poiList.pois || [])
            } else {
              resolve([])
            }
          })
        })
      }, 300)
    })
  }

  function reverseGeocode(_map: any, lng: number, lat: number): Promise<string> {
    return new Promise((resolve) => {
      window.AMap.plugin('AMap.Geocoder', () => {
        const geocoder = new window.AMap.Geocoder()
        geocoder.getAddress([lng, lat], (status: string, result: any) => {
          if (status === 'complete' && result.regeocode) {
            resolve(result.regeocode.formattedAddress || '')
          } else {
            resolve('')
          }
        })
      })
    })
  }

  function destroyMap(map: any) {
    const instance = getInstance(map)
    if (instance) {
      instance.markers.forEach((m) => m.setMap(null))
      instance.markers.clear()
      map.destroy()
      instanceByMap.delete(map)
    }
  }

  return {
    loadAMap,
    createMap,
    addMarker,
    removeMarker,
    updateMarker,
    clearMarkers,
    locateUser,
    searchPOI,
    reverseGeocode,
    destroyMap,
  }
}
