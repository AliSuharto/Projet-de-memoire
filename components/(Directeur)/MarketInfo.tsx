 import { Markets } from '@/types/marcheeCreation';

import React from 'react';

interface MarketInfoProps {
  market: Markets;
}

const MarketInfo: React.FC<MarketInfoProps> = ({ market }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Adresse
        </label>
        <input
          type="text"
          value={market.adresse}
          readOnly
          className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de places
        </label>
        <input
          type="number"
          value={market.totalPlaces}
          readOnly
          className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={market.description}
          readOnly
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 resize-none"
        />
      </div>
    </div>
  );
};

export default MarketInfo;