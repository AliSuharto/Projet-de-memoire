'use client'

import React from 'react'
import { Download, Printer, TrendingUp, TrendingDown, Users, DollarSign, ShoppingBag, Calendar, FileText, BarChart3, PieChart, Activity } from 'lucide-react'

export default function RapportPage() {
  // Données statiques pour le rapport
  const rapport = {
    titre: "Rapport Mensuel des Recettes",
    periode: "Janvier 2026",
    dateGeneration: "10 Février 2026",
    commune: "Commune Urbaine de Diego Suarez",
    
    statistiquesGlobales: {
      recetteTotale: 45750000,
      evolution: +12.5,
      nombreMarchands: 1247,
      evolutionMarchands: +8,
      nombreTransactions: 3891,
      evolutionTransactions: +15.2,
      moyenneParTransaction: 11756
    },

    recettesParMarche: [
      { nom: "Marché Central", montant: 18500000, pourcentage: 40.4, evolution: +15 },
      { nom: "Marché Bazarikely", montant: 12300000, pourcentage: 26.9, evolution: +8 },
      { nom: "Marché Grand pavois", montant: 8950000, pourcentage: 19.6, evolution: +12 },
      { nom: "Marché Scama", montant: 6000000, pourcentage: 13.1, evolution: -5 }
    ],

    recettesParType: [
      { type: "Droits de place", montant: 25600000, pourcentage: 56, transactions: 2145 },
      { type: "Droits annuels", montant: 12450000, pourcentage: 27, transactions: 856 },
      { type: "Pénalités", montant: 5200000, pourcentage: 11, transactions: 623 },
      { type: "Autres", montant: 2500000, pourcentage: 6, transactions: 267 }
    ],

    evolutionHebdomadaire: [
      { semaine: "Semaine 1", montant: 9200000 },
      { semaine: "Semaine 2", montant: 11500000 },
      { semaine: "Semaine 3", montant: 12800000 },
      { semaine: "Semaine 4", montant: 12250000 }
    ],

    topMarchands: [
      { nom: "SARL Razafy", marche: "Marché Central", montant: 850000 },
      { nom: "EI Rakoto", marche: "Marché Bazarikely", montant: 720000 },
      { nom: "SARL Andria", marche: "Marché Central", montant: 680000 },
      { nom: "EI Raharison", marche: "Marché Grand pavois", montant: 650000 },
      { nom: "SARL Rasolofo", marche: "Marché Scama", montant: 620000 }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-indigo-600" />
              Rapport d&apos;Activité
            </h1>
            <p className="text-slate-600 mt-1">Analyse détaillée des recettes et performances</p>
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
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Télécharger PDF
            </button>
          </div>
        </div>

        {/* En-tête du rapport */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{rapport.titre}</h2>
                <div className="flex items-center gap-4 text-indigo-100">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Période: {rapport.periode}
                  </span>
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Généré le: {rapport.dateGeneration}
                  </span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-sm text-indigo-100 mb-1">Recette totale</div>
                <div className="text-3xl font-bold">{formatMontant(rapport.statistiquesGlobales.recetteTotale)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-semibold ${rapport.statistiquesGlobales.evolution >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {rapport.statistiquesGlobales.evolution >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(rapport.statistiquesGlobales.evolution)}%
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {formatMontant(rapport.statistiquesGlobales.recetteTotale)}
            </div>
            <div className="text-sm text-slate-500">Recette totale</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-semibold ${rapport.statistiquesGlobales.evolutionMarchands >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {rapport.statistiquesGlobales.evolutionMarchands >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(rapport.statistiquesGlobales.evolutionMarchands)}%
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {rapport.statistiquesGlobales.nombreMarchands.toLocaleString()}
            </div>
            <div className="text-sm text-slate-500">Marchands actifs</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-purple-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-semibold ${rapport.statistiquesGlobales.evolutionTransactions >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {rapport.statistiquesGlobales.evolutionTransactions >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(rapport.statistiquesGlobales.evolutionTransactions)}%
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {rapport.statistiquesGlobales.nombreTransactions.toLocaleString()}
            </div>
            <div className="text-sm text-slate-500">Transactions</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {formatMontant(rapport.statistiquesGlobales.moyenneParTransaction)}
            </div>
            <div className="text-sm text-slate-500">Moyenne par transaction</div>
          </div>
        </div>

        {/* Graphiques et analyses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Recettes par marché */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-600" />
              Recettes par Marché
            </h3>
            <div className="space-y-4">
              {rapport.recettesParMarche.map((marche, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700">{marche.nom}</span>
                      <span className={`text-xs font-semibold ${marche.evolution >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {marche.evolution >= 0 ? '+' : ''}{marche.evolution}%
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-800">{formatMontant(marche.montant)}</span>
                  </div>
                  <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${marche.pourcentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{marche.pourcentage}% du total</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recettes par type */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Recettes par Type
            </h3>
            <div className="space-y-4">
              {rapport.recettesParType.map((type, index) => {
                const colors = [
                  { bg: 'bg-blue-500', light: 'bg-blue-100' },
                  { bg: 'bg-green-500', light: 'bg-green-100' },
                  { bg: 'bg-orange-500', light: 'bg-orange-100' },
                  { bg: 'bg-purple-500', light: 'bg-purple-100' }
                ]
                return (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${colors[index].bg}`}></div>
                        <span className="font-medium text-slate-700">{type.type}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-800">{formatMontant(type.montant)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 relative h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`absolute top-0 left-0 h-full ${colors[index].bg} rounded-full transition-all duration-500`}
                          style={{ width: `${type.pourcentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-500 w-20 text-right">{type.transactions} trans.</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Évolution hebdomadaire */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 mb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Évolution Hebdomadaire des Recettes
          </h3>
          <div className="flex items-end justify-between gap-4 h-64">
            {rapport.evolutionHebdomadaire.map((semaine, index) => {
              const maxMontant = Math.max(...rapport.evolutionHebdomadaire.map(s => s.montant))
              const hauteur = (semaine.montant / maxMontant) * 100
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-3">
                  <div className="text-sm font-semibold text-slate-700">
                    {formatMontant(semaine.montant)}
                  </div>
                  <div className="w-full flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-lg transition-all duration-500 hover:from-indigo-700 hover:to-purple-600"
                      style={{ height: `${hauteur}%`, minHeight: '40px' }}
                    ></div>
                  </div>
                  <div className="text-sm text-slate-600 text-center">{semaine.semaine}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top marchands */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 mb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Top 5 Marchands du Mois
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Rang</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Marchand</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Marché</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Montant total</th>
                </tr>
              </thead>
              <tbody>
                {rapport.topMarchands.map((marchand, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white
                          ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-orange-600' : 'bg-slate-300'}`}>
                          {index + 1}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800">{marchand.nom}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">
                        {marchand.marche}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-semibold text-slate-800">{formatMontant(marchand.montant)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Résumé et observations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Points Positifs
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span className="text-slate-700">Augmentation de 12.5% des recettes par rapport au mois précédent</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span className="text-slate-700">Le Marché Central montre une croissance de 15%</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span className="text-slate-700">Nombre de transactions en hausse de 15.2%</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span className="text-slate-700">8 nouveaux marchands enregistrés ce mois</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              Points d&apos;Attention
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <span className="text-slate-700">Le Marché Anosibe affiche une baisse de 5%</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <span className="text-slate-700">Augmentation des pénalités (+11% du total)</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <span className="text-slate-700">Retards de paiement en légère hausse</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <span className="text-slate-700">Besoin de renforcement du recouvrement sur certains marchés</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Pied de page */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-600">
            <div>
              <p className="font-semibold text-slate-800">{rapport.commune}</p>
              <p>Rapport généré automatiquement le {rapport.dateGeneration}</p>
            </div>
            <div className="text-center md:text-right">
              <p>Document confidentiel - Usage interne uniquement</p>
              <p>© {new Date().getFullYear()} Tous droits réservés</p>
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