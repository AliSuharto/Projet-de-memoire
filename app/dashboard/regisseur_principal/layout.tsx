'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Footer from '@/components/Footer';
import SideNav from '@/components/SideNav';
import Topnav from '@/components/TopNav';
import { useRoleNavigation } from '@/hooks/useRoleNavigation';

export default function DirecteurLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { topNav, sideNav } = useRoleNavigation();

  return (
    <ProtectedRoute allowedRoles={['regisseur_principal', 'prmc']}>
      <div>
        <Topnav 
          navigationItems={topNav}
          isAuthenticated={true}
          notifications={5}
          user={{
            name: user?.nom || 'Directeur',
            email: user?.email || 'directeur@commune.gmc'
          }}
        />
        
        <SideNav items={sideNav} />
        <main className="pl-0 md:pl-48 pt-0 min-h-screen bg-gray-50">
          <div className="p-6">
            {children}
          </div>
        </main>
         {/* Footer */}
      <Footer />
      </div>
    </ProtectedRoute>
  );
}
