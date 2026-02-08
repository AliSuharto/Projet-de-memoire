'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  ChevronDown, ChevronUp, Building2, Home, MapPin, Users, 
  TrendingUp, ArrowLeft 
} from 'lucide-react';
import API_BASE_URL from '@/services/APIbaseUrl';
import { useParams, useRouter } from 'next/navigation';

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

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

// ────────────────────────────────────────────────
// API & Helpers
// ────────────────────────────────────────────────

const getMarcheeInfo = async (id: string): Promise<MarcheeData> => {
  const res = await fetch(`${API_BASE_URL}/marchees/${id}/info`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

const sortPlaces = (places: Place[]): Place[] => {
  return [...places].sort((a, b) => {
    const numA = parseInt(a.nom.replace(/\D/g, '')) || 999999;
    const numB = parseInt(b.nom.replace(/\D/g, '')) || 999999;
    return numA === numB ? a.nom.localeCompare(b.nom) : numA - numB;
  });
};

// ────────────────────────────────────────────────
// Composants de base
// ────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => (
  <div className="bg-white rounded-xl shadow p-5 transition-transform hover:scale-[1.02]">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 font-medium">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
      <div className={`p-4 rounded-xl ${color} text-white`}>{icon}</div>
    </div>
  </div>
);

interface PlaceCardProps {
  place: Place;
  onClick: () => void;
}

const PlaceCard = ({ place, onClick }: PlaceCardProps) => {
  const isFree = place.statut === 'Libre';

  return (
    <button
      onClick={onClick}
      aria-label={`Place ${place.nom} - ${place.statut}`}
      className={`
        aspect-square rounded-xl font-medium text-white shadow-sm 
        transition-all duration-200 hover:scale-105 active:scale-95 
        flex items-center justify-center text-sm sm:text-base
        ${isFree 
          ? 'bg-gradient-to-br from-emerald-500 to-teal-600' 
          : 'bg-gradient-to-br from-rose-500 to-red-600'
        }
      `}
      title={`${place.nom} • ${place.statut}${place.nomMarchand ? ` • ${place.nomMarchand}` : ''}`}
    >
      {place.nom}
    </button>
  );
};

interface PlaceModalProps {
  place: Place | null;
  onClose: () => void;
}

const PlaceModal = ({ place, onClose }: PlaceModalProps) => {
  if (!place) return null;
  const isFree = place.statut === 'Libre';

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className={`h-2 ${isFree ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold">Place {place.nom}</h3>
            <button 
              onClick={onClose}
              aria-label="Fermer"
              className="text-3xl text-gray-500 hover:text-gray-800 leading-none"
            >
              ×
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-xl ${isFree ? 'bg-emerald-50' : 'bg-rose-50'}`}>
              <MapPin className={`w-8 h-8 ${isFree ? 'text-emerald-600' : 'text-rose-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Statut</p>
              <p className={`text-2xl font-bold ${isFree ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isFree ? 'Libre' : 'Occupée'}
              </p>
            </div>
          </div>

          {!isFree && place.nomMarchand && (
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600">Marchand</p>
              <p className="font-semibold text-lg mt-1">{place.nomMarchand}</p>
              {place.statutMarchand && (
                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {place.statutMarchand}
                </span>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-medium">
              Gérer la place
            </button>
            <button 
              onClick={onClose}
              className="flex-1 bg-gray-200 py-3 rounded-xl hover:bg-gray-300 font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────
// Hall collapsable (réutilisé partout)
// ────────────────────────────────────────────────

interface CollapsibleHallProps {
  hall: Hall;
  defaultOpen?: boolean;
  onPlaceClick: (place: Place) => void;
}

const CollapsibleHall = ({ hall, defaultOpen = false, onPlaceClick }: CollapsibleHallProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className=" border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-3.5 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <Home className="w-5 h-5 text-purple-600" />
          <div>
            <span className="font-semibold">Hall {hall.nom}</span>
            <span className="text-sm text-gray-500 ml-2">({hall.place.length} places)</span>
          </div>
        </div>
        {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {open && (
        <div className="p-5 bg-gray-50/50">
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-14 gap-2.5">
            {sortPlaces(hall.place).map(place => (
              <PlaceCard 
                key={place.id} 
                place={place} 
                onClick={() => onPlaceClick(place)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ────────────────────────────────────────────────
// Composant principal
// ────────────────────────────────────────────────

export default function MarcheeDashboard() {
  const params = useParams();
  const router = useRouter();
  const marketId = params.marketId as string;

  const [marchee, setMarchee] = useState<MarcheeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const [openZones, setOpenZones] = useState<Set<number>>(new Set());
  const [openHallsIndependent, setOpenHallsIndependent] = useState(false);
  const [openPlacesDirect, setOpenPlacesDirect] = useState(false);

  useEffect(() => {
    if (!marketId) {
      setError("Identifiant du marché manquant");
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    getMarcheeInfo(marketId)
      .then(data => {
        if (isMounted) {
          setMarchee(data);
          // Ouvrir automatiquement les zones si peu nombreuses
          if (data.zone.length <= 3) {
            setOpenZones(new Set(data.zone.map(z => z.id)));
          }
        }
      })
      .catch(err => {
        if (isMounted) setError(err.message || "Erreur lors du chargement");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [marketId]);

  const handlePlaceClick = useCallback((place: Place) => {
    setSelectedPlace(place);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des informations du marché...</p>
        </div>
      </div>
    );
  }

  if (error || !marchee) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 p-6 text-center">
        <div>
          <p className="text-xl font-semibold mb-2">Erreur</p>
          <p>{error || "Impossible de charger les données du marché"}</p>
          <button 
            onClick={() => router.back()}
            className="mt-6 px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">

      {/* Header fixe */}
      <header className="sticky top-0 bg-white rounded-b-lg shadow-sm z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Retour"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{marchee.nom}</h1>
              <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                <MapPin className="w-4 h-4" />
                <span>{marchee.adresse}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Statistiques */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard title="Total places" value={marchee.nbrPlace} icon={<MapPin />} color="bg-blue-500" />
          <StatCard title="Places libres" value={marchee.placeLibre} icon={<Users />} color="bg-emerald-500" />
          <StatCard title="Places occupées" value={marchee.placeOccupe} icon={<Building2 />} color="bg-rose-500" />
          <StatCard title="Taux d'occupation" value={`${marchee.occupationRate}%`} icon={<TrendingUp />} color="bg-amber-500" />
        </div>
      </section>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Zones */}
        {marchee.zone.map(zone => {
          const percent = Math.round((zone.placeOccupe / zone.nbrPlace) * 100);
          const isOpen = openZones.has(zone.id);

          return (
            <div key={zone.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => {
                  setOpenZones(prev => {
                    const next = new Set(prev);
                    if (next.has(zone.id)) next.delete(zone.id);
                    else next.add(zone.id);
                    return next;
                  });
                }}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">Zone {zone.nom}</h3>
                    <div className="text-sm text-gray-600 mt-1 flex flex-wrap gap-4">
                      <span>Total: <strong>{zone.nbrPlace}</strong></span>
                      <span className="text-emerald-700">Libres: {zone.placeLibre}</span>
                      <span className="text-rose-700">Occupées: {zone.placeOccupe}</span>
                      <span className="text-gray-500 hidden sm:inline">• {percent}%</span>
                    </div>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 flex-shrink-0" />}
              </button>

              {isOpen && (
                <div className="border-t px-5 pb-6 pt-4 space-y-6 bg-gray-50/60">
                  {zone.hall.map(hall => (
                    <CollapsibleHall 
                      key={hall.id} 
                      hall={hall} 
                      onPlaceClick={handlePlaceClick}
                    />
                  ))}

                  {zone.place.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 text-gray-700">Places directes dans la zone</h4>
                      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-14 gap-2.5">
                        {sortPlaces(zone.place).map(place => (
                          <PlaceCard 
                            key={place.id} 
                            place={place} 
                            onClick={() => handlePlaceClick(place)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Halls indépendants */}
        {marchee.hall.length > 0 && (
          <div className="bg-white rounded-xl  shadow-sm overflow-hidden">
            <button
              onClick={() => setOpenHallsIndependent(!openHallsIndependent)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              aria-expanded={openHallsIndependent}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Home className="w-6 h-6 text-purple-700" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Halls indépendants</h3>
                  <p className="text-sm text-gray-600">
                    {marchee.hall.length} hall{marchee.hall.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              {openHallsIndependent ? <ChevronUp /> : <ChevronDown />}
            </button>

            {openHallsIndependent && (
              <div className="border-t px-5 py-6 space-y-5 bg-gray-50/60">
                {marchee.hall.map(hall => (
                  <CollapsibleHall 
                    key={hall.id} 
                    hall={hall} 
                    onPlaceClick={handlePlaceClick}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Places extérieures / directes du marché */}
        {marchee.place.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => setOpenPlacesDirect(!openPlacesDirect)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              aria-expanded={openPlacesDirect}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Places extérieures / directes</h3>
                  <p className="text-sm text-gray-600">
                    {marchee.place.length} place{marchee.place.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              {openPlacesDirect ? <ChevronUp /> : <ChevronDown />}
            </button>

            {openPlacesDirect && (
              <div className="border-t px-5 py-6 bg-gray-50/60">
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-14 gap-2.5">
                  {sortPlaces(marchee.place).map(place => (
                    <PlaceCard 
                      key={place.id} 
                      place={place} 
                      onClick={() => handlePlaceClick(place)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <PlaceModal 
        place={selectedPlace} 
        onClose={() => setSelectedPlace(null)} 
      />
    </div>
  );
}