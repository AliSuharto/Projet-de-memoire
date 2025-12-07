'use client';
import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

// =============================
// DTO FRONTEND
// =============================
interface CreateSessionDTO {
  userId: number;
  nomSession: string;
}

interface SessionCreatedResponse {
  id: number;
  nomSession: string;
  userId: number;
  status: string;
  createdAt: string;
}

export default function CreateSessionPage() {
  const [nomSession, setNomSession] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SessionCreatedResponse | null>(null);

  // =============================
  // Récupération ID utilisateur
  // =============================
  useEffect(() => {
  // Récupération de l'objet utilisateur stocké dans localStorage
  const storedUser = localStorage.getItem('user') || localStorage.getItem('currentUser');

  if (storedUser) {
    try {
      const userObject = JSON.parse(storedUser);

      // Vérification stricte de la présence de l'ID utilisateur
      if (userObject && typeof userObject.id === 'number') {
        setUserId(userObject.id);
      } else {
        setError("Structure utilisateur invalide : champ 'id' introuvable");
      }
    } catch (e) {
      setError('Impossible de lire les données utilisateur depuis le localStorage');
    }
  } else {
    setError('Aucun utilisateur connecté détecté');
  }
}, []);

  // =============================
  // SOUMISSION FORMULAIRE
  // =============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      setError('ID utilisateur manquant');
      return;
    }

    if (!nomSession.trim()) {
      setError('Le nom de la session est obligatoire');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const sessionData: CreateSessionDTO = {
      userId: userId,
      nomSession: nomSession.trim(),
    };

    try {
      const response = await fetch('http://localhost:8080/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Erreur serveur : ${response.status}`);
      }

      const data: SessionCreatedResponse = await response.json();
      setSuccess(data);
      setNomSession('');

      

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Création de session
        </h1>

        {userId && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-sm text-blue-800">
            Utilisateur connecté : <span className="font-semibold">ID {userId}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex gap-3">
            <AlertCircle className="text-red-500" size={20} />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5">
            <div className="flex gap-3">
              <CheckCircle className="text-green-500" size={20} />
              <div className="text-sm text-green-700">
                <p className="font-semibold">Session créée avec succès</p>
                <p>ID : {success.id}</p>
                <p>Nom : {success.nomSession}</p>
                <p>Statut : {success.status}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la session
            </label>
            <input
              type="text"
              value={nomSession}
              onChange={(e) => setNomSession(e.target.value)}
              placeholder="Ex: Session de formation 2025"
              disabled={loading || !userId}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !userId || !nomSession.trim()}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:bg-gray-300 flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Création en cours...
              </>
            ) : (
              'Créer la session'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
