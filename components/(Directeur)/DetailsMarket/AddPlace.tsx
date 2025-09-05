"use client";

import React, { useState, useEffect } from "react";

interface Zone {
  id: number;
  nom: string;
}

interface Hall {
  id: number;
  nom: string;
}

interface Categorie {
  id: number;
  nom: string;
}

interface AddPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  marcheeId: number;
  zones: Zone[];
  halls: Hall[];
  onSuccess: () => void;
}

interface PlaceFormData {
  nom: string;
  adresse: string;
  zoneId: string;
  hallId: string;
  categorieId: string;
}

const AddPlaceModal: React.FC<AddPlaceModalProps> = ({
  isOpen,
  onClose,
  marcheeId,
  zones,
  halls,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<PlaceFormData>({
    nom: "",
    adresse: "",
    zoneId: "",
    hallId: "",
    categorieId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Charger les catégories
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch("/api/categories");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom.trim()) {
      setError("Le nom de la place est requis");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        nom: formData.nom,
        adresse: formData.adresse,
        marcheeId,
        isOccuped: false, // Par défaut, la place n'est pas occupée
        ...(formData.zoneId && { zoneId: parseInt(formData.zoneId) }),
        ...(formData.hallId && { hallId: parseInt(formData.hallId) }),
        ...(formData.categorieId && { categorieId: parseInt(formData.categorieId) }),
      };

      const response = await fetch("/api/places", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la création");
      }

      // Réinitialiser le formulaire
      setFormData({ nom: "", adresse: "", zoneId: "", hallId: "", categorieId: "" });
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    setFormData({ nom: "", adresse: "", zoneId: "", hallId: "", categorieId: "" });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Ajouter une Place</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la place *
            </label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Entrez le nom de la place"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-2">
              Adresse
            </label>
            <textarea
              id="adresse"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Adresse de la place (optionnel)"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="zoneId" className="block text-sm font-medium text-gray-700 mb-2">
              Zone (optionnel)
            </label>
            <select
              id="zoneId"
              name="zoneId"
              value={formData.zoneId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            >
              <option value="">Sélectionnez une zone (optionnel)</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="hallId" className="block text-sm font-medium text-gray-700 mb-2">
              Hall (optionnel)
            </label>
            <select
              id="hallId"
              name="hallId"
              value={formData.hallId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            >
              <option value="">Sélectionnez un hall (optionnel)</option>
              {halls.map((hall) => (
                <option key={hall.id} value={hall.id}>
                  {hall.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="categorieId" className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie (optionnel)
            </label>
            <select
              id="categorieId"
              name="categorieId"
              value={formData.categorieId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading || loadingCategories}
            >
              <option value="">
                {loadingCategories ? "Chargement..." : "Sélectionnez une catégorie (optionnel)"}
              </option>
              {categories.map((categorie) => (
                <option key={categorie.id} value={categorie.id}>
                  {categorie.nom}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50"
              disabled={loading || !formData.nom.trim()}
            >
              {loading ? "Création..." : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlaceModal;