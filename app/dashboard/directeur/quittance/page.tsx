'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle, CheckCircle, Receipt, ChevronDown, Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/ToastContainer';
import API_BASE_URL from '@/services/APIbaseUrl';

// Schéma de validation avec Zod
const formSchema = z.object({
  debut: z.string().regex(/^\d+$/, 'Doit contenir uniquement des chiffres'),
  fin: z.string().regex(/^\d+$/, 'Doit contenir uniquement des chiffres'),
  percepteurId: z.string().min(1, 'Veuillez sélectionner un percepteur'),
  multiplicateur: z.string().optional(),
}).refine((data) => {
  const debut = parseInt(data.debut);
  const fin = parseInt(data.fin);
  return fin >= debut;
}, {
  message: "Le numéro de fin doit être supérieur ou égal au numéro de début",
  path: ["fin"],
}).refine((data) => {
  if (data.multiplicateur) {
    return /^\d+$/.test(data.multiplicateur) && parseInt(data.multiplicateur) > 0;
  }
  return true;
}, {
  message: "Le multiplicateur doit être un nombre positif",
  path: ["multiplicateur"],
});

type FormData = z.infer<typeof formSchema>;

interface User {
  id: number;
  nom: string;
  prenom: string;
}

export default function QuittancePlageForm() {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [avecMultiplicateur, setAvecMultiplicateur] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { showError, showSuccess } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      debut: '',
      fin: '',
      percepteurId: '',
      multiplicateur: '',
    },
  });

  const watchedValues = watch();

  // Récupérer l'ID contrôleur depuis le token
  const getControlleurIdFromToken = (): number | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.id || payload.sub || null;
    } catch {
      return null;
    }
  };

  // Charger les utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setMessage({ type: 'error', text: 'Vous n\'êtes pas authentifié.' });
          return;
        }

        const response = await fetch(`${API_BASE_URL}/users/regisseurs-percepteurs`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Impossible de charger les utilisateurs');

        const data = await response.json();
        setUsers(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        setMessage({ type: 'error', text: 'Erreur de chargement des percepteurs.' });
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Générer la prévisualisation
  const previewNumbers = useMemo(() => {
    if (!watchedValues.debut || !watchedValues.fin) return [];

    const debut = parseInt(watchedValues.debut);
    const fin = parseInt(watchedValues.fin);
    if (isNaN(debut) || isNaN(fin) || fin < debut) return [];

    const result: string[] = [];
    const multiplicateur = avecMultiplicateur && watchedValues.multiplicateur
      ? Math.min(parseInt(watchedValues.multiplicateur) || 1, 26) // max 26 lettres
      : 1;

    for (let num = debut; num <= Math.min(fin, debut + 99); num++) { // limiter l'affichage
      if (!avecMultiplicateur || multiplicateur === 1) {
        result.push(`${num}`);
      } else {
        for (let i = 0; i < multiplicateur; i++) {
          const lettre = String.fromCharCode(65 + i); // A, B, C...
          result.push(`${num}${lettre}`);
          if (result.length >= 20) break;
        }
      }
      if (result.length >= 20) break;
    }

    if (fin - debut + 1 > 100 || (avecMultiplicateur && multiplicateur > 1)) {
      result.push('...');
    }

    return result;
  }, [watchedValues.debut, watchedValues.fin, watchedValues.multiplicateur, avecMultiplicateur]);

  // Soumission
  const onSubmit = async (data: FormData) => {
    setMessage(null);
    const controlleurId = getControlleurIdFromToken();
    if (!controlleurId) {
      setMessage({ type: 'error', text: 'Session expirée. Veuillez vous reconnecter.' });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/quittance-plage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          debut: data.debut,
          fin: data.fin,
          controlleurId,
          percepteurId: parseInt(data.percepteurId),
          multiplicateur: avecMultiplicateur
            ? parseInt(data.multiplicateur || '1')
            : 1,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ 
            type: 'success', 
            text: `${result.message} (${result.totalCree} quittances créées : de ${result.debut} à ${result.fin})`
        });
        showSuccess('Connexion réussie',`${result.message} (${result.totalCree} quittances créées : de ${result.debut} à ${result.fin})`);
        reset();
        // Optionnel : tu peux afficher les stats dans un beau badge
        } else {
        setMessage({ type: 'error', text: result.message || 'Erreur inconnue' });
        showError('Erreur', result.message || 'Erreur inconnue');
        }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur réseau. Veuillez réessayer.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Générateur de Plage de Quittances</h1>
          <p className="text-gray-600 mt-2">Créez une série de numéros de quittances en masse</p>
        </div>

        {/* Message global */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Début / Fin */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Numéro de début <span className="text-red-500">*</span>
              </label>
              <input
                {...register('debut')}
                type="text"
                placeholder="1001"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                  errors.debut ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.debut && <p className="text-red-600 text-xs mt-1">{errors.debut.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Numéro de fin <span className="text-red-500">*</span>
              </label>
              <input
                {...register('fin')}
                type="text"
                placeholder="2000"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                  errors.fin ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.fin && <p className="text-red-600 text-xs mt-1">{errors.fin.message}</p>}
            </div>
          </div>

          {/* Multiplicateur */}
          <div className="mb-6 p-5 bg-gray-50 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-4">Options de génération</label>
            <div className="flex gap-8 mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={!avecMultiplicateur}
                  onChange={() => {
                    setAvecMultiplicateur(false);
                    setValue('multiplicateur', '');
                  }}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="font-medium">Numéros simples (1001, 1002...)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={avecMultiplicateur}
                  onChange={() => setAvecMultiplicateur(true)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="font-medium">Avec lettres (1001A, 1001B...)</span>
              </label>
            </div>

            {avecMultiplicateur && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de copies par numéro</label>
                <input
                  {...register('multiplicateur')}
                  type="text"
                  placeholder="Ex: 3 → 1001A, 1001B, 1001C"
                  className={`w-full max-w-xs px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.multiplicateur ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.multiplicateur && <p className="text-red-600 text-xs mt-1">{errors.multiplicateur.message}</p>}
              </div>
            )}
          </div>

          {/* Percepteur */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Percepteur <span className="text-red-500">*</span>
            </label>
            {loadingUsers ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Chargement des percepteurs...
              </div>
            ) : (
              <div className="relative">
                <select
                  {...register('percepteurId')}
                  className={`w-full px-4 py-3 border rounded-lg appearance-none bg-white pr-12 focus:ring-2 focus:ring-blue-500 ${
                    errors.percepteurId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner un percepteur</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nom} {user.prenom}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                {errors.percepteurId && <p className="text-red-600 text-xs mt-1">{errors.percepteurId.message}</p>}
              </div>
            )}
          </div>

          {/* Prévisualisation */}
          {showPreview && previewNumbers.length > 0 && (
            <div className="mb-6 p-5 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Prévisualisation ({previewNumbers.length === 21 ? '20+' : previewNumbers.length} premiers numéros)
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {previewNumbers.map((num, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-white px-3 py-2 rounded border text-sm font-mono"
                  >
                    <Receipt className="w-4 h-4 text-blue-600" />
                    {num}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Boutons */}
          <div className="flex flex-wrap justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition flex items-center gap-2"
            >
              {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              {showPreview ? 'Masquer' : 'Prévisualiser'}
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Création en cours...
                </>
              ) : (
                'Créer la plage de quittances'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}