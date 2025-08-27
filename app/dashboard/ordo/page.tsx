import UserProfileCard from '../userProfileCard';

export default function OrdonnateurDashboard() {
  return (
    
      <div className="p-6 space-y-6">
        {/* <UserProfileCard /> */}
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Dashboard Ordonnateur
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-xl font-semibold mb-2 text-gray-900">
                Gestion des budgets
              </h2>
              <p className="text-gray-600">
                Gérer les allocations budgétaires de la commune
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-xl font-semibold mb-2 text-gray-900">
                Validation des dépenses
              </h2>
              <p className="text-gray-600">
                Approuver et valider les demandes de dépenses
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-xl font-semibold mb-2 text-gray-900">
                Rapports financiers
              </h2>
              <p className="text-gray-600">
                Consulter les rapports financiers détaillés
              </p>
            </div>
          </div>
        </div>
      </div>
    
  );
}