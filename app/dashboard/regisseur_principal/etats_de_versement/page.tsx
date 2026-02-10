'use client'

import React from 'react'
import { Download, Printer, FileText, Calendar, DollarSign, Building2, User, CheckCircle } from 'lucide-react'

export default function EtatDeVersementPage() {
  // Données statiques pour l'exemple
  const etatDeVersement = {
    numero: "EV-2024-001",
    date: "10 Février 2026",
    periode: "Janvier 2026",
    commune: "Commune Urbaine de Diego Suarez",
    regisseur: "Ali Suharto",
    montantTotal: 15750000,
    versements: [
      {
        id: 1,
        marche: "Marché Bazarikely",
        date: "05/02/2026",
        numeroRecette: "REC-2026-125",
        montant: 5250000,
        typeRecette: "Droits de place"
      },
      {
        id: 2,
        marche: "Marché Grand pavois",
        date: "07/02/2026",
        numeroRecette: "REC-2026-148",
        montant: 4500000,
        typeRecette: "Droits annuels"
      },
      {
        id: 3,
        marche: "Marché Scama",
        date: "08/02/2026",
        numeroRecette: "REC-2026-156",
        montant: 3000000,
        typeRecette: "Droits de place"
      },
      {
        id: 4,
        marche: "Marché Central",
        date: "09/02/2026",
        numeroRecette: "REC-2026-167",
        montant: 3000000,
        typeRecette: "Pénalités"
      }
    ]
  }

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-MG', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0
    }).format(montant)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    alert('Fonctionnalité de téléchargement à implémenter')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header avec actions */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              État de Versement
            </h1>
            <p className="text-slate-600 mt-1">Récapitulatif des recettes et versements</p>
          </div>
          
          <div className="flex gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Imprimer
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Télécharger PDF
            </button>
          </div>
        </div>

        {/* Carte principale */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
          {/* En-tête du document */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-5 h-5" />
                  <span className="text-blue-100 text-sm">Document officiel</span>
                </div>
                <h2 className="text-2xl font-bold">ÉTAT DE VERSEMENT</h2>
                <p className="text-blue-100 mt-1">N° {etatDeVersement.numero}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-sm text-blue-100 mb-1">Montant total</div>
                <div className="text-3xl font-bold">{formatMontant(etatDeVersement.montantTotal)}</div>
              </div>
            </div>
          </div>

          {/* Informations générales */}
          <div className="p-8 border-b border-slate-200 bg-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">Date d&apos;édition</div>
                  <div className="font-semibold text-slate-800">{etatDeVersement.date}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">Période concernée</div>
                  <div className="font-semibold text-slate-800">{etatDeVersement.periode}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">Commune</div>
                  <div className="font-semibold text-slate-800">{etatDeVersement.commune}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <User className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">Régisseur</div>
                  <div className="font-semibold text-slate-800">{etatDeVersement.regisseur}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des versements */}
          <div className="p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-blue-600" />
              Détail des versements
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">N°</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Marché</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Date</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">N° Recette</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Type</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-slate-600">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {etatDeVersement.versements.map((versement, index) => (
                    <tr 
                      key={versement.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="font-medium text-slate-700">{index + 1}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-slate-800">{versement.marche}</span>
                      </td>
                      <td className="py-4 px-4 text-slate-600">{versement.date}</td>
                      <td className="py-4 px-4">
                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                          {versement.numeroRecette}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-slate-600">{versement.typeRecette}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-semibold text-slate-800">
                          {formatMontant(versement.montant)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-300">
                    <td colSpan={5} className="py-4 px-4 text-right font-bold text-slate-800">
                      TOTAL GÉNÉRAL
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-xl font-bold text-blue-600">
                        {formatMontant(etatDeVersement.montantTotal)}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Pied de page avec signatures */}
          <div className="p-8 bg-slate-50 border-t border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-sm text-slate-500 mb-2">Le Régisseur</div>
                <div className="h-20 border-b-2 border-slate-300 mb-2"></div>
                <div className="font-semibold text-slate-700">{etatDeVersement.regisseur}</div>
              </div>

              <div className="text-center">
                <div className="text-sm text-slate-500 mb-2">L&apos;Ordonnateur</div>
                <div className="h-20 border-b-2 border-slate-300 mb-2"></div>
                <div className="font-semibold text-slate-700">Nom de l&apos;Ordonnateur</div>
              </div>

              <div className="text-center">
                <div className="text-sm text-slate-500 mb-2">Le Trésorier</div>
                <div className="h-20 border-b-2 border-slate-300 mb-2"></div>
                <div className="font-semibold text-slate-700">Nom du Trésorier</div>
              </div>
            </div>

            <div className="mt-8 text-center text-sm text-slate-500">
              <p>Document généré le {etatDeVersement.date}</p>
              <p className="mt-1">© {new Date().getFullYear()} {etatDeVersement.commune} - Tous droits réservés</p>
            </div>
          </div>
        </div>

        {/* Informations complémentaires */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-slate-500">Nombre de versements</div>
                <div className="text-xl font-bold text-slate-800">{etatDeVersement.versements.length}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-slate-500">Marchés concernés</div>
                <div className="text-xl font-bold text-slate-800">
                  {new Set(etatDeVersement.versements.map(v => v.marche)).size}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-slate-500">Montant moyen</div>
                <div className="text-xl font-bold text-slate-800">
                  {formatMontant(etatDeVersement.montantTotal / etatDeVersement.versements.length)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles d'impression */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}