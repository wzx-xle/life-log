import Dexie, { type Table } from 'dexie'
import type { Place, Review, CustomCategory } from '@/types'
import { CATEGORY_COLORS, LABEL_TO_CATEGORY_KEY } from '@/types'

const PRESET_SEEDS: Omit<CustomCategory, 'id'>[] = Object.entries(LABEL_TO_CATEGORY_KEY).map(([label, key]) => ({
  name: label,
  color: CATEGORY_COLORS[key],
  createdAt: new Date(0),
  isPreset: true,
}))

export class LifeLogDB extends Dexie {
  places!: Table<Place, number>
  reviews!: Table<Review, number>
  customCategories!: Table<CustomCategory, number>

  constructor() {
    super('LifeLogDB')
    this.version(1).stores({
      places: '++id, category, name, lat, lng, createdAt, updatedAt',
      reviews: '++id, placeId, date, createdAt',
    })
    this.version(2).stores({
      places: '++id, category, name, lat, lng, createdAt, updatedAt',
      reviews: '++id, placeId, date, createdAt',
      customCategories: '++id, name',
    })
    this.version(3).stores({
      places: '++id, category, customCategory, name, lat, lng, createdAt, updatedAt',
      reviews: '++id, placeId, date, createdAt',
      customCategories: '++id, name, createdAt',
    }).upgrade(async (tx) => {
      const count = await tx.table('customCategories').count()
      if (count === 0) {
        await tx.table('customCategories').bulkAdd(PRESET_SEEDS.map((s) => ({ ...s })))
      }
    })
  }
}

export const db = new LifeLogDB()

db.on('populate', () => {
  db.customCategories.bulkAdd(PRESET_SEEDS.map((s) => ({ ...s })))
})
