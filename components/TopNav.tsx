'use client';
import { useState, useEffect, useRef, KeyboardEvent, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { useAuth } from '@/components/auth/AuthProvider';
import { 
  Menu, 
  Bell, 
  User, 
  LogIn, 
  LogOut, 
  Search, 
  X, 
  ChevronDown,
  Settings
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
    role?: string; // Ajout du rôle
  };
  notifications?: number;
  isAuthenticated?: boolean;
  notificationsCount?: number;
}

// Type pour les pages recherchables
type SearchablePage = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  description?: string;
};

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
  const [filteredPages, setFilteredPages] = useState<SearchablePage[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { logout } = useAuth();
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const searchDropdownMobileRef = useRef<HTMLDivElement>(null);

  // Mémoriser les pages recherchables pour éviter les recalculs
  const searchablePages = useMemo(() => {
    return navigationItems.flatMap((item) => {
      const pages: SearchablePage[] = [];
      
      // Ajouter la page principale
      pages.push({
        label: item.label,
        href: item.href,
        icon: item.icon,
        category: 'Navigation principale'
      });
      
      // Ajouter les sous-items s'ils existent
      if (item.subItems && item.subItems.length > 0) {
        item.subItems.forEach((subItem) => {
          pages.push({
            label: subItem.label,
            href: subItem.href,
            icon: subItem.icon || item.icon, // Utiliser l'icône du sous-item ou celle du parent
            category: item.label, // La catégorie est le label du parent
            description: subItem.description
          });
        });
      }
      
      return pages;
    });
  }, [navigationItems]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Filtrer les pages en fonction de la recherche
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = searchablePages.filter(page =>
        page.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (page.description && page.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredPages(filtered);
      setSelectedIndex(0);
    } else {
      setFilteredPages([]);
    }
  }, [searchQuery, searchablePages]);

  // Fermer les menus quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      // Vérifier à la fois desktop et mobile
      const isClickInsideDesktop = searchDropdownRef.current?.contains(event.target as Node);
      const isClickInsideMobile = searchDropdownMobileRef.current?.contains(event.target as Node);
      
      if (!isClickInsideDesktop && !isClickInsideMobile) {
        setTimeout(() => {
          setIsSearchFocused(false);
        }, 100);
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
    if (e.key === 'Enter' && filteredPages.length > 0) {
      // Rediriger vers la page sélectionnée
      window.location.href = filteredPages[selectedIndex].href;
      setSearchQuery('');
      setIsSearchFocused(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredPages.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredPages.length) % filteredPages.length);
    } else if (e.key === 'Escape') {
      setSearchQuery('');
      setIsSearchFocused(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredPages([]);
    searchRef.current?.focus();
  };

  const handlePageClick = (href: string) => {
    setSearchQuery('');
    setIsSearchFocused(false);
    // Utiliser setTimeout pour s'assurer que l'état est mis à jour avant la navigation
    setTimeout(() => {
      window.location.href = href;
    }, 50);
  };

  // Grouper les résultats par catégorie
  const groupedPages = filteredPages.reduce((acc, page) => {
    if (!acc[page.category]) {
      acc[page.category] = [];
    }
    acc[page.category].push(page);
    return acc;
  }, {} as Record<string, SearchablePage[]>);

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          {/* Logo + Bouton Hamburger */}
          <div className="flex items-center space-x-3">
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu navigation"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            
            <Link href="/" className="flex items-center space-x-2 group hover:bg-gray-50 rounded-lg p-2 transition-colors">
              <div className="relative">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-lg"
                />
              </div>
              <span className="hidden sm:flex items-center font-bold text-xl">
                <span className="text-gray-800">e-</span>
                <span className="text-blue-600 ml-0">GMC</span>
              </span>
            </Link>
          </div>

          {/* Barre de recherche (cachée sur mobile) */}
          <div className="hidden md:flex flex-1 max-w-xl mx-6 border rounded-xl" ref={searchDropdownRef}>
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
                onKeyDown={handleSearch}
                className={`w-full py-2.5 pl-10 pr-10 text-sm bg-gray-50 border rounded-xl
                  transition-all duration-200 placeholder-gray-500
                  hover:bg-white hover:border-gray-300
                  focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
                  ${isSearchFocused ? 'border-blue-500' : 'border-transparent'}`}
                placeholder="Rechercher une page..."
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

              {/* Dropdown des résultats */}
              {isSearchFocused && filteredPages.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
                  {Object.entries(groupedPages).map(([category, pages]) => (
                    <div key={category} className="py-2">
                      <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">
                        {category}
                      </div>
                      {pages.map((page) => {
                        const globalIndex = filteredPages.indexOf(page);
                        const Icon = page.icon;
                        return (
                          <button
                            key={page.href}
                            onClick={() => handlePageClick(page.href)}
                            className={`w-full flex items-start space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                              selectedIndex === globalIndex ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                            }`}
                          >
                            <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                              selectedIndex === globalIndex ? 'text-blue-600' : 'text-gray-400'
                            }`} />
                            <div className="flex-1 text-left">
                              <div className={`text-sm ${
                                selectedIndex === globalIndex ? 'text-blue-600 font-medium' : 'text-gray-700'
                              }`}>
                                {page.label}
                              </div>
                              {page.description && (
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {page.description}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                  
                  {/* Aide au clavier */}
                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                    <span>↑↓ Naviguer</span>
                    <span>↵ Sélectionner</span>
                    <span>Esc Fermer</span>
                  </div>
                </div>
              )}

              {/* Message si aucun résultat */}
              {isSearchFocused && searchQuery && filteredPages.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50">
                  <p className="text-sm text-gray-500 text-center">
                    Aucune page trouvée pour "{searchQuery}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation droite */}
          <nav className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button 
                aria-label={`${notifications} notifications`}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
              >
                <Bell className="w-5 h-6 text-gray-600 hover:text-gray-900 transition-colors" />
                
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center shadow-sm">
                    {notifications > 99 ? '99+' : notifications}
                  </span>
                )}
              </button>
            </div>

            {isAuthenticated ? (
              <div className="relative ml-3" ref={userMenuRef}>
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-100 transition-all duration-200"
                  aria-expanded={isUserMenuOpen}
                >
                  {/* Avatar rond simple */}
                  <div className="relative">
                    <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white text-sm font-semibold">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    {/* Point vert en bas à droite */}
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  
                  {/* Infos utilisateur */}
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-900 leading-tight">
                      {user.name}
                    </span>
                    <span className="text-xs text-gray-500 leading-tight">
                      {user.role || 'Utilisateur'}
                    </span>
                  </div>
                  
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform hidden sm:block ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Menu utilisateur */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-in slide-in-from-top-2 duration-200">
                    {/* En-tête du menu */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-white text-base font-semibold">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      {user.role && (
                        <div className="mt-2 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                          {user.role}
                        </div>
                      )}
                    </div>
                    
                    <div className="py-1">
                      <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <User className="w-4 h-4 mr-3 text-gray-400" />
                        Mon Profil
                      </Link>
                      <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Settings className="w-4 h-4 mr-3 text-gray-400" />
                        Paramètres
                      </Link>
                    </div>
                    
                    <hr className="my-1 border-gray-100" />
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
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
        <div className="md:hidden px-4 pb-3" ref={searchDropdownMobileRef}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={handleSearch}
              className="w-full py-2.5 pl-10 pr-10 text-sm bg-gray-50 border border-transparent rounded-xl
                transition-all duration-200 placeholder-gray-500
                focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              placeholder="Rechercher une page..."
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

            {/* Dropdown mobile */}
            {isSearchFocused && filteredPages.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-50">
                {Object.entries(groupedPages).map(([category, pages]) => (
                  <div key={category} className="py-2">
                    <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">
                      {category}
                    </div>
                    {pages.map((page) => {
                      const Icon = page.icon;
                      return (
                        <button
                          key={page.href}
                          onClick={() => handlePageClick(page.href)}
                          onTouchEnd={(e) => {
                            e.preventDefault();
                            handlePageClick(page.href);
                          }}
                          className="w-full flex items-start space-x-3 px-4 py-2.5 hover:bg-gray-50 active:bg-blue-50 transition-colors"
                        >
                          <Icon className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400" />
                          <div className="flex-1 text-left">
                            <div className="text-sm text-gray-700">{page.label}</div>
                            {page.description && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                {page.description}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* Message si aucun résultat mobile */}
            {isSearchFocused && searchQuery && filteredPages.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50">
                <p className="text-sm text-gray-500 text-center">
                  Aucune page trouvée pour "{searchQuery}"
                </p>
              </div>
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