"use client";

import React, { useState, useEffect } from "react";
import { Plus, Eye, Edit, Trash2, MapPin, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/ui/DataTable";
import Modal, { ModalContent, ModalFooter } from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { TableColumn, TableAction } from "@/app/types/common";

// =======================
// Types locaux
// =======================
interface CreateMarchandForm {
  nom: string;
  prenom: string;
  adress?: string;
  description?: string;
  numCIN: string;
  photo?: string;
  numTel1?: string;
  numTel2?: string;
}

// Interface pour les places
interface Place {
  id: number;
  numeroPlace: string;
  secteur?: string;
  marche?: string;
}

// Type Marchand basé sur votre entité
interface Marchand {
  id: number;
  nom: string;
  prenom: string;
  adress?: string;
  description?: string;
  numCIN: string;
  photo?: string;
  numTel1?: string;
  numTel2?: string;
  places?: Place[];
  dateEnregistrement?: string;
  estEndette?: boolean; // Vous devrez peut-être ajouter cette logique côté backend
}

// =======================
// Services API
// =======================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

const marchandService = {
  // Récupérer tous les marchands
  getAll: async (): Promise<Marchand[]> => {
    const response = await fetch(`${API_BASE_URL}/public/marchands`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
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
      return result.data;
    } else if (result && Array.isArray(result.marchands)) {
      return result.marchands;
    } else {
      console.warn('Format de réponse API inattendu:', result);
      return [];
    }
  },

  // Créer un nouveau marchand
  create: async (data: CreateMarchandForm): Promise<Marchand> => {
    const response = await fetch(`${API_BASE_URL}/public/marchands`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({
        nom: data.nom,
        prenom: data.prenom,
        adress: data.adress || null,
        description: data.description || null,
        numCIN: data.numCIN,
        photo: data.photo || null,
        numTel1: data.numTel1 || null,
        numTel2: data.numTel2 || null,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Modifier un marchand
  update: async (id: number, data: Partial<Marchand>): Promise<Marchand> => {
    const response = await fetch(`${API_BASE_URL}/public/marchands/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Supprimer un marchand
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/public/marchands/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
    });
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
  },

  // Récupérer les détails d'un marchand
  getById: async (id: number): Promise<Marchand> => {
    const response = await fetch(`${API_BASE_URL}/public/marchands/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
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

// Fonction pour obtenir le badge de statut d'endettement
const getStatutBadge = (estEndette: boolean) => {
  return (
    <StatusBadge 
      status={estEndette ? 'Endetté' : 'À jour'} 
      variant={estEndette ? 'danger' : 'success'}
      size="sm"
    />
  );
};

// Fonction pour afficher les places attribuées
const getPlacesInfo = (places: Place[] | undefined) => {
  if (!places || places.length === 0) {
    return (
      <div className="flex items-center text-gray-500">
        <MapPin className="w-4 h-4 mr-1" />
        <span className="text-sm">Pas encore attribuée</span>
      </div>
    );
  }

  return (
    <div className="flex items-center text-green-600">
      <MapPin className="w-4 h-4 mr-1" />
      <div>
        {places.map((place, index) => (
          <div key={place.id} className="text-sm">
            Place {place.numeroPlace}
            {place.secteur && (
              <span className="text-gray-500"> - {place.secteur}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Configuration des colonnes du tableau
const getTableColumns = (): TableColumn<Marchand>[] => [
  {
    key: 'nom',
    header: 'Nom et Prénom',
    sortable: true,
    render: (marchand) => (
      <div>
        <div className="font-medium text-gray-900">
          {marchand.nom} {marchand.prenom}
        </div>
        <div className="text-xs text-gray-500">
          CIN: {marchand.numCIN}
        </div>
      </div>
    ),
  },
  {
    key: 'places',
    header: 'Place attribuée',
    sortable: false,
    render: (marchand) => getPlacesInfo(marchand.places),
  },
  {
    key: 'numTel1',
    header: 'Téléphone',
    sortable: true,
    render: (marchand) => (
      <div className="flex items-center">
        {marchand.numTel1 ? (
          <div className="flex items-center text-gray-700">
            <Phone className="w-4 h-4 mr-1" />
            <span className="text-sm">{marchand.numTel1}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">Non renseigné</span>
        )}
      </div>
    ),
  },
  {
    key: 'estEndette',
    header: 'Statut',
    sortable: true,
    className: 'text-center',
    render: (marchand) => getStatutBadge(marchand.estEndette || false),
  },
  {
    key: 'dateEnregistrement',
    header: 'Date d\'enregistrement',
    sortable: true,
    render: (marchand) => (
      <span className="text-sm text-gray-600">
        {marchand.dateEnregistrement ? 
          new Date(marchand.dateEnregistrement).toLocaleDateString('fr-FR') : 
          '-'
        }
      </span>
    ),
  },
];

// Configuration des actions du tableau
const getTableActions = (
  onViewDetails: (marchand: Marchand) => void,
  onEdit: (marchand: Marchand) => void,
  onDelete: (marchand: Marchand) => void
): TableAction<Marchand>[] => [
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

// Modal création marchand
const CreateMarchandModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (data: CreateMarchandForm) => Promise<void>;
}> = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState<CreateMarchandForm>({
    nom: "",
    prenom: "",
    adress: "",
    description: "",
    numCIN: "",
    photo: "",
    numTel1: "",
    numTel2: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom.trim() || !formData.prenom.trim() || !formData.numCIN.trim()) {
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
        adress: "",
        description: "",
        numCIN: "",
        photo: "",
        numTel1: "",
        numTel2: "",
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
      adress: "",
      description: "",
      numCIN: "",
      photo: "",
      numTel1: "",
      numTel2: "",
    });
    setError(null);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title="Enregistrer un nouveau marchand"
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
                Numéro CIN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.numCIN}
                onChange={(e) => setFormData({ ...formData, numCIN: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Numéro de carte d'identité"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse (optionnel)
              </label>
              <input
                type="text"
                value={formData.adress}
                onChange={(e) => setFormData({ ...formData, adress: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Adresse complète"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone 1 (optionnel)
              </label>
              <input
                type="tel"
                value={formData.numTel1}
                onChange={(e) => setFormData({ ...formData, numTel1: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="+261 34 12 345 67"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone 2 (optionnel)
              </label>
              <input
                type="tel"
                value={formData.numTel2}
                onChange={(e) => setFormData({ ...formData, numTel2: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="+261 32 12 345 67"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optionnel)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Type d'activité, spécialité..."
                rows={3}
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
              Enregistrer le marchand
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
const MarchandsManagement: React.FC = () => {
  const router = useRouter();
  const [marchands, setMarchands] = useState<Marchand[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les marchands au montage du composant
  useEffect(() => {
    loadMarchands();
  }, []);

  const loadMarchands = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await marchandService.getAll();
      
      // Vérifier que data est bien un tableau
      if (Array.isArray(data)) {
        setMarchands(data);
      } else {
        console.error('Les données reçues ne sont pas un tableau:', data);
        setMarchands([]);
        setError('Format de données incorrect reçu du serveur');
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement des marchands:", error);
      setError(error.message || "Impossible de charger les marchands");
      setMarchands([]);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleViewDetails = async (marchand: Marchand) => {
    try {
      console.log("Voir les détails du marchand:", marchand);
      router.push(`/dashboard/admin/marchands/${marchand.id}`);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des détails:", error);
      alert("Impossible d'accéder aux détails du marchand");
    }
  };

  const handleEdit = async (marchand: Marchand) => {
    try {
      console.log("Modifier le marchand:", marchand);
      router.push(`/dashboard/admin/marchands/${marchand.id}/edit`);
    } catch (error: any) {
      console.error("Erreur lors de l'ouverture de la modification:", error);
      alert("Impossible d'ouvrir la modification");
    }
  };

  const handleDelete = async (marchand: Marchand) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le marchand "${marchand.nom} ${marchand.prenom}" ?`)) {
      try {
        await marchandService.delete(marchand.id);
        setMarchands(prev => Array.isArray(prev) ? prev.filter(m => m.id !== marchand.id) : []);
        console.log("Marchand supprimé:", marchand);
      } catch (error: any) {
        console.error("Erreur lors de la suppression:", error);
        alert(error.message || "Impossible de supprimer le marchand");
      }
    }
  };

  const handleCreateMarchand = async (formData: CreateMarchandForm) => {
    try {
      const newMarchand = await marchandService.create(formData);
      setMarchands(prev => Array.isArray(prev) ? [...prev, newMarchand] : [newMarchand]);
      console.log("Marchand créé:", newMarchand);
    } catch (error: any) {
      console.error("Erreur lors de la création:", error);
      throw error;
    }
  };

  // Configuration du tableau
  const tableColumns = getTableColumns();
  const tableActions = getTableActions(handleViewDetails, handleEdit, handleDelete);

  // Affichage d'erreur
  if (error && !loading && marchands.length === 0) {
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
                onClick={loadMarchands}
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
            <h1 className="text-2xl font-bold text-gray-800">Gestion des Marchands</h1>
            <p className="text-gray-600 mt-1">
              Gérez l'enregistrement et le suivi des marchands
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={loadMarchands}
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
              Enregistrer un marchand
            </Button>
          </div>
        </div>

        {/* Message d'erreur (si pas bloquant) */}
        {error && marchands.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-600">
              Attention: {error}
            </p>
          </div>
        )}

        {/* Tableau des marchands */}
        <DataTable
          data={marchands}
          columns={tableColumns}
          actions={tableActions}
          loading={loading}
          title="Liste des marchands"
          searchOptions={{
            placeholder: "Rechercher un marchand...",
            searchableFields: ['nom', 'prenom', 'numCIN', 'numTel1', 'adress'],
          }}
          paginationOptions={{
            itemsPerPage: 10,
            showItemsPerPageSelector: true,
            itemsPerPageOptions: [5, 10, 20, 50],
            showInfo: true,
          }}
          onRowClick={handleViewDetails}
          emptyMessage="Aucun marchand trouvé"
          emptyDescription="Commencez par enregistrer votre premier marchand"
        />

        {/* Modal de création */}
        <CreateMarchandModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateMarchand}
        />
      </div>
    </div>
  );
};

export default MarchandsManagement;