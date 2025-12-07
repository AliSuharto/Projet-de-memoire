'use client';
import React, { useState, useEffect } from 'react';
import { Search, X, Calendar, User, DollarSign, FileText, Receipt, Store, MapPin, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';

// Types
interface UserSummaryDTO {
  id: number;
  nom: string;
  prenom: string;
}

interface PaiementDTO {
  id: number;
  montant: number;
  datePaiement: string;
  typePaiement: string;
  motif?: string;
  modePaiement?: string;
  moisdePaiement?: string;
  nomMarchands?: string;
  idMarchand?: number;
  idAgent?: number;
  nomAgent?: string;
  idPlace?: number;
  nomPlace?: string;
  sessionId?: number;
  recuNumero?: string;
  quittanceId?: number;
  dernierePaiement?: string;
}

interface SessionDTO {
  id: number;
  nomSession: string;
  user: UserSummaryDTO;
  type: string;
  dateSession: string;
  status: 'OUVERTE' | 'FERMEE' | 'EN_VALIDATION' | 'VALIDEE' | 'REJETEE';
  montantCollecte: number;
  isValid: boolean;
  paiements?: PaiementDTO[];
  notes?: string;
}

const SessionListPage: React.FC = () => {
  const [sessions, setSessions] = useState<SessionDTO[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<SessionDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedSession, setSelectedSession] = useState<SessionDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const getUserIdFromToken = (): number | null => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      
      return decodedPayload.userId || decodedPayload.id || decodedPayload.sub;
    } catch (err) {
      console.error('Error decoding token:', err);
      return null;
    }
  };

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const userId = getUserIdFromToken();
        
        if (!userId) throw new Error('User ID not found in token');

        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/api/sessions/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to fetch sessions');

        const data: SessionDTO[] = await response.json();
        console.log('Fetched sessions:', data);
        setSessions(data);
        setFilteredSessions(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  useEffect(() => {
    let filtered = sessions;

    if (selectedStatus !== 'All') {
      filtered = filtered.filter(session => session.status === selectedStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(session =>
        session.nomSession.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${session.user.prenom} ${session.user.nom}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSessions(filtered);
  }, [searchTerm, selectedStatus, sessions]);

  const getStatusConfig = (status: SessionDTO['status']) => {
    const configs = {
      'VALIDEE': { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle, label: 'Validée' },
      'REJETEE': { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Rejetée' },
      'OUVERTE': { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock, label: 'Ouverte' },
      'EN_VALIDATION': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock, label: 'En Validation' },
      'FERMEE': { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: XCircle, label: 'Fermée' }
    };
    return configs[status];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const calculateStats = () => {
    const total = sessions.length;
    const validees = sessions.filter(s => s.status === 'VALIDEE').length;
    const ouvertes = sessions.filter(s => s.status === 'OUVERTE').length;
    const montantTotal = sessions.reduce((sum, s) => sum + s.montantCollecte, 0);

    return { total, validees, ouvertes, montantTotal };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Chargement des sessions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="bg-white border-2 border-red-200 rounded-xl p-8 max-w-md shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
            <h3 className="text-red-800 font-bold text-xl">Erreur</h3>
          </div>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-6 py-5">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mes Sessions</h1>
          <p className="text-gray-600">Gérez et consultez vos sessions de collecte</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Sessions</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <FileText className="w-10 h-10 text-blue-500 opacity-80" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Validées</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.validees}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Ouvertes</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.ouvertes}</p>
              </div>
              <Clock className="w-10 h-10 text-blue-500 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-100 font-medium">Montant Total</p>
                <p className="text-2xl font-bold text-white mt-1">{formatAmount(stats.montantTotal)}</p>
              </div>
              <DollarSign className="w-10 h-10 text-white opacity-90" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une session ou un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filtres
            </button>

            <div className={`${showFilters ? 'flex' : 'hidden'} lg:flex flex-wrap gap-2`}>
              {['All', 'OUVERTE', 'FERMEE', 'EN_VALIDATION', 'VALIDEE', 'REJETEE'].map(status => {
                const config = status !== 'All' ? getStatusConfig(status as SessionDTO['status']) : null;
                return (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                      selectedStatus === status
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'All' ? 'Toutes' : config?.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sessions List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredSessions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Aucune session trouvée</p>
              </div>
            ) : (
              filteredSessions.map((session) => {
                const statusConfig = getStatusConfig(session.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 transform hover:scale-[1.02] ${
                      selectedSession?.id === session.id 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-100 hover:border-blue-200'
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{session.nomSession}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span>{session.user.prenom} {session.user.nom}</span>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border ${statusConfig.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          {statusConfig.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Date</p>
                            <p className="text-sm font-medium text-gray-900">{formatShortDate(session.dateSession)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Montant</p>
                            <p className="text-sm font-bold text-blue-600">{formatAmount(session.montantCollecte)}</p>
                          </div>
                        </div>
                      </div>

                      {session.paiements && session.paiements.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Receipt className="w-4 h-4" />
                            <span>{session.paiements.length} paiement{session.paiements.length > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Session Details Panel */}
          <div className="lg:col-span-1">
            {selectedSession ? (
              <div className="bg-white rounded-xl shadow-lg sticky top-6 border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Détails</h2>
                    <button
                      onClick={() => setSelectedSession(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Session</label>
                    <p className="text-lg font-bold text-gray-900 mt-1">{selectedSession.nomSession}</p>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Type</label>
                    <p className="text-base text-gray-900 mt-1">{selectedSession.type}</p>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Statut</label>
                    <div className="mt-2">
                      {(() => {
                        const config = getStatusConfig(selectedSession.status);
                        const StatusIcon = config.icon;
                        return (
                          <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg font-semibold border ${config.color}`}>
                            <StatusIcon className="w-5 h-5" />
                            {config.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                    <label className="text-xs uppercase tracking-wider text-blue-700 font-semibold">Montant Collecté</label>
                    <p className="text-3xl font-bold text-blue-700 mt-2">{formatAmount(selectedSession.montantCollecte)}</p>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Date de Session</label>
                    <p className="text-base text-gray-900 mt-1">{formatDate(selectedSession.dateSession)}</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3 block">Créé par</label>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {selectedSession.user.prenom.charAt(0)}{selectedSession.user.nom.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{selectedSession.user.prenom} {selectedSession.user.nom}</p>
                        <p className="text-sm text-gray-500">ID: {selectedSession.user.id}</p>
                      </div>
                    </div>
                  </div>

                  {selectedSession.notes && (
                    <div>
                      <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Notes</label>
                      <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-gray-800 text-sm leading-relaxed">{selectedSession.notes}</p>
                      </div>
                    </div>
                  )}

                  {selectedSession.paiements && selectedSession.paiements.length > 0 && (
                    <div>
                      <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3 block">
                        Paiements ({selectedSession.paiements.length})
                      </label>
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {selectedSession.paiements.map((paiement) => (
                          <div key={paiement.id} className="bg-white border-2 border-gray-100 rounded-lg p-4 hover:border-blue-200 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-xl font-bold text-gray-900">{formatAmount(paiement.montant)}</span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                {paiement.typePaiement}
                              </span>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              {paiement.nomMarchands && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Store className="w-4 h-4" />
                                  <span>{paiement.nomMarchands}</span>
                                </div>
                              )}
                              
                              {paiement.nomPlace && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <MapPin className="w-4 h-4" />
                                  <span>{paiement.nomPlace}</span>
                                </div>
                              )}
                              
                              {paiement.nomAgent && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <User className="w-4 h-4" />
                                  <span>{paiement.nomAgent}</span>
                                </div>
                              )}
                              
                              {paiement.datePaiement && (
                                <div className="flex items-center gap-2 text-gray-500 text-xs pt-2 border-t border-gray-100">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>{formatDate(paiement.datePaiement)}</span>
                                </div>
                              )}
                              
                              {paiement.recuNumero && (
                                <div className="flex items-center gap-2 text-gray-500 text-xs">
                                  <Receipt className="w-3.5 h-3.5" />
                                  <span>Reçu: {paiement.recuNumero}</span>
                                </div>
                              )}

                              {paiement.motif && (
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                  <p className="text-xs text-gray-600 italic">{paiement.motif}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100 sticky top-6">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Sélectionnez une session pour voir les détails</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionListPage;