'use client';
import axios from 'axios';
import React, { useState } from 'react';
import {  Save, X, AlertCircle } from 'lucide-react';
import PlaceSection from '@/components/(Directeur)/PaceSection';
import HallSection from '@/components/(Directeur)/HallSection';
import ZoneSection from '@/components/(Directeur)/ZoneSection';
import API_BASE_URL from '@/services/APIbaseUrl';

// Type

// Utility functions
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

// Confirmation Modal Component

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  variant = 'save'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay ">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <AlertCircle className={`mr-3 ${variant === 'save' ? 'text-green-500' : 'text-red-500'}`} size={24} />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-md ${
              variant === 'save' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Market Form Component
interface MarketFormProps {
  market: Market;
  onChange: (market: Market) => void;
}

const MarketForm: React.FC<MarketFormProps> = ({ market, onChange }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
  <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">
    Informations du Marché
  </h2>

  <div className="space-y-6">
    {/* Ligne pour Nom et Adresse */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Nom du marché */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Nom du marché <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={market.nom}
          onChange={(e) => onChange({ ...market, nom: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: Marché Central"
        />
      </div>

      {/* Adresse */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Adresse <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={market.adresse}
          onChange={(e) => onChange({ ...market, adresse: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: Rue principale, Ville"
        />
      </div>
    </div>

    {/* Description */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Description
      </label>
      <textarea
        value={market.description}
        onChange={(e) => onChange({ ...market, description: e.target.value })}
        rows={4}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Décrivez le marché (optionnel)"
      />
    </div>
  </div>
</div>
  );
};
// Main Market Manager Component
const MarketManager: React.FC = () => {
  const [market, setMarket] = useState<Market>({
    id: generateId(),
    nom: '',
    adresse: '',
    description: '',
    zones: [],
    halls: [],
    places: []
  });

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleMarketChange = (updatedMarket: Omit<Market, 'zones' | 'halls' | 'places'>) => {
    setMarket(prev => ({ 
      ...prev, 
      ...updatedMarket
    }));
  };

  const handleAddZone = (zone: Zone) => {
    setMarket(prev => ({
      ...prev,
      zones: [...prev.zones, zone]
    }));
  };

  const handleUpdateZone = (index: number, zone: Zone) => {
    setMarket(prev => {
      const newZones = [...prev.zones];
      newZones[index] = zone;
      return { ...prev, zones: newZones };
    });
  };

  const handleAddHall = (hall: Hall) => {
    setMarket(prev => ({
      ...prev,
      halls: [...prev.halls, hall]
    }));
  };

  const handleUpdateHall = (index: number, hall: Hall) => {
    setMarket(prev => {
      const newHalls = [...prev.halls];
      newHalls[index] = hall;
      return { ...prev, halls: newHalls };
    });
  };

  const handleAddPlace = (place: Place) => {
    setMarket(prev => ({
      ...prev,
      places: [...prev.places, place]
    }));
  };

   const handleUpdatePlace = (index: number, place: Place) => {
    setMarket(prev => {
      const newPlaces = [...prev.places];
      newPlaces[index] = place;
      return { ...prev, places: newPlaces };
    });
  };



const handleDeleteZone = (index: number) => {
  setMarket(prev => {
    const newZones = [...prev.zones];
    newZones.splice(index, 1);
    return { ...prev, zones: newZones };
  });
};

const handleDeleteHall = (index: number, level: 'market' | { zoneIndex: number }) => {
  setMarket(prev => {
    if (level === 'market') {
      const newHalls = [...prev.halls];
      newHalls.splice(index, 1);
      return { ...prev, halls: newHalls };
    } else {
      const updatedZones = [...prev.zones];
      updatedZones[level.zoneIndex].halls.splice(index, 1);
      return { ...prev, zones: updatedZones };
    }
  });
};
const handleDeletePlace = (index: number, level: 'market' | { zoneIndex?: number, hallIndex?: number }) => {
  setMarket(prev => {
    if (level === 'market') {
      const newPlaces = [...prev.places];
      newPlaces.splice(index, 1);
      return { ...prev, places: newPlaces };
    } else if (level.zoneIndex !== undefined && level.hallIndex === undefined) {
      // Place in Zone
      const updatedZones = [...prev.zones];
      updatedZones[level.zoneIndex].places.splice(index, 1);
      return { ...prev, zones: updatedZones };
    } else if (level.zoneIndex !== undefined && level.hallIndex !== undefined) {
      // Place in Hall inside Zone
      const updatedZones = [...prev.zones];
      updatedZones[level.zoneIndex].halls[level.hallIndex].places.splice(index, 1);
      return { ...prev, zones: updatedZones };
    }
    return prev;
  });
};


const removeIds = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(item => removeIds(item));
  } else if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (key !== 'id') {
        newObj[key] = removeIds(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
};














  const handleSave = async () => {
  console.log('Marché sauvegardé:', market);
  setShowSaveModal(false);

  try {
    // Récupérer le token depuis localStorage (ou un autre storage)
    const cleanedMarket = removeIds(market); //  On nettoie l'objet
    const token = localStorage.getItem('token');
    console.log('Données du marché à envoyer:', cleanedMarket);

    // Vérifier que le token existe
    if (!token) {
      console.error('Aucun token trouvé. Veuillez vous connecter.');
      return;
    }

    // Envoi de la requête POST avec Bearer Token
    const response = await axios.post(
      `${API_BASE_URL}/marchees`, // Remplace par ton endpoint exact
      cleanedMarket, // Données à envoyer
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Ajout du Bearer token
        },
      }
    );

    console.log('Marché enregistré avec succès:', response.data);

    // Réinitialiser le formulaire après une sauvegarde réussie
    setMarket({ 
        id: generateId(),
        nom: '',
        adresse: '',
        description: '',
        zones: [],
        halls: [],
        places: []
        });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du marché:', error);
  }
};

  const handleCancel = () => {
    setMarket({
      id: generateId(),
      nom: '',
      adresse: '',
      description: '',
      zones: [],
      halls: [],
      places: []
    });
    setShowCancelModal(false);
  };

  const getTotalCounts = () => {
    let totalHalls = market.halls.length;
    let totalPlaces = market.places.length;

    market.zones.forEach(zone => {
      totalHalls += zone.halls.length;
      totalPlaces += zone.places.length;
      zone.halls.forEach(hall => {
        totalPlaces += hall.places.length;
      });
    });

    market.halls.forEach(hall => {
      totalPlaces += hall.places.length;
    });

    return { totalHalls, totalPlaces };
  };

  const getSaveMessage = () => {
    const { totalHalls, totalPlaces } = getTotalCounts();
    return `Voulez-vous vraiment sauvegarder ce marché ?
    
Nom: ${market.nom || 'Non défini'}
Zones: ${market.zones.length}
Halls: ${totalHalls} 
Places: ${totalPlaces}`;
  };

  return (
  <div className="min-h-screen bg-gray-100 p-4">
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-500 mb-8">Créer un Marché</h1>

      <MarketForm market={market} onChange={handleMarketChange} />

      {/* Conteneur flex pour les trois sections */}
             <div className="flex flex-col space-y-6 mt-6">
  {/* ZoneSection */}
  <div className="bg-white shadow-md rounded-xl p-6 flex flex-col hover:shadow-lg transition-shadow duration-300">
    <h2 className="text-xl font-bold text-blue-700 mb-4 border-b-2 border-blue-200 pb-2">
      Zones
    </h2>
    <div className="flex-1">
      <ZoneSection
        zones={market.zones}
        onAddZone={handleAddZone}
        onUpdateZone={handleUpdateZone}
        onDeleteZone={handleDeleteZone}
      />
    </div>
  </div>

  {/* HallSection */}
  <div className="bg-white shadow-md rounded-xl p-6 flex flex-col hover:shadow-lg transition-shadow duration-300">
    <h2 className="text-xl font-bold text-green-700 mb-4 border-b-2 border-green-200 pb-2">
      Halls
    </h2>
    <div className="flex-1">
      <HallSection
        halls={market.halls}
        onAddHall={handleAddHall}
        onUpdateHall={handleUpdateHall}
        onDeleteHall={(index) => handleDeleteHall(index, 'market')}
        level="market"
      />
    </div>
  </div>

  {/* PlaceSection */}
  <div className="bg-white shadow-md rounded-xl p-6 flex flex-col hover:shadow-lg transition-shadow duration-300">
    <h2 className="text-xl font-bold text-purple-700 mb-4 border-b-2 border-purple-200 pb-2">
      Places
    </h2>
    <div className="flex-1">
      <PlaceSection
        places={market.places}
        onAddPlace={handleAddPlace}
        onUpdatePlace={handleUpdatePlace}
        onDeletePlace={(index) => handleDeletePlace(index, 'market')}
        level="market"
      />
    </div>
  </div>
</div>





      {/* Boutons d'action */}
      <div className="flex justify-end space-x-4 mt-8">
        <button
          onClick={() => setShowCancelModal(true)}
          className="flex items-center px-6 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50"
        >
          <X size={16} className="mr-2" />
          Annuler
        </button>
        <button
          onClick={() => setShowSaveModal(true)}
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Save size={16} className="mr-2" />
          Sauvegarder
        </button>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showCancelModal}
        title="Annuler la création"
        message="Voulez-vous vraiment annuler la création de ce marché ? Toutes les données saisies seront perdues."
        confirmText="Oui, annuler"
        cancelText="Continuer"
        onConfirm={handleCancel}
        onCancel={() => setShowCancelModal(false)}
        variant="cancel"
      />
      <ConfirmationModal
        isOpen={showSaveModal}
        title="Sauvegarder le marché"
        message={getSaveMessage()}
        confirmText="Oui, sauvegarder"
        cancelText="Annuler"
        onConfirm={handleSave}
        onCancel={() => setShowSaveModal(false)}
        variant="save"
      />
    </div>
  </div>
);

};

export default MarketManager;
