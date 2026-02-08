"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, User, Calendar, CreditCard, DollarSign, FileText, 
  Clock, CheckCircle, XCircle, MapPin, Phone, Edit, X, Save, AlertTriangle, Unlock
} from "lucide-react";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import API_BASE_URL from "@/services/APIbaseUrl";

// =======================
// Types
// =======================
interface Place {
  id: number;
  nom: string;
  categorieId?: number | null;
  categorieName?: string | null;
  dateDebutOccupation?: string;
  dateFinOccupation?: string | null;
  marcheeName?: string | null;
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
  mois?: string;
  place?: string;
}

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
// Modal de Libération de Place
// =======================
const LiberationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  place: Place | null;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}> = ({ isOpen, onClose, place, onConfirm, isLoading }) => {
  if (!isOpen || !place) return null;

  return (
    <div className="fixed inset-0 bg-black modal-overlay  bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="bg-orange-50 border-b border-orange-200 px-6 py-4 flex items-center">
          <AlertTriangle className="text-orange-500 mr-3" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Confirmation de Libération</h2>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Êtes-vous sûr de vouloir libérer cette place ?
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Place :</span>
              <span className="font-semibold text-gray-900">{place.nom}</span>
            </div>
            {place.marcheeName && (
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Marché :</span>
                <span className="text-gray-900">{place.marcheeName}</span>
              </div>
            )}
            {place.zoneName && (
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Zone :</span>
                <span className="text-gray-900">{place.zoneName}</span>
              </div>
            )}
            {place.categorieName && (
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Catégorie :</span>
                <span className="text-gray-900">{place.categorieName}</span>
              </div>
            )}
          </div>

          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
            <p className="text-sm text-orange-800">
              <strong>Attention :</strong> Cette action libérera définitivement la place. 
              Le marchand n'aura plus accès à cette place.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center disabled:bg-orange-300 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Libération...
                </>
              ) : (
                <>
                  <Unlock size={18} className="mr-2" />
                  Confirmer la libération
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =======================
// Modal de Modification
// =======================
const EditModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  marchand: Marchand;
  onSave: (updatedMarchand: Marchand) => Promise<void>;
}> = ({ isOpen, onClose, marchand, onSave }) => {
  const [formData, setFormData] = useState({
    nom: marchand.nom,
    prenom: marchand.prenom,
    numCIN: marchand.numCIN,
    numTel1: marchand.numTel1 || '',
    adress: marchand.adress || '',
    activite: marchand.activite || '',
    nif: marchand.nif || '',
    stat: marchand.stat || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave({ ...marchand, ...formData });
      onClose();
    } catch (error) {
      // L'erreur est déjà gérée dans handleSaveEdit
      console.error("Erreur lors de la soumission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Modifier le Marchand</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom et Prenom</label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CIN</label>
              <input
                type="text"
                value={formData.numCIN}
                onChange={(e) => setFormData({ ...formData, numCIN: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
              <input
                type="text"
                value={formData.adress}
                onChange={(e) => setFormData({ ...formData, adress: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <input
                type="text"
                value={formData.numTel1}
                onChange={(e) => setFormData({ ...formData, numTel1: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">NIF</label>
              <input
                type="text"
                value={formData.nif}
                onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">STAT</label>
              <input
                type="text"
                value={formData.stat}
                onChange={(e) => setFormData({ ...formData, stat: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              />
            </div>
          </div>
     
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Activité</label>
            <input
              type="text"
              value={formData.activite}
              onChange={(e) => setFormData({ ...formData, activite: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center disabled:bg-blue-300 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =======================
// Page Détails Marchand
// =======================
export default function MarchandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const marchandId = params?.id as string;

  const [marchand, setMarchand] = useState<Marchand | null>(null);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loadingPaiements, setLoadingPaiements] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'history'>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLiberationModalOpen, setIsLiberationModalOpen] = useState(false);
  const [selectedPlaceToLiberate, setSelectedPlaceToLiberate] = useState<Place | null>(null);
  const [isLiberating, setIsLiberating] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Charger le marchand depuis sessionStorage
  useEffect(() => {
    const loadMarchandFromStorage = () => {
      try {
        const storedMarchand = sessionStorage.getItem('selectedMarchand');
        if (storedMarchand) {
          const parsedMarchand = JSON.parse(storedMarchand);
          console.log("✅ Marchand chargé depuis sessionStorage:", parsedMarchand);
          setMarchand(parsedMarchand);
        } else {
          console.error("❌ Aucun marchand trouvé dans sessionStorage");
          router.push('/dashboard/directeur/marchands');
        }
      } catch (error) {
        console.error("Erreur lors du chargement du marchand:", error);
        router.push('/dashboard/directeur/marchand/liste');
      }
    };

    loadMarchandFromStorage();
  }, [marchandId, router]);

  // Charger les paiements quand on change d'onglet
  useEffect(() => {
    if (activeTab === 'payments' && marchand) {
      loadPaiements();
    }
  }, [activeTab, marchand]);

  const loadPaiements = async () => {
    if (!marchand) return;

    try {
      setLoadingPaiements(true);

      const response = await fetch(`${API_BASE_URL}/paiements/marchand/${marchand.id}`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        console.warn(`Erreur ${response.status} lors du chargement des paiements`);
        setPaiements([]);
        return;
      }

      const result = await response.json();

      if (!result || result.length === 0) {
        setPaiements([]);
        return;
      }

      const mapped = result.map((p: any) => ({
        id: p.id,
        date: p.datePaiement ? p.datePaiement.substring(0, 10) : "-",
        montant: p.montant ?? 0,
        type: p.typePaiement ?? "—",
        regisseur: p.nomAgent ?? "—",
        methode: p.modePaiement ?? "—",
        statut: p.motif ?? "—",
        recu: p.recuNumero ?? "—",
        mois: p.moisdePaiement ?? "—",
        place: p.nomPlace ?? "—",
      }));

      console.log("✅ Paiements chargés:", mapped);
      setPaiements(mapped);
    } catch (error) {
      console.error("Erreur chargement paiements:", error);
      setPaiements([]);
    } finally {
      setLoadingPaiements(false);
    }
  };

  const handleBack = () => {
    sessionStorage.removeItem('selectedMarchand');
    router.push('/dashboard/directeur/marchand/liste');
  };

  const handleSaveEdit = async (updatedMarchand: Marchand) => {
    try {
      // Préparer les données à envoyer
      const updateData = {
        nom: updatedMarchand.nom + ' ' + updatedMarchand.prenom,
        numCIN: updatedMarchand.numCIN,
        numTel1: updatedMarchand.numTel1,
        adress: updatedMarchand.adress,
        activite: updatedMarchand.activite,
        nif: updatedMarchand.nif,
        stat: updatedMarchand.stat,
      };

      console.log("📤 Envoi des données à l'API:", updateData);

      // Envoyer la requête PUT à l'API
      const response = await fetch(`${API_BASE_URL}/public/marchands/${marchand?.id}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur ${response.status}: Échec de la mise à jour`);
      }

      const result = await response.json();
      console.log("✅ Marchand mis à jour avec succès:", result);

      // Mettre à jour l'état local et le sessionStorage
      setMarchand(updatedMarchand);
      sessionStorage.setItem('selectedMarchand', JSON.stringify(updatedMarchand));

      // Afficher un message de succès
      alert("✅ Marchand mis à jour avec succès!");

    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour du marchand:", error);
      alert(`❌ Erreur lors de la mise à jour: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      throw error; // Re-throw pour que le modal gère l'état de chargement
    }
  };

  const handleOpenLiberationModal = (place: Place) => {
    setSelectedPlaceToLiberate(place);
    setIsLiberationModalOpen(true);
  };

  const handleLibererPlace = async () => {
    if (!selectedPlaceToLiberate) return;

    setIsLiberating(true);
    
    try {
      console.log(`📤 Libération de la place ${selectedPlaceToLiberate.id}...`);

      const response = await fetch(`${API_BASE_URL}/public/places/${selectedPlaceToLiberate.id}/liberer`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: Échec de la libération`);
      }

      const result = await response.json();
      console.log("✅ Place libérée avec succès:", result);

      // Mettre à jour l'état local en retirant la place libérée
      if (marchand) {
        const updatedPlaces = (marchand.places || []).filter(p => p.id !== selectedPlaceToLiberate.id);
        const updatedMarchand = {
          ...marchand,
          places: updatedPlaces,
          hasPlace: updatedPlaces.length > 0
        };
        
        setMarchand(updatedMarchand);
        sessionStorage.setItem('selectedMarchand', JSON.stringify(updatedMarchand));
      }

      // Fermer le modal et afficher un message de succès
      setIsLiberationModalOpen(false);
      setSelectedPlaceToLiberate(null);
      alert("✅ Place libérée avec succès!");

    } catch (error) {
      console.error("❌ Erreur lors de la libération de la place:", error);
      alert(`❌ Erreur lors de la libération: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsLiberating(false);
    }
  };

  const handleGenerateCard = () => {
    console.log("Générer carte pour:", marchand?.nom);
  };

  if (!marchand) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  const hasDebt = marchand.estEndette === true;
  const hasPlace = marchand.hasPlace === true;
  const places = marchand.places || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal de modification */}
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        marchand={marchand}
        onSave={handleSaveEdit}
      />

      {/* Modal de libération */}
      <LiberationModal
        isOpen={isLiberationModalOpen}
        onClose={() => {
          setIsLiberationModalOpen(false);
          setSelectedPlaceToLiberate(null);
        }}
        place={selectedPlaceToLiberate}
        onConfirm={handleLibererPlace}
        isLoading={isLiberating}
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={handleBack}
              className="flex items-center text-blue-100 hover:text-white transition"
            >
              <ArrowLeft size={20} className="mr-2" />
              Retour à la liste
            </button>
            
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition shadow-md"
            >
              <Edit size={18} className="mr-2" />
              Modifier
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center">
                {marchand.photo ? (
                  <img src={marchand.photo} alt={marchand.nom} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User size={48} className="text-gray-400" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{marchand.nom} {marchand.prenom}</h1>
                <div className="flex items-center space-x-4 text-blue-100">
                  {hasPlace && places.length > 0 && (
                    <span className="flex items-center">
                      <MapPin size={16} className="mr-1" />
                      Place {places[0].nom}
                      {places[0].zoneName && ` - Zone ${places[0].zoneName}`}
                      {places[0].salleName && ` - Hall ${places[0].salleName}`}
                      {places[0].marcheeName && ` - ${places[0].marcheeName}`}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                hasDebt ? 'bg-red-500' : 'bg-green-500'
              }`}>
                {hasDebt ? <XCircle size={16} className="mr-2" /> : <CheckCircle size={16} className="mr-2" />}
                {hasDebt ? 'Endetté' : 'À jour'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={Calendar}
            label="Date début de contrat"
            value={formatShortDate(places[0]?.dateDebutOccupation)}
            color="#3b82f6"
          />
          <StatCard 
            icon={FileText}
            label="Catégorie"
            value={places[0]?.categorieName || 'N/A'}
            subValue={places[0]?.montant ? `Montant: ${places[0].montant} Ar` : ''}
            color="#3b82f6"
          />
          <StatCard 
            icon={CreditCard}
            label="Statut Paiement"
            value={hasDebt ? "Dette" : "OK"}
            subValue={hasDebt ? "En retard" : "Paiements à jour"}
            color={hasDebt ? "#ef4444" : "#10b981"}
          />
          <StatCard 
            icon={Phone}
            label="Contact"
            value={marchand.numTel1 || "N/A"}
            subValue={marchand.numTel1 ? "Disponible" : "Non renseigné"}
            color="#f59e0b"
          />
        </div>

        {/* Alerte dette */}
        {hasDebt && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <XCircle className="text-red-500 mr-3" size={24} />
              <div className="flex-1">
                <h3 className="font-bold text-red-900">Paiements en retard</h3>
                <p className="text-red-700 text-sm mt-1">
                  Ce marchand a des paiements en attente
                </p>
              </div>
              <Button className="bg-red-500 hover:bg-red-600">
                Envoyer rappel
              </Button>
            </div>
          </div>
        )}

        {/* Onglets */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Vue d\'ensemble', icon: FileText },
                { id: 'payments', label: 'Paiements', icon: CreditCard },
                { id: 'history', label: 'Historique', icon: Clock }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm transition ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon size={18} className="mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                {/* Informations Personnelles - Style formulaire */}
                <div className="border-2 border-gray-300 rounded-lg p-6 mb-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-600 font-medium text-center mb-2">Nom et prenom</label>
                      <div className="border-2 border-blue-600 rounded px-4 py-3 text-center bg-white">
                        {marchand.nom} {marchand.prenom}
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-600 font-medium text-center mb-2">NumCIN</label>
                      <div className="border-2 border-blue-600 rounded px-4 py-3 text-center bg-white">
                        {marchand.numCIN}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-600 font-medium text-center mb-2">Telephone</label>
                      <div className="border-2 border-blue-600 rounded px-4 py-3 text-center bg-white">
                        {marchand.numTel1 || 'Non renseigné'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-600 font-medium text-center mb-2">Adresse</label>
                      <div className="border-2 border-blue-600 rounded px-4 py-3 text-center bg-white">
                        {marchand.adress || 'Non renseignée'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-600 font-medium text-center mb-2">Activite</label>
                      <div className="border-2 border-blue-600 rounded px-4 py-3 text-center bg-white">
                        {marchand.activite || 'Non renseignée'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-600 font-medium text-center mb-2">NIF</label>
                      <div className="border-2 border-blue-600 rounded px-4 py-3 text-center bg-white">
                        {marchand.nif || 'Non renseigné'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-600 font-medium text-center mb-2">STAT</label>
                      <div className="border-2 border-blue-600 rounded px-4 py-3 text-center bg-white">
                        {marchand.stat || 'Non renseigné'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Places Occupées */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <MapPin className="mr-2 text-blue-600" size={20} />
                    Places Occupées
                  </h3>
                  {places.length > 0 ? (
                    <div className="space-y-4">
                      {places.map((place) => (
                        <div key={place.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-bold text-lg text-gray-900">{place.nom}</h4>
                              <p className="text-sm text-gray-600">
                                {place.marcheeName}
                                {place.zoneName && ` - ${place.zoneName}`}
                                {place.salleName && ` - ${place.salleName}`}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <StatusBadge status="Occupée" variant="success" size="sm" />
                              <button
                                onClick={() => handleOpenLiberationModal(place)}
                                className="flex items-center px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm"
                              >
                                <Unlock size={16} className="mr-1" />
                                Libérer
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Début occupation:</span>
                              <span className="font-medium">{formatShortDate(place.dateDebutOccupation)}</span>
                            </div>
                            {place.categorieName && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Catégorie:</span>
                                <span className="font-medium">{place.categorieName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <MapPin className="mx-auto text-gray-400 mb-3" size={48} />
                      <p className="text-gray-600">Aucune place attribuée</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Historique des Paiements</h3>
                </div>

                {loadingPaiements ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-500">Chargement des paiements...</p>
                  </div>
                ) : paiements.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Montant</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Régisseur</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Motif</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paiements.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 text-sm">{formatShortDate(p.date)}</td>
                            <td className="px-4 py-4 text-sm">{p.type}</td>
                            <td className="px-4 py-4 text-sm font-semibold">{formatCurrency(p.montant)}</td>
                            <td className="px-4 py-4 text-sm text-gray-600">{p.regisseur}</td>
                            <td className="px-4 py-4 text-sm text-gray-600">{p.statut}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <CreditCard className="mx-auto text-gray-400 mb-3" size={48} />
                    <p className="text-gray-600">Aucun paiement enregistré</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6">Historique des Activités</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="text-blue-600" size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Marchand enregistré</p>
                      <p className="text-sm text-gray-500 mt-1">{formatDate(marchand.dateEnregistrement)}</p>
                    </div>
                  </div>
                  {places.map((place) => (
                    <div key={place.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="text-green-600" size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Attribution de la place {place.nom}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{formatDate(place.dateDebutOccupation)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Actions Rapides</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center">
              <DollarSign className="mx-auto mb-2 text-blue-600" size={24} />
              <span className="text-sm font-medium text-gray-700">Paiement</span>
            </button>
            <button 
              onClick={handleGenerateCard}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-center"
            >
              <CreditCard className="mx-auto mb-2 text-green-600" size={24} />
              <span className="text-sm font-medium text-gray-700">Générer Carte</span>
            </button>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition text-center"
            >
              <Edit className="mx-auto mb-2 text-yellow-600" size={24} />
              <span className="text-sm font-medium text-gray-700">Modifier</span>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-center">
              <MapPin className="mx-auto mb-2 text-purple-600" size={24} />
              <span className="text-sm font-medium text-gray-700">Attribuer Place</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}