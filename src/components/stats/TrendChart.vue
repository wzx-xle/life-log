<script setup lang="ts">
import type { ECharts } from '@/utils/echarts'
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import type { Review } from '@/types'

const props = defineProps<{
  reviews: Review[]
}>()

const chartRef = ref<HTMLElement>()
let chartInstance: ECharts | null = null
let echartsGraphic: typeof import('@/utils/echarts').graphic | null = null

function getMonthlyData() {
  const now = new Date()
  const monthLabels: string[] = []
  const amounts: number[] = []

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthLabels.push(`${d.getMonth() + 1}月`)
    amounts.push(0)
  }

  props.reviews.forEach((r) => {
    const d = new Date(r.date)
    const monthIndex =
      (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth())
    const idx = 11 - monthIndex
    if (idx >= 0 && idx < 12) {
      amounts[idx] += r.amount || 0
    }
  })

  return { monthLabels, amounts }
}

async function renderChart() {
  if (!chartRef.value) return
  if (chartInstance) chartInstance.dispose()

  const echarts = await import('@/utils/echarts')
  chartInstance = echarts.init(chartRef.value)
  echartsGraphic = echarts.graphic
  const { monthLabels, amounts } = getMonthlyData()

  chartInstance.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const p = params[0]
        return `${p.name}<br/>消费：¥${p.value.toFixed(2)}`
      },
    },
    grid: { left: 0, right: 16, top: 16, bottom: 0, containLabel: true },
    xAxis: {
      type: 'category',
      data: monthLabels,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#EBEBEB' } },
      axisTick: { show: false },
      axisLabel: { color: '#999', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      name: '元',
      minInterval: 1,
      nameTextStyle: { color: '#999', fontSize: 10 },
      splitLine: { lineStyle: { color: '#F0F0F0' } },
      axisLabel: { color: '#999', fontSize: 10 },
    },
    series: [
      {
        data: amounts,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#FF6B35', width: 2 },
        itemStyle: { color: '#FF6B35' },
        areaStyle: {
          color: new echartsGraphic!.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255,107,53,0.25)' },
            { offset: 1, color: 'rgba(255,107,53,0.02)' },
          ]),
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
  <div ref="chartRef" class="trend-chart"></div>
</template>

<style scoped>
.trend-chart {
  width: 100%;
  height: 200px;
}
</style>
