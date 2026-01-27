'use client';
import React, { useState, useEffect } from 'react';
import { Users, MapPin, Building2, Store, Phone, Mail, Calendar, UserCheck, Search, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import API_BASE_URL from '@/services/APIbaseUrl';

interface MarcheeR {
  id: number;
  nom: string;
}

interface HallR {
  id: number;
  nom: string;
}

interface ZoneR {
  id: number;
  nom: string;
}

interface UserResponseRegisseur {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: 'REGISSEUR' | 'PERCEPTEUR';
  isActive: boolean;
  telephone?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt?: string;
  marchee?: MarcheeR[];
  halls?: HallR[];
  zones?: ZoneR[];
}

const RegisseurPercepteurPage: React.FC = () => {
  const [users, setUsers] = useState<UserResponseRegisseur[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'REGISSEUR' | 'PERCEPTEUR'>('ALL');
  const [expandedUsers, setExpandedUsers] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/users/regisseurs-percepteurs`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data: UserResponseRegisseur[] = await response.json();
      setUsers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      console.error('Erreur lors du chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: 'REGISSEUR' | 'PERCEPTEUR'): string => {
    return role === 'REGISSEUR' 
      ? 'bg-blue-100 text-blue-800 border-blue-200' 
      : 'bg-green-100 text-green-800 border-green-200';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const toggleUserExpansion = (userId: number): void => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const isUserExpanded = (userId: number): boolean => {
    return expandedUsers.has(userId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Erreur de chargement</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={fetchUsers}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-800">Régisseurs & Percepteurs</h1>
          </div>
          <p className="text-slate-600 ml-13">Gestion des responsables des marchés, halls et zones</p>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom, prénom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as 'ALL' | 'REGISSEUR' | 'PERCEPTEUR')}
                className="pl-11 pr-8 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer min-w-[200px]"
              >
                <option value="ALL">Tous les rôles</option>
                <option value="REGISSEUR">Régisseurs</option>
                <option value="PERCEPTEUR">Percepteurs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="grid gap-6">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                {/* En-tête de la carte */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {user.prenom.charAt(0)}{user.nom.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">
                        {user.prenom} {user.nom}
                      </h2>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                        {user.isActive && (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                            <UserCheck className="w-4 h-4" />
                            Actif
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations de contact */}
                <div className="grid md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-700">{user.email}</span>
                  </div>
                  {user.telephone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-700">{user.telephone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-600 text-sm">Créé le {formatDate(user.createdAt)}</span>
                  </div>
                  {user.createdByName && (
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-600 text-sm">Ajouter par {user.createdByName}</span>
                    </div>
                  )}
                </div>

                {/* Responsabilités */}
                <div>
                  <button
                    onClick={() => toggleUserExpansion(user.id)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 mb-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {isUserExpanded(user.id) ? (
                          <ChevronDown className="w-5 h-5 text-slate-600" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-600" />
                        )}
                        <span className="font-semibold text-slate-800">Responsabilités</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <Store className="w-3 h-3" />
                          {user.marchee?.length || 0}
                        </span>
                        <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {user.halls?.length || 0}
                        </span>
                        <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {user.zones?.length || 0}
                        </span>
                      </div>
                    </div>
                  </button>

                  {isUserExpanded(user.id) && (
                    <div className="grid md:grid-cols-3 gap-6 mt-4">
                      {/* Marchés */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Store className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-slate-800">Marchés</h3>
                          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
                            {user.marchee?.length || 0}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {user.marchee && user.marchee.length > 0 ? (
                            user.marchee.map((marche) => (
                              <div key={marche.id} className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-900">
                                {marche.nom}
                              </div>
                            ))
                          ) : (
                            <p className="text-slate-400 text-sm italic">Aucun marché assigné</p>
                          )}
                        </div>
                      </div>

                      {/* Halls */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Building2 className="w-5 h-5 text-purple-600" />
                          <h3 className="font-semibold text-slate-800">Halls</h3>
                          <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-0.5 rounded-full">
                            {user.halls?.length || 0}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {user.halls && user.halls.length > 0 ? (
                            user.halls.map((hall) => (
                              <div key={hall.id} className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 text-sm text-purple-900">
                                {hall.nom}
                              </div>
                            ))
                          ) : (
                            <p className="text-slate-400 text-sm italic">Aucun hall assigné</p>
                          )}
                        </div>
                      </div>

                      {/* Zones */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="w-5 h-5 text-orange-600" />
                          <h3 className="font-semibold text-slate-800">Zones</h3>
                          <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-0.5 rounded-full">
                            {user.zones?.length || 0}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {user.zones && user.zones.length > 0 ? (
                            user.zones.map((zone) => (
                              <div key={zone.id} className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-sm text-orange-900">
                                {zone.nom}
                              </div>
                            ))
                          ) : (
                            <p className="text-slate-400 text-sm italic">Aucune zone assignée</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">Aucun résultat</h3>
            <p className="text-slate-500">Aucun utilisateur ne correspond à votre recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisseurPercepteurPage;