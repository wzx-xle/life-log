import { describe, it, expect, beforeEach, vi } from 'vitest'
import { db } from '@/db'
import type { Category } from '@/types'

beforeEach(async () => {
  await db.customCategories.clear()
  vi.resetModules()
})

async function getUseCategoryDisplay() {
  const mod = await import('@/composables/useCategoryDisplay')
  return mod.useCategoryDisplay
}

function makePlace(category: Category, customCategory?: string) {
  return {
    id: 1,
    name: '测试店铺',
    category,
    customCategory,
    address: '',
    lat: 0,
    lng: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

describe('useCategoryDisplay', () => {
  describe('getLabel', () => {
    it('返回预设分类的中文标签', async () => {
      const { getLabel } = (await getUseCategoryDisplay())()

      expect(getLabel(makePlace('restaurant'))).toBe('餐饮')
      expect(getLabel(makePlace('hotel'))).toBe('住宿')
      expect(getLabel(makePlace('retail'))).toBe('零售')
      expect(getLabel(makePlace('service'))).toBe('生活服务')
      expect(getLabel(makePlace('entertainment'))).toBe('娱乐休闲')
      expect(getLabel(makePlace('custom'))).toBe('自定义')
    })

    it('custom + customCategory 返回自定义名称', async () => {
      const { getLabel } = (await getUseCategoryDisplay())()
      expect(getLabel(makePlace('custom', '理发'))).toBe('理发')
    })

    it('custom 无 customCategory 返回默认标签', async () => {
      const { getLabel } = (await getUseCategoryDisplay())()
      expect(getLabel(makePlace('custom', ''))).toBe('自定义')
      expect(getLabel(makePlace('custom', undefined))).toBe('自定义')
    })
  })

  describe('getColor', () => {
    it('缓存为空时回退到 CATEGORY_COLORS 预设色', async () => {
      const { getColor } = (await getUseCategoryDisplay())()
      expect(getColor(makePlace('restaurant'))).toBe('#FF6B35')
      expect(getColor(makePlace('custom'))).toBe('#9E9E9E')
    })

    it('加载缓存后，预设分类从 DB 读取颜色（支持用户改色）', async () => {
      // 模拟用户把"餐饮"颜色改了
      await db.customCategories.add({
        name: '餐饮',
        color: '#000000',
        createdAt: new Date(),
        isPreset: true,
      })

      const { loadCustomCategories, getColor } = (await getUseCategoryDisplay())()
      await loadCustomCategories()

      expect(getColor(makePlace('restaurant'))).toBe('#000000')
    })

    it('加载缓存后，自定义分类从 DB 读取颜色', async () => {
      await db.customCategories.add({
        name: '理发',
        color: '#E91E63',
        createdAt: new Date(),
      })

      const { loadCustomCategories, getColor } = (await getUseCategoryDisplay())()
      await loadCustomCategories()

      expect(getColor(makePlace('custom', '理发'))).toBe('#E91E63')
    })

    it('DB 中不存在的名称回退到预设色', async () => {
      const { loadCustomCategories, getColor } = (await getUseCategoryDisplay())()
      await loadCustomCategories()

      expect(getColor(makePlace('custom', '不存在的分类'))).toBe('#9E9E9E')
    })
  })

  describe('loadCustomCategories', () => {
    it('加载多个分类，getColor 各找各的颜色', async () => {
      await db.customCategories.bulkAdd([
        { name: '餐饮', color: '#AAAAAA', createdAt: new Date(), isPreset: true },
        { name: '理发', color: '#E91E63', createdAt: new Date() },
        { name: '健身房', color: '#4A90D9', createdAt: new Date() },
      ])

      const { loadCustomCategories, getColor } = (await getUseCategoryDisplay())()
      await loadCustomCategories()

      expect(getColor(makePlace('restaurant'))).toBe('#AAAAAA')
      expect(getColor(makePlace('custom', '理发'))).toBe('#E91E63')
      expect(getColor(makePlace('custom', '健身房'))).toBe('#4A90D9')
    })

    it('幂等：重复调用不报错', async () => {
      const { loadCustomCategories } = (await getUseCategoryDisplay())()
      await loadCustomCategories()
      await loadCustomCategories()
      expect(true).toBe(true)
    })
  })
})
