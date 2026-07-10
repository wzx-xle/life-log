import { toRaw } from 'vue'
import { db } from '@/db'
import type { Place, Review, CustomCategory } from '@/types'

// 深度解包 Vue 响应式代理，得到可被 structured clone 写入 IndexedDB 的纯数据。
// 递归处理嵌套数组/对象，保留 Date（不序列化），避免破坏基于时间字段的 Dexie 索引。
function deepToRaw<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => deepToRaw(item)) as unknown as T
  }
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const raw = toRaw(value as Record<string, unknown>)
    const out: Record<string, unknown> = {}
    for (const key in raw) {
      out[key] = deepToRaw(raw[key])
    }
    return out as T
  }
  return value
}

export function useDatabase() {
  const getAllPlaces = () => db.places.orderBy('updatedAt').reverse().toArray()

  const getPlacesByCategory = (category: string) =>
    db.places.where('category').equals(category).toArray()

  const getPlaceById = (id: number) => db.places.get(id)

  const addPlace = (place: Place) => {
    const record = deepToRaw(place)
    record.createdAt = new Date()
    record.updatedAt = new Date()
    return db.places.add(record)
  }

  const updatePlace = (id: number, place: Partial<Place>) => {
    const patch = deepToRaw(place)
    patch.updatedAt = new Date()
    return db.places.update(id, patch)
  }

  const deletePlace = async (id: number) => {
    await db.transaction('rw', db.places, db.reviews, async () => {
      await db.reviews.where('placeId').equals(id).delete()
      await db.places.delete(id)
    })
  }

  const getPlaceReviewCount = (placeId: number) =>
    db.reviews.where('placeId').equals(placeId).count()

  const getReviewsByPlaceId = (placeId: number) =>
    db.reviews.where('placeId').equals(placeId).reverse().sortBy('date')

  const getAllReviews = () =>
    db.reviews.orderBy('date').reverse().toArray()

  const getReviewById = (id: number) => db.reviews.get(id)

  const addReview = (review: Review) => {
    const record = deepToRaw(review)
    record.createdAt = new Date()
    return db.reviews.add(record)
  }

  const updateReview = (id: number, review: Partial<Review>) =>
    db.reviews.update(id, deepToRaw(review))

  const deleteReview = (id: number) => db.reviews.delete(id)

  const getReviewCount = () => db.reviews.count()

  const getTotalAmount = async () => {
    const reviews = await db.reviews.toArray()
    return reviews.reduce((sum, r) => sum + (r.amount || 0), 0)
  }

  const getRatingDistribution = async () => {
    const reviews = await db.reviews.toArray()
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    reviews.forEach((r) => {
      const score = r.rating?.overall
      if (score && score >= 1 && score <= 5) dist[score]++
    })
    return dist
  }

  const getAllCustomCategories = () =>
    db.customCategories.orderBy('createdAt').toArray()

  const addCustomCategory = (cat: CustomCategory) => {
    const record = deepToRaw(cat)
    record.createdAt = new Date()
    return db.customCategories.add(record)
  }

  const updateCustomCategory = (id: number, cat: Partial<CustomCategory>) =>
    db.customCategories.update(id, deepToRaw(cat))

  const deleteCustomCategory = (id: number) =>
    db.customCategories.delete(id)

  const renameCustomCategoryInPlaces = (oldName: string, newName: string) =>
    db.places
      .where('customCategory')
      .equals(oldName)
      .modify({ customCategory: newName })

  return {
    getAllPlaces,
    getPlacesByCategory,
    getPlaceById,
    addPlace,
    updatePlace,
    deletePlace,
    getPlaceReviewCount,
    getReviewsByPlaceId,
    getAllReviews,
    getReviewById,
    addReview,
    updateReview,
    deleteReview,
    getReviewCount,
    getTotalAmount,
    getRatingDistribution,
    getAllCustomCategories,
    addCustomCategory,
    updateCustomCategory,
    deleteCustomCategory,
    renameCustomCategoryInPlaces,
  }
}
