"use client";

import React, { useState, useEffect } from "react";
import { Plus, Eye, Edit, Trash2, Tag, Search, X, Save, Wallet } from "lucide-react";
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

interface CategorieForm {
  nom: CategorieNom;
  description: string;
  montant: string;
}

// =======================
// Services API
// =======================
const categorieService = {
  getAll: async (): Promise<Categorie[]> => {
    const response = await fetch(`${API_BASE_URL}/public/categories`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    return await response.json();
  },

  create: async (data: CategorieForm): Promise<Categorie> => {
    const response = await fetch(`${API_BASE_URL}/public/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom: data.nom,
        description: data.description || null,
        montant: parseFloat(data.montant),
      }),
    });
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || `Erreur ${response.status}`);
    }
    return await response.json();
  },

  update: async (id: number, data: CategorieForm): Promise<Categorie> => {
    const response = await fetch(`${API_BASE_URL}/public/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom: data.nom,
        description: data.description || null,
        montant: parseFloat(data.montant),
      }),
    });
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || `Erreur ${response.status}`);
    }
    return await response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/public/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || `Erreur ${response.status}`);
    }
  },

  getById: async (id: number): Promise<Categorie> => {
    const response = await fetch(`${API_BASE_URL}/public/categories/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    return await response.json();
  },
};

// =======================
// Utilitaires
// =======================
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('fr-MG');
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
    A: 'bg-red-100 text-red-700',
    B: 'bg-orange-100 text-orange-700',
    C: 'bg-yellow-100 text-yellow-700',
    D: 'bg-green-100 text-green-700',
    E: 'bg-blue-100 text-blue-700',
    F: 'bg-indigo-100 text-indigo-700',
    G: 'bg-purple-100 text-purple-700',
    H: 'bg-pink-100 text-pink-700',
  };
  return colors[nom] || 'bg-gray-100 text-gray-600';
};

// =======================
// Composant principal
// =======================
const CategoriesManagement: React.FC = () => {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingCategorie, setEditingCategorie] = useState<Categorie | null>(null);
  const [viewingCategorie, setViewingCategorie] = useState<Categorie | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<CategorieForm>({
    nom: CategorieNom.A,
    description: '',
    montant: '',
  });
  const [formErrors, setFormErrors] = useState<{ nom?: string; montant?: string }>({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await categorieService.getAll();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Impossible de charger les catégories');
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const maxPrice = categories.length > 0 ? Math.max(...categories.map(c => c.montant)) : 0;
  const minPrice = categories.length > 0 ? Math.min(...categories.map(c => c.montant)) : 0;

  // Filtrage
  const filteredCategories = categories.filter(c =>
    c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Validation
  const validateForm = (): boolean => {
    const errors: { nom?: string; montant?: string } = {};
    if (!formData.nom) errors.nom = 'Le nom est obligatoire';
    if (!formData.montant || parseFloat(formData.montant) <= 0)
      errors.montant = 'Le montant doit être positif';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setFormLoading(true);
    setFormError('');
    try {
      if (editingCategorie) {
        const updated = await categorieService.update(editingCategorie.id, formData);
        setCategories(prev => prev.map(c => c.id === editingCategorie.id ? updated : c));
      } else {
        const created = await categorieService.create(formData);
        setCategories(prev => [...prev, created]);
      }
      closeModal();
    } catch (err: any) {
      setFormError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (categorie: Categorie) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${categorie.nom}" ?`)) return;
    try {
      await categorieService.delete(categorie.id);
      setCategories(prev => prev.filter(c => c.id !== categorie.id));
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  const openModal = (categorie?: Categorie) => {
    if (categorie) {
      setEditingCategorie(categorie);
      setFormData({
        nom: categorie.nom,
        description: categorie.description || '',
        montant: categorie.montant.toString(),
      });
    } else {
      setEditingCategorie(null);
      setFormData({ nom: CategorieNom.A, description: '', montant: '' });
    }
    setFormErrors({});
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategorie(null);
    setFormData({ nom: CategorieNom.A, description: '', montant: '' });
    setFormErrors({});
    setFormError('');
  };

  const openViewModal = async (categorie: Categorie) => {
    try {
      const detailed = await categorieService.getById(categorie.id);
      setViewingCategorie(detailed);
      setIsViewModalOpen(true);
    } catch {
      setViewingCategorie(categorie);
      setIsViewModalOpen(true);
    }
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingCategorie(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Header card ── */}
        <div className="bg-white rounded-2xl shadow-b-sm overflow-hidden">
         
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3.5 rounded-xl shadow-sm">
                  <Tag className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                    Gestion des Catégories
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Gérez les catégories de places et leurs tarifs
                  </p>
                </div>
              </div>
              <button
                onClick={() => openModal()}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Créer une catégorie
              </button>
            </div>

            <div className="border-t border-gray-100 my-5" />

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une catégorie…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        
        

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3.5 rounded-xl text-sm flex items-center gap-2">
            <X className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* ── Table card ── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto" />
              <p className="mt-4 text-sm text-gray-500">Chargement…</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs uppercase tracking-wider">
                      <th className="px-6 py-3.5 text-left font-semibold w-12">#</th>
                      <th className="px-6 py-3.5 text-left font-semibold">Catégorie</th>
                      <th className="hidden sm:table-cell px-6 py-3.5 text-left font-semibold">Description</th>
                      <th className="px-6 py-3.5 text-right font-semibold whitespace-nowrap">Montant (Ar)</th>
                      <th className="hidden md:table-cell px-6 py-3.5 text-left font-semibold whitespace-nowrap">Date de création</th>
                      <th className="px-6 py-3.5 text-center font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCategories.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <Tag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                          <p className="text-gray-400 text-sm">
                            {searchTerm ? 'Aucun résultat trouvé' : 'Aucune catégorie enregistrée'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.map((categorie, index) => (
                        <tr
                          key={categorie.id}
                          className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                          onClick={() => openViewModal(categorie)}
                        >
                          <td className="px-6 py-4 text-gray-400 font-medium text-xs">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${getCategoryColor(categorie.nom)}`}>
                                {categorie.nom}
                              </div>
                              <span className="font-medium text-gray-800">Catégorie {categorie.nom}</span>
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-6 py-4 text-gray-500 max-w-xs">
                            {categorie.description ? (
                              <span className="line-clamp-1 text-sm">{categorie.description}</span>
                            ) : (
                              <span className="text-gray-300 italic text-sm">Aucune description</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-bold text-indigo-600">
                              {formatCurrency(categorie.montant)}
                            </span>
                            <span className="text-gray-400 text-xs ml-1">Ar</span>
                          </td>
                          <td className="hidden md:table-cell px-6 py-4 text-gray-400 text-xs whitespace-nowrap">
                            {formatDate(categorie.dateCreation)}
                          </td>
                          <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openViewModal(categorie)}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                                title="Voir"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden lg:inline">Voir</span>
                              </button>
                              <button
                                onClick={() => openModal(categorie)}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Modifier"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span className="hidden lg:inline">Modifier</span>
                              </button>
                              <button
                                onClick={() => handleDelete(categorie)}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden lg:inline">Supprimer</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {filteredCategories.length > 0 && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    {filteredCategories.length} enregistrement{filteredCategories.length > 1 ? 's' : ''}
                    {searchTerm && ` pour « ${searchTerm} »`}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                    >
                      Effacer la recherche
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── View Modal ── */}
        {isViewModalOpen && viewingCategorie && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
              <div className="p-7">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getCategoryColor(viewingCategorie.nom)}`}>
                      {viewingCategorie.nom}
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Catégorie {viewingCategorie.nom}
                    </h2>
                  </div>
                  <button onClick={closeViewModal} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Description</p>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {viewingCategorie.description || <span className="text-gray-400 italic">Aucune description</span>}
                    </p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <p className="text-[11px] font-semibold text-indigo-400 uppercase tracking-widest mb-1.5">Montant</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {formatCurrency(viewingCategorie.montant)}
                      <span className="text-base font-medium text-indigo-400 ml-1.5">Ar</span>
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Date de création</p>
                    <p className="text-gray-700 text-sm">{formatDate(viewingCategorie.dateCreation)}</p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => { closeViewModal(); openModal(viewingCategorie); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 text-sm font-semibold rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                  <button
                    onClick={closeViewModal}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl font-semibold hover:bg-gray-50 transition-colors text-center"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Create / Edit Modal ── */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
              <div className="p-7">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <Tag className="w-5 h-5 text-blue-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {editingCategorie ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                    </h2>
                  </div>
                  <button onClick={closeModal} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {formError && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-xl">
                    {formError}
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom de la catégorie <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value as CategorieNom })}
                      disabled={formLoading}
                      className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors ${
                        formErrors.nom ? 'border-red-400' : 'border-gray-200'
                      }`}
                    >
                      {Object.values(CategorieNom).map((nom) => (
                        <option key={nom} value={nom}>Catégorie {nom}</option>
                      ))}
                    </select>
                    {formErrors.nom && <p className="text-red-500 text-xs mt-1">{formErrors.nom}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Montant (Ar) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.montant}
                      onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                      disabled={formLoading}
                      placeholder="0"
                      className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors ${
                        formErrors.montant ? 'border-red-400' : 'border-gray-200'
                      }`}
                    />
                    {formErrors.montant && <p className="text-red-500 text-xs mt-1">{formErrors.montant}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      disabled={formLoading}
                      maxLength={255}
                      rows={3}
                      placeholder="Description (optionnel)"
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors resize-none"
                    />
                    <p className="text-gray-400 text-xs mt-1 text-right">
                      {formData.description.length}/255
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={closeModal}
                      disabled={formLoading}
                      className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={formLoading}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2.5 text-sm rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {formLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          {editingCategorie ? 'Modifier' : 'Créer'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CategoriesManagement;