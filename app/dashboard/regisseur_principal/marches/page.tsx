'use client';
import React, { useState, useEffect } from 'react';
import { Building2, MapPin, DollarSign, TrendingUp, ChevronDown, ChevronUp, Eye, Home, Layers, Tag, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import API_BASE_URL from '@/services/APIbaseUrl';

// ============ TYPES MAPPÉS À VOTRE API ============

interface CategorieFrequence {
  categorie: string;
  frequence: string;
  tarifBase: number;
  nbrMarchands: number;
  facteurConversion: number;
  montantMensuelUnitaire: number;
  montantEstimeTotal: number;
  montantPercu: number;
  tauxPerception: number;
}

interface HallDTO {
  id: number;
  nom: string;
  nbrPlace: number;
  nbrPlaceLibre: number;
  nbrPlaceOccupee: number;
  nbrMarchands: number;
  tauxOccupation: number;
  montantEstime: number;
  montantPercu: number;
  montantRestant: number;
}

interface ZoneDTO {
  id: number;
  nom: string;
  nbrHalls: number;
  nbrPlace: number;
  nbrPlaceLibre: number;
  nbrPlaceOccupee: number;
  nbrMarchands: number;
  tauxOccupation: number;
  montantEstimeMois: number;
  montantPercu: number;
  montantRestant: number;
}

interface MarcheeData {
  id: number;
  nom: string;
  adresse: string;
  nbrPlace: number;
  nbrPlaceLibre: number;
  nbrPlaceOccupee: number;
  nbrHall: number;
  nbrZone: number;
  nbrMarchands: number;
  tauxOccupation: number;
  montantEstimeParMois: number;
  montantPercuMoisDernier: number;
  montantRestant: number;
  tauxPerception: number;
  repartitionPaiements: CategorieFrequence[];
  halls: HallDTO[];
  zones: ZoneDTO[];
}

// ============ CONFIGURATION API ============
const API_ENDPOINT = `${API_BASE_URL}/marchees/stats`;

export default function MarcheesStatsPage() {
  const [marcheesData, setMarcheesData] = useState<MarcheeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMarchee, setExpandedMarchee] = useState<number | null>(null);
  const [viewType, setViewType] = useState<'halls' | 'zones' | null>(null);

  // ============ FETCH DATA FROM API ============
  const fetchMarcheesData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(API_ENDPOINT);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data: MarcheeData[] = await response.json();
      setMarcheesData(data);
    } catch (err) {
      console.error('Erreur lors de la récupération des données:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarcheesData();
  }, []);

  // ============ UTILITY FUNCTIONS ============
  const formatMontant = (montant: number): string => {
    return `${montant.toLocaleString('fr-FR')} Ar`;
  };

  const toggleMarchee = (id: number) => {
    if (expandedMarchee === id) {
      setExpandedMarchee(null);
      setViewType(null);
    } else {
      setExpandedMarchee(id);
      setViewType(null);
    }
  };

  const getFrequenceLabel = (frequence: string): string => {
    const labels: Record<string, string> = {
      'JOURNALIER': 'Journalier',
      'HEBDOMADAIRE': 'Hebdomadaire',
      'MENSUEL': 'Mensuel'
    };
    return labels[frequence] || frequence;
  };

  const getFrequenceBadgeColor = (frequence: string): string => {
    const colors: Record<string, string> = {
      'JOURNALIER': 'bg-amber-100 text-amber-700',
      'HEBDOMADAIRE': 'bg-blue-100 text-blue-700',
      'MENSUEL': 'bg-green-100 text-green-700'
    };
    return colors[frequence] || 'bg-gray-100 text-gray-700';
  };

  // ============ CALCULATIONS ============
  const totalMarcheesPlaces = marcheesData.reduce((sum, m) => sum + m.nbrPlace, 0);
  const totalMontantEstime = marcheesData.reduce((sum, m) => sum + m.montantEstimeParMois, 0);
  const totalMontantPercu = marcheesData.reduce((sum, m) => sum + m.montantPercuMoisDernier, 0);
  const tauxPerceptionGlobal = totalMontantEstime > 0 
    ? Math.round((totalMontantPercu / totalMontantEstime) * 100) 
    : 0;

  // ============ LOADING STATE ============
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Chargement des données...</p>
        </div>
      </div>
    );
  }

  // ============ ERROR STATE ============
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-red-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Erreur de chargement</h2>
          </div>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={fetchMarcheesData}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // ============ MAIN RENDER ============
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* ============ HEADER ============ */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">État des Marchés</h1>
            <p className="text-slate-600">Vue d&apos;ensemble et gestion des marchés municipaux</p>
          </div>
          <button
            onClick={fetchMarcheesData}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>

        {/* ============ GLOBAL STATS ============ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-slate-600">Total Marchés</h3>
            </div>
            <p className="text-3xl font-bold text-slate-800">{marcheesData.length}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-slate-600">Total Places</h3>
            </div>
            <p className="text-3xl font-bold text-slate-800">{totalMarcheesPlaces}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-slate-600">Revenus Estimés</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">{formatMontant(totalMontantEstime)}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-slate-600">Taux de Perception</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600">{tauxPerceptionGlobal}%</p>
          </div>
        </div>

        {/* ============ MARCHÉS LIST ============ */}
        <div className="space-y-4">
          {marcheesData.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
              <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">Aucun marché trouvé</h3>
              <p className="text-slate-500">Il n&apos;y a pas encore de marchés enregistrés dans le système.</p>
            </div>
          ) : (
            marcheesData.map((marchee) => {
              const isExpanded = expandedMarchee === marchee.id;
              const tauxPerception = marchee.tauxPerception;
              
              return (
                <div key={marchee.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200 hover:shadow-lg transition-shadow">
                  
                  {/* ============ MARCHÉ HEADER ============ */}
                  <button
                    onClick={() => toggleMarchee(marchee.id)}
                    className="w-full p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                        <Building2 className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-left flex-1">
                        <h2 className="text-xl font-bold text-slate-800 mb-1">{marchee.nom}</h2>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <MapPin className="w-4 h-4" />
                          <span>{marchee.adresse}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Quick Stats */}
                      <div className="hidden lg:flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="text-xs text-slate-500 mb-0.5">Places</p>
                          <p className="text-lg font-bold text-slate-700">{marchee.nbrPlace}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-500 mb-0.5">Halls</p>
                          <p className="text-lg font-bold text-slate-700">{marchee.nbrHall}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-500 mb-0.5">Zones</p>
                          <p className="text-lg font-bold text-slate-700">{marchee.nbrZone}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-500 mb-0.5">Perception</p>
                          <p className={`text-lg font-bold ${
                            tauxPerception >= 90 ? 'text-green-600' : 
                            tauxPerception >= 75 ? 'text-orange-600' : 
                            'text-red-600'
                          }`}>
                            {tauxPerception}%
                          </p>
                        </div>
                      </div>

                      {isExpanded ? (
                        <ChevronUp className="w-6 h-6 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* ============ EXPANDED DETAILS ============ */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 bg-slate-50/30">
                      <div className="p-6">
                        
                        {/* ============ DETAILED STATS ============ */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                          
                          {/* Total Places */}
                          <div className="bg-white rounded-lg p-4 border border-slate-200">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-9 h-9 rounded-lg bg-blue-400 flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-white" />
                              </div>
                              <h4 className="text-xs font-bold text-slate-600 uppercase">Places Total</h4>
                            </div>
                            <p className="text-2xl font-bold text-slate-800">{marchee.nbrPlace}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              Occupées: {marchee.nbrPlaceOccupee} • Libres: {marchee.nbrPlaceLibre}
                            </p>
                          </div>

                          {/* Halls */}
                          <div className="bg-white rounded-lg p-4 border border-slate-200">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-9 h-9 rounded-lg bg-purple-400 flex items-center justify-center">
                                <Home className="w-5 h-5 text-white" />
                              </div>
                              <h4 className="text-xs font-bold text-slate-600 uppercase">Halls</h4>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-2xl font-bold text-slate-800">{marchee.nbrHall}</p>
                              {marchee.halls.length > 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setViewType(viewType === 'halls' ? null : 'halls');
                                  }}
                                  className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  Voir
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Zones */}
                          <div className="bg-white rounded-lg p-4 border border-slate-200">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-9 h-9 rounded-lg bg-indigo-400 flex items-center justify-center">
                                <Layers className="w-5 h-5 text-white" />
                              </div>
                              <h4 className="text-xs font-bold text-slate-600 uppercase">Zones</h4>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-2xl font-bold text-slate-800">{marchee.nbrZone}</p>
                              {marchee.zones.length > 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setViewType(viewType === 'zones' ? null : 'zones');
                                  }}
                                  className="px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  Voir
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Taux Perception */}
                          <div className="bg-white rounded-lg p-4 border border-slate-200">
                            <div className="flex items-center gap-2 mb-3">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                tauxPerception >= 90 ? 'bg-green-400' : 
                                tauxPerception >= 75 ? 'bg-orange-400' : 
                                'bg-red-400'
                              }`}>
                                <TrendingUp className="w-5 h-5 text-white" />
                              </div>
                              <h4 className="text-xs font-bold text-slate-600 uppercase">Taux Perception</h4>
                            </div>
                            <p className={`text-2xl font-bold ${
                              tauxPerception >= 90 ? 'text-green-600' : 
                              tauxPerception >= 75 ? 'text-orange-600' : 
                              'text-red-600'
                            }`}>
                              {tauxPerception}%
                            </p>
                          </div>
                        </div>

                        {/* ============ RÉPARTITION PAR CATÉGORIE/FRÉQUENCE ============ */}
                        {marchee.repartitionPaiements.length > 0 && (
                          <div className="mb-6">
                            <h3 className="text-base font-bold text-slate-700 mb-3 flex items-center gap-2">
                              <Tag className="w-5 h-5 text-slate-600" />
                              Répartition par Catégorie et Fréquence
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {marchee.repartitionPaiements.map((repartition, idx) => (
                                <div key={idx} className="bg-white rounded-lg p-4 border border-slate-200 hover:border-slate-300 transition-colors">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-bold text-slate-700">Catégorie {repartition.categorie}</h4>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${getFrequenceBadgeColor(repartition.frequence)}`}>
                                      {getFrequenceLabel(repartition.frequence)}
                                    </span>
                                  </div>
                                  
                                  <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-slate-600">Tarif de base:</span>
                                      <span className="font-semibold text-slate-800">{formatMontant(repartition.tarifBase)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-600">Marchands:</span>
                                      <span className="font-semibold text-blue-600">{repartition.nbrMarchands}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-600">Équiv. mensuel:</span>
                                      <span className="font-semibold text-slate-800">{formatMontant(repartition.montantMensuelUnitaire)}</span>
                                    </div>
                                    <div className="pt-2 border-t border-slate-200">
                                      <div className="flex justify-between mb-1">
                                        <span className="text-slate-600 font-medium">Estimé:</span>
                                        <span className="font-bold text-green-600">{formatMontant(repartition.montantEstimeTotal)}</span>
                                      </div>
                                      <div className="flex justify-between mb-1">
                                        <span className="text-slate-600 font-medium">Perçu:</span>
                                        <span className="font-bold text-orange-600">{formatMontant(repartition.montantPercu)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-600 font-medium">Taux:</span>
                                        <span className={`font-bold ${
                                          repartition.tauxPerception >= 90 ? 'text-green-600' : 
                                          repartition.tauxPerception >= 75 ? 'text-orange-600' : 
                                          'text-red-600'
                                        }`}>
                                          {repartition.tauxPerception}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ============ REVENUE SUMMARY ============ */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-gradient-to-br from-green-50 to-green-50/50 rounded-lg p-5 border border-green-200">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-white" />
                              </div>
                              <h4 className="text-sm font-bold text-slate-700">Montant Estimé</h4>
                            </div>
                            <p className="text-2xl font-bold text-green-600">{formatMontant(marchee.montantEstimeParMois)}</p>
                          </div>

                          <div className="bg-gradient-to-br from-orange-50 to-orange-50/50 rounded-lg p-5 border border-orange-200">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-white" />
                              </div>
                              <h4 className="text-sm font-bold text-slate-700">Montant Perçu</h4>
                            </div>
                            <p className="text-2xl font-bold text-orange-600">{formatMontant(marchee.montantPercuMoisDernier)}</p>
                          </div>

                          <div className="bg-gradient-to-br from-red-50 to-red-50/50 rounded-lg p-5 border border-red-200">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-white" />
                              </div>
                              <h4 className="text-sm font-bold text-slate-700">Montant Restant</h4>
                            </div>
                            <p className="text-2xl font-bold text-red-600">{formatMontant(marchee.montantRestant)}</p>
                          </div>
                        </div>

                        {/* ============ HALLS VIEW ============ */}
                        {viewType === 'halls' && marchee.halls.length > 0 && (
                          <div className="bg-white rounded-lg p-5 border border-purple-200 mb-6">
                            <h4 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
                              <Home className="w-5 h-5 text-purple-600" />
                              Liste des Halls
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {marchee.halls.map((hall) => (
                                <div key={hall.id} className="bg-purple-50/50 rounded-lg p-4 border border-purple-100">
                                  <h5 className="font-bold text-slate-800 mb-3">{hall.nom}</h5>
                                  <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-slate-600">Places:</span>
                                      <span className="font-semibold text-slate-800">{hall.nbrPlace}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-600">Occupées:</span>
                                      <span className="font-semibold text-purple-600">{hall.nbrPlaceOccupee}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-600">Marchands:</span>
                                      <span className="font-semibold text-blue-600">{hall.nbrMarchands}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-purple-200">
                                      <span className="text-slate-600">Taux:</span>
                                      <span className="font-bold text-slate-800">{hall.tauxOccupation}%</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ============ ZONES VIEW ============ */}
                        {viewType === 'zones' && marchee.zones.length > 0 && (
                          <div className="bg-white rounded-lg p-5 border border-indigo-200">
                            <h4 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
                              <Layers className="w-5 h-5 text-indigo-600" />
                              Liste des Zones
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {marchee.zones.map((zone) => (
                                <div key={zone.id} className="bg-indigo-50/50 rounded-lg p-4 border border-indigo-100">
                                  <h5 className="font-bold text-slate-800 mb-3">{zone.nom}</h5>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-slate-600">Halls:</span>
                                      <span className="font-semibold text-slate-800">{zone.nbrHalls}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-600">Places:</span>
                                      <span className="font-semibold text-slate-800">{zone.nbrPlace}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-600">Occupées:</span>
                                      <span className="font-semibold text-indigo-600">{zone.nbrPlaceOccupee}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-600">Marchands:</span>
                                      <span className="font-semibold text-blue-600">{zone.nbrMarchands}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-indigo-200">
                                      <span className="text-slate-600 font-medium">Taux:</span>
                                      <span className="font-bold text-slate-800">{zone.tauxOccupation}%</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}