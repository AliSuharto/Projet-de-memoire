'use client';
import React from 'react';
import { 
  ShieldCheck, Map, Users, UserPlus, ArrowRightLeft, 
  Ticket, Banknote, Calendar, StickyNote, AlertTriangle, 
  PlusCircle, FileSpreadsheet, LayoutDashboard, 
  FileText, Settings, TrendingUp, Search, Download,
  CheckCircle,
  FileDown,
  Building2,
  BarChart3
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

const HelpPage: React.FC = () => {

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
              Pour garantir la sécurité de votre compte, <strong>le changement de votre mot de passe initial est obligatoire</strong> avant de commencer à utiliser le logiciel.
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Dans le <strong>menu en haut de l&apos;écran</strong>, cliquez sur votre nom d&apos;utilisateur.</li>
              <li>Un menu déroulant apparaît : sélectionnez <strong>Mon profil</strong>.</li>
              <li> Dans l&apos;onglet <strong>Sécurité</strong>, Cliquez sur le bouton <strong>Changer mot de passe</strong>.</li>
              <li>Saisissez votre ancien mot de passe, puis votre nouveau mot de passe (minimum 8 caractères recommandés).</li>
              <li>Confirmez votre nouveau mot de passe et enregistrez.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
  id: 'Sessions',
  title: '2. Visualisation des sessions',
  content: (
    <div>
      <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
        <Map className="text-blue-600" /> Gestion et Suivi des Sessions
      </h2>

      <p className="text-gray-700 mb-6">
        Consultez et analysez l’ensemble des sessions enregistrées dans le système.
        Vous pouvez visualiser leur statut, les montants collectés ainsi que les paiements
        effectués pour chaque session.
      </p>

      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-6">
        <h4 className="font-bold mb-3 flex items-center">
          <PlusCircle className="mr-2 size-5" /> Comment visualiser les sessions :
        </h4>

        <ol className="list-decimal ml-6 space-y-2 text-gray-700">
          <li>
            Dans le <strong>menu latéral gauche</strong>, cliquez sur <strong>Sessions</strong>.
          </li>
          <li>
            Consultez la liste des sessions affichées avec leur <strong>statut</strong>
            (en cours, clôturée, annulée, etc.).
          </li>
          <li>
            Visualisez les <strong>montants collectés</strong> pour chaque session.
          </li>
          <li>
            Consultez le détail des <strong>paiements effectués</strong> associés à chaque session.
          </li>
          <li>
            Utilisez la <strong>barre de recherche</strong> pour filtrer et retrouver rapidement
            une session spécifique.
          </li>
        </ol>
      </div>

      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-amber-800">
        <p className="text-sm flex items-start gap-2">
          <AlertTriangle className="size-5 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Conseil :</strong> Vérifiez régulièrement les montants collectés et les paiements
            afin d’assurer un suivi financier précis et éviter toute incohérence.
          </span>
        </p>
      </div>
    </div>
  )
},
{
  id: 'validation-sessions',
  title: '3. Validation des Sessions',
  content: (
    <div>
      <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
        <CheckCircle className="text-blue-600" /> Validation des Sessions
      </h2>

      <p className="text-gray-700 mb-6">
        Cette section permet de contrôler et valider les sessions après vérification
        des montants collectés. Elle garantit la cohérence financière entre les
        sommes déclarées dans le système et les montants réellement reçus.
      </p>

      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-6">
        <h4 className="font-bold mb-3 flex items-center">
          <CheckCircle className="mr-2 size-5" /> Comment accéder à la validation :
        </h4>

        <ol className="list-decimal ml-6 space-y-2 text-gray-700">
          <li>
            Dans le <strong>menu latéral gauche</strong>, cliquez sur <strong>Valider Session</strong>.
          </li>
          <li>
            Consultez la liste des <strong>sessions en attente de validation</strong>.
          </li>
          <li>
            Sélectionnez une session pour afficher les détails : montants collectés,
            paiements enregistrés et informations associées.
          </li>
          <li>
            Après vérification, cliquez sur <strong>Valider</strong> pour confirmer la session.
          </li>
        </ol>
      </div>

      <div className="border p-5 rounded-lg bg-white mb-6">
        <h4 className="font-bold mb-3">Contrôles à effectuer avant validation :</h4>
        <ul className="space-y-2 text-gray-700 ml-4">
          <li>
            • Vérifier que le <strong>montant affiché à l’écran</strong> correspond au montant physique reçu.
          </li>
          <li>
            • Vérifier que tous les <strong>paiements enregistrés</strong> sont complets et exacts.
          </li>
          <li>
            • S’assurer qu’aucune anomalie ou incohérence n’est présente dans les données.
          </li>
        </ul>
      </div>

      <div className="p-4 bg-red-50 text-red-800 rounded-lg text-sm border border-red-200">
        <strong>⚠️ Attention :</strong> Une session ne doit jamais être validée si 
        l’argent n’a pas encore été reçu ou si le montant reçu ne correspond pas 
        exactement au montant affiché à l’écran.  
        La validation confirme officiellement la conformité financière de la session.
      </div>

    </div>
  )
},






    {
  id: 'utilisateurs',
  title: '4. Agents Recouvreurs',
  content: (
    <div>
      <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
        <Users className="text-blue-600" /> Consultation des Agents Recouvreurs
      </h2>

      <p className="text-gray-700 mb-4">
        L’onglet <strong>Agents Recouvreurs</strong> permet de visualiser les différents
        régisseurs et percepteurs enregistrés dans le système, ainsi que les informations
        liées à leurs responsabilités.
      </p>

      <div className="space-y-4">

        <div className="border p-5 rounded-lg bg-white">
          <h4 className="font-bold mb-3">Informations disponibles :</h4>
          <ul className="space-y-2 text-gray-700 ml-4">
            <li>
              <strong>• Liste des Régisseurs et Percepteurs :</strong> Affichage des agents selon leur rôle.
            </li>
            <li>
              <strong>• Zones d’intervention :</strong> Consultation des zones ou marchés
              dans lesquels chaque agent exerce sa fonction.
            </li>
            <li>
              <strong>• Responsable de création :</strong> Visualisation de l’utilisateur
              ayant créé le compte afin d’identifier le responsable hiérarchique.
            </li>
          </ul>
        </div>

        <div className="border p-5 rounded-lg bg-white">
          <h4 className="font-bold mb-3">Objectif de cette section :</h4>
          <p className="text-gray-700">
            Cette interface est destinée à la <strong>consultation uniquement</strong>.
            Elle permet de mieux comprendre l’organisation des responsabilités
            au sein des marchés et d’identifier rapidement quel agent est affecté
            à un marché spécifique.
          </p>
        </div>

        <div className="p-4 bg-amber-50 text-amber-800 rounded-lg text-sm border border-amber-200">
          <strong>Important :</strong> Aucun droit de modification, de suppression
          ou de gestion des comptes n’est autorisé dans cette section.
          Elle est exclusivement dédiée à la visualisation des informations.
        </div>

      </div>
    </div>
  )
},

    {
  id: 'etat-versements',
  title: '5. États de Versements',
  content: (
    <div>
      <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
        <FileText className="text-blue-600" /> États de Versements
      </h2>

      <p className="text-gray-700 mb-6">
        Cette section permet de consulter ou télécharger l’état détaillé d’une session.
        Elle offre une vue synthétique et structurée des informations financières
        liées aux versements effectués.
      </p>

      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-6">
        <h4 className="font-bold mb-3 flex items-center">
          <FileDown className="mr-2 size-5" /> Comment accéder aux états de versements :
        </h4>

        <ol className="list-decimal ml-6 space-y-2 text-gray-700">
          <li>
            Dans le <strong>menu latéral gauche</strong>, cliquez sur <strong>États de versements</strong>.
          </li>
          <li>
            Consultez la liste des sessions disponibles.
          </li>
          <li>
            Sélectionnez une session pour <strong>visualiser son état détaillé</strong>.
          </li>
          <li>
            Si nécessaire, cliquez sur <strong>Télécharger</strong> pour obtenir le document
            au format exportable (PDF ou autre format disponible).
          </li>
        </ol>
      </div>

      <div className="border p-5 rounded-lg bg-white mb-6">
        <h4 className="font-bold mb-3">Informations disponibles dans l’état :</h4>
        <ul className="space-y-2 text-gray-700 ml-4">
          <li>
            • <strong>Session concernée</strong> (date, référence, statut).
          </li>
          <li>
            • <strong>Montants collectés</strong> durant la session.
          </li>
          <li>
            • <strong>Motifs des paiements</strong> enregistrés.
          </li>
          <li>
            • <strong>Quittances utilisées</strong> pour les encaissements.
          </li>
          <li>
            • Récapitulatif global du versement.
          </li>
        </ul>
      </div>

      <div className="p-4 bg-amber-50 text-amber-800 rounded-lg text-sm border border-amber-200">
        <strong>Important :</strong> Vérifiez attentivement les informations affichées
        avant tout téléchargement afin de garantir l’exactitude des données
        financières présentées dans l’état de versement.
      </div>

    </div>
  )
},

   {
  id: 'marches',
  title: '6. Vue Globale des Marchés',
  content: (
    <div>
      <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
        <Building2 className="text-blue-600" /> Suivi des Marchés
      </h2>

      <p className="text-gray-700 mb-6">
        Cette page permet d’obtenir une vue d’ensemble de tous les marchés existants.
        Elle fournit des indicateurs financiers et opérationnels pour analyser
        la performance de chaque marché.
      </p>

      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-6">
        <h4 className="font-bold mb-3 flex items-center">
          <BarChart3 className="mr-2 size-5" /> Comment accéder aux marchés :
        </h4>

        <ol className="list-decimal ml-6 space-y-2 text-gray-700">
          <li>
            Dans le <strong>menu latéral gauche</strong>, cliquez sur <strong>Marchés</strong>.
          </li>
          <li>
            Consultez la liste complète des marchés enregistrés.
          </li>
          <li>
            Sélectionnez un marché pour afficher ses indicateurs détaillés.
          </li>
        </ol>
      </div>

      <div className="border p-5 rounded-lg bg-white mb-6">
        <h4 className="font-bold mb-3">Indicateurs disponibles :</h4>
        <ul className="space-y-2 text-gray-700 ml-4">
          <li>
            • <strong>Montant collecté :</strong> Total des sommes encaissées pour le marché.
          </li>
          <li>
            • <strong>Retards :</strong> Nombre ou montant des paiements non réglés dans les délais.
          </li>
          <li>
            • <strong>Taux de perception :</strong> Pourcentage des montants effectivement collectés
            par rapport aux montants attendus.
          </li>
          <li>
            • Statut global du marché (actif, en difficulté, performant, etc.).
          </li>
        </ul>
      </div>

      <div className="p-4 bg-amber-50 text-amber-800 rounded-lg text-sm border border-amber-200">
        <strong>Analyse recommandée :</strong> Utilisez ces indicateurs pour identifier
        les marchés performants et ceux nécessitant un suivi renforcé.
        Le taux de perception et les retards sont des éléments clés pour
        l’évaluation financière.
      </div>

    </div>
  )
},

    {
      id: 'notes-personnelles',
      title: '10. Notes et Mémos',
      content: (
        <div>
          <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
            <StickyNote className="text-yellow-500" /> Bloc-notes Personnel
          </h2>
          <p className="text-gray-700 mb-4">
            Gardez une trace de vos tâches et informations importantes.
          </p>
          <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 shadow-inner">
            <h4 className="font-bold mb-3">Comment accéder à vos notes :</h4>
            <ol className="list-decimal ml-6 space-y-2 text-gray-800">
              <li>Cliquez sur votre nom dans le <strong>menu en haut de l&apos;écran</strong>.</li>
              <li>Dans le menu déroulant, sélectionnez <strong>Note</strong>.</li>
              <li>Rédigez vos notes personnelles et mémos de gestion.</li>
              <li>Vos notes sont automatiquement enregistrées et restent privées.</li>
            </ol>
          </div>
        </div>
      )
    },
    
  ];

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <main className="flex-1 transition-all duration-300">
        <div className="w-full p-8 max-w-full">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12 border-b pb-6">
              <h1 className="text-5xl font-extralight text-slate-800">Guide du Regisseur Principal</h1>
              <p className="text-slate-500 mt-2 italic">Manuel de configuration et de gestion du logiciel de gestion des marchés.</p>
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

            <div className="mt-16 p-6 bg-blue-900 text-white rounded-xl">
              <h3 className="text-xl font-bold mb-3">Besoin d&apos;aide supplémentaire ?</h3>
              <p className="text-blue-100">
                Si vous rencontrez des difficultés ou avez des questions non couvertes par ce guide, 
                n&apos;hésitez pas à contacter le support technique ou à consulter la documentation complète du logiciel.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HelpPage;