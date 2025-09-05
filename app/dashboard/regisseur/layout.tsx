'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SideNav from '@/components/SideNav';
import Topnav from '@/components/TopNav';
import { useRoleNavigation } from '@/hooks/useRoleNavigation';

export default function RegisseurLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { topNav, sideNav } = useRoleNavigation();

  return (
    <ProtectedRoute allowedRoles={['regisseur']}>
      <div>
        <Topnav 
          navigationItems={topNav}
          isAuthenticated={true}
          notifications={3}
          user={{
            name: user?.nom || 'Regisseur',
            email: user?.email || 'regisseur@commune.mg'
          }}
        />
        <SideNav items={sideNav} />
        <main className="pl-0 md:pl-48 min-h-screen bg-gray-50">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
