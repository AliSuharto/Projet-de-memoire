'use client';
import axios from 'axios';
import { useState, useMemo } from 'react';
import { ChevronRight, Search, Plus, User, Mail, Calendar, Edit, Trash2, X } from 'lucide-react';

// Types
interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: 'Admin' | 'Utilisateur' | 'Modérateur';
  statut: 'Actif' | 'Inactif';
  dateCreation: string;
  dernierLogin?: string;
}

interface NewUser {
  nom: string;
  prenom: string;
  email: string;
  role: 'Admin' | 'Utilisateur' | 'Modérateur';
  statut: 'Actif' | 'Inactif';
}

// Composant Badge pour le statut
const StatusBadge = ({ statut }: { statut: 'Actif' | 'Inactif' }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      statut === 'Actif'
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-800'
    }`}
  >
    {statut}
  </span>
);

// Composant Badge pour le rôle
const RoleBadge = ({ role }: { role: string }) => {
  const colors = {
    Admin: 'bg-purple-100 text-purple-800',
    Modérateur: 'bg-blue-100 text-blue-800',
    Utilisateur: 'bg-gray-100 text-gray-800'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role as keyof typeof colors]}`}>
      {role}
    </span>
  );
};

// Composant Modal pour les détails utilisateur
const UserDetailsModal = ({ user, isOpen, onClose }: { 
  user: User | null; 
  isOpen: boolean; 
  onClose: () => void; 
}) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Détails de l'utilisateur</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Nom complet</p>
                <p className="font-medium">{user.prenom} {user.nom}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="h-5 w-5 flex items-center justify-center">
                <div className="h-3 w-3 rounded bg-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Rôle</p>
                <RoleBadge role={user.role} />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-5 w-5 flex items-center justify-center">
                <div className={`h-3 w-3 rounded-full ${user.statut === 'Actif' ? 'bg-green-400' : 'bg-red-400'}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <StatusBadge statut={user.statut} />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Date de création</p>
                <p className="font-medium">{user.dateCreation}</p>
              </div>
            </div>
            
            {user.dernierLogin && (
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Dernier login</p>
                  <p className="font-medium">{user.dernierLogin}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 flex space-x-3">
          <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2">
            <Edit className="h-4 w-4" />
            <span>Modifier</span>
          </button>
          <button className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center justify-center space-x-2">
            <Trash2 className="h-4 w-4" />
            <span>Supprimer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant Modal pour création d'utilisateur
const CreateUserModal = ({ isOpen, onClose, onSubmit }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (user: NewUser) => void; 
}) => {
  const [newUser, setNewUser] = useState<NewUser>({
    nom: '',
    prenom: '',
    email: '',
    role: 'Utilisateur',
    statut: 'Actif'
  });

   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      //  Envoyer les données vers ton backend
      const response = await axios.post("http://localhost:8080/api/users", newUser, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Utilisateur créé :", response.data);

      // 2 Si tu veux faire quelque chose côté client
      onSubmit?.(response.data);

      //  Réinitialiser le formulaire
      setNewUser({ nom: "", prenom: "", email: "", role: "Utilisateur", statut: "Actif" });

      alert("Utilisateur créé avec succès !");
    } catch (error) {
  if (axios.isAxiosError(error)) {
    console.error("Erreur lors de la création de l'utilisateur :", error.response || error);
  } else if (error instanceof Error) {
    console.error("Erreur lors de la création de l'utilisateur :", error.message);
  } else {
    console.error("Erreur lors de la création de l'utilisateur :", error);
  }
  alert("Erreur lors de la création de l'utilisateur.");
}
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Créer un utilisateur</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 border-b pb-2">Informations personnelles</h4>
            <div>
              <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">
                Prénom
              </label>
              <input
                type="text"
                id="prenom"
                value={newUser.prenom}
                onChange={(e) => setNewUser({ ...newUser, prenom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                id="nom"
                value={newUser.nom}
                onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 border-b pb-2">Paramètres du compte</h4>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Rôle
              </label>
              <select
                id="role"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'Admin' | 'Utilisateur' | 'Modérateur' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Utilisateur">Utilisateur</option>
                <option value="Modérateur">Modérateur</option>
                <option value="Admin">Admin</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Sélectionnez le niveau d'accès pour cet utilisateur</p>
            </div>
            
            <div>
              <label htmlFor="statut" className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                id="statut"
                value={newUser.statut}
                onChange={(e) => setNewUser({ ...newUser, statut: e.target.value as 'Actif' | 'Inactif' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Définit si l'utilisateur peut se connecter</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Aperçu</h5>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Rôle sélectionné :</span>
                  <RoleBadge role={newUser.role} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Statut :</span>
                  <StatusBadge statut={newUser.statut} />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end space-x-3 border-t pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Créer l'utilisateur
            </button>
        </div>
      </div>
    </div>
  );
};

// Composant principal
export default function UsersManagement() {
  // Données d'exemple (simulant une base de données)
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@example.com',
      role: 'Admin',
      statut: 'Actif',
      dateCreation: '2024-01-15',
      dernierLogin: '2024-08-19'
    },
    {
      id: 2,
      nom: 'Martin',
      prenom: 'Marie',
      email: 'marie.martin@example.com',
      role: 'Utilisateur',
      statut: 'Actif',
      dateCreation: '2024-02-20',
      dernierLogin: '2024-08-18'
    },
    {
      id: 3,
      nom: 'Bernard',
      prenom: 'Pierre',
      email: 'pierre.bernard@example.com',
      role: 'Modérateur',
      statut: 'Inactif',
      dateCreation: '2024-03-10'
    },
    {
      id: 4,
      nom: 'Durand',
      prenom: 'Sophie',
      email: 'sophie.durand@example.com',
      role: 'Utilisateur',
      statut: 'Actif',
      dateCreation: '2024-04-05',
      dernierLogin: '2024-08-17'
    },
    {
      id: 5,
      nom: 'Moreau',
      prenom: 'Luc',
      email: 'luc.moreau@example.com',
      role: 'Admin',
      statut: 'Actif',
      dateCreation: '2024-05-12',
      dernierLogin: '2024-08-19'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const usersPerPage = 3;

  // Filtrage des utilisateurs basé sur la recherche
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      `${user.prenom} ${user.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const handleCreateUser = (newUserData: NewUser) => {
    const newUser: User = {
      ...newUserData,
      id: Math.max(...users.map(u => u.id)) + 1,
      dateCreation: new Date().toISOString().split('T')[0]
    };
    setUsers([...users, newUser]);
    setIsCreateModalOpen(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-0 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestion des utilisateurs</h1>
        
         {/* Bouton de création d'utilisateur */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Créer un utilisateur</span>
          </button>
        </div>
        
        </div>

       

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative max-w-md ml-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher des utilisateurs..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Nom et Prénom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.map((user, index) => (
                <tr
                  key={user.id}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.prenom} {user.nom}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge statut={user.statut} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleViewDetails(user)}
                      className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                    >
                      <span>Voir détails</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {currentUsers.length === 0 && (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun utilisateur trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Aucun utilisateur ne correspond à votre recherche.' : 'Commencez par créer un utilisateur.'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de{' '}
                  <span className="font-medium">{(currentPage - 1) * usersPerPage + 1}</span>
                  {' '}à{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * usersPerPage, filteredUsers.length)}
                  </span>
                  {' '}sur{' '}
                  <span className="font-medium">{filteredUsers.length}</span>
                  {' '}résultats
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <UserDetailsModal 
          user={selectedUser} 
          isOpen={isDetailsModalOpen} 
          onClose={() => setIsDetailsModalOpen(false)} 
        />
        
        <CreateUserModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
          onSubmit={handleCreateUser}
        />
      </div>
    </div>
  );
}