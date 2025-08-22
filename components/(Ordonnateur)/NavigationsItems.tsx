import { 
  Home, 
  Users, 
  Settings, 
  BookOpen, 
  FileText, 
  Video, 
  MessageSquare,
  Calendar,
  BarChart3,
  Shield,
  CreditCard,
  UserCheck,
  ShoppingCart,
  Plus
} from 'lucide-react';
import { NavigationItem } from '../TopNav';


export const navItem: NavigationItem[] = [


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
      href: "/dashboard/prmc/listeMarches", 
      label: "Listes des marches", 
      icon: BookOpen,
      description: "Voir tous les marchés disponibles"
    },
    { 
      href: "/dashboard/prmc/statistiques",
      label: "Statistique",
      icon: BarChart3,
      description: "Voir les statistiques des marchés" 
    }
  ]
  },

  {href: "/dashboard/prmc/marchands", 
    icon: BarChart3,
    label: "Marchands",
    subItems: [
      { href: "/dashboard/prmc/marchands", 
        label: "Listes des machands",
        icon: Users,
        description: "Voir tous les marchands inscrits"
    
    },
      { href: "/dashboard/prmc/marchands/creation", 
        label: "Creation multiples des marchands" ,
        icon: Plus,
        description: "Gérer les demandes d'admission",  
    
    },
      
    ]
  },
  
  {
    href: "/dashboard/prmc/users",
    icon: FileText,
    label: "Documents administratifs",
  },

   {
    href: "/dashboard/prmc/users",
    icon: Users,
    label: "Utilisateurs"
  },

  {
    href: "/settings",
    icon: Settings,
    label: "Paramètres"
  }
];








