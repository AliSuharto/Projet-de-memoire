// components/HallDetailView.tsx
import React, { useState } from 'react';
import HierarchicalBreadcrumb, { BreadcrumbItem } from './HierarchicalBreadcrumb';
import PlacesTable from './(Directeur)/PlaceTable';
import AddPlaceModal from './(Directeur)/DetailsMarket/AddPlace';
 // Ajoutez cette importation

interface Hall {
  id: number;
  nom: string;
  description?: string;
  places?: Place[];
  zoneId?: number;
  zoneName?: string;
}

interface Place {
  id: number;
  nom: string;
}

interface HallDetailViewProps {
  hall: Hall;
  marketName: string;
  onAddPlace: () => void;
  onBackToHalls: () => void;
  onBackToZone?: () => void;
  showZoneInBreadcrumb?: boolean;
  refreshPlaces?: () => void; // Ajoutez cette prop optionnelle
}

const HallDetailView: React.FC<HallDetailViewProps> = ({
  hall,
  marketName,
  onAddPlace,
  onBackToHalls,
  onBackToZone,
  showZoneInBreadcrumb = false,
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
    { name: marketName, type: 'market' }
  ];

  if (showZoneInBreadcrumb && hall.zoneName && onBackToZone) {
    breadcrumbItems.push(
      { name: 'Zones', type: 'zone' },
      { name: hall.zoneName, type: 'zone', onClick: onBackToZone },
      { name: hall.nom, type: 'hall' }
    );
  } else {
    breadcrumbItems.push(
      { name: 'Halls', type: 'hall', onClick: onBackToHalls },
      { name: hall.nom, type: 'hall' }
    );
  }

  return (
    <div className="space-y-4">
      <HierarchicalBreadcrumb items={breadcrumbItems} />
      
      {/* Hall Info */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="text-sm text-blue-600">
          <span>Places: {hall.places?.length || 0}</span>
        </div>
        {showZoneInBreadcrumb && hall.zoneName && (
          <div className="text-sm text-gray-500 mt-1">
            Zone parent: {hall.zoneName}
          </div>
        )}
      </div>

      {/* Places in this Hall */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-lg">Places dans ce hall</h4>
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

        {hall.places && hall.places.length > 0 ? (
          <PlacesTable
            places={hall.places || []}
            onCreatePlace={openModal} // Changé de onAddPlace à openModal
          />
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">Aucune place dans ce hall</p>
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
        contextType="hall"
        contextId={hall.id}
        onSuccess={handlePlaceCreated}
      />

      {/* Quick Stats */}
      
    </div>
  );
};

export default HallDetailView;