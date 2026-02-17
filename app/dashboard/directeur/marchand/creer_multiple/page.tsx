'use client';

import React, { useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useToast } from '@/components/ui/ToastContainer';
import API_BASE_URL from '@/services/APIbaseUrl';
import {
  User, Upload, Plus, RotateCcw, Download, FileSpreadsheet,
  Info, CheckCircle2, AlertCircle, X
} from 'lucide-react';

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

// ── Champ de formulaire réutilisable ──────────────────────────────────────────
const Field = ({
  label, name, value, onChange, required, placeholder, type = 'text'
}: {
  label: string; name: string; value: string; required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string;
}) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
      {label} {required && <span className="text-red-400 normal-case tracking-normal">*</span>}
    </label>
    <input
      name={name} type={type} required={required} value={value}
      onChange={onChange} placeholder={placeholder}
      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none
        transition-all focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100
        placeholder:text-gray-300"
    />
  </div>
);

export default function MarchandsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('individual');
  const { showSuccess, showError } = useToast();

  const [form, setForm] = useState<MarchandForm>({ nom: '', prenom: '', numCIN: '' });
  const [submitting, setSubmitting] = useState(false);
  const [progressIndividual, setProgressIndividual] = useState(0);

  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [progressBatch, setProgressBatch] = useState(0);
  const [messageBatch, setMessageBatch] = useState<string | null>(null);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const excelInputRef = useRef<HTMLInputElement | null>(null);

  const canSubmit = useMemo(
    () => form.nom.trim() !== '' && form.prenom.trim() !== '' && form.numCIN.trim() !== '' && !submitting,
    [form, submitting]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({ nom: '', prenom: '', numCIN: '', nif: '', stat: '', numTel1: '', activite: '', adress: '', description: '' });
    setProgressIndividual(0);
  };

  const handleIndividualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setProgressIndividual(0);
      const payload = {
        nom: form.nom.trim(), prenom: form.prenom.trim(), numCIN: form.numCIN.trim(),
        numTel1: form.numTel1?.trim() || null, nif: form.nif?.trim() || null,
        stat: form.stat?.trim() || null, activite: form.activite?.trim() || null,
        adress: form.adress?.trim() || null, description: form.description?.trim() || null,
      };
      const res = await axios.post(`${API_BASE_URL}/public/marchands`, payload, {
        headers: { 'Content-Type': 'application/json' },
        onUploadProgress: (evt) => {
          if (evt.total) setProgressIndividual(Math.round((evt.loaded * 100) / evt.total));
        },
      });
      if (res?.data?.success === true) {
        showSuccess('Marchand créé', `${form.prenom} ${form.nom} a été ajouté avec succès`);
        resetForm();
      } else {
        showError('Erreur', res?.data?.message || 'Création échouée.');
      }
    } catch (err: any) {
      showError('Erreur', err?.response?.data?.message || err?.message || 'Erreur inconnue');
    } finally {
      setSubmitting(false);
      setProgressIndividual(0);
    }
  };

  const resetBatch = () => {
    setExcelFile(null);
    setProgressBatch(0);
    setMessageBatch(null);
    if (excelInputRef.current) excelInputRef.current.value = '';
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!excelFile) { setMessageBatch('Veuillez sélectionner un fichier Excel (.xlsx ou .xls)'); return; }
    const fd = new FormData();
    fd.append('file', excelFile);
    try {
      setLoadingBatch(true);
      setProgressBatch(0);
      setMessageBatch(null);
      const res = await axios.post(`${API_BASE_URL}/public/marchands/import/excel`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (evt.total) setProgressBatch(Math.round((evt.loaded * 100) / evt.total));
        },
      });
      if (res.data?.success === true || res.status === 200) {
        showSuccess('Importation réussie', 'Tous les marchands ont été importés avec succès');
        resetBatch();
      } else {
        showError('Importation incomplète', res.data?.message || "Voir les détails de l'importation");
      }
    } catch (err: any) {
      showError('Erreur', err.response?.data?.message || "Erreur lors de l'importation");
    } finally {
      setLoadingBatch(false);
      setProgressBatch(0);
    }
  };

  // ── Téléchargement du template Excel (fetch depuis /public ou assets) ──────
  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/templates/template_marchands.xlsx'; // placer le fichier dans /public/templates/
    link.download = 'template_marchands.xlsx';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 pt-20 md:pt-6">
      <div className="mx-auto max-w-4xl space-y-5">

        {/* ── Header card ── */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
          <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-md">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 tracking-tight">Ajouter des Marchands</h1>
                <p className="text-sm text-gray-500 mt-0.5">Ajoutez et gérez vos marchands facilement</p>
              </div>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl self-start sm:self-auto">
              <button
                onClick={() => setActiveTab('individual')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'individual'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <User className="w-4 h-4" />
                Individuel
              </button>
              <button
                onClick={() => setActiveTab('batch')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'batch'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Upload className="w-4 h-4" />
                Importation
              </button>
            </div>
          </div>
        </div>

        {/* ── Contenu principal ── */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />

          {activeTab === 'individual' ? (
            /* ── Formulaire individuel ── */
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-50 p-2 rounded-lg">
                  <Plus className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Nouveau Marchand</h2>
                  <p className="text-xs text-gray-500">Les champs marqués * sont obligatoires</p>
                </div>
              </div>

              <form onSubmit={handleIndividualSubmit} className="space-y-5">
                {/* Obligatoires */}
                <div>
                  <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest mb-3">
                    Informations obligatoires
                  </p>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Nom" name="nom" value={form.nom} onChange={handleChange} required placeholder="Ex: Rakoto" />
                    <Field label="Prénom" name="prenom" value={form.prenom} onChange={handleChange} required placeholder="Ex: Jean" />
                    <Field label="Numéro CIN" name="numCIN" value={form.numCIN} onChange={handleChange} required placeholder="Ex: 101234567890" />
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* Optionnels */}
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
                    Informations complémentaires
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Téléphone" name="numTel1" value={form.numTel1 || ''} onChange={handleChange} placeholder="Ex: 0321234567" type="tel" />
                    <Field label="Activité" name="activite" value={form.activite || ''} onChange={handleChange} placeholder="Ex: Boucher, Épicier" />
                    <Field label="Adresse" name="adress" value={form.adress || ''} onChange={handleChange} placeholder="Ex: Lot IVA 123 Antsirabe" />
                    <Field label="NIF" name="nif" value={form.nif || ''} onChange={handleChange} placeholder="Ex: 1234567890" />
                    <Field label="STAT" name="stat" value={form.stat || ''} onChange={handleChange} placeholder="Ex: 12345678901234" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Description</label>
                  <textarea
                    name="description" value={form.description || ''} onChange={handleChange} rows={3}
                    placeholder="Informations supplémentaires sur le marchand…"
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none
                      transition-all focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 placeholder:text-gray-300"
                  />
                </div>

                {/* Barre de progression */}
                {submitting && progressIndividual > 0 && (
                  <div className="bg-indigo-50 rounded-xl p-3">
                    <div className="flex justify-between text-xs font-medium text-indigo-600 mb-1.5">
                      <span>Envoi en cours…</span><span>{progressIndividual}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-indigo-200">
                      <div className="h-full bg-gradient-to-r from-indigo-600 to-blue-600 transition-all rounded-full" style={{ width: `${progressIndividual}%` }} />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2 border-t border-gray-100">
                  <button
                    type="submit" disabled={!canSubmit}
                    className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 text-sm text-white font-semibold
                      shadow-md shadow-indigo-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {submitting ? 'Création en cours…' : '✓ Créer le marchand'}
                  </button>
                  <button type="button" onClick={resetForm}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">Réinitialiser</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ── Importation en lot ── */
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-50 p-2 rounded-lg">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Importation Excel</h2>
                  <p className="text-xs text-gray-500">Importez plusieurs marchands en une seule fois</p>
                </div>
              </div>

              {/* Bandeau template */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg flex-shrink-0">
                    <Info className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-indigo-800 mb-1">Utilisez le template officiel</p>
                    <p className="text-xs text-indigo-600">
                      Téléchargez et remplissez le fichier modèle pour garantir un format valide lors de l'importation.
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-indigo-700">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-700 inline-block" />
                        <strong>Obligatoires :</strong>&nbsp;nom, prenom, numCIN,nif, stat, activite, numTel1
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
                        <strong>Optionnels :</strong>&nbsp;categorie, marchee, zone, hall, droit annuel
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm whitespace-nowrap flex-shrink-0"
                >
                  <Download className="w-4 h-4" />
                  Télécharger le template
                </button>
              </div>

              <form onSubmit={handleBatchSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                    Fichier Excel (.xlsx)
                  </label>
                  <input
                    ref={excelInputRef} type="file" accept=".xlsx,.xls"
                    onChange={(e) => { if (e.target.files?.[0]) { setExcelFile(e.target.files[0]); setMessageBatch(null); } }}
                    className="block w-full text-sm text-gray-600
                      file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0
                      file:text-sm file:font-semibold
                      file:bg-emerald-600 file:text-white file:cursor-pointer
                      hover:file:bg-emerald-700 file:transition-colors
                      border border-dashed border-gray-300 rounded-xl
                      p-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                  />
                  {excelFile && (
                    <div className="mt-3 flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-emerald-800">{excelFile.name}</p>
                          <p className="text-xs text-emerald-600">{(excelFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button type="button" onClick={resetBatch} className="p-1 hover:bg-emerald-100 rounded-lg transition-colors">
                        <X className="w-4 h-4 text-emerald-500" />
                      </button>
                    </div>
                  )}
                </div>

                {progressBatch > 0 && (
                  <div className="bg-emerald-50 rounded-xl p-3">
                    <div className="flex justify-between text-xs font-medium text-emerald-700 mb-1.5">
                      <span>Importation en cours…</span><span>{progressBatch}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-200">
                      <div className="h-full bg-gradient-to-r from-emerald-600 to-green-600 transition-all rounded-full" style={{ width: `${progressBatch}%` }} />
                    </div>
                  </div>
                )}

                {messageBatch && (
                  <div className={`rounded-xl border px-4 py-3 flex items-start gap-2 text-sm ${
                    messageBatch.includes('succès') || messageBatch.includes('importé')
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-red-200 bg-red-50 text-red-700'
                  }`}>
                    {messageBatch.includes('succès') || messageBatch.includes('importé')
                      ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                    <span className="font-medium">{messageBatch}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2 border-t border-gray-100">
                  <button
                    type="submit" disabled={!excelFile || loadingBatch}
                    className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-2.5 text-sm text-white font-semibold
                      shadow-md shadow-emerald-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {loadingBatch ? 'Importation en cours…' : 'Importer les marchands'}
                  </button>
                  <button type="button" onClick={resetBatch}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">Réinitialiser</span>
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