import ReactECharts from 'echarts-for-react'
import { countBy, sortedCounts } from '../lib/stats.js'
import { scamLabel } from '../../shared/scamTypes.js'
import { C, axisStyle, tooltipStyle } from '../lib/theme.js'

export default function TypeChart({ reports, onSelect, selected, limit, height = '100%' }) {
  let rows = sortedCounts(countBy(reports, 'scam_type'))
  if (limit) rows = rows.slice(0, limit)
  rows = rows.reverse() // biggest on top

  const option = {
    grid: { left: 112, right: 36, top: 0, bottom: 18 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, ...tooltipStyle },
    xAxis: { type: 'value', minInterval: 1, ...axisStyle },
    yAxis: {
      type: 'category',
      data: rows.map(([id]) => scamLabel(id)),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: C.ink },
    },
    series: [
      {
        type: 'bar',
        barMaxWidth: 18,
        label: { show: true, position: 'right', color: C.muted },
        data: rows.map(([id, n]) => ({
          value: n,
          itemStyle: { color: !selected || selected === id ? C.forest : C.line, borderRadius: [0, 6, 6, 0] },
        })),
      },
    ],
  }

  return (
    <ReactECharts
      option={option}
      style={{ height }}
      notMerge
      onEvents={{ click: (p) => onSelect?.(rows[p.dataIndex][0]) }}
    />
  )
}
