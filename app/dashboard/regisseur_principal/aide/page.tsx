'use client';
import React from 'react';
import { 
  ShieldCheck, Wallet, Users, Receipt, 
  CheckCircle, XCircle, Calendar, StickyNote, 
  AlertTriangle, Search, FileText, LayoutDashboard,
  Banknote, Clock, TrendingUp, Eye, Printer,
  ListChecks, MapPin, User, CreditCard, History,
  UserCheck, ClipboardCheck, DollarSign, Lock,
  Unlock, FileSpreadsheet, Download, Award,
  AlertCircle, PlayCircle, StopCircle, Settings, Ticket
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

const HelpPageRegisseurPrincipal: React.FC = () => {

  const sections: Section[] = [
    {
      id: 'securite',
      title: '1. Sécurité et Profil',
      content: (
        <div>
          <h1 className="text-4xl font-light mb-8 text-blue-900">Configuration Initiale</h1>
          <div className="bg-white border rounded-xl p-6 shadow-sm border-l-4 border-l-green-500">
            <h3 className="text-xl font-semibold mb-3 flex items-center">
              <ShieldCheck className="mr-2 text-green-600" /> Changement de mot de passe
            </h3>
            <p className="text-gray-700 mb-4">
              En tant que Régisseur Principal, vous avez des responsabilités étendues. <strong>Le changement de votre mot de passe initial est obligatoire</strong> pour garantir la sécurité du système.
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Dans le <strong>menu en haut de l'écran</strong>, cliquez sur votre nom.</li>
              <li>Un menu déroulant apparaît : sélectionnez <strong>Profil</strong>.</li>
              <li>Cliquez sur <strong>Changer mot de passe</strong>.</li>
              <li>Saisissez votre ancien mot de passe temporaire.</li>
              <li>Entrez votre nouveau mot de passe (minimum 8 caractères, recommandé 12+).</li>
              <li>Confirmez et enregistrez.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'role-responsabilites',
      title: '2. Votre Rôle et Responsabilités',
      content: (
        <div>
          <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
            <Award className="text-blue-600" /> Régisseur Principal
          </h2>
          <p className="text-gray-700 mb-6">
            Vous êtes le superviseur des régisseurs et percepteurs. Vous coordonnez les activités de collecte et validez les opérations financières.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <h4 className="font-bold mb-3 flex items-center gap-2 text-blue-900">
                <UserCheck className="size-5" /> Supervision
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Superviser les régisseurs et percepteurs</li>
                <li>• Gérer l'ouverture et clôture de leurs sessions</li>
                <li>• Contrôler leurs activités quotidiennes</li>
                <li>• Former et accompagner votre équipe</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <h4 className="font-bold mb-3 flex items-center gap-2 text-green-900">
                <DollarSign className="size-5" /> Gestion Financière
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Collecter les fonds des régisseurs</li>
                <li>• Valider les sessions de collecte</li>
                <li>• Vérifier la cohérence des montants</li>
                <li>• Générer les rapports de synthèse</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <h4 className="font-bold mb-3 flex items-center gap-2 text-purple-900">
                <ClipboardCheck className="size-5" /> Contrôle
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Vérifier l'utilisation des quittances</li>
                <li>• Contrôler les encaissements</li>
                <li>• Détecter les anomalies</li>
                <li>• Assurer la conformité des opérations</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
              <h4 className="font-bold mb-3 flex items-center gap-2 text-amber-900">
                <TrendingUp className="size-5" /> Analyse
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Analyser les performances de l'équipe</li>
                <li>• Suivre l'évolution des revenus</li>
                <li>• Identifier les tendances</li>
                <li>• Proposer des améliorations</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'sessions',
      title: '3. Gestion des Sessions',
      content: (
        <div>
          <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
            <PlayCircle className="text-blue-600" /> Ouverture et Clôture des Sessions
          </h2>
          <p className="text-gray-700 mb-6">
            Chaque régisseur et percepteur doit ouvrir une session avant de commencer la collecte et la clôturer en fin de journée. Vous êtes responsable de valider ces sessions.
          </p>

          <div className="space-y-6">
            <div className="bg-white border p-6 rounded-xl shadow-sm">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <PlayCircle className="size-5 text-green-600" /> Ouverture de session
              </h4>
              <p className="text-gray-700 mb-4">
                En début de journée, chaque collecteur doit ouvrir sa session de travail.
              </p>
              <ol className="list-decimal ml-6 space-y-2 text-gray-700">
                <li>Menu latéral → <strong>Sessions</strong> ou <strong>Gestion des Sessions</strong></li>
                <li>Cliquez sur <strong>Ouvrir une session</strong></li>
                <li>Sélectionnez le <strong>régisseur ou percepteur</strong> concerné</li>
                <li>Vérifiez que l'agent a bien des <strong>quittances disponibles</strong></li>
                <li>Définissez la <strong>date et heure de début</strong></li>
                <li>Validez l'ouverture</li>
              </ol>
              <div className="mt-4 bg-green-50 p-3 rounded border border-green-200 text-green-800">
                <p className="text-sm flex items-start gap-2">
                  <CheckCircle className="size-5 flex-shrink-0 mt-0.5" />
                  <span>Une fois la session ouverte, le régisseur peut commencer à enregistrer les paiements.</span>
                </p>
              </div>
            </div>

            <div className="bg-white border p-6 rounded-xl shadow-sm">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <StopCircle className="size-5 text-red-600" /> Clôture de session
              </h4>
              <p className="text-gray-700 mb-4">
                En fin de journée, vous devez clôturer les sessions et collecter les fonds.
              </p>
              <ol className="list-decimal ml-6 space-y-3 text-gray-700">
                <li>Menu latéral → <strong>Sessions</strong></li>
                <li>Consultez la liste des <strong>sessions actives</strong></li>
                <li>Sélectionnez la session à clôturer</li>
                <li>Vérifiez le récapitulatif automatique :
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Nombre de paiements enregistrés</li>
                    <li>Montant total collecté</li>
                    <li>Quittances utilisées</li>
                    <li>Période de la session</li>
                  </ul>
                </li>
                <li>Comptez physiquement l'argent remis par le régisseur</li>
                <li>Confirmez le <strong>montant reçu</strong> (doit correspondre au montant enregistré)</li>
                <li>En cas d'écart, notez-le et ajoutez un commentaire explicatif</li>
                <li>Validez la clôture de session</li>
              </ol>
            </div>

            <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
              <h4 className="font-bold mb-3 text-amber-900 flex items-center gap-2">
                <AlertTriangle className="size-5" /> Gestion des écarts
              </h4>
              <p className="text-gray-700 mb-3">
                Si le montant physique ne correspond pas au montant enregistré :
              </p>
              <ul className="space-y-2 text-gray-700 ml-6">
                <li>• Vérifiez les paiements enregistrés avec le régisseur</li>
                <li>• Recherchez d'éventuelles erreurs de saisie</li>
                <li>• Documentez l'écart dans le système</li>
                <li>• Signalez les écarts importants au Directeur</li>
                <li>• Conservez une trace écrite de la situation</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'validation-sessions',
      title: '4. Validation des Sessions',
      content: (
        <div>
          <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
            <ClipboardCheck className="text-blue-600" /> Contrôle et Validation
          </h2>
          <p className="text-gray-700 mb-6">
            Après la clôture, vous devez valider chaque session pour certifier que tout est conforme.
          </p>

          <div className="space-y-6">
            <div className="bg-white border p-6 rounded-xl shadow-sm">
              <h4 className="font-bold mb-4">Procédure de validation :</h4>
              <ol className="list-decimal ml-6 space-y-3 text-gray-700">
                <li>Menu latéral → <strong>Sessions à Valider</strong></li>
                <li>Consultez la liste des sessions clôturées en attente de validation</li>
                <li>Cliquez sur une session pour voir les détails complets</li>
                <li>Vérifiez les éléments suivants :
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Cohérence entre montant déclaré et montant collecté</li>
                    <li>Nombre de paiements enregistrés</li>
                    <li>Utilisation correcte des quittances</li>
                    <li>Absence d'anomalies (doublons, montants suspects)</li>
                    <li>Conformité avec les tarifs en vigueur</li>
                  </ul>
                </li>
                <li>Si tout est conforme :
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Cliquez sur <strong>Valider la session</strong></li>
                    <li>Ajoutez un commentaire si nécessaire</li>
                    <li>La session passe au statut "Validée"</li>
                  </ul>
                </li>
                <li>En cas de problème :
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Cliquez sur <strong>Rejeter</strong> ou <strong>Mettre en attente</strong></li>
                    <li>Indiquez clairement la raison du rejet</li>
                    <li>Contactez le régisseur pour correction</li>
                  </ul>
                </li>
              </ol>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h5 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="size-5" /> Session Validée
                </h5>
                <p className="text-sm text-gray-700">
                  Tout est conforme. Les fonds sont comptabilisés et la session est archivée.
                </p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h5 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                  <Clock className="size-5" /> En Attente
                </h5>
                <p className="text-sm text-gray-700">
                  Nécessite des vérifications supplémentaires ou des corrections mineures.
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h5 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                  <XCircle className="size-5" /> Rejetée
                </h5>
                <p className="text-sm text-gray-700">
                  Anomalies importantes. Le régisseur doit corriger et soumettre à nouveau.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'collecte-fonds',
      title: '5. Collecte des Fonds',
      content: (
        <div>
          <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
            <DollarSign className="text-blue-600" /> Réception et Gestion des Fonds
          </h2>
          <p className="text-gray-700 mb-6">
            Vous centralisez tous les fonds collectés par les régisseurs et percepteurs sous votre supervision.
          </p>

          <div className="space-y-6">
            <div className="bg-white border p-6 rounded-xl shadow-sm">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <Wallet className="size-5 text-green-600" /> Réception des fonds
              </h4>
              <ol className="list-decimal ml-6 space-y-2 text-gray-700">
                <li>À la clôture de session, le régisseur vous remet l'argent collecté</li>
                <li>Comptez soigneusement le montant physique</li>
                <li>Comparez avec le montant déclaré dans le système</li>
                <li>Enregistrez la réception dans le module <strong>Collecte des Fonds</strong></li>
                <li>Délivrez un reçu de remise au régisseur</li>
                <li>Rangez les fonds en sécurité (coffre ou caisse sécurisée)</li>
              </ol>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h4 className="font-bold mb-4">Traçabilité des fonds :</h4>
              <p className="text-gray-700 mb-3">
                Le système enregistre automatiquement :
              </p>
              <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>Date et heure de réception</div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>Régisseur ayant remis les fonds</div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>Montant exact reçu</div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>Session correspondante</div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>Numéro de reçu de remise</div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>Votre identité (Régisseur Principal)</div>
                </div>
              </div>
            </div>

            <div className="bg-white border p-6 rounded-xl shadow-sm">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <Lock className="size-5 text-red-600" /> Sécurisation des fonds
              </h4>
              <ul className="space-y-2 text-gray-700 ml-6">
                <li>• Stockez les fonds dans un lieu sécurisé (coffre-fort, caisse verrouillée)</li>
                <li>• Limitez l'accès à cette zone</li>
                <li>• Effectuez des comptages réguliers</li>
                <li>• Préparez les remises bancaires selon les procédures établies</li>
                <li>• Conservez une copie de tous les reçus de remise</li>
                <li>• Documentez tout transfert de fonds au Directeur ou à la banque</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'supervision-equipe',
      title: '6. Supervision de l\'Équipe',
      content: (
        <div>
          <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
            <Users className="text-blue-600" /> Gestion des Régisseurs et Percepteurs
          </h2>
          <p className="text-gray-700 mb-6">
            Suivez l'activité de votre équipe en temps réel et gérez leur performance.
          </p>

          <div className="space-y-6">
            <div className="bg-white border p-6 rounded-xl shadow-sm">
              <h4 className="font-bold mb-4">Vue d'ensemble de l'équipe :</h4>
              <ol className="list-decimal ml-6 space-y-2 text-gray-700">
                <li>Menu latéral → <strong>Mon Équipe</strong> ou <strong>Régisseurs</strong></li>
                <li>Consultez la liste de tous les régisseurs et percepteurs sous votre supervision</li>
                <li>Visualisez leur statut actuel :
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li><span className="text-green-600 font-semibold">En service :</span> Session active en cours</li>
                    <li><span className="text-gray-600 font-semibold">Hors service :</span> Pas de session active</li>
                    <li><span className="text-amber-600 font-semibold">En attente :</span> Session à clôturer ou valider</li>
                  </ul>
                </li>
              </ol>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <Eye className="size-5 text-blue-600" /> Suivi des performances
                </h4>
                <p className="text-gray-700 mb-3 text-sm">Pour chaque membre de l'équipe, consultez :</p>
                <ul className="space-y-2 text-sm text-gray-700 ml-4">
                  <li>• Nombre de paiements collectés aujourd'hui</li>
                  <li>• Montant total encaissé</li>
                  <li>• Nombre de quittances utilisées</li>
                  <li>• Taux de présence mensuel</li>
                  <li>• Historique des sessions</li>
                  <li>• Performance comparative</li>
                </ul>
              </div>

              <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <Receipt className="size-5 text-green-600" /> Gestion des quittances
                </h4>
                <p className="text-gray-700 mb-3 text-sm">Surveillez l'utilisation des quittances :</p>
                <ul className="space-y-2 text-sm text-gray-700 ml-4">
                  <li>• Quittances disponibles par agent</li>
                  <li>• Quittances utilisées</li>
                  <li>• Alertes stock faible</li>
                  <li>• Demandes de nouvelles attributions</li>
                  <li>• Historique d'utilisation</li>
                </ul>
              </div>
            </div>

            <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
              <h4 className="font-bold mb-3 text-amber-900 flex items-center gap-2">
                <AlertCircle className="size-5" /> Alertes et Notifications
              </h4>
              <p className="text-gray-700 mb-3">Le système vous alerte automatiquement en cas de :</p>
              <ul className="space-y-2 text-gray-700 ml-6">
                <li>• Session ouverte depuis plus de 12 heures (régisseur n'a pas clôturé)</li>
                <li>• Écart important entre montant déclaré et historique du régisseur</li>
                <li>• Quittances épuisées pour un agent</li>
                <li>• Paiements suspects ou montants anormaux</li>
                <li>• Performance inhabituellement basse</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tableau-bord',
      title: '7. Tableau de Bord',
      content: (
        <div>
          <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
            <LayoutDashboard className="text-blue-600" /> Vue d'Ensemble Globale
          </h2>
          <p className="text-gray-700 mb-6">
            Accédez à une vue consolidée de toutes les activités sous votre responsabilité.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <TrendingUp className="size-5 text-blue-700" /> Activité du Jour
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Sessions actives en cours</li>
                <li>• Total encaissé aujourd'hui (tous régisseurs)</li>
                <li>• Nombre total de paiements</li>
                <li>• Fonds collectés et en attente</li>
                <li>• Sessions à clôturer</li>
                <li>• Sessions à valider</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <Users className="size-5 text-green-700" /> Équipe
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Régisseurs en service</li>
                <li>• Percepteurs actifs</li>
                <li>• Taux de présence de l'équipe</li>
                <li>• Performance moyenne</li>
                <li>• Alertes actives</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <Banknote className="size-5 text-purple-700" /> Finances
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Total des fonds en votre possession</li>
                <li>• Montants par session validée</li>
                <li>• Écarts détectés (si applicable)</li>
                <li>• Remises bancaires effectuées</li>
                <li>• Évolution des revenus (semaine/mois)</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <MapPin className="size-5 text-amber-700" /> Marchés
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Marchés sous votre supervision</li>
                <li>• Taux d'occupation global</li>
                <li>• Marchands actifs aujourd'hui</li>
                <li>• Revenus par marché/zone</li>
                <li>• Performance comparative</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'rapports',
      title: '8. Rapports et Analyses',
      content: (
        <div>
          <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
            <FileText className="text-blue-600" /> Génération de Rapports
          </h2>
          <p className="text-gray-700 mb-6">
            Créez des rapports détaillés pour le suivi, l'analyse et la transmission au Directeur.
          </p>

          <div className="space-y-6">
            <div className="bg-white border p-6 rounded-xl shadow-sm">
              <h4 className="font-bold mb-4">Types de rapports disponibles :</h4>
              <div className="space-y-3">
                <div className="border-l-4 border-l-blue-500 pl-4 py-3 bg-blue-50">
                  <h5 className="font-semibold text-blue-800 mb-1">Rapport de Consolidation Journalière</h5>
                  <p className="text-sm text-gray-700">
                    Synthèse complète de toutes les collectes du jour : montants totaux, sessions validées, 
                    fonds collectés, répartition par régisseur.
                  </p>
                </div>

                <div className="border-l-4 border-l-green-500 pl-4 py-3 bg-green-50">
                  <h5 className="font-semibold text-green-800 mb-1">Rapport par Régisseur</h5>
                  <p className="text-sm text-gray-700">
                    Performance individuelle : nombre de paiements, montants collectés, quittances utilisées, 
                    taux de présence, évolution sur la période.
                  </p>
                </div>

                <div className="border-l-4 border-l-purple-500 pl-4 py-3 bg-purple-50">
                  <h5 className="font-semibold text-purple-800 mb-1">Rapport de Validation</h5>
                  <p className="text-sm text-gray-700">
                    État des sessions : validées, en attente, rejetées, écarts détectés, 
                    commentaires et actions correctives.
                  </p>
                </div>

                <div className="border-l-4 border-l-amber-500 pl-4 py-3 bg-amber-50">
                  <h5 className="font-semibold text-amber-800 mb-1">Rapport Mensuel de Performance</h5>
                  <p className="text-sm text-gray-700">
                    Analyse approfondie : évolution des revenus, comparaison avec les mois précédents, 
                    performance de l'équipe, recommandations.
                  </p>
                </div>

                <div className="border-l-4 border-l-red-500 pl-4 py-3 bg-red-50">
                  <h5 className="font-semibold text-red-800 mb-1">Rapport d'Anomalies</h5>
                  <p className="text-sm text-gray-700">
                    Liste des écarts, sessions rejetées, quittances manquantes, 
                    paiements suspects nécessitant attention.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                <h5 className="font-bold mb-2 flex items-center gap-2">
                  <FileText className="size-5 text-blue-600" /> Export PDF
                </h5>
                <p className="text-sm text-gray-700">
                  Pour les rapports officiels, présentations et archivage
                </p>
              </div>
              <div className="bg-green-50 p-5 rounded-lg border border-green-200">
                <h5 className="font-bold mb-2 flex items-center gap-2">
                  <FileSpreadsheet className="size-5 text-green-600" /> Export Excel
                </h5>
                <p className="text-sm text-gray-700">
                  Pour l'analyse approfondie, tableaux croisés dynamiques
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'consultation',
      title: '9. Consultation et Recherche',
      content: (
        <div>
          <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
            <Search className="text-blue-600" /> Accès aux Informations
          </h2>
          <p className="text-gray-700 mb-6">
            En tant que Régisseur Principal, vous avez accès à un large éventail d'informations.
          </p>

          <div className="space-y-6">
            <div className="bg-white border p-6 rounded-xl shadow-sm">
              <h4 className="font-bold mb-4">Données consultables :</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border p-4 rounded-lg bg-gray-50">
                  <h5 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="size-5 text-blue-600" /> Marchands
                  </h5>
                  <p className="text-sm text-gray-700">
                    Informations complètes, historique de paiements, places occupées, tarifs applicables
                  </p>
                </div>

                <div className="border p-4 rounded-lg bg-gray-50">
                  <h5 className="font-semibold mb-2 flex items-center gap-2">
                    <Receipt className="size-5 text-blue-600" /> Paiements
                  </h5>
                  <p className="text-sm text-gray-700">
                    Tous les paiements enregistrés par votre équipe avec filtres avancés
                  </p>
                </div>

                <div className="border p-4 rounded-lg bg-gray-50">
                  <h5 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="size-5 text-blue-600" /> Régisseurs
                  </h5>
                  <p className="text-sm text-gray-700">
                    Profils, performances, historiques de sessions, quittances attribuées
                  </p>
                </div>

                <div className="border p-4 rounded-lg bg-gray-50">
                  <h5 className="font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="size-5 text-blue-600" /> Places
                  </h5>
                  <p className="text-sm text-gray-700">
                    État d'occupation, tarifs, historique d'attribution, revenus générés
                  </p>
                </div>

                <div className="border p-4 rounded-lg bg-gray-50">
                  <h5 className="font-semibold mb-2 flex items-center gap-2">
                    <History className="size-5 text-blue-600" /> Sessions
                  </h5>
                  <p className="text-sm text-gray-700">
                    Historique complet : ouvertes, clôturées, validées, avec détails financiers
                  </p>
                </div>

                <div className="border p-4 rounded-lg bg-gray-50">
                  <h5 className="font-semibold mb-2 flex items-center gap-2">
                    <Ticket className="size-5 text-blue-600" /> Quittances
                  </h5>
                  <p className="text-sm text-gray-700">
                    Toutes les quittances attribuées à votre équipe, statuts, utilisation
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <Search className="size-5" /> Recherche Avancée
              </h4>
              <p className="text-gray-700 mb-3">Utilisez les filtres pour affiner vos recherches :</p>
              <ul className="space-y-2 text-gray-700 ml-6 text-sm">
                <li>• Par date (jour, semaine, mois, période personnalisée)</li>
                <li>• Par régisseur ou percepteur</li>
                <li>• Par marché, zone ou hall</li>
                <li>• Par statut (validé, en attente, rejeté)</li>
                <li>• Par montant (plage de valeurs)</li>
                <li>• Par marchand spécifique</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'notes',
      title: '10. Notes et Mémos',
      content: (
        <div>
          <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
            <StickyNote className="text-yellow-500" /> Bloc-notes Personnel
          </h2>
          <p className="text-gray-700 mb-4">
            Conservez vos notes de supervision, observations et rappels importants.
          </p>
          <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 shadow-inner">
            <h4 className="font-bold mb-3">Comment accéder à vos notes :</h4>
            <ol className="list-decimal ml-6 space-y-2 text-gray-800">
              <li>Cliquez sur votre nom dans le <strong>menu en haut de l'écran</strong>.</li>
              <li>Dans le menu déroulant, sélectionnez <strong>Note</strong>.</li>
              <li>Rédigez vos notes de supervision, observations sur l'équipe, rappels, etc.</li>
              <li>Vos notes sont automatiquement enregistrées et restent privées.</li>
            </ol>
            <div className="mt-4 bg-yellow-100 p-3 rounded text-sm text-yellow-800">
              <strong>Suggestions d'utilisation :</strong>
              <ul className="mt-2 space-y-1 ml-4">
                <li>• Points à discuter avec le Directeur</li>
                <li>• Observations sur les performances de l'équipe</li>
                <li>• Anomalies récurrentes à surveiller</li>
                <li>• Formations ou accompagnements à prévoir</li>
                <li>• Améliorations de processus à proposer</li>
              </ul>
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
            <ListChecks className="text-blue-600" /> Recommandations pour une Supervision Efficace
          </h2>
          
          <div className="space-y-6">
            <div className="bg-green-50 border-l-4 border-l-green-500 p-6 rounded-r-xl">
              <h4 className="font-bold text-green-800 mb-3">✓ BONNES PRATIQUES</h4>
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold text-green-900 mb-2">Gestion des Sessions</h5>
                  <ul className="space-y-1 text-gray-700 ml-4 text-sm">
                    <li>• Ouvrez les sessions en début de journée de manière systématique</li>
                    <li>• Vérifiez que chaque régisseur a suffisamment de quittances</li>
                    <li>• Clôturez les sessions le jour même, pas le lendemain</li>
                    <li>• Comptez physiquement l'argent devant le régisseur</li>
                    <li>• Validez les sessions dans les 24h maximum</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-semibold text-green-900 mb-2">Contrôle et Validation</h5>
                  <ul className="space-y-1 text-gray-700 ml-4 text-sm">
                    <li>• Vérifiez systématiquement la cohérence montant déclaré / montant reçu</li>
                    <li>• Consultez l'historique du régisseur avant validation</li>
                    <li>• Documentez tous les écarts, même minimes</li>
                    <li>• Établissez un dialogue avec le régisseur en cas de problème</li>
                    <li>• Ne validez jamais une session sans l'avoir examinée</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-semibold text-green-900 mb-2">Sécurité Financière</h5>
                  <ul className="space-y-1 text-gray-700 ml-4 text-sm">
                    <li>• Sécurisez les fonds immédiatement après réception</li>
                    <li>• Effectuez des comptages réguliers de caisse</li>
                    <li>• Limitez le montant maximum en caisse</li>
                    <li>• Planifiez les remises bancaires régulièrement</li>
                    <li>• Conservez tous les reçus et justificatifs</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-semibold text-green-900 mb-2">Supervision d'Équipe</h5>
                  <ul className="space-y-1 text-gray-700 ml-4 text-sm">
                    <li>• Consultez le tableau de bord chaque matin</li>
                    <li>• Surveillez les alertes et agissez rapidement</li>
                    <li>• Communiquez régulièrement avec votre équipe</li>
                    <li>• Formez les nouveaux régisseurs systématiquement</li>
                    <li>• Reconnaissez les bonnes performances</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border-l-4 border-l-red-500 p-6 rounded-r-xl">
              <h4 className="font-bold text-red-800 mb-3">✗ À ÉVITER ABSOLUMENT</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• Ne laissez jamais une session ouverte sans surveillance prolongée</li>
                <li>• N'acceptez pas les fonds sans comptage immédiat</li>
                <li>• Ne validez pas une session avec écart non documenté</li>
                <li>• N'attendez pas plusieurs jours pour clôturer les sessions</li>
                <li>• Ne stockez pas les fonds dans un lieu non sécurisé</li>
                <li>• Ne négligez pas les alertes du système</li>
                <li>• N'omettez pas de générer les rapports réguliers</li>
                <li>• Ne cachez pas les problèmes au Directeur</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <Clock className="size-5" /> Organisation Quotidienne Recommandée
              </h4>
              <div className="space-y-3 text-gray-700">
                <div className="flex gap-3">
                  <span className="font-semibold min-w-fit text-blue-900">Début de journée :</span>
                  <span>Consulter le tableau de bord, ouvrir les sessions des régisseurs, vérifier les quittances disponibles</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-semibold min-w-fit text-blue-900">Milieu de journée :</span>
                  <span>Surveiller les sessions actives, répondre aux alertes, être disponible pour l'équipe</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-semibold min-w-fit text-blue-900">Fin de journée :</span>
                  <span>Clôturer les sessions, collecter les fonds, comptage et validation, générer rapport journalier</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-semibold min-w-fit text-blue-900">Hebdomadaire :</span>
                  <span>Analyser les performances, rapport hebdomadaire au Directeur, réunion d'équipe</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-semibold min-w-fit text-blue-900">Mensuel :</span>
                  <span>Rapport mensuel complet, évaluation de l'équipe, planification du mois suivant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <main className="flex-1 transition-all duration-300">
        <div className="w-full p-8 max-w-full">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12 border-b pb-6">
              <h1 className="text-5xl font-extralight text-slate-800">Guide du Régisseur Principal</h1>
              <p className="text-slate-500 mt-2 italic">
                Manuel de supervision, validation des sessions et gestion de la collecte des fonds.
              </p>
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
              <h3 className="text-xl font-bold mb-3">Support et Communication</h3>
              <p className="text-blue-100 mb-4">
                En tant que Régisseur Principal, vous êtes le lien entre le terrain et la direction. 
                N'hésitez pas à communiquer régulièrement avec :
              </p>
              <ul className="text-blue-100 space-y-1 ml-4">
                <li>• Le Directeur pour les rapports et décisions stratégiques</li>
                <li>• Votre équipe de régisseurs pour le suivi quotidien</li>
                <li>• Le support technique en cas de problème système</li>
              </ul>
              <p className="text-blue-100 mt-4 text-sm italic">
                Votre rôle de supervision est crucial pour la bonne marche du système de collecte.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HelpPageRegisseurPrincipal;