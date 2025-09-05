// components/SectionsListView.tsx
import React from 'react';
import Link from 'next/link';

interface Zone {
  id: number;
  nom: string;
  description?: string;
  places?: Place[];
  halls?: Hall[];
}

interface Place {
  id: number;
  nom: string;
}

interface Hall {
  id: number;
  nom: string;
  description?: string;
  places?: Place[];
}

interface SectionsListViewProps {
  activeSection: 'zones' | 'halls' | 'places';
  zones?: Zone[];
  halls?: Hall[];
  places?: Place[];
  onZoneClick?: (zone: Zone) => void;
  onHallClick?: (hall: Hall) => void;
  onCreateZone?: () => void;
  onCreateHall?: () => void;
  onCreatePlace?: () => void;
}

const SectionsListView: React.FC<SectionsListViewProps> = ({
  activeSection,
  zones = [],
  halls = [],
  places = [],
  onZoneClick,
  onHallClick,
  onCreateZone,
  onCreateHall,
  onCreatePlace
}) => {
  if (activeSection === 'zones') {
    return (
      <div className="space-y-3">
        {zones.length > 0 ? (
          zones.map((zone) => (
            <div 
              key={zone.id} 
              className="bg-gray-50 p-4 rounded-lg border cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onZoneClick?.(zone)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{zone.nom}</h3>
                  <div className="text-sm text-blue-600 space-x-4 mb-2">
                    <span>halls: {zone.halls?.length || 0}</span>
                    <span>places: {zone.places?.length || 0}</span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Description: {zone.description || "Aucune description"}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/dashboard/directeur/zones/${zone.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Détails →
                  </Link>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Aucune zone disponible</p>
            <button
              onClick={onCreateZone}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md"
            >
              Créer la première zone
            </button>
          </div>
        )}
      </div>
    );
  }

  if (activeSection === 'halls') {
    return (
      <div className="space-y-3">
        {halls.length > 0 ? (
          halls.map((hall) => (
            <div 
              key={hall.id} 
              className="bg-gray-50 p-4 rounded-lg border cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onHallClick?.(hall)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{hall.nom}</h3>
                  {hall.description && (
                    <p className="text-gray-600 text-sm mb-1">{hall.description}</p>
                  )}
                  <div className="text-sm text-blue-600">
                    <span>places: {hall.places?.length || 0}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/dashboard/directeur/halls/${hall.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Détails →
                  </Link>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Aucun hall disponible</p>
            <button
              onClick={onCreateHall}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
            >
              Créer le premier hall
            </button>
          </div>
        )}
      </div>
    );
  }

  if (activeSection === 'places') {
    return (
      <div className="space-y-3">
        {places.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {places.map((place) => (
              <div key={place.id} className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <h6 className="font-medium text-sm">{place.nom}</h6>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Aucune place disponible</p>
            <button
              onClick={onCreatePlace}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md"
            >
              Créer la première place
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default SectionsListView;