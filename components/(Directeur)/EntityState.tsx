import React from 'react';
import { EntityType } from '@/types/marcheeCreation';


interface EmptyStateProps {
  onCreateEntity: (type: EntityType) => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onCreateEntity }) => {
  return (
    <div className="text-center py-8">
      <p className="text-gray-600 mb-6">
        Il n'y a pas encore de zones, halls ou places dans ce marché.
      </p>
      
      <div className="space-y-3">
        <button
          onClick={() => onCreateEntity('zones')}
          className="block w-full p-3 bg-yellow-100 border border-yellow-200 rounded-lg hover:bg-yellow-200 transition-colors"
        >
          <span className="font-medium">Créer une Zone</span>
        </button>
        
        <button
          onClick={() => onCreateEntity('halls')}
          className="block w-full p-3 bg-blue-100 border border-blue-200 rounded-lg hover:bg-blue-200 transition-colors"
        >
          <span className="font-medium">Créer un Hall</span>
        </button>
        
        <button
          onClick={() => onCreateEntity('places')}
          className="block w-full p-3 bg-orange-100 border border-orange-200 rounded-lg hover:bg-orange-200 transition-colors"
        >
          <span className="font-medium">Créer une Place</span>
        </button>
      </div>
    </div>
  );
};

export default EmptyState;