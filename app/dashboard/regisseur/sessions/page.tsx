'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Calendar, User, DollarSign, FileText, Receipt, 
  CheckCircle, XCircle, Clock, Filter, Eye, 
  ChevronLeft, ChevronRight, ArrowUp 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import API_BASE_URL from '@/services/APIbaseUrl';

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
  ActiviteMarchands?: string;
  nomPlaceComplet?: string;
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

const ITEMS_PER_PAGE = 10;

const SessionListPage: React.FC = () => {
  const [sessions, setSessions] = useState<SessionDTO[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<SessionDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Bouton retour en haut
  const [showScrollTop, setShowScrollTop] = useState(false);

  const router = useRouter();

  const getUserIdFromToken = (): number | null => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.id || payload.sub || null;
    } catch {
      return null;
    }
  };

  // Scroll detection pour le bouton flottant
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseSession = async (sessionId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir fermer cette session ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/close`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Échec de la fermeture de la session');

      // Mettre à jour la liste des sessions
      setSessions(prevSessions => 
        prevSessions.map(s => 
          s.id === sessionId ? { ...s, status: 'FERMEE' } : s
        )
      );

      alert('Session fermée avec succès !');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Une erreur est survenue lors de la fermeture');
    }
  };

  // Fetch sessions + tri par date décroissante
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const userId = getUserIdFromToken();
        if (!userId) throw new Error('Utilisateur non identifié');

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/sessions/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Échec du chargement des sessions');

        let data: SessionDTO[] = await response.json();

        // Tri : plus récent en premier
        data.sort((a, b) => 
          new Date(b.dateSession).getTime() - new Date(a.dateSession).getTime()
        );

        setSessions(data);
        setFilteredSessions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // Filtrage
  useEffect(() => {
    let filtered = [...sessions];

    if (selectedStatus !== 'All') {
      filtered = filtered.filter(s => s.status === selectedStatus);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.nomSession.toLowerCase().includes(term) ||
        `${s.user.prenom} ${s.user.nom}`.toLowerCase().includes(term)
      );
    }

    setFilteredSessions(filtered);
    setCurrentPage(1); // reset page
  }, [searchTerm, selectedStatus, sessions]);

  // Pagination
  const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE);

  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSessions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSessions, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      // Remonte en haut après changement de page
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 150);
    }
  };

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

  const stats = useMemo(() => {
    const total = sessions.length;
    const validees = sessions.filter(s => s.status === 'VALIDEE').length;
    const ouvertes = sessions.filter(s => s.status === 'OUVERTE').length;
    const montantTotal = sessions.reduce((sum, s) => sum + s.montantCollecte, 0);
    return { total, validees, ouvertes, montantTotal };
  }, [sessions]);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
      <div className="max-w-6xl mx-auto px-6 py-5">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mes Sessions</h1>
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

        {/* Sessions List */}
        <div className="space-y-4">
          {paginatedSessions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucune session trouvée</p>
            </div>
          ) : (
            paginatedSessions.map((session) => {
              const statusConfig = getStatusConfig(session.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div
                  key={session.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border-2 border-gray-100 hover:border-blue-300"
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

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 mb-4">
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

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Receipt className="w-4 h-4" />
                        <span>{session.paiements?.length || 0} paiement{(session.paiements?.length || 0) > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.status === 'OUVERTE' && (
                          <button
                            onClick={() => handleCloseSession(session.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-sm"
                          >
                            <XCircle className="w-4 h-4" />
                            Fermer
                          </button>
                        )}
                        <button
                          onClick={() => {
                            sessionStorage.setItem('selectedSession', JSON.stringify(session));
                            router.push(`/dashboard/regisseur/sessions/${session.id}`);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Voir détails
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Affichage {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredSessions.length)} sur {filteredSessions.length}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                    currentPage === page
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bouton flottant Retour en haut */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
          aria-label="Retour en haut"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default SessionListPage;