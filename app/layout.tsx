import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import SideNav from '@/components/main/SideNav'
import Topnav from '@/components/main/TopNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GMC Application',
  description: 'Gestion de votre contenu',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>

       <Topnav />
        <SideNav />
        {/* Contenu principal avec marges responsives */}
        <main className="pl-0 md:pl-56 pt-16 min-h-screen">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}