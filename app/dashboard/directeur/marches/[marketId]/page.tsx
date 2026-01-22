'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Building2, Home, MapPin, Users, TrendingUp, ArrowLeft, Plus, Trash2 } from 'lucide-react';
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

// API Functions
async function getMarcheeInfo(id: string): Promise<MarcheeData> {
  const response = await fetch(`${API_BASE_URL}/marchees/${id}/info`);
  
  if (!response.ok) {
    throw new Error(`Erreur lors du chargement du marché: ${response.status}`);
  }
  return response.json();
}

async function deleteZone(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/public/zones/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Erreur lors de la suppression de la zone: ${response.status}`);
  }
}

async function deleteHall(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/public/salles/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Erreur lors de la suppression du hall: ${response.status}`);
  }
}

async function deletePlace(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/public/places/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Erreur lors de la suppression de la place: ${response.status}`);
  }
}

// Components
const ConfirmDeleteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isDeleting: boolean;
}> = ({ isOpen, onClose, onConfirm, title, message, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Supprimer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  color: string; 
}> = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-2 sm:p-3 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

const PlaceGrid: React.FC<{ 
  places: Place[]; 
  onPlaceClick: (place: Place) => void;
  onDeletePlace: (placeId: number, placeName: string) => void;
}> = ({ places, onPlaceClick, onDeletePlace }) => (
  <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-2 mt-4">
    {places.map(place => (
      <div key={place.id} className="relative group">
        <button
          onClick={() => onPlaceClick(place)}
          className={`
            w-full px-2 py-2 rounded text-xs font-medium transition-all transform hover:scale-105
            ${place.statut === 'Libre' 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-red-500 hover:bg-red-600 text-white'
            }
          `}
          title={`${place.nom} - ${place.statut}`}
        >
          {place.nom}
        </button>
        {place.statut === 'Libre' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeletePlace(place.id, place.nom);
            }}
            className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700"
            title="Supprimer cette place"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    ))}
  </div>
);

const HallCard: React.FC<{ 
  hall: Hall; 
  onPlaceClick: (place: Place) => void;
  onAddPlace: (hallId: number, hallName: string) => void;
  onDeleteHall: (hallId: number, hallName: string) => void;
  onDeletePlace: (placeId: number, placeName: string) => void;
}> = ({ hall, onPlaceClick, onAddPlace, onDeleteHall, onDeletePlace }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const occupationPercent = hall.nbrPlace > 0 ? Math.round((hall.placeOccupe / hall.nbrPlace) * 100) : 0;
  const hasContent = hall.place.length > 0;

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-3">
      {/* En-tête cliquable sans boutons imbriqués */}
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-3 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Home className="w-5 h-5 text-purple-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Hall {hall.nom}</h4>
                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-semibold whitespace-nowrap">
                  {hall.place.length} place{hall.place.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-gray-600 flex-wrap">
                <span>Total: {hall.nbrPlace}</span>
                <span className="text-green-600">Libres: {hall.placeLibre}</span>
                <span className="text-red-600">Occupées: {hall.placeOccupe}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 ml-2">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-gray-700">{occupationPercent}%</div>
              <div className="w-20 sm:w-24 h-2 bg-gray-200 rounded-full mt-1">
                <div 
                  className="h-full bg-purple-600 rounded-full transition-all"
                  style={{ width: `${occupationPercent}%` }}
                />
              </div>
            </div>
            {!hasContent && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteHall(hall.id, `Hall ${hall.nom}`);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                title="Supprimer ce hall"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-4 pl-2">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h5 className="text-sm font-semibold text-gray-700">Places du hall</h5>
            <button
              onClick={() => onAddPlace(hall.id, `Hall ${hall.nom}`)}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter une place
            </button>
          </div>
          {hall.place.length > 0 ? (
            <PlaceGrid places={hall.place} onPlaceClick={onPlaceClick} onDeletePlace={onDeletePlace} />
          ) : (
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Aucune place dans ce hall</p>
              <p className="text-xs text-gray-400 mt-1">Cliquez sur "Ajouter une place" pour commencer</p>
            </div>
          )}
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
  onDeleteZone: (zoneId: number, zoneName: string) => void;
  onDeleteHall: (hallId: number, hallName: string) => void;
  onDeletePlace: (placeId: number, placeName: string) => void;
}> = ({ zone, onPlaceClick, onAddHall, onAddPlace, onAddPlaceToHall, onDeleteZone, onDeleteHall, onDeletePlace }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const occupationPercent = zone.nbrPlace > 0 ? Math.round((zone.placeOccupe / zone.nbrPlace) * 100) : 0;
  const hasContent = zone.hall.length > 0 || zone.place.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 overflow-hidden">
      {/* En-tête sans boutons imbriqués */}
      <div className="w-full p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div 
            className="flex items-center gap-3 sm:gap-4 flex-1 cursor-pointer hover:opacity-80 transition-opacity min-w-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Zone {zone.nom}</h3>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold whitespace-nowrap">
                  {zone.hall.length} hall{zone.hall.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex gap-3 sm:gap-6 mt-2 text-xs sm:text-sm flex-wrap">
                <span className="text-gray-600">Total: <strong>{zone.nbrPlace}</strong></span>
                <span className="text-green-600">Libres: <strong>{zone.placeLibre}</strong></span>
                <span className="text-red-600">Occupées: <strong>{zone.placeOccupe}</strong></span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-lg font-bold text-gray-900">{occupationPercent}%</div>
              <div className="w-24 sm:w-32 h-3 bg-gray-200 rounded-full mt-1">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${occupationPercent}%` }}
                />
              </div>
            </div>
            {!hasContent && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteZone(zone.id, `Zone ${zone.nom}`);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                title="Supprimer cette zone"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" /> : <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5 pt-0 border-t border-gray-100">
          <div className="flex flex-wrap gap-2 mt-4 mb-4">
            <button
              onClick={() => onAddHall(zone.id, `Zone ${zone.nom}`)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs sm:text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Ajouter un </span>Hall
            </button>
            <button
              onClick={() => onAddPlace(zone.id, `Zone ${zone.nom}`)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Ajouter une </span>Place
            </button>
          </div>

          {zone.hall.length > 0 ? (
            <div className="space-y-3 mt-4">
              {zone.hall.map(hall => (
                <HallCard 
                  key={hall.id} 
                  hall={hall} 
                  onPlaceClick={onPlaceClick}
                  onAddPlace={onAddPlaceToHall}
                  onDeleteHall={onDeleteHall}
                  onDeletePlace={onDeletePlace}
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center mt-4">
              <Home className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600">Aucun hall dans cette zone</p>
              <p className="text-xs text-gray-400 mt-1">Cliquez sur "Ajouter un hall" pour commencer</p>
            </div>
          )}

          {zone.place.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <h5 className="text-sm font-semibold text-gray-700">Places directes de la zone</h5>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                  {zone.place.length} place{zone.place.length > 1 ? 's' : ''}
                </span>
              </div>
              <PlaceGrid places={zone.place} onPlaceClick={onPlaceClick} onDeletePlace={onDeletePlace} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const PlaceModal: React.FC<{ 
  place: Place | null; 
  onClose: () => void; 
  onDeletePlace: (placeId: number, placeName: string) => void 
}> = ({ place, onClose, onDeletePlace }) => {
  if (!place) return null;

  const isOccupee = place.statut === 'Occupée';
  const hasMarchand = Boolean(place.nomMarchand);
  const canDelete = place.statut === 'Libre';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Détails de la Place</h3>
          <div className="flex items-center gap-2">
            {canDelete && (
              <button
                onClick={() => {
                  onDeletePlace(place.id, place.nom);
                  onClose();
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Supprimer cette place"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>
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
              <p className="text-sm text-gray-600 mb-2">Statut</p>
              {!isOccupee ? (
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Libre
                </span>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Occupée
                  </span>
                  {hasMarchand && (
                    <>
                      <span className="text-sm text-gray-700">par <strong>{place.nomMarchand}</strong></span>
                      {place.statutMarchand && (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                          {place.statutMarchand}
                        </span>
                      )}
                    </>
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

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'zone' | 'hall' | 'place' | null;
    id: number | null;
    name: string;
  }>({ isOpen: false, type: null, id: null, name: '' });
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteZone = (zoneId: number, zoneName: string) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'zone',
      id: zoneId,
      name: zoneName
    });
  };

  const handleDeleteHall = (hallId: number, hallName: string) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'hall',
      id: hallId,
      name: hallName
    });
  };

  const handleDeletePlace = (placeId: number, placeName: string) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'place',
      id: placeId,
      name: placeName
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id || !deleteConfirm.type) return;

    setIsDeleting(true);
    try {
      if (deleteConfirm.type === 'zone') {
        await deleteZone(deleteConfirm.id);
      } else if (deleteConfirm.type === 'hall') {
        await deleteHall(deleteConfirm.id);
      } else if (deleteConfirm.type === 'place') {
        await deletePlace(deleteConfirm.id);
      }
      
      // Reload data after successful deletion
      await loadMarcheeData();
      
      // Close modal
      setDeleteConfirm({ isOpen: false, type: null, id: null, name: '' });
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert('Erreur lors de la suppression. Veuillez réessayer.');
    } finally {
      setIsDeleting(false);
    }
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
      {/* Header Responsive */}
      <div className="top-19 left-50 right-0 bg-white border-b-2 border-gray-300 shadow-sm z-10">
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

            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateZone(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Zone</span>
              </button>
              <button
                onClick={handleAddHallToMarchee}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium whitespace-nowrap"
              >
<Plus className="w-4 h-4" />
<span className="hidden sm:inline">Hall</span>
</button>
<button
             onClick={handleAddPlaceToMarchee}
             className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium whitespace-nowrap"
           >
<Plus className="w-4 h-4" />
<span className="hidden sm:inline">Place</span>
</button>
</div>
</div>
</div>
</div>
{/* Stats */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-5">
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
            onDeleteZone={handleDeleteZone}
            onDeleteHall={handleDeleteHall}
            onDeletePlace={handleDeletePlace}
          />
        ))}
      </div>
      {marchee.zone.length === 0 && (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center mb-8">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600 mb-2">Aucune zone disponible</p>
          <p className="text-sm text-gray-400">Cliquez sur le bouton "Zone" pour en créer une</p>
        </div>
      )}
    </div>

    {/* Halls directs du marché */}
    {marchee.hall && marchee.hall.length > 0 && (
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Halls du Marché</h2>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
            {marchee.hall.length} hall{marchee.hall.length > 1 ? 's' : ''}
          </span>
        </div>
        <div className="space-y-3">
          {marchee.hall.map(hall => (
            <HallCard 
              key={hall.id} 
              hall={hall} 
              onPlaceClick={setSelectedPlace}
              onAddPlace={handleAddPlaceToHall}
              onDeleteHall={handleDeleteHall}
              onDeletePlace={handleDeletePlace}
            />
          ))}
        </div>
      </div>
    )}

    {/* Places directes du marché */}
    {marchee.place && marchee.place.length > 0 && (
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Places du Marché</h2>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
            {marchee.place.length} place{marchee.place.length > 1 ? 's' : ''}
          </span>
        </div>
        <PlaceGrid places={marchee.place} onPlaceClick={setSelectedPlace} onDeletePlace={handleDeletePlace} />
      </div>
    )}
  </div>

  {/* Modals */}
  <CreateZoneModal
    isOpen={showCreateZone}
    onClose={() => setShowCreateZone(false)}
    marcheeId={marchee.id}
    onSuccess={loadMarcheeData}
  /> 
  <CreateHallModal
    isOpen={showCreateHall}
    onClose={() => { setShowCreateHall(false); setHallContext({}); }}
    marcheeId={marchee.id}
    zoneId={hallContext.zoneId}
    zoneName={hallContext.zoneName}
    onSuccess={loadMarcheeData}
  />
  <CreatePlaceModal
    isOpen={showCreatePlace}
    onClose={() => { setShowCreatePlace(false); setPlaceContext({}); }}
    marcheeId={placeContext.marcheeId}
    zoneId={placeContext.zoneId}
    hallId={placeContext.hallId}
    contextName={placeContext.contextName}
    onSuccess={loadMarcheeData}
  />
  <PlaceModal 
    place={selectedPlace} 
    onClose={() => setSelectedPlace(null)} 
    onDeletePlace={handleDeletePlace} 
  />
  <ConfirmDeleteModal
    isOpen={deleteConfirm.isOpen}
    onClose={() => setDeleteConfirm({ isOpen: false, type: null, id: null, name: '' })}
    onConfirm={confirmDelete}
    title={`Supprimer ${deleteConfirm.name}`}
    message={`Êtes-vous sûr de vouloir supprimer ${deleteConfirm.name} ? Cette action est irréversible.`}
    isDeleting={isDeleting}
  />
</div>
  );
}