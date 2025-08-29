
import React from 'react';
import { Plus,X} from 'lucide-react';


// Place Section Component


interface PlaceSectionProps {
  places: Place[];
  onAddPlace: (place: Place) => void;
  onUpdatePlace: (index: number, place: Place) => void;
  onDeletePlace: (index: number) => void;
  level: 'market' | 'zone' | 'hall';
  title?: string;
}
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);
const PlaceSection: React.FC<PlaceSectionProps> = ({ 
  places, 
  onAddPlace, 
  onUpdatePlace,
  onDeletePlace,
  level,
  title = "Places"
}) => {
  const handleAddPlace = () => {
    const newPlace: Place = {
      id: generateId(),
      nom: '',
      numero: ''
    };
    onAddPlace(newPlace);
  };







  
  const getColorClasses = () => {
    switch (level) {
      case 'market': return 'bg-purple-600 hover:bg-purple-700 bg-purple-800 bg-purple-50 border-purple-200 text-purple-800 focus:ring-purple-500';
      case 'zone': return 'bg-yellow-600 hover:bg-yellow-700 bg-yellow-800 bg-yellow-50 border-yellow-200 text-yellow-800 focus:ring-yellow-500';
      case 'hall': return 'bg-orange-600 hover:bg-orange-700 bg-orange-800 bg-orange-50 border-orange-200 text-orange-800 focus:ring-orange-500';
      default: return 'bg-purple-600 hover:bg-purple-700 bg-purple-800 bg-purple-50 border-purple-200 text-purple-800 focus:ring-purple-500';
    }
  };

  const colors = getColorClasses().split(' ');
  const buttonColor = `${colors[0]} ${colors[1]}`;
  const badgeColor = colors[2];
  const bgColor = colors[3];
  const borderColor = colors[4];
  const textColor = colors[5];
  const focusColor = colors[6];

  const marginClass = level === 'market' ? '' : level === 'zone' ? 'ml-6' : 'ml-12';

  return (
    <div className={`mt-4 ${marginClass}`}>
      <button
        onClick={handleAddPlace}
        className={`flex items-center px-4 py-2 ${buttonColor} text-white rounded-md mb-4`}
      >
        <Plus size={16} className="mr-2" />
        Ajouter Place
        {places.length > 0 && (
          <span className={`ml-2 ${badgeColor} text-white px-2 py-1 rounded-full text-xs`}>
            {places.length}
          </span>
        )}
      </button>
      
      {places.map((place, index) => (
        <div key={place.id} className={`${bgColor} p-4 rounded-lg mb-3 ${borderColor} border`}>
          <h5 className={`font-medium ${textColor} mb-3`}>Place</h5>
          <button
            onClick={() => onDeletePlace(index)}
            className="text-red-600 hover:text-red-800"
          >
            <X size={16} />
        </button>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la place
              </label>
              <input
                type="text"
                value={place.nom}
                onChange={(e) => onUpdatePlace(index, { ...place, nom: e.target.value })}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 ${focusColor}`}
                placeholder="Nom de la place"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Identifiant
              </label>
              <input
                type="text"
                value={place.numero}
                onChange={(e) => onUpdatePlace(index, { ...place, numero: e.target.value })}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 ${focusColor}`}
                placeholder="Identifiant unique"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default PlaceSection;