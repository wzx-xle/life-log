<script setup lang="ts">
import * as echarts from 'echarts'
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import type { Review, Place, Category, CustomCategory } from '@/types'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types'
import { useDatabase } from '@/composables/useDatabase'

const props = defineProps<{
  reviews: Review[]
  places: Place[]
}>()

const emit = defineEmits<{
  (e: 'drilldown', category: string): void
}>()

const { getAllCustomCategories } = useDatabase()

const chartRef = ref<HTMLElement>()
const customCategories = ref<CustomCategory[]>([])
let chartInstance: echarts.ECharts | null = null

function getDisplayLabel(key: string): string {
  return CATEGORY_LABELS[key as Category] || key
}

function getColor(key: string): string {
  const label = getDisplayLabel(key)
  const cached = customCategories.value.find((c) => c.name === label)
  if (cached) return cached.color
  return CATEGORY_COLORS[key as Category] || '#9E9E9E'
}

async function getCategoryData() {
  if (customCategories.value.length === 0) {
    customCategories.value = await getAllCustomCategories()
  }

  const placeMap = new Map<number, Place>()
  props.places.forEach((p) => {
    if (p.id !== undefined) placeMap.set(p.id, p)
  })

  const categoryAmounts: Record<string, number> = {}
  props.reviews.forEach((r) => {
    const place = placeMap.get(r.placeId)
    const cat = place?.category || 'custom'
    const customName = place?.customCategory
    const key = cat === 'custom' && customName ? customName : cat
    if (!categoryAmounts[key]) categoryAmounts[key] = 0
    categoryAmounts[key] += r.amount || 0
  })

  return Object.entries(categoryAmounts)
    .filter(([, amount]) => amount > 0)
    .map(([key, amount]) => ({
      name: getDisplayLabel(key),
      value: Math.round(amount * 100) / 100,
      category: key,
      itemStyle: { color: getColor(key) },
    }))
}

async function renderChart() {
  if (!chartRef.value) return
  if (chartInstance) chartInstance.dispose()

  chartInstance = echarts.init(chartRef.value)
  const data = await getCategoryData()

  if (data.length === 0) {
    chartInstance.setOption({
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'center',
        textStyle: { color: '#999', fontSize: 14 },
      },
    })
    return
  }

  chartInstance.setOption({
    tooltip: {
      trigger: 'item',
      formatter: (params: any) =>
        `${params.name}<br/>消费：¥${params.value.toFixed(2)} (${params.percent}%)`,
    },
    legend: {
      bottom: 0,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: '#666', fontSize: 11 },
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '43%'],
        data,
        label: {
          formatter: '{b}\n{d}%',
          fontSize: 10,
          color: '#666',
        },
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.2)' },
        },
      },
    ],
  })

  chartInstance.on('click', (params: any) => {
    if (params.data?.category) {
      emit('drilldown', params.data.category)
    }
  })
}

function onResize() {
  chartInstance?.resize()
}

onMounted(() => {
  nextTick(renderChart)
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  chartInstance?.dispose()
  chartInstance = null
})

watch(
  () => [props.reviews, props.places],
  () => nextTick(renderChart),
  { deep: true }
)
</script>

<template>
  <div ref="chartRef" class="pie-chart"></div>
</template>

<style scoped>
.pie-chart {
  width: 100%;
  height: 280px;
}
</style>
