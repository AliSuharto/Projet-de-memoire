'use client';
import { useEffect, useState } from 'react';

interface SessionInfo {
  id: number;
  nomSession: string;
  status: string; // OUVERTE, FERMEE, etc.
}


export function PaiementGate() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || localStorage.getItem('currentUser');

    if (!storedUser) {
      setShowModal(true);
      setLoading(false);
      return;
    }

    const user = JSON.parse(storedUser);

    fetch(`http://localhost:8080/api/sessions/user/${user.id}/open`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.status === 'OUVERTE') {
          setSession(data);
        } else {
          setShowModal(true);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Chargement...</p>;

  return (
    <>
      {/* ✅ SI PAS DE SESSION OUVERTE → MODAL CREATION */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4">Aucune session active</h2>
            <p className="mb-4 text-sm text-gray-600">
              Vous devez créer une session de paiement avant de continuer.
            </p>
            <button
              onClick={() => window.location.href = '/create-session'}
              className="bg-blue-600 text-white px-4 py-2 rounded-md w-full"
            >
              Créer une session
            </button>
          </div>
        </div>
      )}

      {/* ✅ SESSION OUVERTE → AFFICHAGE ESPACE DE PAIEMENT */}
      {session && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-green-700">Session active : {session.nomSession}</h2>
          <p className="text-gray-600">ID Session : {session.id}</p>

          <button className="bg-green-600 text-white px-6 py-3 rounded-lg">
            Procéder au paiement
          </button>
        </div>
      )}
    </>
  );
}

