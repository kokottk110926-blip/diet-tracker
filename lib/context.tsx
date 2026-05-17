'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from './types'

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
  loading: boolean
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
  loading: true,
})

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('diet-tracker-user')
      if (stored) setUserState(JSON.parse(stored))
    } catch {}
    setLoading(false)
  }, [])

  const setUser = (u: User | null) => {
    setUserState(u)
    if (u) localStorage.setItem('diet-tracker-user', JSON.stringify(u))
    else localStorage.removeItem('diet-tracker-user')
  }

  return (
    <UserContext.Provider value={{ user, setUser, logout: () => setUser(null), loading }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
