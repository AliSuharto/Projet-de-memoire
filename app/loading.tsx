'use client';

import React from 'react';

const Loading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
      <div className="text-center">
        {/* Icône principale avec animation */}
        <div className="relative mb-8">
          <div className="w-20 h-20 mx-auto bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            {/* Icône de marché */}
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
            </svg>
          </div>
          
          {/* Animation de pulsation */}
          <div className="absolute inset-0 w-20 h-20 mx-auto bg-blue-400 rounded-2xl animate-ping opacity-75"></div>
        </div>



        {/* Barre de progression animée */}
        <div className="w-64 mx-auto bg-gray-200 rounded-full h-2 mb-8">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse" 
               style={{
                 width: '60%',
                 animation: 'loading-bar 2s ease-in-out infinite'
               }}>
          </div>
        </div>

        {/* Points de chargement */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" 
               style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" 
               style={{ animationDelay: '0.2s' }}></div>
        </div>


      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% { width: 10%; }
          50% { width: 80%; }
          100% { width: 10%; }
        }
      `}</style>
    </div>
  );
};

export default Loading;