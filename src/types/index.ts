export type Category = 'restaurant' | 'hotel' | 'retail' | 'service' | 'entertainment' | 'custom'

export const CATEGORY_LABELS: Record<Category, string> = {
  restaurant: '餐饮',
  hotel: '住宿',
  retail: '零售',
  service: '生活服务',
  entertainment: '娱乐休闲',
  custom: '自定义',
}

export const CATEGORY_COLORS: Record<Category, string> = {
  restaurant: '#FF6B35',
  hotel: '#4A90D9',
  retail: '#52C41A',
  service: '#8B5CF6',
  entertainment: '#F5A623',
  custom: '#9E9E9E',
}

export const CATEGORY_LIST: (Category | 'all')[] = ['all', 'restaurant', 'hotel', 'retail', 'service', 'entertainment', 'custom']

export const CATEGORY_FILTER_LABELS: Record<Category | 'all', string> = {
  all: '全部',
  restaurant: '餐饮',
  hotel: '住宿',
  retail: '零售',
  service: '生活服务',
  entertainment: '娱乐',
  custom: '自定义',
}

export interface Place {
  id?: number
  name: string
  category: Category
  customCategory?: string
  address: string
  lat: number
  lng: number
  phone?: string
  businessHours?: string
  tags?: string[]
  photos?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Rating {
  service?: number
  environment?: number
  value?: number
  overall?: number
}

export interface ConsumptionItem {
  name: string
  price: number
}

export type ReviewMode = 'quick' | 'full'

export interface Review {
  id?: number
  placeId: number
  date: Date
  rating: Rating
  content?: string
  amount?: number
  items?: ConsumptionItem[]
  photos?: string[]
  willRevisit?: boolean | null
  tags?: string[]
  createdAt: Date
}

export interface ExportData {
  version: string
  exportDate: string
  places: Place[]
  reviews: (Review & { placeName: string })[]
}

export interface ImportResult {
  placesCount: number
  reviewsCount: number
}
