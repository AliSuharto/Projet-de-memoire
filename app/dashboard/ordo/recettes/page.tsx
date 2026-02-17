'use client';
import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import API_BASE_URL from '@/services/APIbaseUrl';
import ExportRecettesExcel from '@/components/(Ordonnateur)/ExportRecetteExcel';


interface PaiementDTO {
  id: number;
  montant: number;
  datePaiement: string;
  typePaiement: string;
  motif: string;
  modePaiement: string;
  moisdePaiement: string;
  nomMarchands: string;
  idMarchand: number;
  idAgent: number;
  nomAgent: string;
  idPlace: number;
  nomPlace: string;
  sessionId: number;
  recuNumero: string;
  quittanceId: number;
  dernierePaiement: string;
}

interface UserSummaryDTO {
  id: number;
  nom: string;
  prenom: string;
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
  paiements: PaiementDTO[];
  notes: string;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const DashboardRecettes = () => {
  const [sessions, setSessions] = useState<SessionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateDebut, setDateDebut] = useState(new Date().toISOString().split('T')[0]);
  const [dateFin, setDateFin] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions`);
      const data = await response.json();
      setSessions(data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error);
      setLoading(false);
    }
  };

  const filterSessionsByDate = (sessions: SessionDTO[]) => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.dateSession);
      const debut = new Date(dateDebut);
      const fin = new Date(dateFin);
      fin.setHours(23, 59, 59, 999);
      return sessionDate >= debut && sessionDate <= fin;
    });
  };

  const filteredSessions = filterSessionsByDate(sessions);

  // Calculs des statistiques
  const recettesValidees = filteredSessions
    .filter(s => s.status === 'VALIDEE')
    .reduce((sum, s) => sum + s.montantCollecte, 0);

  const recettesEnValidation = filteredSessions
    .filter(s => s.status === 'EN_VALIDATION')
    .reduce((sum, s) => sum + s.montantCollecte, 0);

  const recettesEnCours = filteredSessions
    .filter(s => s.status === 'OUVERTE')
    .reduce((sum, s) => sum + s.montantCollecte, 0);

  const recettesTotales = recettesValidees + recettesEnValidation + recettesEnCours;

  // Données pour le graphique de répartition par statut
  const dataParStatut = [
    { name: 'Validées', value: recettesValidees, count: filteredSessions.filter(s => s.status === 'VALIDEE').length },
    { name: 'En validation', value: recettesEnValidation, count: filteredSessions.filter(s => s.status === 'EN_VALIDATION').length },
    { name: 'En cours', value: recettesEnCours, count: filteredSessions.filter(s => s.status === 'OUVERTE').length },
    { name: 'Fermées', value: filteredSessions.filter(s => s.status === 'FERMEE').reduce((sum, s) => sum + s.montantCollecte, 0), count: filteredSessions.filter(s => s.status === 'FERMEE').length },
    { name: 'Rejetées', value: filteredSessions.filter(s => s.status === 'REJETEE').reduce((sum, s) => sum + s.montantCollecte, 0), count: filteredSessions.filter(s => s.status === 'REJETEE').length },
  ].filter(item => item.value > 0);

  // Données pour le graphique temporel (par jour)
  const dataParJour = filteredSessions
    .filter(s => s.status === 'VALIDEE')
    .reduce((acc, session) => {
      const date = new Date(session.dateSession).toLocaleDateString('fr-FR');
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.montant += session.montantCollecte;
        existing.sessions += 1;
      } else {
        acc.push({ date, montant: session.montantCollecte, sessions: 1 });
      }
      return acc;
    }, [] as { date: string; montant: number; sessions: number }[])
    .sort((a, b) => new Date(a.date.split('/').reverse().join('-')).getTime() - new Date(b.date.split('/').reverse().join('-')).getTime());

  // Top agents par recettes
  const topAgents = filteredSessions
    .filter(s => s.status === 'VALIDEE')
    .reduce((acc, session) => {
      const agentName = session.user ? `${session.user.prenom} ${session.user.nom}` : 'Inconnu';
      const existing = acc.find(item => item.agent === agentName);
      if (existing) {
        existing.montant += session.montantCollecte;
        existing.sessions += 1;
      } else {
        acc.push({ agent: agentName, montant: session.montantCollecte, sessions: 1 });
      }
      return acc;
    }, [] as { agent: string; montant: number; sessions: number }[])
    .sort((a, b) => b.montant - a.montant)
    .slice(0, 5);

  const formatMontant = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-60">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-60 p-6 md:p-0 lg:p-6 pt-20 md:pt-0">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Visualisation Recette</h1>
            <p className="text-gray-600">Suivi et analyse des recettes par période</p>
          </div>
          <div className="mt-4 md:mt-0">
            <ExportRecettesExcel 
              sessions={filteredSessions} 
              dateDebut={dateDebut} 
              dateFin={dateFin} 
            />
          </div>
        </div>

        {/* Filtres de date */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
              <input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setDateDebut(today);
                setDateFin(today);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-7"
            >
              Aujourd'hui
            </button>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Recettes Validées</h3>
            <p className="text-2xl font-bold text-gray-900">{formatMontant(recettesValidees)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {filteredSessions.filter(s => s.status === 'VALIDEE').length} session(s)
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">En Validation</h3>
            <p className="text-2xl font-bold text-gray-900">{formatMontant(recettesEnValidation)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {filteredSessions.filter(s => s.status === 'EN_VALIDATION').length} session(s)
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Sessions En Cours</h3>
            <p className="text-2xl font-bold text-gray-900">{formatMontant(recettesEnCours)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {filteredSessions.filter(s => s.status === 'OUVERTE').length} session(s)
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Période</h3>
            <p className="text-2xl font-bold text-gray-900">{formatMontant(recettesTotales)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {filteredSessions.length} session(s) au total
            </p>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Évolution temporelle */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des Recettes Validées</h3>
            {dataParJour.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dataParJour}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => formatMontant(value)}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="montant"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Montant"
                    dot={{ fill: '#10b981', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-12">Aucune donnée disponible pour cette période</p>
            )}
          </div>

          {/* Répartition par statut */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Statut</h3>
            {dataParStatut.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dataParStatut}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${formatMontant(entry.value)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dataParStatut.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatMontant(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-12">Aucune donnée disponible</p>
            )}
          </div>
        </div>

        {/* Top agents */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Agents - Recettes Validées</h3>
          {topAgents.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topAgents}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="agent" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => formatMontant(value)}
                  labelStyle={{ color: '#374151' }}
                />
                <Legend />
                <Bar dataKey="montant" fill="#3b82f6" name="Montant" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-12">Aucune donnée disponible</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardRecettes;