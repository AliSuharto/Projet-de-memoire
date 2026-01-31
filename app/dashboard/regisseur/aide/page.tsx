'use client';
import React from 'react';
import { 
  ShieldCheck, Wallet, Users, Receipt, 
  CheckCircle, XCircle, Calendar, StickyNote, 
  AlertTriangle, Search, FileText, LayoutDashboard,
  Banknote, Clock, TrendingUp, Eye, Printer,
  ListChecks, MapPin, User, CreditCard, History
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

const HelpPageRegisseur: React.FC = () => {

  const sections: Section[] = [
    {
      id: 'securite',
      title: '1. Sécurité et Profil',
      content: (
        <div>
          <h1 className="text-4xl font-light mb-8 text-blue-900">Premiers Pas</h1>
          <div className="bg-white border rounded-xl p-6 shadow-sm border-l-4 border-l-green-500">
            <h3 className="text-xl font-semibold mb-3 flex items-center">
              <ShieldCheck className="mr-2 text-green-600" /> Changement de mot de passe
            </h3>
            <p className="text-gray-700 mb-4">
              Pour protéger votre compte et les données des marchands, <strong>vous devez changer votre mot de passe initial</strong> dès votre première connexion.
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Dans le <strong>menu en haut de l'écran</strong>, cliquez sur votre nom.</li>
              <li>Un menu déroulant apparaît : sélectionnez <strong>Profil</strong>.</li>
              <li>Cliquez sur <strong>Changer mot de passe</strong>.</li>
              <li>Saisissez votre ancien mot de passe temporaire.</li>
              <li>Entrez votre nouveau mot de passe (minimum 8 caractères).</li>
              <li>Confirmez et enregistrez.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'quittances',
      title: '2. Vos Quittances',
      content: (
        <div>
          <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
            <Receipt className="text-blue-600" /> Gestion de vos Quittances
          </h2>
          <p className="text-gray-700 mb-6">
            Les quittances sont les reçus numérotés qui vous ont été attribués par le Directeur. 
            Chaque encaissement doit être accompagné d'une quittance unique.
          </p>
          
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-6">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <Eye className="size-5" /> Comment voir vos quittances :
            </h4>
            <ol className="list-decimal ml-6 space-y-2 text-gray-700">
              <li>Dans le menu latéral, cliquez sur <strong>Mes Quittances</strong>.</li>
              <li>Vous verrez la liste de toutes vos quittances avec leur statut :</li>
            </ol>
            <div className="mt-4 space-y-2 ml-6">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="size-5" />
                <span><strong>Utilisée :</strong> Quittance déjà émise pour un paiement</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="size-5" />
                <span><strong>Disponible :</strong> Quittance prête à être utilisée</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-amber-800">
            <p className="text-sm flex items-start gap-2">
              <AlertTriangle className="size-5 flex-shrink-0 mt-0.5" />
              <span><strong>Important :</strong> Vous ne pouvez utiliser que les quittances qui vous ont été attribuées. Chaque numéro ne peut être utilisé qu'une seule fois.</span>
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'encaissement',
      title: '3. Encaissement des Paiements',
      content: (
        <div>
          <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
            <Wallet className="text-blue-600" /> Collecter les Paiements
          </h2>
          <p className="text-gray-700 mb-6">
            Votre mission principale : enregistrer les paiements quotidiens des marchands présents sur le marché.
          </p>

          <div className="space-y-6">
            <div className="bg-white border p-6 rounded-xl shadow-sm">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <Banknote className="size-5 text-green-600" /> Procédure d'encaissement :
              </h4>
              <ol className="list-decimal ml-6 space-y-3 text-gray-700">
                <li>Dans le menu latéral, cliquez sur <strong>Encaissement</strong> ou <strong>Nouveau Paiement</strong>.</li>
                <li>Sélectionnez le <strong>marché</strong> où vous effectuez la collecte.</li>
                <li>Choisissez la <strong>zone</strong> et le <strong>hall</strong> (si applicable).</li>
                <li>Sélectionnez la <strong>place</strong> du marchand.</li>
                <li>Le système affiche automatiquement :
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Le nom du marchand occupant la place</li>
                    <li>Le tarif journalier applicable</li>
                    <li>L'historique de ses paiements</li>
                  </ul>
                </li>
                <li>Sélectionnez une <strong>quittance disponible</strong> de votre liste.</li>
                <li>Vérifiez le montant à percevoir.</li>
                <li>Confirmez le paiement reçu (espèces ou autre mode).</li>
                <li>Le système génère automatiquement le reçu avec votre quittance.</li>
                <li>Vous pouvez imprimer le reçu pour le marchand.</li>
              </ol>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h5 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="size-5" /> Paiement réussi
                </h5>
                <p className="text-sm text-green-700">
                  La quittance est marquée comme utilisée et le paiement est enregistré dans le système avec la date et l'heure exactes.
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                  <Printer className="size-5" /> Impression
                </h5>
                <p className="text-sm text-blue-700">
                  Vous pouvez imprimer le reçu directement ou le réimprimer plus tard depuis l'historique des paiements.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'marchands',
      title: '4. Consultation des Marchands',
      content: (
        <div>
          <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
            <Users className="text-blue-600" /> Visualiser les Marchands
          </h2>
          <p className="text-gray-700 mb-6">
            Accédez aux informations des marchands pour faciliter vos encaissements.
          </p>

          <div className="bg-white border p-6 rounded-xl shadow-sm mb-6">
            <h4 className="font-bold mb-4">Comment consulter les marchands :</h4>
            <ol className="list-decimal ml-6 space-y-2 text-gray-700">
              <li>Menu latéral → <strong>Marchands</strong></li>
              <li>Vous voyez la liste complète des marchands enregistrés</li>
              <li>Utilisez la <strong>barre de recherche</strong> pour trouver un marchand rapidement</li>
              <li>Cliquez sur un marchand pour voir ses détails complets</li>
            </ol>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h4 className="font-bold mb-3">Informations disponibles :</h4>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <User className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Identité :</strong> Nom, prénom, contact
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Place :</strong> Localisation dans le marché
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CreditCard className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Tarif :</strong> Catégorie et montant journalier
                </div>
              </div>
              <div className="flex items-start gap-2">
                <History className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Historique :</strong> Paiements effectués
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-amber-50 p-4 rounded-lg border border-amber-200 text-amber-800">
            <p className="text-sm flex items-start gap-2">
              <AlertTriangle className="size-5 flex-shrink-0 mt-0.5" />
              <span><strong>Note :</strong> Vous pouvez uniquement <strong>consulter</strong> les informations des marchands. La modification est réservée au Directeur.</span>
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'paiements',
      title: '5. Historique des Paiements',
      content: (
        <div>
          <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
            <History className="text-blue-600" /> Consulter les Paiements
          </h2>
          <p className="text-gray-700 mb-6">
            Accédez à l'historique complet de tous les paiements enregistrés.
          </p>

          <div className="space-y-6">
            <div className="bg-white border p-6 rounded-xl shadow-sm">
              <h4 className="font-bold mb-4">Comment consulter les paiements :</h4>
              <ol className="list-decimal ml-6 space-y-2 text-gray-700">
                <li>Menu latéral → <strong>Paiements</strong> ou <strong>Historique</strong></li>
                <li>Vous voyez la liste de tous les paiements enregistrés</li>
                <li>Utilisez les filtres pour affiner votre recherche :</li>
              </ol>
              <div className="mt-4 ml-6 space-y-2 text-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar className="size-5 text-blue-600" />
                  <span><strong>Par date :</strong> Aujourd'hui, cette semaine, ce mois, période personnalisée</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="size-5 text-blue-600" />
                  <span><strong>Par marchand :</strong> Voir tous les paiements d'un marchand spécifique</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-5 text-blue-600" />
                  <span><strong>Par marché/zone :</strong> Filtrer par emplacement</span>
                </div>
                <div className="flex items-center gap-2">
                  <Receipt className="size-5 text-blue-600" />
                  <span><strong>Par quittance :</strong> Rechercher une quittance spécifique</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h4 className="font-bold mb-3">Actions disponibles :</h4>
              <ul className="space-y-2 text-gray-700 ml-6">
                <li>• <strong>Voir les détails</strong> d'un paiement (montant, date, heure, marchand, quittance)</li>
                <li>• <strong>Réimprimer un reçu</strong> si le marchand a perdu le sien</li>
                <li>• <strong>Exporter la liste</strong> en Excel ou PDF pour vos rapports</li>
                <li>• <strong>Consulter vos statistiques</strong> de collecte</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tableau-bord',
      title: '6. Tableau de Bord',
      content: (
        <div>
          <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
            <LayoutDashboard className="text-blue-600" /> Vue d'Ensemble
          </h2>
          <p className="text-gray-700 mb-6">
            Suivez vos activités et performances en temps réel.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <TrendingUp className="size-5 text-blue-700" /> Statistiques du jour
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Nombre de paiements collectés</li>
                <li>• Montant total encaissé</li>
                <li>• Nombre de quittances utilisées</li>
                <li>• Taux de présence des marchands</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <Receipt className="size-5 text-green-700" /> Vos quittances
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Quittances disponibles restantes</li>
                <li>• Quittances utilisées aujourd'hui</li>
                <li>• Total de quittances attribuées</li>
                <li>• Alerte si stock faible</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <Users className="size-5 text-purple-700" /> Marchands actifs
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Nombre de marchands présents</li>
                <li>• Marchands ayant payé aujourd'hui</li>
                <li>• Marchands en attente de paiement</li>
                <li>• Nouveaux marchands du mois</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <Calendar className="size-5 text-amber-700" /> Activité récente
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Derniers paiements enregistrés</li>
                <li>• Marchands récemment ajoutés</li>
                <li>• Modifications récentes</li>
                <li>• Alertes et notifications</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'sante-marche',
      title: '7. État de Santé du Marché',
      content: (
        <div>
          <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
            <TrendingUp className="text-blue-600" /> Suivi de l'Activité
          </h2>
          <p className="text-gray-700 mb-6">
            Visualisez l'état général du ou des marchés dont vous avez la charge.
          </p>

          <div className="space-y-6">
            <div className="bg-white border p-6 rounded-xl shadow-sm">
              <h4 className="font-bold mb-4">Indicateurs de performance :</h4>
              <div className="space-y-4">
                <div className="border-l-4 border-l-green-500 pl-4 py-2 bg-green-50">
                  <h5 className="font-semibold text-green-800">Taux d'occupation</h5>
                  <p className="text-sm text-gray-700 mt-1">Pourcentage de places occupées par rapport au total disponible</p>
                </div>
                <div className="border-l-4 border-l-blue-500 pl-4 py-2 bg-blue-50">
                  <h5 className="font-semibold text-blue-800">Taux de collecte</h5>
                  <p className="text-sm text-gray-700 mt-1">Pourcentage de paiements reçus par rapport aux marchands présents</p>
                </div>
                <div className="border-l-4 border-l-purple-500 pl-4 py-2 bg-purple-50">
                  <h5 className="font-semibold text-purple-800">Évolution des revenus</h5>
                  <p className="text-sm text-gray-700 mt-1">Comparaison des encaissements sur différentes périodes</p>
                </div>
                <div className="border-l-4 border-l-amber-500 pl-4 py-2 bg-amber-50">
                  <h5 className="font-semibold text-amber-800">Présence moyenne</h5>
                  <p className="text-sm text-gray-700 mt-1">Nombre moyen de marchands présents par jour</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <Eye className="size-5" /> Comment accéder :
              </h4>
              <p className="text-gray-700">
                Menu latéral → <strong>État du Marché</strong> ou <strong>Statistiques</strong>
              </p>
              <p className="text-sm text-gray-600 mt-2 italic">
                Vous pouvez visualiser ces données sous forme de graphiques et de tableaux pour mieux suivre l'évolution.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'recherche',
      title: '8. Recherche Rapide',
      content: (
        <div>
          <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
            <Search className="text-blue-600" /> Trouver une Information
          </h2>
          <p className="text-gray-700 mb-6">
            Utilisez la fonction de recherche pour accéder rapidement aux informations dont vous avez besoin.
          </p>

          <div className="bg-white border p-6 rounded-xl shadow-sm">
            <h4 className="font-bold mb-4">Ce que vous pouvez rechercher :</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border p-4 rounded-lg bg-gray-50">
                <h5 className="font-semibold mb-2 flex items-center gap-2">
                  <User className="size-5 text-blue-600" /> Marchands
                </h5>
                <p className="text-sm text-gray-700">Par nom, prénom, numéro, place, zone</p>
              </div>
              <div className="border p-4 rounded-lg bg-gray-50">
                <h5 className="font-semibold mb-2 flex items-center gap-2">
                  <Receipt className="size-5 text-blue-600" /> Quittances
                </h5>
                <p className="text-sm text-gray-700">Par numéro, préfixe, statut</p>
              </div>
              <div className="border p-4 rounded-lg bg-gray-50">
                <h5 className="font-semibold mb-2 flex items-center gap-2">
                  <Banknote className="size-5 text-blue-600" /> Paiements
                </h5>
                <p className="text-sm text-gray-700">Par date, montant, marchand</p>
              </div>
              <div className="border p-4 rounded-lg bg-gray-50">
                <h5 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="size-5 text-blue-600" /> Places
                </h5>
                <p className="text-sm text-gray-700">Par numéro, zone, hall, statut</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'rapports',
      title: '9. Rapports et Exports',
      content: (
        <div>
          <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
            <FileText className="text-blue-600" /> Générer des Rapports
          </h2>
          <p className="text-gray-700 mb-6">
            Créez des rapports de vos activités pour votre suivi personnel ou à transmettre à votre hiérarchie.
          </p>

          <div className="space-y-6">
            <div className="bg-white border p-6 rounded-xl shadow-sm">
              <h4 className="font-bold mb-4">Types de rapports disponibles :</h4>
              <div className="space-y-3">
                <div className="border-l-4 border-l-blue-500 pl-4 py-2 bg-blue-50">
                  <h5 className="font-semibold text-blue-800">Rapport journalier</h5>
                  <p className="text-sm text-gray-700 mt-1">Récapitulatif de tous les encaissements de la journée</p>
                </div>
                <div className="border-l-4 border-l-green-500 pl-4 py-2 bg-green-50">
                  <h5 className="font-semibold text-green-800">Rapport par période</h5>
                  <p className="text-sm text-gray-700 mt-1">Synthèse des collectes sur une semaine, un mois ou une période personnalisée</p>
                </div>
                <div className="border-l-4 border-l-purple-500 pl-4 py-2 bg-purple-50">
                  <h5 className="font-semibold text-purple-800">Rapport par marchand</h5>
                  <p className="text-sm text-gray-700 mt-1">Historique complet des paiements d'un marchand spécifique</p>
                </div>
                <div className="border-l-4 border-l-amber-500 pl-4 py-2 bg-amber-50">
                  <h5 className="font-semibold text-amber-800">État des quittances</h5>
                  <p className="text-sm text-gray-700 mt-1">Liste de vos quittances utilisées et disponibles</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                <h5 className="font-bold mb-2 flex items-center gap-2">
                  <FileText className="size-5 text-blue-600" /> Format PDF
                </h5>
                <p className="text-sm text-gray-700">Pour les rapports officiels et l'archivage</p>
              </div>
              <div className="bg-green-50 p-5 rounded-lg border border-green-200">
                <h5 className="font-bold mb-2 flex items-center gap-2">
                  <FileText className="size-5 text-green-600" /> Format Excel
                </h5>
                <p className="text-sm text-gray-700">Pour l'analyse et le traitement des données</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'notes',
      title: '10. Notes Personnelles',
      content: (
        <div>
          <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
            <StickyNote className="text-yellow-500" /> Bloc-notes
          </h2>
          <p className="text-gray-700 mb-4">
            Gardez une trace de vos observations, remarques et tâches à effectuer.
          </p>
          <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 shadow-inner">
            <h4 className="font-bold mb-3">Comment accéder à vos notes :</h4>
            <ol className="list-decimal ml-6 space-y-2 text-gray-800">
              <li>Cliquez sur votre nom dans le <strong>menu en haut de l'écran</strong>.</li>
              <li>Dans le menu déroulant, sélectionnez <strong>Note</strong>.</li>
              <li>Rédigez vos notes personnelles (observations sur les marchands, rappels, etc.).</li>
              <li>Vos notes sont automatiquement enregistrées et restent privées.</li>
            </ol>
            <div className="mt-4 bg-yellow-100 p-3 rounded text-sm text-yellow-800">
              <strong>Astuce :</strong> Utilisez vos notes pour signaler des anomalies, noter les absences répétées ou planifier vos tournées de collecte.
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'bonnes-pratiques',
      title: '11. Bonnes Pratiques',
      content: (
        <div>
          <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
            <ListChecks className="text-blue-600" /> Conseils pour un Travail Efficace
          </h2>
          
          <div className="space-y-6">
            <div className="bg-green-50 border-l-4 border-l-green-500 p-6 rounded-r-xl">
              <h4 className="font-bold text-green-800 mb-3">✓ À FAIRE</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• Vérifiez chaque matin le nombre de quittances disponibles</li>
                <li>• Enregistrez les paiements immédiatement après la collecte</li>
                <li>• Vérifiez l'identité du marchand avant d'enregistrer le paiement</li>
                <li>• Imprimez et remettez systématiquement le reçu au marchand</li>
                <li>• Consultez l'historique en cas de doute sur un paiement</li>
                <li>• Générez votre rapport journalier en fin de journée</li>
                <li>• Signalez rapidement toute anomalie à votre supérieur</li>
              </ul>
            </div>

            <div className="bg-red-50 border-l-4 border-l-red-500 p-6 rounded-r-xl">
              <h4 className="font-bold text-red-800 mb-3">✗ À ÉVITER</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• Ne réutilisez jamais une quittance déjà émise</li>
                <li>• N'enregistrez pas de paiement sans quittance</li>
                <li>• Ne modifiez pas les montants prédéfinis sans autorisation</li>
                <li>• N'acceptez pas de paiement sans vérifier l'identité du marchand</li>
                <li>• Ne reportez pas l'enregistrement des paiements à plus tard</li>
                <li>• N'oubliez pas de remettre le reçu au marchand</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <Clock className="size-5" /> Organisation quotidienne recommandée
              </h4>
              <div className="space-y-3 text-gray-700">
                <div className="flex gap-3">
                  <span className="font-semibold min-w-fit">Début de journée :</span>
                  <span>Consulter le tableau de bord, vérifier les quittances disponibles</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-semibold min-w-fit">Pendant la collecte :</span>
                  <span>Enregistrer chaque paiement immédiatement, remettre les reçus</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-semibold min-w-fit">Fin de journée :</span>
                  <span>Générer le rapport journalier, vérifier les statistiques, noter les observations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8 pt-20 md:pt-6">
      <main className="flex-1 transition-all duration-300">
        <div className="w-full p-8 max-w-full">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12 border-b pb-6">
              <h1 className="text-5xl font-extralight text-slate-800">Guide du Régisseur</h1>
              <p className="text-slate-500 mt-2 italic">Manuel d'utilisation pour la gestion des encaissements et le suivi des marchands.</p>
            </div>
            
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="mb-20 scroll-mt-12 bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
              >
                {section.content}
              </section>
            ))}

            <div className="mt-16 p-6 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-xl shadow-lg">
              <h3 className="text-xl font-bold mb-3">Besoin d'aide ?</h3>
              <p className="text-blue-100 mb-4">
                Si vous rencontrez des difficultés ou avez des questions, n'hésitez pas à contacter :
              </p>
              <ul className="text-blue-100 space-y-1 ml-4">
                <li>• Votre Régisseur Principal</li>
                <li>• Le Directeur</li>
                <li>• Le support technique du logiciel</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HelpPageRegisseur;