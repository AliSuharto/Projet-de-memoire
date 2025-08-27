'use client';
import { useAuth } from '@/components/auth/AuthProvider';
import { User, Mail, Phone, MapPin, LogOut } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function UserProfileCard() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getRoleBadgeColor = (role: string): string => {
    const colors: Record<string, string> = {
      'ordonnateur': 'bg-blue-100 text-blue-800',
      'directeur': 'bg-purple-100 text-purple-800',
      'regisseur': 'bg-green-100 text-green-800',
      'regisseur_principal': 'bg-red-100 text-red-800',
      'percepteur': 'bg-yellow-100 text-yellow-800',
      'createur_marche': 'bg-indigo-100 text-indigo-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleDisplayName = (role: string): string => {
    const displayNames: Record<string, string> = {
      'ordonnateur': 'Ordonnateur',
      'directeur': 'Directeur',
      'regisseur': 'Régisseur',
      'regisseur_principal': 'Régisseur Principal',
      'percepteur': 'Percepteur',
      'createur_marche': 'Créateur de Marché',
    };
    return displayNames[role] || role;
  };

  const handleLogout = () => {
    logout();
    // Si vous avez une redirection spécifique après déconnexion
    window.location.href = '/login';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {user.avatar ? (
              <img 
                className="h-16 w-16 rounded-full object-cover" 
                src={user.avatar} 
                alt={`${user.nom} ${user.prenom}`}
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {user.prenom} {user.nom}
            </h2>
            
            <div className="flex items-center mt-1 text-gray-600">
              <Mail className="h-4 w-4 mr-1" />
              <span className="text-sm">{user.email}</span>
            </div>
            
            <div className="mt-2">
              <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                {getRoleDisplayName(user.role)}
              </span>
            </div>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="flex items-center space-x-1"
        >
          <LogOut className="h-4 w-4" />
          <span>Déconnexion</span>
        </Button>
      </div>
      
      {/* Informations supplémentaires */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {user.telephone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              <span>{user.telephone}</span>
            </div>
          )}
          
          
        </div>
      </div>
    </div>
  );
}