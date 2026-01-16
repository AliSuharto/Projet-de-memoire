'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Calendar, Filter, Download, AlertCircle, Loader2 } from 'lucide-react';
import API_BASE_URL from '@/services/APIbaseUrl';

interface Receipt {
  nom: string;
  disponibilite:  'Utilisé' | 'Disponible';
  dateUtilisation?: string;
  marchand?: string;
  montant?: string;
}

const ReceiptManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'Tous' | 'Utilisé' | 'Disponible'>('Tous');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour décoder le JWT et extraire le userId
  const getUserIdFromToken = (): string | null => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return null;
      }
      
      // Décoder le JWT (partie payload)
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
        console.log('Données des quittances reçues:', data);
        
        // Transformer les données de l'API selon la structure attendue
        // Adapter selon la structure réelle de votre API
        const transformedData: Receipt[] = data.map((item: any) => ({
            nom: String(item.nom || item.nom || item.id || "").trim(),
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

  const filteredReceipts = useMemo(() => {
    return receipts.filter(receipt => {
      const matchesSearch = receipt.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           receipt.marchand?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'Tous' || receipt.disponibilite === filterStatus;
      
      let matchesDate = true;
      if (dateDebut && receipt.dateUtilisation) {
        matchesDate = receipt.dateUtilisation >= dateDebut;
      }
      if (dateFin && receipt.dateUtilisation) {
        matchesDate = matchesDate && receipt.dateUtilisation <= dateFin;
      }
      
      return matchesSearch && matchesFilter && matchesDate;
    });
  }, [receipts, searchTerm, filterStatus, dateDebut, dateFin]);

  const stats = useMemo(() => {
    const total = receipts.length;
    const utilise = receipts.filter(r => r.disponibilite === 'Utilisé').length;
    const disponible = receipts.filter(r => r.disponibilite === 'Disponible').length;
    
    const filteredUtilise = filteredReceipts.filter(r => r.disponibilite === 'Utilisé').length;
    const filteredDisponible = filteredReceipts.filter(r => r.disponibilite === 'Disponible').length;
    
    return { 
      total, 
      utilise, 
      disponible,
      filteredTotal: filteredReceipts.length,
      filteredUtilise,
      filteredDisponible
    };
  }, [receipts, filteredReceipts]);

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('Tous');
    setDateDebut('');
    setDateFin('');
  };

  // Affichage du chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Chargement des quittances...</p>
        </div>
      </div>
    );
  }

  // Affichage de l'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Erreur</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestion des Quittances</h1>
          <p className="text-gray-600">Suivi et gestion des numéros de reçu</p>
        </div>

        {/* Statistiques compactes */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Utilisés</p>
              <p className="text-2xl font-bold text-green-600">{stats.utilise}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Disponibles</p>
              <p className="text-2xl font-bold text-blue-600">{stats.disponible}</p>
            </div>
            
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par numéro ou marchand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <Filter className="w-5 h-5" />
              Filtres
            </button>
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  >
                    <option value="Tous">Tous</option>
                    <option value="Utilisé">Utilisé</option>
                    <option value="Disponible">Disponible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date début
                  </label>
                  <input
                    type="date"
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date fin
                  </label>
                  <input
                    type="date"
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Résultats filtrés */}
        {(searchTerm || filterStatus !== 'Tous' || dateDebut || dateFin) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">{stats.filteredTotal}</span> résultat(s) trouvé(s) • 
              <span className="ml-2 font-semibold">{stats.filteredUtilise}</span> utilisé(s) • 
              <span className="ml-2 font-semibold">{stats.filteredDisponible}</span> disponible(s)
            </p>
          </div>
        )}

        {/* Tableau */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Numéro de Reçu
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Disponibilité
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date Utilisation
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Marchand
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Montant
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReceipts.map((receipt, index) => (
                  <tr 
                    key={receipt.nom}
                    className={`hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-800">{receipt.nom}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        receipt.disponibilite === 'Utilisé'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
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
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {receipt.marchand || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-800">
                      {receipt.montant || <span className="text-gray-400">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredReceipts.length === 0 && (
            <div className="py-12 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-lg">Aucun reçu trouvé</p>
              <p className="text-gray-400 text-sm mt-1">Essayez de modifier vos critères de recherche</p>
            </div>
          )}
        </div>

        {/* Pied de page avec actions */}
        {filteredReceipts.length > 0 && (
          <div className="mt-6 flex justify-between items-center bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-600">
              Affichage de <span className="font-semibold">{filteredReceipts.length}</span> sur <span className="font-semibold">{receipts.length}</span> reçu(s)
            </p>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              <Download className="w-4 h-4" />
              Exporter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptManager;