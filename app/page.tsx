'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import CommuneCheck from '@/components/setup/CommuneCheck';
import SetupWizard from '@/components/setup/SetupWizard';
import Image from 'next/image';
import Link from 'next/link';
import CommuneRegistration from './creation/page';

export default function CustomLandingPage() {
  const { user, loading } = useAuth();
  const [showSetup, setShowSetup] = useState(false);
  const [checkingCommune, setCheckingCommune] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (user) {
      // Utilisateur connecté, rediriger vers son dashboard
      router.push('/dashboard');
    }
    // Sinon, rester sur la page d'accueil
  }, [user, loading, router]);

  const handleLoginClick = () => {
    // Commencer la vérification de commune quand l'utilisateur clique sur "Se connecter"
    setCheckingCommune(true);
  };

  const handleCommuneExists = () => {
    // Commune trouvée, rediriger vers login
    router.push('/login');
  };

  const handleNoCommuneFound = () => {
    // Aucune commune, afficher le wizard de configuration
    setShowSetup(true);
  };

  // Afficher le wizard de configuration
  if (showSetup) {
    return <SetupWizard />;
  }

  // Afficher la vérification de commune
  if (checkingCommune && !user) {
    return (
      <CommuneCheck
        onCommuneExists={handleCommuneExists}
        onNoCommuneFound={handleNoCommuneFound}
        silent={true}
      />
    );
  }
  // Configuration personnalisable
  const config = {
    // Header
    headerTitle: "e-GMC", 
    headerSubtitle: "🚀 Votre nouvelle plateforme de gestion de marchés communaux est maintenant disponible avec des fonctionnalités avancées.",
    
    // Hero Section
    mainTitle: "e-GMC",
    subtitle: "Simplifiez la gestion de vos marchés communaux avec notre solution digitale innovante",
    
    // CTA Button
    ctaText: "Commencer maintenant",
    ctaLink: "/setup" // Remplacez par votre route
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">
      
      {/* Static background elements - No animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-40"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-40"></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-2xl opacity-50"></div>
      </div>

      {/* Static flowing lines background - No animations */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full opacity-15" viewBox="0 0 1200 800" preserveAspectRatio="none">
          <path d="M0,300 Q300,100 600,200 T1200,150" stroke="url(#gradient1)" strokeWidth="3" fill="none"/>
          <path d="M0,500 Q400,300 800,400 T1200,350" stroke="url(#gradient2)" strokeWidth="3" fill="none" />
          <path d="M0,700 Q200,500 500,600 T1200,550" stroke="url(#gradient3)" strokeWidth="3" fill="none" />
          <path d="M0,100 Q500,50 1000,100 T1200,80" stroke="url(#gradient4)" strokeWidth="2" fill="none" />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0"/>
              <stop offset="50%" stopColor="#3B82F6" stopOpacity="1"/>
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0"/>
              <stop offset="50%" stopColor="#8B5CF6" stopOpacity="1"/>
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0"/>
              <stop offset="50%" stopColor="#06B6D4" stopOpacity="1"/>
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0"/>
              <stop offset="50%" stopColor="#10B981" stopOpacity="1"/>
              <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Header with glassmorphism effect */}
      <header className="relative z-10 flex justify-between items-center px-6 py-4 backdrop-blur-sm bg-white/10 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-15 h-15 rounded-lg flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
            <Image
              src="/logogo.png"
              alt="Logo"
              width={100}
              height={100}
              className="object-cover drop-shadow-lg"
            />  
          </div>
        </div> 

        <div className="flex items-center space-x-6">
          <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-all duration-300 hover:scale-105 font-medium">
            À propos
          </Link>
          <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-all duration-300 hover:scale-105 font-medium">
            Contact
          </Link>
        </div>       
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] px-6">
        
        {/* Hero Logo */}
        <div className="text-center mb-8 transform ">
          {/* Texte de bienvenue */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 leading-tight">
              Bienvenue dans e-GMC
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed">
              Votre plateforme de gestion de marchés communaux
            </p>
            <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto">
              Pour l&apos;utiliser, veuillez cliquer sur le bouton ci-dessous.
            </p>
          </div>
          
          <Image
            src="/Logo.png"
            alt={config.mainTitle}
            width={400}
            height={100}
            className="mb-6 mx-auto drop-shadow-2xl filter brightness-105 saturate-110"
            priority
          />
          
          {/* CTA Button with modern design */}
          <div className="flex flex-col items-center space-y-10">
            <button 
              onClick={handleLoginClick}
              className="group relative px-8 py-4 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              {/* Button background animation */}
              <div className="absolute inset-0 bg-white-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Button content */}
              <span className="relative z-10 flex items-center space-x-2">
                <span>Se connecter</span>
                <svg 
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300 cursor-pointer" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>
          </div>
        </div>
        
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-20 px-6 backdrop-blur-sm bg-white/5 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-500 text-sm mb-4">
            © 2025 e-GMC - Gestion de Marchés Communaux. Tous droits réservés.
          </p>
          <div className="flex justify-center space-x-6 text-xs text-gray-400">
            <Link href="/privacy" className="hover:text-blue-500 transition-colors">
              Politique de confidentialité
            </Link>
            <Link href="/terms" className="hover:text-blue-500 transition-colors">
              Conditions d&apos;utilisation
            </Link>
            <Link href="/support" className="hover:text-blue-500 transition-colors">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}