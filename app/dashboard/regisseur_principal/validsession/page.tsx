'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, CheckCircle, AlertCircle, Calendar, User, Wallet, FileText, Clock } from 'lucide-react';
import API_BASE_URL from '@/services/APIbaseUrl';

interface Paiement {
  id: number;
  montant: number;
  datePaiement: string;
  motif: string;
}

interface SessionData {
  id: number;
  nomSession: string;
  dateSession: string;
  montantCollecte: number;
  notes: string | null;
  paiements: Paiement[] | null;
  status: string;
  user: {
    id: number;
    nom: string;
    prenom: string;
  };
}

export default function SessionValidationPage() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState<number | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
  const [showModal, setShowModal] = useState(false);

  const getUserIdFromToken = (): number | null => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id;
    } catch (e) {
      return null;
    }
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/sessions/validationEnAttente`);
      const formatted = (res.data || []).map((s: SessionData) => ({
        ...s,
        paiements: s.paiements || []
      }));
      
      // Trier par date décroissante (plus récent en premier)
      const sorted = formatted.sort((a: SessionData, b: SessionData) => 
        new Date(b.dateSession).getTime() - new Date(a.dateSession).getTime()
      );
      
      setSessions(sorted);
    } catch (error) {
      console.error("Erreur lors du chargement :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const openModal = (session: SessionData) => {
    setSelectedSession(session);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSession(null);
  };

  const validateSession = async () => {
    if (!selectedSession) return;
    
    const userId = getUserIdFromToken();
    if (!userId) {
      alert("Utilisateur non connecté ou token invalide.");
      return;
    }

    setValidating(selectedSession.id);

    try {
      await axios.post(`${API_BASE_URL}/sessions/validate`, {
        id: selectedSession.id,
        id_regisseurPrincipal: userId
      });
      
      setSessions(prev => prev.filter(s => s.id !== selectedSession.id));
      closeModal();
      
      // Notification de succès
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
      successMsg.innerHTML = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg><span>Session validée avec succès!</span>';
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 3000);
      
    } catch (error: any) {
      alert(error.response?.data || "Erreur lors de la validation.");
      console.error("Erreur validation :", error);
    } finally {
      setValidating(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isRecent = (dateString: string) => {
    const sessionDate = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60);
    return diffInHours < 24;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Validation des Sessions
              </h1>
              <p className="text-gray-600 mt-1">
                {sessions.length} session{sessions.length > 1 ? 's' : ''} en attente
              </p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-600 mt-4 text-lg">Chargement des sessions…</p>
          </div>
        )}

        {/* Aucune session */}
        {!loading && sessions.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <AlertCircle className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-xl text-gray-500">Aucune session en attente de validation</p>
            <p className="text-gray-400 mt-2">Les nouvelles sessions apparaîtront ici</p>
          </div>
        )}

        {/* Liste des sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sessions.map((session, index) => (
            <div
              key={session.id}
              className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${
                index === 0 ? 'border-blue-500 ring-4 ring-blue-100' : 'border-gray-100'
              }`}
            >
              {/* Badge nouvelle session */}
              {index === 0 && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Récente
                  </span>
                </div>
              )}
              
              {/* Badge nouveau (< 24h) */}
              {isRecent(session.dateSession) && index !== 0 && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    Nouveau
                  </span>
                </div>
              )}

              <div className="p-6">
                {/* Titre */}
                <h2 className="text-xl font-bold text-gray-900 mb-3 pr-16">
                  {session.nomSession}
                </h2>

                {/* Informations principales */}
                <div className="space-y-3 mb-5">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span className="text-sm">{formatDate(session.dateSession)}</span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-600">
                    <User className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    <span className="text-sm font-medium">
                      {session.user?.nom} {session.user?.prenom}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-lg font-bold text-green-600">
                      {session.montantCollecte?.toLocaleString()} Ar
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-600">
                    <FileText className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <span className="text-sm">
                      {session.paiements?.length || 0} paiement{(session.paiements?.length || 0) > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {session.notes && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700 italic line-clamp-2">
                      {session.notes}
                    </p>
                  </div>
                )}

                {/* Bouton */}
                <button
                  onClick={() => openModal(session)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Examiner et Valider
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de confirmation */}
      {showModal && selectedSession && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header du modal */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-2xl font-bold text-white pr-12">
                Confirmer la validation
              </h3>
              <p className="text-blue-100 mt-1">
                Vérifiez attentivement les informations avant de valider
              </p>
            </div>

            {/* Contenu du modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Informations de la session */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
                <h4 className="text-xl font-bold text-gray-900 mb-4">
                  {selectedSession.nomSession}
                </h4>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-semibold text-gray-700">Date de session</span>
                    </div>
                    <p className="text-gray-900 ml-8">{formatDate(selectedSession.dateSession)}</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="w-5 h-5 text-purple-500" />
                      <span className="text-sm font-semibold text-gray-700">Agent</span>
                    </div>
                    <p className="text-gray-900 ml-8">
                      {selectedSession.user?.nom} {selectedSession.user?.prenom}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm md:col-span-2">
                    <div className="flex items-center gap-3 mb-2">
                      <Wallet className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-semibold text-gray-700">Montant total collecté</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600 ml-8">
                      {selectedSession.montantCollecte?.toLocaleString()} Ar
                    </p>
                  </div>
                </div>

                {selectedSession.notes && (
                  <div className="bg-white rounded-xl p-4 shadow-sm mt-4">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-orange-500" />
                      <span className="text-sm font-semibold text-gray-700">Notes</span>
                    </div>
                    <p className="text-gray-700 ml-8">{selectedSession.notes}</p>
                  </div>
                )}
              </div>

              {/* Liste des paiements */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Détails des paiements ({selectedSession.paiements?.length || 0})
                </h4>
                
                {selectedSession.paiements && selectedSession.paiements.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedSession.paiements.map((paiement, idx) => (
                      <div
                        key={paiement.id}
                        className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-gray-900">
                            Paiement #{idx + 1}
                          </span>
                          <span className="text-lg font-bold text-blue-600">
                            {paiement.montant?.toLocaleString()} Ar
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Motif:</span> {paiement.motif}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(paiement.datePaiement).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Aucun paiement enregistré</p>
                )}
              </div>
            </div>

            {/* Footer du modal */}
            <div className="bg-gray-50 p-6 flex gap-4">
              <button
                onClick={closeModal}
                disabled={validating !== null}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={validateSession}
                disabled={validating !== null}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {validating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Validation en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Confirmer la validation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}