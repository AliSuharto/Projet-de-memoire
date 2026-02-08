'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { ArrowUpDown, Eye, Search, Filter, ChevronDown, ChevronUp, X, MapPin, Calendar, User, Phone, Mail, Building2, Store, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import API_BASE_URL from '@/services/APIbaseUrl';

// Types
interface Place {
  nom: string;
  salleName: string;
  zoneName?: string;
  marcheeName?: string;
  categorieName?: string;
}

interface Paiement {
  id: number;
  date: string;
  datePaiement: string;
  montant: number;
  motif: string;
  reference?: string;
  recuNumero?: string;
  nomAgent?: string;
  createdAt: string;
}

interface Marchand {
  id: number;
  nom: string;
  cin?: string;
  activite: string;
  email?: string;
  telephone?: string;
  statut: StatutType;
  places: Place[];
  paiements: Paiement[];
}

type StatutType = 'A_JOUR' | 'RETARD_LEGER' | 'RETARD_SIGNIFICATIF' | 'RETARD_CRITIQUE' | 'RETARD_PROLONGER';

interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc';
}

// Constants
const statutColors: Record<StatutType, { bg: string; text: string; border: string; dot: string }> = {
  A_JOUR: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  RETARD_LEGER: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  RETARD_SIGNIFICATIF: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  RETARD_CRITIQUE: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  RETARD_PROLONGER: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', dot: 'bg-red-600' }
};

const statutLabels: Record<StatutType, string> = {
  A_JOUR: 'À jour',
  RETARD_LEGER: 'Retard léger',
  RETARD_SIGNIFICATIF: 'Retard significatif',
  RETARD_CRITIQUE: 'Retard critique',
  RETARD_PROLONGER: 'Retard prolongé'
};

export default function MarchandsTable() {
  const router = useRouter();
  const [data, setData] = useState<Marchand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statutFilter, setStatutFilter] = useState('');
  const [marcheeFilter, setMarcheeFilter] = useState('');
  const [hallFilter, setHallFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/contrat/contrats-actifs`);
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des données');
        }
        const result = await response.json();
        setData(result);
        console.log('Données des marchands:', result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return 'Aucun';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getLastPaiement = (marchand: Marchand) => {
    if (!marchand.paiements || marchand.paiements.length === 0) return null;
    const lastPaiement = marchand.paiements.reduce((latest, current) => 
      new Date(current.datePaiement) > new Date(latest.datePaiement) ? current : latest
    );
    return lastPaiement.datePaiement;
  };

  const getTotalPaiements = (marchand: Marchand) => {
    if (!marchand.paiements || marchand.paiements.length === 0) return 0;
    const lastPaiement = marchand.paiements.reduce((latest, current) => 
      new Date(current.datePaiement) > new Date(latest.datePaiement) ? current : latest
    );
    return lastPaiement.montant;
  };
  const uniqueValues = useMemo(() => {
    const marchees = new Set<string>();
    const halls = new Set<string>();
    const zones = new Set<string>();
    const statuts = new Set<StatutType>();

    data.forEach(marchand => {
      statuts.add(marchand.statut);
      marchand.places.forEach(place => {
        if (place.marcheeName) marchees.add(place.marcheeName);
        if (place.salleName) halls.add(place.salleName);
        if (place.zoneName) zones.add(place.zoneName);
      });
    });

    return {
      marchees: Array.from(marchees).sort(),
      halls: Array.from(halls).sort(),
      zones: Array.from(zones).sort(),
      statuts: Array.from(statuts)
    };
  }, [data]);

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(marchand => {
      const matchStatut = !statutFilter || marchand.statut === statutFilter;
      const matchMarchee = !marcheeFilter || marchand.places.some(p => p.marcheeName === marcheeFilter);
      const matchHall = !hallFilter || marchand.places.some(p => p.salleName === hallFilter);
      const matchZone = !zoneFilter || marchand.places.some(p => p.zoneName === zoneFilter);
      const matchSearch = !searchTerm ||
        marchand.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (marchand.cin && marchand.cin.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchStatut && matchMarchee && matchHall && matchZone && matchSearch;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;

        if (sortConfig.key === 'nom') {
          aValue = a.nom;
          bValue = b.nom;
        } else if (sortConfig.key === 'statut') {
          const ordre: StatutType[] = ['A_JOUR', 'RETARD_LEGER', 'RETARD_SIGNIFICATIF', 'RETARD_CRITIQUE', 'RETARD_PROLONGER'];
          aValue = ordre.indexOf(a.statut);
          bValue = ordre.indexOf(b.statut);
        } else if (sortConfig.key === 'dernierPaiement') {
          aValue = getLastPaiement(a) || '';
          bValue = getLastPaiement(b) || '';
        } else if (sortConfig.key === 'adresse') {
          aValue = a.places[0]?.marcheeName || '';
          bValue = b.places[0]?.marcheeName || '';
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, statutFilter, marcheeFilter, hallFilter, zoneFilter, sortConfig, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [statutFilter, marcheeFilter, hallFilter, zoneFilter, searchTerm]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearAllFilters = () => {
    setStatutFilter('');
    setMarcheeFilter('');
    setHallFilter('');
    setZoneFilter('');
    setSearchTerm('');
  };

  const activeFiltersCount = [statutFilter, marcheeFilter, hallFilter, zoneFilter, searchTerm].filter(Boolean).length;

  const handleMarchandClick = (id: number) => {
    router.push(`/dashboard/regisseur/marchands/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-0">
      {/* STICKY HEADER */}
      <div className="sticky top-0 z-30 bg-white rounded-b-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            {/* Title and Search Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Liste des Marchands</h1>
                <p className="text-sm text-gray-600 mt-1">{filteredAndSortedData.length} marchand(s) au total</p>
              </div>
              
              {/* Search Bar */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher par nom ou CIN..."
                    className="w-full pl-11 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filtres</span>
                  {activeFiltersCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                  {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>

            {/* Filters Grid */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-gray-200">
                <select
                  value={statutFilter}
                  onChange={(e) => setStatutFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Tous les statuts</option>
                  {uniqueValues.statuts.map(statut => (
                    <option key={statut} value={statut}>{statutLabels[statut]}</option>
                  ))}
                </select>

                <select
                  value={marcheeFilter}
                  onChange={(e) => setMarcheeFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Tous les marchés</option>
                  {uniqueValues.marchees.map(marchee => (
                    <option key={marchee} value={marchee}>{marchee}</option>
                  ))}
                </select>

                <select
                  value={hallFilter}
                  onChange={(e) => setHallFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Tous les halls</option>
                  {uniqueValues.halls.map(hall => (
                    <option key={hall} value={hall}>{hall}</option>
                  ))}
                </select>

                <select
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Toutes les zones</option>
                  {uniqueValues.zones.map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">Chargement des données...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-red-800 font-semibold">Erreur : {error}</h3>
                <p className="text-red-700 text-sm mt-1">Assurez-vous que l'API est accessible</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedData.map((marchand) => {
                const colors = statutColors[marchand.statut];
                const lastPaiement = getLastPaiement(marchand);
                const totalPaiements = getTotalPaiements(marchand);

                return (
                  <div
                    key={marchand.id}
                    className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 overflow-hidden group cursor-pointer"
                    onClick={() => handleMarchandClick(marchand.id)}
                  >
                    {/* Header with status */}
                    <div className={`px-5 py-3 border-b border-gray-100 flex items-center justify-between ${colors.bg}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`}></div>
                        <span className={`text-xs font-semibold ${colors.text}`}>
                          {statutLabels[marchand.statut]}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarchandClick(marchand.id);
                        }}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Name and Activity */}
                      <div className="mb-4">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-base truncate group-hover:text-blue-600 transition-colors">
                              {marchand.nom}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">{marchand.activite}</p>
                          </div>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2 mb-4">
                        {marchand.telephone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{marchand.telephone}</span>
                          </div>
                        )}
                        {marchand.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{marchand.email}</span>
                          </div>
                        )}
                      </div>

                      {/* Places */}
                      <div className="mb-4 space-y-2">
                        {marchand.places.slice(0, 2).map((place, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm bg-gray-50 rounded-lg p-2.5">
                            <Store className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">{place.nom}</div>
                              <div className="text-xs text-gray-600 truncate">
                                {place.marcheeName} • {place.salleName}
                                {place.zoneName && ` • ${place.zoneName}`}
                              </div>
                            </div>
                          </div>
                        ))}
                        {marchand.places.length > 2 && (
                          <div className="text-xs text-blue-600 font-medium pl-2">
                            +{marchand.places.length - 2} autre(s) place(s)
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-xs">Dernier paiement</span>
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {lastPaiement ? formatDateTime(lastPaiement) : 'Aucun'}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span className="text-xs">montant payé</span>
                          </div>
                          <div className="text-sm font-semibold text-green-600">
                            {getTotalPaiements(marchand).toLocaleString()} CFA
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarchandClick(marchand.id);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Voir les détails
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredAndSortedData.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">Aucun marchand trouvé avec ces filtres</p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}

            {/* Pagination */}
            {filteredAndSortedData.length > 0 && (
              <div className="mt-6 px-6 py-4 bg-white rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 font-medium">
                    Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} sur {filteredAndSortedData.length}
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value={12}>12 par page</option>
                    <option value={24}>24 par page</option>
                    <option value={48}>48 par page</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Précédent
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}