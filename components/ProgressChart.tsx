'use client'
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'

interface ChartPoint {
  date: string
  weight: number | null
  bodyFat: number | null
}

interface Props {
  data: ChartPoint[]
  goalWeight?: number | null
  goalBodyFat?: number | null
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}:{' '}
          {p.value != null
            ? p.name === '体重'
              ? `${p.value}kg`
              : `${p.value}%`
            : '—'}
        </p>
      ))}
    </div>
  )
}

export default function ProgressChart({ data, goalWeight, goalBodyFat }: Props) {
  const hasWeight = data.some((d) => d.weight !== null)
  const hasBodyFat = data.some((d) => d.bodyFat !== null)

  const weights = data.filter((d) => d.weight !== null).map((d) => d.weight as number)
  const fats = data.filter((d) => d.bodyFat !== null).map((d) => d.bodyFat as number)

  const pad = (arr: number[], goal?: number | null) => {
    const all = goal ? [...arr, goal] : arr
    return {
      min: Math.floor(Math.min(...all) - 1.5),
      max: Math.ceil(Math.max(...all) + 1.5),
    }
  }

  const wDomain = weights.length ? pad(weights, goalWeight) : null
  const fDomain = fats.length ? pad(fats, goalBodyFat) : null

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickLine={false}
          interval={4}
        />
        {hasWeight && (
          <YAxis
            yAxisId="weight"
            orientation="left"
            domain={wDomain ? [wDomain.min, wDomain.max] : ['auto', 'auto']}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            tickFormatter={(v) => `${v}kg`}
          />
        )}
        {hasBodyFat && (
          <YAxis
            yAxisId="fat"
            orientation="right"
            domain={fDomain ? [fDomain.min, fDomain.max] : ['auto', 'auto']}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
        )}
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        {hasWeight && (
          <Line
            yAxisId="weight"
            type="monotone"
            dataKey="weight"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            name="体重"
            connectNulls={false}
          />
        )}
        {hasBodyFat && (
          <Line
            yAxisId="fat"
            type="monotone"
            dataKey="bodyFat"
            stroke="#8b5cf6"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            name="体脂肪率"
            connectNulls={false}
          />
        )}
        {goalWeight && hasWeight && (
          <ReferenceLine
            yAxisId="weight"
            y={goalWeight}
            stroke="#3b82f6"
            strokeDasharray="6 3"
            strokeOpacity={0.5}
            label={{ value: `目標 ${goalWeight}kg`, position: 'insideTopLeft', fontSize: 10, fill: '#3b82f6' }}
          />
        )}
        {goalBodyFat && hasBodyFat && (
          <ReferenceLine
            yAxisId="fat"
            y={goalBodyFat}
            stroke="#8b5cf6"
            strokeDasharray="6 3"
            strokeOpacity={0.5}
            label={{ value: `目標 ${goalBodyFat}%`, position: 'insideTopRight', fontSize: 10, fill: '#8b5cf6' }}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
