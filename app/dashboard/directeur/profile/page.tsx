'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Shield, Calendar, Edit2, Lock, 
  Save, X, Eye, EyeOff, Key 
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
      // ─── Gestion des différents wrappers possibles ───
      const data: UserData = raw.data || raw.user || raw;

      if (!data?.id || !data.email) {
        throw new Error("Format de réponse invalide");
      }

      console.log("Utilisateur chargé :", data);
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
      setSuccess("Profil mis à jour ✓");
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
      setSuccess("Mot de passe modifié avec succès ✓");
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || "Erreur – ancien mot de passe incorrect ?");
    }
  };

  // ──────────────────────────────────────────────── Rendu
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600 animate-pulse">Chargement du profil...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-red-600 bg-red-50 px-6 py-4 rounded-xl border border-red-200">
          {error || "Profil introuvable"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-5 md:px-10">
      <div className="max-w-4xl mx-auto">

        {/* Messages globaux */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
            {success}
          </div>
        )}

        {/* En-tête profil */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user.prenom} {user.nom}
            </h1>
            <p className="text-gray-600 mt-1">@{user.pseudo}</p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              <Shield size={16} />
              {user.role}
            </div>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 rounded-xl font-medium shadow-sm transition"
            >
              <Edit2 size={18} />
              Modifier le profil
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleSaveProfile}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition shadow-md"
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
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-medium transition"
              >
                <X size={18} />
                Annuler
              </button>
            </div>
          )}
        </div>

        {/* Sections informations */}
        <div className="space-y-10">

          {/* Bloc Informations personnelles */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-7 py-5 border-b border-gray-100 bg-gray-50/70">
              <h2 className="text-xl font-semibold text-gray-800">Informations personnelles</h2>
            </div>
            <div className="p-7 grid md:grid-cols-2 gap-7">
              {[
                { label: "Prénom",    key: "prenom", icon: User },
                { label: "Nom",       key: "nom",    icon: User },
                { label: "Email",     key: "email",  icon: Mail },
                { label: "Téléphone", key: "telephone", icon: Phone },
                { label: "Pseudo",    key: "pseudo", icon: User },
              ].map(({ label, key, icon: Icon }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Icon size={16} className="text-gray-500" />
                    {label}
                  </label>
                  {isEditing ? (
                    <input
                      type={key === "email" ? "email" : "text"}
                      value={(editedUser as any)[key] ?? ''}
                      onChange={e => setEditedUser(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                    />
                  ) : (
                    <div className="text-gray-900 font-medium">
                      {(user as any)[key] || '—'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Bloc Sécurité */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-7 py-5 border-b border-gray-100 bg-gray-50/70">
              <h2 className="text-xl font-semibold text-gray-800">Sécurité</h2>
            </div>
            <div className="p-7">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-3 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-medium transition border border-red-200"
              >
                <Key size={18} />
                Changer mon mot de passe
              </button>

              <div className="mt-8 text-sm text-gray-500 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="font-medium text-gray-700">Créé le</div>
                  <div>{new Date(user.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Dernière modification</div>
                  <div>{new Date(user.updatedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}</div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* ─── MODAL CHANGEMENT MOT DE PASSE ─── */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-5">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-7 py-5 border-b flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Modifier le mot de passe</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-7 space-y-6">
              {['old', 'new', 'confirm'].map(field => {
                const label = field === 'old' ? "Ancien mot de passe" :
                              field === 'new' ? "Nouveau mot de passe" :
                              "Confirmer le mot de passe";
                const key = field as 'old' | 'new' | 'confirm';

                return (
                  <div key={field} className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                        className="w-full px-4 py-2.5 pr-11 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(prev => ({ ...prev, [key]: !prev[key] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPw[key] ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleChangePassword}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition"
                >
                  Modifier le mot de passe
                </button>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-medium transition"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;