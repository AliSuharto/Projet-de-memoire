// components/ZoneDetailView.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import HierarchicalBreadcrumb, { BreadcrumbItem } from '../HierarchicalBreadcrumb';
import PlacesTable from './PlaceTable'; // Ajoutez cette importation
import AddPlaceModal from './DetailsMarket/AddPlace';

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

interface ZoneDetailViewProps {
  zone: Zone;
  marketName: string;
  onAddHall: () => void;
  onAddPlace: () => void;
  onHallClick: (hall: Hall) => void;
  onBackToZones: () => void;
  refreshPlaces?: () => void; // Ajoutez cette prop optionnelle
}

const ZoneDetailView: React.FC<ZoneDetailViewProps> = ({
  zone,
  marketName,
  onAddHall,
  onAddPlace,
  onHallClick,
  onBackToZones,
  refreshPlaces
}) => {
  // État pour gérer l'ouverture/fermeture du modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fonction pour ouvrir le modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Fonction pour fermer le modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Fonction appelée après succès de création d'une place
  const handlePlaceCreated = () => {
    closeModal();
    if (refreshPlaces) {
      refreshPlaces();
    }
    // Optionnellement, vous pouvez aussi appeler onAddPlace si nécessaire
    // onAddPlace();
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { name: marketName, type: 'market' },
    { name: 'Zones', type: 'zone', onClick: onBackToZones },
    { name: zone.nom, type: 'zone' }
  ];

  return (
    <div className="space-y-4">
      <HierarchicalBreadcrumb items={breadcrumbItems} />
      
      {/* Zone Info */}
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <div className="text-sm text-blue-600 space-x-4">
          <span>Halls: {zone.halls?.length || 0}</span>
          <span>Places directes: {zone.places?.length || 0}</span>
        </div>
      </div>

      {/* Halls in this Zone */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-lg">Halls dans cette zone</h4>
          <button 
            onClick={onAddHall}
            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            title="Ajouter un hall"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {zone.halls && zone.halls.length > 0 ? (
          zone.halls.map((hall) => (
            <div 
              key={hall.id} 
              className="bg-blue-50 p-4 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => onHallClick(hall)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-semibold text-md mb-1">{hall.nom}</h5>
                  <p className="text-gray-600 text-sm mb-1">
                    {hall.description || "Aucune description"}
                  </p>
                  <div className="text-sm text-blue-600">
                    <span>Places: {hall.places?.length || 0}</span>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">Aucun hall dans cette zone</p>
            <button
              onClick={onAddHall}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
            >
              Créer le premier hall
            </button>
          </div>
        )}
      </div>

      {/* Direct Places in Zone */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-lg">Places directes dans cette zone</h4>
          <button 
            onClick={openModal} // Changé de onAddPlace à openModal
            className="p-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            title="Ajouter une place"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {zone.places && zone.places.length > 0 ? (
          <PlacesTable
            places={zone.places || []}
            onCreatePlace={openModal} // Changé de onAddPlace à openModal
          />
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">Aucune place directe dans cette zone</p>
            <button
              onClick={openModal} // Changé de onAddPlace à openModal
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md"
            >
              Créer la première place
            </button>
          </div>
        )}
      </div>

      {/* Modal pour ajouter une place */}
      <AddPlaceModal
        isOpen={isModalOpen}
        onClose={closeModal}
        contextType="zone"
        contextId={zone.id}
        onSuccess={handlePlaceCreated}
      />
    </div>
  );
};

export default ZoneDetailView;