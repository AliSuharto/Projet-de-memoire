'use client';
import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Menu, 
  Bell, 
  User, 
  LogIn, 
  LogOut, 
  Search, 
  X, 
  ChevronDown
} from 'lucide-react';
import BurgerMenu from './BurgerMenu';

// Type pour les sous-éléments de menu
export type SubMenuItem = {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
};

// Type pour les items de navigation avec sous-menus
export type NavigationItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: SubMenuItem[];
};

interface TopnavProps {
  navigationItems: NavigationItem[];
  logo?: {
    src: string;
    alt: string;
  };
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  notifications?: number;
  isAuthenticated?: boolean;
  notificationsCount?: number;
}

export default function Topnav({
  navigationItems = [],
  logo = {
    src: '/logogo.png',
    alt: 'Logo'
  },
  user = {
    name: 'John Doe',
    email: 'john@example.com'
  },
  isAuthenticated = false,
  notifications = 0,
}: TopnavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Fermer les menus quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fermer le menu mobile sur redimensionnement
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      console.log('Recherche:', searchQuery);
      // Implémentez votre logique de recherche ici
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    searchRef.current?.focus();
  };

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
          {/* Logo + Bouton Hamburger */}
          <div className="flex items-center space-x-3">
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu navigation"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            <Link href="/" className="flex items-center space-x-2 group hover:bg-gray-200 rounded-lg p-2">
              <div className="relative">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-lg"
                />
              </div>
              <span className="hidden sm:flex items-center font-semibold text-lg">
                <span className="text-gray relative">
                  <span className="absolute inset-0 -z-10 text-blue-700 font-bold">e-</span>
                  e-
                </span>
                <span className="text-blue-500 ml-0">GMC</span>
              </span>
            </Link>
          </div>

          {/* Barre de recherche (cachée sur mobile) */}
          <div className="hidden md:flex flex-1 max-w-xl mx-6">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className={`w-4 h-4 transition-colors ${
                  isSearchFocused ? 'text-blue-500' : 'text-gray-400'
                }`} />
              </div>
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                className={`w-full py-2.5 pl-10 pr-10 text-sm bg-gray-50 border rounded-xl
                  transition-all duration-200 placeholder-gray-500
                  hover:bg-white hover:border-gray-300
                  focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
                  ${isSearchFocused ? 'border-blue-500' : 'border-transparent'}`}
                placeholder="Rechercher..."
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation droite */}
          <nav className="flex items-center space-x-1">
            {/* Notifications */}
            <div className="relative">
              <button 
                aria-label={`${notifications} notifications`}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
              >
                <Bell className="w-5 h-5 text-gray-600 hover:text-gray-900 transition-colors" />
                
                {notifications > 0 && (
                  <span className={`
                    absolute -top-1 -right-1 
                    ${notifications > 9 ? 'px-1 min-w-[20px]' : 'w-5 h-5'} 
                    bg-red-500 text-white text-xs font-medium 
                    rounded-full flex items-center justify-center
                    animate-pulse-once
                    transform transition-all
                    hover:scale-110 hover:bg-red-600
                  `}>
                    {notifications > 9 ? '9+' : notifications}
                  </span>
                )}
              </button>
            </div>

            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform hidden sm:block ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Menu utilisateur */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      Mon Profil
                    </Link>
                    <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      Paramètres
                    </Link>
                    <hr className="my-2 border-gray-100" />
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2">
                      <LogOut className="w-4 h-4" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/login" 
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Connexion</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Barre de recherche mobile */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
              className="w-full py-2.5 pl-10 pr-10 text-sm bg-gray-50 border border-transparent rounded-xl
                transition-all duration-200 placeholder-gray-500
                focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              placeholder="Rechercher..."
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Composant BurgerMenu */}
      <BurgerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        navigationItem={navigationItems}
        logo={logo}
        user={user}
        isAuthenticated={isAuthenticated}
      />
    </>
  );
}