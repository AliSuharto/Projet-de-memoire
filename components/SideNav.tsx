'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, LogOut, X } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

// ────────────────────────────────────────────────
// Types
interface SideNavItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
  subItems?: SideNavItem[];
}
interface User {
  id: number;
  nom: string;
  email: string;
  role: string;
}

interface SideNavProps {
  items: SideNavItem[];
  topSection?: React.ReactNode;
  bottomSection?: React.ReactNode;
}

// ────────────────────────────────────────────────
// Modal de confirmation
function LogoutConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-sm max-w-md w-full mx-4 p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Confirmer la déconnexion
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre compte.
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    logout();
    router.replace('/login');
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
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
    <>
      <nav className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col bg-white shadow-sm z-40">

        {/* ─────────────── TOP SECTION (fixée) ─────────────── */}
        {topSection && (
          <div className="border-b border-gray-200 px-4 py-2.5 ">
            {topSection}
          </div>
        )}

        {/* ─────────────── MENU (scrollable) ─────────────── */}
        <div className="flex-1 overflow-y-auto px-3 py-4 mt-0">
          {renderNavItems(items)}
        </div>

        {/* ─────────────── BOTTOM SECTION (fixée) ─────────────── */}
        <div className="border-t border-gray-200 bg-gray-50/80 px-3 py-4">
          {bottomSection ?? (
            <div className="space-y-3">
              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center justify-center gap-2 p-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                <LogOut size={16} />
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Modal de confirmation */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}