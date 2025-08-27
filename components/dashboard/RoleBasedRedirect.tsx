'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { getRoleRedirectPath } from '@/app/Utils/roleRedirection';


export default function RoleBasedRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      const redirectPath = getRoleRedirectPath(user.role);
      console.log(`Redirection vers: ${redirectPath} pour le rôle: ${user.role}`);
      router.push(redirectPath);
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirection vers votre espace...</p>
      </div>
    </div>
  );
}