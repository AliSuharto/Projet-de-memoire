'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ChevronDown, ChevronRight, User } from 'lucide-react';
import { NavigationItem } from '@/app/types/config';

interface BurgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigationItem: NavigationItem[];
  logo?: {
    src: string;
    alt: string;
  };
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  isAuthenticated?: boolean;
}

export default function BurgerMenu({
  isOpen,
  onClose,
  navigationItem = [],
  logo = {
    src: '/logogo.png',
    alt: 'Logo'
  },
  user = {
    name: 'John Doe',
    email: 'john@example.com'
  },
  isAuthenticated = false,
}: BurgerMenuProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
        onClick={onClose}
      />
      
      {/* Menu Sidebar */}
      <div className="fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 md:hidden transform animate-in slide-in-from-left duration-300">
        {/* Header du menu */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <Image
              src={logo.src}
              alt={logo.alt}
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg"
            />
            <div className="flex items-center">
              <span className="text-gray-800 font-semibold">e-</span>
              <span className="text-blue-500 font-semibold">GMC</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            aria-label="Fermer le menu"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          <div className="space-y-1 px-2">
            {navigationItem.map((item, index) => {
              const Icon = item.icon;
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = expandedItems.has(index);

              return (
                <div key={index} className="space-y-1">
                  {/* Item principal */}
                  {hasSubItems ? (
                    <button
                      onClick={() => toggleExpanded(index)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-gray-600 group-hover:text-gray-900 flex-shrink-0" />
                        <span className="font-medium text-gray-700 group-hover:text-gray-900 text-left">
                          {item.label}
                        </span>
                      </div>
                      <ChevronDown 
                        className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                      onClick={onClose}
                    >
                      <Icon className="w-5 h-5 text-gray-600 group-hover:text-gray-900 flex-shrink-0" />
                      <span className="font-medium text-gray-700 group-hover:text-gray-900">
                        {item.label}
                      </span>
                    </Link>
                  )}

                  {/* Sous-menu */}
                  {hasSubItems && isExpanded && (
                    <div className="ml-4 pl-4 border-l-2 border-gray-100 space-y-1 animate-in slide-in-from-top-2 duration-200">
                      {item.subItems!.map((subItem, subIndex) => {
                        const SubIcon = subItem.icon;
                        return (
                          <Link
                            key={subIndex}
                            href={subItem.href}
                            className="flex items-start space-x-3 p-2 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                            onClick={onClose}
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              {SubIcon ? (
                                <SubIcon className="w-4 h-4 text-gray-500 group-hover:text-blue-600 flex-shrink-0 mt-0.5" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-700 group-hover:text-blue-900">
                                  {subItem.label}
                                </div>
                                {subItem.description && (
                                  <div className="text-xs text-gray-500 group-hover:text-blue-700 mt-0.5">
                                    {subItem.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Footer utilisateur */}
        {isAuthenticated && (
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link 
                href="/profile" 
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={onClose}
              >
                Mon Profil
              </Link>
              <Link 
                href="/settings" 
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={onClose}
              >
                Paramètres
              </Link>
              <button 
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                onClick={onClose}
              >
                Déconnexion
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}