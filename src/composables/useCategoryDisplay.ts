import { ref } from 'vue'
import { useDatabase } from '@/composables/useDatabase'
import { CATEGORY_LABELS, CATEGORY_COLORS, type Category, type CustomCategory } from '@/types'

const cache = ref<CustomCategory[] | null>(null)

export function useCategoryDisplay() {
  const db = useDatabase()

  async function loadCustomCategories() {
    if (!cache.value) {
      cache.value = await db.getAllCustomCategories()
    }
  }

  function getLabel(place: { category: Category; customCategory?: string }): string {
    if (place.category === 'custom' && place.customCategory) {
      return place.customCategory
    }
    return CATEGORY_LABELS[place.category] || place.category
  }

  function getColor(place: { category: Category; customCategory?: string }): string {
    const label = getLabel(place)
    const cached = cache.value?.find((c) => c.name === label)
    if (cached) return cached.color
    return CATEGORY_COLORS[place.category] || CATEGORY_COLORS.custom
  }

  return { loadCustomCategories, getLabel, getColor }
}
