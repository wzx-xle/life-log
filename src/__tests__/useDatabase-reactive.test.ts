import { describe, it, expect, beforeEach } from 'vitest'
import { reactive, ref } from 'vue'
import { useDatabase } from '@/composables/useDatabase'
import { db } from '@/db'
import type { Place, Review } from '@/types'

// 复现并回归：向 IndexedDB 写入含 Vue 响应式代理（嵌套数组/对象）的记录时，
// structured clone 无法克隆 Proxy 会抛 DataCloneError。数据层深度解包后应正常写入。
describe('useDatabase - 响应式代理写入', () => {
  const { addPlace, updatePlace, addReview } = useDatabase()

  beforeEach(async () => {
    await db.places.clear()
    await db.reviews.clear()
  })

  it('保存带 reactive 标签与照片数组的店铺（原本抛 DataCloneError）', async () => {
    // 模拟表单：reactive 对象里读出的嵌套数组本身是 Proxy
    const form = reactive<Place>({
      name: '店铺A',
      category: 'restaurant',
      address: '地址A',
      lat: 1,
      lng: 2,
      tags: ['川菜', '辣'],
      photos: ['data:image/png;base64,AAAA'],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // 与真实提交路径一致：{ ...form } 浅拷贝，嵌套数组仍是 Proxy
    const id = await addPlace({ ...form })
    expect(id).toBeGreaterThan(0)

    const saved = await db.places.get(id as number)
    expect(saved?.tags).toEqual(['川菜', '辣'])
    expect(saved?.photos).toEqual(['data:image/png;base64,AAAA'])
    expect(saved?.createdAt).toBeInstanceOf(Date)
  })

  it('保存带 reactive 消费明细（嵌套对象数组）的记录', async () => {
    const items = ref([
      reactive({ name: '菜品A', price: 10 }),
      reactive({ name: '菜品B', price: 20 }),
    ])

    const review: Partial<Review> = {
      placeId: 1,
      date: new Date(),
      rating: { overall: 5 },
      items: [...items.value],
      tags: ['好吃'],
      createdAt: new Date(),
    }

    const id = await addReview(review as Review)
    const saved = await db.reviews.get(id as number)
    expect(saved?.items).toEqual([
      { name: '菜品A', price: 10 },
      { name: '菜品B', price: 20 },
    ])
  })

  it('updatePlace 传入 reactive patch 也能写入', async () => {
    const id = await addPlace({
      name: '店铺B',
      category: 'restaurant',
      address: '地址B',
      lat: 0,
      lng: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const patch = reactive({ tags: ['新标签'] })
    await updatePlace(id as number, { ...patch })

    const saved = await db.places.get(id as number)
    expect(saved?.tags).toEqual(['新标签'])
    expect(saved?.updatedAt).toBeInstanceOf(Date)
  })
})
