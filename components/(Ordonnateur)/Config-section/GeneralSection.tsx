const GeneralSection = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration Générale</h2>
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-gray-600 mb-4">
          Paramètres généraux de application.
        </p>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded border">
            <h3 className="font-medium text-gray-900">Paramètres système</h3>
            <p className="text-sm text-gray-600">Langue, timezone, format de date...</p>
          </div>
          <div className="bg-white p-4 rounded border">
            <h3 className="font-medium text-gray-900">Notifications</h3>
            <p className="text-sm text-gray-600">Configuration des alertes et emails...</p>
          </div>
          <div className="bg-white p-4 rounded border">
            <h3 className="font-medium text-gray-900">Sauvegarde</h3>
            <p className="text-sm text-gray-600">Paramètres de backup automatique...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSection;