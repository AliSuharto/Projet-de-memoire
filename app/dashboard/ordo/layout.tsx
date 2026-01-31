'use client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SideNav from '@/components/SideNav';
import Topnav from '@/components/TopNav';
import { ReactNode } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRoleNavigation } from '@/hooks/useRoleNavigation';

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
  <SideNav items={sideNav} />
  </ProtectedRoute>
  )
}
