'use client';

import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardHeader from '@/components/layout/DashboardHeader';
import Topnav, { type NavigationItem as TopNavItem } from '@/components/TopNav';
import SideNav from '@/components/SideNav';
import {
  LayoutDashboard,
  Building2,
  Users,
  Store,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  const navigationItems: TopNavItem[] = [
    {
      href: '/dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
    },
    {
      href: '/dashboard/prmc',
      label: 'PRMC',
      icon: BarChart3,
      subItems: [
        { href: '/dashboard/prmc/marchands', label: 'Marchands' },
        { href: '/dashboard/prmc/marches', label: 'Marchés' },
        { href: '/dashboard/prmc/users', label: 'Utilisateurs' },
      ],
    },
    {
      href: '/dashboard/ordo',
      label: 'Ordonnateur',
      icon: Building2,
    },
    {
      href: '/dashboard/regisseur',
      label: 'Régisseur',
      icon: Store,
    },
    {
      href: '/dashboard/perp',
      label: 'PERP',
      icon: Users,
    },
    {
      href: '/dashboard/ordo/configuration',
      label: 'Configuration',
      icon: Settings,
    },
  ];

  const sideNavItems = navigationItems.map(item => ({
    href: item.href,
    label: item.label,
    icon: item.icon as LucideIcon,
    subItems: item.subItems?.map(si => ({ href: si.href, label: si.label })),
  }));

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        
        <Topnav 
          navigationItems={navigationItems} 
          isAuthenticated={!!user} 
          notifications={3}
          user={user ? {
            name: `${user.prenom} ${user.nom}`,
            email: user.email
          } : undefined}
        />

        <SideNav items={sideNavItems} />

        <main className="pt-16 md:ml-48">
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
