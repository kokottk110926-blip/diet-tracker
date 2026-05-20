'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/context'

export default function SettingsPage() {
  const { user, setUser, logout, loading: authLoading } = useUser()
  const router = useRouter()
  const [height, setHeight] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | ''>('')
  const [goalWeight, setGoalWeight] = useState('')
  const [goalBodyFat, setGoalBodyFat] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) router.replace('/')
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      setHeight(user.height != null ? String(user.height) : '')
      setAge(user.age != null ? String(user.age) : '')
      setGender(user.gender ?? '')
      setGoalWeight(user.goal_weight != null ? String(user.goal_weight) : '')
      setGoalBodyFat(user.goal_fat != null ? String(user.goal_fat) : '')
    }
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)

    const updates = {
      height:      height      ? parseFloat(height)      : null,
      age:         age         ? parseInt(age)            : null,
      gender:      gender      || null,
      goal_weight: goalWeight  ? parseFloat(goalWeight)  : null,
      goal_fat:    goalBodyFat ? parseFloat(goalBodyFat) : null,
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      setError(`保存に失敗しました: ${error.message}`)
    } else if (data) {
      setError('')
      setUser(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
    setSaving(false)
  }

  if (authLoading || !user) return null

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6">設定</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
          ログイン中のユーザー
        </p>
        <p className="text-lg font-semibold text-gray-800">{user.name}</p>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5 mb-4"
      >
        <h2 className="text-sm font-semibold text-gray-500">プロフィール・目標</h2>

        {saved && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm text-center">
            ✓ 保存しました！
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* 性別 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            性別 <span className="text-gray-400 font-normal text-xs">— 基礎代謝・体年齢の計算に使用</span>
          </label>
          <div className="flex gap-2">
            {(['male', 'female'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  gender === g
                    ? g === 'male'
                      ? 'bg-blue-600 text-white'
                      : 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {g === 'male' ? '男性' : '女性'}
              </button>
            ))}
          </div>
        </div>

        {/* 年齢 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            年齢 <span className="text-gray-400 font-normal text-xs">(歳)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="10"
              max="100"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="例: 30"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">歳</span>
          </div>
        </div>

        {/* 身長 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            身長 <span className="text-gray-400 font-normal text-xs">— BMI・基礎代謝の計算に使用 (cm)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="100"
              max="250"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="例: 170"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">cm</span>
          </div>
        </div>

        {/* 目標体重 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            目標体重 <span className="text-gray-400 font-normal text-xs">(kg)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="20"
              max="300"
              value={goalWeight}
              onChange={(e) => setGoalWeight(e.target.value)}
              placeholder="例: 60"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kg</span>
          </div>
        </div>

        {/* 目標体脂肪率 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            目標体脂肪率 <span className="text-gray-400 font-normal text-xs">(%)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="1"
              max="70"
              value={goalBodyFat}
              onChange={(e) => setGoalBodyFat(e.target.value)}
              placeholder="例: 18"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? '保存中...' : '保存する'}
        </button>
      </form>

      <button
        onClick={() => { logout(); router.push('/') }}
        className="w-full py-3 rounded-xl text-sm font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
      >
        ログアウト
      </button>
    </div>
  )
}
