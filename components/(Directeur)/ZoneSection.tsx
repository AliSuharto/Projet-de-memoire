import React from 'react';
import { Plus,X} from 'lucide-react';
import PlaceSection from './PaceSection';
import HallSection from './HallSection';



interface Place {
  id: string;
  name: string;
  identifier: string;
}



interface Zone {
  id: string;
  name: string;
  identifier: string;
  halls: Hall[];
  places: Place[];
}



interface ZoneSectionProps {
  zones: Zone[];
  onAddZone: (zone: Zone) => void;
  onUpdateZone: (index: number, zone: Zone) => void;
  onDeleteZone: (index: number) => void;
}
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

const ZoneSection: React.FC<ZoneSectionProps> = ({ 
  zones, 
  onAddZone, 
  onUpdateZone,
    onDeleteZone
}) => {
  const handleAddZone = () => {
    const newZone: Zone = {
      id: generateId(),
      name: '',
      identifier: '',
      halls: [],
      places: []
    };
    onAddZone(newZone);
  };

  const handleUpdateZoneHall = (zoneIndex: number, hallIndex: number, hall: Hall) => {
    const updatedZone = { ...zones[zoneIndex] };
    updatedZone.halls[hallIndex] = hall;
    onUpdateZone(zoneIndex, updatedZone);
  };

  const handleAddZoneHall = (zoneIndex: number, hall: Hall) => {
    const updatedZone = { ...zones[zoneIndex] };
    updatedZone.halls = [...updatedZone.halls, hall];
    onUpdateZone(zoneIndex, updatedZone);
  };

  const handleUpdateZonePlace = (zoneIndex: number, placeIndex: number, place: Place) => {
    const updatedZone = { ...zones[zoneIndex] };
    updatedZone.places[placeIndex] = place;
    onUpdateZone(zoneIndex, updatedZone);
  };

  const handleAddZonePlace = (zoneIndex: number, place: Place) => {
    const updatedZone = { ...zones[zoneIndex] };
    updatedZone.places = [...updatedZone.places, place];
    onUpdateZone(zoneIndex, updatedZone);
  };


const handleDeleteHallFromZone = (zoneIndex: number, hallIndex: number) => {
    const updatedZone = { ...zones[zoneIndex], halls: zones[zoneIndex].halls.filter((_, i) => i !== hallIndex) };
    onUpdateZone(zoneIndex, updatedZone);
  };

  const handleDeletePlaceFromZone = (zoneIndex: number, placeIndex: number) => {
    const updatedZone = { ...zones[zoneIndex], places: zones[zoneIndex].places.filter((_, i) => i !== placeIndex) };
    onUpdateZone(zoneIndex, updatedZone);
  };

  const handleDeletePlaceFromHall = (zoneIndex: number, hallIndex: number, placeIndex: number) => {
    const updatedZone = { ...zones[zoneIndex] };
    const updatedHalls = updatedZone.halls.map((h, i) =>
      i === hallIndex ? { ...h, places: h.places.filter((_, p) => p !== placeIndex) } : h
    );
    updatedZone.halls = updatedHalls;
    onUpdateZone(zoneIndex, updatedZone);
  };











  return (
    <div className="mt-6">
      <button
        onClick={handleAddZone}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-4"
      >
        <Plus size={16} className="mr-2" />
        Ajouter Zone
        {zones.length > 0 && (
          <span className="ml-2 bg-blue-800 text-white px-2 py-1 rounded-full text-xs">
            {zones.length}
          </span>
        )}
      </button>
      
      {zones.map((zone, zoneIndex) => (
        <div key={zone.id} className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
          
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-blue-800">Zone</h3>
            <button
                onClick={() => onDeleteZone(zoneIndex)}
                className="text-red-600 hover:text-red-800"
            >
                <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la zone
              </label>
              <input
                type="text"
                value={zone.name}
                onChange={(e) => onUpdateZone(zoneIndex, { ...zone, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nom de la zone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Identifiant
              </label>
              <input
                type="text"
                value={zone.identifier}
                onChange={(e) => onUpdateZone(zoneIndex, { ...zone, identifier: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Identifiant unique"
              />
            </div>
          </div>
          
          <HallSection
            halls={zone.halls}
            onAddHall={(hall) => handleAddZoneHall(zoneIndex, hall)}
            onUpdateHall={(hallIndex, hall) => handleUpdateZoneHall(zoneIndex, hallIndex, hall)}
            onDeleteHall={(hallIndex) => handleDeleteHallFromZone(zoneIndex, hallIndex)} // ✅ correction
            onDeletePlaceInHall={(hallIndex, placeIndex) => handleDeletePlaceFromHall(zoneIndex, hallIndex, placeIndex)} // ✅ transmet au HallSection
            level="zone"
          />

          <PlaceSection
            places={zone.places}
            onAddPlace={(place) => handleAddZonePlace(zoneIndex, place)}
            onUpdatePlace={(placeIndex, place) => handleUpdateZonePlace(zoneIndex, placeIndex, place)}
            onDeletePlace={(placeIndex) => handleDeletePlaceFromZone(zoneIndex, placeIndex)}
            level="zone"
          />
        </div>
      ))}
    </div>
  );
};
export default ZoneSection;