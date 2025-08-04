'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Bell, User, LogIn, LogOut, Search, X } from 'lucide-react';

export default function Topnav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAuthenticated = true;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo + Bouton Hamburger (mobile) */}
        <div className="flex items-center space-x-2">
          <button 
            className="md:hidden p-1"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <Link href="/" className="flex items-center">
            <Image
              src="/Logo.jpg"
              alt="Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
          </Link>
        </div>

        {/* Barre de recherche (masquée sur mobile) */}
        <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full py-2 pl-10 pr-4 text-gray-900 text-sm bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all duration-150 placeholder-gray-500"
                placeholder="Rechercher..."
              />
            </div>
          </div>

        {/* Navigation droite */}
         <nav className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>

          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <User className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="flex items-center space-x-1 text-sm font-medium">
              <LogIn className="w-4 h-4" />
              <span>Connexion</span>
            </Link>
          )}
        </nav>
      </div>

      {/* Menu mobile (sidebar transformée) */}
      {isMenuOpen && (
        <div className="md:hidden bg-white py-2 px-4 border-t">
          <nav className="flex flex-col space-y-2">
            <Link href="/" className="p-2 flex items-center">
              <div className="w-5 h-5 mr-3" />
              Dashboard
            </Link>
            {/* Ajoutez les autres liens ici... */}
          </nav>
        </div>
      )}
    </header>
  );
}