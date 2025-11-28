'use client';

import { Users, ShoppingCart, FileText, Shield } from 'lucide-react';
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
      value: '10',
      change: '+8.1%',
      changeType: 'positive' as const,
      icon: Users,
    },
    {
      title: 'Marchands',
      value: '2735',
      change: '+2.4%',
      changeType: 'positive' as const,
      icon: Shield,
    },
    {
      title: 'Marchands endettés',
      value: '24',
      change: '+15.3%',
      changeType: 'negative' as const,
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Tableau de bord - Ordonnateur
        </h1>
        <p className="text-gray-600 mt-2">
          Vue d’ensemble des marchés, utilisateurs et marchands
        </p>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Sections de visualisation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vue marchés */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
            Marchés
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✅ 12 marchés actifs</li>
            <li>⚠️ 2 marchés en maintenance</li>
            <li>➕ 1 marché en projet</li>
          </ul>
        </div>

        {/* Vue utilisateurs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-green-600" />
            Utilisateurs
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>👤 10 actifs aujourd’hui</li>
            <li>📊 120 utilisateurs enregistrés</li>
            <li>🔑 Rôles : Admin (3), Regisseurs (15), Marchands (102)</li>
          </ul>
        </div>

        {/* Vue marchands */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-purple-600" />
            Marchands
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>🛒 2735 marchands inscrits</li>
            <li>💰 24 marchands endettés</li>
            <li>📈 85% de paiements effectués</li>
          </ul>
        </div>
      </div>

      {/* Activités récentes */}
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
                  Madame X
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Création d’un marché
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
                  Albert
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
                  Ali Suharto
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Ajout d’un utilisateur
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
