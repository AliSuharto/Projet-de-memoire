'use client';

import React, { useState } from 'react';
import { Plus, User, Mail, Calendar, Edit, Trash2, Eye } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import Modal, { ModalContent, ModalFooter } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { User as UserType, TableColumn, TableAction } from '@/app/types/common';

// Types locaux
interface CreateUserForm {
  nom: string;
  prenom: string;
  email: string;
  role: 'Admin' | 'Utilisateur' | 'Modérateur';
  statut: 'Actif' | 'Inactif';
}

// Données d'exemple
const SAMPLE_USERS: UserType[] = [
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
];

// Badge pour les rôles
const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const getVariant = () => {
    switch (role) {
      case 'Admin': return 'danger';
      case 'Modérateur': return 'warning';
      default: return 'info';
    }
  };

  return <StatusBadge status={role} variant={getVariant()} size="sm" />;
};

// Configuration des colonnes du tableau
const getTableColumns = (): TableColumn<UserType>[] => [
  {
    key: 'nom',
    header: 'Utilisateur',
    sortable: true,
    render: (user) => (
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
    ),
  },
  {
    key: 'role',
    header: 'Rôle',
    sortable: true,
    className: 'text-center',
    render: (user) => <RoleBadge role={user.role} />,
  },
  {
    key: 'statut',
    header: 'Statut',
    sortable: true,
    className: 'text-center',
    render: (user) => <StatusBadge status={user.statut} />,
  },
  {
    key: 'dateCreation',
    header: 'Date de création',
    sortable: true,
    render: (user) => (
      <div className="text-sm text-gray-900">
        {new Date(user.dateCreation || '').toLocaleDateString('fr-FR')}
      </div>
    ),
  },
  {
    key: 'dernierLogin',
    header: 'Dernier login',
    render: (user) => (
      <div className="text-sm text-gray-500">
        {user.dernierLogin 
          ? new Date(user.dernierLogin).toLocaleDateString('fr-FR')
          : 'Jamais connecté'
        }
      </div>
    ),
  },
];

// Configuration des actions du tableau
const getTableActions = (
  onViewDetails: (user: UserType) => void,
  onEdit: (user: UserType) => void,
  onDelete: (user: UserType) => void
): TableAction<UserType>[] => [
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

// Modal de détails utilisateur
const UserDetailsModal: React.FC<{
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ user, isOpen, onClose }) => {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détails de l'utilisateur" size="lg">
      <ModalContent>
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
                <StatusBadge status={user.statut} />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Date de création</p>
                <p className="font-medium">
                  {new Date(user.dateCreation || '').toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            
            {user.dernierLogin && (
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Dernier login</p>
                  <p className="font-medium">
                    {new Date(user.dernierLogin).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </ModalContent>
      
      <ModalFooter>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Fermer
          </Button>
          <Button icon={Edit} className="flex-1">
            Modifier
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

// Modal de création d'utilisateur
const CreateUserModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserForm) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateUserForm>({
    nom: '',
    prenom: '',
    email: '',
    role: 'Utilisateur',
    statut: 'Actif'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nom.trim() || !formData.prenom.trim() || !formData.email.trim()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({ nom: '', prenom: '', email: '', role: 'Utilisateur', statut: 'Actif' });
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer un utilisateur" size="lg">
      <form onSubmit={handleSubmit}>
        <ModalContent>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 border-b pb-2">
                Informations personnelles
              </h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 border-b pb-2">
                Paramètres du compte
              </h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Utilisateur">Utilisateur</option>
                  <option value="Modérateur">Modérateur</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={formData.statut}
                  onChange={(e) => setFormData({ ...formData, statut: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Aperçu</h5>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Rôle sélectionné :</span>
                    <RoleBadge role={formData.role} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Statut :</span>
                    <StatusBadge status={formData.statut} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalContent>
        
        <ModalFooter>
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex-1"
            >
              Créer l'utilisateur
            </Button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
};

// Composant principal
const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>(SAMPLE_USERS);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handlers
  const handleViewDetails = (user: UserType) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (user: UserType) => {
    console.log('Modifier l\'utilisateur:', user);
    // TODO: Implémenter la modification
  };

  const handleDelete = (user: UserType) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.prenom} ${user.nom}" ?`)) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
    }
  };

  const handleCreateUser = async (formData: CreateUserForm) => {
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: UserType = {
      ...formData,
      id: Math.max(...users.map(u => u.id)) + 1,
      dateCreation: new Date().toISOString().split('T')[0]
    };
    
    setUsers(prev => [...prev, newUser]);
    console.log('Utilisateur créé:', newUser);
  };

  // Configuration du tableau
  const tableColumns = getTableColumns();
  const tableActions = getTableActions(handleViewDetails, handleEdit, handleDelete);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
            <p className="text-gray-600 mt-1">
              Gérez les utilisateurs et leurs permissions
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            icon={Plus}
            className="shadow-sm"
          >
            Créer un utilisateur
          </Button>
        </div>

        {/* Tableau des utilisateurs */}
        <DataTable
          data={users}
          columns={tableColumns}
          actions={tableActions}
          loading={loading}
          title="Liste des utilisateurs"
          searchOptions={{
            placeholder: "Rechercher des utilisateurs...",
            searchableFields: ['nom', 'prenom', 'email', 'role'],
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
};

export default UsersManagement;