'use client';
import SideNav from '@/components/SideNav';
import Topnav from '@/components/TopNav';
import { useRoleNavigation } from '@/hooks/useRoleNavigation';

export default function OrdoLayout({ children }: { children: React.ReactNode }) {
  const { topNav, sideNav } = useRoleNavigation();

  return (
    <div>
      <Topnav 
        navigationItems={topNav}
        isAuthenticated={true}
        notifications={3}
        user={{
          name: 'Marie Dupont',
          email: 'marie.dupont@egmc.com'
        }}
      />
      <SideNav items={sideNav} />
      <main className="pl-0 md:pl-50 pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
