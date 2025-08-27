// app/dashboard/layout.tsx (Layout principal pour tous les dashboards)
import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar ou navigation commune à tous les dashboards */}
      <div className="flex">
        {/* Sidebar (optionnel) */}
        
       

        {/* Contenu principal */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}