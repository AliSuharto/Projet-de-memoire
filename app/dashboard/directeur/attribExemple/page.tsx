'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, Store, MapPin, FileText, Check, ArrowRight, Loader2 } from 'lucide-react';
import API_BASE_URL from '@/services/APIbaseUrl';

// Schéma de validation
const schema = z.object({
  categorieId: z.number().min(1, 'Catégorie obligatoire'),
  droitAnnuelId: z.number().min(1, 'Droit annuel obligatoire'),
  frequencePaiement: z.enum(['JOURNALIER', 'HEBDOMADAIRE', 'MENSUEL']),
  dateDebut: z.string().min(1, 'Date obligatoire'),
});

type FormData = z.infer<typeof schema>;

export default function PlaceAssignmentSimple() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [marchands, setMarchands] = useState<any[]>([]);
  const [places, setPlaces] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [droits, setDroits] = useState<any[]>([]);
  
  const [selectedMarchand, setSelectedMarchand] = useState<any>(null);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  
  const [searchM, setSearchM] = useState('');
  const [searchP, setSearchP] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);


  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/places/marchands-sans-place`).then(r => r.json()),
      fetch(`${API_BASE_URL}/places/places-disponibles`).then(r => r.json()),
      fetch(`${API_BASE_URL}/public/categories`).then(r => r.json()),
      fetch(`${API_BASE_URL}/public/droits-annuels`).then(r => r.json()),
    ]).then(([m, p, c, d]) => {
      setMarchands(m);
      setPlaces(p);
      setCategories(c);
      setDroits(d);
    });
  }, []);

  const filteredMarchands = marchands.filter(m =>
    `${m.prenom} ${m.nom} ${m.numCIN}`.toLowerCase().includes(searchM.toLowerCase())
  );

  const filteredPlaces = places.filter(p =>
    `${p.nom} ${p.marcheeName} ${p.zoneName} ${p.hallName}`.toLowerCase().includes(searchP.toLowerCase())
  );

  const onSubmit = async (data: FormData) => {
    if (!selectedMarchand || !selectedPlace) return;

    setLoading(true);
    setMessage(null);

    try {
      // 1. Attribution place
      const attr = await fetch(`${API_BASE_URL}/places/attribuer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marchandId: selectedMarchand.id,
          placeId: selectedPlace.id,
        }),
      }).then(r => r.json());

      if (!attr.success) throw new Error(attr.message || "Échec attribution");

      // 2. Création contrat
      const contrat = await fetch(`${API_BASE_URL}/contrat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idPlace: selectedPlace.id,
          idMarchand: selectedMarchand.id,
          categorieId: data.categorieId,
          nom: `Contrat ${selectedPlace.nom} - ${selectedMarchand.prenom} ${selectedMarchand.nom}`,
          description: `Place ${selectedPlace.nom} → ${selectedMarchand.prenom} ${selectedMarchand.nom}`,
          droitAnnuelId: data.droitAnnuelId,
          frequencePaiement: data.frequencePaiement,
          dateOfStart: data.dateDebut,
        }),
      }).then(r => r.json());

      if (contrat.success) {
        setMessage({ type: 'success', text: 'Place attribuée et contrat créé avec succès !' });
        setTimeout(() => {
          setStep(1);
          setSelectedMarchand(null);
          setSelectedPlace(null);
          setMessage(null);
        }, 3000);
      } else {
        throw new Error(contrat.message || "Échec contrat");
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Une erreur est survenue' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-4xl font-bold text-center mb-8 text-indigo-800">
          Attribution de Place + Contrat
        </h1>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-5 rounded-2xl text-white font-medium flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}>
            <Check className="w-6 h-6" />
            {message.text}
          </div>
        )}

        {/* Étapes */}
        <div className="flex justify-center gap-8 mb-10">
          {[
            { n: 1, icon: Store, label: "Marchand" },
            { n: 2, icon: MapPin, label: "Place" },
            { n: 3, icon: FileText, label: "Contrat" },
          ].map((s, i) => (
            <div key={s.n} className={`flex items-center gap-3 ${step >= s.n ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                step > s.n ? 'bg-green-500' : step === s.n ? 'bg-indigo-600' : 'bg-gray-300'
              }`}>
                {step > s.n ? <Check /> : s.n}
              </div>
              <span className="hidden sm:block font-medium">{s.label}</span>
              {i < 2 && <ArrowRight className="hidden sm:block" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">

          {/* ÉTAPE 1 - Marchand */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Choisir le marchand</h2>
              <div className="relative mb-6">
                <Search className="absolute left-4 top-4 text-gray-400" />
                <input
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 outline-none"
                  placeholder="Rechercher par nom, prénom ou CIN..."
                  value={searchM}
                  onChange={(e) => setSearchM(e.target.value)}
                />
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3">
                {filteredMarchands.map(m => (
                  <div
                    key={m.id}
                    onClick={() => { setSelectedMarchand(m); setStep(2); }}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedMarchand?.id === m.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-400'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-lg">{m.prenom} {m.nom}</p>
                        <p className="text-gray-600">CIN: {m.numCIN} • Tél: {m.numTel1}</p>
                      </div>
                      {selectedMarchand?.id === m.id && <Check className="text-indigo-600 w-8 h-8" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ÉTAPE 2 - Place */}
          {step === 2 && (
            <div>
              <div className="bg-indigo-50 p-4 rounded-2xl mb-6">
                <p className="font-medium">Marchand : {selectedMarchand.prenom} {selectedMarchand.nom}</p>
              </div>

              <h2 className="text-2xl font-bold mb-6">Choisir la place</h2>
              <div className="relative mb-6">
                <Search className="absolute left-4 top-4 text-gray-400" />
                <input
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 outline-none"
                  placeholder="Rechercher marché, zone, hall, nom place..."
                  value={searchP}
                  onChange={(e) => setSearchP(e.target.value)}
                />
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3">
                {filteredPlaces.map(p => (
                  <div
                    key={p.id}
                    onClick={() => { setSelectedPlace(p); setStep(3); }}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedPlace?.id === p.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-400'
                    }`}
                  >
                    <p className="font-bold text-xl">{p.nom}</p>
                    <p className="text-gray-600">
                      {p.marcheeName} {p.zoneName && `• ${p.zoneName}`} {p.hallName && `• ${p.hallName}`}
                    </p>
                  </div>
                ))}
              </div>

              <button onClick={() => setStep(1)} className="mt-6 w-full py-3 bg-gray-200 rounded-xl font-medium">
                ← Retour
              </button>
            </div>
          )}

          {/* ÉTAPE 3 - Contrat */}
          {step === 3 && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl mb-8">
                <p className="font-bold text-lg">{selectedMarchand.prenom} {selectedMarchand.nom}</p>
                <p className="text-2xl font-bold mt-2">{selectedPlace.nom} ({selectedPlace.marcheeName})</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-medium mb-2">Catégorie *</label>
                  <select {...register('categorieId', { valueAsNumber: true })} className="w-full px-4 py-3 border-2 rounded-xl">
                    <option value="">Choisir...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.nom || c.libelle} ({c.tarif || c.montant} Ar)</option>
                    ))}
                  </select>
                  {errors.categorieId && <p className="text-red-600 text-sm mt-1">{errors.categorieId.message}</p>}
                </div>

                <div>
                  <label className="block font-medium mb-2">Droit Annuel *</label>
                  <select {...register('droitAnnuelId', { valueAsNumber: true })} className="w-full px-4 py-3 border-2 rounded-xl">
                    <option value="">Choisir...</option>
                    {droits.map(d => (
                      <option key={d.id} value={d.id}>{d.montant || d.libelle} Ar</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-2">Fréquence *</label>
                  <select {...register('frequencePaiement')} className="w-full px-4 py-3 border-2 rounded-xl">
                    <option value="">Choisir...</option>
                    <option value="JOURNALIER">Journalier</option>
                    <option value="HEBDOMADAIRE">Hebdomadaire</option>
                    <option value="MENSUEL">Mensuel</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-2">Date de début *</label>
                  <input type="date" {...register('dateDebut')} className="w-full px-4 py-3 border-2 rounded-xl" />
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button type="button" onClick={() => setStep(2)} className="flex-1 py-4 bg-gray-200 rounded-xl font-medium">
                  ← Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Check />}
                  {loading ? 'Création...' : 'Attribuer & Créer le contrat'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}