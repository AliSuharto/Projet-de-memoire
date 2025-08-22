"use client"; // Pour pouvoir utiliser des boutons ou router

import { useRouter } from "next/navigation";

export default function MarcheNotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-lg text-gray-600 mb-6">
        Marché non trouvé.
      </p>
      <button
        onClick={() => router.push("/dashboard/prmc/marches")}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Retour à la liste des marchés
      </button>
    </div>
  );
}
