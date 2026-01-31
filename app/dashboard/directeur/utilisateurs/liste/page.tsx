'use client';
import React, { useState, useEffect } from 'react';
import { Search, Edit2, Eye, X, Save, Loader2, MapPin, Building2, Layers } from 'lucide-react';


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

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: string;
  isActive: boolean;
  createdByName?: string;
  createdAt: string;
  updatedAt?: string;
  marchee?: MarcheeR[];
  halls?: HallR[];
  zones?: ZoneR[];
}

interface Location {
  id: number;
  nom: string;
}

interface UpdateUserData {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  role?: string;
  isActive?: boolean;
  marcheeIds?: number[];
  zoneIds?: number[];
  hallIds?: number[];
}

const API_BASE_URL = 'http://localhost:8080/api'; // Adaptez selon votre configuration

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<UpdateUserData>({});
  const [saving, setSaving] = useState(false);

  // Données de référence (toutes les options disponibles)
  const [allMarchees, setAllMarchees] = useState<Location[]>([]);
  const [allZones, setAllZones] = useState<Location[]>([]);
  const [allHalls, setAllHalls] = useState<Location[]>([]);

  const roles = ['DIRECTEUR', 'ORDONNATEUR', 'PERCEPTEUR', 'CONTROLLEUR', 'AGENT'];

  // Charger les utilisateurs
  useEffect(() => {
    fetchUsers();
    fetchLocations();
  }, []);

  // Filtrer les utilisateurs
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.nom.toLowerCase().includes(term) ||
        user.prenom.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.telephone && user.telephone.toLowerCase().includes(term))
      );
    }

    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(user =>
        statusFilter === 'ACTIVE' ? user.isActive : !user.isActive
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, statusFilter, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/percepteur`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Erreur lors du chargement des utilisateurs');
      
      const data = await response.json();
      console.log('Utilisateurs reçus:', data);
      
      // Adapter selon la structure de votre réponse (data.data ou data directement)
      const usersData = Array.isArray(data) ? data : (data.data || []);
      setUsers(usersData);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      alert('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [marcheesRes, zonesRes, hallsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/marchees`, { headers }),
        fetch(`${API_BASE_URL}/public/zones/ok`, { headers }),
        fetch(`${API_BASE_URL}/public/salles/alls`, { headers })
      ]);

      const [marcheesData, zonesData, hallsData] = await Promise.all([
        marcheesRes.json(),
        zonesRes.json(),
        hallsRes.json()
      ]);

      console.log('Données de localisation:', { marcheesData, zonesData, hallsData });

      // Gérer différents formats de réponse API
      const marcheesArray = Array.isArray(marcheesData) ? marcheesData : 
                           (Array.isArray(marcheesData?.data) ? marcheesData.data : []);
      const zonesArray = Array.isArray(zonesData) ? zonesData : 
                        (Array.isArray(zonesData?.data) ? zonesData.data : []);
      const hallsArray = Array.isArray(hallsData) ? hallsData : 
                        (Array.isArray(hallsData?.data) ? hallsData.data : []);

      setAllMarchees(marcheesArray);
      setAllZones(zonesArray);
      setAllHalls(hallsArray);
    } catch (error) {
      console.error('Erreur lors du chargement des localisations:', error);
      setAllMarchees([]);
      setAllZones([]);
      setAllHalls([]);
    }
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    
    // Initialiser le formulaire avec les données actuelles de l'utilisateur
    setEditFormData({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone || '',
      role: user.role,
      isActive: user.isActive,
      marcheeIds: user.marchee?.map(m => m.id) || [],
      zoneIds: user.zones?.map(z => z.id) || [],
      hallIds: user.halls?.map(h => h.id) || []
    });
    
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        alert('Utilisateur mis à jour avec succès');
        await fetchUsers(); // Recharger la liste
        setIsEditModalOpen(false);
        setSelectedUser(null);
        setEditFormData({});
      } else {
        const error = await response.json();
        alert(error.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour de l\'utilisateur');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      DIRECTEUR: 'bg-purple-100 text-purple-800',
      ORDONNATEUR: 'bg-blue-100 text-blue-800',
      PERCEPTEUR: 'bg-green-100 text-green-800',
      CONTROLLEUR: 'bg-orange-100 text-orange-800',
      AGENT: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  // Vérifier si un utilisateur est affecté à des localisations
  const hasAssignments = (user: User) => {
    return (user.marchee && user.marchee.length > 0) ||
           (user.zones && user.zones.length > 0) ||
           (user.halls && user.halls.length > 0);
  };

  // Toggle selection pour les checkboxes
  const toggleSelection = (
    type: 'marcheeIds' | 'zoneIds' | 'hallIds',
    id: number,
    checked: boolean
  ) => {
    const currentIds = editFormData[type] || [];
    setEditFormData({
      ...editFormData,
      [type]: checked
        ? [...currentIds, id]
        : currentIds.filter(existingId => existingId !== id)
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8 pt-20 md:pt-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Gestion des Utilisateurs
          </h1>
          <p className="text-gray-600">
            Visualisez et gérez les affectations des utilisateurs aux marchés, zones et halls
          </p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Layers className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Utilisateurs Actifs</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.isActive).length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Layers className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Marchés Disponibles</p>
                <p className="text-2xl font-bold text-purple-600">{allMarchees.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Zones & Halls</p>
                <p className="text-2xl font-bold text-orange-600">
                  {allZones.length + allHalls.length}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, prénom, email ou téléphone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">Tous les rôles</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="ACTIVE">Actifs</option>
                <option value="INACTIVE">Inactifs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        {loading ? (
          <div className="flex justify-center items-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Chargement des utilisateurs...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Affectations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                              {user.prenom?.[0]}{user.nom?.[0]}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.prenom} {user.nom}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.telephone || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {user.marchee && user.marchee.length > 0 && (
                            <div className="flex items-center mb-1">
                              <Building2 className="w-4 h-4 text-purple-600 mr-1" />
                              <span className="text-gray-900 font-medium">
                                {user.marchee.length} marché{user.marchee.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                          {user.zones && user.zones.length > 0 && (
                            <div className="flex items-center mb-1">
                              <MapPin className="w-4 h-4 text-green-600 mr-1" />
                              <span className="text-gray-900 font-medium">
                                {user.zones.length} zone{user.zones.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                          {user.halls && user.halls.length > 0 && (
                            <div className="flex items-center">
                              <Layers className="w-4 h-4 text-blue-600 mr-1" />
                              <span className="text-gray-900 font-medium">
                                {user.halls.length} hall{user.halls.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                          {!hasAssignments(user) && (
                            <span className="text-gray-400 italic">Aucune affectation</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleView(user)}
                          className="text-blue-600 hover:text-blue-900 mr-3 inline-flex items-center"
                          title="Voir les détails"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-green-600 hover:text-green-900 inline-flex items-center"
                          title="Modifier / Affecter"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Aucun utilisateur trouvé</p>
                <p className="text-gray-400 text-sm mt-2">
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            )}
          </div>
        )}

        {/* Modal de visualisation */}
{isViewModalOpen && selectedUser && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex modal-overlay items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
      {/* En-tête fixe */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold text-gray-900">Détails de l'utilisateur</h2>
          <button
            onClick={() => setIsViewModalOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Profil */}
          <div className="flex items-center space-x-4 pb-6 border-b">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
              {selectedUser.prenom?.[0]}{selectedUser.nom?.[0]}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedUser.prenom} {selectedUser.nom}
              </h3>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-1 ${getRoleBadgeColor(selectedUser.role)}`}>
                {selectedUser.role}
              </span>
            </div>
          </div>

          {/* Informations de base */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900 mt-1">{selectedUser.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Téléphone</label>
              <p className="text-gray-900 mt-1">{selectedUser.telephone || 'Non renseigné'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Statut</label>
              <p className="mt-1">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  selectedUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {selectedUser.isActive ? 'Actif' : 'Inactif'}
                </span>
              </p>
            </div>
            {selectedUser.createdByName && (
              <div>
                <label className="text-sm font-medium text-gray-500">Créé par</label>
                <p className="text-gray-900 mt-1">{selectedUser.createdByName}</p>
              </div>
            )}
          </div>

          {/* Affectations */}
          <div className="space-y-4 pt-6 border-t">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Affectations</h4>

            {/* Marchés */}
            {selectedUser.marchee && selectedUser.marchee.length > 0 ? (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Building2 className="w-4 h-4 mr-2 text-purple-600" />
                  Marchés affectés ({selectedUser.marchee.length})
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedUser.marchee.map(marchee => (
                    <span key={marchee.id} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      {marchee.nom}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 flex items-center">
                <Building2 className="w-4 h-4 mr-2" />
                Aucun marché affecté
              </div>
            )}

            {/* Zones */}
            {selectedUser.zones && selectedUser.zones.length > 0 ? (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-green-600" />
                  Zones affectées ({selectedUser.zones.length})
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedUser.zones.map(zone => (
                    <span key={zone.id} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {zone.nom}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Aucune zone affectée
              </div>
            )}

            {/* Halls */}
            {selectedUser.halls && selectedUser.halls.length > 0 ? (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Layers className="w-4 h-4 mr-2 text-blue-600" />
                  Halls affectés ({selectedUser.halls.length})
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedUser.halls.map(hall => (
                    <span key={hall.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {hall.nom}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 flex items-center">
                <Layers className="w-4 h-4 mr-2" />
                Aucun hall affecté
              </div>
            )}
          </div>

          {/* Métadonnées */}
          <div className="pt-6 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-gray-500">Date de création</label>
                <p className="text-gray-900 mt-1">
                  {new Date(selectedUser.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              {selectedUser.updatedAt && (
                <div>
                  <label className="text-gray-500">Dernière modification</label>
                  <p className="text-gray-900 mt-1">
                    {new Date(selectedUser.updatedAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer fixe */}
      <div className="p-6 border-t border-gray-200 flex-shrink-0">
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setIsViewModalOpen(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Fermer
          </button>
          <button
            onClick={() => {
              setIsViewModalOpen(false);
              handleEdit(selectedUser);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Edit2 className="w-4 h-4" />
            <span>Modifier</span>
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* Modal d'édition et d'affectation */}
{isEditModalOpen && selectedUser && (
  <div className="fixed inset-0 bg-black bg-opacity-50 modal-overlay flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
      {/* En-tête fixe */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Modifier et affecter l'utilisateur
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Modifiez les informations et gérez les affectations
            </p>
          </div>
          <button
            onClick={() => setIsEditModalOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Section: Informations personnelles */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informations personnelles
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.nom || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nom de famille"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.prenom || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, prenom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Prénom"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@exemple.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={editFormData.telephone || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, telephone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+261 XX XX XXX XX"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle <span className="text-red-500">*</span>
                </label>
                <select
                  value={editFormData.role || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editFormData.isActive || false}
                    onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Compte actif
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Section: Affectations */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-blue-600" />
              Affectations géographiques
            </h3>

            {/* Marchés */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4 inline mr-1 text-purple-600" />
                Marchés 
                <span className="text-gray-500 ml-2">
                  ({editFormData.marcheeIds?.length || 0} sélectionné{(editFormData.marcheeIds?.length || 0) > 1 ? 's' : ''})
                </span>
              </label>
              {allMarchees.length === 0 ? (
                <div className="border border-gray-300 rounded-lg p-4 text-center text-gray-500 bg-white">
                  Aucun marché disponible
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-white">
                  <div className="space-y-2">
                    {allMarchees.map(marchee => {
                      const isSelected = editFormData.marcheeIds?.includes(marchee.id) || false;
                      const wasOriginallyAssigned = selectedUser.marchee?.some(m => m.id === marchee.id);
                      
                      return (
                        <label 
                          key={marchee.id} 
                          className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                            isSelected ? 'bg-purple-50 border border-purple-200' : 'hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => toggleSelection('marcheeIds', marchee.id, e.target.checked)}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                          />
                          <span className={`text-sm flex-1 ${isSelected ? 'font-medium text-purple-900' : 'text-gray-700'}`}>
                            {marchee.nom}
                          </span>
                          {wasOriginallyAssigned && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                              Déjà affecté
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Zones */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1 text-green-600" />
                Zones
                <span className="text-gray-500 ml-2">
                  ({editFormData.zoneIds?.length || 0} sélectionnée{(editFormData.zoneIds?.length || 0) > 1 ? 's' : ''})
                </span>
              </label>
              {allZones.length === 0 ? (
                <div className="border border-gray-300 rounded-lg p-4 text-center text-gray-500 bg-white">
                  Aucune zone disponible
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-white">
                  <div className="space-y-2">
                    {allZones.map(zone => {
                      const isSelected = editFormData.zoneIds?.includes(zone.id) || false;
                      const wasOriginallyAssigned = selectedUser.zones?.some(z => z.id === zone.id);
                      
                      return (
                        <label 
                          key={zone.id} 
                          className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                            isSelected ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => toggleSelection('zoneIds', zone.id, e.target.checked)}
                            className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                          />
                          <span className={`text-sm flex-1 ${isSelected ? 'font-medium text-green-900' : 'text-gray-700'}`}>
                            {zone.nom}
                          </span>
                          {wasOriginallyAssigned && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              Déjà affectée
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Halls */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Layers className="w-4 h-4 inline mr-1 text-blue-600" />
                Halls
                <span className="text-gray-500 ml-2">
                  ({editFormData.hallIds?.length || 0} sélectionné{(editFormData.hallIds?.length || 0) > 1 ? 's' : ''})
                </span>
              </label>
              {allHalls.length === 0 ? (
                <div className="border border-gray-300 rounded-lg p-4 text-center text-gray-500 bg-white">
                  Aucun hall disponible
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-white">
                  <div className="space-y-2">
                    {allHalls.map(hall => {
                      const isSelected = editFormData.hallIds?.includes(hall.id) || false;
                      const wasOriginallyAssigned = selectedUser.halls?.some(h => h.id === hall.id);
                      
                      return (
                        <label 
                          key={hall.id} 
                          className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => toggleSelection('hallIds', hall.id, e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className={`text-sm flex-1 ${isSelected ? 'font-medium text-blue-900' : 'text-gray-700'}`}>
                            {hall.nom}
                          </span>
                          {wasOriginallyAssigned && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              Déjà affecté
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Résumé des modifications */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">Résumé des affectations</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-yellow-700 font-medium">Marchés:</span>
                <span className="ml-2 text-yellow-900">
                  {editFormData.marcheeIds?.length || 0}
                </span>
              </div>
              <div>
                <span className="text-yellow-700 font-medium">Zones:</span>
                <span className="ml-2 text-yellow-900">
                  {editFormData.zoneIds?.length || 0}
                </span>
              </div>
              <div>
                <span className="text-yellow-700 font-medium">Halls:</span>
                <span className="ml-2 text-yellow-900">
                  {editFormData.hallIds?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer fixe */}
      <div className="p-6 border-t border-gray-200 flex-shrink-0">
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              setIsEditModalOpen(false);
              setEditFormData({});
            }}
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            disabled={saving}
          >
            Annuler
          </button>
          <button
            onClick={handleUpdateUser}
            disabled={saving}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Enregistrer les modifications</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default UserManagementPage;