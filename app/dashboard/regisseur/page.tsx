// Activités récentes (5 dernières)
'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ShoppingCart, Users, FileText, TrendingUp } from 'lucide-react';
import API_BASE_URL from '@/services/APIbaseUrl';

// Import dynamique pour éviter les erreurs SSR avec ApexCharts
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

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
  orange: '#f97316',
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
      const currentUserString = localStorage.getItem('currentUser');
      if (!currentUserString) throw new Error('Utilisateur non connecté');

      const currentUser = JSON.parse(currentUserString);
      const userId = currentUser.id;

      const response = await fetch(`${API_BASE_URL}/sessions/dashboard/${userId}`);
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

  // ─── Préparation des données ─────────────────────────────────────────────────

  const sortedSessions = [...data.sessions].sort(
    (a, b) => new Date(a.dateOuverture).getTime() - new Date(b.dateOuverture).getTime()
  );

  const firstDate = new Date(sortedSessions[0]?.dateOuverture);
  const lastDate = new Date(sortedSessions[sortedSessions.length - 1]?.dateOuverture);
  const daysDiff = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);

  let dateFormat: (date: Date) => string;
  if (daysDiff > 365) {
    dateFormat = (date) => date.getFullYear().toString();
  } else if (daysDiff > 60) {
    dateFormat = (date) => date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
  } else {
    dateFormat = (date) => date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  const sessionsChartData = sortedSessions.reduce(
    (acc, session) => {
      const formattedDate = dateFormat(new Date(session.dateOuverture));
      const existing = acc.find((item) => item.name === formattedDate);
      const montantNum =
        typeof session.montant === 'string' ? parseFloat(session.montant) : session.montant;
      if (existing) {
        existing.montant += montantNum;
      } else {
        acc.push({ name: formattedDate, montant: montantNum });
      }
      return acc;
    },
    [] as Array<{ name: string; montant: number }>
  );

  const marchandsStatusData = [
    { name: 'À jour', value: data.nbrMarchandsAjour, color: COLORS.success },
    { name: 'Retard Léger', value: data.nbrMarchandsRetardLeger, color: COLORS.warning },
    { name: 'Retard Significatif', value: data.nbrMarchandsRetardSignificatif, color: COLORS.orange },
    { name: 'Retard Critique', value: data.nbrMarchandsRetardCritique, color: COLORS.danger },
    { name: 'Retard Prolongé', value: data.nbrMarchandsRetardProlonger, color: '#b91c1c' },
  ];

  const quittancesData = [
    { name: 'Utilisées', value: data.nbrQuittancesUtilise, color: COLORS.primary },
    { name: 'Libres', value: data.nbrQuittancesLibre, color: COLORS.info },
  ];

  const topMarchands = data.sessions
    .flatMap((s) => s.paiements)
    .reduce(
      (acc, p) => {
        const existing = acc.find((m) => m.nom === p.nomMarchands);
        if (existing) {
          existing.total += parseFloat(p.montant);
          existing.count += 1;
        } else {
          acc.push({ nom: p.nomMarchands, total: parseFloat(p.montant), count: 1 });
        }
        return acc;
      },
      [] as Array<{ nom: string; total: number; count: number }>
    )
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const recentActivities: Array<{ text: string; date: Date; type: 'paiement' | 'session' }> =
    data.sessions
      .flatMap((session) =>
        session.paiements.map((p) => ({
          text: `${p.motif} par ${p.nomMarchands} montant ${p.montant} Ar`,
          date: new Date(p.datePaiement),
          type: 'paiement' as const,
        }))
      )
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);

  if (data.nomSessionOuvert) {
    const sessionOuverte = data.sessions.find((s) => s.nomSession === data.nomSessionOuvert);
    recentActivities.unshift({
      text: `Création de session, session ouverte : ${data.nomSessionOuvert}`,
      date: sessionOuverte ? new Date(sessionOuverte.dateOuverture) : new Date(),
      type: 'session' as const,
    });
  }

  // ─── Options ApexCharts ──────────────────────────────────────────────────────

  // Graphique ligne : Évolution des sessions
  const lineOptions: ApexCharts.ApexOptions = {
    chart: { type: 'line', toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { curve: 'smooth', width: 3 },
    colors: [COLORS.primary],
    xaxis: {
      categories: sessionsChartData.map((d) => d.name),
      labels: { rotate: -45, style: { fontSize: '12px', colors: '#6b7280' } },
    },
    yaxis: {
      labels: {
        style: { colors: '#6b7280', fontSize: '12px' },
        formatter: (val) => `${(val / 1000).toFixed(0)}k`,
      },
    },
    tooltip: {
      y: { formatter: (val) => `${val.toLocaleString()} Ar` },
    },
    markers: { size: 4, colors: [COLORS.primary], strokeColors: '#fff', strokeWidth: 2 },
    grid: { borderColor: '#e5e7eb' },
    dataLabels: { enabled: false },
  };

  const lineSeries = [{ name: 'Montant', data: sessionsChartData.map((d) => d.montant) }];

  // Graphique donut : Statut marchands
  const marchandsDonutOptions: ApexCharts.ApexOptions = {
    chart: { type: 'donut' },
    labels: marchandsStatusData.map((d) => d.name),
    colors: marchandsStatusData.map((d) => d.color),
    legend: { show: false },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: '60%' } } },
    tooltip: { y: { formatter: (val) => `${val} marchand(s)` } },
  };

  const marchandsDonutSeries = marchandsStatusData.map((d) => d.value);

  // Graphique donut : Quittances
  const quittancesDonutOptions: ApexCharts.ApexOptions = {
    chart: { type: 'donut' },
    labels: quittancesData.map((d) => d.name),
    colors: quittancesData.map((d) => d.color),
    legend: { show: false },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: '60%' } } },
    tooltip: { y: { formatter: (val) => `${val} quittance(s)` } },
  };

  const quittancesDonutSeries = quittancesData.map((d) => d.value);

  // Graphique barres horizontales : Top 5 marchands
  const topMarchandsOptions: ApexCharts.ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        barHeight: '55%',
      },
    },
    colors: [COLORS.success],
    xaxis: {
      categories: topMarchands.map((m) => m.nom),
      labels: {
        style: { colors: '#6b7280', fontSize: '12px' },
        formatter: (val) => `${(Number(val) / 1000).toFixed(0)}k`,
      },
    },
    yaxis: {
      labels: { style: { colors: '#6b7280', fontSize: '12px' } },
    },
    tooltip: {
      custom: ({ dataPointIndex }) => {
        const m = topMarchands[dataPointIndex];
        return `<div style="padding:8px 12px;font-size:13px">
          <strong>${m.nom}</strong><br/>
          ${m.total.toLocaleString()} Ar<br/>
          ${m.count} paiement(s)
        </div>`;
      },
    },
    dataLabels: { enabled: false },
    grid: { borderColor: '#e5e7eb' },
  };

  const topMarchandsSeries = [{ name: 'Total', data: topMarchands.map((m) => m.total) }];

  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-0 md:p-0 lg:p-0 pt-20 md:pt-0">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-gray-50 pb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord - Régisseur</h1>
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

        {/* Charts Row - Sessions + Marchands */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Ligne sessions */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 lg:col-span-2">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Évolution des Sessions</h2>
            </div>
            <ReactApexChart
              type="line"
              series={lineSeries}
              options={lineOptions}
              height={300}
            />
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

          {/* Donut marchands */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <Users className="w-5 h-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Marchands</h2>
            </div>
            <ReactApexChart
              type="donut"
              series={marchandsDonutSeries}
              options={marchandsDonutOptions}
              height={270}
            />
            <div className="mt-4 space-y-2">
              {marchandsStatusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quittances + Top 5 marchands */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Donut quittances */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <FileText className="w-5 h-5 text-purple-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Quittances</h2>
            </div>
            <ReactApexChart
              type="donut"
              series={quittancesDonutSeries}
              options={quittancesDonutOptions}
              height={230}
            />
            <div className="mt-4 space-y-2">
              {quittancesData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Barres horizontales top 5 */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Top 5 Marchands – Plus gros contributeurs
            </h2>
            <ReactApexChart
              type="bar"
              series={topMarchandsSeries}
              options={topMarchandsOptions}
              height={300}
            />
          </div>
        </div>

        {/* Activités récentes */}
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
                        minute: '2-digit',
                      })
                    : activity.date.toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
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