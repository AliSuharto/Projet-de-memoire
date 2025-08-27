import React from "react";

const BienvenueRegisseur = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-indigo-700">
      <div className="text-center p-8 bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Bienvenue, Régisseur Principal !
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          Vous êtes connecté en tant que <span className="font-semibold text-blue-700">Régisseur Principal</span>.
        </p>
        <p className="text-gray-500 text-md">
          Accédez à vos fonctionnalités pour gérer les opérations financières et administratives.
        </p>
      </div>
    </div>
  );
};

export default BienvenueRegisseur;
