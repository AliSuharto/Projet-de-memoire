import React from 'react';
import EmptyState from './EntityState';
import EntityCard from './EntityCard';
import { EntityType, Markets } from '@/types/marcheeCreation';

interface EntityListProps {
  market: Markets;
  onCreateEntity: (type: EntityType) => void;
}

const EntityList: React.FC<EntityListProps> = ({ market, onCreateEntity }) => {
  // Détermine ce qui doit être affiché en priorité
  const getPrimaryEntities = () => {
    if (market.zones && market.zones.length > 0) {
      return { type: 'zone' as EntityType, entities: market.zones };
    } else if (market.halls && market.halls.length > 0) {
      return { type: 'hall' as EntityType, entities: market.halls };
    } else if (market.places && market.places.length > 0) {
      return { type: 'place' as EntityType, entities: market.places };
    }
    return null;
  };

  const primaryEntities = getPrimaryEntities();

  if (!primaryEntities) {
    return (
      <EmptyState onCreateEntity={onCreateEntity} />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 capitalize">
          {primaryEntities.type === 'zones' ? 'Zones' : 
           primaryEntities.type === 'halls' ? 'Halls' : 'Places'}
        </h2>
        <button
          onClick={() => onCreateEntity(primaryEntities.type)}
          className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
        >
          ➕
        </button>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {primaryEntities.entities.map((entity) => (
          <EntityCard
            key={entity.id}
            entity={entity}
            type={primaryEntities.type}
          />
        ))}
      </div>
    </div>
  );
};

export default EntityList;