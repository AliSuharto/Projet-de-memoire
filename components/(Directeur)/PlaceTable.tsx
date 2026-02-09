"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

interface Place {
  id: number;
  nom: string;
  adresse?: string;
  isOccuped?: boolean;
}

interface PlacesTableProps {
  places: Place[];
  onPlacesChange: (places: Place[]) => void;
  oncreatePlace: () => void;
  // Pour mettre à jour la liste après modifications
}

interface EditModalProps {
  place: Place | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (place: Place) => void;
}

// Composant Modal pour l'édition
const EditModal: React.FC<EditModalProps> = ({ place, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    isOccuped: false
  });

  React.useEffect(() => {
    if (place) {
      setFormData({
        nom: place.nom || '',
        adresse: place.adresse || '',
        isOccuped: place.isOccuped || false
      });
    }
  }, [place]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (place) {
      onSave({
        ...place,
        nom: formData.nom,
        adresse: formData.adresse,
        isOccuped: formData.isOccuped
      });
    }
    onClose();
  };

  if (!isOpen || !place) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Modifier la place</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la place *
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse
            </label>
            <input
              type="text"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Adresse optionnelle"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isOccuped"
              checked={formData.isOccuped}
              onChange={(e) => setFormData({ ...formData, isOccuped: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isOccuped" className="ml-2 text-sm text-gray-700">
              Place occupée
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PlacesTable: React.FC<PlacesTableProps> = ({ places, onPlacesChange }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Filtrer les places selon le terme de recherche
  const filteredPlaces = useMemo(() => {
    return places.filter(place =>
      place.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (place.adresse && place.adresse.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [places, searchTerm]);

  // Calculer la pagination
  const totalPages = Math.ceil(filteredPlaces.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPlaces = filteredPlaces.slice(startIndex, endIndex);

  // Réinitialiser la page quand on change le filtre
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  // Générer les numéros de page à afficher
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
  };

  // Créer une nouvelle place via API
  const handleCreatePlace = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('http://localhost:8080/api/public/places', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: `Place ${places.length + 1}`, // Nom par défaut
          adresse: '',
          isOccuped: false
        })
      });

      if (response.ok) {
        const newPlace = await response.json();
        onPlacesChange([...places, newPlace]);
      } else {
        alert('Erreur lors de la création de la place');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de la place');
    } finally {
      setIsCreating(false);
    }
  };

  // Ouvrir le modal d'édition
  const handleEditPlace = (place: Place) => {
    setEditingPlace(place);
    setIsModalOpen(true);
  };

  // Sauvegarder les modifications via API
  const handleSavePlace = async (updatedPlace: Place) => {
    try {
      const response = await fetch(`http://localhost:8080/api/public/places/${updatedPlace.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPlace)
      });

      if (response.ok) {
        const savedPlace = await response.json();
        const updatedPlaces = places.map(place => 
          place.id === savedPlace.id ? savedPlace : place
        );
        onPlacesChange(updatedPlaces);
      } else {
        alert('Erreur lors de la modification de la place');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la modification de la place');
    }
  };

  // Supprimer une place
  const handleDeletePlace = async (placeId: number) => {
    const place = places.find(p => p.id === placeId);
    if (!place) return;

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la place "${place.nom}" ?`)) {
      try {
        const response = await fetch(`http://localhost:8080/api/public/places/${placeId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          const updatedPlaces = places.filter(place => place.id !== placeId);
          onPlacesChange(updatedPlaces);
        } else {
          alert('Erreur lors de la suppression de la place');
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression de la place');
      }
    }
  };

  // Supprimer toutes les places
  const handleDeleteAll = async () => {
    if (places.length === 0) return;

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer toutes les ${places.length} places ?`)) {
      try {
        const response = await fetch('http://localhost:8080/api/public/places', {
          method: 'DELETE'
        });

        if (response.ok) {
          onPlacesChange([]);
        } else {
          alert('Erreur lors de la suppression des places');
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression des places');
      }
    }
  };

  if (places.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Aucune place disponible</p>
        <button
          onClick={handleCreatePlace}
          disabled={isCreating}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-md transition-colors"
        >
          {isCreating ? 'Création...' : 'Créer la première place'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* En-tête avec recherche et statistiques */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{filteredPlaces.length}</span> place{filteredPlaces.length > 1 ? 's' : ''} 
            {searchTerm && <span> (filtré{filteredPlaces.length > 1 ? 's' : ''})</span>}
            {filteredPlaces.length !== places.length && (
              <span className="text-gray-400"> sur {places.length}</span>
            )}
          </div>
          {places.some(p => p.hasOwnProperty('isOccuped')) && (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>{places.filter(p => !p.isOccuped).length} libres</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>{places.filter(p => p.isOccuped).length} occupées</span>
              </div>
            </div>
          )}
        </div>

        {/* Barre de recherche et actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="A00..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-40 sm:w-30 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Boutons d'action */}
          
          <button
            onClick={handleDeleteAll}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
          >
            Supprimer tout
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-semibold text-gray-700">ID</th>
                <th className="text-left p-3 font-semibold text-gray-700">Nom</th>
                {places.some(p => p.adresse) && (
                  <th className="text-left p-3 font-semibold text-gray-700">Adresse</th>
                )}
                {places.some(p => p.hasOwnProperty('isOccuped')) && (
                  <th className="text-left p-3 font-semibold text-gray-700">Statut</th>
                )}
                <th className="text-left p-3 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPlaces.map((place, index) => (
                <tr 
                  key={place.id} 
                  className={`border-b hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                  }`}
                >
                  <td className="p-3 text-sm font-mono text-gray-600">#{place.id}</td>
                  <td className="p-3">
                    <div className="font-medium text-gray-900">{place.nom}</div>
                  </td>
                  {places.some(p => p.adresse) && (
                    <td className="p-3 text-sm text-gray-600">
                      {place.adresse || (
                        <span className="text-gray-400 italic">Non spécifiée</span>
                      )}
                    </td>
                  )}
                  {places.some(p => p.hasOwnProperty('isOccuped')) && (
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        place.isOccuped
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          place.isOccuped ? 'bg-red-500' : 'bg-green-500'
                        }`}></div>
                        {place.isOccuped ? 'Occupée' : 'Libre'}
                      </span>
                    </td>
                  )}
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/directeur/places/${place.id}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        
                      </Link>
                      
                      <button
                        onClick={() => handleEditPlace(place)}
                        className="inline-flex items-center text-green-600 hover:text-green-800 text-sm font-medium transition-colors"
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                       
                      </button>
                      
                      <button
                        onClick={() => handleDeletePlace(place.id)}
                        className="inline-flex items-center text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4">
          {/* Sélecteur d'éléments par page */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Afficher</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
            </select>
          </div>

          {/* Navigation des pages */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
             ←
            </button>

            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                disabled={page === '...'}
                className={`px-3 py-2 text-sm font-medium border-t border-b ${
                  page === currentPage
                    ? 'text-blue-600 bg-blue-50 border-blue-300'
                    : page === '...'
                    ? 'text-gray-400 bg-white border-gray-300 cursor-default'
                    : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
             →
            </button>
          </div>
        </div>
      )}

      {/* Message si aucun résultat */}
      {filteredPlaces.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-2">Aucune place trouvée pour {searchTerm}</p>
          <button
            onClick={() => setSearchTerm('')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Effacer la recherche
          </button>
        </div>
      )}

      {/* Modal d'édition */}
      <EditModal
        place={editingPlace}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPlace(null);
        }}
        onSave={handleSavePlace}
      />
    </div>
  );
};

export default PlacesTable;