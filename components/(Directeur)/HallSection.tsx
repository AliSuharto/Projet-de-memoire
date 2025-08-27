import React from "react";
import { Plus,X} from "lucide-react";
import PlaceSection from "./PaceSection";

// Hall Section Component
interface HallSectionProps {
  halls: Hall[];
  onAddHall: (hall: Hall) => void;
  onUpdateHall: (index: number, hall: Hall) => void;
  onDeleteHall: (index: number) => void;
   onDeletePlaceInHall?: (hallIndex: number, placeIndex: number) => void;
  level: 'market' | 'zone';
}
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

const HallSection: React.FC<HallSectionProps> = ({ 
  halls, 
  onAddHall, 
  onUpdateHall,
  onDeleteHall,
  onDeletePlaceInHall,
  level
}) => {
  const handleAddHall = () => {
    const newHall: Hall = {
      id: generateId(),
      name: '',
      identifier: '',
      places: []
    };
    onAddHall(newHall);
  };

  const getColorClasses = () => {
    return level === 'market' 
      ? 'bg-green-600 hover:bg-green-700 bg-green-800 bg-green-50 border-green-200 text-green-800 focus:ring-green-500'
      : 'bg-indigo-600 hover:bg-indigo-700 bg-indigo-800 bg-indigo-50 border-indigo-200 text-indigo-800 focus:ring-indigo-500';
  };

  const colors = getColorClasses().split(' ');
  const buttonColor = `${colors[0]} ${colors[1]}`;
  const badgeColor = colors[2];
  const bgColor = colors[3];
  const borderColor = colors[4];
  const textColor = colors[5];
  const focusColor = colors[6];

  const marginClass = level === 'market' ? '' : 'ml-6';

  return (
    <div className={`mt-4 ${marginClass}`}>
      <button
        onClick={handleAddHall}
        className={`flex items-center px-4 py-2 ${buttonColor} text-white rounded-md mb-4`}
      >
        <Plus size={16} className="mr-2" />
        Ajouter Hall
        {halls.length > 0 && (
          <span className={`ml-2 ${badgeColor} text-white px-2 py-1 rounded-full text-xs`}>
            {halls.length}
          </span>
        )}
      </button>
      
      {halls.map((hall, hallIndex) => (
        <div key={hall.id} className={`${bgColor} p-4 rounded-lg mb-4 ${borderColor} border`}>
          
          <h4 className={`font-medium ${textColor} mb-3`}>Hall</h4>
          <button
                onClick={() => onDeleteHall(hallIndex)}
                className="text-red-600 hover:text-red-800"
            >
                <X size={18} />
            </button>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du hall
              </label>
              <input
                type="text"
                value={hall.name}
                onChange={(e) => onUpdateHall(hallIndex, { ...hall, name: e.target.value })}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 ${focusColor}`}
                placeholder="Nom du hall"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Identifiant
              </label>
              <input
                type="text"
                value={hall.identifier}
                onChange={(e) => onUpdateHall(hallIndex, { ...hall, identifier: e.target.value })}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 ${focusColor}`}
                placeholder="Identifiant unique"
              />
            </div>
          </div>
          
          <PlaceSection
            places={hall.places}
            onAddPlace={(place) => {
              // ton handler local pour ajouter une place au hall
              const updatedHall = { ...hall, places: [...hall.places, place] };
              onUpdateHall(hallIndex, updatedHall);
            }}
            onUpdatePlace={(placeIndex, place) => {
              // handler local pour update place dans ce hall
              const updatedHall = { ...hall, places: hall.places.map((p, i) => i === placeIndex ? place : p) };
              onUpdateHall(hallIndex, updatedHall);
            }}
            onDeletePlace={(placeIndex) => {
              if (onDeletePlaceInHall) {
                // parent (ex: ZoneSection) veut gérer la suppression (pour connaître le zoneIndex)
                onDeletePlaceInHall(hallIndex, placeIndex);
              } else {
                // fallback : HallSection supprime la place localement et notifie via onUpdateHall
                const updatedHall = { ...hall, places: hall.places.filter((_, i) => i !== placeIndex) };
                onUpdateHall(hallIndex, updatedHall);
              }
            }}
            level="hall"
          />
        </div>
      ))}
    </div>
  );
};
export default HallSection;