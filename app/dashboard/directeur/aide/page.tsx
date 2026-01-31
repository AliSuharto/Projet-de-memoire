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
              <li>Dans le <strong>menu en haut de l'écran</strong>, cliquez sur votre nom d'utilisateur.</li>
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
      title: '2. Création des Marchés',
      content: (
        <div>
          <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
            <Map className="text-blue-600" /> Organisation des Marchés
          </h2>
          <p className="text-gray-700 mb-6">
            Définissez l'espace physique de vos marchés en créant une structure organisée en zones, halls et places.
          </p>
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-6">
             <h4 className="font-bold mb-3 flex items-center"><PlusCircle className="mr-2 size-5" /> Comment créer un marché :</h4>
             <ol className="list-decimal ml-6 space-y-2 text-gray-700">
               <li>Dans le <strong>menu latéral gauche</strong>, cliquez sur <strong>Marchés</strong>.</li>
               <li>Cliquez sur le bouton <strong>Créer</strong> en haut à droite.</li>
               <li>Remplissez les informations du marché (nom, adresse, etc.).</li>
               <li>Ajoutez des <strong>Zones</strong> pour diviser votre marché en secteurs.</li>
               <li>Dans chaque zone, créez des <strong>Halls</strong> si nécessaire.</li>
               <li>Ajoutez des <strong>Places</strong> individuelles dans chaque hall ou zone.</li>
             </ol>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-amber-800">
            <p className="text-sm flex items-start gap-2">
              <AlertTriangle className="size-5 flex-shrink-0 mt-0.5" />
              <span><strong>Important :</strong> Organisez bien votre structure dès le départ. Une fois les places attribuées, les modifications seront plus complexes.</span>
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'utilisateurs',
      title: '3. Gestion du Personnel',
      content: (
        <div>
          <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
            <Users className="text-blue-600" /> Gestion des Utilisateurs
          </h2>
          <p className="text-gray-700 mb-4">
            En tant que Directeur, vous êtes le seul à pouvoir créer et gérer les comptes de vos collaborateurs.
          </p>
          <div className="space-y-4">
            <div className="border p-5 rounded-lg bg-white">
              <h4 className="font-bold mb-3">Les différents rôles :</h4>
              <ul className="space-y-2 text-gray-700 ml-4">
                <li><strong>• Régisseurs :</strong> Gèrent les encaissements quotidiens et les opérations sur le terrain.</li>
                <li><strong>• Régisseurs Principaux :</strong> Supervisent les régisseurs et ont des droits étendus.</li>
                <li><strong>• Percepteurs :</strong> Collectent les paiements et gèrent les quittances.</li>
              </ul>
            </div>
            <div className="border p-5 rounded-lg bg-white">
              <h4 className="font-bold mb-3">Comment ajouter un utilisateur :</h4>
              <ol className="list-decimal ml-6 space-y-2 text-gray-700">
                <li>Dans le menu latéral, cliquez sur <strong>Utilisateurs</strong>.</li>
                <li>Cliquez sur <strong>Ajouter</strong>.</li>
                <li>Remplissez les informations (nom, prénom, email, rôle).</li>
                <li>Définissez un mot de passe temporaire.</li>
                <li>Enregistrez l'utilisateur.</li>
              </ol>
            </div>
            <div className="p-4 bg-red-50 text-red-800 rounded-lg text-sm border border-red-100">
              <strong>Contrôle des accès :</strong> Vous pouvez à tout moment <strong>Activer</strong> ou <strong>Désactiver</strong> un utilisateur pour suspendre ou restaurer son accès au système.
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'marchands',
      title: '4. Enregistrement des Marchands',
      content: (
        <div>
          <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
            <UserPlus className="text-blue-600" /> Gestion des Marchands
          </h2>
          <p className="text-gray-700 mb-6">
            Deux méthodes pour enregistrer vos marchands dans le système :
          </p>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="border p-5 rounded-lg bg-white border-t-4 border-t-blue-500">
              <h4 className="font-bold flex items-center gap-2 mb-3">
                <FileSpreadsheet className="text-green-600" /> Import via fichier Excel
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Idéal pour enregistrer plusieurs marchands en une seule opération.
              </p>
              <ul className="text-sm text-gray-700 space-y-1 ml-4">
                <li>• Téléchargez le modèle Excel fourni</li>
                <li>• Remplissez les informations des marchands</li>
                <li>• Importez le fichier complété</li>
                <li>• Vous pouvez aussi attribuer les places directement dans le fichier</li>
              </ul>
            </div>
            <div className="border p-5 rounded-lg bg-white border-t-4 border-t-blue-500">
              <h4 className="font-bold flex items-center gap-2 mb-3">
                <PlusCircle className="text-blue-600" /> Ajout manuel
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Pour enregistrer les marchands un par un.
              </p>
              <ol className="text-sm text-gray-700 space-y-1 ml-4 list-decimal">
                <li>Menu latéral → <strong>Marchands</strong></li>
                <li>Cliquez sur <strong>Ajouter</strong></li>
                <li>Remplissez le formulaire</li>
                <li>Enregistrez</li>
              </ol>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="text-sm text-gray-700">
              <strong>Astuce :</strong> Vous pouvez modifier les informations d'un marchand à tout moment en cliquant sur son nom dans la liste.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'quittances',
      title: '5. Attribution des Quittances',
      content: (
        <div>
          <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
            <Ticket className="text-blue-600" /> Gestion des Quittances
          </h2>
          <p className="text-gray-700 mb-6">
            Les quittances sont des reçus numérotés que vous attribuez à vos régisseurs et percepteurs pour tracer les encaissements.
          </p>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6">
            <h4 className="font-bold mb-4">Comment attribuer des quittances :</h4>
            <ol className="list-decimal ml-6 space-y-3 text-gray-700">
              <li>Dans le menu latéral, cliquez sur <strong>Attribution de quittances</strong>.</li>
              <li>Saisissez le <strong>numéro de début</strong> (ex: 1000).</li>
              <li>Saisissez le <strong>numéro de fin</strong> (ex: 1100).</li>
              <li>Ajoutez un <strong>préfixe</strong> pour identifier la série (ex: A, B, C...).</li>
              <li><span className="text-blue-700 font-bold">Vérifiez attentivement l'aperçu</span> avant d'enregistrer.</li>
              <li>Sélectionnez le régisseur ou percepteur concerné.</li>
              <li>Enregistrez l'attribution.</li>
            </ol>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-amber-800">
            <p className="text-sm flex items-start gap-2">
              <AlertTriangle className="size-5 flex-shrink-0 mt-0.5" />
              <span><strong>Attention :</strong> Une fois attribuées, les quittances ne peuvent plus être supprimées. Vérifiez bien les numéros avant de valider.</span>
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'tarifs-places',
      title: '6. Tarification et Attribution des Places',
      content: (
        <div>
          <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
            <Banknote className="text-blue-600" /> Gestion des Tarifs et Places
          </h2>
          <div className="space-y-6">
            <div className="bg-white border p-6 rounded-xl shadow-sm">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <Settings className="size-5 text-blue-600" /> Définition des catégories tarifaires
              </h4>
              <p className="text-gray-700 mb-4">
                Créez vos catégories de prix (A, B, C...) avec leurs montants respectifs.
              </p>
              <ol className="list-decimal ml-6 space-y-2 text-gray-700 mb-4">
                <li>Menu latéral → <strong>Tarifs des places</strong></li>
                <li>Cliquez sur <strong>Créer</strong></li>
                <li>Définissez le nom de la catégorie (ex: Catégorie A)</li>
                <li>Indiquez le montant journalier</li>
                <li>Enregistrez</li>
              </ol>
              <div className="bg-amber-50 p-3 rounded flex items-start gap-2 text-amber-800 text-sm border border-amber-200">
                <AlertTriangle className="size-8 flex-shrink-0" />
                <p><strong>Important :</strong> Une catégorie déjà utilisée par une place ou un marchand peut être modifiée, mais <strong>ne peut plus être supprimée</strong>.</p>
              </div>
            </div>
            
            <div className="bg-white border p-6 rounded-xl shadow-sm">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <ArrowRightLeft className="size-5 text-blue-600" /> Attribution d'une place à un marchand
              </h4>
              <p className="text-gray-700 mb-4">
                Associez un marchand à son emplacement dans le marché.
              </p>
              <ol className="list-decimal ml-6 space-y-2 text-gray-700">
                <li>Menu latéral → <strong>Attribution de place</strong></li>
                <li>Sélectionnez le <strong>marché</strong></li>
                <li>Choisissez la <strong>zone</strong> et le <strong>hall</strong> (si applicable)</li>
                <li>Sélectionnez la <strong>place</strong> à attribuer</li>
                <li>Choisissez le <strong>marchand</strong></li>
                <li>Définissez la <strong>catégorie tarifaire</strong></li>
                <li>Indiquez la date de début d'occupation</li>
                <li>Enregistrez l'attribution</li>
              </ol>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'droits-annuels',
      title: '7. Droits Annuels',
      content: (
        <div>
          <h2 className="text-3xl font-light mb-6 flex items-center gap-2">
            <Calendar className="text-blue-600" /> Gestion des Paiements Annuels
          </h2>
          <p className="text-gray-700 mb-6">
            Définissez et gérez les montants des droits annuels que doivent payer vos marchands.
          </p>
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h4 className="font-bold mb-3">Comment gérer les droits annuels :</h4>
            <ol className="list-decimal ml-6 space-y-2 text-gray-700">
              <li>Dans le menu latéral, cliquez sur <strong>Droit Annuel</strong>.</li>
              <li>Vous pouvez <strong>Créer</strong> un nouveau montant de référence.</li>
              <li>Vous pouvez <strong>Modifier</strong> les montants existants.</li>
              <li>Vous pouvez <strong>Supprimer</strong> les montants non utilisés.</li>
            </ol>
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
                Accédez à une vue d'ensemble de l'activité : encaissements du jour, marchands actifs, places occupées, etc.
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
            <Search className="text-blue-600" /> Recherche d'Informations
          </h2>
          <div className="bg-white border p-6 rounded-xl shadow-sm">
            <p className="text-gray-700 mb-4">
              Utilisez la fonction de recherche pour retrouver rapidement :
            </p>
            <ul className="space-y-2 text-gray-700 ml-6">
              <li>• Un marchand spécifique (par nom, numéro, ou place)</li>
              <li>• Une place dans un marché</li>
              <li>• Les transactions d'un régisseur</li>
              <li>• Les paiements d'un marchand</li>
              <li>• L'historique d'une quittance</li>
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
              <li>Cliquez sur votre nom dans le <strong>menu en haut de l'écran</strong>.</li>
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
              <h1 className="text-5xl font-extralight text-slate-800">Guide du Directeur</h1>
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
              <h3 className="text-xl font-bold mb-3">Besoin d'aide supplémentaire ?</h3>
              <p className="text-blue-100">
                Si vous rencontrez des difficultés ou avez des questions non couvertes par ce guide, 
                n'hésitez pas à contacter le support technique ou à consulter la documentation complète du logiciel.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HelpPage;