'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { ArrowUpDown, Eye, ArrowLeft, X, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
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
const statutColors: Record<StatutType, string> = {
A_JOUR: 'bg-emerald-50 text-emerald-700 border-emerald-200',
RETARD_LEGER: 'bg-yellow-50 text-yellow-700 border-yellow-200',
RETARD_SIGNIFICATIF: 'bg-orange-50 text-orange-700 border-orange-200',
RETARD_CRITIQUE: 'bg-red-50 text-red-700 border-red-200',
RETARD_PROLONGER: 'bg-red-100 text-red-800 border-red-300'
};
const statutLabels: Record<StatutType, string> = {
A_JOUR: 'À jour',
RETARD_LEGER: 'Retard léger',
RETARD_SIGNIFICATIF: 'Retard significatif',
RETARD_CRITIQUE: 'Retard critique',
RETARD_PROLONGER: 'Retard prolongé'
};
export default function MarchandsTable() {
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
const [itemsPerPage, setItemsPerPage] = useState(10);
const [selectedMarchand, setSelectedMarchand] = useState<Marchand | null>(null);
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
month: '2-digit',
year: 'numeric',
hour: '2-digit',
minute: '2-digit'
});
};
const getLastPaiement = (paiements: Paiement[]): string | null => {
if (!paiements || paiements.length === 0) return null;
return paiements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date;
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
      aValue = getLastPaiement(a.paiements) || '';
      bValue = getLastPaiement(b.paiements) || '';
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
const handleMarchandClick = (marchand: Marchand) => {
setSelectedMarchand(marchand);
};
const clearAllFilters = () => {
setStatutFilter('');
setMarcheeFilter('');
setHallFilter('');
setZoneFilter('');
setSearchTerm('');
};
const activeFiltersCount = [statutFilter, marcheeFilter, hallFilter, zoneFilter, searchTerm].filter(Boolean).length;
if (selectedMarchand) {
return <MarchandDetails marchand={selectedMarchand} onBack={() => setSelectedMarchand(null)} />;
}
return (
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
{/* Header */}
<div className="mb-8">
<h1 className="text-4xl font-bold text-slate-900 mb-2">Liste des Marchands</h1>
<p className="text-slate-600">Gérez et consultez tous les marchands actifs</p>
</div>
    {loading && (
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-4 text-slate-600 font-medium">Chargement des données...</p>
      </div>
    )}

    {error && (
      <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-red-800 font-semibold">Erreur : {error}</h3>
            <p className="text-red-700 text-sm mt-1">
              Assurez-vous que l'API est accessible à l'adresse : http://localhost:8080/api/contrat/contrats-actifs
            </p>
          </div>
        </div>
      </div>
    )}

    {!loading && !error && (
      <>
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom ou numéro CIN..."
                className="w-full pl-12 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Toggle Button */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors font-medium"
            >
              <Filter className="w-5 h-5" />
              Filtres avancés
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
                Réinitialiser tous les filtres
              </button>
            )}
          </div>

          {/* Filters Grid */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Statut</label>
                <select
                  value={statutFilter}
                  onChange={(e) => setStatutFilter(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="">Tous les statuts</option>
                  {uniqueValues.statuts.map(statut => (
                    <option key={statut} value={statut}>{statutLabels[statut]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Marché</label>
                <select
                  value={marcheeFilter}
                  onChange={(e) => setMarcheeFilter(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="">Tous les marchés</option>
                  {uniqueValues.marchees.map(marchee => (
                    <option key={marchee} value={marchee}>{marchee}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Hall</label>
                <select
                  value={hallFilter}
                  onChange={(e) => setHallFilter(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="">Tous les halls</option>
                  {uniqueValues.halls.map(hall => (
                    <option key={hall} value={hall}>{hall}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Zone</label>
                <select
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="">Toutes les zones</option>
                  {uniqueValues.zones.map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('nom')}
                      className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors"
                    >
                      Nom du Marchand
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('adresse')}
                      className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors"
                    >
                      Adresse
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('statut')}
                      className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors"
                    >
                      Statut
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('dernierPaiement')}
                      className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors"
                    >
                      Dernier Paiement
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.map((marchand) => (
                  <tr key={marchand.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{marchand.nom}</div>
                      <div className="text-sm text-slate-500">{marchand.activite}</div>
                    </td>
                    <td className="px-6 py-4">
                      {marchand.places.map((place, idx) => (
                        <div key={idx} className="text-sm text-slate-600 mb-1">
                          <span className="font-medium">{place.nom}</span>
                          {' / '}
                          {place.salleName}
                          {place.zoneName && (
                            <>
                              {' / '}
                              {place.zoneName}
                            </>
                          )}
                          {place.marcheeName && (
                            <>
                              {' / '}
                              <span className="text-blue-600 font-medium">{place.marcheeName}</span>
                            </>
                          )}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statutColors[marchand.statut]}`}>
                        {statutLabels[marchand.statut]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDateTime(getLastPaiement(marchand.paiements))}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleMarchandClick(marchand)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <Eye className="w-4 h-4" />
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAndSortedData.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">Aucun marchand trouvé avec ces filtres</p>
            </div>
          )}

          {/* Pagination */}
          {filteredAndSortedData.length > 0 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600 font-medium">
                  {filteredAndSortedData.length} marchand(s) trouvé(s)
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border-2 border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value={10}>10 par page</option>
                  <option value={25}>25 par page</option>
                  <option value={50}>50 par page</option>
                  <option value={100}>100 par page</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border-2 border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Précédent
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      if (totalPages <= 7) return true;
                      if (page === 1 || page === totalPages) return true;
                      if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                      return false;
                    })
                    .map((page, idx, arr) => (
                      <React.Fragment key={page}>
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="px-2 text-slate-400">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border-2 border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      </>
    )}
  </div>
</div>
);
}
function MarchandDetails({ marchand, onBack }: { marchand: Marchand; onBack: () => void }) {
const [paiements, setPaiements] = useState<Paiement[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [expandedPaiement, setExpandedPaiement] = useState<number | null>(null);
useEffect(() => {
const fetchPaiements = async () => {
try {
setLoading(true);
const response = await fetch(`${API_BASE_URL}/paiements/marchand/${marchand.id}`);
if (!response.ok) {
throw new Error('Erreur lors du chargement des paiements');
}
const result = await response.json();
setPaiements(result);
setError(null);
} catch (err) {
setError(err instanceof Error ? err.message : 'Une erreur est survenue');
} finally {
setLoading(false);
}
};
fetchPaiements();
}, [marchand.id]);
const formatDate = (dateString: string | null): string => {
if (!dateString) return 'N/A';
const date = new Date(dateString);
return date.toLocaleDateString('fr-FR', {
day: '2-digit',
month: '2-digit',
year: 'numeric'
});
};
const formatDateTime = (dateString: string | null): string => {
if (!dateString) return 'N/A';
const date = new Date(dateString);
return date.toLocaleDateString('fr-FR', {
day: '2-digit',
month: '2-digit',
year: 'numeric',
hour: '2-digit',
minute: '2-digit'
});
};
const formatMontant = (montant: number): string => {
return new Intl.NumberFormat('fr-MG', {
style: 'currency',
currency: 'MGA',
minimumFractionDigits: 0
}).format(montant);
};
const totalPaiements = paiements.reduce((sum, p) => sum + (p.montant || 0), 0);
const getFullAddress = (): string => {
if (marchand.places && marchand.places.length > 0) {
const place = marchand.places[0];
return `${place.nom}, ${place.salleName}${place.zoneName ? ', ' + place.zoneName : ''}${place.marcheeName ? ', ' + place.marcheeName : ''}`;
}
return 'Non renseignée';
};
const togglePaiement = (id: number) => {
setExpandedPaiement(expandedPaiement === id ? null : id);
};
return (
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
{/* Sticky Back Button */}
<div className="sticky top-17 z-50  backdrop-blur-lg border-b border-slate-200 shadow-sm">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
<button
         onClick={onBack}
         className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
       >
<ArrowLeft className="w-5 h-5" />
Retour à la liste
</button>
</div>
</div>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Header */}
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-slate-900 mb-2">Détails du Marchand</h1>
      <p className="text-slate-600">Consultez les informations et l'historique des paiements</p>
    </div>

    {/* Info Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-blue-500">
        <h3 className="text-sm font-semibold text-slate-500 mb-2">Nom du Marchand</h3>
        <p className="text-2xl font-bold text-slate-900">{marchand.nom}</p>
</div>
      <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-indigo-500">
        <h3 className="text-sm font-semibold text-slate-500 mb-2">Adresse</h3>
        <p className="text-lg font-semibold text-slate-900">{getFullAddress()}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-purple-500">
        <h3 className="text-sm font-semibold text-slate-500 mb-2">Activité</h3>
        <p className="text-lg font-semibold text-slate-900">{marchand.activite}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-emerald-500">
        <h3 className="text-sm font-semibold text-slate-500 mb-2">ID du Marchand</h3>
        <p className="text-lg font-bold text-slate-900">MAR-{marchand.id}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-orange-500">
        <h3 className="text-sm font-semibold text-slate-500 mb-2">Contact</h3>
        <p className="text-sm text-slate-700">{marchand.email || 'Non renseigné'}</p>
        {marchand.telephone && <p className="text-sm text-slate-700">{marchand.telephone}</p>}
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-pink-500">
        <h3 className="text-sm font-semibold text-slate-500 mb-2">Catégorie</h3>
        <p className="text-lg font-semibold text-slate-900">{marchand.places[0]?.categorieName || 'Non spécifiée'}</p>
      </div>
    </div>

    {/* Action Button */}
    <div className="mb-8">
      <button className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-2xl hover:from-emerald-700 hover:to-green-700 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
        Effectuer un Paiement
      </button>
    </div>

    {/* Payments History */}
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900">Historique des Paiements</h2>
        {paiements.length > 0 && (
          <p className="text-sm text-slate-600 mt-1">
            Total des paiements : <span className="font-bold text-emerald-600">{formatMontant(totalPaiements)}</span>
          </p>
        )}
      </div>

      {loading && (
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-slate-600 font-medium">Chargement des paiements...</p>
        </div>
      )}

      {error && (
        <div className="p-6">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-6">
            <p className="text-red-800 font-semibold">Erreur : {error}</p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {paiements.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-600 font-medium">Aucun paiement enregistré pour ce marchand</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {paiements.map((paiement) => (
                <div key={paiement.id} className="border-b border-slate-100 last:border-b-0">
                  <button
                    onClick={() => togglePaiement(paiement.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-slate-900">{paiement.motif}</p>
                        <p className="text-sm text-slate-500">{formatDateTime(paiement.datePaiement)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-xl font-bold text-emerald-600">{formatMontant(paiement.montant)}</p>
                      {expandedPaiement === paiement.id ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {expandedPaiement === paiement.id && (
                    <div className="px-6 pb-6 bg-slate-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <p className="text-xs font-semibold text-slate-500 mb-1">Référence :</p>
                          <p className="text-sm font-medium text-slate-900">{paiement.reference || `TXN-${paiement.id}`}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <p className="text-xs font-semibold text-slate-500 mb-1">Numéro reçu :</p>
                          <p className="text-sm font-medium text-slate-900">{paiement.recuNumero || 'N/A'}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <p className="text-xs font-semibold text-slate-500 mb-1">Date et Heure :</p>
                          <p className="text-sm font-medium text-slate-900">{formatDateTime(paiement.datePaiement)}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <p className="text-xs font-semibold text-slate-500 mb-1">Régisseur / Percepteur :</p>
                          <p className="text-sm font-medium text-slate-900">{paiement.nomAgent || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  </div>
</div>
);
}