'use client';

import React, { useState } from 'react';
import { UserPlus, Mail, User, Phone, Shield, X } from 'lucide-react';
import api from '@/services/api';
import { useToast } from '@/components/ui/ToastContainer';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="absolute inset-0 bg-black/50 modal-overlay"
        onClick={onClose}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClose();
          }
        }}
        aria-label="Fermer la modal"
      />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full animate-slideUp">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-4 mx-auto">
          <UserPlus className="w-7 h-7 text-blue-600" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
          Confirmer la création
        </h3>
        
        <div className="space-y-2 mb-6">
          <div className="bg-gray-50 rounded-lg p-2.5">
            <p className="text-xs text-gray-500 mb-0.5">Nom complet</p>
            <p className="font-semibold text-gray-900">{userData.prenom} {userData.nom}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-2.5">
            <p className="text-xs text-gray-500 mb-0.5">Email</p>
            <p className="font-semibold text-gray-900">{userData.email}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-2.5">
            <p className="text-xs text-gray-500 mb-0.5">Rôle</p>
            <p className="font-semibold text-gray-900">{userData.role}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
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
  const { showSuccess, showError } = useToast();
  
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

  const roles = [
    { value: 'REGISSEUR', label: 'Régisseur', color: 'blue' },
    { value: 'PERCEPTEUR', label: 'Percepteur', color: 'green' },
    { value: 'REGISSEUR_PRINCIPAL', label: 'Régisseur Principal', color: 'purple' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const confirmCreateUser = async () => {
    setIsLoading(true);
    
    try {
      const response = await api.post<ApiResponse<unknown>>('/users', formData);
      
      if (response.data.success) {
        showSuccess(
          'Utilisateur créé avec succès!',
          `${formData.prenom} ${formData.nom} a été ajouté au système.`
        );
        
        // Réinitialiser le formulaire
        setFormData({
          nom: '',
          email: '',
          role: '',
          pseudo: '',
          telephone: '',
          prenom: '',
        });
        
        setIsModalOpen(false);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Une erreur est survenue lors de la création de l\'utilisateur';
      showError(
        'Erreur de création',
        errorMessage
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.nom && formData.email && formData.role && formData.prenom && formData.pseudo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-4 px-4 pt-20 md:pt-0">
      <div className="max-w-4xl mx-auto">
        {/* Header avec animation */}
        <div className="text-center mb-4 animate-fadeIn">
          <h1 className="text-xl font-bold text-gray-900 mb-1 flex items-center justify-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            Nouveau Utilisateur
          </h1>
          <p className="text-xs text-gray-600">
            Créez un compte utilisateur en quelques étapes
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-sm p-6 animate-slideUp">
          <div className="space-y-5">
            {/* Informations personnelles */}
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Informations personnelles
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label htmlFor="prenom" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 outline-none"
                    placeholder="Jean"
                  />
                </div>

                <div className="group">
                  <label htmlFor="nom" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 outline-none"
                    placeholder="Dupont"
                  />
                </div>

                <div className="group">
                  <label htmlFor="pseudo" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Pseudo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="pseudo"
                    name="pseudo"
                    value={formData.pseudo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 outline-none"
                    placeholder="jdupont"
                  />
                </div>

                <div className="group">
                  <label htmlFor="telephone" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      id="telephone"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 outline-none"
                      placeholder="+261 34 00 000 00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Informations de connexion */}
            <div className="border-t-2 border-gray-100 pt-4">
              <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                Informations de connexion
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Adresse email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 outline-none"
                      placeholder="exemple@email.com"
                    />
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="role" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Rôle <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Sélectionnez un rôle</option>
                      {roles.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Bouton de soumission */}
            <div className="flex justify-end pt-3">
              <button
                onClick={handleSubmit}
                disabled={!isFormValid || isLoading}
                className={`group relative px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-300 ${
                  isFormValid && !isLoading
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 active:scale-95'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <span className="flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Créer l&apos;utilisateur
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmCreateUser}
        userData={formData}
      />

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CreateUserPage;