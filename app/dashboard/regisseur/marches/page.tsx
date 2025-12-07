'use client';
import React, { useState, useEffect } from 'react';
import { Search, Store, Loader2 } from 'lucide-react';

interface Place {
  id: number;
  nom: string;
  salleName: string;
  zoneName: string;
  marcheeName: string;
  categorieId: number | null;
  categorieName: string | null;
  dateDebutOccupation: string | null;
  dateFinOccupation: string | null;
}

interface MerchantData {
  id: number;
  nom: string;
  cin: string;
  telephone: string;
  activite: string;
  statut: string;
  debutContrat: string;
  places: Place[];
  nif: string | null;
  stat: string | null;
}

interface Session {
  id: number;
  nomSession: string;
  status: string;
}

type PaymentType = 'droit_annuel' | 'droit_place';

export default function PaiementMarchand() {
  const [searchTerm, setSearchTerm] = useState('');
  const [merchantData, setMerchantData] = useState<MerchantData | null>(null);
  const [paymentType, setPaymentType] = useState<PaymentType>('droit_place');
  const [montant, setMontant] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Session management
  const [session, setSession] = useState<Session | null>(null);
  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [creatingSession, setCreatingSession] = useState(false);

  // Vérifier la session ouverte au chargement
  useEffect(() => {
    const checkOpenSession = async () => {
      try {
        const storedUser = localStorage.getItem('user') || localStorage.getItem('currentUser');
        if (!storedUser) {
          setShowCreateSessionModal(true);
          return;
        }

        const user = JSON.parse(storedUser);
        const token = localStorage.getItem('token');
        if (!token) {
          setShowCreateSessionModal(true);
          return;
        }

        const res = await fetch(`http://localhost:8080/api/sessions/user/${user.id}/open`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.status === 'OUVERTE') {
            setSession(data);
            return;
          }
        }

        // Pas de session ouverte → on ouvre le modal
        setShowCreateSessionModal(true);
      } catch (err) {
        console.error(err);
        setShowCreateSessionModal(true);
      }
    };

    checkOpenSession();
  }, []);

  // Auto-fermeture des messages success / error après 5 secondes
        useEffect(() => {
          if (success || error) {
            const timer = setTimeout(() => {
              setSuccess('');
              setError('');
            }, 5000); // 5 secondes

            // Nettoyage au cas où le composant se démonte avant la fin du timer
            return () => clearTimeout(timer);
          }
        }, [success, error]);

  // Créer une nouvelle session
  const createSession = async () => {
    if (!sessionName.trim()) {
      setError('Veuillez entrer un nom pour la session');
      return;
    }

    setCreatingSession(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user') || localStorage.getItem('currentUser');
      const user = JSON.parse(storedUser!);

      const response = await fetch('http://localhost:8080/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nomSession: sessionName,
          userId: user.id
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la création de la session');

      const data = await response.json();
      setSession({
        id: data.sessionId,
        nomSession: data.nomSession,
        status: data.status || 'OUVERTE',
      });
      console.log('Session créée :', data);

      setShowCreateSessionModal(false);
      setSessionName('');
      setSuccess('Session créée avec succès !');
    } catch (err: any) {
      setError(err.message || 'Impossible de créer la session');
    } finally {
      setCreatingSession(false);
    }
  };

  // Recherche marchand
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Veuillez entrer un nom ou numéro CIN');
      return;
    }

    setLoading(true);
    setError('');
    setMerchantData(null);

    try {
      const response = await fetch(`http://localhost:8080/api/public/marchands/by-cin/${searchTerm}`);
      if (!response.ok) throw new Error('Marchand non trouvé');
      const data: MerchantData = await response.json();
      setMerchantData(data);
    } catch (err) {
      setError('Marchand non trouvé ou erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  // Paiement (utilise session.id automatiquement)
  const handlePayment = async () => {
    if (!merchantData) return setError('Recherchez d\'abord un marchand');
    if (!session) return setError('Aucune session active');
    if (!montant || parseFloat(montant) <= 0) return setError('Montant invalide');

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const payload = JSON.parse(atob(token!.split('.')[1]));
      const idAgent = payload.id || payload.userId || payload.agentId;

      const response = await fetch('http://localhost:8080/api/paiements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: session.id,
          idAgent,
          idMarchand: merchantData.id,
          typePaiement: paymentType,
          // montant: parseFloat(montant),  // si ton API le demande
        }),
      });

      if (!response.ok) throw new Error('Échec du paiement');

      setSuccess('Paiement enregistré avec succès !');
      setMontant('');
      setMerchantData(null);
      setSearchTerm('');
    } catch (err: any) {
      setError(err.message || 'Erreur lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  const getAddressFromPlaces = (places: Place[]) => {
    if (!places?.length) return 'Aucune place assignée';
    const p = places[0];
    return [p.nom, p.salleName, p.zoneName, p.marcheeName].filter(Boolean).join(', ');
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Paiement Marchand</h1>
              <p className="text-gray-600 mt-2">
                Session active :{' '}
                <span className="font-semibold text-blue-600">
                  {session ? session.nomSession : 'Aucune'}
                </span>
              </p>
            </div>
            {session && (
              <div className="text-sm bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
                Session #{session.id} • OUVERTE
              </div>
            )}
          </div>

          {/* Messages */}
          
                          {/* Message de succès */}
                {success && (
                  <div className="relative mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 flex items-center justify-between">
                    <span>{success}</span>
                    <button
                      onClick={() => setSuccess('')}
                      className="text-green-600 hover:text-green-800 ml-4"
                    >
                      ✕
                    </button>
                  </div>
                )}

                      {/* Message d'erreur */}
              {error && (
                <div className="relative mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center justify-between">
                  <span>{error}</span>
                  <button
                    onClick={() => setError('')}
                    className="text-red-600 hover:text-red-800 ml-4"
                  >
                    ✕
                  </button>
                </div>
              )}

          {/* Recherche */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <label className="block text-gray-900 font-semibold mb-2">Rechercher un marchand</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Nom ou CIN"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-70 flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                Rechercher
              </button>
            </div>
          </div>

          {/* Infos marchand + formulaire */}
          {merchantData && session && (
            // ... ton bloc marchand et formulaire existant (inchangé sauf suppression du champ sessionId)
            <div className="space-y-6">
              {/* Infos marchand */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Store className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl">{merchantData.nom}</h3>
                    <p className="text-gray-600">{getAddressFromPlaces(merchantData.places)}</p>
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div><span className="font-medium">CIN :</span> {merchantData.cin}</div>
                      <div><span className="font-medium">Tél :</span> {merchantData.telephone}</div>
                      <div><span className="font-medium">Activité :</span> {merchantData.activite}</div>
                      <div>
                        <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                          merchantData.statut === 'A_JOUR' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {merchantData.statut}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulaire paiement */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Type de paiement</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => setPaymentType('droit_place')}
                    className={`p-4 rounded-lg border-2 text-left ${paymentType === 'droit_place' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 ${paymentType === 'droit_place' ? 'border-blue-600' : 'border-gray-400'} flex items-center justify-center`}>
                        {paymentType === 'droit_place' && <div className="w-3 h-3 bg-blue-600 rounded-full"></div>}
                      </div>
                      <div>
                        <div className="font-medium">Droit de place</div>
                        <div className="text-sm text-gray-600">Occupation d'emplacement</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentType('droit_annuel')}
                    className={`p-4 rounded-lg border-2 text-left ${paymentType === 'droit_annuel' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 ${paymentType === 'droit_annuel' ? 'border-blue-600' : 'border-gray-400'} flex items-center justify-center`}>
                        {paymentType === 'droit_annuel' && <div className="w-3 h-3 bg-blue-600 rounded-full"></div>}
                      </div>
                      <div>
                        <div className="font-medium">Droit annuel</div>
                        <div className="text-sm text-gray-600">Paiement annuel</div>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block font-medium mb-2">Montant (MAD)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={montant}
                      onChange={(e) => setMontant(e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : null}
                  Confirmer le paiement
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal création session */}
      {showCreateSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center modal-overlay justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Créer une session de caisse</h2>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas de session ouverte. Créez-en une pour commencer les paiements.
            </p>

            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createSession()}
              placeholder="Nom de la session (ex: Matin 01/12)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
              autoFocus
            />

            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={createSession}
                disabled={creatingSession || !sessionName.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 flex items-center gap-2"
              >
                {creatingSession && <Loader2 className="animate-spin" size={20} />}
                Créer la session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}