'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/context'
import { User } from '@/lib/types'

export default function LoginPage() {
  const [name, setName] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setUser, user, loading: authLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && user) router.replace('/dashboard')
  }, [user, authLoading, router])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const { data } = await supabase.from('users').select('*').order('name')
    setUsers(data || [])
  }

  const handleLogin = async (nameInput: string) => {
    const trimmed = nameInput.trim()
    if (!trimmed) return

    setLoading(true)
    setError('')

    let { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('name', trimmed)
      .maybeSingle()

    if (!existingUser) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({ name: trimmed })
        .select()
        .single()

      if (createError || !newUser) {
        setError('ユーザーの作成に失敗しました。Supabaseの設定を確認してください。')
        setLoading(false)
        return
      }
      existingUser = newUser
    }

    setUser(existingUser)
    router.push('/dashboard')
    setLoading(false)
  }

  if (authLoading) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⚖️</div>
          <h1 className="text-2xl font-bold text-gray-800">ダイエットトラッカー</h1>
          <p className="text-gray-500 mt-1 text-sm">体重・体脂肪率を記録して目標達成！</p>
        </div>

        {users.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              ユーザーを選択
            </p>
            <div className="flex flex-wrap gap-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleLogin(u.name)}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  {u.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={users.length > 0 ? 'border-t pt-6' : ''}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            {users.length > 0 ? '新しいユーザーで始める' : '名前を入力してスタート'}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin(name)}
              placeholder="あなたの名前"
              maxLength={20}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
            />
            <button
              onClick={() => handleLogin(name)}
              disabled={loading || !name.trim()}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '...' : 'スタート'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      </div>
    </div>
  )
}
