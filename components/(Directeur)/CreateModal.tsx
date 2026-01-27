'use client';

import React, { useState } from 'react';
import { X, Building2, Home, MapPin, Loader2 } from 'lucide-react';
import API_BASE_URL from '@/services/APIbaseUrl';

// Types
interface CreateZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  marcheeId: number;
  onSuccess: () => void;
}

interface CreateHallModalProps {
  isOpen: boolean;
  onClose: () => void;
  marcheeId: number;
  zoneId?: number;
  zoneName?: string;
  onSuccess: () => void;
}

interface CreatePlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  marcheeId?: number;
  zoneId?: number;
  hallId?: number;
  contextName?: string;
  onSuccess: () => void;
}

// Modal de création de Zone
export const CreateZoneModal: React.FC<CreateZoneModalProps> = ({
  isOpen,
  onClose,
  marcheeId,
  onSuccess,
}) => {
  const [nom, setNom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/public/zones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom,
          marcheeId,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la zone');
      }

      setNom('');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 modal-overlay flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Créer une Zone</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la zone <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Zone A"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer la zone'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal de création de Hall
export const CreateHallModal: React.FC<CreateHallModalProps> = ({
  isOpen,
  onClose,
  marcheeId,
  zoneId,
  zoneName,
  onSuccess,
}) => {
  const [nom, setNom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: any = { nom };
      
      if (zoneId) {
        payload.zoneId = zoneId;
      } else {
        payload.marcheeId = marcheeId;
      }

      const response = await fetch(`${API_BASE_URL}/public/salles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du hall');
      }

      setNom('');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 modal-overlay flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Home className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Créer un Hall</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {zoneName && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Destination:</span> {zoneName}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du hall <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Ex: Hall 1"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer le hall'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal de création de Place (amélioré pour création multiple)
export const CreatePlaceModal: React.FC<CreatePlaceModalProps> = ({
  isOpen,
  onClose,
  marcheeId,
  zoneId,
  hallId,
  contextName,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'single' | 'multiple'>('single');
  const [nom, setNom] = useState('');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [startNumber, setStartNumber] = useState('1');
  const [endNumber, setEndNumber] = useState('10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);

  const generatePlaceNames = () => {
    const names: string[] = [];
    const start = parseInt(startNumber);
    const end = parseInt(endNumber);

    for (let i = start; i <= end; i++) {
      const paddedNumber = i.toString().padStart(3, '0');
      const name = `${prefix}${paddedNumber}${suffix}`;
      names.push(name);
    }

    return names;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessCount(0);

    try {
      if (mode === 'single') {
        // Création d'une seule place
        const payload: any = { nom };
        
        if (hallId) {
          payload.hallId = hallId;
        } else if (zoneId) {
          payload.zoneId = zoneId;
        } else {
          payload.marcheeId = marcheeId;
        }

        const response = await fetch(`${API_BASE_URL}/public/places`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la création de la place');
        }

        setNom('');
        onSuccess();
        onClose();
      } else {
        // Création multiple
        const placeNames = generatePlaceNames();
        let successfulCreations = 0;
        const errors: string[] = [];

        for (const placeName of placeNames) {
          try {
            const payload: any = { nom: placeName };
            
            if (hallId) {
              payload.hallId = hallId;
            } else if (zoneId) {
              payload.zoneId = zoneId;
            } else {
              payload.marcheeId = marcheeId;
            }

            const response = await fetch(`${API_BASE_URL}/public/places`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            if (response.ok) {
              successfulCreations++;
              setSuccessCount(successfulCreations);
            } else {
              errors.push(`${placeName}: ${response.statusText}`);
            }
          } catch (err) {
            errors.push(`${placeName}: Erreur de connexion`);
          }
        }

        if (errors.length > 0) {
          setError(`${successfulCreations}/${placeNames.length} places créées. Erreurs: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? '...' : ''}`);
        } else {
          // Tout s'est bien passé
          setPrefix('');
          setSuffix('');
          setStartNumber('1');
          setEndNumber('10');
          onSuccess();
          onClose();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const previewPlaces = mode === 'multiple' ? generatePlaceNames().slice(0, 5) : [];
  const totalPlaces = mode === 'multiple' ? generatePlaceNames().length : 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 modal-overlay flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Créer des Places</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {contextName && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Destination:</span> {contextName}
            </p>
          </div>
        )}

        {/* Sélection du mode */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Mode de création</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('single')}
              className={`p-4 rounded-lg border-2 transition-all ${
                mode === 'single'
                  ? 'border-green-600 bg-green-50 text-green-900'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold mb-1">Place unique</div>
              <div className="text-xs opacity-75">Créer une seule place</div>
            </button>
            <button
              type="button"
              onClick={() => setMode('multiple')}
              className={`p-4 rounded-lg border-2 transition-all ${
                mode === 'multiple'
                  ? 'border-green-600 bg-green-50 text-green-900'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold mb-1">Places multiples</div>
              <div className="text-xs opacity-75">Créer plusieurs places</div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'single' ? (
            // Mode création unique
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de la place <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: P-001"
                required
              />
            </div>
          ) : (
            // Mode création multiple
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Préfixe (optionnel)
                  </label>
                  <input
                    type="text"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ex: P-"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Suffixe (optionnel)
                  </label>
                  <input
                    type="text"
                    value={suffix}
                    onChange={(e) => setSuffix(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ex: -A"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de début <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={startNumber}
                    onChange={(e) => setStartNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de fin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={endNumber}
                    onChange={(e) => setEndNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min={startNumber}
                    required
                  />
                </div>
              </div>

              {/* Aperçu */}
              {previewPlaces.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">
                      Aperçu ({totalPlaces} place{totalPlaces > 1 ? 's' : ''})
                    </p>
                    {loading && successCount > 0 && (
                      <span className="text-xs text-green-600 font-medium">
                        {successCount}/{totalPlaces} créées
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {previewPlaces.map((name, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white border border-gray-300 rounded text-sm text-gray-700"
                      >
                        {name}
                      </span>
                    ))}
                    {totalPlaces > 5 && (
                      <span className="px-3 py-1 bg-gray-100 rounded text-sm text-gray-500">
                        +{totalPlaces - 5} autres
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {mode === 'multiple' ? `Création... (${successCount}/${totalPlaces})` : 'Création...'}
                </>
              ) : (
                <>
                  {mode === 'single' ? 'Créer la place' : `Créer ${totalPlaces} place${totalPlaces > 1 ? 's' : ''}`}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};