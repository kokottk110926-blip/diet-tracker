'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/context'
import { BodyRecord } from '@/lib/types'

const ProgressChart = dynamic(() => import('@/components/ProgressChart'), { ssr: false })

function calcBMI(weight: number, height: number) {
  const h = height / 100
  return Math.round((weight / (h * h)) * 10) / 10
}

function bmiInfo(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: '低体重', color: 'text-blue-500' }
  if (bmi < 25) return { label: '普通体重', color: 'text-green-600' }
  if (bmi < 30) return { label: '肥満(1度)', color: 'text-yellow-600' }
  return { label: '肥満(2度以上)', color: 'text-red-500' }
}

function StatCard({
  label,
  value,
  sub,
  accent,
  subColor,
}: {
  label: string
  value: string
  sub: string
  accent: string
  subColor?: string
}) {
  return (
    <div className={`rounded-2xl p-4 ${accent}`}>
      <p className="text-xs font-medium opacity-60 mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
      <p className={`text-xs mt-1 ${subColor || 'opacity-50'}`}>{sub}</p>
    </div>
  )
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const [chartRecords, setChartRecords] = useState<BodyRecord[]>([])
  const [recentRecords, setRecentRecords] = useState<BodyRecord[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/')
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  const fetchData = async () => {
    setLoadingData(true)
    const from = new Date()
    from.setDate(from.getDate() - 29)
    const fromDate = from.toISOString().split('T')[0]

    const [{ data: chart }, { data: recent }] = await Promise.all([
      supabase
        .from('records')
        .select('*')
        .eq('user_id', user!.id)
        .gte('date', fromDate)
        .order('date', { ascending: true }),
      supabase
        .from('records')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false })
        .limit(5),
    ])

    setChartRecords(chart || [])
    setRecentRecords(recent || [])
    setLoadingData(false)
  }

  if (authLoading || !user) return null

  const latest = recentRecords[0]
  const bmi =
    latest?.weight && user.height ? calcBMI(latest.weight, user.height) : null
  const bmiMeta = bmi ? bmiInfo(bmi) : null

  const chartData = (() => {
    const map = Object.fromEntries(chartRecords.map((r) => [r.date, r]))
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - 29 + i)
      const dateStr = d.toISOString().split('T')[0]
      const r = map[dateStr]
      return {
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        weight: r?.weight ?? null,
        bodyFat: r?.fat ?? null,
      }
    })
  })()

  const toGoal =
    user.goal_weight && latest?.weight
      ? +(latest.weight - user.goal_weight).toFixed(1)
      : null

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">
          {user.name}さんのダッシュボード
        </h1>
        <Link
          href="/log"
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          ＋ 記録する
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="体重"
          value={latest?.weight ? `${latest.weight}kg` : '—'}
          sub={latest?.date ? `${latest.date.slice(5).replace('-', '/')} 計測` : '未記録'}
          accent="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700"
        />
        <StatCard
          label="体脂肪率"
          value={latest?.fat ? `${latest.fat}%` : '—'}
          sub={latest?.fat ? '最新値' : '未記録'}
          accent="bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700"
        />
        <StatCard
          label="BMI"
          value={bmi ? String(bmi) : user.height ? '—' : '身長未設定'}
          sub={bmiMeta?.label || (user.height ? '未記録' : '設定で入力')}
          accent="bg-gradient-to-br from-green-50 to-green-100 text-green-700"
          subColor={bmiMeta?.color}
        />
        <StatCard
          label="目標まで"
          value={toGoal !== null ? (toGoal > 0 ? `あと${toGoal}kg` : '達成！') : '—'}
          sub={user.goal_weight ? `目標 ${user.goal_weight}kg` : '目標未設定'}
          accent="bg-gradient-to-br from-orange-50 to-orange-100 text-orange-700"
          subColor={toGoal !== null && toGoal <= 0 ? 'text-green-600' : undefined}
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 mb-4">30日間の進捗</h2>
        {loadingData ? (
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
            読み込み中...
          </div>
        ) : chartRecords.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-sm">まだ記録がありません</p>
            <Link href="/log" className="mt-3 text-blue-600 text-sm hover:underline">
              最初の記録をつける →
            </Link>
          </div>
        ) : (
          <ProgressChart
            data={chartData}
            goalWeight={user.goal_weight}
            goalBodyFat={user.goal_fat}
          />
        )}
      </div>

      {/* Recent records */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500">最近の記録</h2>
          <Link href="/history" className="text-blue-600 text-xs hover:underline">
            すべて見る →
          </Link>
        </div>
        {recentRecords.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">まだ記録がありません</p>
        ) : (
          <div className="space-y-0 divide-y divide-gray-50">
            {recentRecords.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <span className="text-sm text-gray-500 w-24 shrink-0">
                  {r.date.replace(/-/g, '/')}
                </span>
                <div className="flex items-center gap-3 flex-1">
                  {r.weight && (
                    <span className="text-sm font-semibold text-blue-600">
                      {r.weight}kg
                    </span>
                  )}
                  {r.fat && (
                    <span className="text-sm font-semibold text-purple-600">
                      {r.fat}%
                    </span>
                  )}
                  {r.memo && (
                    <span className="text-xs text-gray-400 truncate max-w-40">
                      {r.memo}
                    </span>
                  )}
                </div>
                <Link
                  href={`/log?date=${r.date}`}
                  className="text-xs text-gray-400 hover:text-blue-600 transition-colors ml-2"
                >
                  編集
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
