"use client";

import React, { useEffect, useState } from "react";
import { MapPin, Phone } from "lucide-react";
import API_BASE_URL from "@/services/APIbaseUrl";

interface Place {
  id: number;
  nom: string;
  marcheeName?: string;
  zoneName?: string;
  salleName?: string;
}

interface Marchand {
  id: number;
  nom: string;
  prenom: string;
  numCIN: string;
  adress?: string;
  numTel1?: string;
  estEndette?: boolean;
  dateEnregistrement?: string;
  places?: Place[];
}

const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

export default function MarchandsPage() {
  const [marchands, setMarchands] = useState<Marchand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ===========================
  // Charger les marchands
  // ===========================
  const loadMarchands = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/public/marchands`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) throw new Error("Erreur lors du chargement");

      const result = await response.json();

      if (Array.isArray(result)) {
        setMarchands(result);
      } else if (result?.data && Array.isArray(result.data)) {
        setMarchands(result.data);
      } else {
        setMarchands([]);
      }
    } catch (e: any) {
      setError(e.message || "Impossible de charger les marchands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarchands();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* En-tête */}
      <div className="max-w-5xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Liste des Marchands</h1>
        <p className="text-gray-600 mt-1">
          Visualisation simple et complète des marchands enregistrés
        </p>
      </div>

      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-xl p-6">

        {/* Bouton actualiser */}
        <div className="flex justify-end mb-4">
          <button
            onClick={loadMarchands}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Actualiser
          </button>
        </div>

        {/* Message loading */}
        {loading && (
          <p className="text-center text-gray-600 py-4">Chargement...</p>
        )}

        {/* Message erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Tableau */}
        {!loading && (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-3 font-semibold text-gray-700">Nom & Prénom</th>
                <th className="p-3 font-semibold text-gray-700">CIN</th>
                <th className="p-3 font-semibold text-gray-700">Téléphone</th>
                <th className="p-3 font-semibold text-gray-700">Place</th>
                <th className="p-3 font-semibold text-gray-700">Statut</th>
                <th className="p-3 font-semibold text-gray-700">Enregistré le</th>
              </tr>
            </thead>

            <tbody>
              {marchands.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    Aucun marchand trouvé
                  </td>
                </tr>
              )}

              {marchands.map((m) => (
                <tr key={m.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-800">
                    {m.nom} {m.prenom}
                  </td>
                  <td className="p-3 text-gray-700">{m.numCIN}</td>

                  <td className="p-3">
                    {m.numTel1 ? (
                      <div className="flex items-center text-gray-700">
                        <Phone className="w-4 h-4 mr-1" />
                        {m.numTel1}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  {/* Place attribuée */}
                  <td className="p-3">
                    {m.places && m.places.length > 0 ? (
                      <div className="space-y-1">
                        {m.places.map((p) => (
                          <div key={p.id} className="text-sm text-gray-700 flex items-center">
                            <MapPin className="w-4 h-4 mr-1 text-green-600" />
                            {p.marcheeName} - {p.zoneName} - {p.salleName} -{" "}
                            <span className="font-semibold">{p.nom}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Non attribuée</span>
                    )}
                  </td>

                  {/* Statut */}
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-lg text-white text-xs font-semibold ${
                        m.estEndette ? "bg-red-600" : "bg-green-600"
                      }`}
                    >
                      {m.estEndette ? "Endetté" : "À jour"}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="p-3 text-gray-600">
                    {m.dateEnregistrement
                      ? new Date(m.dateEnregistrement).toLocaleDateString("fr-FR")
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
