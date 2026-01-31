'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Calendar, Download, AlertCircle, Loader2, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import API_BASE_URL from '@/services/APIbaseUrl';

interface Receipt {
  nom: string;
  disponibilite: 'Utilisé' | 'Disponible';
  dateUtilisation?: string;
  marchand?: string;
  montant?: string;
}

type SortOrder = 'asc' | 'desc' | null;

const ReceiptManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fonction pour décoder le JWT et extraire le userId
  const getUserIdFromToken = (): string | null => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const payload = JSON.parse(jsonPayload);
      return payload.userId || payload.id || payload.sub || null;
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return null;
    }
  };

  // Charger les quittances depuis l'API
  useEffect(() => {
    const fetchQuittances = async () => {
      setLoading(true);
      setError(null);

      try {
        const userId = getUserIdFromToken();
        if (!userId) {
          setError('Token non trouvé ou invalide. Veuillez vous reconnecter.');
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/public/quittances/percepteur/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        const transformedData: Receipt[] = data.map((item: any) => ({
          nom: String(item.nom || item.id || "").trim(),
          disponibilite: item.status === 'UTILISE' ? 'Utilisé' : 'Disponible',
          dateUtilisation: item.dateUtilisation || item.date || "",
          marchand: item.nomMarchand || item.client || item.nomClient || "",
          montant: item.montant ? `${item.montant.toLocaleString()} Ar` : item.montantFormate || ""
        }));

        setReceipts(transformedData);
      } catch (err) {
        console.error('Erreur lors du chargement des quittances:', err);
        setError('Impossible de charger les quittances. Vérifiez votre connexion.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuittances();
  }, []);

  // Fonction pour trier les reçus selon le format 100A, 100B, ..., 101A, ...
  const sortReceipts = (receipts: Receipt[]) => {
    return [...receipts].sort((a, b) => {
      const matchA = a.nom.match(/^(\d+)([A-E]?)$/i);
      const matchB = b.nom.match(/^(\d+)([A-E]?)$/i);

      if (!matchA || !matchB) {
        return a.nom.localeCompare(b.nom);
      }

      const numA = parseInt(matchA[1]);
      const numB = parseInt(matchB[1]);
      const letterA = matchA[2]?.toUpperCase() || '';
      const letterB = matchB[2]?.toUpperCase() || '';

      if (numA !== numB) {
        return numA - numB;
      }

      return letterA.localeCompare(letterB);
    });
  };

  // Fonction pour gérer le tri par disponibilité
  const handleSortByDisponibilite = () => {
    if (sortOrder === null) {
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortOrder(null);
    }
  };

  const filteredReceipts = useMemo(() => {
    const filtered = receipts.filter(receipt => {
      const matchesSearch = receipt.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.marchand?.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesDate = true;
      if (dateDebut && receipt.dateUtilisation) {
        matchesDate = receipt.dateUtilisation >= dateDebut;
      }
      if (dateFin && receipt.dateUtilisation) {
        matchesDate = matchesDate && receipt.dateUtilisation <= dateFin;
      }

      return matchesSearch && matchesDate;
    });

    let sorted = sortReceipts(filtered);

    // Appliquer le tri par disponibilité si activé
    if (sortOrder) {
      sorted = [...sorted].sort((a, b) => {
        const valueA = a.disponibilite === 'Disponible' ? 1 : 0;
        const valueB = b.disponibilite === 'Disponible' ? 1 : 0;
        
        if (sortOrder === 'asc') {
          return valueA - valueB;
        } else {
          return valueB - valueA;
        }
      });
    }

    return sorted;
  }, [receipts, searchTerm, dateDebut, dateFin, sortOrder]);

  // Calculs de pagination
  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReceipts = filteredReceipts.slice(startIndex, endIndex);

  // Réinitialiser à la page 1 quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateDebut, dateFin, sortOrder]);

  const stats = useMemo(() => {
    const total = receipts.length;
    const utilise = receipts.filter(r => r.disponibilite === 'Utilisé').length;
    const disponible = receipts.filter(r => r.disponibilite === 'Disponible').length;
    return { total, utilise, disponible };
  }, [receipts]);

  const resetFilters = () => {
    setSearchTerm('');
    setDateDebut('');
    setDateFin('');
    setSortOrder(null);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Chargement des quittances...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-800">Erreur</h2>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8 pt-20 md:pt-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="sticky top-0 z-30 bg-gray-50 pb-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mes quittances</h1>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
            <div className="text-sm text-gray-600 font-medium mb-1">Total</div>
            <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500">
            <div className="text-sm text-gray-600 font-medium mb-1">Disponibles</div>
            <div className="text-3xl font-bold text-gray-800">{stats.disponible}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-500">
            <div className="text-sm text-gray-600 font-medium mb-1">Utilisés</div>
            <div className="text-3xl font-bold text-gray-800">{stats.utilise}</div>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par numéro ou marchand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  placeholder="Date début"
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                />
              </div>
              
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  placeholder="Date fin"
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {(dateDebut || dateFin || sortOrder !== null) && (
            <button
              onClick={resetFilters}
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Numéro de Reçu
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={handleSortByDisponibilite}
                      className="flex items-center gap-2 hover:bg-blue-700 px-2 py-1 rounded transition-colors"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        Disponibilité
                      </span>
                      {sortOrder === null && <ArrowUpDown className="w-4 h-4" />}
                      {sortOrder === 'asc' && <ArrowUp className="w-4 h-4" />}
                      {sortOrder === 'desc' && <ArrowDown className="w-4 h-4" />}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Date Utilisation
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Marchand
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Montant
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentReceipts.map((receipt, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-800">{receipt.nom}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          receipt.disponibilite === 'Disponible'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {receipt.disponibilite}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {receipt.dateUtilisation ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(receipt.dateUtilisation).toLocaleDateString('fr-FR')}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {receipt.marchand || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      {receipt.montant || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {currentReceipts.length === 0 && (
              <div className="text-center py-16">
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucune quittance trouvée</h3>
                <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredReceipts.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Affichage de <span className="font-semibold">{startIndex + 1}</span> à{' '}
                  <span className="font-semibold">{Math.min(endIndex, filteredReceipts.length)}</span> sur{' '}
                  <span className="font-semibold">{filteredReceipts.length}</span> résultat(s)
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  >
                    <option value={5}>5 par page</option>
                    <option value={10}>10 par page</option>
                    <option value={20}>20 par page</option>
                    <option value={50}>50 par page</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="px-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptManager;