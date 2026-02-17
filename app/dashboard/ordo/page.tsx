'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Users, Store, MapPin, AlertCircle, TrendingUp, LucideIcon } from 'lucide-react';
import API_BASE_URL from '@/services/APIbaseUrl';

// Import dynamique pour éviter les erreurs SSR avec ApexCharts
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Types
interface Marchee {
  id: number;
  nom: string;
  adresse: string;
  actualTotalPlaces: number;
  occupiedPlaces: number;
  availablePlaces: number;
  occupationRate: number;
  isUnderUtilized?: boolean;
  isOverCapacity?: boolean;
}

interface Marchand {
  id: number;
  nom: string;
  prenom: string;
  estEndette: boolean;
  hasPlace: boolean;
}

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  pseudo?: string;
  role: string;
  isActive: boolean;
}

interface DashboardData {
  nbr_marchee: number;
  nbr_marchands: number;
  nbr_user: number;
  nbr_marchands_endettee: number;
  marchees?: Marchee[];
  marchands?: Marchand[];
  users?: User[];
}

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: number;
  subtitle?: string;
  color: string;
  trend?: string;
}

const COLORSS = {
  endette: '#ef4444',
  aJour: '#22c55e',
  avecPlace: '#3b82f6',
  sansPlace: '#94a3b8',
};

const OrdoDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

        const response = await fetch(`${API_BASE_URL}/visualisation-ordo`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });

        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

        const result = await response.json() as DashboardData;
        setData(result);
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <AlertCircle size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <p className="text-gray-600">Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, subtitle, color, trend }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold mt-2" style={{ color }}>{value}</h3>
          {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className="p-4 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <Icon size={28} style={{ color }} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <TrendingUp size={16} className="text-green-500 mr-1" />
          <span className="text-green-500 font-medium">{trend}</span>
        </div>
      )}
    </div>
  );

  // ─── Données pour les graphiques ────────────────────────────────────────────

  // Graphique barres : Taux d'occupation des marchés
  const occupationBarOptions: ApexCharts.ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 6, columnWidth: '50%' } },
    colors: ['#3b82f6'],
    xaxis: {
      categories: data.marchees?.map(m => m.nom) || [],
      labels: { rotate: -45, style: { fontSize: '12px' } },
    },
    yaxis: { title: { text: 'Taux (%)' }, max: 100 },
    tooltip: { y: { formatter: (val) => `${val}%` } },
    dataLabels: { enabled: false },
    grid: { borderColor: '#e5e7eb' },
  };

  const occupationBarSeries = [
    {
      name: 'Taux d\'occupation (%)',
      data: data.marchees?.map(m => m.occupationRate) || [],
    },
  ];

  // Graphique donut : Répartition des marchands (endettés / à jour)
  const marchandPieOptions: ApexCharts.ApexOptions = {
    chart: { type: 'donut' },
    labels: ['Marchands à jour', 'Marchands endettés'],
    colors: ['#10b981', '#ef4444'],
    legend: { position: 'bottom' },
    dataLabels: { formatter: (val: number) => `${val.toFixed(0)}%` },
    tooltip: { y: { formatter: (val) => `${val} marchand(s)` } },
  };

  const marchandPieSeries = [
    data.nbr_marchands - data.nbr_marchands_endettee,
    data.nbr_marchands_endettee,
  ];

  // Onglet Marchands ──────────────────────────────────────────────────────────
  const renderMarchandsTab = () => {
    if (!data.marchands || data.marchands.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <p className="text-gray-600 text-lg">Aucun marchand disponible</p>
        </div>
      );
    }

    const total = data.marchands.length;
    const endettes = data.marchands.filter(m => m.estEndette).length;
    const aJour = total - endettes;
    const avecPlace = data.marchands.filter(m => m.hasPlace).length;
    const sansPlace = total - avecPlace;
    const avecPlaceEndette = data.marchands.filter(m => m.hasPlace && m.estEndette).length;
    const avecPlaceAJour = avecPlace - avecPlaceEndette;

    // Donut : statut de paiement
    const statutOptions: ApexCharts.ApexOptions = {
      chart: { type: 'donut' },
      labels: ['Endettés', 'À jour'],
      colors: [COLORSS.endette, COLORSS.aJour],
      legend: { position: 'bottom' },
      dataLabels: { formatter: (val: number) => `${val.toFixed(0)}%` },
      tooltip: { y: { formatter: (val) => `${val} marchand(s)` } },
    };
    const statutSeries = [endettes, aJour];

    // Donut : attribution de place
    const placeOptions: ApexCharts.ApexOptions = {
      chart: { type: 'donut' },
      labels: ['Avec place', 'Sans place'],
      colors: [COLORSS.avecPlace, COLORSS.sansPlace],
      legend: { position: 'bottom' },
      dataLabels: { formatter: (val: number) => `${val.toFixed(0)}%` },
      tooltip: { y: { formatter: (val) => `${val} marchand(s)` } },
    };
    const placeSeries = [avecPlace, sansPlace];

    // Barres : répartition détaillée croisée
    const croiseOptions: ApexCharts.ApexOptions = {
      chart: { type: 'bar', toolbar: { show: false } },
      plotOptions: { bar: { borderRadius: 6, columnWidth: '45%', distributed: true } },
      colors: [COLORSS.aJour, COLORSS.endette, COLORSS.sansPlace],
      xaxis: {
        categories: ['Avec place – À jour', 'Avec place – Endetté', 'Sans place'],
        labels: { style: { fontSize: '12px' } },
      },
      yaxis: { title: { text: 'Nombre de marchands' } },
      legend: { show: false },
      dataLabels: { enabled: true, style: { colors: ['#fff'] } },
      grid: { borderColor: '#e5e7eb' },
      tooltip: { y: { formatter: (val) => `${val} marchand(s)` } },
    };
    const croiseSeries = [{ name: 'Marchands', data: [avecPlaceAJour, avecPlaceEndette, sansPlace] }];

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-8">
        {/* Ligne du haut */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Carte total */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-8 shadow-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white opacity-10 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-4 rounded-2xl bg-white bg-opacity-20 p-4 backdrop-blur-sm transition-transform group-hover:scale-110">
                <Users className="w-10 h-10 text-white" />
              </div>
              <p className="text-blue-100 text-sm font-medium tracking-wider uppercase mb-1">
                Total des Marchands
              </p>
              <div className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
                {total.toLocaleString('fr-FR')}
              </div>
              <div className="mt-4 h-1 w-24 rounded-full bg-white bg-opacity-30"></div>
            </div>
            <div className="pointer-events-none absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transition-transform duration-1000 group-hover:translate-x-[100%] skew-x-12"></div>
          </div>

          {/* Donut statut */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-center font-semibold text-gray-700 mb-2">Statut de paiement</h3>
            <ReactApexChart
              type="donut"
              series={statutSeries}
              options={statutOptions}
              height={220}
            />
          </div>

          {/* Donut place */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-center font-semibold text-gray-700 mb-2">Attribution de place</h3>
            <ReactApexChart
              type="donut"
              series={placeSeries}
              options={placeOptions}
              height={220}
            />
          </div>
        </div>

        {/* Barres croisées */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-center font-semibold text-gray-700 mb-4">
            Répartition détaillée (Avec place : À jour vs Endetté)
          </h3>
          <ReactApexChart
            type="bar"
            series={croiseSeries}
            options={croiseOptions}
            height={300}
          />
        </div>
      </div>
    );
  };

  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-60 pt-20 md:pt-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tableau de Bord de l'Ordonnateur</h1>
          <p className="text-gray-600">Visualisation des données des marchés et marchands</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={MapPin} title="Marchés" value={data.nbr_marchee} subtitle="Marchés actifs" color="#3b82f6" trend="+2 ce mois" />
          <StatCard icon={Store} title="Marchands" value={data.nbr_marchands} subtitle="Marchands enregistrés" color="#10b981" trend="+15 ce mois" />
          <StatCard icon={Users} title="Utilisateurs" value={data.nbr_user} subtitle="Comptes actifs" color="#8b5cf6" />
          <StatCard
            icon={AlertCircle}
            title="Endettés"
            value={data.nbr_marchands_endettee}
            subtitle={`${((data.nbr_marchands_endettee / data.nbr_marchands) * 100).toFixed(1)}% des marchands`}
            color="#ef4444"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b overflow-x-auto">
            {['overview', 'marchees', 'marchands', 'users'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'overview' && "Vue d'ensemble"}
                {tab === 'marchees' && 'Marchés'}
                {tab === 'marchands' && 'Marchands'}
                {tab === 'users' && 'Utilisateurs'}
              </button>
            ))}
          </div>
        </div>

        {/* Vue d'ensemble */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Taux d&apos;occupation des marchés</h3>
              <ReactApexChart
                type="bar"
                series={occupationBarSeries}
                options={occupationBarOptions}
                height={300}
              />
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Répartition des marchands</h3>
              <ReactApexChart
                type="donut"
                series={marchandPieSeries}
                options={marchandPieOptions}
                height={300}
              />
            </div>
          </div>
        )}

        {/* Marchés */}
        {activeTab === 'marchees' && (
          <div className="grid grid-cols-1 gap-6">
            {data.marchees && data.marchees.length > 0 ? (
              data.marchees.map(marche => {
                const sparkOptions: ApexCharts.ApexOptions = {
                  chart: { type: 'radialBar', sparkline: { enabled: true } },
                  plotOptions: {
                    radialBar: {
                      dataLabels: {
                        name: { show: false },
                        value: { fontSize: '22px', fontWeight: 700, formatter: (val) => `${val}%` },
                      },
                    },
                  },
                  colors: [marche.occupationRate > 90 ? '#ef4444' : marche.occupationRate < 30 ? '#f59e0b' : '#3b82f6'],
                };

                return (
                  <div key={marche.id} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">{marche.nom}</h3>
                        <p className="text-gray-500">{marche.adresse}</p>
                      </div>
                      <div className="flex gap-2">
                        {marche.isUnderUtilized && (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Sous-utilisé</span>
                        )}
                        {marche.isOverCapacity && (
                          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Surcapacité</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      {/* Compteurs */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Places totales</p>
                          <p className="text-2xl font-bold text-blue-600">{marche.actualTotalPlaces}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Occupées</p>
                          <p className="text-2xl font-bold text-green-600">{marche.occupiedPlaces}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Disponibles</p>
                          <p className="text-2xl font-bold text-purple-600">{marche.availablePlaces}</p>
                        </div>
                      </div>

                      {/* Radial bar */}
                      <div className="w-40 flex-shrink-0">
                        <ReactApexChart
                          type="radialBar"
                          series={[marche.occupationRate]}
                          options={sparkOptions}
                          height={160}
                        />
                        <p className="text-center text-xs text-gray-500 -mt-2">Taux d&apos;occupation</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <p className="text-gray-600">Aucun marché disponible</p>
              </div>
            )}
          </div>
        )}

        {/* Marchands */}
        {activeTab === 'marchands' && renderMarchandsTab()}

        {/* Utilisateurs */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {data.users && data.users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Nom Complet', 'Email', 'Téléphone', 'Rôle', 'Statut'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 font-medium text-sm">
                                {user.nom?.charAt(0)}{user.prenom?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{user.nom} {user.prenom}</div>
                              {user.pseudo && <div className="text-sm text-gray-500">@{user.pseudo}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.telephone || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'ORDONNATEUR' || user.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : user.role === 'ORDO' || user.role === 'MANAGER'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.isActive ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'
                          }`}>
                            {user.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-600">Aucun utilisateur disponible</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdoDashboard;