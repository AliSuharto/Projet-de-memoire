'use client';

import React, { useState, useEffect } from 'react';
import { Search, Store, Loader2, User, X, CheckCircle, AlertCircle } from 'lucide-react';
import ReceiptGenerator from '../ReceiptGenerator';
import API_BASE_URL from '@/services/APIbaseUrl';

interface MerchantData {
  id?: number;
  nom: string;
  cin: string;
  telephone: string;
  activite: string;
  statut: string;
  debutContrat?: string;
  place: string;
  nif: string | null;
  stat: string | null;
  montantPlace: string;
  montantAnnuel: string;
  motifPaiementPlace: string;
  motifPaiementAnnuel: string;
  frequencePaiement: string;
}

interface Session {
  id: number;
  nomSession: string;
  status: string;
}

interface ReceiptData {
  merchantName: string;
  cin: string;
  place: string;
  category: string;
  motif: string;
  amount: string;
  amountText: string;
  receiptNumber: string;
  paymentDate: string;
  agentName: string;
  paymentType: PaymentType;
}

type PaymentType = 'droit_annuel' | 'droit_place';

export default function PaiementMarchand() {
  const [searchTerm, setSearchTerm] = useState('');
  const [merchantData, setMerchantData] = useState<MerchantData | null>(null);
  const [paymentType, setPaymentType] = useState<PaymentType>('droit_place');
  const [numeroQuittance, setNumeroQuittance] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  // Session
  const [session, setSession] = useState<Session | null>(null);
  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [creatingSession, setCreatingSession] = useState(false);

  // Vérifier session ouverte
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

        const res = await fetch(`${API_BASE_URL}/sessions/user/${user.id}/open`, {
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

  // Auto-fermeture messages
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Créer session
  const createSession = async () => {
    if (!sessionName.trim()) return setError('Veuillez entrer un nom pour la session');

    setCreatingSession(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user') || localStorage.getItem('currentUser');
      const user = JSON.parse(storedUser!);

      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nomSession: sessionName,
          userId: user.id,
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la création');

      const data = await response.json();
      setSession({
        id: data.sessionId,
        nomSession: data.nomSession,
        status: data.status || 'OUVERTE',
      });

      setShowCreateSessionModal(false);
      setSessionName('');
      setSuccess('Session créée avec succès !');
    } catch (err: Error | unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Impossible de créer la session');
      }
    } finally {
      setCreatingSession(false);
    }
  };

  // Recherche marchand
  const handleSearch = async () => {
    if (!searchTerm.trim()) return setError('Veuillez entrer un nom ou CIN');

    setLoading(true);
    setError('');
    setMerchantData(null);

    try {
      const res = await fetch(`${API_BASE_URL}/public/marchands/cin/${searchTerm}`);
      if (!res.ok) throw new Error('Marchand non trouvé');
      const data: MerchantData = await res.json();
      setMerchantData(data);
    } catch {
      setError('Marchand non trouvé ou erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  // Paiement
  const handlePayment = async () => {
    if (!merchantData) return setError('Recherchez d’abord un marchand');
    if (!session) return setError('Aucune session active');
    if (!numeroQuittance.trim()) return setError('Veuillez entrer le numéro de quittance');

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const payload = JSON.parse(atob(token!.split('.')[1]));
      const storedUser = localStorage.getItem('user') || localStorage.getItem('currentUser');
      const user = JSON.parse(storedUser!);
      const idAgent = payload.id || payload.userId || payload.agentId;

      const response = await fetch(`${API_BASE_URL}/paiements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: session.id,
          quittance: numeroQuittance,
          idAgent,
          idMarchand: merchantData.id,
          typePaiement: paymentType,
          numeroQuittance: numeroQuittance,
        }),
      });

      if (!response.ok) throw new Error('Échec du paiement');

      // Préparer reçu
      const receiptInfo = {
        merchantName: merchantData.nom,
        cin: merchantData.cin,
        place: merchantData.place,
        category: merchantData.activite,
        motif:
          paymentType === 'droit_annuel'
            ? merchantData.motifPaiementAnnuel
            : merchantData.motifPaiementPlace,
        amount:
          paymentType === 'droit_place'
            ? parseFloat(merchantData.montantPlace).toLocaleString('fr-FR')
            : parseFloat(merchantData.montantAnnuel).toLocaleString('fr-FR'),
        amountText: convertToWords(
          paymentType === 'droit_place' ? merchantData.montantPlace : merchantData.montantAnnuel
        ),
        receiptNumber: numeroQuittance,
        paymentDate: new Date().toISOString(),
        agentName: user.nom || 'Agent',
        paymentType: paymentType,
      };

      setReceiptData(receiptInfo);
      setShowReceipt(true);

      setSuccess('Paiement enregistré avec succès !');
      setNumeroQuittance('');
      setMerchantData(null);
      setSearchTerm('');
    } catch (err: Error | unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erreur lors du paiement');
      }
    } finally {
      setLoading(false);
    }
  };

  // convertToWords (inchangé)
  function convertToWords(amount: string | number): string {
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/\s/g, '')) : amount;

    if (isNaN(num) || num < 0) return "Montant invalide";
    if (num === 0) return "Zéro Ariary";

    const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

    function convertTwoDigits(n: number): string {
      if (n < 20) return units[n];
      const unit = n % 10;
      const ten = Math.floor(n / 10);
      if (ten === 7 || ten === 9) {
        const base = tens[ten];
        const rest = ten === 7 ? n - 60 : n - 80;
        return rest < 20 ? `${base}-${units[rest]}` : `${base}-${convertTwoDigits(rest)}`;
      }
      if (unit === 0) return tens[ten] + (ten === 8 ? 's' : '');
      if (unit === 1 && ten > 1) return `${tens[ten]}-et-un`;
      return `${tens[ten]}-${units[unit]}`;
    }

    function convertThreeDigits(n: number): string {
      if (n === 0) return '';
      const hundreds = Math.floor(n / 100);
      const rest = n % 100;
      let result = '';
      if (hundreds > 0) {
        result = hundreds === 1 ? 'cent' : `${units[hundreds]} cent`;
        if (rest === 0 && hundreds > 1) result += 's';
      }
      if (rest > 0) {
        const restInWords = convertTwoDigits(rest);
        result = result ? `${result} ${restInWords}` : restInWords;
      }
      return result;
    }

    function convertInteger(n: number): string {
      if (n === 0) return 'zéro';
      const billion = Math.floor(n / 1000000000);
      const million = Math.floor((n % 1000000000) / 1000000);
      const thousand = Math.floor((n % 1000000) / 1000);
      const remainder = n % 1000;
      let result = '';
      if (billion > 0) result += convertThreeDigits(billion) + (billion === 1 ? ' milliard' : ' milliards') + ' ';
      if (million > 0) result += convertThreeDigits(million) + (million === 1 ? ' million' : ' millions') + ' ';
      if (thousand > 0) result += (thousand === 1 ? 'mille' : convertThreeDigits(thousand) + ' mille') + ' ';
      if (remainder > 0) result += convertThreeDigits(remainder);
      return result.trim();
    }

    const integerPart = Math.floor(num);
    let words = convertInteger(integerPart);
    words = words.charAt(0).toUpperCase() + words.slice(1);
    return `${words} Ariary`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8 pt-20 md:pt-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* En-tête */}
        <div className="mb-10">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Effectuer un Paiement</h1>
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-lg text-gray-600">
              Session active :{' '}
              <span className="font-semibold text-indigo-700">
                {session ? session.nomSession : 'Aucune session ouverte'}
              </span>
            </p>
            {session && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium text-sm shadow-sm">
                <CheckCircle size={16} />
                Session #{session.id} • OUVERTE
              </div>
            )}
          </div>
        </div>

        {/* Messages flottants */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl shadow-sm flex items-center gap-3 text-green-800">
            <CheckCircle className="text-green-600" size={20} />
            <span className="font-medium">{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm flex items-center gap-3 text-red-800">
            <AlertCircle className="text-red-600" size={20} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Carte recherche */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-7 mb-8">
          <h2 className="text-sm text-gray-900 mb-2">Rechercher un marchand pour effectuer un paiement</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Numéro CIN..."
                className="w-full pl-12 pr-5 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-8 py-3.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-md min-w-[140px]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
              Rechercher
            </button>
          </div>
        </div>

        {/* Contenu principal quand marchand trouvé + session active */}
        {merchantData && session && (
          <div className="space-y-8">
            {/* Carte infos marchand */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-7">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User className="text-indigo-600" size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">{merchantData.nom}</h3>
                  <p className="text-gray-600 mt-1 text-lg">{merchantData.place}</p>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-700 min-w-[80px]">CIN :</span>
                      <span className="text-gray-900">{merchantData.cin}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-700 min-w-[80px]">Tél :</span>
                      <span className="text-gray-900">{merchantData.telephone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-700 min-w-[80px]">Activité :</span>
                      <span className="text-gray-900">{merchantData.activite}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-700 min-w-[80px]">Statut :</span>
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          merchantData.statut === 'A_JOUR'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {merchantData.statut}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Carte paiement */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-7">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Type de paiement</h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Droit de place */}
                <button
                  onClick={() => setPaymentType('droit_place')}
                  className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    paymentType === 'droit_place'
                      ? 'border-indigo-600 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-indigo-300 bg-white'
                  }`}
                >
                  <div className="absolute -top-3 -right-3">
                    {paymentType === 'droit_place' && (
                      <div className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                        Sélectionné
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                        paymentType === 'droit_place' ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                      }`}
                    >
                      {paymentType === 'droit_place' && <div className="w-3 h-3 bg-white rounded-full" />}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">Droit de place</h3>
                      <p className="text-gray-600 mt-1">Occupation d&apos;emplacement</p>
                      <p className="text-2xl font-bold text-indigo-700 mt-3">
                        {parseFloat(merchantData.montantPlace).toLocaleString('fr-FR')} Ar
                      </p>
                    </div>
                  </div>
                </button>

                {/* Droit annuel */}
                <button
                  onClick={() => setPaymentType('droit_annuel')}
                  className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    paymentType === 'droit_annuel'
                      ? 'border-indigo-600 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-indigo-300 bg-white'
                  }`}
                >
                  <div className="absolute -top-3 -right-3">
                    {paymentType === 'droit_annuel' && (
                      <div className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                        Sélectionné
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                        paymentType === 'droit_annuel' ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                      }`}
                    >
                      {paymentType === 'droit_annuel' && <div className="w-3 h-3 bg-white rounded-full" />}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">Droit annuel</h3>
                      <p className="text-gray-600 mt-1">Paiement annuel</p>
                      <p className="text-2xl font-bold text-indigo-700 mt-3">
                        {parseFloat(merchantData.montantAnnuel).toLocaleString('fr-FR')} Ar
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Récapitulatif */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-3">
                  <Store className="text-indigo-600" size={20} />
                  Détails du paiement sélectionné
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Type</span>
                    <span className="font-medium text-gray-900">
                      {paymentType === 'droit_place' ? 'Droit de place' : 'Droit annuel'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Montant</span>
                    <span className="text-xl font-bold text-indigo-700">
                      {paymentType === 'droit_place'
                        ? parseFloat(merchantData.montantPlace).toLocaleString('fr-FR')
                        : parseFloat(merchantData.montantAnnuel).toLocaleString('fr-FR')}{' '}
                      Ar
                    </span>
                  </div>
                  <div className="pt-3 border-t border-indigo-100">
                    <span className="text-gray-700 block mb-1">Motif</span>
                    <p className="text-gray-800 leading-relaxed">
                      {paymentType === 'droit_place'
                        ? merchantData.motifPaiementPlace
                        : merchantData.motifPaiementAnnuel}
                    </p>
                  </div>
                </div>
              </div>

              {/* Numéro quittance */}
              <div className="mb-8">
                <label className="block text-gray-900 font-semibold mb-3">
                  Numéro de quittance <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={numeroQuittance}
                  onChange={(e) => setNumeroQuittance(e.target.value)}
                  placeholder="Exemple : Q-2025-001234"
                  className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm text-base"
                />
              </div>

              {/* Bouton confirmer */}
              <button
                onClick={handlePayment}
                disabled={loading || !numeroQuittance.trim()}
                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-lg rounded-xl hover:from-indigo-700 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Store size={24} />}
                {loading ? 'Traitement...' : 'Confirmer et générer le reçu'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal création session */}
      {showCreateSessionModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Nouvelle session de caisse</h2>
            <p className="text-gray-600 mb-6">
              Aucune session ouverte. Créez-en une pour enregistrer les paiements.
            </p>

            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createSession()}
              placeholder="Ex : Matin 23/01/2026"
              className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6"
              autoFocus
            />

            {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

            <div className="flex gap-4 justify-end">
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={createSession}
                disabled={creatingSession || !sessionName.trim()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-2 transition"
              >
                {creatingSession && <Loader2 className="animate-spin" size={20} />}
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal reçu */}
      {showReceipt && receiptData && (
        <ReceiptGenerator
          data={receiptData}
          onCancel={() => {
            setShowReceipt(false);
            setSuccess('Paiement enregistré – reçu annulé');
            setNumeroQuittance('');
            setMerchantData(null);
            setSearchTerm('');
          }}
          onComplete={() => {
            setShowReceipt(false);
            setSuccess('Reçu généré et paiement validé !');
            setNumeroQuittance('');
            setMerchantData(null);
            setSearchTerm('');
          }}
        />
      )}
    </div>
  );
}