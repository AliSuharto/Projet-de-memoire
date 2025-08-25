'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { canAccessRoute, hasPermission } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  allowedRoles?: string[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  allowedRoles,
  redirectTo = '/login'
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push(redirectTo);
      return;
    }

    // Vérifier les rôles autorisés
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.push('/unauthorized');
      return;
    }

    // Vérifier les permissions requises
    if (requiredPermission && !hasPermission(user, requiredPermission)) {
      router.push('/unauthorized');
      return;
    }

    // Vérifier l'accès à la route
    const currentPath = window.location.pathname;
    if (!canAccessRoute(user, currentPath)) {
      router.push('/unauthorized');
      return;
    }
  }, [user, loading, router, requiredPermission, allowedRoles, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
