<script setup lang="ts">
import * as echarts from 'echarts'
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import type { Review, Place } from '@/types'

const props = defineProps<{
  reviews: Review[]
  places: Place[]
}>()

const emit = defineEmits<{
  (e: 'drilldown', category: string): void
}>()

const CATEGORY_LABELS: Record<string, string> = {
  restaurant: '餐饮',
  hotel: '住宿',
  retail: '购物',
  service: '服务',
  entertainment: '娱乐',
  custom: '自定义',
}

const CATEGORY_COLORS: Record<string, string> = {
  restaurant: '#FF6B35',
  hotel: '#4A90D9',
  retail: '#52C41A',
  service: '#8B5CF6',
  entertainment: '#F5A623',
  custom: '#9E9E9E',
}

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

function getCategoryData() {
  const placeMap = new Map<number, Place>()
  props.places.forEach((p) => {
    if (p.id !== undefined) placeMap.set(p.id, p)
  })

  const categoryAmounts: Record<string, number> = {}
  props.reviews.forEach((r) => {
    const place = placeMap.get(r.placeId)
    const cat = place?.category || 'custom'
    if (!categoryAmounts[cat]) categoryAmounts[cat] = 0
    categoryAmounts[cat] += r.amount || 0
  })

  return Object.entries(categoryAmounts)
    .filter(([, amount]) => amount > 0)
    .map(([cat, amount]) => ({
      name: CATEGORY_LABELS[cat] || cat,
      value: Math.round(amount * 100) / 100,
      category: cat,
      itemStyle: { color: CATEGORY_COLORS[cat] || '#9E9E9E' },
    }))
}

function renderChart() {
  if (!chartRef.value) return
  if (chartInstance) chartInstance.dispose()

  chartInstance = echarts.init(chartRef.value)
  const data = getCategoryData()

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
