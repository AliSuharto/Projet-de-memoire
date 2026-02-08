'use client';
import React, { useState } from 'react';
import { Lock, Mail, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import API_BASE_URL from '@/services/APIbaseUrl';



export default function PasswordManagement() {
  const [activeTab, setActiveTab] = useState<'change' | 'reset'>('change');
  const [changePasswordData, setChangePasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [forgotPasswordData, setForgotPasswordData] = useState({
    nom: '',
    prenom: '',
    numero: '',
    email: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    setMessage({ type: '', text: '' });

    // Validation côté client
    if (!changePasswordData.oldPassword || !changePasswordData.newPassword || !changePasswordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Tous les champs sont obligatoires.' });
      return;
    }

    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    if (changePasswordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 8 caractères.' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Ajoutez le token d'authentification si nécessaire
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          oldPassword: changePasswordData.oldPassword,
          newPassword: changePasswordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Votre mot de passe a été modifié avec succès.' });
        setChangePasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Une erreur est survenue lors du changement de mot de passe.' });
      }
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      setMessage({ type: 'error', text: 'Impossible de se connecter au serveur. Veuillez réessayer plus tard.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setMessage({ type: '', text: '' });

    // Validation côté client
    if (!forgotPasswordData.nom || !forgotPasswordData.prenom || !forgotPasswordData.numero || !forgotPasswordData.email) {
      setMessage({ type: 'error', text: 'Tous les champs sont obligatoires.' });
      return;
    }

    if (!forgotPasswordData.email.includes('@')) {
      setMessage({ type: 'error', text: 'Veuillez entrer une adresse email valide.' });
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
          nom: forgotPasswordData.nom,
          prenom: forgotPasswordData.prenom,
          numero: forgotPasswordData.numero,
          email: forgotPasswordData.email
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Un lien de réinitialisation a été envoyé à votre adresse email.' });
        setForgotPasswordData({ nom: '', prenom: '', numero: '', email: '' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Une erreur est survenue. Veuillez vérifier vos informations.' });
      }
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      setMessage({ type: 'error', text: 'Impossible de se connecter au serveur. Veuillez réessayer plus tard.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="bg-white border border-gray-200 shadow-sm mb-6">
          <div className="border-l-4 border-blue-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Gestion du Mot de Passe</h1>
                <p className="text-sm text-gray-600 mt-1">Modification et réinitialisation du mot de passe</p>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets de navigation */}
        <div className="bg-white border border-gray-200 shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('change');
                setMessage({ type: '', text: '' });
              }}
              className={`flex-1 px-6 py-4 font-medium text-sm transition-colors ${
                activeTab === 'change'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Modifier le mot de passe
            </button>
            <button
              onClick={() => {
                setActiveTab('reset');
                setMessage({ type: '', text: '' });
              }}
              className={`flex-1 px-6 py-4 font-medium text-sm transition-colors ${
                activeTab === 'reset'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Mot de passe oublié
            </button>
          </div>
        </div>

        {/* Message de notification */}
        {message.text && (
          <div className={`mb-6 border-l-4 ${
            message.type === 'success' ? 'bg-green-50 border-green-600' : 'bg-red-50 border-red-600'
          }`}>
            <div className="px-6 py-4 flex items-start gap-3">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <span className={`text-sm font-medium ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>{message.text}</span>
            </div>
          </div>
        )}

        {/* Contenu selon l'onglet actif */}
        {activeTab === 'change' ? (
          /* Section Changement de mot de passe */
          <div className="bg-white border border-gray-200 shadow-sm">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
              <h2 className="text-lg font-semibold text-gray-900">Modification du Mot de Passe</h2>
            </div>
            <div className="px-6 py-6">
              <div className="max-w-2xl">
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ancien mot de passe <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    value={changePasswordData.oldPassword}
                    onChange={(e) => setChangePasswordData({...changePasswordData, oldPassword: e.target.value})}
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Saisissez votre ancien mot de passe"
                  />
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau mot de passe <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    value={changePasswordData.newPassword}
                    onChange={(e) => setChangePasswordData({...changePasswordData, newPassword: e.target.value})}
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Minimum 8 caractères"
                  />
                  <p className="text-xs text-gray-500 mt-1">Le mot de passe doit contenir au moins 8 caractères.</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le nouveau mot de passe <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    value={changePasswordData.confirmPassword}
                    onChange={(e) => setChangePasswordData({...changePasswordData, confirmPassword: e.target.value})}
                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleChangePassword()}
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Ressaisissez le nouveau mot de passe"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleChangePassword}
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading && (
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isLoading ? 'Traitement...' : 'Valider le changement'}
                  </button>
                  <button
                    onClick={() => setChangePasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })}
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Section Mot de passe oublié */
          <div className="bg-white border border-gray-200 shadow-sm">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
              <h2 className="text-lg font-semibold text-gray-900">Réinitialisation du Mot de Passe</h2>
            </div>
            <div className="px-6 py-6">
              <p className="text-sm text-gray-600 mb-6">
                Veuillez remplir le formulaire ci-dessous pour recevoir un lien de réinitialisation de votre mot de passe.
              </p>
              <div className="max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline w-4 h-4 mr-1" /> Nom <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={forgotPasswordData.nom}
                      onChange={(e) => setForgotPasswordData({...forgotPasswordData, nom: e.target.value})}
                      disabled={isLoading}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Nom"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline w-4 h-4 mr-1" /> Prénom <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={forgotPasswordData.prenom}
                      onChange={(e) => setForgotPasswordData({...forgotPasswordData, prenom: e.target.value})}
                      disabled={isLoading}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Prénom"
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline w-4 h-4 mr-1" /> Numéro de téléphone <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    value={forgotPasswordData.numero}
                    onChange={(e) => setForgotPasswordData({...forgotPasswordData, numero: e.target.value})}
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Ex: 06 12 34 56 78"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline w-4 h-4 mr-1" /> Adresse email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    value={forgotPasswordData.email}
                    onChange={(e) => setForgotPasswordData({...forgotPasswordData, email: e.target.value})}
                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleForgotPassword()}
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="exemple@email.com"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleForgotPassword}
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading && (
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
                  </button>
                  <button
                    onClick={() => setForgotPasswordData({ nom: '', prenom: '', numero: '', email: '' })}
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pied de page */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Pour toute assistance, veuillez contacter le service administratif.</p>
        </div>
      </div>
    </div>
  );
}