"use client";

import React, { useState, useEffect } from "react";
import { Plus, Eye, Edit, Trash2, DollarSign, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/ui/DataTable";
import Modal, { ModalContent, ModalFooter } from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { TableColumn, TableAction } from "@/app/types/common";
import API_BASE_URL from "@/services/APIbaseUrl";

// =======================
// Types locaux
// =======================
interface Categorie {
  id: number;
  nom: CategorieNom;
  description?: string;
  montant: number;
  dateCreation: string;
}

enum CategorieNom {
  A = 'A', B = 'B', C = 'C', D = 'D', E = 'E', F = 'F', 
  G = 'G', H = 'H', I = 'I', J = 'J', K = 'K', L = 'L', 
  M = 'M', N = 'N', O = 'O', P = 'P', Q = 'Q', R = 'R', 
  S = 'S', T = 'T', U = 'U', V = 'V', W = 'W', X = 'X', 
  Y = 'Y', Z = 'Z'
}

interface CreateCategorieForm {
  nom: CategorieNom;
  description: string;
  montant: string;
}

interface UpdateCategorieForm extends CreateCategorieForm {}

// =======================
// Services API
// =======================

const categorieService = {
  // Récupérer toutes les catégories
  getAll: async (): Promise<Categorie[]> => {
    const response = await fetch(`${API_BASE_URL}/public/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Créer une nouvelle catégorie
  create: async (data: CreateCategorieForm): Promise<Categorie> => {
    const response = await fetch(`${API_BASE_URL}/public/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        nom: data.nom,
        description: data.description || null,
        montant: parseFloat(data.montant),
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || `Erreur ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Modifier une catégorie
  update: async (id: number, data: UpdateCategorieForm): Promise<Categorie> => {
    const response = await fetch(`${API_BASE_URL}/public/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        nom: data.nom,
        description: data.description || null,
        montant: parseFloat(data.montant),
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || `Erreur ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Supprimer une catégorie
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/public/categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || `Erreur ${response.status}: ${response.statusText}`);
    }
  },

  // Récupérer les détails d'une catégorie
  getById: async (id: number): Promise<Categorie> => {
    const response = await fetch(`${API_BASE_URL}/public/categories/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  },
};

// =======================
// Utilitaires
// =======================
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MGA',
    currencyDisplay: 'narrowSymbol', // affichera "Ar" pour Ariary
    minimumFractionDigits: 0, // pas de décimales pour Ariary
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getCategoryColor = (nom: CategorieNom): string => {
  const colors: Record<string, string> = {
    A: 'bg-red-100 text-red-800',
    B: 'bg-orange-100 text-orange-800',
    C: 'bg-yellow-100 text-yellow-800',
    D: 'bg-green-100 text-green-800',
    E: 'bg-blue-100 text-blue-800',
    F: 'bg-indigo-100 text-indigo-800',
    G: 'bg-purple-100 text-purple-800',
    H: 'bg-pink-100 text-pink-800',
  };
  
  return colors[nom] || 'bg-gray-100 text-gray-800';
};

// =======================
// Configuration du tableau
// =======================
const getTableColumns = (): TableColumn<Categorie>[] => [
  {
    key: 'nom',
    header: 'Catégorie',
    sortable: true,
    render: (categorie) => (
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getCategoryColor(categorie.nom)}`}>
          {categorie.nom}
        </div>
        <div>
          <div className="font-medium text-gray-900">Catégorie {categorie.nom}</div>
          <div className="text-sm text-gray-500">
            Créée le {formatDate(categorie.dateCreation)}
          </div>
        </div>
      </div>
    ),
  },
  {
    key: 'description',
    header: 'Description',
    sortable: true,
    render: (categorie) => (
      <div className="max-w-xs">
        {categorie.description ? (
          <p className="text-sm text-gray-700 truncate" title={categorie.description}>
            {categorie.description}
          </p>
        ) : (
          <span className="text-sm text-gray-400 italic">Aucune description</span>
        )}
      </div>
    ),
  },
  {
    key: 'montant',
    header: 'Prix',
    sortable: true,
    className: 'text-left',
    render: (categorie) => (
      <div className="text-left">
        <div className="flex items-center justify-start space-x-1">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="font-semibold text-green-600">
            {formatCurrency(categorie.montant)}
          </span>
        </div>
      </div>
    ),
  },
];

const getTableActions = (
  onViewDetails: (categorie: Categorie) => void,
  onEdit: (categorie: Categorie) => void,
  onDelete: (categorie: Categorie) => void
): TableAction<Categorie>[] => [
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

// =======================
// Modal de création/modification
// =======================
const CategorieModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategorieForm | UpdateCategorieForm) => Promise<void>;
  editingCategorie?: Categorie | null;
}> = ({ isOpen, onClose, onSubmit, editingCategorie }) => {
  const [formData, setFormData] = useState<CreateCategorieForm>({
    nom: CategorieNom.A,
    description: "",
    montant: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Réinitialiser le formulaire quand on ouvre/ferme le modal
  useEffect(() => {
    if (isOpen) {
      if (editingCategorie) {
        setFormData({
          nom: editingCategorie.nom,
          description: editingCategorie.description || "",
          montant: editingCategorie.montant.toString(),
        });
      } else {
        setFormData({
          nom: CategorieNom.A,
          description: "",
          montant: "",
        });
      }
      setError(null);
    }
  }, [isOpen, editingCategorie]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.montant || parseFloat(formData.montant) <= 0) {
      setError("Veuillez remplir tous les champs obligatoires avec des valeurs valides");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error: any) {
      console.error("Erreur lors de la soumission:", error);
      setError(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ nom: CategorieNom.A, description: "", montant: "" });
    setError(null);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title={editingCategorie ? "Modifier la catégorie" : "Créer une nouvelle catégorie"}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la catégorie <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value as CategorieNom })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                required
                disabled={loading}
              >
                {Object.values(CategorieNom).map((nom) => (
                  <option key={nom} value={nom}>
                    Catégorie {nom}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix/Montant <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.montant}
                  onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0.00"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (max 255 caractères)
              </label>
              <input
                type="text"
                maxLength={255}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 "
                placeholder="Description "
                disabled={loading}
              />
              <div className="mt-1 text-xs text-gray-500">
                {formData.description.length}/255caractères
              </div>
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
              {editingCategorie ? "Modifier" : "Créer"}
            </Button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
};

// =======================
// Modal de détails
// =======================
const DetailsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  categorie: Categorie | null;
}> = ({ isOpen, onClose, categorie }) => {
  if (!categorie) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={`Détails - Catégorie ${categorie.nom}`}
      size="md"
    >
      <ModalContent>
        <div className="space-y-6">
          {/* En-tête avec icône */}
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl ${getCategoryColor(categorie.nom)}`}>
              {categorie.nom}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Catégorie {categorie.nom}
              </h3>
              <p className="text-sm text-gray-500">
                ID: {categorie.id}
              </p>
            </div>
          </div>

          {/* Informations principales */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix
              </label>
              <div className="flex items-center space-x-0">
                <span className="text-xl font-semibold text-green-600">
                  {formatCurrency(categorie.montant)}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <p className="text-gray-900">
                {categorie.description || 
                  <span className="text-gray-400 italic">Aucune description disponible</span>
                }
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de création
              </label>
              <p className="text-gray-900">{formatDate(categorie.dateCreation)}</p>
            </div>
          </div>
        </div>
      </ModalContent>
      
      <ModalFooter>
        <Button
          onClick={onClose}
          variant="secondary"
          className="w-full"
        >
          Fermer
        </Button>
      </ModalFooter>
    </Modal>
  );
};

// =======================
// Composant principal
// =======================
const CategoriesManagement: React.FC = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingCategorie, setEditingCategorie] = useState<Categorie | null>(null);
  const [selectedCategorie, setSelectedCategorie] = useState<Categorie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les catégories au montage
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categorieService.getAll();
      setCategories(data);
    } catch (error: any) {
      console.error("Erreur lors du chargement des catégories:", error);
      setError(error.message || "Impossible de charger les catégories");
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleViewDetails = async (categorie: Categorie) => {
    try {
      const detailedCategorie = await categorieService.getById(categorie.id);
      setSelectedCategorie(detailedCategorie);
      setIsDetailsModalOpen(true);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des détails:", error);
      alert("Impossible d'accéder aux détails de la catégorie");
    }
  };

  const handleEdit = (categorie: Categorie) => {
    setEditingCategorie(categorie);
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (categorie: Categorie) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${categorie.nom}" ?`)) {
      try {
        await categorieService.delete(categorie.id);
        setCategories(prev => prev.filter(c => c.id !== categorie.id));
        console.log("Catégorie supprimée:", categorie);
      } catch (error: any) {
        console.error("Erreur lors de la suppression:", error);
        alert(error.message || "Impossible de supprimer la catégorie");
      }
    }
  };

  const handleCreateCategorie = async (formData: CreateCategorieForm) => {
    try {
      const newCategorie = await categorieService.create(formData);
      setCategories(prev => [...prev, newCategorie]);
      console.log("Catégorie créée:", newCategorie);
    } catch (error: any) {
      console.error("Erreur lors de la création:", error);
      throw error;
    }
  };

  const handleUpdateCategorie = async (formData: UpdateCategorieForm) => {
    if (!editingCategorie) return;
    
    try {
      const updatedCategorie = await categorieService.update(editingCategorie.id, formData);
      setCategories(prev => prev.map(c => 
        c.id === editingCategorie.id ? updatedCategorie : c
      ));
      console.log("Catégorie modifiée:", updatedCategorie);
    } catch (error: any) {
      console.error("Erreur lors de la modification:", error);
      throw error;
    }
  };

  const handleModalSubmit = async (formData: CreateCategorieForm | UpdateCategorieForm) => {
    if (editingCategorie) {
      await handleUpdateCategorie(formData as UpdateCategorieForm);
    } else {
      await handleCreateCategorie(formData as CreateCategorieForm);
    }
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingCategorie(null);
  };

  // Configuration du tableau
  const tableColumns = getTableColumns();
  const tableActions = getTableActions(handleViewDetails, handleEdit, handleDelete);

  // Statistiques rapides
  const totalCategories = categories.length;
  const averagePrice = categories.reduce((sum, cat) => sum + cat.montant, 0) / totalCategories || 0;
  const maxPrice = Math.max(...categories.map(cat => cat.montant));
  const minPrice = Math.min(...categories.map(cat => cat.montant));

  // Affichage d'erreur critique
  if (error && !loading && categories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 inline-block">
              <Tag className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-800 mb-2">
                Erreur de chargement
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadCategories} variant="secondary">
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
            <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <Tag className="w-8 h-8 text-blue-600" />
              <span>Gestion des Catégories</span>
            </h1>
            <p className="text-gray-600 mt-1">
              Gérez les catégories de places et leurs tarifs
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={loadCategories}
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
              Créer une catégorie
            </Button>
          </div>
        </div>

    {/* Statistiques */}
                {categories.length > 0 && (
                <div className="grid grid-cols-1 max-989:grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-2xl font-bold text-gray-900">{totalCategories}</p>
                        </div>
                        <Tag className="w-8 h-8 text-blue-500" />
                    </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                        <p className="text-sm text-gray-600">Prix moyen</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(averagePrice)}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-500" />
                    </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div>
                        <p className="text-sm text-gray-600">Prix max</p>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(maxPrice)}</p>
                    </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div>
                        <p className="text-sm text-gray-600">Prix min</p>
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(minPrice)}</p>
                    </div>
                    </div>
                </div>
                )}



        {/* Message d'erreur (si pas bloquant) */}
        {error && categories.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-600">
              Attention: {error}
            </p>
          </div>
        )}

        {/* Tableau des catégories */}
        <DataTable
          data={categories}
          columns={tableColumns}
          actions={tableActions}
          loading={loading}
          title="Liste des catégories"
          searchOptions={{
            placeholder: "Rechercher une catégorie...",
            searchableFields: ['nom', 'description'],
          }}
          paginationOptions={{
            itemsPerPage: 10,
            showItemsPerPageSelector: true,
            itemsPerPageOptions: [5, 10, 20, 50],
            showInfo: true,
          }}
          onRowClick={handleViewDetails}
          emptyMessage="Aucune catégorie trouvée"
          emptyDescription="Commencez par créer votre première catégorie"
        />

        {/* Modal de création/modification */}
        <CategorieModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleModalSubmit}
          editingCategorie={editingCategorie}
        />

        {/* Modal de détails */}
        <DetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedCategorie(null);
          }}
          categorie={selectedCategorie}
        />
      </div>
    </div>
  );
};

export default CategoriesManagement;