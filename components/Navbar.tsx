'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/lib/context'

const links = [
  { href: '/dashboard', label: 'ホーム' },
  { href: '/log', label: '記録' },
  { href: '/history', label: '履歴' },
  { href: '/settings', label: '設定' },
]

export default function Navbar() {
  const { user } = useUser()
  const pathname = usePathname()

  if (!user) return null

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link
            href="/dashboard"
            className="font-bold text-blue-600 text-base flex items-center gap-1.5"
          >
            <span>⚖️</span>
            <span className="hidden sm:inline">ダイエットトラッカー</span>
          </Link>

          <div className="flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
