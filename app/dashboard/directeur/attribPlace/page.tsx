'use client';
import React, { useState, useEffect } from 'react';
import { Search, MapPin, User, Check, X, AlertTriangle, FileText } from 'lucide-react';

const PlaceAttributionApp = () => {
  const [marchands, setMarchands] = useState([]);
  const [places, setPlaces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedMarchand, setSelectedMarchand] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedCategorie, setSelectedCategorie] = useState(null);
  const [searchMarchand, setSearchMarchand] = useState('');
  const [searchPlace, setSearchPlace] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const API_BASE_URL = 'http://localhost:8080/api';
  
  useEffect(() => {
    loadMarchands();
    loadPlaces();
    loadCategories();
  }, []);

  const loadMarchands = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/places/marchands-sans-place`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMarchands(data);
      } else {
        console.error('Erreur lors du chargement des marchands:', response.statusText);
        setMessage({ type: 'error', text: 'Erreur lors du chargement des marchands' });
      }
    } catch (error) {
      console.error('Erreur réseau lors du chargement des marchands:', error);
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
    }
  };

  const loadPlaces = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/places/places-disponibles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlaces(data);
      } else {
        console.error('Erreur lors du chargement des places:', response.statusText);
        setMessage({ type: 'error', text: 'Erreur lors du chargement des places' });
      }
    } catch (error) {
      console.error('Erreur réseau lors du chargement des places:', error);
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/public/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error('Erreur lors du chargement des catégories:', response.statusText);
        setMessage({ type: 'error', text: 'Erreur lors du chargement des catégories' });
      }
    } catch (error) {
      console.error('Erreur réseau lors du chargement des catégories:', error);
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
    }
  };

  const filteredMarchands = marchands.filter(m => 
    m.nom.toLowerCase().includes(searchMarchand.toLowerCase()) ||
    m.prenom.toLowerCase().includes(searchMarchand.toLowerCase()) ||
    m.numCIN.includes(searchMarchand)
  );

  const filteredPlaces = places.filter(p => 
    p.nom.toLowerCase().includes(searchPlace.toLowerCase()) ||
    p.adresse.toLowerCase().includes(searchPlace.toLowerCase()) ||
    (p.zoneName && p.zoneName.toLowerCase().includes(searchPlace.toLowerCase()))
  );

  const handleAttribution = async () => {
    if (!selectedMarchand || !selectedPlace || !selectedCategorie) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner un marchand, une place et une catégorie.' });
      return;
    }

    setLoading(true);
    
    try {
      // Attribution de la place
      const attributionResponse = await fetch(`${API_BASE_URL}/places/attribuer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          marchandId: selectedMarchand.id,
          placeId: selectedPlace.id
        })
      });

      const attributionData = await attributionResponse.json();

      if (!attributionResponse.ok || !attributionData.success) {
        setMessage({ 
          type: 'error', 
          text: attributionData.message || 'Erreur lors de l\'attribution' 
        });
        setLoading(false);
        return;
      }
// Préparation des données du contrat
      const contratPayload = {
        idPlace: selectedPlace.id,
        idMarchand: selectedMarchand.id,
        categorieId: selectedCategorie.id,
        nom: `Contrat ${selectedPlace.nom} - ${selectedMarchand.prenom} ${selectedMarchand.nom}`,
        description: `Contrat pour la place ${selectedPlace.nom} attribuée à ${selectedMarchand.prenom} ${selectedMarchand.nom} - Catégorie: ${selectedCategorie.nom || selectedCategorie.libelle || selectedCategorie.designation}`
      };

      console.log('Envoi du contrat:', contratPayload);

      // Création du contrat
      const contratResponse = await fetch(`${API_BASE_URL}/contrat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contratPayload)
      });

      // Vérifier si la réponse contient du JSON
      const contentType = contratResponse.headers.get("content-type");
      let contratData = null;
      
      if (contentType && contentType.includes("application/json")) {
        contratData = await contratResponse.json();
      } else {
        const textResponse = await contratResponse.text();
        console.error('Réponse non-JSON reçue:', textResponse);
        setMessage({ 
          type: 'error', 
          text: 'Place attribuée mais erreur lors de la création du contrat (réponse invalide du serveur)' 
        });
        setLoading(false);
        return;
      }

      if (contratResponse.ok && contratData?.success) {
        setMessage({ 
          type: 'success', 
          text: `Place ${selectedPlace.nom} attribuée avec succès à ${selectedMarchand.prenom} ${selectedMarchand.nom} et contrat créé!` 
        });
        
        // Recharger les données
        await loadMarchands();
        await loadPlaces();
        
        // Reset selections
        setSelectedMarchand(null);
        setSelectedPlace(null);
        setSelectedCategorie(null);
        setSearchMarchand('');
        setSearchPlace('');
      } else {
        setMessage({ 
          type: 'error', 
          text: contratData?.message || 'Place attribuée mais erreur lors de la création du contrat' 
        });
      }
        
        
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
    } finally {
      setLoading(false);
    }
  };

  const resetSelection = () => {
    setSelectedMarchand(null);
    setSelectedPlace(null);
    setSelectedCategorie(null);
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Attribution de Places avec Contrat</h1>
          <p className="text-gray-600">Attribuez une place à un marchand et créez un contrat</p>
        </div>

        {/* Message de feedback */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-100 border border-green-300 text-green-700' 
              : 'bg-red-100 border border-red-300 text-red-700'
          }`}>
            {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Section Marchands */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-800">Marchands sans place</h2>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par nom, prénom ou CIN..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchMarchand}
                onChange={(e) => setSearchMarchand(e.target.value)}
              />
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredMarchands.map(marchand => (
                <div
                  key={marchand.id}
                  onClick={() => setSelectedMarchand(marchand)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedMarchand?.id === marchand.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {marchand.prenom} {marchand.nom}
                      </h3>
                      <p className="text-sm text-gray-600">CIN: {marchand.numCIN}</p>
                      <p className="text-sm text-gray-600">Tél: {marchand.numTel1 || 'Non renseigné'}</p>
                      {marchand.adress && (
                        <p className="text-sm text-gray-600">Adresse: {marchand.adress}</p>
                      )}
                    </div>
                    {selectedMarchand?.id === marchand.id && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </div>
              ))}
              {filteredMarchands.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucun marchand disponible trouvé</p>
                </div>
              )}
            </div>
          </div>

          {/* Section Places */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-semibold text-gray-800">Places disponibles</h2>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par nom, adresse ou zone..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={searchPlace}
                onChange={(e) => setSearchPlace(e.target.value)}
              />
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredPlaces.map(place => (
                <div
                  key={place.id}
                  onClick={() => setSelectedPlace(place)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedPlace?.id === place.id
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{place.nom}</h3>
                      <p className="text-sm text-gray-600">{place.adresse}</p>
                      {place.zone && (
                        <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {place.zone}
                        </span>
                      )}
                    </div>
                    {selectedPlace?.id === place.id && (
                      <Check className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </div>
              ))}
              {filteredPlaces.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucune place disponible trouvée</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section Catégorie et Confirmation */}
        {(selectedMarchand || selectedPlace) && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Configuration du contrat</h3>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Marchand sélectionné
                </h4>
                {selectedMarchand ? (
                  <div>
                    <p className="text-blue-700">{selectedMarchand.prenom} {selectedMarchand.nom}</p>
                    <p className="text-sm text-blue-600">CIN: {selectedMarchand.numCIN}</p>
                  </div>
                ) : (
                  <p className="text-blue-600 italic">Aucun marchand sélectionné</p>
                )}
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Place sélectionnée
                </h4>
                {selectedPlace ? (
                  <div>
                    <p className="text-green-700">{selectedPlace.nom}</p>
                    <p className="text-sm text-green-600">{selectedPlace.adresse}</p>
                  </div>
                ) : (
                  <p className="text-green-600 italic">Aucune place sélectionnée</p>
                )}
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Catégorie d'activité
                </h4>
                <select
                  value={selectedCategorie?.id || ''}
                  onChange={(e) => {
                    const cat = categories.find(c => c.id === parseInt(e.target.value));
                    setSelectedCategorie(cat);
                  }}
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-purple-900"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nom || cat.libelle || cat.designation}
                    </option>
                  ))}
                </select>
                {selectedCategorie && (
                  <p className="text-sm text-purple-600 mt-2">
                    Tarif: {selectedCategorie.tarif || selectedCategorie.montant || 'N/A'} Ar
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={resetSelection}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Annuler
              </button>
              
              <button
                onClick={handleAttribution}
                disabled={!selectedMarchand || !selectedPlace || !selectedCategorie || loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Attribuer et créer le contrat
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceAttributionApp;