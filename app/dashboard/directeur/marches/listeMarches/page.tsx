"use client";

import React, { useState, useEffect } from "react";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/ui/DataTable";
import Modal, { ModalContent, ModalFooter } from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { Market, TableColumn, TableAction } from "@/app/types/common";
import API_BASE_URL from "@/services/APIbaseUrl";

// =======================
// Types locaux
// =======================
interface CreateMarketForm {
  nom: string;
  adresse: string;
  nbrPlace: string;
  description: string;
}

// =======================
// Services API
// =======================
const token = localStorage.getItem('token') ;
const marketService = {
  // Récupérer tous les marchés
  getAll: async (): Promise<Market[]> => {
    const response = await fetch(`${API_BASE_URL}/marchees`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Ajouter token d'auth si nécessaire
        'Authorization': `Bearer ${token}`
      },
    });
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
     const data = await response.json();

  console.log("✅ Données marchés reçues depuis l'API:", data);

  return data;
  },

  // Créer un nouveau marché
  create: async (data: CreateMarketForm): Promise<Market> => {
  const response = await fetch(`${API_BASE_URL}/marchees`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      nom: data.nom,
      adresse: data.adresse,
      nbrPlace: data.nbrPlace ? parseInt(data.nbrPlace) : null,
      description: data.description || null,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur ${response.status}: ${errorText}`);
  }

  const result = await response.json();

  // ✅ Extraire uniquement le marché créé
  if (!result.success) {
    throw new Error(result.message || "Erreur inconnue");
  }

  return result.data as Market;
},


  // Modifier un marché
  update: async (id: number, data: Partial<Market>): Promise<Market> => {
    const response = await fetch(`${API_BASE_URL}/marches/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Supprimer un marché
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/marchees/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`
      },
    });
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
  },

  // Récupérer les détails d'un marché
  getById: async (id: number): Promise<Market> => {
    const response = await fetch(`${API_BASE_URL}/marchees/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`
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

// Fonction pour obtenir le badge de taux d'occupation
const getOccupationBadge = (tauxOccupation: number) => {
  let variant: 'success' | 'warning' | 'danger' = 'danger';
  
  if (tauxOccupation >= 90) variant = 'success';
  else if (tauxOccupation >= 70) variant = 'warning';
  
  return (
    <StatusBadge 
      status={`${tauxOccupation}%`} 
      variant={variant}
      size="sm"
    />
  );
};

// Configuration des colonnes du tableau
const getTableColumns = (): TableColumn<Market>[] => [
  {
    key: 'nom',
    header: 'Nom du marché',
    sortable: true,
    render: (market) => (
      <div>
        <div className="font-medium text-gray-900">{market.nom}</div>
        {market.adresse && (
          <div className="text-sm text-gray-500">{market.adresse}</div>
        )}
      </div>
    ),
  },
  {
    key: 'nbrPlace',
    header: 'Places',
    sortable: true,
    className: 'text-center',
    render: (market) => (
      <span className="font-medium">{market.totalPlaces || 0}</span>
    ),
  },
  {
    key: 'tauxOccupation',
    header: 'Taux d\'occupation',
    sortable: true,
    className: 'text-center',
    render: (market) => getOccupationBadge(market.tauxOccupation || 0),
  },
  {
    key: 'statut',
    header: 'Statut',
    sortable: true,
    className: 'text-center',
    render: (market) => (
      <StatusBadge status={market.statut || 'Actif'} />
    ),
  },
];

// Configuration des actions du tableau
const getTableActions = (
  onViewDetails: (market: Market) => void,
  onEdit: (market: Market) => void,
  onDelete: (market: Market) => void
): TableAction<Market>[] => [
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

// Modal création marché
const CreateMarketModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (data: CreateMarketForm) => Promise<void>;
}> = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState<CreateMarketForm>({
    nom: "",
    adresse: "",
    nbrPlace: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom.trim() || !formData.adresse.trim()) {
      setError("Veuillez remplir le nom et l'adresse du marché");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await onSubmit(formData);
      setFormData({ nom: "", adresse: "", nbrPlace: "", description: "" });
      onClose();
    } catch (error: any) {
      console.error("Erreur lors de la création:", error);
      setError(error.message || "Une erreur est survenue lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ nom: "", adresse: "", nbrPlace: "", description: "" });
    setError(null);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title="Créer un nouveau marché"
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
                Nom du marché <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Entrez le nom du marché"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Entrez l'adresse du marché"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de places (optionnel)
              </label>
              <input
                type="number"
                min="1"
                value={formData.nbrPlace}
                onChange={(e) => setFormData({ ...formData, nbrPlace: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Entrez le nombre de places"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optionnel)
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Description du marché"
                disabled={loading}
              />
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
              Créer le marché
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
const MarketsManagement: React.FC = () => {
  const router = useRouter();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les marchés au montage du composant
  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await marketService.getAll();
      setMarkets(data);
    } catch (error: any) {
      console.error("Erreur lors du chargement des marchés:", error);
      setError(error.message || "Impossible de charger les marchés");
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleViewDetails = async (market: Market) => {
    try {
      // Optionnel: récupérer les détails complets depuis le backend
      // const detailedMarket = await marketService.getById(market.id);
      console.log("Voir les détails du marché:", market);
      router.push(`/dashboard/directeur/marches/${market.id}`);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des détails:", error);
      alert("Impossible d'accéder aux détails du marché");
    }
  };

  const handleEdit = async (market: Market) => {
    try {
      console.log("Modifier le marché:", market);
      // Rediriger vers la page de modification
      router.push(`/dashboard/directeur/marches/${market.id}/edit`);
    } catch (error: any) {
      console.error("Erreur lors de l'ouverture de la modification:", error);
      alert("Impossible d'ouvrir la modification");
    }
  };

  const handleDelete = async (market: Market) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le marché "${market.nom}" ?`)) {
      try {
        await marketService.delete(market.id);
        setMarkets(prev => prev.filter(m => m.id !== market.id));
        console.log("Marché supprimé:", market);
      } catch (error: any) {
        console.error("Erreur lors de la suppression:", error);
        alert(error.message || "Impossible de supprimer le marché");
      }
    }
  };

  const handleCreateMarket = async (formData: CreateMarketForm) => {
    try {
      const newMarket = await marketService.create(formData);
      setMarkets(prev => [...prev, newMarket]);
      console.log("Marché créé:", newMarket);
    } catch (error: any) {
      console.error("Erreur lors de la création:", error);
      throw error; // Re-throw pour que le modal puisse afficher l'erreur
    }
  };

  // Configuration du tableau
  const tableColumns = getTableColumns();
  const tableActions = getTableActions(handleViewDetails, handleEdit, handleDelete);

  // Affichage d'erreur
  if (error && !loading && markets.length === 0) {
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
                onClick={loadMarkets}
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
            <h1 className="text-2xl font-bold text-gray-800">Gestion des Marchés</h1>
            <p className="text-gray-600 mt-1">
              Gérez les marchés communaux et leurs informations
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={loadMarkets}
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
              Créer un marché
            </Button>
          </div>
        </div>

        {/* Message d'erreur (si pas bloquant) */}
        {error && markets.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-600">
              Attention: {error}
            </p>
          </div>
        )}

        {/* Tableau des marchés */}
        <DataTable
          data={markets}
          columns={tableColumns}
          actions={tableActions}
          loading={loading}
          title="Liste des marchés"
          searchOptions={{
            placeholder: "Rechercher un marché...",
            searchableFields: ['nom', 'adresse', 'statut'],
          }}
          paginationOptions={{
            itemsPerPage: 10,
            showItemsPerPageSelector: true,
            itemsPerPageOptions: [5, 10, 20, 50],
            showInfo: true,
          }}
          onRowClick={handleViewDetails}
          emptyMessage="Aucun marché trouvé"
          emptyDescription="Commencez par créer votre premier marché"
        />

        {/* Modal de création */}
        <CreateMarketModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateMarket}
        />
      </div>
    </div>
  );
};

export default MarketsManagement;