"use client";

import React, { useState, useEffect } from "react";
import { Search, Eye, MapPin, Users, TrendingUp, RefreshCw } from "lucide-react";
import API_BASE_URL from "@/services/APIbaseUrl";

// Types
interface Market {
  id: number;
  nom: string;
  adresse: string;
  totalPlaces: number;
  placesOccupees: number;
  tauxOccupation: number;
}

// Composant principal
const MarketsManagement: React.FC = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Charger les marchés depuis l'API
  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/marchees`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      const data = await response.json();
      setMarkets(data);
    } catch (error) {
      console.error("Erreur lors du chargement des marchés:", error);
    } finally {
      setLoading(false);
    }
  };

  // Navigation vers les détails d'un marché
  const handleViewMarket = (marketId: number) => {
    window.location.href = `/dashboard/ordo/marchee/${marketId}`;
  };

  // Filtrage par recherche
  const filteredMarkets = markets.filter(market =>
    market.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistiques
  const totalMarkets = markets.length;
  const totalPlaces = markets.reduce((sum, m) => sum + m.totalPlaces, 0);
  const totalOccupees = markets.reduce((sum, m) => sum + m.placesOccupees, 0);
  const avgOccupation = markets.length > 0 
    ? Math.round(markets.reduce((sum, m) => sum + m.tauxOccupation, 0) / markets.length)
    : 0;

  const getOccupationColor = (rate: number) => {
    if (rate >= 90) return "text-green-600 bg-green-50";
    if (rate >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getOccupationBorderColor = (rate: number) => {
    if (rate >= 90) return "border-green-200";
    if (rate >= 70) return "border-yellow-200";
    return "border-red-200";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-1 pt-20 md:pt-6">
      {/* En-tête administratif */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Direction des Marchés Communaux
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Commune Urbaine de Diego Suarez - Service de Gestion des Marchés
              </p>
            </div>
            <button
              onClick={loadMarkets}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Marchés</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalMarkets}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Places Totales</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalPlaces}</p>
                <p className="text-xs text-gray-500 mt-1">{totalOccupees} occupées</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupation Moyenne</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{avgOccupation}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un marché par nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-2">
              {filteredMarkets.length} résultat{filteredMarkets.length > 1 ? 's' : ''} trouvé{filteredMarkets.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Liste des marchés */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* En-tête du tableau */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Registre des Marchés Communaux
            </h2>
          </div>

          {/* Tableau */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    N° Réf.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Marché
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Places
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Places Occupées
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Taux d'Occupation
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                        <p className="text-gray-600">Chargement des marchés...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredMarkets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Search className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="font-medium">Aucun marché trouvé</p>
                        <p className="text-sm mt-1">
                          {searchTerm 
                            ? "Essayez de modifier votre recherche" 
                            : "Aucun marché enregistré"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMarkets.map((market) => (
                    <tr 
                      key={market.id} 
                      onClick={() => handleViewMarket(market.id)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-600">
                          MCH-{String(market.id).padStart(4, '0')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">{market.nom}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {market.adresse}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-16 h-8 bg-blue-50 text-blue-700 font-semibold rounded-md text-sm">
                          {market.totalPlaces}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-16 h-8 bg-gray-50 text-gray-700 font-semibold rounded-md text-sm">
                          {market.placesOccupees}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full border ${getOccupationColor(market.tauxOccupation)} ${getOccupationBorderColor(market.tauxOccupation)}`}>
                          <span className="font-semibold text-sm">
                            {market.tauxOccupation.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleViewMarket(market.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pied de tableau */}
          {!loading && filteredMarkets.length > 0 && (
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
              <p className="text-sm text-gray-600">
                Affichage de <span className="font-semibold">{filteredMarkets.length}</span> marché{filteredMarkets.length > 1 ? 's' : ''} sur <span className="font-semibold">{totalMarkets}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketsManagement;