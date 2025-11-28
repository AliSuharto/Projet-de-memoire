'use client';

import React, { useEffect, useState, useCallback } from 'react';

// ============================
// INTERFACES TYPESCRIPT
// ============================

interface SessionInfo {
  id: number;
  nomSession: string;
  status: 'OUVERTE' | 'FERMEE';
}

interface PaiementRequest {
  percepteurId: number;
  nomPayeur: string;
  montant: number;
  description?: string;
  modePaiement: 'ESPECES' | 'MOBILE_MONEY' | 'CARTE';
}

interface PaiementResponse {
  paiementId: number;
  numeroRecu: string;
  nomPayeur: string;
  montant: number;
  modePaiement: string;
  datePaiement: string;
  message: string;
}

interface StatistiquesPercepteur {
  recusLibres: number;
  recusUtilises: number;
  prochainNumero: string;
}

interface CreateSessionDTO {
  userId: number;
  nomSession: string;
}

interface SessionCreatedResponse {
  id: number;
  nomSession: string;
  userId: number;
  status: 'OUVERTE' | 'FERMEE';
  createdAt: string;
}

// ============================
// OUTILS UTILITAIRES
// ============================

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================
// COMPOSANT PRINCIPAL
// ============================

export default function PaiementGate() {

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showCreationModal, setShowCreationModal] = useState(false);

  const [userId, setUserId] = useState<number | null>(null);

  const [formData, setFormData] = useState<PaiementRequest>({
    percepteurId: 1,
    nomPayeur: '',
    montant: 0,
    description: '',
    modePaiement: 'ESPECES'
  });

  const [newSessionData, setNewSessionData] = useState<CreateSessionDTO>({
    userId: 0,
    nomSession: `Session ${new Date().toLocaleDateString('fr-FR')}`
  });

  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [creationError, setCreationError] = useState('');

  const [statistiques, setStatistiques] = useState<StatistiquesPercepteur>({
    recusLibres: 25,
    recusUtilises: 5,
    prochainNumero: 'REC-2025-001'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [dernierPaiement, setDernierPaiement] = useState<PaiementResponse | null>(null);

  // ============================
  // INITIALISATION SESSION / USER
  // ============================

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user') || localStorage.getItem('currentUser');

      if (!storedUser) {
        setShowWarningModal(true);
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);
      setUserId(user.id);
      setNewSessionData(prev => ({ ...prev, userId: user.id }));

      // Simulation temporaire
      setTimeout(() => {
        setShowWarningModal(true);
        setLoading(false);
      }, 800);

    } catch (e) {
      console.error('Erreur récupération user:', e);
      setShowWarningModal(true);
      setLoading(false);
    }
  }, []);

  // ============================
  // CREATION SESSION
  // ============================

  const handleShowCreationModal = useCallback(() => {
    setShowWarningModal(false);
    setCreationError('');

    if (!userId) {
      setCreationError("Impossible d'identifier l'utilisateur connecté");
      return;
    }

    setNewSessionData(prev => ({ ...prev, userId }));
    setShowCreationModal(true);
  }, [userId]);

  const handleCreateSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSessionData.nomSession.trim()) {
      setCreationError('Le nom de la session est requis');
      return;
    }

    setIsCreatingSession(true);

    try {
      await sleep(1000);

      const created: SessionCreatedResponse = {
        id: Date.now(),
        nomSession: newSessionData.nomSession,
        userId: newSessionData.userId,
        status: 'OUVERTE',
        createdAt: new Date().toISOString()
      };

      const normalizedSession: SessionInfo = {
        id: created.id,
        nomSession: created.nomSession,
        status: created.status
      };

      setSession(normalizedSession);
      setShowCreationModal(false);
      setSuccess(`Session ${created.nomSession} ouverte avec succès`);

    } catch (err: any) {
      setCreationError(err.message || 'Erreur lors de la création');
    } finally {
      setIsCreatingSession(false);
    }
  };

  // ============================
  // VALIDATION FORMULAIRE
  // ============================

  const validatePaiement = (): string | null => {
    if (!formData.nomPayeur.trim()) return 'Nom du payeur requis';
    if (formData.montant <= 0) return 'Montant invalide';
    return null;
  };

  // ============================
  // PAIEMENT
  // ============================

  const handleTraiterPaiement = async () => {

    const validation = validatePaiement();
    if (validation) {
      setError(validation);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await sleep(1200);

      const numero = statistiques.prochainNumero;
      const compteur = parseInt(numero.split('-')[2], 10) + 1;

      setStatistiques(prev => ({
        ...prev,
        recusLibres: prev.recusLibres - 1,
        recusUtilises: prev.recusUtilises + 1,
        prochainNumero: `REC-2025-${compteur.toString().padStart(3, '0')}`
      }));

      setDernierPaiement({
        paiementId: Date.now(),
        numeroRecu: numero,
        nomPayeur: formData.nomPayeur,
        montant: formData.montant,
        modePaiement: formData.modePaiement,
        datePaiement: new Date().toISOString(),
        message: 'Paiement validé'
      });

      setSuccess('Paiement enregistré avec succès');

    } catch (e) {
      setError('Erreur lors du paiement');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="p-6">
      {showWarningModal && (
        <button onClick={handleShowCreationModal} className="bg-blue-600 text-white p-3 rounded">
          Créer une session
        </button>
      )}

      {showCreationModal && (
        <form onSubmit={handleCreateSessionSubmit} className="space-y-4">
          <input
            value={newSessionData.nomSession}
            onChange={e => setNewSessionData({...newSessionData, nomSession: e.target.value})}
            className="border p-2 rounded w-full"
          />

          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            Ouvrir la session
          </button>
        </form>
      )}

      {session && (
        <div className="mt-6 space-y-4">
          <h2 className="font-bold">Session active : {session.nomSession}</h2>

          <input
            placeholder="Nom du payeur"
            value={formData.nomPayeur}
            onChange={e => setFormData({...formData, nomPayeur: e.target.value})}
            className="border p-2 rounded w-full"
          />

          <input
            type="number"
            placeholder="Montant"
            value={formData.montant}
            onChange={e => setFormData({...formData, montant: Number(e.target.value)})}
            className="border p-2 rounded w-full"
          />

          <button onClick={handleTraiterPaiement} disabled={isLoading} className="bg-indigo-600 text-white px-4 py-2 rounded">
            {isLoading ? 'Traitement...' : 'Valider paiement'}
          </button>

          {success && <p className="text-green-600">{success}</p>}
          {error && <p className="text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}