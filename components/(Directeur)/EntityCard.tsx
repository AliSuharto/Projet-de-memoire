import React from 'react';
import { Zones, Halls, Places, EntityType } from '@/types/marcheeCreation';

interface EntityCardProps {
  entity: Zones | Halls | Places;
  type: EntityType;
}

const EntityCard: React.FC<EntityCardProps> = ({ entity, type }) => {
  const getEntityStats = () => {
    if (type === 'zones' && 'halls' in entity) {
      return {
        label1: 'halls',
        count1: entity.halls?.length || 0,
        label2: 'places',
        count2: entity.places?.length || 0
      };
    } else if (type === 'halls' && 'places' in entity) {
      return {
        label1: 'places',
        count1: entity.places?.length || 0,
        label2: null,
        count2: null
      };
    }
    return { label1: null, count1: null, label2: null, count2: null };
  };

  const stats = getEntityStats();
  const bgColor = type === 'zones' ? 'bg-yellow-100' : 
                  type === 'halls' ? 'bg-blue-100' : 
                  'bg-orange-100';

  return (
    <div className={`${bgColor} p-4 rounded-lg border`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-gray-800">{entity.nom}</h3>
          {stats.label1 && (
            <div className="mt-2 space-y-1">
              <div className="text-sm text-blue-600">
                {stats.label1}: {stats.count1}
              </div>
              {stats.label2 && (
                <div className="text-sm text-blue-600">
                  {stats.label2}: {stats.count2}
                </div>
              )}
            </div>
          )}
          {entity.description && (
            <p className="text-sm text-gray-600 mt-1">{entity.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntityCard;