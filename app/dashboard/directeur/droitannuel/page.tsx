'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Search, DollarSign } from 'lucide-react';
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
  const [editingDroit, setEditingDroit] = useState<DroitAnnuel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<DroitAnnuel>({
    description: '',
    montant: ''
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
        headers: {
          'Content-Type': 'application/json',
        },
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
      setFormData({
        description: droit.description,
        montant: droit.montant
      });
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

  const filteredDroits = droits.filter(droit =>
    droit.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-xl shadow-lg">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Droits Annuels</h1>
                <p className="text-gray-600 mt-1">Gestion et suivi des droits annuels</p>
              </div>
            </div>
            <button
              onClick={() => openModal()}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nouveau Droit
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-6 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* List */}
        {loading && droits.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : filteredDroits.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {searchTerm ? 'Aucun résultat trouvé' : 'Aucun droit annuel enregistré'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDroits.map((droit) => (
              <div
                key={droit.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-xl">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(droit)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => droit.id && handleDelete(droit.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                  {droit.description}
                </h3>
                <h6 className="text-sm font-light text-gray-800 mb-2 line-clamp-2">
                 Créée le {droit.dateCreation ? formatDate(droit.dateCreation) : 'N/A'}
                </h6>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    {formatCurrency(droit.montant)} Ar
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center modal-overlay justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingDroit ? 'Modifier le Droit' : 'Nouveau Droit Annuel'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="space-y-5" onKeyPress={handleKeyPress}>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                      formErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows={3}
                    maxLength={255}
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    {formData.description.length}/255 caractères
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Montant (Ar)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.montant}
                    onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.montant ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.montant && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.montant}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {editingDroit ? 'Modifier' : 'Créer'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}