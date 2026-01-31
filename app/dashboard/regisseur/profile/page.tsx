'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Shield, Calendar, Edit2, Lock, 
  Save, X, Eye, EyeOff, Key, CheckCircle, AlertCircle,
  Camera, UserCircle, Clock, UserCheck
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

// ──────────────────────────────────────────────── Composant principal
const UserProfile = () => {
  const [user, setUser]         = useState<UserData | null>(null);
  const [editedUser, setEditedUser] = useState<Partial<UserData>>({});
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Modal mot de passe
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    oldPassword: '', newPassword: '', confirmPassword: ''
  });
  const [showPw, setShowPw] = useState({ old: false, new: false, confirm: false });

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

      const raw = await res.json();
      const data: UserData = raw.data || raw.user || raw;

      if (!data?.id || !data.email) {
        throw new Error("Format de réponse invalide");
      }

      setUser(data);
      setEditedUser(data);
    } catch (err: any) {
      console.error(err);
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

      const updated = await res.json();
      const freshData = updated.data || updated.user || updated;

      setUser(freshData);
      setEditedUser(freshData);
      setIsEditing(false);
      setSuccess("Profil mis à jour avec succès");
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError("Erreur lors de la sauvegarde");
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
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Échec changement mot de passe");
      }

      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordModal(false);
      setSuccess("Mot de passe modifié avec succès");
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || "Erreur – ancien mot de passe incorrect ?");
    }
  };

  // Fonction pour obtenir les initiales
  const getInitials = (prenom: string, nom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  // Fonction pour obtenir une couleur basée sur le rôle
  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      'DIRECTEUR': 'bg-purple-100 text-purple-800 border-purple-200',
      'REGISSEUR_PRINCIPAL': 'bg-blue-100 text-blue-800 border-blue-200',
      'REGISSEUR': 'bg-green-100 text-green-800 border-green-200',
      'PERCEPTEUR': 'bg-amber-100 text-amber-800 border-amber-200',
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // ──────────────────────────────────────────────── Rendu
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full border border-red-200">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h3>
            <p className="text-gray-600">{error || "Profil introuvable"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8 pt-20 md:pt-6">
      <div className="max-w-5xl mx-auto">

        {/* Messages globaux */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl shadow-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-xl shadow-sm flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Carte principale du profil */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          
          {/* En-tête avec bannière */}
          <div className="relative h-40  ">
            <div className="absolute inset-0 bg-black/10"></div>
            {/* Bouton d'édition flottant */}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="absolute top-4 right-4 flex items-center gap-2 px-5 py-2.5 bg-white/95 hover:bg-white text-gray-700 rounded-xl font-medium shadow-lg transition-all duration-200 hover:shadow-xl backdrop-blur-sm"
              >
                <Edit2 size={18} />
                <span className="hidden sm:inline">Modifier</span>
              </button>
            )}
          </div>

          {/* Section profil */}
          <div className="relative px-6 pb-8">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 relative z-10">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl ring-4 ring-white">
                  {getInitials(user.prenom, user.nom)}
                </div>
                <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-white ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              </div>

              <div className="text-center sm:text-left flex-1 sm:mb-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.prenom} {user.nom}
                </h1>
                <p className="text-lg text-gray-500 mt-1">@{user.pseudo}</p>
                <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border ${getRoleColor(user.role)}`}>
                    <Shield size={16} />
                    {user.role.replace(/_/g, ' ')}
                  </span>
                  <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium ${user.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-700 border border-gray-200'}`}>
                    <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    {user.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>

              {/* Boutons d'action en mode édition */}
              {isEditing && (
                <div className="flex gap-3 sm:mb-3">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Save size={18} />
                    Enregistrer
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedUser(user);
                      setError('');
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200"
                  >
                    <X size={18} />
                    Annuler
                  </button>
                </div>
              )}
            </div>

            {/* Grille d'informations */}
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Colonne 1 : Informations personnelles */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-6 border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                    <User className="text-blue-600" size={20} />
                    Informations personnelles
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                      { label: "Prénom", key: "prenom", icon: User, type: "text" },
                      { label: "Nom", key: "nom", icon: User, type: "text" },
                      { label: "Email", key: "email", icon: Mail, type: "email" },
                      { label: "Téléphone", key: "telephone", icon: Phone, type: "tel" },
                      { label: "Pseudo", key: "pseudo", icon: UserCircle, type: "text" },
                    ].map(({ label, key, icon: Icon, type }) => (
                      <div key={key} className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                          <Icon size={16} className="text-gray-400" />
                          {label}
                        </label>
                        {isEditing ? (
                          <input
                            type={type}
                            value={(editedUser as any)[key] ?? ''}
                            onChange={e => setEditedUser(prev => ({ ...prev, [key]: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
                            placeholder={`Entrez votre ${label.toLowerCase()}`}
                          />
                        ) : (
                          <div className="px-4 py-2.5 bg-white rounded-xl border border-gray-100 text-gray-900 font-medium">
                            {(user as any)[key] || <span className="text-gray-400">Non renseigné</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sécurité */}
                <div className="bg-gradient-to-br from-gray-50 to-red-50/30 rounded-2xl p-6 border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                    <Lock className="text-red-600" size={20} />
                    Sécurité
                  </h2>
                  
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Key size={18} />
                    Changer mon mot de passe
                  </button>

                  {user.mustChangePassword && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-start gap-2">
                      <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Action requise :</strong> Vous devez changer votre mot de passe pour continuer.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Colonne 2 : Métadonnées */}
              <div className="space-y-6">
                {/* Informations du compte */}
                <div className="bg-gradient-to-br from-gray-50 to-purple-50/30 rounded-2xl p-6 border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                    <Calendar className="text-purple-600" size={20} />
                    Informations du compte
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
                      <Clock className="text-blue-500 flex-shrink-0 mt-1" size={18} />
                      <div>
                        <div className="text-sm text-gray-500">Créé le</div>
                        <div className="font-medium text-gray-900 mt-0.5">
                          {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
                      <Clock className="text-green-500 flex-shrink-0 mt-1" size={18} />
                      <div>
                        <div className="text-sm text-gray-500">Dernière modification</div>
                        <div className="font-medium text-gray-900 mt-0.5">
                          {new Date(user.updatedAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>

                    {user.createdByName && (
                      <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
                        <UserCheck className="text-purple-500 flex-shrink-0 mt-1" size={18} />
                        <div>
                          <div className="text-sm text-gray-500">Créé par</div>
                          <div className="font-medium text-gray-900 mt-0.5">
                            {user.createdByName}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistiques rapides */}
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">Compte vérifié</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-100">Statut</span>
                      <span className="font-semibold">{user.isActive ? 'Actif' : 'Inactif'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-100">Rôle</span>
                      <span className="font-semibold">{user.role.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-100">ID</span>
                      <span className="font-mono font-semibold">#{user.id}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MODAL CHANGEMENT MOT DE PASSE ─── */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">
            {/* En-tête du modal */}
            <div className="px-7 py-6 bg-gradient-to-r from-red-500 to-pink-500 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key size={24} />
                  <h3 className="text-xl font-bold">Modifier le mot de passe</h3>
                </div>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-7 space-y-5">
              {['old', 'new', 'confirm'].map(field => {
                const label = field === 'old' ? "Ancien mot de passe" :
                              field === 'new' ? "Nouveau mot de passe" :
                              "Confirmer le mot de passe";
                const key = field as 'old' | 'new' | 'confirm';

                return (
                  <div key={field}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                        className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
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

              <div className="pt-4 space-y-3">
                <button
                  onClick={handleChangePassword}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Modifier le mot de passe
                </button>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-xl font-semibold transition-all duration-200"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UserProfile;