'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { DEFAULT_DASHBOARD } from '@/lib/auth';
import Button from '@/components/ui/Button';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    if (user) {
      const dashboardRoute = DEFAULT_DASHBOARD[user.role];
      router.push(dashboardRoute);
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Icône */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <ShieldX className="h-8 w-8 text-red-600" />
          </div>
          
          {/* Titre */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Accès non autorisé
          </h1>
          
          {/* Message */}
          <p className="text-gray-600 mb-6">
            Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
            {user && (
              <>
                <br />
                <span className="text-sm mt-2 block">
                  Votre rôle actuel : <strong>{user.role}</strong>
                </span>
              </>
            )}
          </p>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handleGoBack}
              icon={ArrowLeft}
              className="flex-1"
            >
              Retour
            </Button>
            
            <Button
              onClick={handleGoHome}
              icon={Home}
              className="flex-1"
            >
              Accueil
            </Button>
          </div>
          
          {/* Contact */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Si vous pensez q&apos;uil s&apos;agit d&apos;une erreur, contactez votre administrateur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}



