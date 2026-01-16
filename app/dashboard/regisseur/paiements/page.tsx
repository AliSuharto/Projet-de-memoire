'use client';
import React, { useState, useEffect } from 'react';
import { Search, Store, Loader2, User } from 'lucide-react';
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
  const [receiptData, setReceiptData] = useState(null);

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
      const response = await fetch(`${API_BASE_URL}/public/marchands/cin/${searchTerm}`);
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

  // Préparer les données du reçu
  const receiptInfo = {
    merchantName: merchantData.nom,
    cin: merchantData.cin,
    place: merchantData.place,
    category: merchantData.activite,
    motif:paymentType === 'droit_annuel' ? merchantData.motifPaiementAnnuel : merchantData.motifPaiementPlace,
    amount: paymentType === 'droit_place' 
      ? parseFloat(merchantData.montantPlace).toLocaleString('fr-FR')
      : parseFloat(merchantData.montantAnnuel).toLocaleString('fr-FR'),
    amountText: convertToWords(paymentType === 'droit_place' 
      ? merchantData.montantPlace 
      : merchantData.montantAnnuel),
    receiptNumber: numeroQuittance,
    paymentDate: new Date().toISOString(),
    agentName: user.nom || 'Agent', // à adapter selon votre structure
  };

  setReceiptData(receiptInfo);
  setShowReceipt(true);

      setSuccess('Paiement enregistré avec succès !');
      setNumeroQuittance('');
      setMerchantData(null);
      setSearchTerm('');
    } catch (err: any) {
      setError(err.message || 'Erreur lors du paiement');
    } finally {
      setLoading(false);
    }
  };
  function convertToWords(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/\s/g, '')) : amount;
  
  if (isNaN(num) || num < 0) {
    return "Montant invalide";
  }

  if (num === 0) {
    return "Zéro Ariary";
  }

  // Tableaux de conversion
  const units = [
    '', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
    'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize',
    'dix-sept', 'dix-huit', 'dix-neuf'
  ];

  const tens = [
    '', '', 'vingt', 'trente', 'quarante', 'cinquante',
    'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'
  ];

  // Conversion d'un nombre entre 0 et 99
  function convertTwoDigits(n: number): string {
    if (n < 20) {
      return units[n];
    }

    const unit = n % 10;
    const ten = Math.floor(n / 10);

    if (ten === 7 || ten === 9) {
      // 70-79 et 90-99
      const base = tens[ten];
      const rest = ten === 7 ? n - 60 : n - 80;
      return rest < 20 
        ? `${base}-${units[rest]}`
        : `${base}-${convertTwoDigits(rest)}`;
    }

    if (unit === 0) {
      return tens[ten] + (ten === 8 ? 's' : '');
    }

    if (unit === 1 && ten > 1) {
      return `${tens[ten]}-et-un`;
    }

    return `${tens[ten]}-${units[unit]}`;
  }

  // Conversion d'un nombre entre 0 et 999
  function convertThreeDigits(n: number): string {
    if (n === 0) return '';
    
    const hundreds = Math.floor(n / 100);
    const rest = n % 100;

    let result = '';

    if (hundreds > 0) {
      if (hundreds === 1) {
        result = 'cent';
      } else {
        result = `${units[hundreds]} cent`;
      }
      
      // Ajouter un 's' si le nombre se termine par 00
      if (rest === 0 && hundreds > 1) {
        result += 's';
      }
    }

    if (rest > 0) {
      const restInWords = convertTwoDigits(rest);
      result = result ? `${result} ${restInWords}` : restInWords;
    }

    return result;
  }

  // Conversion du nombre entier
  function convertInteger(n: number): string {
    if (n === 0) return 'zéro';

    const billion = Math.floor(n / 1000000000);
    const million = Math.floor((n % 1000000000) / 1000000);
    const thousand = Math.floor((n % 1000000) / 1000);
    const remainder = n % 1000;

    let result = '';

    if (billion > 0) {
      const billionText = convertThreeDigits(billion);
      result += billionText + (billion === 1 ? ' milliard' : ' milliards');
    }

    if (million > 0) {
      if (result) result += ' ';
      const millionText = convertThreeDigits(million);
      result += millionText + (million === 1 ? ' million' : ' millions');
    }

    if (thousand > 0) {
      if (result) result += ' ';
      if (thousand === 1) {
        result += 'mille';
      } else {
        result += convertThreeDigits(thousand) + ' mille';
      }
    }

    if (remainder > 0) {
      if (result) result += ' ';
      result += convertThreeDigits(remainder);
    }

    return result;
  }

  // Traiter la partie entière
  const integerPart = Math.floor(num);
  let words = convertInteger(integerPart);

  // Capitaliser la première lettre
  words = words.charAt(0).toUpperCase() + words.slice(1);

  return `${words} Ariary`;
}


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
            <div className="space-y-6">
              {/* Infos marchand */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="text-blue-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-xl">{merchantData.nom}</h3>
                    <p className="text-gray-600">{merchantData.place}</p>
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
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      paymentType === 'droit_place' 
                        ? 'border-blue-600 bg-blue-50 shadow-md' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        paymentType === 'droit_place' ? 'border-blue-600' : 'border-gray-400'
                      } flex items-center justify-center`}>
                        {paymentType === 'droit_place' && <div className="w-3 h-3 bg-blue-600 rounded-full"></div>}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Droit de place</div>
                        <div className="text-sm text-gray-600 mt-1">Occupation d'emplacement</div>
                        <div className="text-lg font-bold text-blue-600 mt-2">
                          {parseFloat(merchantData.montantPlace).toLocaleString('fr-FR')} Ar
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentType('droit_annuel')}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      paymentType === 'droit_annuel' 
                        ? 'border-blue-600 bg-blue-50 shadow-md' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        paymentType === 'droit_annuel' ? 'border-blue-600' : 'border-gray-400'
                      } flex items-center justify-center`}>
                        {paymentType === 'droit_annuel' && <div className="w-3 h-3 bg-blue-600 rounded-full"></div>}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Droit annuel</div>
                        <div className="text-sm text-gray-600 mt-1">Paiement annuel</div>
                        <div className="text-lg font-bold text-blue-600 mt-2">
                          {parseFloat(merchantData.montantAnnuel).toLocaleString('fr-FR')} Ar
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Récapitulatif du paiement */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Store size={18} className="text-blue-600" />
                    Détails du paiement
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type :</span>
                      <span className="font-medium text-gray-900">
                        {paymentType === 'droit_place' ? 'Droit de place' : 'Droit annuel'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Montant :</span>
                      <span className="font-bold text-blue-600 text-lg">
                        {paymentType === 'droit_place' 
                          ? parseFloat(merchantData.montantPlace).toLocaleString('fr-FR')
                          : parseFloat(merchantData.montantAnnuel).toLocaleString('fr-FR')
                        } Ar
                      </span>
                    </div>
                    <div className="pt-2 border-t border-blue-200">
                      <span className="text-gray-600 block mb-1">Motif :</span>
                      <span className="font-medium text-gray-900 text-xs leading-relaxed block">
                        {paymentType === 'droit_place' 
                          ? merchantData.motifPaiementPlace
                          : merchantData.motifPaiementAnnuel
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Numéro de quittance */}
                <div className="mb-6">
                  <label className="block text-gray-900 font-semibold mb-2">
                    Numéro de quittance <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={numeroQuittance}
                    onChange={(e) => setNumeroQuittance(e.target.value)}
                    placeholder="Ex: Q-2025-001234"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handlePayment}
                  disabled={loading || !numeroQuittance.trim()}
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Store size={20} />}
                  {loading ? 'Traitement en cours...' : 'Confirmer le paiement'}
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
                onClick={() => window.location.href = '/login'}
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
      {/* Modal reçu de paiement */}
      {showReceipt && receiptData && ( 
  <ReceiptGenerator
    data={receiptData}
    onCancel={() => {
      setShowReceipt(false);
      setSuccess('Paiement enregistré avec succès !');
      // Réinitialiser les champs
      setNumeroQuittance('');
      setMerchantData(null);
      setSearchTerm('');
    }}
    onComplete={() => {
      setShowReceipt(false);
      setSuccess('Reçu généré avec succès !');
      setNumeroQuittance('');
      setMerchantData(null);
      setSearchTerm('');
    }}
  />
)}
    </>
  );
}