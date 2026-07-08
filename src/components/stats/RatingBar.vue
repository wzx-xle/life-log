<script setup lang="ts">
import type { ECharts } from '@/utils/echarts'
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import type { Review } from '@/types'

const props = defineProps<{
  reviews: Review[]
}>()

const chartRef = ref<HTMLElement>()
let chartInstance: ECharts | null = null

function getRatingData() {
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  props.reviews.forEach((r) => {
    const score = r.rating?.overall
    if (score && score >= 1 && score <= 5) dist[score]++
  })
  return [1, 2, 3, 4, 5].map((n) => ({ label: `${n}星`, count: dist[n] }))
}

async function renderChart() {
  if (!chartRef.value) return
  if (chartInstance) chartInstance.dispose()

  const { init } = await import('@/utils/echarts')
  chartInstance = init(chartRef.value)
  const data = getRatingData()

  chartInstance.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 0, right: 16, top: 8, bottom: 0, containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.label),
      axisLabel: { color: '#999', fontSize: 11 },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#EBEBEB' } },
    },
    yAxis: {
      type: 'value',
      name: '条',
      minInterval: 1,
      splitLine: { lineStyle: { color: '#F0F0F0' } },
      axisLabel: { color: '#999', fontSize: 10 },
    },
    series: [
      {
        data: data.map((d) => d.count),
        type: 'bar',
        barWidth: 24,
        itemStyle: {
          color: '#FF6B35',
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
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
  () => props.reviews,
  () => nextTick(renderChart),
  { deep: true }
)
</script>

<template>
  <div ref="chartRef" class="bar-chart"></div>
</template>

<style scoped>
.bar-chart {
  width: 100%;
  height: 180px;
}
</style>
