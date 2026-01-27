"use client";

import React, { useState, useEffect } from "react";
import { Plus, Eye, Edit, CreditCard as CardIcon,X,MapPin, Phone, ArrowLeft, User, Calendar, CreditCard, DollarSign, FileText, Clock, CheckCircle, XCircle, TrendingUp, Briefcase, Hash, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { TableColumn, TableAction } from "@/app/types/common";
import API_BASE_URL from "@/services/APIbaseUrl";
import MerchantCardGenerator from "../../carteGenerator/page";
import { exportMarchandsToExcel } from "@/components/(Directeur)/ExportMarchands";

// =======================
// Types
// =======================
interface CreateMarchandForm {
  nom: string;
  prenom: string;
  numCIN: string;
  adress: string;
  numTel1: string;
  activite: string;
  nif: string;
  stat: string;
  description: string;
}

interface Place {
  id: number;
  nom: string;
  categorieId?: number | null;
  categorieName?: string | null;
  dateDebutOccupation?: string;
  dateFinOccupation?: string | null;
  marcheeName?: string;
  montant?: number | null;
  zoneName?: string | null;
  salleName?: string | null;
}

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
  activite?: string | null;
  places?: Place[];
  dateEnregistrement?: string;
  estEndette?: boolean | null;
  hasPlace?: boolean;
  nif?: string;
  stat?: string;
}

interface Paiement {
  id: number;
  date: string;
  montant: number;
  type: string;
  regisseur: string;
  methode: string;
  statut: string;
  recu: string;
}

// =======================
// Services API
// =======================
const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

const marchandService = {
  getAll: async (): Promise<Marchand[]> => {
    const response = await fetch(`${API_BASE_URL}/public/marchands`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
    });
    
    if (!response.ok) throw new Error(`Erreur ${response.status}`);
    
    const result = await response.json();
    console.log("Fetched marchands:", result);
    return Array.isArray(result) ? result : (result?.data || result?.marchands || []);
  },
  
  create: async (data: CreateMarchandForm): Promise<Marchand> => {
    const response = await fetch(`${API_BASE_URL}/public/marchands`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(data),
     
    });
   
    if (!response.ok) throw new Error(`Erreur ${response.status}`);
    return await response.json();

  },

  update: async (id: number, data: Partial<Marchand>): Promise<Marchand> => {
    const response = await fetch(`${API_BASE_URL}/public/marchands/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error(`Erreur ${response.status}`);
    return await response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/public/marchands/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
    });
    
    if (!response.ok) throw new Error(`Erreur ${response.status}`);
  },

  getById: async (id: number): Promise<Marchand> => {
    const response = await fetch(`${API_BASE_URL}/public/marchands/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
    });
    
    if (!response.ok) throw new Error(`Erreur ${response.status}`);
    return await response.json();
  },

  getPaiements: async (marchandId: number): Promise<Paiement[]> => {
    const response = await fetch(`${API_BASE_URL}/public/marchands/${marchandId}/paiements`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
    });
    
    if (!response.ok) throw new Error(`Erreur ${response.status}`);
    return await response.json();
  },
};

// =======================
// Utilitaires
// =======================
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-MG', {
    style: 'currency',
    currency: 'MGA',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const formatShortDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('fr-FR');
};

// =======================
// Composants UI
// =======================
const StatCard: React.FC<{
  icon: any;
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
}> = ({ icon: Icon, label, value, subValue, color = "#3b82f6" }) => (
  <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderLeftColor: color }}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-gray-600 text-sm font-medium mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subValue && <p className="text-sm text-gray-500 mt-1">{subValue}</p>}
      </div>
      <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}20` }}>
        <Icon style={{ color }} size={24} />
      </div>
    </div>
  </div>
);

// =======================
// Modal Création
// =======================

const InputField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
  type?: string;
  disabled?: boolean;
}> = ({ label, value, onChange, placeholder, required, icon, type = "text", disabled }) => (
  <div className="relative">
    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative group">
      {icon && (
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full ${icon ? 'pl-8' : 'pl-3'} pr-3 py-2 text-sm border border-gray-200 rounded-lg 
          focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none 
          transition-all duration-200 hover:border-gray-300 bg-gray-50 focus:bg-white`}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
    </div>
  </div>
);

const CreateMarchandModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (data: CreateMarchandForm) => Promise<void>;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateMarchandForm>({
    nom: "",
    prenom: "",
    numCIN: "",
    adress: "",
    numTel1: "",
    activite: "",
    nif: "",
    stat: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  type CreateMarchandPayload = Omit<CreateMarchandForm, "prenom">
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (
    !formData.nom.trim() ||
    !formData.prenom.trim() ||
    !formData.numCIN.trim()
  ) {
    setError("Veuillez remplir tous les champs obligatoires");
    return;
  }

  setLoading(true);
  setError(null);

  try {
    // ✅ Fusion nom + prénom
    const payload: CreateMarchandPayload = {
      ...formData,
      nom: `${formData.nom.trim()} ${formData.prenom.trim()}`,
    };

    // ❌ On supprime prénom avant envoi
    delete (payload as any).prenom;

    await onSubmit(payload);

    // Reset formulaire
    setFormData({
      nom: "",
      prenom: "",
      numCIN: "",
      adress: "",
      numTel1: "",
      activite: "",
      nif: "",
      stat: "",
      description: "",
    });

    onClose();
  } catch (error: any) {
    setError(error.message || "Erreur lors de la création");
  } finally {
    setLoading(false);
  }
};


  const handleClose = () => {
    setFormData({
      nom: "", prenom: "", numCIN: "", adress: "",
      numTel1: "", activite: "", nif: "", stat: "", description: "",
    });
    setError(null);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      size="lg"
      showCloseButton={false}
      className="!max-w-3xl"
    >
      <style>{`
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.2s ease-out;
        }
      `}</style>
      
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Nouveau Marchand</h2>
              <p className="text-blue-100 text-xs">Enregistrer un nouveau marchand</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Content */}
        <div className="px-5 py-4">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border-l-4 border-rose-500 rounded-lg animate-slideUp">
              <p className="text-xs text-rose-700 font-medium">{error}</p>
            </div>
          )}
          
          <div className="space-y-3.5">
            {/* Nom et Prénom */}
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Nom"
                value={formData.nom}
                onChange={(v) => setFormData({ ...formData, nom: v })}
                placeholder="Rakoto"
                required
                icon={<User className="w-3.5 h-3.5" />}
                disabled={loading}
              />
              <InputField
                label="Prénom"
                value={formData.prenom}
                onChange={(v) => setFormData({ ...formData, prenom: v })}
                placeholder="Jean"
                required
                icon={<User className="w-3.5 h-3.5" />}
                disabled={loading}
              />
            </div>

            {/* CIN et Adresse */}
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Numéro CIN"
                value={formData.numCIN}
                onChange={(v) => setFormData({ ...formData, numCIN: v })}
                placeholder="123 456 789 012"
                required
                icon={<Hash className="w-3.5 h-3.5" />}
                disabled={loading}
              />
              <InputField
                label="Adresse"
                value={formData.adress}
                onChange={(v) => setFormData({ ...formData, adress: v })}
                placeholder="Lot II M 45 Antsirabe"
                icon={<MapPin className="w-3.5 h-3.5" />}
                disabled={loading}
              />
            </div>

            {/* Téléphone et Activité */}
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Numéro de téléphone"
                value={formData.numTel1}
                onChange={(v) => setFormData({ ...formData, numTel1: v })}
                placeholder="+261 34 12 345 67"
                type="tel"
                icon={<Phone className="w-3.5 h-3.5" />}
                disabled={loading}
              />
              <InputField
                label="Activité"
                value={formData.activite}
                onChange={(v) => setFormData({ ...formData, activite: v })}
                placeholder="Commerce, Artisanat..."
                icon={<Briefcase className="w-3.5 h-3.5" />}
                disabled={loading}
              />
            </div>

            {/* NIF et STAT */}
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="NIF"
                value={formData.nif}
                onChange={(v) => setFormData({ ...formData, nif: v })}
                placeholder="Numéro NIF"
                icon={<FileText className="w-3.5 h-3.5" />}
                disabled={loading}
              />
              <InputField
                label="STAT"
                value={formData.stat}
                onChange={(v) => setFormData({ ...formData, stat: v })}
                placeholder="Numéro STAT"
                icon={<FileText className="w-3.5 h-3.5" />}
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none 
                  transition-all duration-200 hover:border-gray-300 bg-gray-50 focus:bg-white resize-none"
                placeholder="Informations complémentaires, spécialités, remarques..."
                rows={2}
                disabled={loading}
              />
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm bg-white border border-gray-300 text-gray-700 font-semibold 
                rounded-lg hover:bg-gray-50 transition-all duration-200 hover:shadow-md 
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold 
                rounded-lg hover:shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Enregistrement...</span>
                </>
              ) : (
                <span>Enregistrer</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

// =======================
// Configuration Tableau
// =======================
const getStatutBadge = (estEndette: boolean | null) => {
  if (estEndette === null) {
    return <StatusBadge status='N/A' variant='secondary' size="sm" />;
  }
  return (
    <StatusBadge 
      status={estEndette ? 'Endetté' : 'À jour'} 
      variant={estEndette ? 'danger' : 'success'}
      size="sm"
    />
  );
};

const getPlacesInfo = (places: Place[] | undefined, hasPlace?: boolean) => {
  if (!places || places.length === 0) {
    return (
      <div className="flex items-center text-gray-500">
        <MapPin className="w-4 h-4 mr-1" />
        <span className="text-sm">Pas de place</span>
      </div>
    );
  }

  return (
    <div className="flex items-center text-green-600">
      <MapPin className="w-4 h-4 mr-1" />
      <div>
        {places.map((place) => (
          <div key={place.id} className="text-sm">
            <span className="font-medium">{place.nom}</span>
            {place.marcheeName && (
              <span className="text-gray-500"> - {place.marcheeName}</span>
            )}
            {place.zoneName && (
              <span className="text-gray-500"> / {place.zoneName}</span>
            )}
            {place.salleName && (
              <span className="text-gray-500"> / {place.salleName}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const getTableColumns = (onGenerateCard: (marchand: Marchand) => void): TableColumn<Marchand>[] => [
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
    render: (marchand) => getPlacesInfo(marchand.places, marchand.hasPlace),
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
    key: 'description',
    header: 'Activité',
    sortable: true,
    render: (marchand) => (
      <span className="text-sm text-gray-600">
        {marchand.activite || '-'}
      </span>
    ),
  },
  {
    key: 'estEndette',
    header: 'Statut',
    sortable: true,
    className: 'text-center',
    render: (marchand) => getStatutBadge(marchand.estEndette),
  },
  {
    key: 'dateEnregistrement',
    header: 'Date d\'enregistrement',
    sortable: true,
    render: (marchand) => (
      <span className="text-sm text-gray-600">
        {formatShortDate(marchand.dateEnregistrement)}
      </span>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    sortable: false,
    className: 'text-center',
    render: (marchand) => (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onGenerateCard(marchand);
        }}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
        title="Générer carte"
      >
        <CardIcon size={16} />
        Carte
      </button>
    ),
  },
];

const getTableActions = (
  onViewDetails: (marchand: Marchand) => void,
  onEdit: (marchand: Marchand) => void
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
];

// =======================
// Composant Principal
// =======================
const MarchandsManagement: React.FC = () => {
  const router = useRouter();
  const [marchands, setMarchands] = useState<Marchand[]>([]);
  const [selectedMarchand, setSelectedMarchand] = useState<Marchand | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCardGeneratorOpen, setIsCardGeneratorOpen] = useState(false);
  const [marchandsForCards, setMarchandsForCards] = useState<Marchand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadMarchands();
  }, []);

  const loadMarchands = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await marchandService.getAll();
      setMarchands(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Erreur chargement marchands:", error);
      setError(error.message || "Impossible de charger les marchands");
      setMarchands([]);
    } finally {
      setLoading(false);
    }
  };

const handleViewDetails = (marchand: Marchand) => {
  // Stocker temporairement dans sessionStorage
  sessionStorage.setItem('selectedMarchand', JSON.stringify(marchand));
  router.push(`/dashboard/directeur/marchand/${marchand.id}`);
};

  const handleEdit = (marchand: Marchand) => {
    router.push(`/dashboard/admin/marchand/${marchand.id}/edit`);
  };

  const handleGenerateCard = (marchand: Marchand) => {
    console.log("🎴 Générer carte pour:", marchand.nom, marchand.prenom);
    setMarchandsForCards([marchand]);
    setIsCardGeneratorOpen(true);
  };

  const handleGenerateMultipleCards = () => {
    console.log("🎴 Générer cartes pour tous les marchands");
    setMarchandsForCards(marchands);
    setIsCardGeneratorOpen(true);
  };

  const handleCreateMarchand = async (formData: CreateMarchandForm) => {
    try {
      const newMarchand = await marchandService.create(formData);
      setMarchands(prev => [...prev, newMarchand]);
      await loadMarchands();
    } catch (error: any) {
      throw error;
    }
  };

  // Fonction pour exporter en Excel
  const handleExportToExcel = () => {
    try {
      setIsExporting(true);
      
      console.log("📊 Début de l'export Excel...");
      
      // Option 1: Export simple avec couleurs par marché
      const fileName = exportMarchandsToExcel(marchands);
      
      // Option 2: Export avec statistiques (décommentez si vous préférez)
      // const fileName = exportMarchandsWithStats(marchands);
      
      console.log("✅ Export réussi:", fileName);
      
      // Afficher une notification de succès (optionnel)
      // Si vous avez un système de toast/notification:
      // toast.success(`Fichier exporté avec succès: ${fileName}`);
      
      // Ou simplement un alert:
      alert(`✅ Fichier Excel exporté avec succès!\n\nNom: ${fileName}`);
      
    } catch (error: any) {
      console.error("❌ Erreur lors de l'export:", error);
      
      // Afficher l'erreur à l'utilisateur
      alert(`❌ Erreur lors de l'export:\n${error.message || 'Erreur inconnue'}`);
      
      // Ou avec un toast:
      // toast.error(`Erreur lors de l'export: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  

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
              <Button onClick={loadMarchands} variant="secondary">
                Réessayer
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vue liste des marchands
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
          <div className="flex space-x-4">
            <Button 
              onClick={loadMarchands} 
              variant="secondary" 
              loading={loading}
            >
              Actualiser
            </Button>
            <Button
              onClick={handleGenerateMultipleCards}
              icon={CardIcon}
              variant="secondary"
              disabled={marchands.length === 0}
            >
              Générer cartes ({marchands.length})
            </Button>
            <Button 
              onClick={() => setIsCreateModalOpen(true)} 
              icon={Plus} 
              className="shadow-sm"
            >
              Nouveau marchand
            </Button>
            <Button 
              onClick={handleExportToExcel} 
              icon={Download} 
              className="shadow-sm bg-green-600 hover:bg-green-700 text-white"
              loading={isExporting}
              disabled={marchands.length === 0 || isExporting}
            >
              {isExporting ? 'Export en cours...' : 'Exporter Excel'}
            </Button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Marchands</p>
                <p className="text-2xl font-bold text-gray-900">{marchands.length}</p>
              </div>
              <User className="text-blue-600" size={32} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avec Places</p>
                <p className="text-2xl font-bold text-green-600">
                  {marchands.filter(m => m.hasPlace).length}
                </p>
              </div>
              <MapPin className="text-green-600" size={32} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Endettés</p>
                <p className="text-2xl font-bold text-red-600">
                  {marchands.filter(m => m.estEndette === true).length}
                </p>
              </div>
              <XCircle className="text-red-600" size={32} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">À jour</p>
                <p className="text-2xl font-bold text-green-600">
                  {marchands.filter(m => m.estEndette === false).length}
                </p>
              </div>
              <CheckCircle className="text-green-600" size={32} />
            </div>
          </div>
        </div>

        {/* Message d'information lors de l'export */}
        {isExporting && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-sm text-blue-700 font-medium">
              Génération du fichier Excel en cours... Veuillez patienter.
            </p>
          </div>
        )}

        {/* Message d'erreur */}
        {error && marchands.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-600">Attention: {error}</p>
          </div>
        )}

        {/* Tableau */}
        <DataTable
          data={marchands}
          columns={getTableColumns(handleGenerateCard)}
          actions={getTableActions(handleViewDetails, handleEdit)}
          loading={loading}
          title="Liste des marchands"
          searchOptions={{
            placeholder: "Rechercher un marchand...",
            searchableFields: ['nom', 'prenom', 'numCIN', 'numTel1', 'adress', 'description'],
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

        {/* Modal création */}
        <CreateMarchandModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateMarchand}
        />

        {/* Générateur de cartes */}
        {isCardGeneratorOpen && (
          <MerchantCardGenerator
            marchands={marchandsForCards}
            onClose={() => setIsCardGeneratorOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default MarchandsManagement;