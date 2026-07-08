import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useDatabase } from '@/composables/useDatabase'
import type { Place } from '@/types'

export const usePlaceStore = defineStore('places', () => {
  const places = ref<Place[]>([])
  const loading = ref(false)
  const db = useDatabase()

  const fetchPlaces = async () => {
    loading.value = true
    try {
      places.value = await db.getAllPlaces()
    } finally {
      loading.value = false
    }
  }

  const loadPlaces = fetchPlaces

  const getPlaceById = (id: number) => places.value.find((p) => p.id === id)

  async function addPlace(place: Place) {
    const id = await db.addPlace(place)
    places.value.unshift({ ...place, id: id as number })
  }

  async function updatePlace(place: Place) {
    if (place.id == null) return
    await db.updatePlace(place.id, place)
    const idx = places.value.findIndex((p) => p.id === place.id)
    if (idx !== -1) {
      places.value[idx] = { ...places.value[idx], ...place }
    }
  }

  async function removePlace(id: number) {
    await db.deletePlace(id)
    places.value = places.value.filter((p) => p.id !== id)
  }

  return { places, loading, fetchPlaces, loadPlaces, getPlaceById, addPlace, updatePlace, removePlace }
})
