import React, { useState, useEffect } from 'react';
import { Edit2, Save, X, MapPin, Users, Phone, Mail, Globe } from 'lucide-react';

const CommuneManager = () => {
  const [commune, setCommune] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedCommune, setEditedCommune] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Configuration de l'endpoint - à adapter selon votre configuration Spring Boot
  const API_BASE_URL = 'http://localhost:8080/api'; // Changez selon votre configuration
  const COMMUNE_ID = 1; // ID de la commune à afficher

  // Simulation des données pour la démonstration (remplacez par vos vrais appels API)
  const fetchCommune = async () => {
    try {
      setLoading(true);
      
      // Remplacez cette simulation par votre vrai appel API
      // const response = await fetch(`${API_BASE_URL}/communes/${COMMUNE_ID}`);
      // const data = await response.json();
      
      // Données simulées - remplacez par votre appel API réel
      const simulatedData = {
        id: 1,
        nom: 'Antananarivo',
        codePostal: '101',
        region: 'Analamanga',
        population: 1391433,
        superficie: 88.0,
        maire: 'Naina Andriantsitohaina',
        telephone: '+261 20 22 222 22',
        email: 'contact@antananarivo.mg',
        siteWeb: 'www.antananarivo.mg',
        description: 'Capitale de Madagascar, située dans les hautes terres centrales'
      };
      
      setCommune(simulatedData);
      setEditedCommune(simulatedData);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des données de la commune');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveCommune = async () => {
    try {
      setLoading(true);
      
      // Remplacez cette simulation par votre vrai appel API
      // const response = await fetch(`${API_BASE_URL}/communes/${COMMUNE_ID}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(editedCommune)
      // });
      
      // if (!response.ok) {
      //   throw new Error('Erreur lors de la sauvegarde');
      // }
      
      // const updatedData = await response.json();
      
      // Simulation de la sauvegarde
      console.log('Données sauvegardées:', editedCommune);
      setCommune(editedCommune);
      setEditMode(false);
      setError('');
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    setEditedCommune({ ...commune });
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditedCommune({ ...commune });
  };

  const handleInputChange = (field, value) => {
    setEditedCommune(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    fetchCommune();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des informations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="text-red-800 font-medium mb-2">Erreur</div>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchCommune}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const InfoField = ({ label, field, type = 'text', fullWidth = false }) => {
    const value = editMode ? editedCommune[field] : commune[field];
    
    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        <div className="text-xs font-medium text-gray-600 mb-1">
          {label}
        </div>
        <div>
          {editMode ? (
            type === 'textarea' ? (
              <textarea
                value={value}
                onChange={(e) => handleInputChange(field, e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 resize-none"
                rows="3"
                placeholder={label}
              />
            ) : (
              <input
                type={type}
                value={value}
                onChange={(e) => handleInputChange(field, type === 'number' ? Number(e.target.value) : e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                placeholder={label}
              />
            )
          ) : (
            <div className="text-gray-900 text-sm font-medium bg-gray-50 rounded px-2 py-1.5 min-h-[32px] flex items-center">
              {type === 'number' && value ? value.toLocaleString() : value || '-'}
              {field === 'superficie' && value && ' km²'}
              {field === 'population' && value && ' habitants'}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow mb-4">
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-800 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                Informations de la Commune
              </h1>
              <p className="text-gray-600 mt-1 text-sm">Gérer les données administratives</p>
            </div>
            
            {!editMode ? (
              <button
                onClick={handleEdit}
                className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 flex items-center text-sm"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Modifier
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={saveCommune}
                  className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 flex items-center text-sm"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Sauvegarder
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-3 py-1.5 rounded hover:bg-gray-600 flex items-center text-sm"
                >
                  <X className="w-4 h-4 mr-1" />
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Informations en grille compacte */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">
              {editMode ? 'Édition des informations' : 'Détails de la commune'}
            </h2>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <InfoField 
                label="Nom de la commune"
                field="nom"
              />
              <InfoField 
                label="Code postal"
                field="codePostal"
              />
              <InfoField 
                label="Région"
                field="region"
              />
              <InfoField 
                label="Population"
                field="population"
                type="number"
              />
              <InfoField 
                label="Superficie"
                field="superficie"
                type="number"
              />
              <InfoField 
                label="Maire"
                field="maire"
              />
              <InfoField 
                label="Téléphone"
                field="telephone"
              />
              <InfoField 
                label="Email"
                field="email"
                type="email"
              />
              <InfoField 
                label="Site web"
                field="siteWeb"
              />
            </div>
            
            {/* Description séparée car plus large */}
            <div className="mt-4">
              <InfoField 
                label="Description"
                field="description"
                type="textarea"
                fullWidth={true}
              />
            </div>
          </div>
        </div>

        {/* Instructions pour l'intégration */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h3 className="text-base font-medium text-blue-800 mb-2">Instructions d'intégration</h3>
          <div className="text-blue-700 text-xs space-y-1">
            <p>• Modifiez la variable <code className="bg-blue-100 px-1 rounded">API_BASE_URL</code> avec l'URL de votre backend Spring Boot</p>
            <p>• Décommentez les appels API réels dans les fonctions <code className="bg-blue-100 px-1 rounded">fetchCommune</code> et <code className="bg-blue-100 px-1 rounded">saveCommune</code></p>
            <p>• Adaptez les endpoints selon votre structure d'API (/api/communes/:id)</p>
            <p>• Ajustez les champs selon votre modèle de données</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommuneManager;