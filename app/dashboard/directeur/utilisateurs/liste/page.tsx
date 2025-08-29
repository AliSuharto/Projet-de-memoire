"use client";

import React, { useState, useEffect } from "react";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/ui/DataTable";
import Modal, { ModalContent, ModalFooter } from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { User, TableColumn, TableAction } from "@/app/types/common";

// =======================
// Types locaux
// =======================
interface CreateUserForm {
  nom: string;
  prenom: string;
  identifiant: string;
  role: string;
  email?: string;
  telephone?: string;
  motDePasse: string;
}

// Type User basé sur votre entité
interface User {
  id: number;
  nom: string;
  prenom: string;
  identifiant: string;
  role: string;
  email?: string;
  telephone?: string;
  isActive: boolean;
  dateCreation?: string;
}

// =======================
// Services API
// =======================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const token = localStorage.getItem('token');

const userService = {
  // Récupérer tous les utilisateurs
  getAll: async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // S'assurer que le résultat est un tableau
    if (Array.isArray(result)) {
      return result;
    } else if (result && Array.isArray(result.data)) {
      // Si l'API retourne un objet avec une propriété 'data'
      return result.data;
    } else if (result && Array.isArray(result.users)) {
      // Si l'API retourne un objet avec une propriété 'users'
      return result.users;
    } else {
      // Si aucun tableau n'est trouvé, retourner un tableau vide
      console.warn('Format de réponse API inattendu:', result);
      return [];
    }
  },

  // Créer un nouvel utilisateur
  create: async (data: CreateUserForm): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/utilisateurs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        nom: data.nom,
        prenom: data.prenom,
        identifiant: data.identifiant,
        role: data.role,
        email: data.email || null,
        telephone: data.telephone || null,
        motDePasse: data.motDePasse,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Modifier un utilisateur
  update: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/utilisateurs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Supprimer un utilisateur
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/utilisateurs/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
  },

  // Récupérer les détails d'un utilisateur
  getById: async (id: number): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/utilisateurs/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  },
};

// =======================
// Configuration du tableau
// =======================

// Fonction pour obtenir le badge de rôle
const getRoleBadge = (role: string) => {
  let variant: 'success' | 'warning' | 'danger' | 'primary' = 'primary';
  
  switch (role?.toLowerCase()) {
    case 'admin':
    case 'administrateur':
      variant = 'danger';
      break;
    case 'gestionnaire':
    case 'manager':
      variant = 'warning';
      break;
    case 'utilisateur':
    case 'user':
      variant = 'success';
      break;
    default:
      variant = 'primary';
  }
  
  return (
    <StatusBadge 
      status={role || 'Utilisateur'} 
      variant={variant}
      size="sm"
    />
  );
};

// Configuration des colonnes du tableau
const getTableColumns = (): TableColumn<User>[] => [
  {
    key: 'nom',
    header: 'Nom et Prénom',
    sortable: true,
    render: (user) => (
      <div>
        <div className="font-medium text-gray-900">
          {user.nom} {user.prenom}
        </div>
        {user.email && (
          <div className="text-sm text-gray-500">{user.email}</div>
        )}
      </div>
    ),
  },
  {
    key: 'identifiant',
    header: 'Identifiant',
    sortable: true,
    render: (user) => (
      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
        {user.identifiant}
      </span>
    ),
  },
  {
    key: 'role',
    header: 'Rôle',
    sortable: true,
    className: 'text-center',
    render: (user) => getRoleBadge(user.role),
  },
  {
    key: 'isActive',
    header: 'Statut',
    sortable: true,
    className: 'text-center',
    render: (user) => (
      <StatusBadge 
        status={user.isActive ? 'Actif' : 'Inactif'} 
        variant={user.isActive ? 'success' : 'danger'}
      />
    ),
  },
  {
    key: 'dateCreation',
    header: 'Date de création',
    sortable: true,
    render: (user) => (
      <span className="text-sm text-gray-600">
        {user.dateCreation ? new Date(user.dateCreation).toLocaleDateString('fr-FR') : '-'}
      </span>
    ),
  },
];

// Configuration des actions du tableau
const getTableActions = (
  onViewDetails: (user: User) => void,
  onEdit: (user: User) => void,
  onDelete: (user: User) => void
): TableAction<User>[] => [
  {
    label: 'Voir détails',
    icon: Eye,
    onClick: onViewDetails,
    variant: 'primary',
  },
  {
    label: 'Modifier',
    icon: Edit,
    onClick: onEdit,
    variant: 'secondary',
  },
  {
    label: 'Supprimer',
    icon: Trash2,
    onClick: onDelete,
    variant: 'danger',
  },
];

// Modal création utilisateur
const CreateUserModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (data: CreateUserForm) => Promise<void>;
}> = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState<CreateUserForm>({
    nom: "",
    prenom: "",
    identifiant: "",
    role: "utilisateur",
    email: "",
    telephone: "",
    motDePasse: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom.trim() || !formData.prenom.trim() || !formData.identifiant.trim() || !formData.motDePasse.trim()) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await onSubmit(formData);
      setFormData({
        nom: "",
        prenom: "",
        identifiant: "",
        role: " ",
        email: "",
        telephone: "",
        motDePasse: "",
      });
      onClose();
    } catch (error: any) {
      console.error("Erreur lors de la création:", error);
      setError(error.message || "Une erreur est survenue lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nom: "",
      prenom: "",
      identifiant: "",
      role: "utilisateur",
      email: "",
      telephone: "",
      motDePasse: "",
    });
    setError(null);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title="Créer un nouvel utilisateur"
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <ModalContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nom de famille"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Prénom"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Identifiant <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.identifiant}
                onChange={(e) => setFormData({ ...formData, identifiant: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Identifiant unique"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rôle <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                required
                disabled={loading}
              >
                <option value="utilisateur">Utilisateur</option>
                <option value="gestionnaire">Gestionnaire</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (optionnel)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="adresse@email.com"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone (optionnel)
              </label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="+33 1 23 45 67 89"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.motDePasse}
                onChange={(e) => setFormData({ ...formData, motDePasse: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Mot de passe sécurisé"
                required
                disabled={loading}
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 6 caractères
              </p>
            </div>
          </div>
        </ModalContent>
        
        <ModalFooter>
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex-1"
              disabled={loading}
            >
              Créer l'utilisateur
            </Button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
};

// =======================
// Composant principal
// =======================
const UsersManagement: React.FC = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les utilisateurs au montage du composant
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAll();
      
      // Vérifier que data est bien un tableau
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error('Les données reçues ne sont pas un tableau:', data);
        setUsers([]);
        setError('Format de données incorrect reçu du serveur');
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      setError(error.message || "Impossible de charger les utilisateurs");
      setUsers([]); // S'assurer que users reste un tableau même en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleViewDetails = async (user: User) => {
    try {
      console.log("Voir les détails de l'utilisateur:", user);
      router.push(`/dashboard/admin/utilisateurs/${user.id}`);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des détails:", error);
      alert("Impossible d'accéder aux détails de l'utilisateur");
    }
  };

  const handleEdit = async (user: User) => {
    try {
      console.log("Modifier l'utilisateur:", user);
      router.push(`/dashboard/admin/utilisateurs/${user.id}/edit`);
    } catch (error: any) {
      console.error("Erreur lors de l'ouverture de la modification:", error);
      alert("Impossible d'ouvrir la modification");
    }
  };

  const handleDelete = async (user: User) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.nom} ${user.prenom}" ?`)) {
      try {
        await userService.delete(user.id);
        // S'assurer que nous filtrons un tableau valide
        setUsers(prev => Array.isArray(prev) ? prev.filter(u => u.id !== user.id) : []);
        console.log("Utilisateur supprimé:", user);
      } catch (error: any) {
        console.error("Erreur lors de la suppression:", error);
        alert(error.message || "Impossible de supprimer l'utilisateur");
      }
    }
  };

  const handleCreateUser = async (formData: CreateUserForm) => {
    try {
      const newUser = await userService.create(formData);
      // S'assurer que nous mettons à jour avec un tableau valide
      setUsers(prev => Array.isArray(prev) ? [...prev, newUser] : [newUser]);
      console.log("Utilisateur créé:", newUser);
    } catch (error: any) {
      console.error("Erreur lors de la création:", error);
      throw error;
    }
  };

  // Configuration du tableau
  const tableColumns = getTableColumns();
  const tableActions = getTableActions(handleViewDetails, handleEdit, handleDelete);

  // Affichage d'erreur
  if (error && !loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 inline-block">
              <h3 className="text-lg font-medium text-red-800 mb-2">
                Erreur de chargement
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button
                onClick={loadUsers}
                variant="secondary"
              >
                Réessayer
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestion des Utilisateurs</h1>
            <p className="text-gray-600 mt-1">
              Gérez les comptes utilisateurs et leurs permissions
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={loadUsers}
              variant="secondary"
              loading={loading}
            >
              Actualiser
            </Button>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              icon={Plus}
              className="shadow-sm"
            >
              Créer un utilisateur
            </Button>
          </div>
        </div>

        {/* Message d'erreur (si pas bloquant) */}
        {error && users.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-600">
              Attention: {error}
            </p>
          </div>
        )}

        {/* Tableau des utilisateurs */}
        <DataTable
          data={users}
          columns={tableColumns}
          actions={tableActions}
          loading={loading}
          title="Liste des utilisateurs"
          searchOptions={{
            placeholder: "Rechercher un utilisateur...",
            searchableFields: ['nom', 'prenom', 'identifiant', 'role', 'email'],
          }}
          paginationOptions={{
            itemsPerPage: 10,
            showItemsPerPageSelector: true,
            itemsPerPageOptions: [5, 10, 20, 50],
            showInfo: true,
          }}
          onRowClick={handleViewDetails}
          emptyMessage="Aucun utilisateur trouvé"
          emptyDescription="Commencez par créer votre premier utilisateur"
        />

        {/* Modal de création */}
        <CreateUserModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateUser}
        />
      </div>
    </div>
  );
};

export default UsersManagement;