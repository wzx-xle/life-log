import { db } from '@/db'
import type { Place, Review } from '@/types'

export function useDatabase() {
  const getAllPlaces = () => db.places.orderBy('updatedAt').reverse().toArray()

  const getPlacesByCategory = (category: string) =>
    db.places.where('category').equals(category).toArray()

  const getPlaceById = (id: number) => db.places.get(id)

  const addPlace = (place: Place) => {
    place.createdAt = new Date()
    place.updatedAt = new Date()
    return db.places.add(place)
  }

  const updatePlace = (id: number, place: Partial<Place>) => {
    place.updatedAt = new Date()
    return db.places.update(id, place)
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
    review.createdAt = new Date()
    return db.reviews.add(review)
  }

  const updateReview = (id: number, review: Partial<Review>) =>
    db.reviews.update(id, review)

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
  }
}
