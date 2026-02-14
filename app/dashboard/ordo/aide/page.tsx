'use client';
import React from 'react';
import { 
  ShieldCheck, Map, Users, UserPlus, ArrowRightLeft, 
  Ticket, Banknote, Calendar, StickyNote, AlertTriangle, 
  PlusCircle, FileSpreadsheet, LayoutDashboard, 
  FileText, Settings, TrendingUp, Search, Download
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
              <li>Un menu déroulant apparaît : sélectionnez <strong>Profil</strong>.</li>
              <li>Cliquez sur le bouton <strong>Changer mot de passe</strong>.</li>
              <li>Saisissez votre ancien mot de passe, puis votre nouveau mot de passe (minimum 8 caractères recommandés).</li>
              <li>Confirmez votre nouveau mot de passe et enregistrez.</li>
            </ul>
          </div>
        </div>
      )
    },
   {
  id: 'marches',
  title: '2. Visualisation des Marchés',
  content: (
    <div>
      <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
        <Map className="text-blue-600" /> Vue d’ensemble des Marchés
      </h2>

      <p className="text-gray-700 mb-6">
        Cette section permet à l’ordonnateur de consulter l’état global des marchés communaux.
        Aucune modification structurelle n’est autorisée depuis cette interface.
      </p>

      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-6">
        <h4 className="font-bold mb-3">Informations disponibles :</h4>
        <ul className="list-disc ml-6 space-y-2 text-gray-700">
          <li>• Liste complète des marchés existants</li>
          <li>• Montants collectés par marché</li>
          <li>• Retards enregistrés</li>
          <li>• Taux de perception</li>
          <li>• Statut général du marché</li>
        </ul>
      </div>

      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-amber-800">
        <p className="text-sm">
          <strong>Consultation uniquement :</strong> L’ordonnateur ne peut ni créer,
          ni modifier la structure des marchés.
        </p>
      </div>
    </div>
  )
},
{
  id: 'utilisateurs',
  title: '3. Gestion du Responsable de Marché',
  content: (
    <div>
      <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
        <Users className="text-blue-600" /> Création du Responsable
      </h2>

      <p className="text-gray-700 mb-4">
        L’ordonnateur a pour rôle principal de créer le compte du responsable
        de l’organisation du marché communal.
      </p>

      <div className="border p-5 rounded-lg bg-white mb-6">
        <h4 className="font-bold mb-3">Comment créer le responsable :</h4>
        <ol className="list-decimal ml-6 space-y-2 text-gray-700">
          <li>Menu latéral → <strong>Parametre</strong></li>
          <li>Cliquez sur <strong>Créer PRMC</strong></li>
          <li>Renseignez les informations (nom, email, rôle)</li>
          <li>Attribuez le marché concerné</li>
          <li>Enregistrez</li>
        </ol>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-gray-700">
        Après la création du responsable, l’ordonnateur dispose uniquement
        d’un droit de <strong>visualisation</strong> des utilisateurs existants.
      </div>
    </div>
  )
},
{
  id: 'marchands',
  title: '4. Visualisation des Marchands',
  content: (
    <div>
      <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
        <UserPlus className="text-blue-600" /> Consultation des Marchands
      </h2>

      <p className="text-gray-700 mb-6">
        Cette section permet de consulter les marchands enregistrés
        dans les différents marchés communaux.
      </p>

      <div className="border p-5 rounded-lg bg-white mb-6">
        <h4 className="font-bold mb-3">Informations consultables :</h4>
        <ul className="space-y-2 text-gray-700 ml-4">
          <li>• Liste des marchands par marché</li>
          <li>• Places attribuées</li>
          <li>• Statut du marchand</li>
          <li>• Informations contractuelles principales</li>
        </ul>
      </div>

      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-amber-800 text-sm">
        <strong>Accès en lecture seule :</strong> L’ordonnateur ne peut ni ajouter,
        ni modifier, ni supprimer un marchand.
      </div>
    </div>
  )
},

    
    {
      id: 'rapports',
      title: '8. Rapports et Statistiques',
      content: (
        <div>
          <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
            <TrendingUp className="text-blue-600" /> Suivi et Analyse
          </h2>
          <p className="text-gray-700 mb-6">
            Consultez les rapports financiers et les statistiques de vos marchés.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border p-5 rounded-lg bg-white">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <LayoutDashboard className="size-5 text-blue-600" /> Tableau de bord
              </h4>
              <p className="text-sm text-gray-700">
                Accédez à une vue d&apos;ensemble de l&apos;activité : encaissements du jour, marchands actifs, places occupées, etc.
              </p>
            </div>
            <div className="border p-5 rounded-lg bg-white">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <FileText className="size-5 text-blue-600" /> Rapports détaillés
              </h4>
              <p className="text-sm text-gray-700">
                Générez des rapports par période, par marché, par régisseur ou par marchand pour analyser les performances.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'recherche',
      title: '9. Recherche et Consultation',
      content: (
        <div>
          <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
            <Search className="text-blue-600" /> Recherche d&apos;Informations
          </h2>
          <div className="bg-white border p-6 rounded-xl shadow-sm">
            <p className="text-gray-700 mb-4">
              Utilisez la fonction de recherche pour retrouver rapidement :
            </p>
            <ul className="space-y-2 text-gray-700 ml-6">
              <li>• Un marchand spécifique (par nom, numéro, ou place)</li>
              <li>• Une place dans un marché</li>
              <li>• Les transactions d&apos;un régisseur</li>
              <li>• Les paiements d&apos;un marchand</li>
              <li>• L&apos;historique d&apos;une quittance</li>
            </ul>
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
    {
      id: 'export',
      title: '11. Exports et Sauvegardes',
      content: (
        <div>
          <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
            <Download className="text-blue-600" /> Exportation des Données
          </h2>
          <div className="bg-white border p-6 rounded-xl shadow-sm">
            <p className="text-gray-700 mb-4">
              Exportez vos données pour archivage ou analyse externe :
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="font-bold min-w-fit">• Format Excel :</span>
                <span>Pour les listes de marchands, places, et transactions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold min-w-fit">• Format PDF :</span>
                <span>Pour les rapports et documents officiels</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold min-w-fit">• Impression :</span>
                <span>Imprimez directement depuis le logiciel pour les archives papier</span>
              </li>
            </ul>
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
              <h1 className="text-5xl font-extralight text-slate-800">Guide du De l&apos;Ordonnateur</h1>
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