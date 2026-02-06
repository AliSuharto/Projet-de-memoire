'use client';
import { useAuth } from '@/components/auth/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Footer from '@/components/Footer';
import SideNav from '@/components/SideNav';
import Topnav from '@/components/TopNav';
import { useRoleNavigation } from '@/hooks/useRoleNavigation';
import API_BASE_URL from '@/services/APIbaseUrl';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function DirecteurLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { topNav, sideNav } = useRoleNavigation();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchValidationsEnAttente = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/sessions/validationEnAttente`);
        
        if (response.ok) {
          const data = await response.json();
          // Compter le nombre d'éléments dans le tableau
          const count = Array.isArray(data) ? data.length : 0;
          setNotificationCount(count);
        } else {
          console.error('Erreur lors de la récupération des validations en attente');
        }
      } catch (error) {
        console.error('Erreur de connexion à l\'API:', error);
      }
    };

    // Récupérer les notifications au chargement
    fetchValidationsEnAttente();

    // Optionnel: Rafraîchir les notifications toutes les 30 secondes
    const interval = setInterval(fetchValidationsEnAttente, 30000);

    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(interval);
  }, []);

  return (
    <ProtectedRoute allowedRoles={['regisseur_principal', 'prmc']}>
      <div>
        <Topnav 
          navigationItems={topNav}
          isAuthenticated={true}
          notifications={notificationCount}
          user={{
            name: user?.nom || 'Directeur',
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
        <main className="pl-0 md:pl-64  pt-16 min-h-screen bg-gray-50">
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