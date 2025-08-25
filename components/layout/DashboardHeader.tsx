'use client';

import React from 'react';
import { Bell, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, subtitle }) => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'danger';
      case 'PRMC': return 'success';
      case 'Ordonnateur': return 'warning';
      case 'Régisseur': return 'info';
      case 'PERP': return 'default';
      default: return 'default';
    }
  };

  if (!user) return null;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Titre */}
          <div className="flex-1">
            {title && (
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-600">{subtitle}</p>
                )}
              </div>
            )}
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="h-5 w-5" />
              {/* Badge de notification */}
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Informations utilisateur */}
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
              </div>

              {/* Informations */}
              <div className="hidden sm:block">
                <div className="flex items-center space-x-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user.prenom} {user.nom}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <StatusBadge 
                    status={user.role} 
                    variant={getRoleColor(user.role) as any}
                    size="sm"
                  />
                </div>
              </div>

              {/* Menu utilisateur */}
              <div className="relative">
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                    <Settings className="h-4 w-4" />
                  </button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    icon={LogOut}
                    className="text-gray-600 hover:text-red-600 hover:border-red-300"
                  >
                    <span className="hidden sm:inline">Déconnexion</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informations de commune (si applicable) */}
      {user.commune && (
        <div className="px-4 sm:px-6 lg:px-8 py-2 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Commune :</span>
              <span className="text-sm font-medium text-gray-900">{user.commune}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                Dernière connexion : {new Date().toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default DashboardHeader;
