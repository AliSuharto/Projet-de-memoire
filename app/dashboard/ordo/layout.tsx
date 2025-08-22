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
    href: "/dashboard",
    icon: Home,
    label: "Accueil"
  },
  {
    href: "/users",
    icon: Users,
    label: "Utilisateurs"
  },
  {
    icon: ShoppingCart,
    label: "E-commerce",
    subItems: [
      { href: "/products", label: "Produits" },
      { href: "/orders", label: "Commandes" },
      { href: "/customers", label: "Clients" },
      { 
        href: "/inventory", 
        label: "Inventaire",
        subItems: [
          { href: "/inventory/stock", label: "Stock" },
          { href: "/inventory/movements", label: "Mouvements" },
          { href: "/inventory/alerts", label: "Alertes" }
        ]
      }
    ]
  },
  {
    icon: BarChart3,
    label: "Analytics",
    subItems: [
      { href: "/analytics/overview", label: "Vue d'ensemble" },
      { href: "/analytics/sales", label: "Ventes" },
      { href: "/analytics/traffic", label: "Trafic" }
    ]
  },
  {
    icon: FileText,
    label: "Rapports",
    subItems: [
      { href: "/reports/monthly", label: "Mensuel" },
      { href: "/reports/yearly", label: "Annuel" },
      { href: "/reports/custom", label: "Personnalisé" }
    ]
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
