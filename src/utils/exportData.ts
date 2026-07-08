import { db } from '@/db'
import type { ExportData } from '@/types'

export function useExport() {
  const exportData = async (): Promise<ExportData> => {
    const places = await db.places.toArray()
    const reviews = await db.reviews.toArray()

    const placeNameMap = new Map<number, string>()
    places.forEach((p) => {
      if (p.id !== undefined) placeNameMap.set(p.id, p.name)
    })

    const reviewsWithPlaceName = reviews.map((r) => ({
      ...r,
      placeName: placeNameMap.get(r.placeId) || '未知店铺',
    }))

    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      places,
      reviews: reviewsWithPlaceName,
    }
  }

  const downloadExport = async () => {
    const data = await exportData()
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const date = new Date().toISOString().slice(0, 10)
    const link = document.createElement('a')
    link.href = url
    link.download = `lifelog_backup_${date}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return { exportData, downloadExport }
}
