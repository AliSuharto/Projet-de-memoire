'use client'

import axios from 'axios'
import { useState } from 'react'

// Types TypeScript
interface RecuPlageRequest {
  percepteurId: number
  debut: string
  fin: string
  type: 'NUMERIC' | 'ALPHANUMERIC'
  multiplicateur?: number
}

interface RecuPlageResponse {
  plageId: number
  numerosGeneres: string[]
  totalGeneres: number
  message: string
}

export default function AjouterRecu() {
  // États du formulaire
  const [formData, setFormData] = useState<RecuPlageRequest>({
    percepteurId: 1,
    debut: '',
    fin: '',
    type: 'NUMERIC',
    multiplicateur: undefined
  })

  // États pour l'aperçu et la pagination
  const [previewNumeros, setPreviewNumeros] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)

  // Pagination pour l'aperçu
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50
  const totalPages = Math.ceil(previewNumeros.length / itemsPerPage)

  // Configuration API simulée (remplacez par votre vraie API)
  const API_BASE_URL = 'http://localhost:8080/api'

  // Validation du formulaire
  const validateForm = (): string => {
    if (!formData.debut.trim()) return 'Le début est obligatoire'
    if (!formData.fin.trim()) return 'La fin est obligatoire'
    
    if (formData.type === 'NUMERIC') {
      const debut = parseInt(formData.debut)
      const fin = parseInt(formData.fin)
      if (isNaN(debut) || isNaN(fin)) return 'Les valeurs doivent être numériques'
      if (fin <= debut) return 'La fin doit être supérieure au début'
    }
    
    if (formData.type === 'ALPHANUMERIC') {
      if (formData.debut.length < 2 || formData.fin.length < 2) {
        return 'Format alphanumérique invalide (ex: 45601A)'
      }
      const baseDebut = formData.debut.slice(0, -1)
      const baseFin = formData.fin.slice(0, -1)
      if (baseDebut !== baseFin) {
        return 'La base numérique doit être identique'
      }
    }
    
    if (formData.multiplicateur && formData.multiplicateur < 0) {
      return 'Le multiplicateur doit être positif'
    }
    
    return ''
  }

  // Génération locale pour l'aperçu
  const generatePreviewNumeros = (data: RecuPlageRequest): string[] => {
    const numeros: string[] = []
    
    try {
      if (data.type === 'NUMERIC') {
        const debut = parseInt(data.debut)
        const fin = parseInt(data.fin)
        
        for (let i = debut; i <= fin; i++) {
          numeros.push(String(i))
        }
      } else if (data.type === 'ALPHANUMERIC') {
        const base = data.debut.slice(0, -1)
        const lettreDebut = data.debut.charAt(data.debut.length - 1)
        const lettreFin = data.fin.charAt(data.fin.length - 1)
        
        for (let i = lettreDebut.charCodeAt(0); i <= lettreFin.charCodeAt(0); i++) {
          numeros.push(base + String.fromCharCode(i))
        }
      }
      
      // Appliquer le multiplicateur
      if (data.multiplicateur && data.multiplicateur > 0) {
        const numerosAvecMultiplicateur: string[] = []
        for (const numeroBase of numeros) {
          for (let i = 0; i < data.multiplicateur; i++) {
            const suffixe = String.fromCharCode('A'.charCodeAt(0) + i)
            numerosAvecMultiplicateur.push(numeroBase + suffixe)
          }
        }
        return numerosAvecMultiplicateur
      }
      
      return numeros
    } catch (error) {
      console.error('Erreur génération:', error)
      return []
    }
  }

  // Prévisualiser les numéros
  const handlePrevisualiser = () => {
    setError('')
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    const numeros = generatePreviewNumeros(formData)
    setPreviewNumeros(numeros)
    setShowPreview(true)
    setCurrentPage(1)
  }

  // Enregistrer la plage (simulation API)
  const handleEnregistrer = async () => {
  setError('')
  setSuccess('')
  setIsLoading(true)

  const validationError = validateForm()
  if (validationError) {
    setError(validationError)
    setIsLoading(false)
    return
  }
  console.log('Envoi des données:', formData);

  try {
    const response = await axios.post<RecuPlageResponse>(
      `${API_BASE_URL}/recu-plage`,
      formData,
      { headers: { 'Content-Type': 'application/json' } }
    )

    const data = response.data
    setSuccess(data.message || `Plage créée avec succès! ${data.totalGeneres} reçus générés.`)
    setPreviewNumeros(data.numerosGeneres)
    setShowPreview(true)

    // Réinitialiser le formulaire après succès
    setTimeout(() => {
      setFormData({
        percepteurId: formData.percepteurId,
        debut: '',
        fin: '',
        type: 'NUMERIC',
        multiplicateur: undefined
      })
      setShowPreview(false)
      setPreviewNumeros([])
      setSuccess('')
    }, 3000)

  } catch (err: any) {
    console.error('Erreur:', err)
    setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement')
  } finally {
    setIsLoading(false)
  }
}

  // Télécharger en CSV
  const handleDownloadCSV = () => {
    if (previewNumeros.length === 0) return

    const csvContent = 'Numero\n' + previewNumeros.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recus_${formData.debut}_${formData.fin}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Obtenir les numéros pour la page courante
  const getCurrentPageNumeros = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return previewNumeros.slice(startIndex, endIndex)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ajouter une Plage de Reçus
          </h1>
          <p className="text-gray-600">
            Générez automatiquement une série de numéros de reçus selon vos paramètres
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Début */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Début du numéro *
              </label>
              <input
                type="text"
                value={formData.debut}
                onChange={(e) => setFormData({...formData, debut: e.target.value})}
                placeholder={formData.type === 'NUMERIC' ? '120' : '45601A'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fin du numéro *
              </label>
              <input
                type="text"
                value={formData.fin}
                onChange={(e) => setFormData({...formData, fin: e.target.value})}
                placeholder={formData.type === 'NUMERIC' ? '170' : '45601Z'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Type de reçu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de reçu *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as 'NUMERIC' | 'ALPHANUMERIC'})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="NUMERIC">Numérique (ex: 120, 121, 122...)</option>
                <option value="ALPHANUMERIC">Alphanumérique (ex: 45601A, 45601B...)</option>
              </select>
            </div>

            {/* Multiplicateur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Multiplicateur (optionnel)
              </label>
              <input
                type="number"
                min="0"
                value={formData.multiplicateur || ''}
                onChange={(e) => setFormData({...formData, multiplicateur: e.target.value ? parseInt(e.target.value) : undefined})}
                placeholder="Ex: 5 pour générer 120A, 120B, 120C..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <p className="text-sm text-gray-500 mt-1">
                Génère des sous-numéros avec des suffixes A, B, C...
              </p>
            </div>
          </div>

          {/* Messages d'erreur et succès */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
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
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
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

          {/* Boutons d'action */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={handlePrevisualiser}
              className="flex-1 px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              📋 Prévisualiser
            </button>
            
            <button
              onClick={handleEnregistrer}
              disabled={isLoading}
              className={`flex-1 px-6 py-3 font-medium rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 ${
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enregistrement...
                </span>
              ) : (
                '💾 Enregistrer'
              )}
            </button>
          </div>
        </div>

        {/* Section d'aperçu */}
        {showPreview && previewNumeros.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Aperçu des Numéros Générés
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Total: {previewNumeros.length} numéros
                </span>
                <button
                  onClick={handleDownloadCSV}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                  📥 Télécharger CSV
                </button>
              </div>
            </div>

            {/* Tableau des numéros */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700">
                  Page {currentPage} sur {totalPages}
                </h3>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {getCurrentPageNumeros().map((numero, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 bg-blue-50 border border-blue-200 rounded text-center text-sm font-mono"
                    >
                      {numero}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  ← Précédent
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Suivant →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Information d'aide */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Guide d'utilisation</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Numérique:</strong> Entrez des nombres entiers (ex: début=120, fin=170)</li>
                  <li><strong>Alphanumérique:</strong> Format base + lettre (ex: début=45601A, fin=45601Z)</li>
                  <li><strong>Multiplicateur:</strong> Crée des sous-numéros avec suffixes A, B, C... pour chaque numéro de base</li>
                  <li><strong>Prévisualiser:</strong> Vérifiez les numéros avant l'enregistrement définitif</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}