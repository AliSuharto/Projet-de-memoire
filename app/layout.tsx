import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import SideNav from '@/components/SideNav'
import Topnav from '@/components/TopNav'

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

        {/* Contenu principal avec marges responsives */}
        
          <div className="">
            {children}
          </div>
        
      </body>
    </html>
  )
}