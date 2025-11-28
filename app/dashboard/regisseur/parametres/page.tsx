'use client';
import { useEffect, useState } from 'react';

interface SessionInfo {
  id: number;
  nomSession: string;
  status: string;
}

interface PaiementRequest {
  percepteurId: number;
  nomPayeur: string;
  montant: number;
  description?: string;
  modePaiement: string;
}

// Nouvelle interface pour la création de session
interface CreateSessionDTO{
userId: number;
nomSession: string;
}

// Nouvelle interface pour la réponse de session créée
interface SessionCreatedResponse{
id: number;
nomSession: string;
userId: number;
status: string;
createdAt: string;
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

export default function PaiementGate() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  // États du formulaire de paiement
  const [formData, setFormData] = useState<PaiementRequest>({
    percepteurId: 1,
    nomPayeur: '',
    montant: 0,
    description: '',
    modePaiement: 'ESPECES'
  });

  // États de l'interface
  const [statistiques, setStatistiques] = useState<StatistiquesPercepteur>({
    recusLibres: 25,
    recusUtilises: 5,
    prochainNumero: 'REC-2025-001'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [dernierPaiement, setDernierPaiement] = useState<PaiementResponse | null>(null);


  useEffect(() => {
    

    // Code de production avec localStorage
    try {
      const storedUser = localStorage.getItem('user') || localStorage.getItem('currentUser');

      if (!storedUser) {
        setShowModal(true);
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);
      setUserId(user.id);

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
        .catch(err => {
          console.error('Erreur lors de la récupération de la session:', err);
          setShowModal(true);
        })
        .finally(() => setLoading(false));
    } catch (err) {
      console.error('Erreur localStorage:', err);
      setShowModal(true);
      setLoading(false);
    }
  }, []);

  // Validation du formulaire
  const validateForm = (): string => {
    if (!formData.nomPayeur.trim()) return 'Le nom du payeur est obligatoire';
    if (formData.montant <= 0) return 'Le montant doit être supérieur à 0';
    if (!formData.modePaiement) return 'Le mode de paiement est obligatoire';
    return '';
  };

  // Traiter le paiement
  const handleTraiterPaiement = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      // EN PRODUCTION: Remplacez par votre appel API réel
      // const response = await fetch('http://localhost:8080/api/paiements', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${localStorage.getItem('token')}`,
      //   },
      //   body: JSON.stringify(formData)
      // });
      // const data = await response.json();

      // Simulation pour l'artifact
      const mockResponse: PaiementResponse = {
        paiementId: Math.floor(Math.random() * 1000),
        numeroRecu: statistiques.prochainNumero,
        nomPayeur: formData.nomPayeur,
        montant: formData.montant,
        modePaiement: formData.modePaiement,
        datePaiement: new Date().toISOString(),
        message: 'Paiement enregistré avec succès'
      };
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setDernierPaiement(mockResponse);
      setSuccess(`Paiement enregistré avec succès! Reçu n° ${mockResponse.numeroRecu} attribué.`);
      
      // Mettre à jour les statistiques
      setStatistiques({
        ...statistiques,
        recusLibres: statistiques.recusLibres - 1,
        recusUtilises: statistiques.recusUtilises + 1,
        prochainNumero: `REC-2025-${String(parseInt(statistiques.prochainNumero.split('-')[2]) + 1).padStart(3, '0')}`
      });
      
      // Réinitialiser le formulaire
      setFormData({
        percepteurId: formData.percepteurId,
        nomPayeur: '',
        montant: 0,
        description: '',
        modePaiement: 'ESPECES'
      });
      
    } catch (err: any) {
      console.error('Erreur paiement:', err);
      setError(err.message || 'Erreur lors du traitement du paiement');
    } finally {
      setIsLoading(false);
    }
  };

  // Imprimer le reçu
  const handleImprimerRecu = () => {
    if (!dernierPaiement) return;
    
    const contenuRecu = `
═══════════════════════════════════════════════
                   REÇU DE PAIEMENT
═══════════════════════════════════════════════

Numéro de reçu: ${dernierPaiement.numeroRecu}
Date: ${new Date(dernierPaiement.datePaiement).toLocaleDateString('fr-FR')}

Reçu de: ${dernierPaiement.nomPayeur}
Montant: ${dernierPaiement.montant.toFixed(2)} €
Mode de paiement: ${dernierPaiement.modePaiement}

Percepteur ID: ${formData.percepteurId}
Session: ${session?.nomSession || 'N/A'}

═══════════════════════════════════════════════
        Merci pour votre paiement
═══════════════════════════════════════════════
    `;
    
    const fenetre = window.open('', '_blank');
    if (fenetre) {
      fenetre.document.write(`<pre style="font-family: monospace; white-space: pre-wrap;">${contenuRecu}</pre>`);
      fenetre.document.close();
      fenetre.print();
        }
      };

    const handleCreateSession = async () => {
        if (!userId) return;
        
        setIsLoading(true);
        setError('');
        
        try {
      const today = new Date().toLocaleDateString('fr-FR');
      const sessionData: CreateSessionDTO = {
        userId: userId,
        nomSession: `Paiement ${today}`
      };

      const response = await fetch('http://localhost:8080/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(sessionData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session');
      }

      const data: SessionCreatedResponse = await response.json();
      setSession({
        id: data.id,
        nomSession: data.nomSession,
        status: data.status
      });
      setShowModal(false);
        } catch (err: any) {
      console.error('Erreur lors de la création de la session:', err);
      setError(err.message || 'Erreur lors de la création de la session');
        } finally {
      setIsLoading(false);
        }
      };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de la session en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <>
     
      {/*Modal de création de session - à implémenter ici si nécessaire*/}
      {showModal && ( 
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm mx-4">
            <div className="text-center mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            <h2 className="text-lg font-bold mb-4 text-center">Créer une nouvelle session</h2>
            <p className="mb-6 text-sm text-gray-600 text-center">
              Veuillez créer une session de paiement pour commencer à traiter les paiements.
            </p>
            <button
              onClick={handleCreateSession}
              className="bg-blue-600 text-white px-4 py-2 rounded-md w-full hover:bg-blue-700 transition-colors font-medium"
            >
              Créer une session
            </button>
          </div>
        </div>
      )}


      {/* Interface de paiement (session ouverte) */}
      {session && (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-6xl mx-auto px-4">
            
            {/* Bannière d'avertissement pour l'artifact */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Mode Démo:</strong> Ce composant est configuré pour se connecter à votre API en production. 
                    LocalStorage n'est pas disponible dans les artifacts Claude.ai.
                  </p>
                </div>
              </div>
            </div>

            {/* En-tête avec statistiques */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              
              {/* Titre principal */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  💳 Traiter un Paiement
                </h1>
                <p className="text-gray-600">
                  Session active: <span className="font-semibold text-green-600">{session.nomSession}</span>
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                    {session.status}
                  </span>
                </p>
              </div>

              {/* Statistiques du percepteur */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">📊 Vos Statistiques</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Reçus libres:</span>
                    <span className="font-bold">{statistiques.recusLibres}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reçus utilisés:</span>
                    <span className="font-bold">{statistiques.recusUtilises}</span>
                  </div>
                  <div className="border-t border-blue-400 pt-2 mt-3">
                    <p className="text-sm">Prochain reçu:</p>
                    <p className="font-bold text-lg">{statistiques.prochainNumero}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Formulaire de paiement */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Nouveau Paiement</h2>
                
                <div className="space-y-6">
                  
                  {/* Nom du payeur */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du payeur *
                    </label>
                    <input
                      type="text"
                      value={formData.nomPayeur}
                      onChange={(e) => setFormData({...formData, nomPayeur: e.target.value})}
                      placeholder="Ex: Jean Dupont"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  {/* Montant */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant (€) *
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={formData.montant || ''}
                      onChange={(e) => setFormData({...formData, montant: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  {/* Mode de paiement */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mode de paiement *
                    </label>
                    <select
                      value={formData.modePaiement}
                      onChange={(e) => setFormData({...formData, modePaiement: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="ESPECES">💵 Espèces</option>
                      <option value="CHEQUE">📄 Chèque</option>
                      <option value="CARTE_BANCAIRE">💳 Carte bancaire</option>
                      <option value="VIREMENT">🏦 Virement</option>
                      <option value="AUTRE">❓ Autre</option>
                    </select>
                  </div>

                  {/* Description optionnelle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (optionnel)
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Ex: Paiement facture n°123..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Messages d'erreur et succès */}
                {error && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-800">{success}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bouton de traitement */}
                <div className="mt-8">
                  <button
                    onClick={handleTraiterPaiement}
                    disabled={isLoading || !statistiques.recusLibres}
                    className={`w-full px-6 py-4 font-semibold rounded-lg text-lg transition-colors focus:ring-2 focus:ring-offset-2 ${
                      isLoading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : !statistiques.recusLibres
                        ? 'bg-red-300 text-red-700 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Traitement en cours...
                      </span>
                    ) : !statistiques.recusLibres ? (
                      '❌ Aucun reçu disponible'
                    ) : (
                      '💾 Traiter le Paiement'
                    )}
                  </button>
                </div>
              </div>

              {/* Section reçu généré */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">🧾 Dernier Reçu Généré</h2>
                
                {dernierPaiement ? (
                  <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
                    {/* En-tête du reçu */}
                    <div className="text-center border-b border-gray-300 pb-4 mb-6">
                      <h3 className="text-2xl font-bold text-gray-800">REÇU DE PAIEMENT</h3>
                      <p className="text-lg font-mono font-bold text-blue-600 mt-2">
                        N° {dernierPaiement.numeroRecu}
                      </p>
                    </div>

                    {/* Détails du reçu */}
                    <div className="space-y-4">
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium">Date:</span>
                        <span>{new Date(dernierPaiement.datePaiement).toLocaleDateString('fr-FR')}</span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium">Payeur:</span>
                        <span className="font-semibold">{dernierPaiement.nomPayeur}</span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium">Montant:</span>
                        <span className="text-xl font-bold text-green-600">
                          {dernierPaiement.montant.toFixed(2)} €
                        </span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium">Mode de paiement:</span>
                        <span>{dernierPaiement.modePaiement.replace('_', ' ')}</span>
                      </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex gap-3 mt-8">
                      <button
                        onClick={handleImprimerRecu}
                        className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                      >
                        🖨️ Imprimer
                      </button>
                      
                      <button
                        onClick={() => setDernierPaiement(null)}
                        className="flex-1 px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                      >
                        ✖️ Fermer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">📄</div>
                    <p className="text-lg">Aucun reçu généré pour le moment</p>
                    <p className="text-sm">Le reçu apparaîtra ici après un paiement</p>
                  </div>
                )}
              </div>
            </div>

            {/* Section informations importantes */}
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">ℹ️ Important à savoir</h3>
                  <div className="mt-2 text-sm text-yellow-700 space-y-2">
                    <p><strong>🎯 Attribution automatique:</strong> Le système attribue automatiquement le reçu avec le plus petit numéro disponible</p>
                    <p><strong>🔒 Sécurité:</strong> Chaque percepteur ne peut utiliser que ses propres reçus</p>
                    <p><strong>❌ Reçus utilisés:</strong> Une fois utilisé, un reçu ne peut plus être réutilisé</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}