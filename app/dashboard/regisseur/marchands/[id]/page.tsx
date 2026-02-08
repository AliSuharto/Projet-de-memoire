'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, MapPin, Phone, Calendar, CreditCard, User, FileText, DollarSign, Tag, Receipt, Clock, Hash, UserCheck } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import API_BASE_URL from '@/services/APIbaseUrl';

// Types
interface Place {
  nom: string;
  salleName: string;
  zoneName?: string;
  marcheeName?: string;
  categorieName?: string;
}

interface Paiement {
  id: number;
  date: string;
  datePaiement: string;
  montant: number;
  motif: string;
  reference?: string;
  recuNumero?: string;
  nomAgent?: string;
  createdAt: string;
}

interface Marchand {
  id: number;
  nom: string;
  cin?: string;
  activite: string;
  email?: string;
  telephone?: string;
  statut: StatutType;
  places: Place[];
  paiements: Paiement[];
}

type StatutType = 'A_JOUR' | 'RETARD_LEGER' | 'RETARD_SIGNIFICATIF' | 'RETARD_CRITIQUE' | 'RETARD_PROLONGER';

const statutColors: Record<StatutType, string> = {
  A_JOUR: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  RETARD_LEGER: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  RETARD_SIGNIFICATIF: 'bg-orange-50 text-orange-700 border-orange-200',
  RETARD_CRITIQUE: 'bg-red-50 text-red-700 border-red-200',
  RETARD_PROLONGER: 'bg-red-100 text-red-800 border-red-300'
};

const statutLabels: Record<StatutType, string> = {
  A_JOUR: 'À jour',
  RETARD_LEGER: 'Retard léger',
  RETARD_SIGNIFICATIF: 'Retard significatif',
  RETARD_CRITIQUE: 'Retard critique',
  RETARD_PROLONGER: 'Retard prolongé'
};

export default function MarchandDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const marchandId = params?.id;

  const [marchand, setMarchand] = useState<Marchand | null>(null);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaiements, setShowPaiements] = useState(false);
  const [expandedPaiement, setExpandedPaiement] = useState<number | null>(null);

  useEffect(() => {
    const fetchMarchandDetails = async () => {
      if (!marchandId) return;

      try {
        setLoading(true);
        
        const marchandResponse = await fetch(`${API_BASE_URL}/contrat/contrats-actifs`);
        if (!marchandResponse.ok) throw new Error('Erreur lors du chargement des données');
        
        const allMarchands = await marchandResponse.json();
        const foundMarchand = allMarchands.find((m: Marchand) => m.id === Number(marchandId));
        
        if (!foundMarchand) throw new Error('Marchand non trouvé');
        
        setMarchand(foundMarchand);

        const paiementsResponse = await fetch(`${API_BASE_URL}/paiements/marchand/${marchandId}`);
        if (!paiementsResponse.ok) throw new Error('Erreur lors du chargement des paiements');
        
        const paiementsData = await paiementsResponse.json();
        // Trier par date décroissante (LIFO - le plus récent en premier)
        const sortedPaiements = paiementsData.sort((a: Paiement, b: Paiement) => 
          new Date(b.datePaiement).getTime() - new Date(a.datePaiement).getTime()
        );
        setPaiements(sortedPaiements);
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchMarchandDetails();
  }, [marchandId]);

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMontant = (montant: number): string => {
    return `${montant.toLocaleString('fr-FR')} Ar`;
  };

  const getLastPaiementInfo = (marchand: Marchand) => {
    if (!marchand.paiements || marchand.paiements.length === 0) {
      return { date: null, montant: 0 };
    }
    const lastPaiement = marchand.paiements.reduce((latest, current) => 
      new Date(current.datePaiement) > new Date(latest.datePaiement) ? current : latest
    );
    return { date: lastPaiement.datePaiement, montant: lastPaiement.montant };
  };

  const togglePaiement = (id: number) => {
    setExpandedPaiement(expandedPaiement === id ? null : id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-slate-600 font-medium">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (error || !marchand) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Erreur</h2>
            <p className="text-slate-600 mb-6">{error || 'Marchand non trouvé'}</p>
            <button
              onClick={() => router.push('/dashboard/regisseur/marchands')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Retour à la liste
            </button>
          </div>
        </div>
      </div>
    );
  }

  const lastPaiement = getLastPaiementInfo(marchand);
  const totalPaiements = paiements.reduce((sum, p) => sum + (p.montant || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 pt-20 md:pt-0">
      {/* HEADER - Plus fin */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => router.push('/dashboard/regisseur/marchands')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all shadow-sm font-medium text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Retour</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-500">Statut</p>
                <p className="text-sm font-semibold text-slate-700">{statutLabels[marchand.statut]}</p>
              </div>
              <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${statutColors[marchand.statut]}`}>
                {statutLabels[marchand.statut]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* PROFIL MARCHAND */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          {/* Header Profil - Plus discret */}
          <div className="bg-blue-800 px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <User className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-white mb-1">{marchand.nom}</h1>
                <div className="flex flex-wrap items-center gap-2 text-white/90 text-sm">
                  {marchand.cin && (
                    <span className="bg-white/10 px-2 py-0.5 rounded">CIN: {marchand.cin}</span>
                  )}
                  <span className="bg-white/10 px-2 py-0.5 rounded">{marchand.activite}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Informations Détaillées */}
          <div className="p-5">
            <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-600" />
              Informations du Marchand
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Contact */}
              <div className="bg-emerald-50/50 rounded-lg p-4 border border-emerald-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-400 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700">Contact</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-0.5">Téléphone</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {marchand.telephone || <span className="text-slate-400 font-normal">Non renseigné</span>}
                    </p>
                  </div>
                  {marchand.email && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-0.5">Email</p>
                      <p className="text-xs font-medium text-slate-700 break-words">{marchand.email}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Emplacement */}
              <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-400 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700">Emplacement</h3>
                </div>
                <div className="space-y-2">
                  {marchand.places && marchand.places.length > 0 ? (
                    marchand.places.map((place, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-0.5">Place</p>
                          <p className="text-sm font-semibold text-slate-800">{place.nom}</p>
                        </div>
                        {place.marcheeName && (
                          <div>
                            <p className="text-xs font-medium text-slate-500 mb-0.5">Marché</p>
                            <p className="text-xs font-medium text-slate-700">{place.marcheeName}</p>
                          </div>
                        )}
                        {place.zoneName && (
                          <div>
                            <p className="text-xs font-medium text-slate-500 mb-0.5">Zone</p>
                            <p className="text-xs font-medium text-slate-600">{place.zoneName}</p>
                          </div>
                        )}
                        {place.salleName && (
                          <div>
                            <p className="text-xs font-medium text-slate-500 mb-0.5">Hall</p>
                            <p className="text-xs font-medium text-slate-600">{place.salleName}</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">Aucune place attribuée</p>
                  )}
                </div>
              </div>

              {/* Catégorie */}
              <div className="bg-purple-50/50 rounded-lg p-4 border border-purple-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-400 flex items-center justify-center">
                    <Tag className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700">Catégorie</h3>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-0.5">Type d'activité</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {marchand.places && marchand.places[0]?.categorieName ? marchand.places[0].categorieName : 'Non spécifiée'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RÉSUMÉ PAIEMENTS */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="bg-green-800 px-5 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Résumé des Paiements
              </h2>
              <div className="bg-white/10 px-3 py-1 rounded-lg">
                <p className="text-xs text-white/70">Total paiements</p>
                <p className="text-base font-bold text-white">{paiements.length}</p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              {/* Dernier Paiement */}
              <div className="bg-indigo-50/50 rounded-lg p-4 border border-indigo-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-400 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-600 uppercase">Dernier Paiement</h3>
                </div>
                <div className="space-y-1">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Date</p>
                    <p className="text-base font-bold text-slate-800">
                      {lastPaiement.date ? formatDate(lastPaiement.date) : 'Aucun'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Montant</p>
                    <p className="text-xl font-bold text-indigo-600">
                      {lastPaiement.montant > 0 ? formatMontant(lastPaiement.montant) : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Versé */}
              <div className="bg-green-50/50 rounded-lg p-4 border border-green-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-green-400 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-600 uppercase">Total Versé</h3>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Montant cumulé</p>
                  <p className="text-2xl font-bold text-green-600">{formatMontant(totalPaiements)}</p>
                </div>
              </div>

              {/* Nombre de Transactions */}
              <div className="bg-orange-50/50 rounded-lg p-4 border border-orange-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-400 flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-600 uppercase">Transactions</h3>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Nombre total</p>
                  <p className="text-2xl font-bold text-orange-600">{paiements.length}</p>
                </div>
              </div>
            </div>

            {/* Bouton Voir Historique */}
            <button
              onClick={() => setShowPaiements(!showPaiements)}
             className="w-full py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              {showPaiements ? (
                <>
                  <ChevronUp className="w-5 h-5" />
                  Masquer l'historique
                </>
              ) : (
                <>
                  <Receipt className="w-5 h-5" />
                  Voir l'historique complet
                </>
              )}
            </button>
          </div>
        </div>

        {/* HISTORIQUE PAIEMENTS (Conditionnel) */}
        {showPaiements && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-5 py-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Historique Complet
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {paiements.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-3">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">Aucun paiement enregistré</p>
                </div>
              ) : (
                paiements.map((paiement) => (
                  <div key={paiement.id} className="hover:bg-slate-50/50 transition-colors">
                    <button
                      onClick={() => togglePaiement(paiement.id)}
                      className="w-full px-5 py-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left min-w-0 flex-1">
                          <p className="font-semibold text-slate-800 text-base mb-0.5">{paiement.motif}</p>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDateTime(paiement.datePaiement)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <p className="text-lg font-bold text-green-600">{formatMontant(paiement.montant)}</p>
                        {expandedPaiement === paiement.id ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Détails Étendus */}
                    {expandedPaiement === paiement.id && (
                      <div className="px-5 pb-4 bg-slate-50/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-white rounded-lg p-3 border border-slate-200">
                            <div className="flex items-center gap-1.5 mb-2">
                              <Hash className="w-4 h-4 text-blue-500" />
                              <p className="text-xs font-semibold text-slate-500 uppercase">Référence</p>
                            </div>
                            <p className="text-sm font-semibold text-slate-800">{paiement.reference || `TXN-${paiement.id}`}</p>
                          </div>

                          <div className="bg-white rounded-lg p-3 border border-slate-200">
                            <div className="flex items-center gap-1.5 mb-2">
                              <Receipt className="w-4 h-4 text-purple-500" />
                              <p className="text-xs font-semibold text-slate-500 uppercase">Numéro Reçu</p>
                            </div>
                            <p className="text-sm font-semibold text-slate-800">{paiement.recuNumero || 'N/A'}</p>
                          </div>

                          <div className="bg-white rounded-lg p-3 border border-slate-200">
                            <div className="flex items-center gap-1.5 mb-2">
                              <Calendar className="w-4 h-4 text-green-500" />
                              <p className="text-xs font-semibold text-slate-500 uppercase">Date & Heure</p>
                            </div>
                            <p className="text-sm font-semibold text-slate-800">{formatDateTime(paiement.datePaiement)}</p>
                          </div>

                          <div className="bg-white rounded-lg p-3 border border-slate-200">
                            <div className="flex items-center gap-1.5 mb-2">
                              <UserCheck className="w-4 h-4 text-orange-500" />
                              <p className="text-xs font-semibold text-slate-500 uppercase">Agent</p>
                            </div>
                            <p className="text-sm font-semibold text-slate-800">{paiement.nomAgent || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}