'use client';
import React, { useState, useEffect } from 'react';
import { Search, Edit2, Eye, UserPlus, Filter, X, Save, Loader2 } from 'lucide-react';
import API_BASE_URL from '@/services/APIbaseUrl';

// Types
interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: string;
  isActive: boolean;
  pseudo?: string;
  photoUrl?: string;
  marchees?: { id: number; nom: string }[];
  zones?: { id: number; nom: string }[];
  halls?: { id: number; nom: string }[];
  createdAt: string;
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

  // Données de référence
  const [marchees, setMarchees] = useState<Location[]>([]);
  const [zones, setZones] = useState<Location[]>([]);
  const [halls, setHalls] = useState<Location[]>([]);

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
      filtered = filtered.filter(user =>
        user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setUsers(data.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [marcheesRes, zonesRes, hallsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/marchees`, { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }),
        fetch(`${API_BASE_URL}/public/zones`, { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }),
        fetch(`${API_BASE_URL}/public/salles/all`, { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            
            'Content-Type': 'application/json'
          } 
        })
      ]);
      
      const marcheesData = await marcheesRes.json();
      const zonesData = await zonesRes.json();
      const hallsData = await hallsRes.json();

      console.log('Marchés reçus:', marcheesData);
      console.log('Zones reçues:', zonesData);
      console.log('Halls reçus:', hallsData);

      // Gérer différents formats de réponse API et s'assurer que c'est un tableau
      const marcheesArray = Array.isArray(marcheesData) ? marcheesData : 
                           Array.isArray(marcheesData?.data) ? marcheesData.data : [];
      const zonesArray = Array.isArray(zonesData) ? zonesData : 
                        Array.isArray(zonesData?.data) ? zonesData.data : [];
      const hallsArray = Array.isArray(hallsData) ? hallsData : 
                        Array.isArray(hallsData?.data) ? hallsData.data : [];

      console.log('Marchés tableau:', marcheesArray);
      console.log('Zones tableau:', zonesArray);
      console.log('Halls tableau:', hallsArray);

      setMarchees(marcheesArray);
      setZones(zonesArray);
      setHalls(hallsArray);
    } catch (error) {
      console.error('Erreur lors du chargement des localisations:', error);
      // En cas d'erreur, initialiser avec des tableaux vides
      setMarchees([]);
      setZones([]);
      setHalls([]);
    }
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      role: user.role,
      isActive: user.isActive,
      marcheeIds: user.marchees?.map(m => m.id) || [],
      zoneIds: user.zones?.map(z => z.id) || [],
      hallIds: user.halls?.map(h => h.id) || []
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        await fetchUsers();
        setIsEditModalOpen(false);
        setSelectedUser(null);
      } else {
        const error = await response.json();
        alert(error.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour');
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Utilisateurs</h1>
          <p className="text-gray-600">Visualisez et modifiez les informations des utilisateurs</p>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, prénom ou email..."
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
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                              {user.prenom[0]}{user.nom[0]}
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
                        <div className="text-sm text-gray-900">
                          {user.marchees && user.marchees.length > 0 && (
                            <div className="mb-1">
                              <span className="font-medium">Marchés:</span> {user.marchees.length}
                            </div>
                          )}
                          {user.zones && user.zones.length > 0 && (
                            <div className="mb-1">
                              <span className="font-medium">Zones:</span> {user.zones.length}
                            </div>
                          )}
                          {user.halls && user.halls.length > 0 && (
                            <div>
                              <span className="font-medium">Halls:</span> {user.halls.length}
                            </div>
                          )}
                          {(!user.marchees?.length && !user.zones?.length && !user.halls?.length) && (
                            <span className="text-gray-400">Aucune</span>
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
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun utilisateur trouvé</p>
              </div>
            )}
          </div>
        )}

        {/* Modal de visualisation */}
        {isViewModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Détails de l'utilisateur</h2>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
                      {selectedUser.prenom[0]}{selectedUser.nom[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {selectedUser.prenom} {selectedUser.nom}
                      </h3>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoleBadgeColor(selectedUser.role)}`}>
                        {selectedUser.role}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Téléphone</label>
                      <p className="text-gray-900">{selectedUser.telephone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Pseudo</label>
                      <p className="text-gray-900">{selectedUser.pseudo || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Statut</label>
                      <p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedUser.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {selectedUser.marchees && selectedUser.marchees.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-2 block">Marchés affectés</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.marchees.map(marchee => (
                          <span key={marchee.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {marchee.nom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedUser.zones && selectedUser.zones.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-2 block">Zones affectées</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.zones.map(zone => (
                          <span key={zone.id} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            {zone.nom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedUser.halls && selectedUser.halls.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-2 block">Halls affectés</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.halls.map(hall => (
                          <span key={hall.id} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                            {hall.nom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-500">Date de création</label>
                    <p className="text-gray-900">
                      {new Date(selectedUser.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal d'édition */}
        {isEditModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Modifier l'utilisateur</h2>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                      <input
                        type="text"
                        value={editFormData.nom || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, nom: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                      <input
                        type="text"
                        value={editFormData.prenom || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, prenom: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editFormData.email || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                      <input
                        type="tel"
                        value={editFormData.telephone || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, telephone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
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
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editFormData.isActive || false}
                        onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Compte actif</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marchés ({Array.isArray(marchees) ? marchees.length : 0} disponibles)
                    </label>
                    {!Array.isArray(marchees) || marchees.length === 0 ? (
                      <div className="border border-gray-300 rounded-lg p-3 text-center text-gray-500">
                        Aucun marché disponible
                      </div>
                    ) : (
                      <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto bg-white">
                        {marchees.map(marchee => (
                          <label key={marchee.id} className="flex items-center space-x-2 mb-2 hover:bg-gray-50 p-1 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editFormData.marcheeIds?.includes(marchee.id) || false}
                              onChange={(e) => {
                                const ids = editFormData.marcheeIds || [];
                                setEditFormData({
                                  ...editFormData,
                                  marcheeIds: e.target.checked
                                    ? [...ids, marchee.id]
                                    : ids.filter(id => id !== marchee.id)
                                });
                              }}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{marchee.nom}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zones ({Array.isArray(zones) ? zones.length : 0} disponibles)
                    </label>
                    {!Array.isArray(zones) || zones.length === 0 ? (
                      <div className="border border-gray-300 rounded-lg p-3 text-center text-gray-500">
                        Aucune zone disponible
                      </div>
                    ) : (
                      <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto bg-white">
                        {zones.map(zone => (
                          <label key={zone.id} className="flex items-center space-x-2 mb-2 hover:bg-gray-50 p-1 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editFormData.zoneIds?.includes(zone.id) || false}
                              onChange={(e) => {
                                const ids = editFormData.zoneIds || [];
                                setEditFormData({
                                  ...editFormData,
                                  zoneIds: e.target.checked
                                    ? [...ids, zone.id]
                                    : ids.filter(id => id !== zone.id)
                                });
                              }}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{zone.nom}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Halls ({Array.isArray(halls) ? halls.length : 0} disponibles)
                    </label>
                    {!Array.isArray(halls) || halls.length === 0 ? (
                      <div className="border border-gray-300 rounded-lg p-3 text-center text-gray-500">
                        Aucun hall disponible
                      </div>
                    ) : (
                      <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto bg-white">
                        {halls.map(hall => (
                          <label key={hall.id} className="flex items-center space-x-2 mb-2 hover:bg-gray-50 p-1 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editFormData.hallIds?.includes(hall.id) || false}
                              onChange={(e) => {
                                const ids = editFormData.hallIds || [];
                                setEditFormData({
                                  ...editFormData,
                                  hallIds: e.target.checked
                                    ? [...ids, hall.id]
                                    : ids.filter(id => id !== hall.id)
                                });
                              }}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{hall.nom}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    disabled={saving}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleUpdateUser}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Enregistrement...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Enregistrer</span>
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