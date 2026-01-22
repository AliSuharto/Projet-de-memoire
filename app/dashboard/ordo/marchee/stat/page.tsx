'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Building2, Home, MapPin, Users, TrendingUp, ArrowLeft, Plus } from 'lucide-react';
import API_BASE_URL from '@/services/APIbaseUrl';
import { CreateHallModal, CreatePlaceModal, CreateZoneModal } from '@/components/(Directeur)/CreateModal';

// Types
interface Place {
  id: number;
  nom: string;
  statut: 'Libre' | 'Occupée';
  nomMarchand?: string;
  statutMarchand?: string;
}

interface Hall {
  id: number;
  nom: string;
  nbrPlace: number;
  placeLibre: number;
  placeOccupe: number;
  place: Place[];
}

interface Zone {
  id: number;
  nom: string;
  nbrPlace: number;
  placeLibre: number;
  placeOccupe: number;
  hall: Hall[];
  place: Place[];
}

interface MarcheeData {
  id: number;
  nom: string;
  adresse: string;
  nbrPlace: number;
  placeLibre: number;
  placeOccupe: number;
  occupationRate: number;
  zone: Zone[];
  hall: Hall[];
  place: Place[];
}

// API Function
async function getMarcheeInfo(id: string): Promise<MarcheeData> {
  const response = await fetch(`${API_BASE_URL}/marchees/${id}/info`);
  
  if (!response.ok) {
    throw new Error(`Erreur lors du chargement du marché: ${response.status}`);
  }
  return response.json();
}

// Components
const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string; trend?: string }> = 
  ({ title, value, icon, color, trend }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {trend && (
          <div className="flex items-center mt-2 text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

const PlaceGrid: React.FC<{ places: Place[]; onPlaceClick: (place: Place) => void }> = ({ places, onPlaceClick }) => (
  <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 lg:grid-cols-20 gap-2 mt-4">
    {places.map(place => (
      <button
        key={place.id}
        onClick={() => onPlaceClick(place)}
        className={`
          px-3 py-2 rounded text-xs font-medium transition-all transform hover:scale-105
          ${place.statut === 'Libre' 
            ? 'bg-green-500 hover:bg-green-600 text-white' 
            : 'bg-red-500 hover:bg-red-600 text-white'
          }
        `}
        title={`${place.nom} - ${place.statut}`}
      >
        {place.nom}
      </button>
    ))}
  </div>
);

const HallCard: React.FC<{ 
  hall: Hall; 
  onPlaceClick: (place: Place) => void;
  onAddPlace: (hallId: number, hallName: string) => void;
}> = ({ hall, onPlaceClick, onAddPlace }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const occupationPercent = Math.round((hall.placeOccupe / hall.nbrPlace) * 100);

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left hover:bg-gray-100 rounded p-2 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Home className="w-5 h-5 text-purple-600" />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">Hall {hall.nom}</h4>
              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-semibold">
                {hall.place.length} place{hall.place.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex gap-4 mt-1 text-sm text-gray-600">
              <span>Total: {hall.nbrPlace}</span>
              <span className="text-green-600">Libres: {hall.placeLibre}</span>
              <span className="text-red-600">Occupées: {hall.placeOccupe}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-700">{occupationPercent}%</div>
            <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
              <div 
                className="h-full bg-purple-600 rounded-full transition-all"
                style={{ width: `${occupationPercent}%` }}
              />
            </div>
          </div>
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>
      
      {isExpanded && (
        <div className="mt-4 pl-2">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-semibold text-gray-700">Places du hall</h5>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddPlace(hall.id, `Hall ${hall.nom}`);
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter une place
            </button>
          </div>
          <PlaceGrid places={hall.place} onPlaceClick={onPlaceClick} />
        </div>
      )}
    </div>
  );
};

const ZoneCard: React.FC<{ 
  zone: Zone; 
  onPlaceClick: (place: Place) => void;
  onAddHall: (zoneId: number, zoneName: string) => void;
  onAddPlace: (zoneId: number, zoneName: string) => void;
  onAddPlaceToHall: (hallId: number, hallName: string) => void;
}> = ({ zone, onPlaceClick, onAddHall, onAddPlace, onAddPlaceToHall }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const occupationPercent = Math.round((zone.placeOccupe / zone.nbrPlace) * 100);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">Zone {zone.nom}</h3>
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold">
                {zone.hall.length} hall{zone.hall.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex gap-6 mt-2 text-sm">
              <span className="text-gray-600">Total: <strong>{zone.nbrPlace}</strong></span>
              <span className="text-green-600">Libres: <strong>{zone.placeLibre}</strong></span>
              <span className="text-red-600">Occupées: <strong>{zone.placeOccupe}</strong></span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">{occupationPercent}%</div>
            <div className="w-32 h-3 bg-gray-200 rounded-full mt-1">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${occupationPercent}%` }}
              />
            </div>
          </div>
          {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-5 pt-0 border-t border-gray-100">
          {/* Boutons d'action */}
          <div className="flex flex-wrap gap-2 mt-4 mb-4">
            <button
              onClick={() => onAddHall(zone.id, `Zone ${zone.nom}`)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Ajouter un hall
            </button>
            <button
              onClick={() => onAddPlace(zone.id, `Zone ${zone.nom}`)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Ajouter une place directe
            </button>
          </div>

          {/* Halls */}
          <div className="space-y-3 mt-4">
            {zone.hall.map(hall => (
              <HallCard 
                key={hall.id} 
                hall={hall} 
                onPlaceClick={onPlaceClick}
                onAddPlace={onAddPlaceToHall}
              />
            ))}
          </div>

          {/* Places directes */}
          {zone.place.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <h5 className="text-sm font-semibold text-gray-700">Places directes de la zone</h5>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                  {zone.place.length} place{zone.place.length > 1 ? 's' : ''}
                </span>
              </div>
              <PlaceGrid places={zone.place} onPlaceClick={onPlaceClick} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const PlaceModal: React.FC<{ place: Place | null; onClose: () => void }> = ({ place, onClose }) => {
  if (!place) return null;

  const isOccupee = place.statut === 'Occupée';
  const hasMarchand = Boolean(place.nomMarchand);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 modal-overlay flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Détails de la Place</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Numéro</p>
              <p className="font-semibold text-gray-900">{place.nom}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <p className="text-sm text-gray-600">Statut</p>

              {!isOccupee && (
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Libre
                </span>
              )}

              {isOccupee && hasMarchand && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Occupée
                  </span>

                  <span className="text-sm text-gray-700">
                    par <strong>{place.nomMarchand}</strong>
                  </span>

                  {place.statutMarchand && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                      {place.statutMarchand}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Gérer
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard
export default function MarcheeDashboard() {
  const params = useParams();
  const router = useRouter();
  const marketId = params.marketId as string;
  
  const [marchee, setMarchee] = useState<MarcheeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Modals state
  const [showCreateZone, setShowCreateZone] = useState(false);
  const [showCreateHall, setShowCreateHall] = useState(false);
  const [showCreatePlace, setShowCreatePlace] = useState(false);
  const [hallContext, setHallContext] = useState<{ zoneId?: number; zoneName?: string }>({});
  const [placeContext, setPlaceContext] = useState<{ 
    marcheeId?: number; 
    zoneId?: number; 
    hallId?: number; 
    contextName?: string 
  }>({});

  const loadMarcheeData = () => {
    if (!marketId) return;
    
    setLoading(true);
    getMarcheeInfo(marketId)
      .then(data => {
        setMarchee(data);
        setError(null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMarcheeData();
  }, [marketId]);

  const handleAddHallToZone = (zoneId: number, zoneName: string) => {
    setHallContext({ zoneId, zoneName });
    setShowCreateHall(true);
  };

  const handleAddHallToMarchee = () => {
    setHallContext({});
    setShowCreateHall(true);
  };

  const handleAddPlaceToHall = (hallId: number, hallName: string) => {
    setPlaceContext({ hallId, contextName: hallName });
    setShowCreatePlace(true);
  };

  const handleAddPlaceToZone = (zoneId: number, zoneName: string) => {
    setPlaceContext({ zoneId, contextName: zoneName });
    setShowCreatePlace(true);
  };

  const handleAddPlaceToMarchee = () => {
    setPlaceContext({ marcheeId: marchee?.id, contextName: marchee?.nom });
    setShowCreatePlace(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du marché...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800 font-semibold">❌ Erreur</p>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!marchee) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-19 left-48 right-0 bg-white border-b-2 border-gray-300 shadow-sm z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all whitespace-nowrap flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Retour</span>
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                {marchee.nom}
              </h1>
              <div className="flex items-center gap-2 mt-1 text-sm sm:text-base text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{marchee.adresse}</span>
              </div>
            </div>

            <button
              onClick={() => setShowCreateZone(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouvelle Zone</span>
              <span className="sm:hidden">Zone</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Total des Places"
            value={marchee.nbrPlace}
            icon={<MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
            color="bg-blue-500"
          />
          <StatCard
            title="Places Libres"
            value={marchee.placeLibre}
            icon={<Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
            color="bg-green-500"
          />
          <StatCard
            title="Places Occupées"
            value={marchee.placeOccupe}
            icon={<Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
            color="bg-red-500"
          />
          <StatCard
            title="Taux d'Occupation"
            value={`${marchee.occupationRate}%`}
            icon={<TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
            color="bg-orange-500"
          />
        </div>

        {/* Zones */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Zones du Marché</h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              {marchee.zone.length} zone{marchee.zone.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-4">
            {marchee.zone.map(zone => (
              <ZoneCard 
                key={zone.id} 
                zone={zone} 
                onPlaceClick={setSelectedPlace}
                onAddHall={handleAddHallToZone}
                onAddPlace={handleAddPlaceToZone}
                onAddPlaceToHall={handleAddPlaceToHall}
              />
            ))}
          </div>
        </div>

        {/* Halls indépendants */}
        {marchee.hall.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Halls Indépendants</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                  {marchee.hall.length} hall{marchee.hall.length > 1 ? 's' : ''}
                </span>
                <button
                  onClick={handleAddHallToMarchee}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              {marchee.hall.map(hall => (
                <HallCard 
                  key={hall.id} 
                  hall={hall} 
                  onPlaceClick={setSelectedPlace}
                  onAddPlace={handleAddPlaceToHall}
                />
              ))}
            </div>
          </div>
        )}

        {/* Places directes */}
        {marchee.place.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Places Directes du Marché</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
                  {marchee.place.length} place{marchee.place.length > 1 ? 's' : ''}
                </span>
                <button
                  onClick={handleAddPlaceToMarchee}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <PlaceGrid places={marchee.place} onPlaceClick={setSelectedPlace} />
            </div>
          </div>
        )}

        {/* Section vide pour halls indépendants */}
        {marchee.hall.length === 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Halls Indépendants</h2>
              <button
                onClick={handleAddHallToMarchee}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Créer un hall
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucun hall indépendant pour le moment</p>
            </div>
          </div>
        )}

        {/* Section vide pour places directes */}
        {marchee.place.length === 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Places Directes du Marché</h2>
              <button
                onClick={handleAddPlaceToMarchee}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Créer une place
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucune place directe pour le moment</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <PlaceModal place={selectedPlace} onClose={() => setSelectedPlace(null)} />
      
      <CreateZoneModal
        isOpen={showCreateZone}
        onClose={() => setShowCreateZone(false)}
        marcheeId={marchee.id}
        onSuccess={loadMarcheeData}
      />

      <CreateHallModal
        isOpen={showCreateHall}
        onClose={() => {
          setShowCreateHall(false);
          setHallContext({});
        }}
        marcheeId={marchee.id}
        zoneId={hallContext.zoneId}
        zoneName={hallContext.zoneName}
        onSuccess={loadMarcheeData}
      />

      <CreatePlaceModal
        isOpen={showCreatePlace}
        onClose={() => {
          setShowCreatePlace(false);
          setPlaceContext({});
        }}
        marcheeId={marchee.id}
        zoneId={placeContext.zoneId}
        hallId={placeContext.hallId}
        contextName={placeContext.contextName}
        onSuccess={loadMarcheeData}
      />
    </div>
  );
}