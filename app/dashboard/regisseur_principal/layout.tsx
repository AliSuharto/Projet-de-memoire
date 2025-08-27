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
  
    <ProtectedRoute allowedRoles={['regisseur_principal']}>
      <Topnav 
          navigationItems={topNav}
          isAuthenticated={true}
          notifications={3}
          user={{
            name: user?.nom || 'Regisseur Principal',
            email: user?.email || 'regisseurprincipal@gmc.com'
          }}
        />
   <div className='pl-0 md:pl-48 pt-0 min-h-screen'>
  {children}
  </div>
  <SideNav items={sideNav} />
  </ProtectedRoute>
  )
}
