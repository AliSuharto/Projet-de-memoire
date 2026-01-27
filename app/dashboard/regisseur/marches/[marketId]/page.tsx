'use client';

import React, { useEffect, useState } from 'react';
import { 
  ChevronDown, ChevronUp, Building2, Home, MapPin, Users, 
  TrendingUp, ArrowLeft 
} from 'lucide-react';
import API_BASE_URL from '@/services/APIbaseUrl';
import { useParams, useRouter } from 'next/navigation';

// Types (inchangés)
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

// API
async function getMarcheeInfo(id: string): Promise<MarcheeData> {
  const res = await fetch(`${API_BASE_URL}/marchees/${id}/info`);
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

// Tri des places (numérique quand possible)
function sortPlaces(places: Place[]): Place[] {
  return [...places].sort((a, b) => {
    const numA = parseInt(a.nom.replace(/\D/g, '')) || 999999;
    const numB = parseInt(b.nom.replace(/\D/g, '')) || 999999;
    if (numA === numB) return a.nom.localeCompare(b.nom);
    return numA - numB;
  });
}

// ────────────────────────────────────────────────
// Composants de base
// ────────────────────────────────────────────────

const StatCard = ({ title, value, icon, color }: {
  title: string; value: string | number; icon: React.ReactNode; color: string;
}) => (
  <div className="bg-white rounded-xl shadow border p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
      <div className={`p-4 rounded-xl ${color} text-white`}>{icon}</div>
    </div>
  </div>
);

const PlaceCard = ({ place, onClick }: { place: Place; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`
      aspect-square rounded-xl font-medium text-white shadow-sm transition-all
      hover:scale-105 active:scale-95 flex items-center justify-center text-sm
      ${place.statut === 'Libre'
        ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
        : 'bg-gradient-to-br from-rose-500 to-red-600'
      }
    `}
    title={`${place.nom} • ${place.statut}${place.nomMarchand ? ` • ${place.nomMarchand}` : ''}`}
  >
    {place.nom}
  </button>
);

const PlaceModal = ({ place, onClose }: { place: Place | null; onClose: () => void }) => {
  if (!place) return null;
  const isFree = place.statut === 'Libre';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className={`h-2 ${isFree ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        <div className="p-6 space-y-5">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold">Place {place.nom}</h3>
            <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">×</button>
          </div>
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-xl ${isFree ? 'bg-emerald-50' : 'bg-rose-50'}`}>
              <MapPin className={`w-7 h-7 ${isFree ? 'text-emerald-600' : 'text-rose-600'}`} />
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
              <p className="font-semibold text-lg">{place.nomMarchand}</p>
              {place.statutMarchand && (
                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {place.statutMarchand}
                </span>
              )}
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <button className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700">Gérer</button>
            <button onClick={onClose} className="flex-1 bg-gray-200 py-3 rounded-xl hover:bg-gray-300">Fermer</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant Hall collapsable (utilisé partout)
const CollapsibleHall = ({ hall, defaultOpen = false }: { hall: Hall; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-3.5 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
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
        <div className="p-5 bg-gray-50/40">
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-14 gap-2.5">
            {sortPlaces(hall.place).map(p => (
              <PlaceCard key={p.id} place={p} onClick={() => {}} /> // ← à connecter au modal
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ────────────────────────────────────────────────
// Vue principale (tout collapsable)
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
      setError("ID manquant");
      setLoading(false);
      return;
    }
    setLoading(true);
    getMarcheeInfo(marketId)
      .then(data => {
        setMarchee(data);
        // Ouvrir les zones par défaut si peu nombreuses
        if (data.zone.length <= 3) {
          setOpenZones(new Set(data.zone.map(z => z.id)));
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [marketId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Chargement du marché...</p>
        </div>
      </div>
    );
  }

  if (error || !marchee) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 p-6">
        {error || "Impossible de charger les données"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">

      {/* Header */}
      <div className="sticky top-0 bg-white border-b shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded">
              <ArrowLeft />
            </button>
            <div>
              <h1 className="text-2xl font-bold">{marchee.nom}</h1>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <MapPin className="w-4 h-4" /> {marchee.adresse}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard title="Total" value={marchee.nbrPlace} icon={<MapPin />} color="bg-blue-500" />
          <StatCard title="Libres" value={marchee.placeLibre} icon={<Users />} color="bg-emerald-500" />
          <StatCard title="Occupées" value={marchee.placeOccupe} icon={<Building2 />} color="bg-rose-500" />
          <StatCard title="Taux" value={`${marchee.occupationRate}%`} icon={<TrendingUp />} color="bg-amber-500" />
        </div>
      </div>

      {/* Contenu principal - tout collapsable */}
      <div className="max-w-7xl mx-auto px-4 space-y-5">

        {/* 1. Les zones */}
        {marchee.zone.map(zone => {
          const percent = Math.round((zone.placeOccupe / zone.nbrPlace) * 100);
          const isOpen = openZones.has(zone.id);

          return (
            <div key={zone.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <button
                onClick={() => {
                  const next = new Set(openZones);
                  if (next.has(zone.id)) next.delete(zone.id);
                  else next.add(zone.id);
                  setOpenZones(next);
                }}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 text-left"
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
                <div className="border-t px-5 pb-5 pt-3 space-y-5 bg-gray-50/60">

                  {/* Halls de la zone - chacun collapsable */}
                  {zone.hall.map(hall => (
                    <CollapsibleHall key={hall.id} hall={hall} />
                  ))}

                  {/* Places directes dans la zone */}
                  {zone.place.length > 0 && (
                    <div className="pt-3">
                      <h4 className="font-medium mb-3 text-gray-700">Places directes (zone {zone.nom})</h4>
                      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-14 gap-2.5">
                        {sortPlaces(zone.place).map(p => (
                          <PlaceCard key={p.id} place={p} onClick={() => setSelectedPlace(p)} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* 2. Halls indépendants (bloc global collapsable + halls internes collapsables) */}
        {marchee.hall.length > 0 && (
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <button
              onClick={() => setOpenHallsIndependent(!openHallsIndependent)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Home className="w-6 h-6 text-purple-700" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Halls indépendants</h3>
                  <p className="text-sm text-gray-600">{marchee.hall.length} hall{marchee.hall.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              {openHallsIndependent ? <ChevronUp /> : <ChevronDown />}
            </button>

            {openHallsIndependent && (
              <div className="border-t px-5 py-5 space-y-4 bg-gray-50/60">
                {marchee.hall.map(hall => (
                  <CollapsibleHall key={hall.id} hall={hall} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. Places extérieures / directes du marché */}
        {marchee.place.length > 0 && (
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <button
              onClick={() => setOpenPlacesDirect(!openPlacesDirect)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Places extérieures / directes</h3>
                  <p className="text-sm text-gray-600">{marchee.place.length} place{marchee.place.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              {openPlacesDirect ? <ChevronUp /> : <ChevronDown />}
            </button>

            {openPlacesDirect && (
              <div className="border-t px-5 py-5 bg-gray-50/60">
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-14 gap-2.5">
                  {sortPlaces(marchee.place).map(p => (
                    <PlaceCard key={p.id} place={p} onClick={() => setSelectedPlace(p)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <PlaceModal place={selectedPlace} onClose={() => setSelectedPlace(null)} />
    </div>
  );
}