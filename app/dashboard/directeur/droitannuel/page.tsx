'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Search, Wallet, Eye } from 'lucide-react';
import API_BASE_URL from '@/services/APIbaseUrl';

interface DroitAnnuel {
  id?: number;
  description: string;
  montant: string;
  dateCreation?: string;
}

export default function DroitsAnnuelsApp() {
  const [droits, setDroits] = useState<DroitAnnuel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingDroit, setViewingDroit] = useState<DroitAnnuel | null>(null);
  const [editingDroit, setEditingDroit] = useState<DroitAnnuel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<DroitAnnuel>({
    description: '',
    montant: '',
  });

  const [formErrors, setFormErrors] = useState<{
    description?: string;
    montant?: string;
  }>({});

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    fetchDroits();
  }, []);

  const fetchDroits = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/public/droits-annuels`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      const data = await response.json();
      setDroits(data);
    } catch (err) {
      setError('Impossible de charger les droits annuels');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: { description?: string; montant?: string } = {};

    if (!formData.description || formData.description.trim() === '') {
      errors.description = 'La description est obligatoire';
    } else if (formData.description.length > 255) {
      errors.description = 'La description ne peut pas dépasser 255 caractères';
    }

    if (!formData.montant || formData.montant === '') {
      errors.montant = 'Le montant est obligatoire';
    } else if (parseFloat(formData.montant) <= 0) {
      errors.montant = 'Le montant doit être positif';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setError('');
    try {
      const url = editingDroit
        ? `${API_BASE_URL}/public/droits-annuels/${editingDroit.id}`
        : `${API_BASE_URL}/public/droits-annuels`;
      const method = editingDroit ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');
      await fetchDroits();
      closeModal();
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce droit annuel ?')) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/public/droits-annuels/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      await fetchDroits();
    } catch (err) {
      setError('Erreur lors de la suppression');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (droit?: DroitAnnuel) => {
    if (droit) {
      setEditingDroit(droit);
      setFormData({ description: droit.description, montant: droit.montant });
    } else {
      setEditingDroit(null);
      setFormData({ description: '', montant: '' });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDroit(null);
    setFormData({ description: '', montant: '' });
    setFormErrors({});
  };

  const openViewModal = (droit: DroitAnnuel) => {
    setViewingDroit(droit);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingDroit(null);
  };

  const filteredDroits = droits.filter((droit) =>
    droit.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0' : num.toLocaleString('fr-MG');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) handleSubmit();
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
                  <Wallet className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                    Droits Annuels
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Gestion et suivi des droits annuels
                  </p>
                </div>
              </div>

              <button
                onClick={() => openModal()}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nouveau Droit</span>
              </button>
            </div>

            <div className="border-t border-gray-100 my-5" />

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par description…"
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
          {loading && droits.length === 0 ? (
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
                      <th className="hidden sm:table-cell px-6 py-3.5 text-left font-semibold">Description</th>
                      <th className="px-6 py-3.5 text-right font-semibold whitespace-nowrap">Montant (Ar)</th>
                      <th className="hidden md:table-cell px-6 py-3.5 text-left font-semibold whitespace-nowrap">Date de création</th>
                      <th className="px-6 py-3.5 text-center font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredDroits.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center">
                          <Wallet className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                          <p className="text-gray-400 text-sm">
                            {searchTerm ? 'Aucun résultat trouvé' : 'Aucun droit annuel enregistré'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredDroits.map((droit, index) => (
                        <tr
                          key={droit.id}
                          className="hover:bg-blue-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 text-gray-400 font-medium text-xs">
                            {index + 1}
                          </td>
                          <td className="hidden sm:table-cell px-6 py-4 text-gray-700 max-w-xs">
                            <span className="line-clamp-2 leading-relaxed">{droit.description}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-bold text-indigo-600">
                              {formatCurrency(droit.montant)}
                            </span>
                            <span className="text-gray-400 text-xs ml-1">Ar</span>
                          </td>
                          <td className="hidden md:table-cell px-6 py-4 text-gray-400 text-xs whitespace-nowrap">
                            {droit.dateCreation ? formatDate(droit.dateCreation) : '—'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openViewModal(droit)}
                                title="Voir"
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden lg:inline">Voir</span>
                              </button>
                              <button
                                onClick={() => openModal(droit)}
                                title="Modifier"
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span className="hidden lg:inline">Modifier</span>
                              </button>
                              <button
                                onClick={() => droit.id && handleDelete(droit.id)}
                                title="Supprimer"
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
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

              {filteredDroits.length > 0 && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    {filteredDroits.length} enregistrement{filteredDroits.length > 1 ? 's' : ''}
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
        {isViewModalOpen && viewingDroit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
              <div className="p-7">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 p-2 rounded-lg">
                      <Wallet className="w-5 h-5 text-indigo-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Détail du Droit</h2>
                  </div>
                  <button onClick={closeViewModal} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Description</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{viewingDroit.description}</p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <p className="text-[11px] font-semibold text-indigo-400 uppercase tracking-widest mb-1.5">Montant</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {formatCurrency(viewingDroit.montant)}
                      <span className="text-base font-medium text-indigo-400 ml-1.5">Ar</span>
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Date de création</p>
                    <p className="text-gray-700 text-sm">
                      {viewingDroit.dateCreation ? formatDate(viewingDroit.dateCreation) : '—'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => { closeViewModal(); openModal(viewingDroit); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 text-sm font-semibold rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
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
                      <Wallet className="w-5 h-5 text-blue-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {editingDroit ? 'Modifier le Droit' : 'Nouveau Droit Annuel'}
                    </h2>
                  </div>
                  <button onClick={closeModal} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-5" onKeyPress={handleKeyPress}>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-gray-50 focus:bg-white transition-colors ${
                        formErrors.description ? 'border-red-400' : 'border-gray-200'
                      }`}
                      rows={3}
                      maxLength={255}
                    />
                    {formErrors.description && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
                    )}
                    <p className="text-gray-400 text-xs mt-1 text-right">
                      {formData.description.length}/255
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Montant (Ar)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.montant}
                      onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                      className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors ${
                        formErrors.montant ? 'border-red-400' : 'border-gray-200'
                      }`}
                    />
                    {formErrors.montant && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.montant}</p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={closeModal}
                      className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2.5 text-sm rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          {editingDroit ? 'Modifier' : 'Créer'}
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
}