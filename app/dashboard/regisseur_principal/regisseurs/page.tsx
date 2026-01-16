'use client';
import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone, User, AlertCircle } from 'lucide-react';
import API_BASE_URL from '@/services/APIbaseUrl';

interface UserData {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: 'REGISSEUR' | 'PERCEPTEUR';
  pseudo?: string;
  photoUrl?: string;
  isActive: boolean;
  createdAt: string;
  createdByName?: string;
}

export default function RegisseursPercepteursPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'ALL' | 'REGISSEUR' | 'PERCEPTEUR'>('ALL');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, selectedRole, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users/regisseurs-percepteurs`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des données');
      }
      
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (selectedRole !== 'ALL') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.telephone?.includes(searchTerm)
      );
    }

    setFilteredUsers(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchUsers}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Régisseurs & Percepteurs</h1>
          <p className="text-gray-600 mt-2">Gestion des utilisateurs financiers</p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as 'ALL' | 'REGISSEUR' | 'PERCEPTEUR')}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
          >
            <option value="ALL">Tous</option>
            <option value="REGISSEUR">Régisseurs</option>
            <option value="PERCEPTEUR">Percepteurs</option>
          </select>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          {filteredUsers.length} résultat{filteredUsers.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Users Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">Aucun résultat trouvé</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className="p-6">
                  {/* Avatar & Name */}
                  <div className="flex items-center gap-4 mb-4">
                    {user.photoUrl ? (
                      <img
                        src={user.photoUrl}
                        alt={`${user.prenom} ${user.nom}`}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {user.prenom} {user.nom}
                      </h3>
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                        user.role === 'REGISSEUR' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {user.role === 'REGISSEUR' ? 'Régisseur' : 'Percepteur'}
                      </span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p
                       
                        className="text-sm text-gray-600 hover:text-blue-600 break-all"
                      >
                        {user.email}
                      </p>
                    </div>

                    {user.telephone && (
                      <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p
                          
                          className="text-sm text-gray-600 hover:text-blue-600"
                        >
                          {user.telephone}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className={`inline-block px-2 py-1 text-xs rounded ${
                      user.isActive 
                        ? 'bg-green-50 text-green-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}