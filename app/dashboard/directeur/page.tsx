'use client';
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Store, MapPin, AlertCircle, TrendingUp, LucideIcon } from 'lucide-react';
import API_BASE_URL from '@/services/APIbaseUrl';

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

interface OccupationData {
  name: string;
  taux: number;
  occupees: number;
  disponibles: number;
}

interface PieData {
  name: string;
  value: number;
  fill?: string;
}

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: number;
  subtitle?: string;
  color: string;
  trend?: string;
}

const OrdoDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Couleurs personnalisées
  const COLORSS = {
    endette: '#ef4444',    // rouge
    aJour: '#22c55e',      // vert
    avecPlace: '#3b82f6',  // bleu
    sansPlace: '#94a3b8',  // gris
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        
        const response = await fetch(`${API_BASE_URL}/visualisation-ordo`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const result = await response.json() as DashboardData;
        console.log('Données récupérées:', result);
        setData(result);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
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

  const occupationData: OccupationData[] = data.marchees?.map(m => ({
    name: m.nom,
    taux: m.occupationRate,
    occupees: m.occupiedPlaces,
    disponibles: m.availablePlaces
  })) || [];

  const pieData: PieData[] = [
    { name: 'Marchands à jour', value: data.nbr_marchands - data.nbr_marchands_endettee },
    { name: 'Marchands endettés', value: data.nbr_marchands_endettee }
  ];

  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-20 md:pt-0">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Tableau de Bord du Directeur</h1>
          <p className="text-gray-600">Visualisation des données des marchés et marchands</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={MapPin}
            title="Marchés"
            value={data.nbr_marchee}
            subtitle="Marchés actifs"
            color="#3b82f6"
            trend="+2 ce mois"
          />
          <StatCard
            icon={Store}
            title="Marchands"
            value={data.nbr_marchands}
            subtitle="Marchands enregistrés"
            color="#10b981"
            trend="+15 ce mois"
          />
          <StatCard
            icon={Users}
            title="Utilisateurs"
            value={data.nbr_user}
            subtitle="Comptes actifs"
            color="#8b5cf6"
          />
          <StatCard
            icon={AlertCircle}
            title="Endettés"
            value={data.nbr_marchands_endettee}
            subtitle={`${((data.nbr_marchands_endettee / data.nbr_marchands) * 100).toFixed(1)}% des marchands`}
            color="#ef4444"
          />
        </div>

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
                {tab === 'overview' && 'Vue d\'ensemble'}
                {tab === 'marchees' && 'Marchés'}
                {tab === 'marchands' && 'Marchands'}
                {tab === 'users' && 'Utilisateurs'}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Taux d&apos;occupation des marchés</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={occupationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="taux" fill="#3b82f6" name="Taux (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Répartition des marchands</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'marchees' && (
          <div className="grid grid-cols-1 gap-6">
            {data.marchees && data.marchees.length > 0 ? (
              data.marchees.map(marche => (
                <div key={marche.id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{marche.nom}</h3>
                      <p className="text-gray-500">{marche.adresse}</p>
                    </div>
                    <div className="flex gap-2">
                      {marche.isUnderUtilized && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                          Sous-utilisé
                        </span>
                      )}
                      {marche.isOverCapacity && (
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                          Surcapacité
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Taux d&apos;occupation</p>
                      <p className="text-2xl font-bold text-orange-600">{marche.occupationRate}%</p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all"
                      style={{ width: `${marche.occupationRate}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <p className="text-gray-600">Aucun marché disponible</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'marchands' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Calcul des statistiques */}
            {data.marchands && data.marchands.length > 0 ? (
              (() => {
                const total = data.marchands.length;

                const endettes = data.marchands.filter(m => m.estEndette).length;
                const aJour = total - endettes;

                const avecPlace = data.marchands.filter(m => m.hasPlace).length;
                const sansPlace = total - avecPlace;

                // Répartition croisée : avec place → endetté / à jour
                const avecPlaceEndette = data.marchands.filter(m => m.hasPlace && m.estEndette).length;
                const avecPlaceAJour = avecPlace - avecPlaceEndette;

                // Données pour les graphiques
                const statutData: PieData[] = [
                  { name: 'Endettés', value: endettes, fill: COLORSS.endette },
                  { name: 'À jour', value: aJour, fill: COLORSS.aJour },
                ];

                const placeData: PieData[] = [
                  { name: 'Avec place', value: avecPlace, fill: COLORSS.avecPlace },
                  { name: 'Sans place', value: sansPlace, fill: COLORSS.sansPlace },
                ];

                const croiseData = [
                  { name: 'Avec place - À jour', value: avecPlaceAJour },
                  { name: 'Avec place - Endetté', value: avecPlaceEndette },
                  { name: 'Sans place', value: sansPlace },
                ];

                return (
                  <div className="space-y-8">
                    {/* Ligne du haut : Total + deux camemberts */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Total marchands */}
                      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-8 shadow-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
                        {/* Fond décoratif subtil */}
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                        
                        {/* Cercle décoratif animé en haut à droite */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white opacity-10 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full bg-white opacity-5"></div>

                        <div className="relative z-10 flex flex-col items-center">
                          {/* Icône animée */}
                          <div className="mb-4 rounded-2xl bg-white bg-opacity-20 p-4 backdrop-blur-sm transition-transform group-hover:scale-110">
                            <Users className="w-10 h-10 text-white" />
                          </div>

                          {/* Texte principal */}
                          <p className="text-blue-100 text-sm font-medium tracking-wider uppercase mb-1">
                            Total des Marchands
                          </p>
                          
                          {/* Chiffre principal avec animation de comptage (optionnel mais classe) */}
                          <div className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
                            {total.toLocaleString('fr-FR')}
                          </div>

                          {/* Petite barre décorative */}
                          <div className="mt-4 h-1 w-24 rounded-full bg-white bg-opacity-30"></div>
                        </div>

                        {/* Effet de brillance au hover */}
                        <div className="pointer-events-none absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transition-transform duration-1000 group-hover:translate-x-[100%] skew-x-12"></div>
                      </div>

                      {/* Camembert Statut */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="text-center font-semibold text-gray-700 mb-4">Statut de paiement</h3>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={statutData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {statutData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-6 mt-4 text-sm">
                          <span className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            Endettés ({endettes})
                          </span>
                          <span className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            À jour ({aJour})
                          </span>
                        </div>
                      </div>

                      {/* Camembert Place */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="text-center font-semibold text-gray-700 mb-4"> Attribution de place</h3>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={placeData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {placeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-6 mt-4 text-sm">
                          <span className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            Avec place ({avecPlace})
                          </span>
                          <span className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                            Sans place ({sansPlace})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Graphique en barres croisées */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-center font-semibold text-gray-700 mb-6">
                        Répartition détaillée (Avec place : À jour vs Endetté)
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={croiseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#3b82f6">
                            {croiseData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  entry.name.includes('Endetté')
                                    ? COLORSS.endette
                                    : entry.name.includes('Sans place')
                                    ? COLORSS.sansPlace
                                    : COLORSS.aJour
                                }
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="p-12 text-center">
                <p className="text-gray-600 text-lg">Aucun marchand disponible</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {data.users && data.users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom Complet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Téléphone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rôle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-600 font-medium text-sm">
                                  {user.nom?.charAt(0)}{user.prenom?.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">
                                {user.nom} {user.prenom}
                              </div>
                              {user.pseudo && (
                                <div className="text-sm text-gray-500">@{user.pseudo}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.telephone || 'N/A'}
                          </div>
                        </td>
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
                          {user.isActive ? (
                            <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                              Actif
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
                              Inactif
                            </span>
                          )}
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