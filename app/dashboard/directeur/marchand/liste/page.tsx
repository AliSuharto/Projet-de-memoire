"use client";

import React, { useState, useEffect } from "react";
import { Plus, Eye, Edit, CreditCard as CardIcon, MapPin, Phone, ArrowLeft, User, Calendar, CreditCard, DollarSign, FileText, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/ui/DataTable";
import Modal, { ModalContent, ModalFooter } from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { TableColumn, TableAction } from "@/app/types/common";
import API_BASE_URL from "@/services/APIbaseUrl";
import MerchantCardGenerator from "../../carteGenerator/page";

// =======================
// Types
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

const InfoRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="py-2 border-b last:border-none">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-base font-semibold text-gray-900">{value}</p>
  </div>
);

// =======================
// Composant Détails Marchand
// =======================
const MarchandDetailView: React.FC<{
  marchand: Marchand;
  onBack: () => void;
  onEdit: () => void;
  onGenerateCard: () => void;
}> = ({ marchand, onBack, onEdit, onGenerateCard }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'history'>('overview');
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loadingPaiements, setLoadingPaiements] = useState(false);

  useEffect(() => {
    if (activeTab === 'payments') {
      loadPaiements();
    }
  }, [activeTab]);

  const loadPaiements = async () => {
  try {
    setLoadingPaiements(true);
    console.log("Loading payments for marchand ID:", marchand.id);

    const response = await fetch(`${API_BASE_URL}/paiements/marchand/${marchand.id}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) throw new Error("Erreur lors du chargement des paiements");

    const result = await response.json();

    if (!result || result.length === 0) {
      setPaiements([]); // 👉 Important : pas de données fallback ici
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

    setPaiements(mapped);
   

  } catch (error) {
    console.error("Erreur chargement paiements:", error);

    setPaiements([]); // 👉 Pas de fallback, donc affichage "aucun paiement"
  } finally {
    setLoadingPaiements(false);
  }
};


  const hasDebt = marchand.estEndette === true;
  const hasPlace = marchand.hasPlace === true;
  const places = marchand.places || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button 
            onClick={onBack}
            className="flex items-center text-blue-100 hover:text-white mb-4 transition"
          >
            <ArrowLeft size={20} className="mr-2" />
            Retour à la liste
          </button>
          
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
                      Place {places[0].nom}, 
                      Zone {places[0].zoneName ? ` - ${places[0].zoneName}` : ''},
                      Hall {places[0].salleName ? ` - ${places[0].salleName}` : ''}
                      et marchee {places[0].marcheeName ? ` - ${places[0].marcheeName}` : ''}
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
            label="Date debut de contrat"
            value={formatShortDate(places[0]?.dateDebutOccupation)}
            subValue=""
            color="#3b82f6"
          />
          <StatCard 
            icon={TrendingUp}
            label="Catégorie"
            value={places[0]?.categorieName}
            subValue={`montant: ${places[0]?.montant }Ar`}
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
            value={marchand.numTel1 ? "Disponible" : "N/A"}
            subValue={marchand.numTel1 || "Non renseigné"}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <User className="mr-2 text-blue-600" size={20} />
                    Informations Personnelles
                  </h3>
                  <div className="space-y-3">
                    <InfoRow label="Nom complet" value={`${marchand.nom} ${marchand.prenom}`} />
                    <InfoRow label="CIN" value={marchand.numCIN} />
                    <InfoRow label="Téléphone 1" value={marchand.numTel1 || 'Non renseigné'} />
                    {marchand.numTel2 && <InfoRow label="Téléphone 2" value={marchand.numTel2} />}
                    <InfoRow label="Adresse" value={marchand.adress || 'Non renseignée'} />
                    {marchand.activite && <InfoRow label="Activité" value={marchand.activite} />}
                    {marchand.description && (
                      <div className="py-2">
                        <span className="text-gray-600 block mb-1">Description:</span>
                        <p className="text-sm text-gray-900">{marchand.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <MapPin className="mr-2 text-blue-600" size={20} />
                    Places Occupée
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
                            <StatusBadge status="Occupée" variant="success" size="sm" />
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
                    <p className="text-gray-500">Chargement...</p>
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
                            <td className="px-4 py-4 text-sm text-gray-600">{p.statut} </td>
                                   
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
              onClick={onGenerateCard}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-center"
            >
              <CardIcon className="mx-auto mb-2 text-green-600" size={24} />
              <span className="text-sm font-medium text-gray-700">Générer Carte</span>
            </button>
            <button onClick={onEdit} className="p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition text-center">
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
};

// =======================
// Modal Création
// =======================
const CreateMarchandModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (data: CreateMarchandForm) => Promise<void>;
}> = ({ isOpen, onClose, onSubmit }) => {
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
        nom: "", prenom: "", adress: "", description: "",
        numCIN: "", photo: "", numTel1: "", numTel2: "",
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
      nom: "", prenom: "", adress: "", description: "",
      numCIN: "", photo: "", numTel1: "", numTel2: "",
    });
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nouveau Marchand" size="md">
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
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input
                type="text"
                value={formData.adress}
                onChange={(e) => setFormData({ ...formData, adress: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={loading}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone 1</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone 2</label>
                <input
                  type="tel"
                  value={formData.numTel2}
                  onChange={(e) => setFormData({ ...formData, numTel2: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="+261 32 12 345 67"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
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
            <Button type="button" variant="secondary" onClick={handleClose} className="flex-1" disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" loading={loading} className="flex-1" disabled={loading}>
              Enregistrer
            </Button>
          </div>
        </ModalFooter>
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
        {marchand.description || marchand.activite || '-'}
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

  const handleViewDetails = async (marchand: Marchand) => {
    try {
      const fullDetails = await marchandService.getById(marchand.id);
      setSelectedMarchand(fullDetails);
    } catch (error: any) {
      console.error("Erreur détails:", error);
      setSelectedMarchand(marchand);
    }
  };

  const handleEdit = (marchand: Marchand) => {
    router.push(`/dashboard/admin/marchands/${marchand.id}/edit`);
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
    } catch (error: any) {
      throw error;
    }
  };

  // Si un marchand est sélectionné, afficher sa page de détails
  if (selectedMarchand) {
    return (
      <MarchandDetailView
        marchand={selectedMarchand}
        onBack={() => setSelectedMarchand(null)}
        onEdit={() => handleEdit(selectedMarchand)}
        onGenerateCard={() => handleGenerateCard(selectedMarchand)}
      />
    );
  }

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
          <div className="flex space-x-3">
            <Button onClick={loadMarchands} variant="secondary" loading={loading}>
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
            <Button onClick={() => setIsCreateModalOpen(true)} icon={Plus} className="shadow-sm">
              Nouveau marchand
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