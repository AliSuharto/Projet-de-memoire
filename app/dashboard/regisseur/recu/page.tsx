'use client';
import React, { useState, useEffect } from 'react';
import { Search, Store, Loader2, CheckCircle, XCircle, CreditCard, Calendar, X, Sparkles, MapPin, Phone, Briefcase, Hash } from 'lucide-react';

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
      }, 5000);
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

  // Paiement
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header avec glassmorphism */}
      <div className="backdrop-blur-md bg-white/70 border-b border-white/20 shadow-lg sticky top-17 z-40">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <CreditCard className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Paiement Marchand
                </h1>
                {session && (
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Session: <span className="font-semibold text-blue-600">{session.nomSession}</span>
                  </p>
                )}
              </div>
            </div>
            
            {session && (
              <div className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-lg text-sm font-bold transform hover:scale-105 transition-transform">
                <CheckCircle size={18} />
                <span>Session #{session.id}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Messages avec animations */}
        <div className="space-y-3 mb-6">
          {success && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-xl text-green-800 flex items-center justify-between shadow-md animate-in slide-in-from-top duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-white" size={20} />
                </div>
                <span className="font-semibold">{success}</span>
              </div>
              <button
                onClick={() => setSuccess('')}
                className="text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg p-2 transition-all"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {error && (
            <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-xl text-red-700 flex items-center justify-between shadow-md animate-in slide-in-from-top duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <XCircle className="text-white" size={20} />
                </div>
                <span className="font-semibold">{error}</span>
              </div>
              <button
                onClick={() => setError('')}
                className="text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg p-2 transition-all"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Barre de recherche améliorée */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8 hover:shadow-2xl transition-all duration-300">
          <label className="block text-gray-900 font-bold text-lg mb-4 flex items-center gap-2">
            <Search size={24} className="text-blue-600" />
            Rechercher un marchand
          </label>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Entrez le nom ou CIN du marchand..."
                className="w-full px-6 py-5 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-gray-400"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  <span>Recherche...</span>
                </>
              ) : (
                <>
                  <Search size={24} />
                  <span>Rechercher</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Infos marchand + Formulaire */}
        {merchantData && session && (
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Carte Marchand - 2 colonnes */}
            <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Store className="text-white" size={32} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-2xl text-gray-900 truncate">{merchantData.nom}</h3>
                  <p className="text-gray-600 text-sm mt-1 flex items-start gap-1">
                    <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{getAddressFromPlaces(merchantData.places)}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all">
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <Hash size={18} />
                    <span>CIN</span>
                  </div>
                  <span className="font-bold text-gray-900">{merchantData.cin}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all">
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <Phone size={18} />
                    <span>Téléphone</span>
                  </div>
                  <span className="font-bold text-gray-900">{merchantData.telephone}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all">
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <Briefcase size={18} />
                    <span>Activité</span>
                  </div>
                  <span className="font-bold text-gray-900">{merchantData.activite}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <span className="text-gray-600 font-medium">Statut</span>
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-md ${
                    merchantData.statut === 'A_JOUR' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                      : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                  }`}>
                    {merchantData.statut === 'A_JOUR' && <CheckCircle size={16} />}
                    {merchantData.statut}
                  </span>
                </div>
              </div>
            </div>

            {/* Formulaire Paiement - 3 colonnes */}
            <div className="lg:col-span-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                Nouveau Paiement
              </h3>

              {/* Type de paiement */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-4">Type de paiement</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentType('droit_place')}
                    className={`group relative p-6 rounded-xl border-2 transition-all duration-300 ${
                      paymentType === 'droit_place'
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 hover:scale-102'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        paymentType === 'droit_place' 
                          ? 'border-blue-600 bg-blue-600 shadow-md' 
                          : 'border-gray-300 group-hover:border-blue-400'
                      }`}>
                        {paymentType === 'droit_place' && (
                          <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-gray-900 text-lg">Droit de place</div>
                        <div className="text-sm text-gray-600 mt-1">Occupation d'emplacement</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentType('droit_annuel')}
                    className={`group relative p-6 rounded-xl border-2 transition-all duration-300 ${
                      paymentType === 'droit_annuel'
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 hover:scale-102'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        paymentType === 'droit_annuel' 
                          ? 'border-purple-600 bg-purple-600 shadow-md' 
                          : 'border-gray-300 group-hover:border-purple-400'
                      }`}>
                        {paymentType === 'droit_annuel' && (
                          <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-gray-900 text-lg">Droit annuel</div>
                        <div className="text-sm text-gray-600 mt-1">Paiement annuel</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Montant */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-3">Montant</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={montant}
                    onChange={(e) => setMontant(e.target.value)}
                    className="w-full px-6 py-5 pr-24 text-3xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                    placeholder="0.00"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">MAD</span>
                </div>
              </div>

              {/* Bouton confirmation */}
              <button
                onClick={handlePayment}
                disabled={loading || !montant}
                className="w-full py-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={26} />
                    <span>Traitement en cours...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={26} />
                    <span>Confirmer le paiement</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* État vide si pas de marchand */}
        {!merchantData && !loading && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Search className="text-blue-600" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Recherchez un marchand</h3>
            <p className="text-gray-600 text-lg">Utilisez la barre de recherche ci-dessus pour commencer</p>
          </div>
        )}
      </div>

      {/* Modal création session */}
      {showCreateSessionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Calendar className="text-white" size={40} />
            </div>
            
            <h2 className="text-3xl font-bold text-center mb-3">Nouvelle Session</h2>
            <p className="text-gray-600 text-center mb-8">
              Créez une session de caisse pour commencer les paiements
            </p>

            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createSession()}
              placeholder="Ex: Matin 02/12/2025"
              className="w-full px-6 py-5 border-2 border-gray-200 rounded-xl mb-6 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-lg"
              autoFocus
            />

            {error && (
              <div className="text-red-600 text-sm mb-6 p-4 bg-red-50 rounded-xl font-medium border border-red-200">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => window.location.href = '/login'}
                className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 font-bold transition-all hover:border-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={createSession}
                disabled={creatingSession || !sessionName.trim()}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-105 active:scale-95"
              >
                {creatingSession && <Loader2 className="animate-spin" size={22} />}
                Créer la session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}