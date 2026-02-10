'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import API_BASE_URL from '@/services/APIbaseUrl';

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

interface FormErrors {
  email?: string;
  nom?: string;
  prenom?: string;
  pseudo?: string;
  telephone?: string;
  role?: string;
}

export default function CreateUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState<CreateUserRequest>({
    email: '',
    nom: '',
    prenom: '',
    pseudo: '',
    telephone: '',
    role: ''
  });

  // Validation email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    }

    if (!formData.pseudo.trim()) {
      newErrors.pseudo = 'Le pseudo est requis';
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le téléphone est requis';
    }

    if (!formData.role) {
      newErrors.role = 'Veuillez sélectionner un rôle';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion des changements dans les inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Effacer l'erreur du champ modifié
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };


  //token from local storage

  const token = localStorage.getItem("authToken");


  console.log("Token dans creerPrmc/page.tsx :", token);
  // Gestion du checkbox pour le rôle
  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      role: e.target.checked ? 'DIRECTEUR' : ''
    }));

    if (errors.role) {
      setErrors(prev => ({
        ...prev,
        role: undefined
      }));
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      console.log('formData avant envoi:', formData); // Debug avant envoi
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // JWT obligatoire pour @PreAuthorize
          
        },
        body: JSON.stringify(formData),
      });

      const result: ApiResponse<any> = await response.json();

      if (response.ok && result.success) {
        setSuccessMessage('Utilisateur créé avec succès ! Un email avec le mot de passe temporaire a été envoyé.');
        // Réinitialiser le formulaire
        setFormData({
          email: '',
          nom: '',
          prenom: '',
          pseudo: '',
          telephone: '',
          role: ''
        });
        
        // Redirection optionnelle après 2 secondes
        setTimeout(() => {
          router.push('/dashboard/ordo/equipe'); // Adapter selon votre routing
        }, 2000);
      } else {
        setErrorMessage(result.message || 'Une erreur est survenue lors de la création');
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      setErrorMessage('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-5 px-4 sm:px-6 lg:px-8">
      <div className="w-full mx-auto">
        <div className="bg-white shadow-lg rounded-lg px-8 py-10">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center">
              Créer un utilisateur
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Créer un nouveau compte utilisateur dans le système
            </p>
          </div>

          {/* Messages de succès et d'erreur */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    {successMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="utilisateur@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Nom */}
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.nom ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Nom de famille"
              />
              {errors.nom && (
                <p className="mt-1 text-xs text-red-600">{errors.nom}</p>
              )}
            </div>

            {/* Prénom */}
            <div>
              <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">
                Prénom *
              </label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.prenom ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Prénom"
              />
              {errors.prenom && (
                <p className="mt-1 text-xs text-red-600">{errors.prenom}</p>
              )}
            </div>

            {/* Pseudo */}
            <div>
              <label htmlFor="pseudo" className="block text-sm font-medium text-gray-700 mb-1">
                Pseudo *
              </label>
              <input
                type="text"
                id="pseudo"
                name="pseudo"
                value={formData.pseudo}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.pseudo ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Nom d'utilisateur"
              />
              {errors.pseudo && (
                <p className="mt-1 text-xs text-red-600">{errors.pseudo}</p>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone *
              </label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.telephone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="+33 1 23 45 67 89"
              />
              {errors.telephone && (
                <p className="mt-1 text-xs text-red-600">{errors.telephone}</p>
              )}
            </div>

            {/* Rôle - Checkbox */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Rôle *
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="role-responsable"
                  checked={formData.role === 'DIRECTEUR'}
                  onChange={handleRoleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="role-responsable" className="ml-3 text-sm text-gray-700">
                  Personne responsable de marchés communaux
                </label>
              </div>
              {errors.role && (
                <p className="mt-1 text-xs text-red-600">{errors.role}</p>
              )}
            </div>

            {/* Boutons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Création...
                  </div>
                ) : (
                  'Créer l\'utilisateur'
                )}
              </button>
            </div>
          </form>

          {/* Note informative */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Un mot de passe temporaire sera généré et envoyé par email à l'utilisateur.
              <br />
              L&apos;utilisateur devra changer son mot de passe lors de sa première connexion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}