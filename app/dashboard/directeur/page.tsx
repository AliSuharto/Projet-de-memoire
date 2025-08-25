'use client';

import { Users, ShoppingCart, Settings, FileText, Shield, BarChart3 } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';

export default function DirecteurDashboard() {
  const stats = [
    {
      title: 'Total marchés',
      value: '15',
      change: '+3.2%',
      changeType: 'positive' as const,
      icon: ShoppingCart,
    },
    {
      title: 'Utilisateurs actifs',
      value: '89',
      change: '+8.1%',
      changeType: 'positive' as const,
      icon: Users,
    },
    {
      title: 'Permissions gérées',
      value: '156',
      change: '+2.4%',
      changeType: 'positive' as const,
      icon: Shield,
    },
    {
      title: 'Rapports générés',
      value: '24',
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Tableau de bord - Directeur
        </h1>
        <p className="text-gray-600 mt-2">
          Gestion des marchés, utilisateurs et permissions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gestion des marchés */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
            Gestion des marchés
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <p className="font-medium text-gray-900">Créer un nouveau marché</p>
              <p className="text-sm text-gray-600">Ajouter un marché à la commune</p>
            </button>
            <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <p className="font-medium text-gray-900">Modifier les marchés</p>
              <p className="text-sm text-gray-600">Éditer les informations existantes</p>
            </button>
            <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <p className="font-medium text-gray-900">Statistiques des marchés</p>
              <p className="text-sm text-gray-600">Voir les performances</p>
            </button>
          </div>
        </div>

        {/* Gestion des utilisateurs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-green-600" />
            Gestion des utilisateurs
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <p className="font-medium text-gray-900">Ajouter un utilisateur</p>
              <p className="text-sm text-gray-600">Créer un nouveau compte</p>
            </button>
            <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <p className="font-medium text-gray-900">Gérer les rôles</p>
              <p className="text-sm text-gray-600">Attribuer des permissions</p>
            </button>
            <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <p className="font-medium text-gray-900">Utilisateurs actifs</p>
              <p className="text-sm text-gray-600">Voir la liste complète</p>
            </button>
          </div>
        </div>

        {/* Gestion des permissions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-purple-600" />
            Permissions
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <p className="font-medium text-gray-900">Configurer les rôles</p>
              <p className="text-sm text-gray-600">Définir les permissions</p>
            </button>
            <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <p className="font-medium text-gray-900">Audit des accès</p>
              <p className="text-sm text-gray-600">Historique des connexions</p>
            </button>
            <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <p className="font-medium text-gray-900">Sécurité</p>
              <p className="text-sm text-gray-600">Paramètres de sécurité</p>
            </button>
          </div>
        </div>
      </div>

      {/* Tableau de bord des activités */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Activités récentes du système
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Marie Diop
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Création d'un nouveau marché
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Il y a 2 heures
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Complété
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Amadou Fall
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Modification des permissions
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Il y a 4 heures
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Complété
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Fatou Seck
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Ajout d'un utilisateur
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Il y a 1 jour
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    En cours
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
