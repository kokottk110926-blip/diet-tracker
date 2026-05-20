'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/context'
import { BodyRecord } from '@/lib/types'
import { calcBMI, bmiInfo, calcBMR, calcBodyAge } from '@/lib/calc'

function LogForm() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()

  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(searchParams.get('date') || today)
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [memo, setMemo] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [existing, setExisting] = useState<BodyRecord | null>(null)
  const [checkingDate, setCheckingDate] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/')
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && date) checkExisting()
  }, [date, user])

  const checkExisting = async () => {
    setCheckingDate(true)
    const { data } = await supabase
      .from('records')
      .select('*')
      .eq('user_id', user!.id)
      .eq('date', date)
      .maybeSingle()

    if (data) {
      setExisting(data)
      setWeight(data.weight != null ? String(data.weight) : '')
      setBodyFat(data.fat != null ? String(data.fat) : '')
      setMemo(data.memo || '')
    } else {
      setExisting(null)
      setWeight('')
      setBodyFat('')
      setMemo('')
    }
    setCheckingDate(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!weight && !bodyFat) {
      setError('体重か体脂肪率のどちらかを入力してください')
      return
    }

    setError('')
    setSaving(true)

    const { error: sbError } = await supabase.from('records').upsert(
      {
        user_id: user.id,
        date,
        weight: weight ? parseFloat(weight) : null,
        fat: bodyFat ? parseFloat(bodyFat) : null,
        memo: memo || null,
      },
      { onConflict: 'user_id,date' }
    )

    if (sbError) {
      setError(`保存に失敗しました: ${sbError.message}`)
    } else {
      setSaved(true)
      setTimeout(() => router.push('/dashboard'), 1000)
    }
    setSaving(false)
  }

  if (authLoading || !user) return null

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6">
        {existing ? '記録を編集' : '記録する'}
      </h1>

      {saved && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium text-center">
          ✓ 保存しました！
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5"
      >
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">日付</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
          />
          {checkingDate && (
            <p className="text-xs text-gray-400 mt-1">確認中...</p>
          )}
          {!checkingDate && existing && (
            <p className="text-xs text-amber-600 mt-1">
              この日の記録があります。上書きされます。
            </p>
          )}
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            体重 <span className="text-gray-400 font-normal">(kg)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="20"
              max="300"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="例: 65.5"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              kg
            </span>
          </div>
        </div>

        {/* Body Fat */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            体脂肪率 <span className="text-gray-400 font-normal">(%)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="1"
              max="70"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              placeholder="例: 20.5"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              %
            </span>
          </div>
        </div>

        {/* Memo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            メモ <span className="text-gray-400 font-normal">(任意)</span>
          </label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="今日の食事、運動など..."
            rows={3}
            maxLength={200}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-400 text-right">{memo.length}/200</p>
        </div>

        {/* 計算値プレビュー */}
        {(weight || bodyFat) && (() => {
          const w = weight ? parseFloat(weight) : null
          const f = bodyFat ? parseFloat(bodyFat) : null
          const bmi    = w && user.height ? calcBMI(w, user.height) : null
          const bmInfo = bmi ? bmiInfo(bmi) : null
          const bmr    = w && user.height && user.age && user.gender
            ? calcBMR(w, user.height, user.age, user.gender) : null
          const bAge   = f && bmi && user.age && user.gender
            ? calcBodyAge(f, bmi, user.age, user.gender) : null

          return (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-500 mb-1">計算値プレビュー</p>
              <div className="grid grid-cols-3 gap-2">
                {bmi && (
                  <div className="text-center">
                    <p className="text-xs text-gray-400">BMI</p>
                    <p className="font-bold text-green-700">{bmi}</p>
                    {bmInfo && <p className={`text-xs ${bmInfo.color}`}>{bmInfo.label}</p>}
                  </div>
                )}
                {bmr ? (
                  <div className="text-center">
                    <p className="text-xs text-gray-400">基礎代謝</p>
                    <p className="font-bold text-teal-700">{bmr}</p>
                    <p className="text-xs text-gray-400">kcal</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-xs text-gray-400">基礎代謝</p>
                    <p className="text-xs text-gray-300 mt-1">年齢・性別を設定</p>
                  </div>
                )}
                {bAge ? (
                  <div className="text-center">
                    <p className="text-xs text-gray-400">体年齢</p>
                    <p className={`font-bold ${user.age && bAge < user.age ? 'text-green-600' : bAge && user.age && bAge > user.age ? 'text-red-500' : 'text-rose-700'}`}>{bAge}歳</p>
                    {user.age && <p className={`text-xs ${bAge < user.age ? 'text-green-600' : bAge > user.age ? 'text-red-500' : 'text-gray-400'}`}>{bAge < user.age ? `${user.age - bAge}歳若い` : bAge > user.age ? `${bAge - user.age}歳上` : '同年齢'}</p>}
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-xs text-gray-400">体年齢</p>
                    <p className="text-xs text-gray-300 mt-1">年齢・性別を設定</p>
                  </div>
                )}
              </div>
            </div>
          )
        })()}

        <button
          type="submit"
          disabled={saving || saved}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? '保存中...' : existing ? '更新する' : '記録する'}
        </button>
      </form>
    </div>
  )
}

export default function LogPage() {
  return (
    <Suspense fallback={null}>
      <LogForm />
    </Suspense>
  )
}
