import { describe, it, expect, beforeEach } from 'vitest'
import { useDatabase } from '@/composables/useDatabase'
import { db } from '@/db'

describe('useDatabase - 自定义分类 CRUD', () => {
  const { getAllCustomCategories, addCustomCategory, updateCustomCategory, deleteCustomCategory, renameCustomCategoryInPlaces, addPlace } =
    useDatabase()

  beforeEach(async () => {
    await db.customCategories.clear()
    await db.places.clear()
  })

  describe('addCustomCategory', () => {
    it('创建自定义分类并自动设置 createdAt', async () => {
      const id = await addCustomCategory({
        name: '理发',
        color: '#E91E63',
        createdAt: new Date(0),
      })

      expect(id).toBeGreaterThan(0)

      const cats = await getAllCustomCategories()
      expect(cats).toHaveLength(1)
      expect(cats[0].name).toBe('理发')
      expect(cats[0].color).toBe('#E91E63')
      expect(cats[0].createdAt).toBeInstanceOf(Date)
      // createdAt 被覆盖为当前时间，而非传入的 new Date(0)
      expect(cats[0].createdAt.getTime()).toBeGreaterThan(0)
    })
  })

  describe('getAllCustomCategories', () => {
    it('按创建时间升序返回', async () => {
      await addCustomCategory({ name: '第一个', color: '#111', createdAt: new Date() })
      // 手动延迟确保时间戳不同
      await new Promise((r) => setTimeout(r, 10))
      await addCustomCategory({ name: '第二个', color: '#222', createdAt: new Date() })

      const cats = await getAllCustomCategories()
      expect(cats).toHaveLength(2)
      expect(cats[0].name).toBe('第一个')
      expect(cats[1].name).toBe('第二个')
    })

    it('无数据时返回空数组', async () => {
      const cats = await getAllCustomCategories()
      expect(cats).toEqual([])
    })
  })

  describe('updateCustomCategory', () => {
    it('更新分类名称和颜色', async () => {
      const id = await addCustomCategory({
        name: '旧名称',
        color: '#111',
        createdAt: new Date(),
      })

      await updateCustomCategory(id as number, {
        name: '新名称',
        color: '#E91E63',
      })

      const cats = await getAllCustomCategories()
      expect(cats[0].name).toBe('新名称')
      expect(cats[0].color).toBe('#E91E63')
    })
  })

  describe('deleteCustomCategory', () => {
    it('删除分类', async () => {
      const id = await addCustomCategory({
        name: '待删除',
        color: '#111',
        createdAt: new Date(),
      })

      await deleteCustomCategory(id as number)

      const cats = await getAllCustomCategories()
      expect(cats).toHaveLength(0)
    })
  })

  describe('renameCustomCategoryInPlaces', () => {
    it('批量更新关联 Place 的 customCategory 字段', async () => {
      await addPlace({
        name: '店铺A',
        category: 'custom',
        customCategory: '理发',
        address: '地址A',
        lat: 0,
        lng: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      await addPlace({
        name: '店铺B',
        category: 'custom',
        customCategory: '理发',
        address: '地址B',
        lat: 0,
        lng: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      await addPlace({
        name: '店铺C',
        category: 'restaurant',
        customCategory: '',
        address: '地址C',
        lat: 0,
        lng: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await renameCustomCategoryInPlaces('理发', '美发')

      const places = await db.places.toArray()
      expect(places.find((p) => p.name === '店铺A')?.customCategory).toBe('美发')
      expect(places.find((p) => p.name === '店铺B')?.customCategory).toBe('美发')
      // 不匹配的不受影响
      expect(places.find((p) => p.name === '店铺C')?.customCategory).toBe('')
    })

    it('无匹配 Place 时不报错', async () => {
      const result = await renameCustomCategoryInPlaces('不存在的分类', '新名称')
      // modify() 返回更新的记录数，无匹配时为 0
      expect(result).toBe(0)
    })
  })
})
