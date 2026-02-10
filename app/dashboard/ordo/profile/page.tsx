'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Shield, Calendar, Edit2, Lock, 
  Save, X, Eye, EyeOff, Key, CheckCircle, AlertCircle,
  Building2, MapPin, Briefcase, Clock, Award, Settings
} from 'lucide-react';
import API_BASE_URL from '@/services/APIbaseUrl';

// ──────────────────────────────────────────────── Types
interface UserData {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  pseudo: string;
  role: string;
  isActive: boolean;
  mustChangePassword: boolean;
  telephone?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

interface PasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ApiResponse {
  data?: UserData;
  user?: UserData;
}

type PasswordFieldKey = 'old' | 'new' | 'confirm';

interface ShowPasswordState {
  old: boolean;
  new: boolean;
  confirm: boolean;
}

interface RoleBadgeConfig {
  color: string;
  icon: JSX.Element;
}

// ──────────────────────────────────────────────── Composant principal
const UserProfile = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [editedUser, setEditedUser] = useState<Partial<UserData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Modal mot de passe
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    oldPassword: '', newPassword: '', confirmPassword: ''
  });
  const [showPw, setShowPw] = useState<ShowPasswordState>({ old: false, new: false, confirm: false });

  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const raw: ApiResponse & UserData = await res.json();
      const data: UserData = raw.data || raw.user || raw;

      if (!data?.id || !data.email) {
        throw new Error("Format de réponse invalide");
      }

      setUser(data);
      setEditedUser(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
      console.error(errorMessage);
      setError("Impossible de charger le profil. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setError('');
      setSuccess('');

      const res = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedUser),
      });

      if (!res.ok) throw new Error("Échec mise à jour");

      const updated: ApiResponse & UserData = await res.json();
      const freshData = updated.data || updated.user || updated;

      setUser(freshData);
      setEditedUser(freshData);
      setIsEditing(false);
      setSuccess("Profil mis à jour avec succès");
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur de sauvegarde";
      setError(errorMessage);
    }
  };

  const handleChangePassword = async () => {
    try {
      setError('');
      setSuccess('');

      const { oldPassword, newPassword, confirmPassword } = passwordForm;

      if (newPassword !== confirmPassword) {
        setError("Les mots de passe ne correspondent pas");
        return;
      }

      if (newPassword.length < 6) {
        setError("Le mot de passe doit faire au moins 6 caractères");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: '' }));
        throw new Error(errData.message || "Échec changement mot de passe");
      }

      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordModal(false);
      setSuccess("Mot de passe modifié avec succès");
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur – ancien mot de passe incorrect ?";
      setError(errorMessage);
    }
  };

  // Fonction pour obtenir les initiales
  const getInitials = (prenom: string, nom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  // Fonction pour obtenir une couleur basée sur le rôle
  const getRoleBadge = (role: string): RoleBadgeConfig => {
    const badges: Record<string, RoleBadgeConfig> = {
      'DIRECTEUR': { color: 'bg-purple-500', icon: <Award size={14} /> },
      'REGISSEUR_PRINCIPAL': { color: 'bg-blue-500', icon: <Shield size={14} /> },
      'REGISSEUR': { color: 'bg-green-500', icon: <Briefcase size={14} /> },
      'PERCEPTEUR': { color: 'bg-amber-500', icon: <Building2 size={14} /> },
    };
    return badges[role] || { color: 'bg-gray-500', icon: <User size={14} /> };
  };

  // ──────────────────────────────────────────────── Rendu
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h3>
            <p className="text-gray-600">{error || "Profil introuvable"}</p>
          </div>
        </div>
      </div>
    );
  }

  const roleBadge = getRoleBadge(user.role);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* En-tête de la page */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-600 mt-1">Gérez vos informations personnelles et paramètres de sécurité</p>
        </div>

        {/* Messages globaux */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Colonne gauche - Carte utilisateur */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              
              {/* Avatar et informations principales */}
              <div className="p-6 text-center border-b border-gray-100">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg mx-auto">
                    {getInitials(user.prenom, user.nom)}
                  </div>
                  <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                </div>
                
                <h2 className="mt-4 text-xl font-bold text-gray-900">
                  {user.prenom} {user.nom}
                </h2>
                <p className="text-gray-500 text-sm mt-1">@{user.pseudo}</p>

                {/* Badge rôle */}
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-blue font-medium text-sm shadow-sm" style={{ backgroundColor: roleBadge.color.replace('bg-', '') }}>
                  {roleBadge.icon}
                  <span>{user.role.replace(/_/g, ' ')}</span>
                </div>

                {/* Statut */}
                <div className="mt-4">
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-700 border border-gray-200'}`}>
                    <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    {user.isActive ? 'Compte Actif' : 'Compte Inactif'}
                  </span>
                </div>
              </div>

              {/* Informations supplémentaires */}
              <div className="p-6 space-y-4 bg-gray-50">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="text-gray-400 flex-shrink-0" size={18} />
                  <span className="text-gray-900 truncate">{user.email}</span>
                </div>
                
                {user.telephone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="text-gray-400 flex-shrink-0" size={18} />
                    <span className="text-gray-900">{user.telephone}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="text-gray-400 flex-shrink-0" size={18} />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">Membre depuis</div>
                    <div className="text-gray-900 font-medium">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {user.createdByName && (
                  <div className="flex items-center gap-3 text-sm">
                    <User className="text-gray-400 flex-shrink-0" size={18} />
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">Créé par</div>
                      <div className="text-gray-900 font-medium">{user.createdByName}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Alert si changement de mot de passe requis */}
            {user.mustChangePassword && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                  <div className="text-sm">
                    <p className="font-semibold text-amber-900">Action requise</p>
                    <p className="text-amber-700 mt-1">
                      Vous devez changer votre mot de passe pour continuer à utiliser votre compte.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Colonne droite - Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Onglets */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <div className="flex gap-1 p-1">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                      activeTab === 'profile'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <User size={18} />
                    Informations personnelles
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                      activeTab === 'security'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Lock size={18} />
                    Sécurité
                  </button>
                </div>
              </div>

              {/* Contenu des onglets */}
              <div className="p-6">
                {activeTab === 'profile' ? (
                  <div className="space-y-6">
                    {/* En-tête section */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Informations personnelles</h3>
                        <p className="text-sm text-gray-500 mt-1">Modifiez vos informations de profil</p>
                      </div>
                      {!isEditing ? (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          <Edit2 size={16} />
                          Modifier
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveProfile}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                          >
                            <Save size={16} />
                            Enregistrer
                          </button>
                          <button
                            onClick={() => {
                              setIsEditing(false);
                              setEditedUser(user);
                              setError('');
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                          >
                            <X size={16} />
                            Annuler
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Formulaire */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {[
                        { label: "Prénom", key: "prenom" as keyof UserData, icon: User, type: "text", required: true },
                        { label: "Nom", key: "nom" as keyof UserData, icon: User, type: "text", required: true },
                        { label: "Pseudo", key: "pseudo" as keyof UserData, icon: User, type: "text", required: true },
                        { label: "Email", key: "email" as keyof UserData, icon: Mail, type: "email", required: true },
                        { label: "Téléphone", key: "telephone" as keyof UserData, icon: Phone, type: "tel", required: false },
                      ].map(({ label, key, icon: Icon, type, required }) => (
                        <div key={key} className={key === 'telephone' ? 'md:col-span-2' : ''}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {label} {required && <span className="text-red-500">*</span>}
                          </label>
                          {isEditing ? (
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icon className="text-gray-400" size={18} />
                              </div>
                              <input
                                type={type}
                                value={String(editedUser[key] ?? '')}
                                onChange={e => setEditedUser(prev => ({ ...prev, [key]: e.target.value }))}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder={`Entrez votre ${label.toLowerCase()}`}
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200">
                              <Icon className="text-gray-400" size={18} />
                              <span className="text-gray-900 font-medium">
                                {user[key] || <span className="text-gray-400 font-normal">Non renseigné</span>}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Informations en lecture seule */}
                    <div className="pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-4">Informations du compte</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                          <Shield className="text-blue-500" size={18} />
                          <div>
                            <div className="text-xs text-gray-500">Rôle</div>
                            <div className="text-sm font-medium text-gray-900">{user.role.replace(/_/g, ' ')}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                          <Clock className="text-green-500" size={18} />
                          <div>
                            <div className="text-xs text-gray-500">Dernière modification</div>
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(user.updatedAt).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Section Sécurité */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Sécurité du compte</h3>
                      <p className="text-sm text-gray-500 mt-1">Gérez votre mot de passe et la sécurité de votre compte</p>
                    </div>

                    {/* Changement de mot de passe */}
                    <div className="p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-100">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-lg shadow-sm">
                          <Key className="text-red-600" size={24} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">Mot de passe</h4>
                          <p className="text-sm text-gray-600 mt-1 mb-4">
                            Modifiez votre mot de passe régulièrement pour garantir la sécurité de votre compte
                          </p>
                          <button
                            onClick={() => setShowPasswordModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm"
                          >
                            <Lock size={16} />
                            Changer le mot de passe
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Informations de sécurité */}
                    <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="text-blue-600" size={20} />
                        Conseils de sécurité
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                          <span>Utilisez un mot de passe fort avec au moins 8 caractères</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                          <span>Ne partagez jamais votre mot de passe avec personne</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                          <span>Changez votre mot de passe régulièrement</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                          <span>Déconnectez-vous après chaque session sur un ordinateur partagé</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MODAL CHANGEMENT MOT DE PASSE ─── */}
      {showPasswordModal && (
        <>
          <div 
            className="fixed inset-0 transition-opacity"
            onClick={() => setShowPasswordModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center modal-overlay z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-slideUp">
              {/* En-tête du modal */}
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Key className="text-red-600" size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Modifier le mot de passe</h3>
                  </div>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {(['old', 'new', 'confirm'] as const).map(field => {
                  const label = field === 'old' ? "Ancien mot de passe" :
                                field === 'new' ? "Nouveau mot de passe" :
                                "Confirmer le mot de passe";
                  const key: PasswordFieldKey = field;

                  return (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label}
                      </label>
                      <div className="relative">
                        <input
                          type={showPw[key] ? "text" : "password"}
                          value={passwordForm[`${key}Password` as keyof PasswordForm]}
                          onChange={e => setPasswordForm(prev => ({
                            ...prev,
                            [`${key}Password`]: e.target.value
                          }))}
                          className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(prev => ({ ...prev, [key]: !prev[key] }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPw[key] ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                  );
                })}

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={handleChangePassword}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
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
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UserProfile;