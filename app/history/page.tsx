'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/context'
import { BodyRecord } from '@/lib/types'

export default function HistoryPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const [records, setRecords] = useState<BodyRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/')
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) fetchRecords()
  }, [user])

  const fetchRecords = async () => {
    const { data } = await supabase
      .from('records')
      .select('*')
      .eq('user_id', user!.id)
      .order('date', { ascending: false })
    setRecords(data || [])
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この記録を削除しますか？')) return
    setDeleting(id)
    await supabase.from('records').delete().eq('id', id)
    setRecords((prev) => prev.filter((r) => r.id !== id))
    setDeleting(null)
  }

  if (authLoading || !user) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">記録の履歴</h1>
        <Link
          href="/log"
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          ＋ 記録する
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">読み込み中...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-sm">まだ記録がありません</p>
          <Link href="/log" className="mt-3 inline-block text-blue-600 text-sm hover:underline">
            最初の記録をつける →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="hidden md:grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            <div className="col-span-2">日付</div>
            <div className="col-span-2 text-right">体重</div>
            <div className="col-span-2 text-right">体脂肪率</div>
            <div className="col-span-4">メモ</div>
            <div className="col-span-2"></div>
          </div>

          <div className="divide-y divide-gray-50">
            {records.map((r) => (
              <div
                key={r.id}
                className="px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                {/* Mobile layout */}
                <div className="md:hidden">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {r.date.replace(/-/g, '/')}
                    </span>
                    <div className="flex gap-3">
                      <Link
                        href={`/log?date=${r.date}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        編集
                      </Link>
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deleting === r.id}
                        className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
                      >
                        {deleting === r.id ? '...' : '削除'}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    {r.weight && (
                      <span className="text-sm font-semibold text-blue-600">{r.weight}kg</span>
                    )}
                    {r.fat && (
                      <span className="text-sm font-semibold text-purple-600">{r.fat}%</span>
                    )}
                    {r.memo && (
                      <span className="text-xs text-gray-500 truncate">{r.memo}</span>
                    )}
                  </div>
                </div>

                {/* Desktop layout */}
                <div className="hidden md:grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-2 text-sm font-medium text-gray-700">
                    {r.date.replace(/-/g, '/')}
                  </div>
                  <div className="col-span-2 text-right">
                    {r.weight ? (
                      <span className="text-sm font-semibold text-blue-600">{r.weight}kg</span>
                    ) : (
                      <span className="text-gray-300 text-sm">—</span>
                    )}
                  </div>
                  <div className="col-span-2 text-right">
                    {r.fat ? (
                      <span className="text-sm font-semibold text-purple-600">{r.fat}%</span>
                    ) : (
                      <span className="text-gray-300 text-sm">—</span>
                    )}
                  </div>
                  <div className="col-span-4 text-xs text-gray-500 truncate">
                    {r.memo || ''}
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-3">
                    <Link
                      href={`/log?date=${r.date}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      編集
                    </Link>
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={deleting === r.id}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                      {deleting === r.id ? '...' : '削除'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
