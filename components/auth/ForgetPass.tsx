'use client';

import { useState, useEffect } from 'react';
import { X, Mail, User, Phone, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import API_BASE_URL from '@/services/APIbaseUrl';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: ''
  });

  // Réinitialiser le formulaire quand le modal se ferme
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setFormData({ nom: '', prenom: '', telephone: '', email: '' });
        setMessage({ type: '', text: '' });
      }, 300); // Attendre la fin de l'animation
    }
  }, [isOpen]);

  // Empêcher le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.nom || !formData.prenom || !formData.telephone || !formData.email) {
      setMessage({ type: 'error', text: 'Tous les champs sont obligatoires.' });
      return false;
    }

    if (!formData.email.includes('@')) {
      setMessage({ type: 'error', text: 'Veuillez entrer une adresse email valide.' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nom: formData.nom,
          prenom: formData.prenom,
          telephone: formData.telephone,
          email: formData.email
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: 'Vérifiez votre email pour recevoir votre mot de passe temporaire.' 
        });
        setFormData({ nom: '', prenom: '', telephone: '', email: '' });
        
        // Fermer le modal après 3 secondes
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setMessage({ 
          type: 'error', 
          text: 'Informations incorrectes. Veuillez réessayer.' 
        });
      }
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      setMessage({ 
        type: 'error', 
        text: 'Impossible de se connecter au serveur. Veuillez réessayer plus tard.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Modal Slide-in */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Mot de passe oublié ?</h2>
                <p className="text-blue-100 text-sm mt-1">
                  Récupérez votre accès en quelques clics
                </p>
              </div>
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* Message de notification */}
            {message.text && (
              <div className={`mb-6 rounded-lg border-l-4 p-4 ${
                message.type === 'success' 
                  ? 'bg-green-50 border-green-500' 
                  : 'bg-red-50 border-red-500'
              }`}>
                <div className="flex items-start gap-3">
                  {message.type === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <p className={`text-sm font-medium ${
                    message.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {message.text}
                  </p>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Important :</strong> Remplissez tous les champs ci-dessous avec vos informations d'inscription. 
                Vous recevrez un mot de passe temporaire par email.
              </p>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nom et Prénom */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="prenom"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                      placeholder="Votre prénom"
                    />
                  </div>
                </div>
              </div>

              {/* Numéro de téléphone */}
              <div>
                <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de téléphone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                    placeholder="Ex: 06 12 34 56 78"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                    placeholder="exemple@email.com"
                  />
                </div>
              </div>

              {/* Boutons */}
              <div className="flex flex-col gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading && (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isLoading ? 'Envoi en cours...' : 'Envoyer la demande'}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>

          {/* Pied de page */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <p className="text-xs text-gray-600 text-center">
              Besoin d'aide ? Contactez le service administratif
            </p>
          </div>
        </div>
      </div>
    </>
  );
}