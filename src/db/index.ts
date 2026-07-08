import Dexie, { type Table } from 'dexie'
import type { Place, Review } from '@/types'

export class LifeLogDB extends Dexie {
  places!: Table<Place, number>
  reviews!: Table<Review, number>

  constructor() {
    super('LifeLogDB')
    this.version(1).stores({
      places: '++id, category, name, lat, lng, createdAt, updatedAt',
      reviews: '++id, placeId, date, createdAt',
    })
  }
}

export const db = new LifeLogDB()
