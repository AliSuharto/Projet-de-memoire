'use client';
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Search, Shield, User, UserCheck, UserX } from 'lucide-react';

interface TeamMember {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  pseudo: string;
  photoUrl: string;
  role: string;
  isActive: boolean;
  telephone: string;
  createdByName: string;
  createdAt: string;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

const TeamManagementPage = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [actionType, setActionType] = useState<'enable' | 'disable'>('disable');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      const membersArray = Array.isArray(data) ? data : (data.data ? data.data : []);
      setMembers(membersArray);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async () => {
    if (!selectedMember) return;

    try {
      setActionLoading(true);
      const endpoint = actionType === 'enable' ? 'enable' : 'disable';
      
      const response = await fetch(`${API_BASE_URL}/users/${selectedMember.id}/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
     console.log(response);
      await fetchTeamMembers();
      
      setShowConfirmModal(false);
      setSelectedMember(null);
      setActionLoading(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('Une erreur est survenue lors de la mise à jour du statut');
      setActionLoading(false);
    }
  };

  const openConfirmModal = (member: TeamMember, action: 'enable' | 'disable') => {
    setSelectedMember(member);
    setActionType(action);
    setShowConfirmModal(true);
  };

  const getRoleDescription = (role: string) => {
    const descriptions: Record<string, string> = {
      ORDONNATEUR: 'Autorise et ordonne les dépenses du marché. Responsable de l\'engagement des dépenses publiques et de la validation des opérations financières.',
      DIRECTEUR: 'Dirige l\'ensemble des opérations du marché. Prend les décisions stratégiques, coordonne les différents services et assure la supervision générale.',
      PERCEPTEUR: 'Gère les recettes et encaissements du marché. Responsable de la collecte des taxes, des paiements et de la trésorerie quotidienne.',
      CREATEUR_MARCHE: 'Crée et configure les nouveaux marchés. Définit les paramètres initiaux, les zones de vente et les règles de fonctionnement.',
      REGISSEUR_MOBILE: 'Gère les emplacements mobiles et ambulants du marché. Supervise les vendeurs itinérants et les stands temporaires.',
      REGISSEUR_FIXE: 'Gère les emplacements fixes et permanents du marché. Responsable de l\'attribution et du suivi des stands fixes.',
      REGISSEUR: 'Supervise les opérations quotidiennes du marché. Gère les emplacements, collecte les droits de place et assure le bon fonctionnement.',
      REGISSEUR_PRINCIPAL: 'Coordonne l\'ensemble des régisseurs et supervise toutes les opérations du marché. Responsable de la gestion globale des emplacements et des équipes.'
    };
    return descriptions[role] || 'Membre de l\'équipe de gestion du marché.';
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      ORDONNATEUR: 'bg-purple-100 text-purple-700',
      DIRECTEUR: 'bg-red-100 text-red-700',
      PERCEPTEUR: 'bg-blue-100 text-blue-700',
      CREATEUR_MARCHE: 'bg-indigo-100 text-indigo-700',
      REGISSEUR_MOBILE: 'bg-green-100 text-green-700',
      REGISSEUR_FIXE: 'bg-teal-100 text-teal-700',
      REGISSEUR: 'bg-amber-100 text-amber-700',
      REGISSEUR_PRINCIPAL: 'bg-orange-100 text-orange-700'
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const getRoleOrder = (role: string): number => {
    const order: Record<string, number> = {
      ORDONNATEUR: 1,
      DIRECTEUR: 2,
      REGISSEUR_PRINCIPAL: 3,
      REGISSEUR: 4,
      PERCEPTEUR: 5,
      REGISSEUR_FIXE: 6,
      REGISSEUR_MOBILE: 7,
      CREATEUR_MARCHE: 8
    };
    return order[role] || 999;
  };

  const filteredMembers = Array.isArray(members) ? members.filter(member => {
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && member.isActive) || 
      (filter === 'inactive' && !member.isActive);
    
    const matchesSearch = searchTerm === '' || 
      member.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.pseudo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    const roleOrderDiff = getRoleOrder(a.role) - getRoleOrder(b.role);
    if (roleOrderDiff !== 0) return roleOrderDiff;
    return a.nom.localeCompare(b.nom);
  }) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Chargement des équipes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchTeamMembers}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg p-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Gestion des Équipes</h1>
          <p className="text-sm text-gray-600">Administration des membres de l'équipe du marché</p>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-4 mb-4">
          <div className="flex gap-3 items-center flex-wrap">
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email, pseudo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Tous ({Array.isArray(members) ? members.length : 0})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Actifs ({Array.isArray(members) ? members.filter(m => m.isActive).length : 0})
              </button>
              <button
                onClick={() => setFilter('inactive')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'inactive'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Inactifs ({Array.isArray(members) ? members.filter(m => !m.isActive).length : 0})
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-10"></th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom complet</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Téléphone</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rôle</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date de création</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMembers.map((member) => (
                <React.Fragment key={member.id}>
                  <tr 
                    onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}
                    className="hover:bg-gray-50 cursor-pointer transition"
                  >
                    <td className="px-6 py-4">
                      {expandedId === member.id ? (
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={`${member.prenom} ${member.nom}`}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${member.prenom}+${member.nom}&background=random`;
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                            {member.prenom?.[0]}{member.nom?.[0]}
                          </div>
                        )}
                        <div>
                          <div className="font-normal text-gray-900 text-base">
                            {member.prenom} {member.nom}
                          </div>
                          <div className="text-sm text-gray-500">@{member.pseudo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900 text-sm">{member.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900 text-sm">{member.telephone}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase ${getRoleBadgeColor(member.role)}`}>
                        {member.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {member.isActive ? (
                        <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                          Actif
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-md text-xs font-medium">
                          Inactif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(member.createdAt)}
                    </td>
                  </tr>
                  
                  {expandedId === member.id && (
                    <tr className="bg-blue-50">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-2">
                              <Shield className="w-4 h-4 text-blue-600" />
                              Responsabilités dans la gestion du marché
                            </h4>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {getRoleDescription(member.role)}
                            </p>
                          </div>
                          <div className="flex gap-3">
                            {member.role !== 'ORDONNATEUR' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openConfirmModal(member, member.isActive ? 'disable' : 'enable');
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                                  member.isActive
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                              >
                                {member.isActive ? (
                                  <>
                                    <UserX className="w-4 h-4" />
                                    Désactiver
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-4 h-4" />
                                    Activer
                                  </>
                                )}
                              </button>
                            )}
                            <div className="bg-white p-3 rounded-lg border border-blue-200 min-w-[200px]">
                              <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-xs text-gray-500 font-medium">Créé par</span>
                              </div>
                              <p className="text-sm text-gray-900 font-medium">{member.createdByName}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun membre trouvé</p>
            </div>
          )}
        </div>

        <div className="mt-4 bg-white shadow-sm rounded-lg p-3">
          <p className="text-sm text-gray-600">
            Total : {filteredMembers.length} membre{filteredMembers.length > 1 ? 's' : ''} affiché{filteredMembers.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {showConfirmModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                actionType === 'disable' ? 'bg-red-100' : 'bg-green-100'
              }`}>
                {actionType === 'disable' ? (
                  <UserX className="w-6 h-6 text-red-600" />
                ) : (
                  <UserCheck className="w-6 h-6 text-green-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {actionType === 'disable' ? 'Désactiver' : 'Activer'} l'utilisateur
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedMember.prenom} {selectedMember.nom}
                </p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              {actionType === 'disable' 
                ? "Êtes-vous sûr de vouloir désactiver cet utilisateur ? Il ne pourra plus accéder au système."
                : "Êtes-vous sûr de vouloir activer cet utilisateur ? Il pourra à nouveau accéder au système."
              }
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedMember(null);
                }}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleToggleUserStatus}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-lg text-white transition disabled:opacity-50 flex items-center gap-2 ${
                  actionType === 'disable'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {actionLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Traitement...
                  </>
                ) : (
                  actionType === 'disable' ? 'Désactiver' : 'Activer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagementPage;