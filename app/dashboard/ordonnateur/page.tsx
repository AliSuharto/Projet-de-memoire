'use client';

import { Users, ShoppingCart, TrendingUp, UserCheck } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';

export default function OrdonnateurDashboard() {
  // Données de démonstration
  const stats = [
    {
      title: 'Marchés actifs',
      value: '12',
      change: '+2.5%',
      changeType: 'positive' as const,
      icon: ShoppingCart,
    },
    {
      title: 'Taux d\'occupation',
      value: '87%',
      change: '+5.2%',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
    {
      title: 'Marchands inscrits',
      value: '1,247',
      change: '+12.3%',
      changeType: 'positive' as const,
      icon: Users,
    },
    {
      title: 'Équipe de gestion',
      value: '24',
      change: '0%',
      changeType: 'neutral' as const,
      icon: UserCheck,
    },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Tableau de bord - Ordonnateur
        </h1>
        <p className="text-gray-600 mt-2">
          Vue d'ensemble de la gestion des marchés communaux
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Sections principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Marchés récents */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Marchés récents
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Marché Central</p>
                <p className="text-sm text-gray-600">Dakar - Zone A</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Actif
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Marché des Légumes</p>
                <p className="text-sm text-gray-600">Pikine - Zone B</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Actif
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Marché Artisanal</p>
                <p className="text-sm text-gray-600">Guédiawaye - Zone C</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                En maintenance
              </span>
            </div>
          </div>
        </div>

        {/* Activités récentes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Activités récentes
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  Nouveau marchand inscrit au Marché Central
                </p>
                <p className="text-xs text-gray-500">Il y a 2 heures</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  Paiement reçu - Stand 45
                </p>
                <p className="text-xs text-gray-500">Il y a 4 heures</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  Maintenance programmée - Marché Artisanal
                </p>
                <p className="text-xs text-gray-500">Il y a 6 heures</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  Rapport mensuel généré
                </p>
                <p className="text-xs text-gray-500">Il y a 1 jour</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Actions rapides
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <ShoppingCart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Créer un marché</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Ajouter un marchand</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
            <UserCheck className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Gérer l'équipe</p>
          </button>
        </div>
      </div>
    </div>
  );
}
