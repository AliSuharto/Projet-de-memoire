"use client";

import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 text-center">
      <h1 className="text-5xl font-extrabold text-gray-800 mb-4">404</h1>

      <p className="text-lg text-gray-600 mb-2">
        Ressource introuvable
      </p>

      <p className="text-sm text-gray-500 mb-8 max-w-md">
        La page que vous recherchez n’existe pas ou a été supprimée.
        Vérifiez l’URL ou revenez à la page précédente.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => router.back()}
          className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
        >
          Page précédente
        </button>

        
      </div>
    </div>
  );
}
