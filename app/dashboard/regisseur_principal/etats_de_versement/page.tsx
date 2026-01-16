'use client';
import React, { useState, useEffect } from 'react';
import { Search, X, Calendar, User, DollarSign, FileText, Receipt, Store, MapPin, CheckCircle, XCircle, Clock, Filter, ArrowLeft, Eye, CalendarRange } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [dateFilter, setDateFilter] = useState<'today' | 'custom' | 'all'>('today');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_BASE_URL}/sessions`, {
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
        `${session.user.prenom} ${session.user.nom}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filtering
    if (dateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.dateSession);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === today.getTime();
      });
    } else if (dateFilter === 'custom' && startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.dateSession);
        return sessionDate >= start && sessionDate <= end;
      });
    }

    setFilteredSessions(filtered);
  }, [searchTerm, selectedStatus, sessions, dateFilter, startDate, endDate]);

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
      currency: 'MGA',
    }).format(amount).replace('MGA', 'Ar');
  };

  const calculateStats = () => {
    const total = filteredSessions.length;
    const validees = filteredSessions.filter(s => s.status === 'VALIDEE').length;
    const en_validation = filteredSessions.filter(s => s.status === 'EN_VALIDATION').length;
    const montantTotal = filteredSessions.reduce((sum, s) => sum + s.montantCollecte, 0);

    return { total, validees, en_validation, montantTotal };
  };

  const handleViewSession = (session: SessionDTO) => {
    setSelectedSession(session);
    setViewMode('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedSession(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Detail View
  if (viewMode === 'detail' && selectedSession) {
    const statusConfig = getStatusConfig(selectedSession.status);
    const StatusIcon = statusConfig.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Back Button */}
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Retour aux sessions</span>
          </button>

          {/* Header Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">{selectedSession.nomSession}</h1>
                <div className="flex items-center gap-4">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold border ${statusConfig.color}`}>
                    <StatusIcon className="w-5 h-5" />
                    {statusConfig.label}
                  </span>
                  <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium">
                    {selectedSession.type}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-2">Montant Total</p>
                <p className="text-4xl font-bold text-blue-600">{formatAmount(selectedSession.montantCollecte)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {selectedSession.user.prenom.charAt(0)}{selectedSession.user.nom.charAt(0)}
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Créé par</p>
                  <p className="font-bold text-gray-900">{selectedSession.user.prenom} {selectedSession.user.nom}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Date de Session</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <p className="font-medium text-gray-900">{formatDate(selectedSession.dateSession)}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">ID Session</p>
                <p className="font-mono font-medium text-gray-900">#{selectedSession.id}</p>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {selectedSession.notes && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-yellow-600" />
                Notes
              </h3>
              <p className="text-gray-800 leading-relaxed">{selectedSession.notes}</p>
            </div>
          )}

          {/* Payments Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Receipt className="w-7 h-7 text-blue-600" />
                Paiements
              </h2>
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-bold">
                {selectedSession.paiements?.length || 0} paiement{(selectedSession.paiements?.length || 0) > 1 ? 's' : ''}
              </span>
            </div>

            {selectedSession.paiements && selectedSession.paiements.length > 0 ? (
              <div className="space-y-4">
                {selectedSession.paiements.map((paiement, index) => (
                  <div key={paiement.id} className="bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-gray-900">{formatAmount(paiement.montant)}</p>
                          <p className="text-sm text-gray-500 mt-1">ID: #{paiement.id}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-lg">
                        {paiement.typePaiement}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {paiement.nomMarchands && (
                        <div className="flex items-center gap-3 text-gray-700">
                          <Store className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Marchand</p>
                            <p className="font-medium">{paiement.nomMarchands}</p>
                          </div>
                        </div>
                      )}

                      {paiement.nomPlace && (
                        <div className="flex items-center gap-3 text-gray-700">
                          <MapPin className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Place</p>
                            <p className="font-medium">{paiement.nomPlace}</p>
                          </div>
                        </div>
                      )}

                      {paiement.nomAgent && (
                        <div className="flex items-center gap-3 text-gray-700">
                          <User className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Agent</p>
                            <p className="font-medium">{paiement.nomAgent}</p>
                          </div>
                        </div>
                      )}

                      {paiement.datePaiement && (
                        <div className="flex items-center gap-3 text-gray-700">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Date</p>
                            <p className="font-medium">{formatShortDate(paiement.datePaiement)}</p>
                          </div>
                        </div>
                      )}

                      {paiement.recuNumero && (
                        <div className="flex items-center gap-3 text-gray-700">
                          <Receipt className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">N° Reçu</p>
                            <p className="font-medium font-mono">{paiement.recuNumero}</p>
                          </div>
                        </div>
                      )}

                      {paiement.modePaiement && (
                        <div className="flex items-center gap-3 text-gray-700">
                          <DollarSign className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Mode de Paiement</p>
                            <p className="font-medium">{paiement.modePaiement}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {paiement.motif && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Motif</p>
                        <p className="text-gray-700 italic">{paiement.motif}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Aucun paiement pour cette session</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Toutes les Sessions</h1>
          <p className="text-gray-600">Gérez et consultez toutes les sessions de collecte</p>
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
                <p className="text-sm text-gray-600 font-medium">En validation</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.en_validation}</p>
              </div>
              <Clock className="w-10 h-10 text-blue-500 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-100 font-medium">
                  {dateFilter === 'today' 
                    ? "Aujourd'hui" 
                    : dateFilter === 'custom' && startDate && endDate
                    ? `Du ${new Date(startDate).toLocaleDateString('fr-FR')} au ${new Date(endDate).toLocaleDateString('fr-FR')}`
                    : 'Montant Total'}
                </p>
                <p className="text-2xl font-bold text-white mt-1">{formatAmount(stats.montantTotal)}</p>
              </div>
              <DollarSign className="w-10 h-10 text-white opacity-90" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom de l'agent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Date Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setDateFilter('today')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    dateFilter === 'today'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                 Aujourd'hui
                </button>
                <button
                  onClick={() => setDateFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    dateFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Toutes les dates
                </button>
                <button
                  onClick={() => setDateFilter('custom')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    dateFilter === 'custom'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <CalendarRange className="w-4 h-4" />
                  Période personnalisée
                </button>
              </div>

              {/* Custom Date Range */}
              {dateFilter === 'custom' && (
                <div className="flex flex-col sm:flex-row gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Du:</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Au:</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {startDate && endDate && (
                    <button
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                      }}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                    >
                      Réinitialiser
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Status Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filtres de statut
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
        </div>

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
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
                  className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all border-2 border-gray-100 hover:border-blue-300 transform hover:scale-105 cursor-pointer"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{session.nomSession}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          <span className="line-clamp-1">{session.user.prenom} {session.user.nom}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border ${statusConfig.color} mb-4`}>
                      <StatusIcon className="w-4 h-4" />
                      {statusConfig.label}
                    </span>

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
                {session.paiements && session.paiements.length > 0 && (
                  <div className="mb-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Receipt className="w-4 h-4" />
                      <span>{session.paiements.length} paiement{session.paiements.length > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleViewSession(session)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  <Eye className="w-5 h-5" />
                  Voir les détails
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  </div>
</div>
);
};
export default SessionListPage; 