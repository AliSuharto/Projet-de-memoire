// Activités récentes (5 dernières)
'use client';
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ShoppingCart, Users, FileText, TrendingUp } from 'lucide-react';
import API_BASE_URL from '@/services/APIbaseUrl';

// Types
interface PaiementRegisseur {
  id: number;
  motif: string;
  nomAgent: string;
  montant: string;
  datePaiement: string;
  nomMarchands: string;
  idSession: number;
}

interface SessionRegisseur {
  id: number;
  nomSession: string;
  montant: string;
  statut: string;
  dateValidation: string;
  dateOuverture: string;
  dateFermeture: string;
  paiements: PaiementRegisseur[];
}

interface QuittanceRegisseur {
  id: number;
  nom: string;
  statut: string;
  montant: number;
  idSession: number;
  dateUtilisation: string;
}

interface DashboardData {
  nbrPlaces: number;
  nbrMarchands: number;
  nbrMarchandsEndette: number;
  nbrMarchandsAjour: number;
  nbrMarchandsRetardLeger: number;
  nbrMarchandsRetardSignificatif: number;
  nbrMarchandsRetardCritique: number;
  nbrMarchandsRetardProlonger: number;
  nbrQuittancesUtilise: number;
  nbrQuittancesLibre: number;
  nbrSession: number;
  nbrSessionValide: number;
  nbrSessionEnvalidation: number;
  nomSessionOuvert: string;
  sessions: SessionRegisseur[];
  Quittances: QuittanceRegisseur[];
}

const COLORS = {
  primary: '#2563eb',
  secondary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
  orange: '#f97316'
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Remplacez par votre URL d'API
      const response = await fetch(`${API_BASE_URL}/sessions/dashboard/3`);
      if (!response.ok) throw new Error('Erreur lors du chargement des données');
      const result = await response.json();
      setData(result);
      console.log('Données du tableau de bord:', result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
 
    } finally {
      setLoading(false);
    }
  };

 

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!data) return null;

  // Préparer les données pour les graphiques
  // Trier les sessions par date d'ouverture
  const sortedSessions = [...data.sessions].sort((a, b) => 
    new Date(a.dateOuverture).getTime() - new Date(b.dateOuverture).getTime()
  );

  // Calculer la durée totale entre la première et la dernière session
  const firstDate = new Date(sortedSessions[0]?.dateOuverture);
  const lastDate = new Date(sortedSessions[sortedSessions.length - 1]?.dateOuverture);
  const daysDiff = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
  
  // Déterminer le format de date selon la période
  let dateFormat: (date: Date) => string;
  if (daysDiff > 365) {
    // Plus d'un an : afficher année
    dateFormat = (date) => date.getFullYear().toString();
  } else if (daysDiff > 60) {
    // Plus de 2 mois : afficher mois/année
    dateFormat = (date) => date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
  } else {
    // Moins de 2 mois : afficher jour/mois
    dateFormat = (date) => date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  const sessionsChartData = sortedSessions.map(session => ({
    name: dateFormat(new Date(session.dateOuverture)),
    montant: parseFloat(session.montant),
    fullDate: new Date(session.dateOuverture)
  }));

  const marchandsStatusData = [
    { name: 'À jour', value: data.nbrMarchandsAjour, color: COLORS.success },
    { name: 'Retard Léger', value: data.nbrMarchandsRetardLeger, color: COLORS.warning },
    { name: 'Retard Significatif', value: data.nbrMarchandsRetardSignificatif, color: COLORS.orange },
    { name: 'Retard Critique', value: data.nbrMarchandsRetardCritique, color: COLORS.danger },
    { name: 'Retard Prolonger', value: data.nbrMarchandsRetardProlonger, color: COLORS.danger }
  ];

  const quittancesData = [
    { name: 'Utilisées', value: data.nbrQuittancesUtilise, color: COLORS.primary },
    { name: 'Libres', value: data.nbrQuittancesLibre, color: COLORS.info }
  ];

  // Top 5 marchands qui paient le plus
  const topMarchands = data.sessions
    .flatMap(session => session.paiements)
    .reduce((acc, paiement) => {
      const existing = acc.find(m => m.nom === paiement.nomMarchands);
      if (existing) {
        existing.total += parseFloat(paiement.montant);
        existing.count += 1;
      } else {
        acc.push({
          nom: paiement.nomMarchands,
          total: parseFloat(paiement.montant),
          count: 1
        });
      }
      return acc;
    }, [] as Array<{ nom: string; total: number; count: number }>)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  const recentActivities = data.sessions
    .flatMap(session => 
      session.paiements.map(p => ({
        text: `${p.motif} par ${p.nomMarchands} montant ${p.montant} Ar`,
        date: new Date(p.datePaiement),
        type: 'paiement' as const
      }))
    )
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  // Ajouter la création de session si elle existe
  if (data.nomSessionOuvert) {
    const sessionOuverte = data.sessions.find(s => s.nomSession === data.nomSessionOuvert);
    recentActivities.unshift({
      text: `Création de session, session ouvert est la session ${data.nomSessionOuvert}`,
      date: sessionOuverte ? new Date(sessionOuverte.dateOuverture) : new Date(),
      type: 'session' as const
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord - Regisseur</h1>
          <p className="text-gray-600">Gestion des marchés, utilisateurs et permissions</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Nombre de places</p>
                <p className="text-3xl font-bold text-gray-900">{data.nbrPlaces}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Marchands</p>
                <p className="text-3xl font-bold text-gray-900">{data.nbrMarchands}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Marchands endettés</p>
                <p className="text-3xl font-bold text-gray-900">{data.nbrMarchandsEndette}</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Sessions Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 lg:col-span-2">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Évolution des Sessions</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sessionsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value: number) => [`${value.toLocaleString()} Ar`, 'Montant']}
                />
                <Line 
                  type="monotone" 
                  dataKey="montant" 
                  stroke={COLORS.primary} 
                  strokeWidth={3}
                  dot={{ fill: COLORS.primary, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
            
            {/* Statistiques sous le graphique */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-sm text-gray-600">Sessions validées</p>
                <p className="text-2xl font-bold text-gray-900">{data.nbrSessionValide}</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <p className="text-sm text-gray-600">En validation</p>
                <p className="text-2xl font-bold text-gray-900">{data.nbrSessionEnvalidation}</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm text-gray-600">Total sessions</p>
                <p className="text-2xl font-bold text-gray-900">{data.nbrSession}</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <p className="text-sm text-gray-600">Session ouverte</p>
                <p className="text-lg font-semibold text-gray-900">{data.nomSessionOuvert}</p>
              </div>
            </div>
          </div>

          {/* Marchands Status */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <Users className="w-5 h-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Marchands</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={marchandsStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {marchandsStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {marchandsStatusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quittances Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <FileText className="w-5 h-5 text-purple-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Quittances</h2>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={quittancesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {quittancesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {quittancesData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top 5 Marchands */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Marchands - Plus gros contributeurs</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topMarchands} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  type="number"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <YAxis 
                  type="category"
                  dataKey="nom" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  width={120}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value: number, name: string, props: any) => [
                    `${value.toLocaleString()} Ar (${props.payload.count} paiements)`,
                    'Total'
                  ]}
                />
                <Bar dataKey="total" fill={COLORS.success} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activités récentes du système</h2>
          <div className="space-y-3">
            {recentActivities.slice(0, 5).map((activity, index) => (
              <div 
                key={index} 
                className="flex items-start justify-between py-3 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start flex-1">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 mr-3 flex-shrink-0" />
                  <p className="text-gray-700 text-sm">{activity.text}</p>
                </div>
                <span className="text-xs text-gray-500 ml-4 flex-shrink-0">
                  {activity.type === 'session' 
                    ? activity.date.toLocaleString('fr-FR', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : activity.date.toLocaleDateString('fr-FR', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                      })
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;