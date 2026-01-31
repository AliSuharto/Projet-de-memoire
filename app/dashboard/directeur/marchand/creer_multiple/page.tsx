'use client';

import React, { useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useToast } from '@/components/ui/ToastContainer';
import API_BASE_URL from '@/services/APIbaseUrl';

type MarchandForm = {
  nom: string;
  prenom: string;
  numCIN: string;
  numTel1?: string;
  nif?: string;
  stat?: string;
  adress?: string;
  description?: string;
  activite?: string;
};

type TabType = 'individual' | 'batch';

export default function MarchandsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('individual');
  const { showSuccess, showError } = useToast();
  
  // États pour l'enregistrement individuel
  const [form, setForm] = useState<MarchandForm>({ nom: '', prenom: '', numCIN: '' });
  const [submitting, setSubmitting] = useState(false);
  const [progressIndividual, setProgressIndividual] = useState<number>(0);
  const [messageIndividual, setMessageIndividual] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  // États pour l'importation en lot
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [progressBatch, setProgressBatch] = useState(0);
  const [messageBatch, setMessageBatch] = useState<string | null>(null);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const excelInputRef = useRef<HTMLInputElement | null>(null);

  const canSubmitIndividual = useMemo(() => {
    return form.nom.trim() !== '' && form.prenom.trim() !== '' && form.numCIN.trim() !== '' && !submitting;
  }, [form, submitting]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetIndividualForm = () => {
    setForm({ nom: '', prenom: '', numCIN: '', nif: '', stat: '', numTel1: '', activite: '', adress: '', description: '' });
    setProgressIndividual(0);
    setMessageIndividual(null);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const handleIndividualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!API_BASE_URL) {
      setMessageIndividual({ type: 'error', text: 'URL de l\'API non configurée.' });
      return;
    }

    try {
      setSubmitting(true);
      setMessageIndividual(null);
      setProgressIndividual(0);

      // Créer un objet JSON au lieu de FormData
      const payload = {
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        numCIN: form.numCIN.trim(),
        numTel1: form.numTel1?.trim() || null,
        nif: form.nif?.trim() || null,
        stat: form.stat?.trim() || null,
        activite: form.activite?.trim() || null,
        adress: form.adress?.trim() || null,
        description: form.description?.trim() || null
      };

      const url = `${API_BASE_URL}/public/marchands`;

      const res = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          const pct = Math.round((evt.loaded * 100) / evt.total);
          setProgressIndividual(pct);
        },
      });

      const ok = res?.data?.success === true;
      if (ok) {
        const marchandName = `${form.prenom} ${form.nom}`;
        showSuccess('Marchand créé avec succès', `${marchandName} a été ajouté avec succès`);
        resetIndividualForm();
      } else {
        const msg = res?.data?.message || 'Création échouée.';
        showError('Erreur de création', msg);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Erreur inconnue';
      showError('Erreur', `Erreur lors de la création: ${msg}`);
    } finally {
      setSubmitting(false);
      setProgressIndividual(0);
    }
  };

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setExcelFile(e.target.files[0]);
      setMessageBatch(null);
    }
  };

  const resetBatchForm = () => {
    setExcelFile(null);
    setProgressBatch(0);
    setMessageBatch(null);
    if (excelInputRef.current) excelInputRef.current.value = '';
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!excelFile) {
      setMessageBatch("Veuillez sélectionner un fichier Excel (.xlsx ou .xls)");
      return;
    }

    const formData = new FormData();
    formData.append("file", excelFile);

    try {
      setLoadingBatch(true);
      setProgressBatch(0);
      setMessageBatch(null);

      const response = await axios.post(`${API_BASE_URL}/public/marchands/import/excel`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgressBatch(percent);
          }
        },
      });

      if (response.data?.success === true || response.status === 200) {
        showSuccess('Importation réussie', 'Tous les marchands ont été importés avec succès');
      } else {
        showError('Importation incomplète', response.data?.message || "Voir les détails de l'importation");
      }

      resetBatchForm();
    } catch (error: any) {
      const backendMsg = error.response?.data?.message;
      const defaultMsg = "Erreur lors de l'importation du fichier";

      if (backendMsg && typeof backendMsg === "string" && backendMsg.includes("échoué")) {
        showError('Erreur d\'importation', backendMsg);
      } else {
        showError('Erreur', defaultMsg);
      }
    } finally {
      setLoadingBatch(false);
      setProgressBatch(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6 lg:p-0 pt-20 md:pt-6">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header avec titre et boutons de navigation */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Ajouter des Marchands
            </h1>
            <p className="text-gray-600 mt-2">Ajoutez et gérez vos marchands facilement</p>
          </div>
          
          {/* Boutons de navigation en haut à droite */}
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('individual')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'individual'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-200 scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Individuel
            </button>
            <button
              onClick={() => setActiveTab('batch')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'batch'
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-200 scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Importation
            </button>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {activeTab === 'individual' ? (
            /* Formulaire d'enregistrement individuel */
            <div className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Nouveau Marchand</h2>
                  <p className="text-sm text-gray-500">Remplissez les informations du marchand</p>
                </div>
              </div>
              
              <form onSubmit={handleIndividualSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="nom"
                      type="text"
                      required
                      value={form.nom}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                      placeholder="Ex: Rakoto"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="prenom"
                      type="text"
                      required
                      value={form.prenom}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                      placeholder="Ex: Jean"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Numéro CIN <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="numCIN"
                      type="text"
                      required
                      value={form.numCIN}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                      placeholder="Ex: 101234567890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      name="numTel1"
                      type="tel"
                      value={form.numTel1 || ''}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                      placeholder="Ex: 0321234567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Activité
                    </label>
                    <input
                      name="activite"
                      type="text"
                      value={form.activite || ''}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                      placeholder="Ex: Boucher, Épicier"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Adresse
                    </label>
                    <input
                      name="adress"
                      type="text"
                      value={form.adress || ''}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                      placeholder="Ex: Lot IVA 123 Antsirabe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      NIF
                    </label>
                    <input
                      name="nif"
                      type="text"
                      value={form.nif || ''}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                      placeholder="Ex: 1234567890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      STAT
                    </label>
                    <input
                      name="stat"
                      type="text"
                      value={form.stat || ''}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                      placeholder="Ex: 12345678901234"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description || ''}
                    onChange={handleChange}
                    rows={4}
                    className="w-full resize-y rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    placeholder="Informations supplémentaires sur le marchand..."
                  />
                </div>

                {submitting && progressIndividual > 0 && (
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2 text-sm font-medium text-indigo-700">
                      <span>Envoi en cours...</span>
                      <span>{progressIndividual}%</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-indigo-200">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-300 rounded-full" 
                        style={{ width: `${progressIndividual}%` }} 
                      />
                    </div>
                  </div>
                )}

                {messageIndividual && (
                  <div
                    className={`rounded-xl border-2 px-5 py-4 flex items-start gap-3 ${
                      messageIndividual.type === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-red-200 bg-red-50 text-red-800'
                    }`}
                  >
                    {messageIndividual.type === 'success' ? (
                      <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <span className="font-medium">{messageIndividual.text}</span>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={!canSubmitIndividual}
                    className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 text-white font-semibold shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                  >
                    {submitting ? 'Création en cours...' : '✓ Créer le marchand'}
                  </button>
                  <button
                    type="button"
                    onClick={resetIndividualForm}
                    className="px-6 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200"
                  >
                    Réinitialiser
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Interface d'importation en lot */
            <div className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Importation Excel</h2>
                  <p className="text-sm text-gray-500">Importez plusieurs marchands en une seule fois</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 mb-3">Format du fichier Excel</h3>
                    <div className="space-y-2 text-sm text-blue-800">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span><strong>Obligatoires :</strong> nom, prenom, numCIN</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        <span><strong>Optionnels :</strong> numTel1, adress, activite, nif, stat, description</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
                        <span><strong>Formats :</strong> .xlsx, .xls</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleBatchSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Sélectionner le fichier Excel
                  </label>
                  <div className="relative">
                    <input
                      ref={excelInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleExcelFileChange}
                      className="block w-full text-sm text-gray-600
                        file:mr-4 file:py-3 file:px-6
                        file:rounded-xl file:border-0
                        file:text-sm file:font-semibold
                        file:bg-gradient-to-r file:from-emerald-600 file:to-green-600 file:text-white
                        file:cursor-pointer
                        hover:file:from-emerald-700 hover:file:to-green-700
                        file:transition-all file:duration-200
                        cursor-pointer
                        border-2 border-dashed border-gray-300 rounded-xl
                        p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    />
                  </div>
                  {excelFile && (
                    <div className="mt-4 flex items-center gap-3 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                      <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-emerald-900">Fichier sélectionné</p>
                        <p className="text-sm text-emerald-700">{excelFile.name}</p>
                      </div>
                    </div>
                  )}
                </div>

                {progressBatch > 0 && (
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2 text-sm font-medium text-emerald-700">
                      <span>Importation en cours...</span>
                      <span>{progressBatch}%</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-emerald-200">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-600 to-green-600 transition-all duration-300 rounded-full" 
                        style={{ width: `${progressBatch}%` }} 
                      />
                    </div>
                  </div>
                )}

                {messageBatch && (
                  <div
                    className={`rounded-xl border-2 px-5 py-4 flex items-start gap-3 ${
                      messageBatch.includes('succès') || messageBatch.includes('importé')
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-red-200 bg-red-50 text-red-800'
                    }`}
                  >
                    {messageBatch.includes('succès') || messageBatch.includes('importé') ? (
                      <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <span className="font-medium">{messageBatch}</span>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={!excelFile || loadingBatch}
                    className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-4 text-white font-semibold shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                  >
                    {loadingBatch ? 'Importation en cours...' : '↑ Importer les marchands'}
                  </button>
                  <button
                    type="button"
                    onClick={resetBatchForm}
                    className="px-6 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200"
                  >
                    Réinitialiser
                  </button>
                
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}