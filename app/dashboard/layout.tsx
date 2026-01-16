// app/dashboard/layout.tsx (Layout principal pour tous les dashboards)
'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500); // Durée courte pour la transition
    return () => clearTimeout(timer);
  }, [pathname]);

return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar ou navigation commune à tous les dashboards */}
      <div className="flex">
        {/* Sidebar (optionnel) */}
        
       

        {/* Contenu principal */}
        {/* {loading && (
       <div className="fixed inset-0 flex items-center justify-center  z-50">
          <div className="w-12 h-12 border-1 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )} */}
        <main className="flex-1 -mt-5 min-h-screen">
          {children}
        </main>
      </div>
     
    </div>
  );
}