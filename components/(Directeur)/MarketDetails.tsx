'use client';

import React, { useState, useEffect } from 'react';
import { marketService } from '@/services/MarketService';
import { EntityType } from '@/types/marcheeCreation';
import { Markets } from '@/types/marcheeCreation';
import EntityList from './EntityList';
import MarketInfo from './MarketInfo';
import CreateEntityModal from './CreateEntityModal';


interface MarketDetailsProps {
  marketId: string;
}

const MarketDetails: React.FC<MarketDetailsProps> = ({ marketId }) => {
  const [market, setMarkets] = useState<Markets | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createEntityType, setCreateEntityType] = useState<EntityType>('zones');

  useEffect(() => {
    loadMarket();
  }, [marketId]);

  const loadMarket = async () => {
    try {
      setLoading(true);
      const marketData = await marketService.getMarketById(marketId);
      setMarkets(marketData);
    } catch (err) {
      setError('Erreur lors du chargement du marché');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntity = (type: EntityType) => {
    setCreateEntityType(type);
    setShowCreateModal(true);
  };

  const handleEntityCreated = async () => {
    setShowCreateModal(false);
    await loadMarket(); // Recharger les données
  };

  if (loading) return <div className="p-4">Chargement...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!market) return <div className="p-4">Marché non trouvé</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">{market.nom}</h1>
            <div className="flex space-x-2">
              <button className="p-2 border rounded-md hover:bg-gray-50">
                <span className="text-xl">➕</span>
              </button>
              <button className="p-2 border rounded-md hover:bg-gray-50">
                <span className="text-xl">✏️</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MarketInfo market={market} />
            <EntityList 
              market={market} 
              onCreateEntity={handleCreateEntity}
            />
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateEntityModal
          type={createEntityType}
          marketId={marketId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleEntityCreated}
        />
      )}
    </div>
  );
};

export default MarketDetails;