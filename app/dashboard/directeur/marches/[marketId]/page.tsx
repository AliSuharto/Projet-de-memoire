"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AddPlaceModal from "@/components/(Directeur)/DetailsMarket/AddPlace";
import AddHallModal from "@/components/(Directeur)/DetailsMarket/AddHall";
import AddZoneModal from "@/components/(Directeur)/DetailsMarket/AddZone";

interface Zone {
  id: number;
  nom: string;
  description?: string;
  places?: Place[];
  halls?: Hall[];
}

interface Place {
  id: number;
  nom: string;
}

interface Hall {
  id: number;
  nom: string;
  description?: string;
  places?: Place[];
}

interface Marchee {
  id: number;
  nom: string;
  description?: string;
  places: Place[];
  nbrPlace?: number;
  zones: Zone[];
  halls: Hall[];
}

type ActiveSection = 'zones' | 'halls' | 'places' | null;

const MarcheeDetailsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params.marketId) ? params.marketId[0] : params.marketId;

  const [marchee, setMarchee] = useState<Marchee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);

  // States pour contrôler les modals
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showHallModal, setShowHallModal] = useState(false);
  const [showPlaceModal, setShowPlaceModal] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("ID du marché non trouvé.");
      return;
    }

    if (isNaN(Number(id))) {
      setLoading(false);
      setError("ID du marché invalide.");
      return;
    }

    fetchMarcheeDetails(id);
  }, [id]);

  const fetchMarcheeDetails = async (marcheeId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:8080/api/marchees/${marcheeId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      setMarchee(data);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const handleSectionClick = (section: ActiveSection) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const handleAddClick = (section: ActiveSection) => {
  console.log("Bouton + cliqué, section =", section); // 🔍 debug
  switch (section) {
    case 'zones':
      setShowZoneModal(true);
      break;
    case 'halls':
      setShowHallModal(true);
      break;
    case 'places':
      setShowPlaceModal(true);
      break;
  }
};

  const onModalSuccess = () => {
    fetchMarcheeDetails(id!);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
        <p className="ml-4">Chargement des détails du marché...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Erreur:</strong> {error}
        </div>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
        >
          ← Retour
        </button>
      </div>
    );
  }

  if (!marchee) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Aucun marché trouvé.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
        >
          ← Retour
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Bouton retour */}
        <button
          onClick={() => router.back()}
          className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
        >
          ← Retour
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Colonne gauche - Informations du marché */}
          <div className="bg-white shadow-lg rounded-lg p-6 border-2 border-blue-300">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800">{marchee.nom}</h1>
              <button className="p-2 bg-gray-100 rounded-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* Adresse */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Adresse</label>
              <input 
                type="text" 
                value="Ambalavola" 
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                readOnly
              />
            </div>

            {/* Nombre de places */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre de places</label>
              <input 
                type="text" 
                value={marchee.nbrPlace || 0}
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                readOnly
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea 
                value={marchee.description || "Bazar pour les ppn et les denrées alimentaires"}
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 h-24 resize-none"
                readOnly
              />
            </div>

            {/* Sections cliquables */}
            <div className="grid grid-cols-1 gap-4">
              {/* Zone */}
              <div 
                onClick={() => handleSectionClick('zones')}
                className={`p-6 rounded-lg cursor-pointer transition-all duration-200 ${
                  activeSection === 'zones' ? 'bg-yellow-200 border-2 border-yellow-400' : 'bg-yellow-100 hover:bg-yellow-150'
                }`}
              >
                <h3 className="text-lg font-semibold text-center mb-2">Zone</h3>
                <p className="text-center text-gray-600">
                  {marchee.zones?.length || 0} zones
                </p>
              </div>

              {/* Halls */}
              <div 
                onClick={() => handleSectionClick('halls')}
                className={`p-6 rounded-lg cursor-pointer transition-all duration-200 ${
                  activeSection === 'halls' ? 'bg-blue-200 border-2 border-blue-400' : 'bg-blue-100 hover:bg-blue-150'
                }`}
              >
                <h3 className="text-lg font-semibold text-center mb-2">Halls</h3>
                <p className="text-center text-gray-600">
                  {marchee.halls?.length || 0} Halls
                </p>
              </div>

              {/* Places */}
              <div 
                onClick={() => handleSectionClick('places')}
                className={`p-6 rounded-lg cursor-pointer transition-all duration-200 ${
                  activeSection === 'places' ? 'bg-orange-200 border-2 border-orange-400' : 'bg-orange-100 hover:bg-orange-150'
                }`}
              >
                <h3 className="text-lg font-semibold text-center mb-2">Places</h3>
                <p className="text-center text-gray-600">
                  {marchee.places?.length || 0} places hors zone et hors Hall
                </p>
              </div>
            </div>
          </div>

          {/* Colonne droite - Détails de la section sélectionnée */}

          <div className="bg-white shadow-lg rounded-lg p-6 border-2 border-blue-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {activeSection ? activeSection.charAt(0).toUpperCase() + activeSection.slice(1) : 'Sélectionnez une section'}
              </h2>
                {activeSection && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // ✅ Empêche le clic d’aller au parent
                      handleAddClick(activeSection);
                    }}
                    className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    title={`Ajouter ${activeSection === 'zones' ? 'Zone' : activeSection === 'halls' ? 'Hall' : 'Place'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                )}

            </div>

            {/* Contenu basé sur la section active */}
            {activeSection === 'zones' && (
              <div className="space-y-3">
                {marchee.zones?.length > 0 ? (
                  marchee.zones.map((zone) => (
                    <div key={zone.id} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{zone.nom}</h3>
                          <div className="text-sm text-blue-600 space-x-4">
                            <span>halls: {zone.halls?.length || 0}</span>
                            <span>places: {zone.places?.length || 0}</span>
                          </div>
                          <p className="text-gray-600 text-sm mt-2">
                            Description: {zone.description || "Aucune description"}
                          </p>
                        </div>
                        <Link
                          href={`/dashboard/directeur/zones/${zone.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Voir détails →
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Aucune zone disponible</p>
                    <button
                      onClick={() => setShowZoneModal(true)}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md"
                    >
                      Créer la première zone
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'halls' && (
              <div className="space-y-3">
                {marchee.halls?.length > 0 ? (
                  marchee.halls.map((hall) => (
                    <div key={hall.id} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{hall.nom} {hall.description}</h3>
                          <div className="text-sm text-blue-600">
                            <span>places: {hall.places?.length || 0}</span>
                          </div>
                        </div>
                        <Link
                          href={`/dashboard/directeur/halls/${hall.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Voir détails →
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Aucun hall disponible</p>
                    <button
                      onClick={() => setShowHallModal(true)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                    >
                      Créer le premier hall
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'places' && (
              <div>
                {marchee.places?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-3 font-semibold">ID</th>
                          <th className="text-left p-3 font-semibold">Nom</th>
                          <th className="text-left p-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marchee.places.map((place) => (
                          <tr key={place.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">{place.id}</td>
                            <td className="p-3">{place.nom}</td>
                            <td className="p-3">
                              <Link
                                href={`/dashboard/directeur/places/${place.id}`}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Voir détails →
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Aucune place disponible</p>
                    <button
                      onClick={() => setShowPlaceModal(true)}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md"
                    >
                      Créer la première place
                    </button>
                  </div>
                )}
              </div>
            )}

            {!activeSection && (
              <div className="text-center py-16">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">
                  Cliquez sur une section (Zone, Halls, ou Places) pour voir les détails
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddZoneModal
        isOpen={showZoneModal}
        onClose={() => setShowZoneModal(false)}
        marcheeId={marchee.id}
        onSuccess={() => {
          setShowZoneModal(false);
          onModalSuccess();
        }}
      />

      <AddHallModal
        isOpen={showHallModal}
        onClose={() => setShowHallModal(false)}
        marcheeId={marchee.id}
        zones={marchee.zones || []}
        onSuccess={() => {
          setShowHallModal(false);
          onModalSuccess();
        }}
      />

      <AddPlaceModal
        isOpen={showPlaceModal}
        onClose={() => setShowPlaceModal(false)}
        marcheeId={marchee.id}
        zones={marchee.zones || []}
        halls={marchee.halls || []}
        onSuccess={() => {
          setShowPlaceModal(false);
          onModalSuccess();
        }}
      />
    </div>
  );
};

export default MarcheeDetailsPage;