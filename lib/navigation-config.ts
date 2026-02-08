import { 
  Home,
  Settings,
  Users, 
  ShoppingCart, 
  BarChart3, 
  FileText,
  Database,
  Plus,
  BookOpen,
  UserCheck,
  Calendar,
  CreditCard,
  Receipt,
  Tags,
  InfoIcon
} from 'lucide-react';
import { SideNavItem, TopNavItem } from '@/types/navigation';

// Type unifié pour les éléments de navigation
export type UnifiedNavItem = {
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  subItems?: UnifiedSubNavItem[];
};

export type UnifiedSubNavItem = {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  subItems?: UnifiedSubNavItem[];
};

// Configuration de navigation par rôle
export const NAVIGATION_CONFIG = {
  PRMC: [
    {
      href: "/dashboard/prmc",
      icon: Home,
      label: "Accueil"
    },
    {
      href: "/dashboard/prmc/marches",
      icon: ShoppingCart,
      label: "Marchés",
      subItems: [
        { 
          href: "/dashboard/prmc/marches/listeMarches", 
          label: "Liste des marchés", 
          icon: BookOpen,
          description: "Voir tous les marchés disponibles"
        },
        { 
          href: "/dashboard/prmc/marches/statistique",
          label: "Statistiques",
          icon: BarChart3,
          description: "Voir les statistiques des marchés" 
        }
      ]
    },
    {
      href: "/dashboard/prmc/marchands", 
      icon: Users,
      label: "Marchands",
      subItems: [
        { 
          href: "/dashboard/prmc/marchands", 
          label: "Liste des marchands",
          icon: Users,
          description: "Voir tous les marchands inscrits"
        },
        { 
          href: "/dashboard/prmc/marchands/creation", 
          label: "Création multiple",
          icon: Plus,
          description: "Créer plusieurs marchands en une fois"
        }
      ]
    },
    {
      href: "/dashboard/prmc/users",
      icon: FileText,
      label: "Documents administratifs"
    },
    {
      href: "/dashboard/prmc/users",
      icon: UserCheck,
      label: "Utilisateurs"
    },
    {
      href: "/dashboard/prmc/categorie",
      icon: Settings,
      label: "Paramètres"
    }
  ] as UnifiedNavItem[],

  ORDO: [
    {
      href: "/dashboard/ordo",
      icon: Home,
      label: "Accueil"
    },
     {
      href: "/dashboard/ordo/recettes",
      icon: Database,
      label: "Recettes"
    },
    {
      href: "/dashboard/ordo/configuration",
      icon: Settings,
      label: "Configuration",
      subItems: [
        { 
          href: "/dashboard/ordo/configuration", 
          label: "Paramètres généraux",
          icon: Settings,
          description: "Configuration générale du système"
        },
        { 
          href: "/dashboard/ordo/configuration/users", 
          label: "Gestion des utilisateurs",
          icon: Users,
          description: "Gérer les comptes utilisateurs"
        },
        { 
          href: "/dashboard/ordo/configuration/marches", 
          label: "Configuration marchés",
          icon: ShoppingCart,
          description: "Configurer les marchés"
        }
      ]
    },
    {
      href: "/dashboard/ordo/marchee",
      icon: ShoppingCart,
      label: "Marchés"
    },
   
    {
      href: "/dashboard/ordo/rapports",
      icon: FileText,
      label: "Rapports",
      subItems: [
        { 
          href: "/dashboard/ordo/rapports/mensuel", 
          label: "Rapport mensuel",
          icon: Calendar,
          description: "Rapport mensuel des activités"
        },
        { 
          href: "/dashboard/ordo/rapports/annuel", 
          label: "Rapport annuel",
          icon: BarChart3,
          description: "Rapport annuel des activités"
        }
      ]
    }
  ] as UnifiedNavItem[],

  PERP: [
    {
      href: "/dashboard/perp",
      icon: Home,
      label: "Accueil"
    },
    {
      href: "/dashboard/perp/marchands",
      icon: Users,
      label: "Marchands"
    },
    {
      href: "/dashboard/perp/marchee",
      icon: ShoppingCart,
      label: "Marchés"
    },
    {
      href: "/dashboard/perp/montant",
      icon: CreditCard,
      label: "Montants"
    },
    {
      href: "/dashboard/perp/recu",
      icon: FileText,
      label: "Reçus"
    },
    {
      href: "/dashboard/perp/parametres",
      icon: Settings,
      label: "Paramètresss"
    },
    
  ] as UnifiedNavItem[],

  ORDONNATEUR: [
    {
      href: "/dashboard/ordo",
      icon: Home,
      label: "Accueil"
    },
    {
      href: "/dashboard/ordo/recettes",
      icon: Database,
      label: "Recettes"
    },
    {
      href: "/dashboard/ordo/marches",
      icon: ShoppingCart,
      label: "Marchés",
      subItems: [
        { 
          href: "/dashboard/ordo/marchee/liste", 
          label: "Liste des marchés",
          icon: BookOpen,
          description: "Voir tous les marchés"
        },
        { 
          href: "/dashboard/ordo/marchee/stat",
          label: "Statistiques",
          icon: BarChart3,
          description: "Voir les performances" 
        }
      ]
    },
    {
      href: "/dashboard/ordo/marchands",
      icon: Users,
      label: "Marchands"
    },
    {
      href: "/dashboard/ordo/equipe",
      icon: UserCheck,
      label: "Équipe de gestion"
    },
    {
      href: "/dashboard/ordo/rapports",
      icon: FileText,
      label: "Rapports"
    },
    {
      href: "/dashboard/ordo/parametres",
      icon: Settings,
      label: "Paramètres",
      subItems: [
        { 
          href: "/dashboard/ordo/creerPrmc", 
          label: "Creer PRMC",
          icon: BookOpen,
          description: "Créer un directeur"
        },
        { 
          href: "/dashboard/ordo/changeMotdePasse",
          label: "Changer le mot de passe",
          description: "Modifier votre mot de passe" 
        }
      ]
    }
  ] as UnifiedNavItem[],

  DIRECTEUR: [
    {
      href: "/dashboard/directeur",
      icon: Home,
      label: "Accueil"
    },
    {
      href: "/dashboard/directeur/marches",
      icon: ShoppingCart,
      label: "Marchés",
      subItems: [
        { 
          href: "/dashboard/directeur/marches/creer", 
          label: "Créer un marché",
          icon: Plus,
          description: "Ajouter un nouveau marché"
        },
        { 
          href: "/dashboard/directeur/marches/listeMarches", 
          label: "Liste des marchés",
          icon: BookOpen,
          description: "Gérer les marchés existants"
        }
      ]
    },



    {
      href: "/dashboard/directeur/utilisateurs",
      icon: Users,
      label: "Utilisateurs",
      subItems: [
        { 
          href: "/dashboard/directeur/utilisateurs/liste", 
          label: "Liste des utilisateurs",
          icon: Users,
          description: "Voir tous les utilisateurs"
        },
        { 
          href: "/dashboard/directeur/utilisateurs/creer", 
          label: "Ajouter un utilisateur",
          icon: UserCheck,
          description: "Creer nouveau compte"
        }
      ]
    },

{
      href: "/dashboard/directeur/marchand",
      icon: Users,
      label: "Marchands",
      subItems: [
        { 
          href: "/dashboard/directeur/marchand/liste", 
          label: "Liste des marchands",
          icon: Users,
          description: "Voir tous les marchands"
        },

         { 
          href: "/dashboard/directeur/marchand/creer_multiple", 
          label: " Ajouter marchands",
          icon: UserCheck,
          description: "Ajouter plusieurs marchands en une fois"
        }
      ]
    },
    
    {
      href: "/dashboard/directeur/rapports",
      icon: FileText,
      label: "Rapports"
    },

    {
      href: "/dashboard/directeur/tarif",
      icon: Tags,
      label: "Tarifs des places"
    },

    {
      href: "/dashboard/directeur/droitannuel",
      icon: InfoIcon,
      label: "Droit Annuel"
    },

{
      href: "/dashboard/directeur/quittance",
      icon: FileText,
      label: "Attribution des quittances"
    },

    {
      href: "/dashboard/directeur/attribExemple",
      icon: Calendar,
      label: "Attributions des places"
    },
  ] as UnifiedNavItem[],


REGISSEUR_PRINCIPAL: [
    {
      href: "/dashboard/regisseur_principal",
      icon: Home,
      label: "Accueil"
    },
    {
      href: "/dashboard/regisseur_principal/sessions",
      icon: Users,
      label: "Sessions"
    },
    {
      href: "/dashboard/regisseur_principal/validsession",
      icon: ShoppingCart,
      label: " Valider les sessions"
    },
    {
      href: "/dashboard/regisseur_principal/regisseurs",
      icon: CreditCard,
      label: "Agents recouvreurs"
    },
    {
      href: "/dashboard/regisseur_principal/etats_de_versement",
      icon: Receipt,
      label: "Etats de versement"
    },
    {
      href: "/dashboard/regisseur_principal/marches",
      icon: ShoppingCart,
      label: "Liste des marchés"     
    },
]as UnifiedNavItem[],


  PERCEPTEUR: [
    {
      href: "/dashboard/percepteur",
      icon: Home,
      label: "Accueil"
    },
    {
      href: "/dashboard/percepteur/marchands",
      icon: Users,
      label: "Marchands"
    },
    {
      href: "/dashboard/percepteur/marches",
      icon: ShoppingCart,
      label: "Marchés"
    },
    {
      href: "/dashboard/percepteur/paiements",
      icon: CreditCard,
      label: "Paiements"
    },
    {
      href: "/dashboard/percepteur/recu",
      icon: FileText,
      label: "Reçus"
    },
    {
      href: "/dashboard/percepteur/parametres",
      icon: Settings,
      label: "Paramètres"
    }
  ] as UnifiedNavItem[]
  ,

REGISSEUR: [
    {
      href: "/dashboard/regisseur",
      icon: Home,
      label: "Accueil"
    },
    {
      href: "/dashboard/regisseur/marchands",
      icon: Users,
      label: "Marchands"
    },
    {
      href: "/dashboard/regisseur/marches",
      icon: ShoppingCart,
      label: "Marchés"
    },
    {
      href: "/dashboard/regisseur/paiements",
      icon: CreditCard,
      label: "Paiements"
    },
    
    {
      href: "/dashboard/regisseur/sessions",
      icon: Calendar,
      label: "Sessions"
    },
    {
      href: "/dashboard/regisseur/quittances",
      icon: FileText,
      label: "Quittances"
    },
    
  ] as UnifiedNavItem[]
};











// Fonction utilitaire pour obtenir la configuration de navigation par rôle
export function getNavigationConfig(role: string): UnifiedNavItem[] {
  const upperRole = role.toUpperCase();
  return NAVIGATION_CONFIG[upperRole as keyof typeof NAVIGATION_CONFIG] || [];
}

// Fonction pour convertir vers le format TopNav/BurgerMenu
export function convertToTopNavFormat(navItems: UnifiedNavItem[]): TopNavItem[] {
  return navItems.map(item => ({
    href: item.href || '',
    icon: item.icon,
    label: item.label,
    subItems: item.subItems?.map(subItem => ({
      href: subItem.href,
      label: subItem.label,
      icon: subItem.icon,
      description: subItem.description
    }))
  }));
}

// Fonction pour convertir vers le format SideNav
export function convertToSideNavFormat(navItems: UnifiedNavItem[]): SideNavItem[] {
  return navItems.map(item => ({
    href: item.href,
    icon: item.icon,
    label: item.label,
    subItems: item.subItems?.map(subItem => ({
      href: subItem.href,
      label: subItem.label,
      subItems: subItem.subItems?.map(subSubItem => ({
        href: subSubItem.href,
        label: subSubItem.label
      }))
    }))
  }));
}
