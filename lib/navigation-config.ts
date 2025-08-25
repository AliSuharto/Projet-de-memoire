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
  CreditCard
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
      href: "/dashboard/ordo/marchands",
      icon: Users,
      label: "Marchands"
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
      label: "Paramètres"
    }
  ] as UnifiedNavItem[],

  REGISSEUR: [
    {
      href: "/dashboard/regisseur",
      icon: Home,
      label: "Accueil"
    },
    {
      href: "/dashboard/regisseur/marchee",
      icon: ShoppingCart,
      label: "Marchés"
    },
    {
      href: "/dashboard/regisseur/marchands",
      icon: Users,
      label: "Marchands"
    },
    {
      href: "/dashboard/regisseur/endettes",
      icon: Database,
      label: "Marchands endettés"
    },
    {
      href: "/dashboard/regisseur/rapports",
      icon: FileText,
      label: "Rapports financiers"
    },
    {
      href: "/dashboard/regisseur/parametres",
      icon: Settings,
      label: "Paramètres"
    }
  ] as UnifiedNavItem[],

  // Nouveaux rôles
  ORDONNATEUR: [
    {
      href: "/dashboard/ordonnateur",
      icon: Home,
      label: "Accueil"
    },
    {
      href: "/dashboard/ordonnateur/marches",
      icon: ShoppingCart,
      label: "Marchés",
      subItems: [
        { 
          href: "/dashboard/ordonnateur/marches/liste", 
          label: "Liste des marchés",
          icon: BookOpen,
          description: "Voir tous les marchés"
        },
        { 
          href: "/dashboard/ordonnateur/marches/statistiques",
          label: "Statistiques",
          icon: BarChart3,
          description: "Voir les performances" 
        }
      ]
    },
    {
      href: "/dashboard/ordonnateur/marchands",
      icon: Users,
      label: "Marchands"
    },
    {
      href: "/dashboard/ordonnateur/equipe",
      icon: UserCheck,
      label: "Équipe de gestion"
    },
    {
      href: "/dashboard/ordonnateur/rapports",
      icon: FileText,
      label: "Rapports"
    },
    {
      href: "/dashboard/ordonnateur/parametres",
      icon: Settings,
      label: "Paramètres"
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
      label: "Gestion des marchés",
      subItems: [
        { 
          href: "/dashboard/directeur/marches/creer", 
          label: "Créer un marché",
          icon: Plus,
          description: "Ajouter un nouveau marché"
        },
        { 
          href: "/dashboard/directeur/marches/liste", 
          label: "Liste des marchés",
          icon: BookOpen,
          description: "Gérer les marchés existants"
        }
      ]
    },
    {
      href: "/dashboard/directeur/utilisateurs",
      icon: Users,
      label: "Gestion des utilisateurs",
      subItems: [
        { 
          href: "/dashboard/directeur/utilisateurs/liste", 
          label: "Liste des utilisateurs",
          icon: Users,
          description: "Voir tous les utilisateurs"
        },
        { 
          href: "/dashboard/directeur/utilisateurs/roles", 
          label: "Gestion des rôles",
          icon: UserCheck,
          description: "Attribuer des permissions"
        }
      ]
    },
    {
      href: "/dashboard/directeur/permissions",
      icon: Settings,
      label: "Permissions"
    },
    {
      href: "/dashboard/directeur/rapports",
      icon: FileText,
      label: "Rapports"
    }
  ] as UnifiedNavItem[],

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
