'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, User, Phone, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const BASE_URL_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    numero: '',
    email: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.nom || !formData.prenom || !formData.numero || !formData.email) {
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
      const response = await fetch(`${BASE_URL_API}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nom: formData.nom,
          prenom: formData.prenom,
          numero: formData.numero,
          email: formData.email
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: data.message || 'Un lien de réinitialisation a été envoyé à votre adresse email.' 
        });
        setFormData({ nom: '', prenom: '', numero: '', email: '' });
        
        // Redirection après 3 secondes
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setMessage({ 
          type: 'error', 
          text: data.message || 'Une erreur est survenue. Veuillez vérifier vos informations.' 
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo et retour */}
        <div className="text-center">
          <button
            onClick={() => router.push('/login')}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la connexion
          </button>
          
          <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900">
            Mot de passe oublié ?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Remplissez le formulaire ci-dessous pour recevoir un lien de réinitialisation
          </p>
        </div>

        {/* Message de notification */}
        {message.text && (
          <div className={`rounded-lg border-l-4 p-4 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-500' 
              : 'bg-red-50 border-red-500'
          }`}>
            <div className="flex items-start">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm font-medium ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        )}

        {/* Formulaire */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg border border-gray-100">
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
                    placeholder="Nom"
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
                    placeholder="Prénom"
                  />
                </div>
              </div>
            </div>

            {/* Numéro de téléphone */}
            <div>
              <label htmlFor="numero" className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="numero"
                  name="numero"
                  value={formData.numero}
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

            {/* Bouton de soumission */}
            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
            </Button>
          </form>

          {/* Aide */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous vous souvenez de votre mot de passe ?{' '}
              <button
                onClick={() => router.push('/login')}
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Se connecter
              </button>
            </p>
          </div>
        </div>

        {/* Pied de page */}
        <div className="text-center text-sm text-gray-500">
          <p>Pour toute assistance, veuillez contacter le service administratif.</p>
        </div>
      </div>
    </div>
  );
}