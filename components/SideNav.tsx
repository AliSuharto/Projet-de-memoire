'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, LogOut } from 'lucide-react';
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
  topSection?: React.ReactNode;
  bottomSection?: React.ReactNode;
}

// ────────────────────────────────────────────────
export default function SideNav({
  items,
  topSection,
  bottomSection,
}: SideNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const [openItems, setOpenItems] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Charger utilisateur depuis localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) setCurrentUser(JSON.parse(stored));
    } catch (e) {
      console.error('Erreur lecture localStorage:user', e);
    }
  }, []);

  const toggleItem = (label: string) => {
    setOpenItems((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    );
  };

  const isActive = (href?: string) => href === pathname;

  const hasActiveChild = (subItems: SideNavItem[] = []): boolean =>
    subItems.some(
      (sub) => isActive(sub.href) || hasActiveChild(sub.subItems)
    );

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  // ────────────────────────────────────────────────
  // Render menu items (récursif)
  const renderNavItems = (navItems: SideNavItem[], level = 0) => (
    <ul className={`${level > 0 ? 'ml-6' : ''} space-y-1`}>
      {navItems.map((item) => {
        const hasSub = !!item.subItems?.length;
        const isOpen = openItems.includes(item.label);
        const activeChild = hasSub && hasActiveChild(item.subItems);
        const activeSelf = isActive(item.href);

        const baseClasses =
          'w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-sm';

        const stateClasses = hasSub
          ? activeChild
            ? 'text-blue-700 font-medium'
            : 'text-gray-700 hover:bg-gray-100'
          : activeSelf
          ? 'bg-blue-50 text-blue-700 font-medium'
          : 'text-gray-700 hover:bg-gray-100';

        return (
          <li key={item.label}>
            {hasSub ? (
              <>
                <button
                  onClick={() => toggleItem(item.label)}
                  className={`${baseClasses} ${stateClasses}`}
                >
                  {item.icon && <item.icon className="w-5 h-5" />}
                  <span className="truncate">{item.label}</span>
                  {isOpen ? (
                    <ChevronUp className="ml-auto w-4 h-4" />
                  ) : (
                    <ChevronDown className="ml-auto w-4 h-4" />
                  )}
                </button>

                {isOpen && renderNavItems(item.subItems!, level + 1)}
              </>
            ) : (
              <Link href={item.href || '#'} className={`${baseClasses} ${stateClasses}`}>
                {item.icon && <item.icon className="w-5 h-5 shrink-0" />}
                <span className="truncate">{item.label}</span>
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );

  // ────────────────────────────────────────────────
  return (
    <nav className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col bg-white shadow-lg z-40">

      {/* ─────────────── TOP SECTION (fixée) ─────────────── */}
      {topSection && (
        <div className="border-b border-gray-200 px-4 py-4 ">
          {topSection}
        </div>
      )}

      {/* ─────────────── MENU (scrollable) ─────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 mt-20">
        {renderNavItems(items)}
      </div>

      {/* ─────────────── BOTTOM SECTION (fixée) ─────────────── */}
      <div className="border-t border-gray-200 bg-gray-50/80 px-3 py-4">
        {bottomSection ?? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-semibold text-sm">
                {currentUser?.nom?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">
                  {currentUser?.nom || 'Utilisateur'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {currentUser?.role || 'Rôle'}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
