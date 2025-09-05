"use client";

import React, { useState, useEffect } from "react";

interface Categorie {
  id: number;
  nom: string;
}

interface AddPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextType: "marchee" | "zone" | "hall"; // ✅ contexte dynamique
  contextId: number; // ✅ l'ID du marché, zone ou hall
  onSuccess: () => void;
}

interface PlaceFormData {
  adresse: string;
  categorieId: string;
}

interface GenerationConfig {
  type: "single" | "range";
  prefix: string;
  startNumber: number;
  endNumber: number;
  suffix: string;
  singleName: string;
}

const AddPlaceModal: React.FC<AddPlaceModalProps> = ({
  isOpen,
  onClose,
  contextType,
  contextId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<PlaceFormData>({
    adresse: "",
    categorieId: "",
  });

  const [generationConfig, setGenerationConfig] = useState<GenerationConfig>({
    type: "single",
    prefix: "",
    startNumber: 1,
    endNumber: 1,
    suffix: "",
    singleName: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [previewNames, setPreviewNames] = useState<string[]>([]);

  // Charger les catégories
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch("http://localhost:8080/api/public/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des catégories:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Aperçu des noms
  useEffect(() => {
    if (generationConfig.type === "single") {
      setPreviewNames(generationConfig.singleName ? [generationConfig.singleName] : []);
    } else {
      generatePreviewNames();
    }
  }, [generationConfig]);

  const generatePreviewNames = () => {
    if (generationConfig.type === "single") return;

    const names: string[] = [];
    const { prefix, startNumber, endNumber, suffix } = generationConfig;

    if (startNumber > endNumber) {
      setPreviewNames([]);
      return;
    }

    const maxPreview = Math.min(endNumber - startNumber + 1, 20);

    for (let i = 0; i < maxPreview; i++) {
      const currentNumber = startNumber + i;
      const paddedNumber = currentNumber.toString().padStart(2, "0");
      const name = `${prefix}${paddedNumber}${suffix}`;
      names.push(name);
    }

    if (endNumber - startNumber + 1 > 20) {
      names.push(`... et ${endNumber - startNumber + 1 - 20} autres`);
    }

    setPreviewNames(names);
  };

  const generateAllNames = (): string[] => {
    if (generationConfig.type === "single") {
      return [generationConfig.singleName];
    }

    const names: string[] = [];
    const { prefix, startNumber, endNumber, suffix } = generationConfig;

    for (let i = startNumber; i <= endNumber; i++) {
      const paddedNumber = i.toString().padStart(2, "0");
      const name = `${prefix}${paddedNumber}${suffix}`;
      names.push(name);
    }

    return names;
  };

  const handleSubmit = async () => {
    const namesToCreate = generateAllNames();

    if (namesToCreate.length === 0 || (generationConfig.type === "single" && !generationConfig.singleName.trim())) {
      setError("Veuillez définir au moins un nom de place");
      return;
    }

    if (generationConfig.type === "range" && generationConfig.startNumber > generationConfig.endNumber) {
      setError("Le numéro de début doit être inférieur ou égal au numéro de fin");
      return;
    }

    if (namesToCreate.length > 200) {
      setError("Vous ne pouvez pas créer plus de 200 places à la fois");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const basePayload: any = {
        adresse: formData.adresse,
        isOccuped: false,
      };

      // ✅ Ajout du contexte dynamique
      if (contextType === "zone") {
        basePayload.zoneId = contextId;
      } else if (contextType === "hall") {
        basePayload.hallId = contextId;
      } else {
        basePayload.marcheeId = contextId;
      }

      if (formData.categorieId) {
        basePayload.categorieId = parseInt(formData.categorieId);
      }
      console.log("Base payload for place creation:", basePayload);
      const promises = namesToCreate.map((name) => {
        const payload = { ...basePayload, nom: name };
        return fetch("http://localhost:8080/api/public/places", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      });

      const responses = await Promise.all(promises);
      const failedResponses = responses.filter((response) => !response.ok);

      if (failedResponses.length > 0) {
        const errorData = await failedResponses[0].json();
        throw new Error(errorData.message || "Erreur lors de la création de certaines places");
      }

      setFormData({ adresse: "", categorieId: "" });
      setGenerationConfig({
        type: "single",
        prefix: "",
        startNumber: 1,
        endNumber: 1,
        suffix: "",
        singleName: "",
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

const handleGenerationConfigChange = (field: keyof GenerationConfig, value: any) => {
    setGenerationConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleClose = () => {
    setFormData({ adresse: "", categorieId: "" });
    setGenerationConfig({
      type: 'single',
      prefix: '',
      startNumber: 1,
      endNumber: 1,
      suffix: '',
      singleName: ''
    });
    setError(null);
    onClose();
  };

  // Exemples prédéfinis
  const applyExample = (example: string) => {
    switch (example) {
      case 'L01-L30':
        setGenerationConfig({
          type: 'range',
          prefix: 'L',
          startNumber: 1,
          endNumber: 30,
          suffix: '',
          singleName: ''
        });
        break;
      case '01-120':
        setGenerationConfig({
          type: 'range',
          prefix: '',
          startNumber: 1,
          endNumber: 120,
          suffix: '',
          singleName: ''
        });
        break;
      case 'A01A-A01Z':
        setGenerationConfig({
          type: 'range',
          prefix: 'A',
          startNumber: 1,
          endNumber: 26,
          suffix: 'A',
          singleName: ''
        });
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Ajouter des Places</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Configuration du nommage */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🏷️ Configuration du Nommage</h3>
            
            {/* Type de génération */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de génération
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="single"
                    checked={generationConfig.type === 'single'}
                    onChange={(e) => handleGenerationConfigChange('type', e.target.value)}
                    className="mr-2"
                  />
                  <div>
                    <div className="font-medium">Place unique</div>
                    <div className="text-sm text-gray-600">Une seule place</div>
                  </div>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="range"
                    checked={generationConfig.type === 'range'}
                    onChange={(e) => handleGenerationConfigChange('type', e.target.value)}
                    className="mr-2"
                  />
                  <div>
                    <div className="font-medium">Plage de places</div>
                    <div className="text-sm text-gray-600">Plusieurs places séquentielles</div>
                  </div>
                </label>
              </div>
            </div>

            {generationConfig.type === 'single' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la place *
                </label>
                <input
                  type="text"
                  value={generationConfig.singleName}
                  onChange={(e) => handleGenerationConfigChange('singleName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: A15, Place-001, L05..."
                  disabled={loading}
                />
              </div>
            ) : (
              <>
                {/* Exemples rapides */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exemples rapides
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => applyExample('L01-L30')}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
                    >
                      L01 à L30
                    </button>
                    <button
                      type="button"
                      onClick={() => applyExample('01-120')}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm"
                    >
                      01 à 120
                    </button>
                    <button
                      type="button"
                      onClick={() => applyExample('A01A-A01Z')}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 text-sm"
                    >
                      A01A à A26A
                    </button>
                  </div>
                </div>

                {/* Configuration détaillée */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Préfixe (optionnel)
                    </label>
                    <input
                      type="text"
                      value={generationConfig.prefix}
                      onChange={(e) => handleGenerationConfigChange('prefix', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: L, A, PLACE"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Suffixe (optionnel)
                    </label>
                    <input
                      type="text"
                      value={generationConfig.suffix}
                      onChange={(e) => handleGenerationConfigChange('suffix', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: A, B, -BIS"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de début *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={generationConfig.startNumber}
                      onChange={(e) => handleGenerationConfigChange('startNumber', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de fin *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={generationConfig.endNumber}
                      onChange={(e) => handleGenerationConfigChange('endNumber', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Aperçu */}
            {previewNames.length > 0 && (
              <div className="mt-4 p-3 bg-white rounded border">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Aperçu ({generationConfig.type === 'range' ? 
                    `${generationConfig.endNumber - generationConfig.startNumber + 1} place${generationConfig.endNumber - generationConfig.startNumber + 1 > 1 ? 's' : ''}` : 
                    '1 place'
                  }) :
                </div>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {previewNames.map((name, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 text-xs rounded ${
                        name.includes('...') 
                          ? 'bg-gray-200 text-gray-600' 
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie (optionnel)
              </label>
              <select
                name="categorieId"
                value={formData.categorieId}
                onChange={handleFormDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading || loadingCategories}
              >
                <option value="">
                  {loadingCategories ? "Chargement..." : "Sélectionnez une catégorie"}
                </option>
                {categories.map((categorie) => (
                  <option key={categorie.id} value={categorie.id}>
                    {categorie.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse commune (optionnel)
              </label>
              <input
                type="text"
                name="adresse"
                value={formData.adresse}
                onChange={handleFormDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Adresse pour toutes les places"
                disabled={loading}
              />
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="text-red-400 mr-3">⚠️</div>
                <div className="text-red-700 text-sm">{error}</div>
              </div>
            </div>
          )}

          {/* Boutons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={loading || previewNames.length === 0}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création en cours...
                </span>
              ) : (
                `Créer ${previewNames.length === 1 ? '1 place' : `${generationConfig.type === 'range' ? generationConfig.endNumber - generationConfig.startNumber + 1 : 1} place${generationConfig.type === 'range' && generationConfig.endNumber - generationConfig.startNumber + 1 > 1 ? 's' : ''}`}`
              )}
            </button>
          </div>
        </div>

        {/* Section informations importantes */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">ℹ️ Important à savoir</h3>
              <div className="mt-2 text-sm text-yellow-700 space-y-2">
                <p><strong>🎯 Génération séquentielle:</strong> Les places sont créées avec des noms séquentiels selon votre configuration</p>
                <p><strong>🔢 Format des numéros:</strong> Les numéros sont automatiquement formatés avec des zéros (ex: 01, 02, 03...)</p>
                <p><strong>📝 Combinaison libre:</strong> Vous pouvez combiner préfixe + numéro + suffixe selon vos besoins</p>
                <p><strong>⚡ Limite:</strong> Maximum 200 places créées en une seule fois pour les performances</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPlaceModal;
