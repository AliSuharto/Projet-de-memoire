"use client";

import React, { useState } from "react";

interface Zone {
  id: number;
  nom: string;
}

interface AddHallModalProps {
  isOpen: boolean;
  onClose: () => void;
  marcheeId: number;
  zones: Zone[];
  onSuccess: () => void;
}

interface HallFormData {
  nom: string;
  numero: string;
  description: string;
  zoneId: string;
}

const AddHallModal: React.FC<AddHallModalProps> = ({
  isOpen,
  onClose,
  marcheeId,
  zones,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<HallFormData>({
    nom: "",
    numero: "",
    description: "",
    zoneId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!formData.nom.trim()) {
    setError("Le nom du hall est requis");
    return;
  }

  try {
    setLoading(true);
    setError(null);

    // Construction conditionnelle du payload
    let payload: any = {
      nom: formData.nom,
      description: formData.description,
      ...(formData.numero && { numero: parseInt(formData.numero) }),
    };

    if (formData.zoneId) {
      // Si zone sélectionnée → envoyer zoneId
      payload.zoneId = parseInt(formData.zoneId);
    } else {
      // Sinon → envoyer marcheeId
      payload.marcheeId = marcheeId;
    }

    console.log("Submitting payload:", payload);

    const response = await fetch("http://localhost:8080/api/public/salles", {
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
    setFormData({ nom: "", numero: "", description: "", zoneId: "" });
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
    setFormData({ nom: "", numero: "", description: "", zoneId: "" });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Ajouter un Hall</h2>
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
              Nom du hall *
            </label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Entrez le nom du hall"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="numero" className="block text-sm font-medium text-gray-700 mb-2">
              Numéro du hall
            </label>
            <input
              type="number"
              id="numero"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Numéro du hall (optionnel)"
              min="1"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Description du hall (optionnel)"
              disabled={loading}
            />
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
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
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

export default AddHallModal;