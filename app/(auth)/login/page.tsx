'use client';

import React from 'react';
import Image from 'next/image';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 via-purple-50 to-indigo-300 flex items-center justify-center p-4">
      <div className="bg-white rounded-4xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
        {/* Section gauche - Logo (en haut sur mobile, à gauche sur desktop) */}
        <div className="flex-1 bg-indigo-500 md:rounded-tl-none md:rounded-bl-none md:rounded-tr-[100px] md:rounded-br-[100px] rounded-t-3xl md:rounded-t-none p-8 md:p-12 flex flex-col justify-center items-center text-white relative">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Bienvenu dans e-GMC</h1>
            <p className="text-xs md:text-sm font-code opacity-90 leading-relaxed">
              Votre application de gestion de marchés communaux
            </p>
          </div>
          
          {/* Logo circulaire */}
          <div className="w-32 h-32 md:w-40 md:h-40 bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <div className="">
              <Image
               src="/Donneblanc.png" 
               alt="Logo e-GMC" 
                width={250}
                height={250}
                priority
               />
            </div>
          </div>
        </div>

        {/* Section droite - Formulaire (en bas sur mobile, à droite sur desktop) */}
        <div className="flex-1 p-6 sm:p-8 md:p-12 flex flex-col justify-center">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}