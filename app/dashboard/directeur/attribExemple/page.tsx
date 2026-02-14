'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, Store, MapPin, FileText, Check, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import API_BASE_URL from '@/services/APIbaseUrl';

// Types
interface Marchand {
  id: number;
  prenom: string;
  nom: string;
  numCIN: string;
  numTel1: string;
}

interface Place {
  id: number;
  nom: string;
  marcheeName: string;
  zoneName?: string;
  hallName?: string;
}

interface Categorie {
  id: number;
  nom?: string;
  libelle?: string;
  tarif?: number;
  montant?: number;
}

interface DroitAnnuel {
  id: number;
  montant?: number;
  libelle?: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
}

// Schéma de validation
const schema = z.object({
  categorieId: z.number().min(1, 'Catégorie obligatoire'),
  droitAnnuelId: z.number().min(1, 'Droit annuel obligatoire'),
  frequencePaiement: z.enum(['JOURNALIER', 'HEBDOMADAIRE', 'MENSUEL']),
  dateDebut: z.string().min(1, 'Date obligatoire'),
});
type FormData = z.infer<typeof schema>;

export default function PlaceAssignmentImproved() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [marchands, setMarchands] = useState<Marchand[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [droits, setDroits] = useState<DroitAnnuel[]>([]);
  
  const [selectedMarchand, setSelectedMarchand] = useState<Marchand | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  
  const [searchM, setSearchM] = useState('');
  const [searchP, setSearchP] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/places/marchands-sans-place`).then(r => r.json()),
      fetch(`${API_BASE_URL}/places/places-disponibles`).then(r => r.json()),
      fetch(`${API_BASE_URL}/public/categories`).then(r => r.json()),
      fetch(`${API_BASE_URL}/public/droits-annuels`).then(r => r.json()),
    ]).then(([m, p, c, d]: [Marchand[], Place[], Categorie[], DroitAnnuel[]]) => {
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
    `${p.nom} ${p.marcheeName} ${p.zoneName ?? ''} ${p.hallName ?? ''}`.toLowerCase().includes(searchP.toLowerCase())
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
      }).then(r => r.json()) as ApiResponse;
      
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
      }).then(r => r.json()) as ApiResponse;
      
      if (contrat.success) {
        setMessage({ type: 'success', text: 'Place attribuée et contrat créé avec succès !' });
        setTimeout(() => {
          setStep(1);
          setSelectedMarchand(null);
          setSelectedPlace(null);
          setMessage(null);
          reset();
        }, 3000);
      } else {
        throw new Error(contrat.message || "Échec contrat");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setSelectedMarchand(null);
      setSearchM('');
    } else if (step === 3) {
      setSelectedPlace(null);
      setSearchP('');
    }
    setStep((prev) => (prev > 1 ? (prev - 1) as 1 | 2 | 3 : prev));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 pt-20 md:pt-2">
      <div className="max-w-5xl mx-auto bg-white shadow-sm rounded-xl overflow-hidden">
        <header className="bg-gray-100 p-6 border-b border-gray-200">
          <h1 className="text-3xl font-semibold text-gray-800">
            Attribution de Place et Création de Contrat
          </h1>
        </header>

        <div className="p-8">
          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <Check className="w-5 h-5" />
              {message.text}
            </div>
          )}

          {/* Étapes */}
          <div className="flex justify-between mb-10">
            {[
              { n: 1, icon: Store, label: "Sélection du Marchand" },
              { n: 2, icon: MapPin, label: "Sélection de la Place" },
              { n: 3, icon: FileText, label: "Détails du Contrat" },
            ].map((s) => (
              <div key={s.n} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  step > s.n ? 'bg-green-500 text-white' : step === s.n ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > s.n ? <Check className="w-5 h-5" /> : s.n}
                </div>
                <span className="text-sm font-medium text-gray-700">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Contenu des étapes */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Sélectionnez un Marchand</h2>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
                <input
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Rechercher par nom, prénom ou CIN..."
                  value={searchM}
                  onChange={(e) => setSearchM(e.target.value)}
                />
              </div>
              <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredMarchands.map(m => (
                  <div
                    key={m.id}
                    onClick={() => { setSelectedMarchand(m); setStep(2); }}
                    className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedMarchand?.id === m.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">{m.prenom} {m.nom}</p>
                        <p className="text-sm text-gray-600">CIN: {m.numCIN} • Tél: {m.numTel1}</p>
                      </div>
                      {selectedMarchand?.id === m.id && <Check className="text-blue-500 w-5 h-5" />}
                    </div>
                  </div>
                ))}
                {filteredMarchands.length === 0 && (
                  <p className="p-4 text-center text-gray-500">Aucun marchand trouvé.</p>
                )}
              </div>
            </div>
          )}

          {step === 2 && selectedMarchand && (
            <div>
              <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                <p className="font-medium text-gray-800">Marchand sélectionné : {selectedMarchand.prenom} {selectedMarchand.nom}</p>
              </div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Sélectionnez une Place</h2>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
                <input
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Rechercher par marché, zone, hall ou nom de place..."
                  value={searchP}
                  onChange={(e) => setSearchP(e.target.value)}
                />
              </div>
              <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredPlaces.map(p => (
                  <div
                    key={p.id}
                    onClick={() => { setSelectedPlace(p); setStep(3); }}
                    className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedPlace?.id === p.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <p className="font-medium text-gray-800">{p.nom}</p>
                    <p className="text-sm text-gray-600">
                      {p.marcheeName} {p.zoneName && `• ${p.zoneName}`} {p.hallName && `• ${p.hallName}`}
                    </p>
                  </div>
                ))}
                {filteredPlaces.length === 0 && (
                  <p className="p-4 text-center text-gray-500">Aucune place trouvée.</p>
                )}
              </div>
              <button
                onClick={handleBack}
                className="mt-6 flex items-center text-blue-600 hover:text-blue-800"
              >
                <ArrowLeft className="w-5 h-5 mr-2" /> Retour
              </button>
            </div>
          )}

          {step === 3 && selectedMarchand && selectedPlace && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-8 p-4 bg-gray-100 rounded-lg">
                <p className="font-medium text-gray-800">
                  Marchand : {selectedMarchand.prenom} {selectedMarchand.nom}
                </p>
                <p className="font-medium text-gray-800 mt-1">
                  Place : {selectedPlace.nom} ({selectedPlace.marcheeName})
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
                  <select
                    {...register('categorieId', { valueAsNumber: true })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Sélectionnez une catégorie...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.nom || c.libelle} ({c.tarif || c.montant} Ar)</option>
                    ))}
                  </select>
                  {errors.categorieId && <p className="text-red-600 text-sm mt-1">{errors.categorieId.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Droit Annuel *</label>
                  <select
                    {...register('droitAnnuelId', { valueAsNumber: true })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Sélectionnez un droit annuel...</option>
                    {droits.map(d => (
                      <option key={d.id} value={d.id}>{d.montant || d.libelle} Ar</option>
                    ))}
                  </select>
                  {errors.droitAnnuelId && <p className="text-red-600 text-sm mt-1">{errors.droitAnnuelId.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fréquence de Paiement *</label>
                  <select
                    {...register('frequencePaiement')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Sélectionnez une fréquence...</option>
                    <option value="JOURNALIER">Journalier</option>
                    <option value="HEBDOMADAIRE">Hebdomadaire</option>
                    <option value="MENSUEL">Mensuel</option>
                  </select>
                  {errors.frequencePaiement && <p className="text-red-600 text-sm mt-1">{errors.frequencePaiement.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de Début *</label>
                  <input
                    type="date"
                    {...register('dateDebut')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  {errors.dateDebut && <p className="text-red-600 text-sm mt-1">{errors.dateDebut.message}</p>}
                </div>
              </div>
              <div className="flex gap-4 mt-10">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 inline mr-2" /> Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Check className="w-5 h-5" />}
                  {loading ? 'En cours...' : 'Attribuer et Créer le Contrat'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}