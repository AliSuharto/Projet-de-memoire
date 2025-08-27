"use client";

import React, { useState } from "react";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/ui/DataTable";
import Modal, { ModalContent, ModalFooter } from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { Market, TableColumn, TableAction } from "@/app/types/common";

// =======================
// Types locaux
// =======================
interface CreateMarketForm {
  nom: string;
  adresse: string;
  nombreDePlace: string;
  description: string;
}

// =======================
// Données simulées
// =======================
const SAMPLE_MARKETS: Market[] = [
  { 
    id: 1, 
    nom: "Marché Central", 
    adresse: "Place de la République", 
    nombreDePlace: 150, 
    tauxOccupation: 85,
    statut: "Actif",
    dateCreation: "2024-01-15"
  },
  { 
    id: 2, 
    nom: "Marché de Fruits", 
    adresse: "Avenue des Palmiers", 
    nombreDePlace: 80, 
    tauxOccupation: 92,
    statut: "Actif",
    dateCreation: "2024-02-20"
  },
  { 
    id: 3, 
    nom: "Marché aux Poissons", 
    adresse: "Port de pêche", 
    nombreDePlace: 45, 
    tauxOccupation: 78,
    statut: "Maintenance",
    dateCreation: "2024-03-10"
  },
  { 
    id: 4, 
    nom: "Marché des Légumes", 
    adresse: "Zone agricole", 
    nombreDePlace: 120, 
    tauxOccupation: 95,
    statut: "Actif",
    dateCreation: "2024-04-05"
  },
  { 
    id: 5, 
    nom: "Marché Artisanal", 
    adresse: "Centre-ville", 
    nombreDePlace: 60, 
    tauxOccupation: 67,
    statut: "Inactif",
    dateCreation: "2024-05-12"
  },
];

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
    key: 'nombreDePlace',
    header: 'Places',
    sortable: true,
    className: 'text-center',
    render: (market) => (
      <span className="font-medium">{market.nombreDePlace}</span>
    ),
  },
  {
    key: 'tauxOccupation',
    header: 'Taux d\'occupation',
    sortable: true,
    className: 'text-center',
    render: (market) => getOccupationBadge(market.tauxOccupation),
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
const CreateMarketModal: React.FC<{ isOpen: boolean; onClose: () => void; onSubmit: (data: CreateMarketForm) => void }> = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState<CreateMarketForm>({
    nom: "",
    adresse: "",
    nombreDePlace: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom.trim() || !formData.adresse.trim()) {
      alert("Veuillez remplir le nom et l'adresse du marché");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({ nom: "", adresse: "", nombreDePlace: "", description: "" });
      onClose();
    } catch (error) {
      console.error("Erreur lors de la création:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Créer un nouveau marché"
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <ModalContent>
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
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de places (optionnel)
              </label>
              <input
                type="number"
                min="1"
                value={formData.nombreDePlace}
                onChange={(e) => setFormData({ ...formData, nombreDePlace: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Entrez le nombre de places"
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
              />
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
  const [markets, setMarkets] = useState<Market[]>(SAMPLE_MARKETS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading] = useState(false);

  // Handlers
  const handleViewDetails = (market: Market) => {
    console.log("Voir les détails du marché:", market);
    router.push(`/dashboard/prmc/marches/${market.id}`);
  };

  const handleEdit = (market: Market) => {
    console.log("Modifier le marché:", market);
    // TODO: Implémenter la modification
  };

  const handleDelete = (market: Market) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le marché "${market.nom}" ?`)) {
      setMarkets(prev => prev.filter(m => m.id !== market.id));
    }
  };

  const handleCreateMarket = async (formData: CreateMarketForm) => {
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newMarket: Market = {
      id: Math.max(...markets.map(m => m.id)) + 1,
      nom: formData.nom,
      adresse: formData.adresse,
      nombreDePlace: parseInt(formData.nombreDePlace) || 0,
      tauxOccupation: 0,
      statut: "Actif",
      dateCreation: new Date().toISOString().split('T')[0],
      description: formData.description,
    };
    
    setMarkets(prev => [...prev, newMarket]);
    console.log("Marché créé:", newMarket);
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
            <h1 className="text-2xl font-bold text-gray-800">Gestion des Marchés</h1>
            <p className="text-gray-600 mt-1">
              Gérez les marchés communaux et leurs informations
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            icon={Plus}
            className="shadow-sm"
          >
            Créer un marché
          </Button>
        </div>

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
