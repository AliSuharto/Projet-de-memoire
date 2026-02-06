'use client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SideNav from '@/components/SideNav';
import Topnav from '@/components/TopNav';
import { ReactNode } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRoleNavigation } from '@/hooks/useRoleNavigation';
import Link from 'next/link';
import Image from 'next/image';

export default function OrdoLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
    const { topNav, sideNav } = useRoleNavigation();
  
  return( 
  
    <ProtectedRoute allowedRoles={['ordonnateur']}>
      <Topnav 
          navigationItems={topNav}
          isAuthenticated={true}
          notifications={3}
          user={{
            name: user?.nom || 'Ordonnateur',
            email: user?.email || 'ordonnateur@commune.mg'
          }}
        />
   <div className='pl-0 md:pl-64 pt-15 min-h-screen'>
    <div className="p-6">
  {children}
    </div>
  </div>
  <SideNav items={sideNav} 
  topSection={
            <Link href="/" className=" flex items-center space-x-2 group hover:bg-gray-50 rounded-lg p-2 transition-colors">
              <div className="relative">
                <Image
                  src="/logogo.png"
                  alt="Logo de la plateforme e-GMC"
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-lg"
                />
              </div>
              <span className="hidden sm:flex items-center font-bold text-xl">
                <span className="text-gray-800">e-</span>
                <span className="text-blue-600 ml-0">GMC</span>
              </span>
            </Link>
          }
        />
  </ProtectedRoute>
  )
}
