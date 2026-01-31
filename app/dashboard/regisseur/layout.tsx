'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, FileText, HelpCircle } from 'lucide-react';

import { useAuth } from '@/components/auth/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SideNav from '@/components/SideNav';
import Topnav from '@/components/TopNav';
import { useRoleNavigation } from '@/hooks/useRoleNavigation';

interface RegisseurLayoutProps {
  children: React.ReactNode;
}

export default function RegisseurLayout({ children }: RegisseurLayoutProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { topNav, sideNav } = useRoleNavigation();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <ProtectedRoute allowedRoles={['regisseur']}>
      <div className="min-h-screen bg-gray-50">

        {/* ===================== */}
        {/* TOP NAV — Mobile only */}
        {/* ===================== */}
        <div className="block md:hidden fixed top-0 left-0 right-0 z-50">
          <Topnav
            navigationItems={topNav}
            isAuthenticated
            notifications={3}
            user={{
              nom: user?.nom ?? 'Regisseur',
              email: user?.email ?? 'regisseur@commune.mg',
            }}
          />
        </div>

        {/* ====================== */}
        {/* SIDE NAV — Desktop only */}
        {/* ====================== */}
        <aside className="hidden md:block fixed left-0 top-0 h-screen w-64 z-40">
  <SideNav
    items={sideNav}

    /* ===================== */
    /* TOP SECTION */
    /* ===================== */
    topSection={
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600
                        flex items-center justify-center text-white font-semibold text-base shadow-sm">
          {user?.nom?.charAt(0)?.toUpperCase() || 'R'}
        </div>

        {/* Infos utilisateur */}
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">
            {user?.nom || 'Regisseur'}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {user?.email || 'regisseur@commune.mg'}
          </div>
          <div className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full
                          bg-blue-50 text-blue-700 font-medium">
            {user?.role || 'REGISSEUR'}
          </div>
        </div>
      </div>
    }

    /* ===================== */
    /* BOTTOM SECTION */
    /* ===================== */
    bottomSection={
      <div className="space-y-1">

        <NavButton
          icon={<User size={16} />}
          label="Profil"
          onClick={() => handleNavigation('/dashboard/regisseur/profile')}
        />

        <NavButton
          icon={<FileText size={16} />}
          label="Note"
          onClick={() => handleNavigation('/dashboard/regisseur/note')}
        />

        <NavButton
          icon={<HelpCircle size={16} />}
          label="Aide"
          onClick={() => handleNavigation('/dashboard/regisseur/aide')}
        />

        <div className="border-t border-gray-200 my-2" />

        <NavButton
          icon={<LogOut size={16} />}
          label="Déconnexion"
          danger
          onClick={handleLogout}
        />
      </div>
    }
  />
</aside>


        {/* ===================== */}
        {/* MAIN CONTENT */}
        {/* ===================== */}
        <main className="min-h-screen pt-16 md:pt-0 md:ml-64">
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </main>

      </div>
    </ProtectedRoute>
  );
}

/* ===================== */
/* Reusable Nav Button */
/* ===================== */
interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

function NavButton({ icon, label, onClick, danger = false }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors
        ${
          danger
            ? 'text-red-600 hover:bg-red-50'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
    >
      {icon}
      {label}
    </button>
  );
}
