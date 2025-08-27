'use client';

import React, { useState } from 'react';

import api from '@/services/api';

// Configuration de l'API

// Types
interface CreateUserRequest {
  email: string;
  nom: string;
  prenom: string;
  pseudo: string;
  telephone: string;
  role: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// Composant Modal de confirmation
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userData: CreateUserRequest;
}



const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userData
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Confirmer la création
        </h3>
        <p className="text-gray-600 mb-6">
          Êtes-vous sûr de vouloir créer l'utilisateur{' '}
          <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {userData.nom}
          </span>{' '}
          avec l'email{' '}
          <span className="font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
            {userData.email}
          </span>{' '}
          et pour le rôle{' '}
          <span className="font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded">
            {userData.role}
          </span> ?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant principal
const CreateUserPage: React.FC = () => {
  const [formData, setFormData] = useState<CreateUserRequest>({
    nom: '',
    email: '',
    role: '',
    pseudo: '',
    telephone: '',
    prenom: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const roles = [
    { value: 'PRMC', label: 'PRMC' },
    { value: 'REGISSEUR', label: 'Régisseur' },
    { value: 'PERCEPTEUR', label: 'Percepteur' },
    { value: 'REGISSEUR_PRINCIPAL', label: 'Régisseur Principal' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const confirmCreateUser = async () => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      const response = await api.post<ApiResponse<any>>('/users', formData);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Utilisateur créé avec succès!' });
        setFormData({
                nom: '',
                email: '',
                role: '',
                pseudo: '',
                telephone: '',
                prenom: '',
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Une erreur est survenue lors de la création';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  const isFormValid = formData.nom && formData.email && formData.role && formData.motDePasse;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 text-center">
            Création d'un nouvel utilisateur
          </h1>
          <p className="text-gray-600 text-center mt-2">
            Remplissez les informations ci-dessous pour créer un compte utilisateur
          </p>
        </div>

        {/* Message de feedback */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Formulaire */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Nom complet */}
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Entrez le nom complet"
                />
              </div>

              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-2">
                  Prenom *
                </label>
                <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Entrez le nom complet"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="exemple@email.com"
                />
              </div>

              {/* Rôle */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle *
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Sélectionnez un rôle</option>
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pseudo */}
                <div>
                    <label htmlFor="pseudo" className="block text-sm font-medium text-gray-700 mb-2">
                    Pseudo *
                    </label>
                    <input
                    type="text"
                    id="pseudo"
                    name="pseudo"
                    value={formData.pseudo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Entrez le pseudo"
                    />
                 </div>

              {/* Téléphone */}
              <div>
                <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="+261 34 00 000 00"
                />
              </div>
              {/* Adresse */}
              
            

                {/* Bouton de soumission */}
                <div className="  pt-6">
                <button
                    type="submit"
                    // disabled={!isFormValid || isLoading}
                    className={`px-8 py-3 rounded-lg font-medium text-white transition-all duration-200 ${
                    isFormValid && !isLoading
                        ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                >
                    {isLoading ? 'Création en cours...' : 'Créer l\'utilisateur'}
                </button>
                </div>

            </div>
          </form>
        </div>
      </div>

      {/* Modal de confirmation */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmCreateUser}
        userData={formData}
      />
    </div>
  );
};

export default CreateUserPage;