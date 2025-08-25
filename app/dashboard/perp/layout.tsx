'use client';
import SideNav from '@/components/SideNav';
import Topnav from '@/components/TopNav';
import { useRoleNavigation } from '@/hooks/useRoleNavigation';

export default function PERPLayout({ children }: { children: React.ReactNode }) {
  const { topNav, sideNav } = useRoleNavigation();

  return (
    <div>
      <Topnav 
        navigationItems={topNav}
        isAuthenticated={true}
        notifications={3}
        user={{
          name: "Marie Dupont",
          email: "marie@example.com"
        }}
        logo={{
          src: "/logogo.png",
          alt: "e-GMC Logo"
        }}
      />
      <SideNav items={sideNav} />
      <main className="pl-0 md:pl-48 pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
