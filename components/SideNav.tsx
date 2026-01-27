'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, LogOut, User, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

// ────────────────────────────────────────────────
// Types
interface SideNavItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
  subItems?: SideNavItem[];
}

interface SideNavProps {
  items: SideNavItem[];
  bottomSection?: React.ReactNode;
}

// ────────────────────────────────────────────────
export default function SideNav({ items, bottomSection }: SideNavProps) {
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { logout } = useAuth();

  // Charger l'utilisateur depuis localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
      }
    } catch (err) {
      console.error("Erreur lors de la lecture de localStorage → user", err);
    }
  }, []);

  const toggleItem = (label: string) => {
    setOpenItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const isActive = (href?: string) => href === pathname;

  const hasActiveChild = (subItems: SideNavItem[] = []): boolean =>
    subItems.some(
      (sub) => isActive(sub.href) || (sub.subItems && hasActiveChild(sub.subItems))
    );

  // ────────────────────────────────────────────────
  // Rendu des items du menu
  const renderNavItems = (navItems: SideNavItem[], level = 0) => (
    <ul className={`${level > 0 ? 'ml-6' : ''} space-y-1`}>
      {navItems.map((item) => {
        const hasSub = !!item.subItems?.length;
        const isOpen = openItems.includes(item.label);
        const activeChild = hasSub && hasActiveChild(item.subItems);
        const activeSelf = isActive(item.href);

        const btnClasses = hasSub
          ? `w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors group ${
              activeChild ? 'text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
            }`
          : `flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
              activeSelf
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`;

        return (
          <li key={item.label}>
            {hasSub ? (
              <>
                <button onClick={() => toggleItem(item.label)} className={btnClasses}>
                  {item.icon && <item.icon className="w-5 h-5" />}
                  <span className="text-sm truncate">{item.label}</span>
                  {isOpen ? (
                    <ChevronUp className="ml-auto w-4 h-4" />
                  ) : (
                    <ChevronDown className="ml-auto w-4 h-4" />
                  )}
                </button>

                {isOpen && renderNavItems(item.subItems!, level + 1)}
              </>
            ) : (
              <Link href={item.href || '#'} className={btnClasses}>
                {item.icon && <item.icon className="w-5 h-5 shrink-0" />}
                <span className="text-sm truncate">{item.label}</span>
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <nav className="hidden md:flex md:flex-col top-4 w-56 fixed inset-y-0 left-0 bg-white shadow-lg">

      {/* Zone scrollable du menu principal */}
      <div className="flex-1 overflow-y-auto px-3 pt-16 pb-24">
        {renderNavItems(items)}
      </div>

      {/* Bloc fixé en bas – ne scroll pas */}
      <div className="border-t border-gray-200 bg-gray-50/80 px-3 py-4">
        {bottomSection || (
          // Section utilisateur par défaut avec déconnexion fonctionnelle
          <div className="space-y-3">
            {/* Info utilisateur */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                {currentUser?.nom?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 truncate">
                  {currentUser?.nom || 'Utilisateur'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {currentUser?.role || 'Rôle'}
                </div>
              </div>
            </div>

            {/* Bouton de déconnexion */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              title="Se déconnecter"
            >
              <LogOut size={16} />
              <span>Déconnexion</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}