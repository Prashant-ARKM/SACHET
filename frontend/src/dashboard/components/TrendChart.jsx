import ReactECharts from 'echarts-for-react'
import { dailySeries } from '../lib/stats.js'
import { C, axisStyle, tooltipStyle, fade } from '../lib/theme.js'

export default function TrendChart({ reports, days = 30, height = '100%' }) {
  const series = dailySeries(reports, days || 30)

  const option = {
    grid: { left: 32, right: 12, top: 8, bottom: 24 },
    tooltip: { trigger: 'axis', ...tooltipStyle },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: series.map((b) => b.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })),
      ...axisStyle,
      splitLine: { show: false },
    },
    yAxis: { type: 'value', minInterval: 1, ...axisStyle },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { color: C.forest, width: 2.5 },
        areaStyle: { color: fade(C.leaf, 0.4) },
        data: series.map((b) => b.count),
      },
    ],
  }

  return <ReactECharts option={option} style={{ height }} notMerge />
}
