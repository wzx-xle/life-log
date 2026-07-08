import { db } from '@/db'
import type { ExportData, Place, ImportResult } from '@/types'

export function useImport() {
  const validateFormat = (data: any): data is ExportData => {
    return (
      data &&
      typeof data.version === 'string' &&
      typeof data.exportDate === 'string' &&
      Array.isArray(data.places) &&
      Array.isArray(data.reviews)
    )
  }

  const importMerge = async (data: ExportData): Promise<ImportResult> => {
    const idMap = new Map<number, number>()

    for (const place of data.places) {
      const { id, ...placeData } = { ...place }
      delete (placeData as any).createdAt
      delete (placeData as any).updatedAt
      const newId = await db.places.add({
        ...placeData,
        createdAt: (placeData as any).createdAt || new Date(),
        updatedAt: (placeData as any).updatedAt || new Date(),
      } as Place)
      if (id !== undefined) idMap.set(id, newId)
    }

    for (const review of data.reviews) {
      const { id, placeId, placeName, ...reviewData } = review as any
      const newPlaceId = idMap.get(placeId) || placeId
      await db.reviews.add({
        ...reviewData,
        placeId: newPlaceId,
        createdAt: reviewData.createdAt || new Date(),
      })
    }

    return {
      placesCount: data.places.length,
      reviewsCount: data.reviews.length,
    }
  }

  const importOverwrite = async (data: ExportData): Promise<ImportResult> => {
    await db.transaction('rw', db.places, db.reviews, async () => {
      await db.places.clear()
      await db.reviews.clear()
      for (const place of data.places) {
        const { id, ...placeData } = place
        await db.places.add(placeData as Place)
      }
      for (const review of data.reviews) {
        const { id, placeName, ...reviewData } = review as any
        await db.reviews.add(reviewData)
      }
    })

    return {
      placesCount: data.places.length,
      reviewsCount: data.reviews.length,
    }
  }

  return { validateFormat, importMerge, importOverwrite }
}
