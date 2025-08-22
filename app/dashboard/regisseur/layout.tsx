// app/(admin)/layout.tsx
'use client';

import { Shield, UserCog, Database, Home, Plus, Settings, HelpCircle } from 'lucide-react';
import SideNav from '@/components/SideNav';
import Topnav from '@/components/TopNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminNavItems = [
    { href: '/admin/users', icon: UserCog, label: 'Marchee' },
    { href: '/admin/roles', icon: Shield, label: 'Marchands' },
    { href: '/admin/logs', icon: Database, label: 'Marchands endettee' },
  ];

   const navigationItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/create', label: 'Créer', icon: Plus },
    { href: '/settings', label: 'Paramètres', icon: Settings },
    { href: '/help', label: 'Aide', icon: HelpCircle },
  ];

  return (
    <div>
      <Topnav 
        navigationItems={navigationItems}
        isAuthenticated={true}
        notificationsCount={3}
        user={{
          name: "Marie Dupont",
          email: "marie@example.com"
        }}
        logo={{
          src: "/logogo.png",
          alt: "logo"
        }}
      />
      <SideNav items={adminNavItems} />
      <main className="pl-0 md:pl-40 pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
