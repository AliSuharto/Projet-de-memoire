// app/demo-loading/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Loading from '../loading';

export default function LoadingDemo() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000); // Disparaît après 5 secondes

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {isLoading && <Loading />}
      
      {!isLoading && (
        <div className="p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Contenu chargé !</h1>
          <button 
            onClick={() => setIsLoading(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Relancer le Loading
          </button>
        </div>
      )}
    </div>
  );
}