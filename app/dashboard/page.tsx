'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

export default function DashboardRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    // Redirection basée sur le rôle
    const roleRoutes: { [key: string]: string } = {
      'ordonnateur': '/dashboard/ordonnateur',
      'directeur': '/dashboard/directeur', 
      'regisseur': '/dashboard/regisseur',
      'regisseur_principal': '/dashboard/regisseur-principal',
      'percepteur': '/dashboard/percepteur',
      'createur_marche': '/dashboard/createur-marche',
      // Compatibilité avec les anciens rôles
      'ordo': '/dashboard/ordonnateur',
      'prmc': '/dashboard/directeur',
      'perp': '/dashboard/percepteur',
    };

    const dashboardRoute = roleRoutes[user.role.toLowerCase()] || '/dashboard/ordonnateur';
    router.push(dashboardRoute);
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Redirection...
        </h2>
        <p className="text-gray-600">
          Redirection vers votre dashboard
        </p>
      </div>
    </div>
  );
}