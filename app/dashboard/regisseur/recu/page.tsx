'use client';
import React, { useState } from 'react';
import { Download, Database, CheckCircle, AlertCircle, RefreshCw, Loader2, Package, ChevronDown, ChevronUp } from 'lucide-react';
import API_BASE_URL from '@/services/APIbaseUrl';


// Types pour les données de synchronisation
interface SyncDataResponse {
  user: UserSyncData;
  marchees: MarcheeData[];
  zones: ZoneData[];
  halls: HallData[];
  places: PlaceData[];
  marchands: MarchandData[];
  paiements: PaiementData[];
  syncTimestamp: string;
}

interface UserSyncData {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  telephone: string;
}

interface MarcheeData {
  id: number;
  nom: string;
  description: string;
  adresse: string;
  codeUnique: string;
}

interface ZoneData {
  id: number;
  nom: string;
  description: string;
  codeUnique: string;
  marcheeId: number;
  marcheeName: string;
}

interface HallData {
  id: number;
  nom: string;
  numero: number;
  description: string;
  codeUnique: string;
  nbrPlace: number;
  marcheeId: number;
  zoneId: number;
}

interface PlaceData {
  id: number;
  numero: number;
  codeUnique: string;
  statut: string;
  tarifsJournalier: number;
  tarifsMensuel: number;
  hallId: number;
  zoneId: number;
  marcheeId: number;
  marchandId: number;
}

interface MarchandData {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  cin: string;
  email: string;
  adresse: string;
  numeroPatente: string;
  typeActivite: string;
  dateInscription: string;
}

interface PaiementData {
  id: number;
  numeroQuittance: string;
  montant: number;
  typePaiement: string;
  datePaiement: string;
  statut: string;
  marchandId: number;
  placeId: number;
  agentId: number;
  periodeDebut: string;
  periodeFin: string;
}

const SyncInitialPage: React.FC = () => {
  const [syncData, setSyncData] = useState<SyncDataResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const fetchSyncData = async () => {
    setLoading(true);
    setError(null);
    setSyncData(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/public/sync/initial`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('Données reçues:', result);
      setSyncData(result.data);
      
    } catch (err) {
      console.error('Erreur de récupération:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const isExpanded = (section: string) => expandedSections.has(section);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Visualisation des Données de Synchronisation
              </h1>
              <p className="text-gray-600">
                Consultez toutes les données disponibles pour votre compte
              </p>
            </div>
            <Database className="w-16 h-16 text-blue-600" />
          </div>

          {/* Bouton de chargement */}
          <div className="flex justify-center">
            <button
              onClick={fetchSyncData}
              disabled={loading}
              className={`flex items-center space-x-3 px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Chargement en cours...</span>
                </>
              ) : (
                <>
                  <Download className="w-6 h-6" />
                  <span>Charger les données</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="flex items-start space-x-4">
              <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Erreur lors du chargement
                </h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Statistiques et Données */}
        {syncData && (
          <>
            {/* Informations Utilisateur */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">👤 Votre Profil</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Nom complet</span>
                  <p className="font-semibold text-gray-900">{syncData.user.prenom} {syncData.user.nom}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Email</span>
                  <p className="font-semibold text-gray-900">{syncData.user.email}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Rôle</span>
                  <p className="font-semibold text-gray-900">{syncData.user.role}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Téléphone</span>
                  <p className="font-semibold text-gray-900">{syncData.user.telephone || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Date de sync</span>
                  <p className="font-semibold text-gray-900">
                    {new Date(syncData.syncTimestamp).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                <div className="text-3xl font-bold">{syncData.marchees.length}</div>
                <div className="text-sm opacity-90">Marchés</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
                <div className="text-3xl font-bold">{syncData.zones.length}</div>
                <div className="text-sm opacity-90">Zones</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                <div className="text-3xl font-bold">{syncData.halls.length}</div>
                <div className="text-sm opacity-90">Halls</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white">
                <div className="text-3xl font-bold">{syncData.places.length}</div>
                <div className="text-sm opacity-90">Places</div>
              </div>
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-4 text-white">
                <div className="text-3xl font-bold">{syncData.marchands.length}</div>
                <div className="text-sm opacity-90">Marchands</div>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-4 text-white">
                <div className="text-3xl font-bold">{syncData.paiements.length}</div>
                <div className="text-sm opacity-90">Paiements</div>
              </div>
            </div>

            {/* Section Marchés */}
            <div className="bg-white rounded-lg shadow-lg mb-4">
              <button
                onClick={() => toggleSection('marchees')}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-gray-900">Marchés</h3>
                    <p className="text-sm text-gray-500">{syncData.marchees.length} éléments</p>
                  </div>
                </div>
                {isExpanded('marchees') ? (
                  <ChevronUp className="w-6 h-6 text-gray-400" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-400" />
                )}
              </button>
              {isExpanded('marchees') && (
                <div className="px-6 pb-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adresse</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {syncData.marchees.map(marchee => (
                          <tr key={marchee.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{marchee.id}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{marchee.nom}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{marchee.codeUnique}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{marchee.adresse}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Section Zones */}
            <div className="bg-white rounded-lg shadow-lg mb-4">
              <button
                onClick={() => toggleSection('zones')}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-gray-900">Zones</h3>
                    <p className="text-sm text-gray-500">{syncData.zones.length} éléments</p>
                  </div>
                </div>
                {isExpanded('zones') ? (
                  <ChevronUp className="w-6 h-6 text-gray-400" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-400" />
                )}
              </button>
              {isExpanded('zones') && (
                <div className="px-6 pb-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marché</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {syncData.zones.map(zone => (
                          <tr key={zone.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{zone.id}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{zone.nom}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{zone.codeUnique}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{zone.marcheeName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Section Halls */}
            <div className="bg-white rounded-lg shadow-lg mb-4">
              <button
                onClick={() => toggleSection('halls')}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-gray-900">Halls</h3>
                    <p className="text-sm text-gray-500">{syncData.halls.length} éléments</p>
                  </div>
                </div>
                {isExpanded('halls') ? (
                  <ChevronUp className="w-6 h-6 text-gray-400" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-400" />
                )}
              </button>
              {isExpanded('halls') && (
                <div className="px-6 pb-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Places</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {syncData.halls.map(hall => (
                          <tr key={hall.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{hall.id}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{hall.nom}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{hall.numero}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{hall.codeUnique}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{hall.nbrPlace}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Section Places */}
            <div className="bg-white rounded-lg shadow-lg mb-4">
              <button
                onClick={() => toggleSection('places')}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-gray-900">Places</h3>
                    <p className="text-sm text-gray-500">{syncData.places.length} éléments</p>
                  </div>
                </div>
                {isExpanded('places') ? (
                  <ChevronUp className="w-6 h-6 text-gray-400" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-400" />
                )}
              </button>
              {isExpanded('places') && (
                <div className="px-6 pb-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">N°</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tarif J.</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tarif M.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {syncData.places.map(place => (
                          <tr key={place.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-900">{place.id}</td>
                            <td className="px-3 py-2 font-medium text-gray-900">{place.numero}</td>
                            <td className="px-3 py-2 text-gray-600">{place.codeUnique}</td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                place.statut === 'OCCUPEE' ? 'bg-red-100 text-red-800' :
                                place.statut === 'LIBRE' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {place.statut}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-gray-600">{place.tarifsJournalier} Ar</td>
                            <td className="px-3 py-2 text-gray-600">{place.tarifsMensuel} Ar</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Section Marchands */}
            <div className="bg-white rounded-lg shadow-lg mb-4">
              <button
                onClick={() => toggleSection('marchands')}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-pink-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-gray-900">Marchands</h3>
                    <p className="text-sm text-gray-500">{syncData.marchands.length} éléments</p>
                  </div>
                </div>
                {isExpanded('marchands') ? (
                  <ChevronUp className="w-6 h-6 text-gray-400" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-400" />
                )}
              </button>
              {isExpanded('marchands') && (
                <div className="px-6 pb-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">CIN</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type Activité</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {syncData.marchands.map(marchand => (
                          <tr key={marchand.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-900">{marchand.id}</td>
                            <td className="px-3 py-2 font-medium text-gray-900">{marchand.prenom} {marchand.nom}</td>
                            <td className="px-3 py-2 text-gray-600">{marchand.cin}</td>
                            <td className="px-3 py-2 text-gray-600">{marchand.telephone}</td>
                            <td className="px-3 py-2 text-gray-600">{marchand.typeActivite}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Section Paiements */}
            <div className="bg-white rounded-lg shadow-lg mb-4">
              <button
                onClick={() => toggleSection('paiements')}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-gray-900">Paiements</h3>
                    <p className="text-sm text-gray-500">{syncData.paiements.length} éléments</p>
                  </div>
                </div>
                {isExpanded('paiements') ? (
                  <ChevronUp className="w-6 h-6 text-gray-400" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-400" />
                )}
              </button>
              {isExpanded('paiements') && (
                <div className="px-6 pb-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quittance</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {syncData.paiements.map(paiement => (
                          <tr key={paiement.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium text-gray-900">{paiement.numeroQuittance}</td>
                            <td className="px-3 py-2 text-gray-900 font-semibold">{paiement.montant} Ar</td>
                            <td className="px-3 py-2 text-gray-600">{paiement.typePaiement}</td>
                            <td className="px-3 py-2 text-gray-600">
                              {new Date(paiement.datePaiement).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                paiement.statut === 'VALIDE' ? 'bg-green-100 text-green-800' :
                                paiement.statut === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {paiement.statut}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* JSON brut (pour debug) */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Données JSON brutes</h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-xs">
                {JSON.stringify(syncData, null, 2)}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
export default SyncInitialPage;