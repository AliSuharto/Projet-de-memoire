'use client';
import React, { useState, useEffect } from 'react';
import { Search, Store, MapPin, Check, X, ArrowRight, FileText, AlertTriangle } from 'lucide-react';

export default function PlaceAssignment() {
  const [step, setStep] = useState(1);
  const [marchands, setMarchands] = useState([]);
  const [droitAnnuel, setDroitAnnuel] = useState([]);
  const [frequencePaiement, setFrequencePaiement] = useState('');
  const[dateOfStart,setDateOfStart]=useState('');
  const [places, setPlaces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedMarchand, setSelectedMarchand] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedCategorie, setSelectedCategorie] = useState(null);
  const [selectedDroitAnnuel, setSelectedDroitAnnuel] = useState(null);
  const [searchMarchand, setSearchMarchand] = useState('');
  const [searchPlace, setSearchPlace] = useState({
    market: '',
    zone: '',
    hall: '',
    placeName: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const API_BASE_URL = 'http://localhost:8080/api';

  useEffect(() => {
    loadMarchands();
    loadPlaces();
    loadCategories();
    loadDroitannuel();
  }, []);

  const loadMarchands = async () => {
  console.log("🟦 [GET] Chargement des marchands sans place...");
  try {
    const response = await fetch(`${API_BASE_URL}/places/marchands-sans-place`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    console.log("🔹 Statut HTTP:", response.status, response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Marchands reçus:", data);
      setMarchands(data);
    } else {
      console.error('❌ Erreur lors du chargement des marchands:', response.statusText);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des marchands' });
    }
  } catch (error) {
    console.error('🚨 Erreur réseau lors du chargement des marchands:', error);
    setMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
  }
};

const loadPlaces = async () => {
  console.log("🟩 [GET] Chargement des places disponibles...");
  try {
    const response = await fetch(`${API_BASE_URL}/places/places-disponibles`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    console.log("🔹 Statut HTTP:", response.status, response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Places reçues:", data);
      setPlaces(data);
    } else {
      console.error('❌ Erreur lors du chargement des places:', response.statusText);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des places' });
    }
  } catch (error) {
    console.error('🚨 Erreur réseau lors du chargement des places:', error);
    setMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
  }
};

const loadCategories = async () => {
  console.log("🟨 [GET] Chargement des catégories...");
  try {
    const response = await fetch(`${API_BASE_URL}/public/categories`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    console.log("🔹 Statut HTTP:", response.status, response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Catégories reçues:", data);
      setCategories(data);
    } else {
      console.error('❌ Erreur lors du chargement des catégories:', response.statusText);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des catégories' });
    }
  } catch (error) {
    console.error('🚨 Erreur réseau lors du chargement des catégories:', error);
    setMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
  }
};


const loadDroitannuel = async () => {
  console.log("🟨 [GET] Chargement des catégories...");
  try {
    const response = await fetch(`${API_BASE_URL}/public/droits-annuels`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    console.log("🔹 Statut HTTP:", response.status, response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Droit recu:", data);
      setDroitAnnuel(data);
    } else {
      console.error('❌ Erreur lors du chargement des catégories:', response.statusText);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des catégories' });
    }
  } catch (error) {
    console.error('🚨 Erreur réseau lors du chargement des catégories:', error);
    setMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
  }
};





  const filteredMarchands = marchands.filter(m => 
    m.nom.toLowerCase().includes(searchMarchand.toLowerCase()) ||
    m.prenom.toLowerCase().includes(searchMarchand.toLowerCase()) ||
    m.numCIN.includes(searchMarchand)
  );

  const filteredPlaces = places.filter(p => {
  const matchMarket =
    !searchPlace.market ||
    (p.marcheeName && String(p.marcheeName).toLowerCase().includes(searchPlace.market.toLowerCase()));

  const matchZone =
    !searchPlace.zone ||
    (p.zoneName && String(p.zoneName).toLowerCase().includes(searchPlace.zone.toLowerCase()));

  const matchHall =
    !searchPlace.hall ||
    (p.hallName && String(p.hallName).toLowerCase().includes(searchPlace.hall.toLowerCase()));

  const matchName =
    !searchPlace.placeName ||
    (p.nom && String(p.nom).toLowerCase().includes(searchPlace.placeName.toLowerCase()));

  return matchMarket && matchZone && matchHall && matchName;
});


  const handleAttribution = async () => {
    if (!selectedMarchand || !selectedPlace || !selectedCategorie || !selectedDroitAnnuel) {
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
        description: `Contrat pour la place ${selectedPlace.nom} attribuée à ${selectedMarchand.prenom} ${selectedMarchand.nom} - Catégorie: ${selectedCategorie.nom || selectedCategorie.libelle || selectedCategorie.designation}`,
        droitAnnuelId: selectedDroitAnnuel.id,
        frequencePaiement: frequencePaiement,
        dateOfStart: dateOfStart  // Date du jour au format YYYY-MM-DD
      };
      // Création du contrat
      const contratResponse = await fetch(`${API_BASE_URL}/contrat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contratPayload)
      });
      
      const contentType = contratResponse.headers.get("content-type");
      let contratData = null;
      
      if (contentType && contentType.includes("application/json")) {
        contratData = await contratResponse.json();
        console.log("✅ Contrat créé:", contratPayload);
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
        
        // Reset après 3 secondes
        setTimeout(() => {
          resetForm();
        }, 3000);
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

  const resetForm = () => {
    setStep(1);
    setSelectedMarchand(null);
    setSelectedPlace(null);
    setSelectedCategorie(null);
    setSearchMarchand('');
    setSearchPlace({ market: '', zone: '', hall: '', placeName: '' });
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Attribution de Place avec Contrat</h1>
          <p className="text-gray-600">Assignez une place de marché à un marchand et créez automatiquement un contrat</p>
        </div>

        {/* Message de feedback */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-100 border-2 border-green-300 text-green-800' 
              : 'bg-red-100 border-2 border-red-300 text-red-800'
          }`}>
            {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Indicateur de progression */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
                {step > 1 ? <Check size={20} /> : '1'}
              </div>
              <span className="ml-3 font-medium">Sélectionner Marchand</span>
            </div>
            <ArrowRight className="text-gray-400" />
            <div className={`flex items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
                {step > 2 ? <Check size={20} /> : '2'}
              </div>
              <span className="ml-3 font-medium">Choisir Place</span>
            </div>
            <ArrowRight className="text-gray-400" />
            <div className={`flex items-center ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="ml-3 font-medium">Catégorie & Confirmation</span>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Étape 1: Sélection du marchand */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Store className="mr-3 text-indigo-600" />
                Rechercher un Marchand sans Place
              </h2>
              
              <div className="relative mb-6">
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher par nom, prénom ou CIN..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                  value={searchMarchand}
                  onChange={(e) => setSearchMarchand(e.target.value)}
                />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredMarchands.length > 0 ? (
                  filteredMarchands.map(marchand => (
                    <div
                      key={marchand.id}
                      onClick={() => setSelectedMarchand(marchand)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedMarchand?.id === marchand.id
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 text-lg">
                            {marchand.prenom} {marchand.nom}
                          </h3>
                          <p className="text-gray-600">CIN: {marchand.numCIN}</p>
                          <p className="text-sm text-gray-500 mt-1">Tél: {marchand.numTel1 || 'Non renseigné'}</p>
                          {marchand.adress && (
                            <p className="text-sm text-gray-500">Adresse: {marchand.adress}</p>
                          )}
                        </div>
                        {selectedMarchand?.id === marchand.id && (
                          <Check className="w-6 h-6 text-indigo-600" />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Store className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">Aucun marchand disponible</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!selectedMarchand}
                className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Continuer vers la sélection de place
              </button>
            </div>
          )}

          {/* Étape 2: Sélection de la place */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <MapPin className="mr-3 text-indigo-600" />
                Rechercher une Place Disponible
              </h2>

              <div className="bg-indigo-50 p-4 rounded-xl mb-6">
                <p className="text-sm text-gray-700">
                  <strong>Marchand sélectionné:</strong> {selectedMarchand?.prenom} {selectedMarchand?.nom} - CIN: {selectedMarchand?.numCIN}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Nom du marché"
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                  value={searchPlace.marcheeName}
                  onChange={(e) => setSearchPlace({...searchPlace, market: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Zone"
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                  value={searchPlace.zoneName}
                  onChange={(e) => setSearchPlace({...searchPlace, zone: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Hall"
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                  value={searchPlace.hallName}
                  onChange={(e) => setSearchPlace({...searchPlace, hall: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Nom de la place"
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                  value={searchPlace.placeName}
                  onChange={(e) => setSearchPlace({...searchPlace, placeName: e.target.value})}
                />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredPlaces.length > 0 ? (
                  filteredPlaces.map(place => (
                    <div
                    key={place.id}
                    onClick={() => setSelectedPlace(place)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedPlace?.id === place.id
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                    >
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                        {/* Nom de la place */}
                        <h3 className="font-bold text-gray-800 text-lg">{place.nom}</h3>

                        {/* Marché */}
                        {place.marcheeName && (
                            <p className="text-gray-600">
                            <span className="font-medium text-gray-700">Marché : </span>
                            {place.marcheeName}
                            </p>
                        )}

                        {/* Zone et Hall */}
                        {(place.zoneName || place.hallName) && (
                            <div className="flex flex-wrap gap-2 mt-2">
                            {place.zoneName && (
                                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                                <span className="font-medium">Zone :</span> {place.zoneName}
                                </span>
                            )}
                            {place.hallName && (
                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                                <span className="font-medium">Hall :</span> {place.hallName}
                                </span>
                            )}
                            </div>
                        )}
                        </div>

                        {/* Icône de sélection */}
                        {selectedPlace?.id === place.id && (
                        <Check className="w-6 h-6 text-indigo-600" />
                        )}
                    </div>
                    </div>


                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">Aucune place disponible ne correspond à votre recherche</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedPlace}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Continuer vers la catégorie
                </button>
              </div>
            </div>
          )}

          {/* Étape 3: Catégorie et confirmation */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FileText className="mr-3 text-indigo-600" />
                Configuration du Contrat
              </h2>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl mb-6 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Marchand</p>
                    <p className="font-semibold text-gray-800">{selectedMarchand?.prenom} {selectedMarchand?.nom}</p>
                    <p className="text-sm text-gray-600">CIN: {selectedMarchand?.numCIN}</p>
                    <p className="text-sm text-gray-600">Tél: {selectedMarchand?.numTel1}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Place</p>
                    <p className="font-semibold text-gray-800">{selectedPlace?.nom}</p>
                    <p className="font-semibold text-gray-800">{selectedPlace?.marcheeName}</p>
                    <p className="text-sm text-gray-600">{selectedPlace?.adress}</p>
                    {selectedPlace?.zoneName && (
                      <p className="text-sm text-gray-600">Zone: {selectedPlace.zoneName}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">

              {/* ================== LIGNE 1 : Catégorie + Droit Annuel ================== */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Catégorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie d'activité <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                    value={selectedCategorie?.id || ''}
                    onChange={(e) => {
                      const cat = categories.find(c => c.id === parseInt(e.target.value));
                      setSelectedCategorie(cat);
                    }}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nom || cat.libelle || cat.designation}
                      </option>
                    ))}
                  </select>

                  {selectedCategorie && (
                    <p className="mt-2 text-sm text-gray-600">
                      <strong>Tarif:</strong> {selectedCategorie.tarif || selectedCategorie.montant || 'N/A'} Ar
                    </p>
                  )}
                </div>

                {/* Droit Annuel */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Droit Annuel <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                    value={selectedDroitAnnuel?.id || ''}
                    onChange={(e) => {
                      const droit = droitAnnuel.find(d => d.id === parseInt(e.target.value));
                      setSelectedDroitAnnuel(droit);
                    }}
                  >
                    <option value="">Sélectionner droit annuel</option>
                    {droitAnnuel.map(droit => (
                      <option key={droit.id} value={droit.id}>
                        {droit.montant || droit.libelle || droit.designation}
                      </option>
                    ))}
                  </select>

                  {selectedDroitAnnuel && (
                    <p className="mt-2 text-sm text-gray-600">
                      <strong>Tarif:</strong> {selectedDroitAnnuel.montant || 'N/A'} Ar
                    </p>
                  )}
                </div>

              </div>


              {/* ================== LIGNE 2 : Fréquence + Début Paiement ================== */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Fréquence */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fréquence de Paiement <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                    value={frequencePaiement}
                    onChange={(e) => setFrequencePaiement(e.target.value)}
                  >
                    <option value="">Sélectionner une fréquence</option>
                    <option value="JOURNALIER">Journalier</option>
                    <option value="HEBDOMADAIRE">Hebdomadaire</option>
                    <option value="MENSUEL">Mensuel</option>
                  </select>
                </div>

                {/* Début de Paiement */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Début de Paiement <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={dateOfStart}
                    onChange={(e)=>setDateOfStart(e.target.value)}
                    type="date"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                </div>

              </div>




                {/* Infos Contrat */}
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Informations du contrat</h4>
                    <p className="text-sm text-blue-800">
                      <strong>Nom:</strong> Contrat {selectedPlace?.nom} - {selectedMarchand?.prenom} {selectedMarchand?.nom}
                    </p>
                    <p className="text-sm text-blue-800 mt-1">
                      <strong>Description:</strong> Contrat pour la place {selectedPlace?.nom} attribuée à {selectedMarchand?.prenom} {selectedMarchand?.nom}
                      {selectedCategorie && ` - Catégorie: ${selectedCategorie.nom || selectedCategorie.libelle || selectedCategorie.designation}`}
                    </p>
                  </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(2)}
                  disabled={loading}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300 disabled:opacity-50 transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={handleAttribution}
                  disabled={!selectedCategorie || loading}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      Attribuer et créer le contrat
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bouton d'annulation global */}
        {step > 1 && !loading && (
          <button
            onClick={resetForm}
            className="mt-4 w-full bg-red-100 text-red-700 py-3 rounded-xl font-medium hover:bg-red-200 transition-colors flex items-center justify-center"
          >
            <X className="mr-2" size={20} />
            Annuler et recommencer
          </button>
        )}
      </div>
    </div>
  );
}