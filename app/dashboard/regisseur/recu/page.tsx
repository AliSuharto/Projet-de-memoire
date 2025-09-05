'use client';

import React, { useState } from "react"
import axios from "axios"
import { jwtDecode } from "jwt-decode"

// Types pour le payload du token
interface JwtPayload {
  id: number
  exp?: number
  iat?: number
}

// Types pour ton formulaire
interface RecuPlageRequest {
  percepteurId: number
  debut: string
  fin: string
  type: "NUMERIC" | "ALPHANUMERIC"
  multiplicateur?: number
}

// Réponse API
interface RecuPlageResponse {
  message: string
  totalGeneres: number
  numerosGeneres: string[]
}



export default function AjouterRecu() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  let percepteurIdFromToken = 0

  if (token) {
    try {
      const decoded = jwtDecode<JwtPayload>(token)
      percepteurIdFromToken = decoded.id
    } catch (error) {
      console.error('Erreur de décodage du token:', error)
    }
  }

  // États du formulaire
  const [formData, setFormData] = useState<RecuPlageRequest>({
    percepteurId: percepteurIdFromToken,
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

  // Configuration API simulée
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

  // Enregistrer la plage
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-0 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
            Ajouter des Reçus
          </h1>
          <p className="text-gray-500 text-lg">
            Créez et gérez facilement vos séries de numéros de reçus
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Début */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Début du numéro *
              </label>
              <input
                type="text"
                value={formData.debut}
                onChange={(e) => setFormData({...formData, debut: e.target.value})}
                placeholder={formData.type === 'NUMERIC' ? '120' : '45601A'}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-gray-400"
              />
            </div>

            {/* Fin */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Fin du numéro *
              </label>
              <input
                type="text"
                value={formData.fin}
                onChange={(e) => setFormData({...formData, fin: e.target.value})}
                placeholder={formData.type === 'NUMERIC' ? '170' : '45601Z'}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-gray-400"
              />
            </div>

            {/* Type de reçu */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Type de reçu *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as 'NUMERIC' | 'ALPHANUMERIC'})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              >
                <option value="NUMERIC">Numérique (ex: 120, 121, 122...)</option>
                <option value="ALPHANUMERIC">Alphanumérique (ex: 45601A, 45601B...)</option>
              </select>
            </div>

            {/* Multiplicateur */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Multiplicateur (optionnel)
              </label>
              <input
                type="number"
                min="0"
                value={formData.multiplicateur || ''}
                onChange={(e) => setFormData({...formData, multiplicateur: e.target.value ? parseInt(e.target.value) : undefined})}
                placeholder="Ex: 5 pour générer 120A, 120B, 120C..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-gray-400"
              />
              <p className="text-sm text-gray-500">
                Ajoute des suffixes (A, B, C...) à chaque numéro
              </p>
            </div>
          </div>

          {/* Messages d'erreur et succès */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <svg className="h-5 w-5 text-red-500 mr-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={handlePrevisualiser}
              className="flex-1 px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Prévisualiser
            </button>
            
            <button
              onClick={handleEnregistrer}
              disabled={isLoading}
              className={`flex-1 px-6 py-3 font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                isLoading
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enregistrement...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section d'aperçu */}
        {showPreview && previewNumeros.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
                Aperçu des Numéros Générés
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 font-medium">
                  Total: {previewNumeros.length} numéros
                </span>
                <button
                  onClick={handleDownloadCSV}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Télécharger CSV
                </button>
              </div>
            </div>

            {/* Tableau des numéros */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700">
                  Page {currentPage} sur {totalPages}
                </h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                  {getCurrentPageNumeros().map((numero, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-center text-sm font-mono text-indigo-800 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {numero}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500'
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
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none ${
                          currentPage === pageNum
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500'
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
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500'
                  }`}
                >
                  Suivant →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Information d'aide */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mt-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-indigo-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-base font-semibold text-indigo-800">Guide d'utilisation</h3>
              <div className="mt-2 text-sm text-indigo-700">
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Numérique :</strong> Saisissez des nombres entiers (ex: début=120, fin=170)</li>
                  <li><strong>Alphanumérique :</strong> Utilisez un format base + lettre (ex: début=45601A, fin=45601Z)</li>
                  <li><strong>Multiplicateur :</strong> Ajoute des suffixes (A, B, C...) pour chaque numéro de base</li>
                  <li><strong>Prévisualiser :</strong> Vérifiez vos numéros avant de les enregistrer</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}