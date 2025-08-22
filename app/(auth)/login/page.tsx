'use client';

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
   import Image from 'next/image';
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    console.log('Connexion avec:', { email, password });
    // Ici vous pouvez ajouter votre logique de connexion
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 via-purple-50 to-indigo-300 flex items-center justify-center p-4">
      <div className="bg-white rounded-4xl shadow-2xl overflow-hidden max-w-4xl w-full flex">
  {/* Section gauche */}
         
        <div className="flex-[1] bg-indigo-500 rounded-tl-none rounded-bl-none rounded-tr-[100px] rounded-br-[100px] p-2 flex flex-col justify-center items-center text-white relative">

    
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-4">Bienvenu dans e-GMC</h1>
            <p className="text-sm font-code opacity-90 leading-relaxed">
              Votre application de gestion de marchés communaux
            </p>
          </div>
          
          {/* Logo circulaire */}
          <div className="w-40 h-40  bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
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

        {/* Section droite - Formulaire */}
                  <div className="flex-1 p-6 sm:p-12 flex flex-col justify-center">
            <div className="w-full max-w-md mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-indigo-500 mb-10 text-center">
                Se connecter
              </h2>

              <div className="space-y-6">
                {/* Champ Email */}
                <div className="relative w-full sm:w-80 mx-auto">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mail@gmail.com"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl
                        focus:border-blue-500 focus:outline-none transition-all
                        text-gray-700 placeholder-gray-400 bg-gray-50 hover:bg-white
                        shadow-lg shadow-blue-200"
                  />
                </div>

                {/* Champ Mot de passe */}
                <div className="relative w-full sm:w-80 mx-auto">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe"
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all text-gray-700 placeholder-gray-400 bg-gray-50 hover:bg-white shadow-lg shadow-blue-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>

                {/* Mot de passe oublié */}
                <div className="text-center">
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                {/* Bouton de connexion */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full sm:w-80 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-semibold text-lg hover:from-indigo-500 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.01] shadow-lg hover:shadow-xl"
                  >
                    Se connecter
                  </button>
                </div>
              </div>
            </div>
          </div>


      </div>
    </div>
  );
}