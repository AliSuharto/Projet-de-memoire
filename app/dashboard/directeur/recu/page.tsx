'use client'

import { useState, useEffect } from 'react'

// Types TypeScript pour le système de paiement
interface PaiementRequest {
  percepteurId: number
  nomPayeur: string
  montant: number
  description?: string
  modePaiement: string
}

interface PaiementResponse {
  paiementId: number
  numeroRecu: string
  nomPayeur: string
  montant: number
  modePaiement: string
  datePaiement: string
  message: string
}

interface StatistiquesPercepteur {
  recusLibres: number
  recusUtilises: number
  prochainNumero: string
}

export default function TraiterPaiement() {
  // États du formulaire de paiement
  const [formData, setFormData] = useState<PaiementRequest>({
    percepteurId: 1, // À adapter selon votre système d'auth
    nomPayeur: '',
    montant: 0,
    description: '',
    modePaiement: 'ESPECES'
  })

  // États de l'interface
  const [statistiques, setStatistiques] = useState<StatistiquesPercepteur | null>({
    recusLibres: 25,
    recusUtilises: 5,
    prochainNumero: 'REC-2025-001'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [dernierPaiement, setDernierPaiement] = useState<PaiementResponse | null>(null)

  // Simulation du chargement des statistiques
  const chargerStatistiques = async () => {
    try {
      // Simulation d'un appel API
      console.log('Chargement des statistiques...')
      // En production, remplacez par votre appel API réel
    } catch (err) {
      console.error('Erreur chargement statistiques:', err)
    }
  }

  useEffect(() => {
    chargerStatistiques()
  }, [formData.percepteurId])

  // Validation du formulaire
  const validateForm = (): string => {
    if (!formData.nomPayeur.trim()) return 'Le nom du payeur est obligatoire'
    if (formData.montant <= 0) return 'Le montant doit être supérieur à 0'
    if (!formData.modePaiement) return 'Le mode de paiement est obligatoire'
    return ''
  }

  // Traiter le paiement
  const handleTraiterPaiement = async () => {
    setError('')
    setSuccess('')
    setIsLoading(true)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setIsLoading(false)
      return
    }

    try {
      // Simulation de la réponse API
      const mockResponse: PaiementResponse = {
        paiementId: Math.floor(Math.random() * 1000),
        numeroRecu: statistiques?.prochainNumero || 'REC-2025-001',
        nomPayeur: formData.nomPayeur,
        montant: formData.montant,
        modePaiement: formData.modePaiement,
        datePaiement: new Date().toISOString(),
        message: 'Paiement enregistré avec succès'
      }
      
      // Simpler un délai d'API
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setDernierPaiement(mockResponse)
      setSuccess(`Paiement enregistré avec succès! Reçu n° ${mockResponse.numeroRecu} attribué.`)
      
      // Mettre à jour les statistiques
      if (statistiques) {
        setStatistiques({
          ...statistiques,
          recusLibres: statistiques.recusLibres - 1,
          recusUtilises: statistiques.recusUtilises + 1,
          prochainNumero: `REC-2025-${String(parseInt(statistiques.prochainNumero.split('-')[2]) + 1).padStart(3, '0')}`
        })
      }
      
      // Réinitialiser le formulaire (garder le percepteur)
      setFormData({
        percepteurId: formData.percepteurId,
        nomPayeur: '',
        montant: 0,
        description: '',
        modePaiement: 'ESPECES'
      })
      
    } catch (err: any) {
      console.error('Erreur paiement:', err)
      setError('Erreur lors du traitement du paiement')
    } finally {
      setIsLoading(false)
    }
  }

  // Imprimer le reçu (simulation)
  const handleImprimerRecu = () => {
    if (!dernierPaiement) return
    
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

═══════════════════════════════════════════════
        Merci pour votre paiement
═══════════════════════════════════════════════
    `
    
    // Ouvrir dans une nouvelle fenêtre pour impression
    const fenetre = window.open('', '_blank')
    if (fenetre) {
      fenetre.document.write(`<pre style="font-family: monospace; white-space: pre-wrap;">${contenuRecu}</pre>`)
      fenetre.document.close()
      fenetre.print()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="mb-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
              Traitement des Paiements
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Le système attribuera automatiquement le prochain reçu disponible dans l'ordre
            </p>
          </div>

          {/* Statistiques avec design moderne */}
          {statistiques && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Reçus libres</p>
                    <p className="text-3xl font-bold text-green-600">{statistiques.recusLibres}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Reçus utilisés</p>
                    <p className="text-3xl font-bold text-blue-600">{statistiques.recusUtilises}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm font-medium mb-1">Prochain reçu</p>
                    <p className="text-2xl font-bold">{statistiques.prochainNumero}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0L6 20a1 1 0 001 1h10a1 1 0 001-1L17 4" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Formulaire de paiement */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Nouveau Paiement</h2>
            
            <div className="space-y-6">
              
              {/* Nom du payeur - CORRECTION ICI */}
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

              {/* Montant - CORRECTION ICI */}
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
                disabled={isLoading || !statistiques?.recusLibres}
                className={`w-full px-6 py-4 font-semibold rounded-lg text-lg transition-colors focus:ring-2 focus:ring-offset-2 ${
                  isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : !statistiques?.recusLibres
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
                ) : !statistiques?.recusLibres ? (
                  '❌ Aucun reçu disponible'
                ) : (
                  '💾 Traiter le Paiement'
                )}
              </button>

              {!statistiques?.recusLibres && (
                <p className="mt-2 text-sm text-red-600 text-center">
                  Veuillez d'abord ajouter une plage de reçus
                </p>
              )}
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
                <p><strong>🎯 Attribution automatique:</strong> Le système attribue automatiquement le reçu avec le plus petit numéro disponible (ex: 150A avant 150B)</p>
                <p><strong>🔒 Sécurité:</strong> Chaque percepteur ne peut utiliser que ses propres reçus</p>
                <p><strong>📊 Ordre de priorité:</strong> Les anciennes plages sont utilisées en priorité avant les nouvelles</p>
                <p><strong>❌ Reçus utilisés:</strong> Une fois utilisé, un reçu ne peut plus être réutilisé</p>
              </div>
            </div>
          </div>
        </div>

        {/* Raccourcis rapides */}
        <div className="mt-6 flex justify-center space-x-4">
          <button className="px-6 py-2 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 transition-colors">
            ➕ Ajouter des Reçus
          </button>
          <button className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
            📋 Consulter mes Reçus
          </button>
        </div>
      </div>
    </div>
  )
}