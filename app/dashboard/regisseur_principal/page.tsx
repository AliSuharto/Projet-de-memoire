'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
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

type TimeUnit = 'jour' | 'mois' | 'annee';

const SessionDashboard = () => {
  const [sessions, setSessions] = useState<SessionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
         // Ajustez selon votre configuration
        const response = await fetch(`${API_BASE_URL}/sessions`);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        setSessions(data);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des sessions:', err);
        setError('Erreur lors du chargement des données. Vérifiez que l\'API est accessible.');
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // Déterminer l'unité de temps dynamiquement
  const determineTimeUnit = (sessions: SessionDTO[]): TimeUnit => {
    if (sessions.length === 0) return 'jour';

    const dates = sessions.map(s => new Date(s.dateSession));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const daysDiff = (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff <= 31) return 'jour';
    if (daysDiff <= 365) return 'mois';
    return 'annee';
  };

  // Formater la date selon l'unité
  const formatDate = (date: Date, unit: TimeUnit): string => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    switch (unit) {
      case 'jour':
        return `${date.getDate()} ${months[date.getMonth()]}`;
      case 'mois':
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
      case 'annee':
        return `${date.getFullYear()}`;
      default:
        return date.toLocaleDateString();
    }
  };

  // Grouper les données par période
  const groupByPeriod = (sessions: SessionDTO[], unit: TimeUnit) => {
    const grouped = new Map<string, { montant: number; count: number; timestamp: number }>();

    sessions.forEach(session => {
      const date = new Date(session.dateSession);
      const key = formatDate(date, unit);

      if (!grouped.has(key)) {
        grouped.set(key, { montant: 0, count: 0, timestamp: date.getTime() });
      }

      const current = grouped.get(key)!;
      current.montant += session.montantCollecte;
      current.count += 1;
    });

    // Trier par timestamp (date la plus ancienne en premier)
    return Array.from(grouped.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)
      .map(([periode, data]) => ({
        periode,
        montant: data.montant,
        sessions: data.count,
      }));
  };

  // Calculer les moyennes par utilisateur
  const calculateUserAverages = (sessions: SessionDTO[]) => {
    const userMap = new Map<number, { nom: string; total: number; count: number }>();

    sessions.forEach(session => {
      const userId = session.user.id;
      const userName = `${session.user.prenom} ${session.user.nom}`;

      if (!userMap.has(userId)) {
        userMap.set(userId, { nom: userName, total: 0, count: 0 });
      }

      const current = userMap.get(userId)!;
      current.total += session.montantCollecte;
      current.count += 1;
    });

    return Array.from(userMap.values())
      .map(user => ({
        utilisateur: user.nom,
        moyenne: Math.round(user.total / user.count),
      }))
      .sort((a, b) => b.moyenne - a.moyenne);
  };

  const validatedSessions = useMemo(() => 
    sessions.filter(s => s.status === 'VALIDEE'),
    [sessions]
  );

  const timeUnit = useMemo(() => 
    determineTimeUnit(validatedSessions),
    [validatedSessions]
  );

  const montantData = useMemo(() => 
    groupByPeriod(validatedSessions, timeUnit),
    [validatedSessions, timeUnit]
  );

  const userAverages = useMemo(() => 
    calculateUserAverages(validatedSessions),
    [validatedSessions]
  );

  const stats = useMemo(() => ({
    totalMontant: validatedSessions.reduce((sum, s) => sum + s.montantCollecte, 0),
    totalSessions: validatedSessions.length,
    moyenneMontant: validatedSessions.length > 0 
      ? Math.round(validatedSessions.reduce((sum, s) => sum + s.montantCollecte, 0) / validatedSessions.length)
      : 0,
    utilisateursActifs: new Set(validatedSessions.map(s => s.user.id)).size,
  }), [validatedSessions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8 pt-20 md:pt-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard regisseur principal</h1>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Montant Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats.totalMontant / 1000000).toFixed(2)}M Ar
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sessions Validées</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Moyenne / Session</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats.moyenneMontant / 1000).toFixed(0)}K Ar
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Utilisateurs Actifs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.utilisateursActifs}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Graphique Montant */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Évolution du Montant Collecté par {timeUnit === 'jour' ? 'Jour' : timeUnit === 'mois' ? 'Mois' : 'Année'}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={montantData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periode" />
              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
              <Tooltip 
                formatter={(value: number) => [`${value.toLocaleString()} Ar`, 'Montant']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="montant" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Montant (Ar)"
                dot={{ fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique Nombre de Sessions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Nombre de Sessions par {timeUnit === 'jour' ? 'Jour' : timeUnit === 'mois' ? 'Mois' : 'Année'}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={montantData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periode" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="sessions" 
                fill="#10b981" 
                name="Nombre de Sessions"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique Moyenne par Utilisateur */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Moyenne du Montant par Session et par Utilisateur
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userAverages} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
              <YAxis dataKey="utilisateur" type="category" width={120} />
              <Tooltip 
                formatter={(value: number) => [`${value.toLocaleString()} Ar`, 'Moyenne']}
              />
              <Legend />
              <Bar 
                dataKey="moyenne" 
                fill="#f59e0b" 
                name="Moyenne (Ar)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SessionDashboard;