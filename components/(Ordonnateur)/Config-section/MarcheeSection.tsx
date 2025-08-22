const MarcheSection = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Gestion des Marchés</h2>
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-gray-600 mb-4">
          Configuration des marchés et leurs paramètres.
        </p>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded border">
            <h3 className="font-medium text-gray-900">Marchés actifs</h3>
            <p className="text-sm text-gray-600">Liste et gestion des marchés en cours...</p>
          </div>
          <div className="bg-white p-4 rounded border">
            <h3 className="font-medium text-gray-900">Horaires et emplacements</h3>
            <p className="text-sm text-gray-600">Configuration des créneaux et zones...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarcheSection;