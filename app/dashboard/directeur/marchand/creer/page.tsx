'use client';

import React, { useMemo, useRef, useState } from 'react';
import axios from 'axios';

/**
 * Simple Next.js (App Router) page for creating a Marchand with multipart/form-data
 * - Tech: TypeScript + Tailwind + Axios
 * - Required fields: nom, prenom, numCIN
 * - Optional fields: numTel1, numTel2, adress, description, photo (file)
 *
 * 🔧 Configure your backend base URL (Spring Boot) via env var:
 *   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
 *
 * Endpoint expected by Spring Boot:
 *   POST /api/marchands  (consumes multipart/form-data)
 */

// Utility: read env base URL safely
const API_BASE_URL =  'http://localhost:8080/api';

// Very light client-side validation
type MarchandForm = {
  nom: string;
  prenom: string;
  numCIN: string;
  numTel1?: string;
  numTel2?: string;
  adress?: string;
  description?: string;
};

export default function Page() {
  const [form, setForm] = useState<MarchandForm>({ nom: '', prenom: '', numCIN: '' });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canSubmit = useMemo(() => {
    return form.nom.trim() !== '' && form.prenom.trim() !== '' && form.numCIN.trim() !== '' && !submitting;
  }, [form, submitting]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPhotoFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const resetForm = () => {
    setForm({ nom: '', prenom: '', numCIN: '', numTel1: '', numTel2: '', adress: '', description: '' });
    setPhotoFile(null);
    setPreviewUrl(null);
    setProgress(0);
    setMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!API_BASE_URL) {
      setMessage({ type: 'error', text: 'NEXT_PUBLIC_API_BASE_URL est manquant. Définissez-le dans votre .env.local.' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);
      setProgress(0);

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
          setProgress(pct);
        },
      });

      const ok = res?.data?.success === true;
      if (ok) {
        setMessage({ type: 'success', text: 'Marchand créé avec succès ✔' });
        // Optionally display returned marchand
        // console.log('Saved marchand:', res.data.marchand);
        resetForm();
      } else {
        const msg = res?.data?.message || 'Création échouée.';
        setMessage({ type: 'error', text: msg });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Erreur inconnue';
      setMessage({ type: 'error', text: `Erreur lors de la création: ${msg}` });
    } finally {
      setSubmitting(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Créer un Marchand</h1>
        <p className="text-gray-600 mt-1">Veuillez saisir le formulaire pour enregistrer le marchands.</p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6">
          <div className="grid gap-2">
            <label htmlFor="nom" className="text-sm font-medium text-gray-700">Nom <span className="text-red-600">*</span></label>
            <input
              id="nom"
              name="nom"
              type="text"
              required
              value={form.nom}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: Rakoto"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="prenom" className="text-sm font-medium text-gray-700">Prénom <span className="text-red-600">*</span></label>
            <input
              id="prenom"
              name="prenom"
              type="text"
              required
              value={form.prenom}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: Jean"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="numCIN" className="text-sm font-medium text-gray-700">Numéro CIN <span className="text-red-600">*</span></label>
            <input
              id="numCIN"
              name="numCIN"
              type="text"
              required
              value={form.numCIN}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: 123456789012"
            />
            <p className="text-xs text-gray-500">Doit être unique en base (la contrainte est vérifiée côté Spring).</p>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="numTel1" className="text-sm font-medium text-gray-700">Téléphone 1</label>
              <input
                id="numTel1"
                name="numTel1"
                type="tel"
                value={form.numTel1 || ''}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: 0321234567"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="numTel2" className="text-sm font-medium text-gray-700">Téléphone 2</label>
              <input
                id="numTel2"
                name="numTel2"
                type="tel"
                value={form.numTel2 || ''}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: 0339876543"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="adress" className="text-sm font-medium text-gray-700">Adresse</label>
            <input
              id="adress"
              name="adress"
              type="text"
              value={form.adress || ''}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: Ambalavola"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description || ''}
              onChange={handleChange}
              rows={3}
              className="w-full resize-y rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: Marchand de légumes"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="photo" className="text-sm font-medium text-gray-700">Photo du marchand</label>
            <input
              ref={fileInputRef}
              id="photo"
              name="photo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full cursor-pointer rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-700"
            />
            {previewUrl && (
              <div className="mt-2">
                <img src={previewUrl} alt="Preview" className="h-36 w-36 rounded-xl object-cover ring-1 ring-gray-200" />
              </div>
            )}
          </div>

          {submitting && (
            <div className="w-full">
              <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                <span>Upload en cours…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div className="h-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {message && (
            <div
              role="alert"
              className={`rounded-xl border px-4 py-3 text-sm ${
                message.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : 'border-red-200 bg-red-50 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-2xl bg-indigo-600 px-5 py-2.5 text-white shadow hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Envoi…' : 'Créer le marchand'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-2xl border border-gray-300 bg-white px-5 py-2.5 text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Réinitialiser
            </button>
          </div>

          <div className="text-xs text-gray-500">
            <p>En soumettant, les données sont envoyées en <code>multipart/form-data</code> à votre API Spring Boot.</p>
            <p>Assurez-vous que <code>@PostMapping</code> consomme bien <code>MediaType.MULTIPART_FORM_DATA_VALUE</code> et que <code>id</code> en base est auto-généré.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
