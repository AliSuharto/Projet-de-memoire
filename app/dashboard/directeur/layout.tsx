'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Footer from '@/components/Footer';
import SideNav from '@/components/SideNav';
import Topnav, { NavigationItem } from '@/components/TopNav';
import { useRoleNavigation } from '@/hooks/useRoleNavigation';
import Image from 'next/image';  // ✅ Import correct pour Image
import Link from 'next/link';    // ✅ Import correct pour Link

export default function DirecteurLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { topNav, sideNav } = useRoleNavigation();

  return (
    <ProtectedRoute allowedRoles={['directeur', 'prmc']}>
      <div>
        <Topnav 
          navigationItems={topNav}
          isAuthenticated={true}
          notifications={5}
          user={{
            nom: user?.nom || 'Directeur',
            email: user?.email || 'directeur@commune.gmc',
            role: user?.role || 'Directeur'
          }}
        />
        
        <SideNav
          items={sideNav}
          
          /* ===================== */
          /* TOP SECTION */
          /* ===================== */
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
        
        <main className="pl-0 md:pl-64 pt-14 min-h-screen bg-gray-50">
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