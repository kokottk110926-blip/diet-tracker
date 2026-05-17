import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { UserProvider } from '@/lib/context'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ダイエットトラッカー',
  description: '体重・体脂肪率を記録して目標達成！',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <UserProvider>
          <Navbar />
          <main>{children}</main>
        </UserProvider>
      </body>
    </html>
  )
}
