import { useState, useEffect } from "react";
import { User, Plus, X, UserCheck, AlertCircle, Loader2, RefreshCw } from "lucide-react";


type User = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  adresse?: string;
  gestionMarche: boolean;
  dateCreation?: string;
};

export default function UsersSection() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    adresse: "",
    gestionMarche: false
  });

  // Récupération des utilisateurs depuis l'API Spring Boot
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Endpoint Spring Boot - ajustez l'URL selon votre configuration
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setUsers(data || []);
    } catch (err) {
      setError(err.message || 'Erreur de connexion au serveur');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial des utilisateurs
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.nom || !formData.prenom || !formData.email) {
      return;
    }

    try {
      setCreating(true);
      
      // Envoi vers l'API Spring Boot
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const newUser = await response.json();
      
      // Mise à jour locale
      setUsers(prev => [...prev, newUser]);
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        adresse: "",
        gestionMarche: false
      });
      setShowCreateForm(false);
      
    } catch (err) {
      setError(err.message || 'Erreur lors de la création de l\'utilisateur');
    } finally {
      setCreating(false);
    }
  };

  const cancelCreate = () => {
    setShowCreateForm(false);
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      adresse: "",
      gestionMarche: false
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header avec bouton en haut à droite */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Gestion des Utilisateurs</h2>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            Gérez les utilisateurs de votre application ici.
          </p>
        </div>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={loading}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base flex-shrink-0"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                <Plus size={16} />
                <span className="hidden sm:inline">Creer</span>
                <span className="sm:hidden">Nouveau responsable</span>
              </>
            )}
          </button>
        )}
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
        {/* Gestion d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-red-800">Erreur de connexion</h4>
                <p className="text-sm text-red-700 mt-1 break-words">{error}</p>
                <button
                  onClick={fetchUsers}
                  className="mt-3 inline-flex items-center gap-2 text-sm text-red-800 hover:text-red-900"
                >
                  <RefreshCw size={14} />
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire de création compact en haut */}
        {showCreateForm && (
          <div className="bg-white rounded-lg p-4 border mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">
                Créer un compte responsable
              </h3>
              <button
                onClick={cancelCreate}
                disabled={creating}
                className="text-gray-500 hover:text-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
              >
                <X size={14} />
                <span>Annuler</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  disabled={creating}
                  className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="Nom"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  disabled={creating}
                  className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="Prénom"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={creating}
                  className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="email@exemple.com"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleInputChange}
                  disabled={creating}
                  className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="Adresse complète"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="gestionMarche"
                  name="gestionMarche"
                  checked={formData.gestionMarche}
                  onChange={handleInputChange}
                  disabled={creating}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="gestionMarche" className="text-xs text-gray-700">
                  Gestion marché
                </label>
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={!formData.nom || !formData.prenom || !formData.email || creating}
                className="w-full bg-blue-600 text-white py-1.5 px-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-sm"
              >
                {creating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Plus size={14} />
                    Créer
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Liste des utilisateurs */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 text-base sm:text-lg">
            Liste des utilisateurs ({users.length})
          </h3>
          
          {loading ? (
            <div className="bg-white p-8 rounded border text-center">
              <Loader2 className="mx-auto h-8 w-8 text-gray-400 mb-4 animate-spin" />
              <p className="text-gray-500">Chargement des utilisateurs...</p>
            </div>
          ) : users.length === 0 && !error ? (
            <div className="bg-white p-6 sm:p-8 rounded border text-center">
              <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">Aucun utilisateur créé</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-2 px-4">
                Si vous voulez céder la gestion de marché à un responsable, cliquez sur le bouton ci-dessus pour créer son compte.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {users.map((user) => (
                <div key={user.id} className="bg-white p-3 sm:p-4 rounded border">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                        <User size={16} className="text-blue-600 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                          {user.prenom} {user.nom}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</p>
                        {user.adresse && (
                          <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mt-1">{user.adresse}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex sm:flex-col sm:items-end justify-between sm:text-right">
                      {user.gestionMarche && (
                        <div className="flex items-center gap-1 text-green-600 text-xs sm:text-sm mb-0 sm:mb-1">
                          <UserCheck size={14} />
                          <span>Gestion marché</span>
                        </div>
                      )}
                      {user.dateCreation && (
                        <p className="text-xs text-gray-500">
                          Créé le {new Date(user.dateCreation).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Astuce en bas de liste */}
          <div className="bg-blue-50 p-3 sm:p-4 rounded border-l-4 border-blue-400">
            <p className="text-blue-800 text-xs sm:text-sm">
              <strong>Astuce:</strong> Si vous voulez céder la gestion de marché à un responsable, cliquez sur le bouton "Céder la gestion à un responsable" pour créer son compte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}