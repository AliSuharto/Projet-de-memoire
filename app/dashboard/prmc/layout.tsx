// app/(admin)/layout.tsx
'use client';
import { Home,
  Settings,
  Users, 
  ShoppingCart, 
  BarChart3, 
  FileText,

} from 'lucide-react';
import SideNav from '@/components/SideNav';
import Topnav from '@/components/TopNav';
import { navItem } from '@/components/(Ordonnateur)/NavigationsItems';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
  {
    href: "/dashboard/prmc",
    icon: Home,
    label: "Accueil"
  },
  {
    icon: ShoppingCart,
    label: "Marchés",
    subItems: [
      { href: "/dashboard/prmc/marches/listeMarches", label: "Listes des marches" },
      { href: "/dashboard/prmc/marches/statistique", label: "Statistique" },
      // { 
      //   href: "/inventory", 
      //   label: "Inventaire",
      //   subItems: [
      //     { href: "/inventory/stock", label: "Stock" },
      //     { href: "/inventory/movements", label: "Mouvements" },
      //     { href: "/inventory/alerts", label: "Alertes" }
      //   ]
      // }
    ]
  },
  {
    icon: BarChart3,
    label: "Marchands",
    subItems: [
      { href: "/dashboard/prmc/marchands", label: "Listes des machands" },
      { href: "/dashboard/prmc/marchands/creation", label: "Creation multiples des marchands" },
      
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


  return (
    <div>
      <Topnav 
      navigationItems={navItem}
      isAuthenticated={true}
      notifications={3}
      user={{
        name: 'Marie Dupont',
        email: 'marie.dupont@egmc.com'
      }}
    />
      <SideNav items={navItems} />
      <main className="pl-0 md:pl-50 pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
