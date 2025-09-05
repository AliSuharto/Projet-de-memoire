'use client';

import React, { useMemo, useRef, useState } from 'react';
import axios from 'axios';

/**
 * Page combinée pour la gestion des Marchands
 * - Enregistrement individuel (formulaire)
 * - Importation en lot via fichier Excel
 * - Interface avec onglets pour basculer entre les deux modes
 */

const API_BASE_URL = 'http://localhost:8080/api';

// Types
type MarchandForm = {
  nom: string;
  prenom: string;
  numCIN: string;
  numTel1?: string;
  numTel2?: string;
  adress?: string;
  description?: string;
};

type TabType = 'individual' | 'batch';

export default function MarchandsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('individual');
  
  // États pour l'enregistrement individuel
  const [form, setForm] = useState<MarchandForm>({ nom: '', prenom: '', numCIN: '' });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

  // Validation pour l'enregistrement individuel
  const canSubmitIndividual = useMemo(() => {
    return form.nom.trim() !== '' && form.prenom.trim() !== '' && form.numCIN.trim() !== '' && !submitting;
  }, [form, submitting]);

  // Handlers pour l'enregistrement individuel
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPhotoFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const resetIndividualForm = () => {
    setForm({ nom: '', prenom: '', numCIN: '', numTel1: '', numTel2: '', adress: '', description: '' });
    setPhotoFile(null);
    setPreviewUrl(null);
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

      const fd = new FormData();
      fd.append('nom', form.nom.trim());
      fd.append('prenom', form.prenom.trim());
      fd.append('numCIN', form.numCIN.trim());
      if (form.numTel1) fd.append('numTel1', form.numTel1.trim());
      if (form.numTel2) fd.append('numTel2', form.numTel2.trim());
      if (form.adress) fd.append('adress', form.adress.trim());
      if (form.description) fd.append('description', form.description.trim());
      if (photoFile) fd.append('photo', photoFile);

      const url = `${API_BASE_URL}/public/marchands`;

      const res = await axios.post(url, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          const pct = Math.round((evt.loaded * 100) / evt.total);
          setProgressIndividual(pct);
        },
      });

      const ok = res?.data?.success === true;
      if (ok) {
        setMessageIndividual({ type: 'success', text: 'Marchand créé avec succès ✔' });
        resetIndividualForm();
      } else {
        const msg = res?.data?.message || 'Création échouée.';
        setMessageIndividual({ type: 'error', text: msg });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Erreur inconnue';
      setMessageIndividual({ type: 'error', text: `Erreur lors de la création: ${msg}` });
    } finally {
      setSubmitting(false);
      setProgressIndividual(0);
    }
  };

  // Handlers pour l'importation en lot
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

      setMessageBatch(response.data.message);
      resetBatchForm();
    } catch (error: any) {
      setMessageBatch(error.response?.data?.message || "Erreur lors de l'importation");
    } finally {
      setLoadingBatch(false);
    }
  };

  // Composant Tab
  const Tab = ({ id, label, active, onClick }: { id: TabType; label: string; active: boolean; onClick: (id: TabType) => void }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
        active
          ? 'text-indigo-600 border-indigo-600 bg-indigo-50'
          : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-0">
        <div className=" mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Ajout de Marchand</h1>
          <p className="text-gray-600 mt-2">Enregistrez les marchands individuellement ou importez-les en lot via Excel</p>
        </div>

        {/* Onglets */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <Tab
                id="individual"
                label="📝 Enregistrement individuel"
                active={activeTab === 'individual'}
                onClick={setActiveTab}
              />
              <Tab
                id="batch"
                label="📊 Importation en lot"
                active={activeTab === 'batch'}
                onClick={setActiveTab}
              />
            </nav>
          </div>
        </div>

        {/* Contenu selon l'onglet actif */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {activeTab === 'individual' ? (
            /* Formulaire d'enregistrement individuel */
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Créer un nouveau marchand</h2>
              
              <form onSubmit={handleIndividualSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                      Nom <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="nom"
                      name="nom"
                      type="text"
                      required
                      value={form.nom}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Ex: Rakoto"
                    />
                  </div>

                  <div>
                    <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="prenom"
                      name="prenom"
                      type="text"
                      required
                      value={form.prenom}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Ex: Jean"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="numCIN" className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro CIN <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="numCIN"
                    name="numCIN"
                    type="text"
                    required
                    value={form.numCIN}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ex: 123456789012"
                  />
                  <p className="text-xs text-gray-500 mt-1">Doit être unique en base</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="numTel1" className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone 1
                    </label>
                    <input
                      id="numTel1"
                      name="numTel1"
                      type="tel"
                      value={form.numTel1 || ''}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Ex: 0321234567"
                    />
                  </div>
                  <div>
                    <label htmlFor="numTel2" className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone 2
                    </label>
                    <input
                      id="numTel2"
                      name="numTel2"
                      type="tel"
                      value={form.numTel2 || ''}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Ex: 0339876543"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="adress" className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <input
                    id="adress"
                    name="adress"
                    type="text"
                    value={form.adress || ''}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ex: Ambalavola"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ex: Marchand de légumes"
                  />
                </div>

                <div>
                  <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">
                    Photo du marchand
                  </label>
                  <input
                    ref={photoInputRef}
                    id="photo"
                    name="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm file:mr-4 file:rounded-md file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-700"
                  />
                  {previewUrl && (
                    <div className="mt-3">
                      <img src={previewUrl} alt="Preview" className="h-32 w-32 rounded-lg object-cover ring-1 ring-gray-200" />
                    </div>
                  )}
                </div>

                {submitting && (
                  <div className="w-full">
                    <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                      <span>Upload en cours…</span>
                      <span>{progressIndividual}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full bg-indigo-600 transition-all" style={{ width: `${progressIndividual}%` }} />
                    </div>
                  </div>
                )}

                {messageIndividual && (
                  <div
                    role="alert"
                    className={`rounded-lg border px-4 py-3 text-sm ${
                      messageIndividual.type === 'success'
                        ? 'border-green-200 bg-green-50 text-green-800'
                        : 'border-red-200 bg-red-50 text-red-800'
                    }`}
                  >
                    {messageIndividual.text}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={!canSubmitIndividual}
                    className="rounded-lg bg-indigo-600 px-6 py-2.5 text-white font-medium shadow hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
                  >
                    {submitting ? 'Envoi…' : 'Créer le marchand'}
                  </button>
                  <button
                    type="button"
                    onClick={resetIndividualForm}
                    className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-gray-700 font-medium shadow-sm hover:bg-gray-50 transition-colors"
                  >
                    Réinitialiser
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Interface d'importation en lot */
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Importer des marchands via Excel</h2>
              
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-2">📋 Format requis pour le fichier Excel :</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>Colonnes obligatoires :</strong> nom, prenom, numCIN</li>
                    <li>• <strong>Colonnes optionnelles :</strong> numTel1, numTel2, adress, description</li>
                    <li>• <strong>Formats acceptés :</strong> .xlsx, .xls</li>
                  </ul>
                </div>

                <form onSubmit={handleBatchSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="excel-file" className="block text-sm font-medium text-gray-700 mb-2">
                      Fichier Excel
                    </label>
                    <input
                      ref={excelInputRef}
                      id="excel-file"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleExcelFileChange}
                      className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm file:mr-4 file:rounded-md file:border-0 file:bg-green-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-green-700"
                    />
                    {excelFile && (
                      <p className="mt-2 text-sm text-gray-600">
                        Fichier sélectionné: <span className="font-medium">{excelFile.name}</span>
                      </p>
                    )}
                  </div>

                  {progressBatch > 0 && (
                    <div className="w-full">
                      <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                        <span>Importation en cours…</span>
                        <span>{progressBatch}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div className="h-full bg-green-600 transition-all" style={{ width: `${progressBatch}%` }} />
                      </div>
                    </div>
                  )}

                  {messageBatch && (
                    <div
                      className={`rounded-lg border px-4 py-3 text-sm ${
                        messageBatch.includes('succès') || messageBatch.includes('importé')
                          ? 'border-green-200 bg-green-50 text-green-800'
                          : 'border-red-200 bg-red-50 text-red-800'
                      }`}
                    >
                      {messageBatch}
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={!excelFile || loadingBatch}
                      className="rounded-lg bg-green-600 px-6 py-2.5 text-white font-medium shadow hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
                    >
                      {loadingBatch ? 'Importation…' : '📊 Importer les marchands'}
                    </button>
                    <button
                      type="button"
                      onClick={resetBatchForm}
                      className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-gray-700 font-medium shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      Réinitialiser
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Informations techniques */}
        <div className="mt-8 text-xs text-gray-500 bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-700 mb-2">ℹ️ Informations techniques :</h4>
          <ul className="space-y-1">
            <li>• Ajout un par un: <code className="bg-gray-100 px-1 rounded">Enregistrement individuel</code></li>
            <li>• Ajout multiple: <code className="bg-gray-100 px-1 rounded"> importer un fichier excel pour les marchands</code></li>
            <li>• Les photos ne sont supportées que pour l'enregistrement individuel</li>
          </ul>
        </div>
      </div>
    </div>
  );
}