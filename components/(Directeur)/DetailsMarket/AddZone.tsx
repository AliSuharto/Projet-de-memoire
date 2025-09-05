"use client";

import React, { useState } from "react";

interface AddZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  marcheeId: number;
  onSuccess: () => void;
}

interface ZoneFormData {
  nom: string;
  description: string;
}

const AddZoneModal: React.FC<AddZoneModalProps> = ({
  isOpen,
  onClose,
  marcheeId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<ZoneFormData>({
    nom: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!formData.nom.trim()) {
    setError("Le nom de la zone est requis");
    return;
  }
  console.log("Submitting form data:", formData);
  try {
    setLoading(true);
    setError(null);

    const response = await fetch("http://localhost:8080/api/public/zones", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formData,
        marcheeId,
      }),
    });
    console.log("API response:", response);

    if (!response.ok) {
      let message = "Erreur lors de la création";
      try {
        const errorData = await response.json();
        message = errorData.message || message;
      } catch {
        // Si le body est vide, on garde le message par défaut
      }
      throw new Error(message);
    }

    // Si tout va bien, on réinitialise
    setFormData({ nom: "", description: "" });
    onSuccess();
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Ajouter une Zone</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la zone *
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, nom: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
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

export default AddZoneModal;
