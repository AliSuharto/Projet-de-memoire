'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Mail, Lock, User, MapPin, Building2, CheckCircle2, AlertCircle, Phone, AtSign } from 'lucide-react';
import API_BASE_URL from '@/services/APIbaseUrl';

// Types
interface CommuneData {
  nom: string;
  region: string;
  adresse: string;
  codePostal?: string;
  telephone?: string;
  email: string;
}

interface OrdonnateurData {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  confirmerMotDePasse: string;
}

// Service d'inscription
class RegistrationService {
  

  async sendVerificationCode(email: string) {
    const response = await fetch(`${API_BASE_URL}/ordonnateur/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    } 
  );
  console.log('Code de vérification envoyé à:', email); 

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erreur lors de l\'envoi du code');
    }

    return response.json();
  }

      async completeRegistration(commune: CommuneData, ordonateur: OrdonnateurData, verificationCode: string) {
  // Retirer confirmerMotDePasse et renommer motDePasse en password
  const { confirmerMotDePasse, motDePasse, ...restOrdonateur } = ordonateur;
  const ordonateurPayload = { ...restOrdonateur, password: motDePasse };

  // Construire le payload final
  const payload = {
    email: ordonateur.email,
    code: verificationCode,
    ordonnateur: ordonateurPayload,
    commune: {
      nom: commune.nom,
      adresse: commune.adresse,
      region: commune.region
    }
  };

  //  Log du payload envoyé
  console.log("📤 Données envoyées au backend /finalize :", JSON.stringify(payload, null, 2));

  // Envoi au backend
  const response = await fetch(`${API_BASE_URL}/ordonnateur/finalize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erreur lors de l\'inscription');
  }

  return response.json();
}
}

const registrationService = new RegistrationService();

// Fonctions de validation
const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validateRequired = (value: string): boolean => value.trim().length > 0;

const CommuneRegistration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // États des données
  const [communeData, setCommuneData] = useState<CommuneData>({
    nom: '',
    region: '',
    adresse: '',
    codePostal: '',
    telephone: '',
    email: ''
  });

  const [ordonnateurData, setOrdonnateurData] = useState<OrdonnateurData>({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    confirmerMotDePasse: ''
  });

  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  // Validation des étapes
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!validateRequired(communeData.nom)) newErrors.nom = 'Le nom de la commune est requis';
    if (!validateRequired(communeData.region)) newErrors.region = 'La région est requise';
    if (!validateRequired(communeData.adresse)) newErrors.adresse = 'L\'adresse est requise';
    if (!validateRequired(communeData.email)) {
      newErrors.email = 'L\'email est requis';
    } else if (!validateEmail(communeData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!validateRequired(ordonnateurData.nom)) newErrors.nom = 'Le nom est requis';
    if (!validateRequired(ordonnateurData.prenom)) newErrors.prenom = 'Le prénom est requis';
    if (!validateRequired(ordonnateurData.email)) {
      newErrors.email = 'L\'email est requis';
    } else if (!validateEmail(ordonnateurData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    if (!validateRequired(ordonnateurData.motDePasse)) {
      newErrors.motDePasse = 'Le mot de passe est requis';
    } else if (ordonnateurData.motDePasse.length < 6) {
      newErrors.motDePasse = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (ordonnateurData.motDePasse !== ordonnateurData.confirmerMotDePasse) {
      newErrors.confirmerMotDePasse = 'Les mots de passe ne correspondent pas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion des changements
  const handleCommuneChange = (field: keyof CommuneData, value: string) => {
    setCommuneData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    setErrorMessage('');
  };

  const handleOrdinateurChange = (field: keyof OrdonnateurData, value: string) => {
    setOrdonnateurData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    setErrorMessage('');
  };

  // Envoi du code de vérification
  const sendVerificationCode = async (): Promise<boolean> => {
  setIsLoading(true);
  setErrorMessage('');
  setSuccessMessage('');

  try {
    await registrationService.sendVerificationCode(ordonnateurData.email);
    setCodeSent(true);
    setSuccessMessage('Code de vérification envoyé à votre email !');
    return true;
  } catch (error) {
    setErrorMessage(error instanceof Error ? error.message : 'Erreur lors de l\'envoi du code');
    return false;
  } finally {
    setIsLoading(false);
  }
};


  // Finalisation de l'inscription
  const completeRegistration = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      await registrationService.completeRegistration(communeData, ordonnateurData, verificationCode);
      setSuccessMessage('Inscription réussie ! Redirection vers la page de connexion...');
      
      // Redirection après 2 secondes
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation
  const nextStep = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
        }  else if (currentStep === 2 && validateStep2()) {
      const ok = await sendVerificationCode();
      if (ok) {
        setCurrentStep(3);
      }
    
    } else if (currentStep === 3 && verificationCode.length === 6) {
      await completeRegistration();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrorMessage('');
      setSuccessMessage('');
    }
  };

  // Fonction pour renvoyer le code
  const resendCode = async () => {
    await sendVerificationCode();
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 via-purple-50 to-indigo-300 py-8 px-4 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header principal */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Inscription de votre Commune
          </h1>
          <p className="text-lg text-gray-600">
            Créez votre compte e-GMC en quelques étapes simples
          </p>
        </div>

        {/* Conteneur principal avec layout adaptatif */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header avec indicateur de progression amélioré */}
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 px-8 py-6">
            <div className="flex justify-center">
              <div className="flex items-center space-x-8">
                {[
                  { step: 1, title: 'Commune', icon: Building2 },
                  { step: 2, title: 'Ordonnateur', icon: User },
                  { step: 3, title: 'Vérification', icon: Mail }
                ].map(({ step, title, icon: Icon }) => (
                  <div key={step} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                          step <= currentStep
                            ? 'bg-white text-indigo-600 shadow-lg transform scale-110'
                            : 'bg-indigo-500 text-indigo-200'
                        }`}
                      >
                        {step < currentStep ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <Icon size={20} />
                        )}
                      </div>
                      <span className={`mt-2 text-sm font-medium ${
                        step <= currentStep ? 'text-white' : 'text-indigo-200'
                      }`}>
                        {title}
                      </span>
                    </div>
                    {step < 3 && (
                      <div
                        className={`w-16 h-0.5 mx-4 mt-[-20px] transition-all duration-300 ${
                          step < currentStep ? 'bg-white' : 'bg-indigo-500'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-8 lg:p-12">
            {/* Messages d'erreur et de succès */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-red-700">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-green-700">{successMessage}</span>
              </div>
            )}

            {/* Étape 1: Informations de la commune */}
            {currentStep === 1 && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                    <Building2 className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Informations de la Commune
                  </h2>
                  <p className="text-gray-600">
                    Renseignez les informations officielles de votre commune
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom de la commune *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={communeData.nom}
                        onChange={(e) => handleCommuneChange('nom', e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                          errors.nom ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        placeholder="Entrez le nom de la commune"
                      />
                    </div>
                    {errors.nom && <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />{errors.nom}
                    </p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Région *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        value={communeData.region}
                        onChange={(e) => handleCommuneChange('region', e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none bg-white ${
                          errors.region ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <option value="">Sélectionnez une région</option>
                        <option value="Analamanga">Analamanga</option>
                        <option value="Vakinankaratra">Vakinankaratra</option>
                        <option value="Itasy">Itasy</option>
                        <option value="Bongolava">Bongolava</option>
                        <option value="Haute Matsiatra">Haute Matsiatra</option>
                        <option value="Amoron'i Mania">Amoromi Mania</option>
                        <option value="Vatovavy Fitovinany">Vatovavy Fitovinany</option>
                        <option value="Ihorombe">Ihorombe</option>
                        <option value="Atsimo-Atsinanana">Atsimo-Atsinanana</option>
                        <option value="Atsinanana">Atsinanana</option>
                        <option value="Analanjirofo">Analanjirofo</option>
                        <option value="Alaotra-Mangoro">Alaotra-Mangoro</option>
                        <option value="Boeny">Boeny</option>
                        <option value="Sofia">Sofia</option>
                        <option value="Betsiboka">Betsiboka</option>
                        <option value="Melaky">Melaky</option>
                        <option value="Atsimo-Andrefana">Atsimo-Andrefana</option>
                        <option value="Androy">Androy</option>
                        <option value="Anosy">Anosy</option>
                        <option value="Menabe">Menabe</option>
                        <option value="Diana">Diana</option>
                        <option value="Sava">Sava</option>
                      </select>
                    </div>
                    {errors.region && <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />{errors.region}
                    </p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email de la commune *
                    </label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={communeData.email}
                        onChange={(e) => handleCommuneChange('email', e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                          errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        placeholder="mairie@commune.mg"
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />{errors.email}
                    </p>}
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Adresse complète *
                    </label>
                    <textarea
                      value={communeData.adresse}
                      onChange={(e) => handleCommuneChange('adresse', e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none ${
                        errors.adresse ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Entrez l'adresse complète de la commune"
                      rows={3}
                    />
                    {errors.adresse && <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />{errors.adresse}
                    </p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Code postal
                    </label>
                    <input
                      type="text"
                      value={communeData.codePostal}
                      onChange={(e) => handleCommuneChange('codePostal', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-gray-300 transition-all"
                      placeholder="101"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        value={communeData.telephone}
                        onChange={(e) => handleCommuneChange('telephone', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-gray-300 transition-all"
                        placeholder="+261 XX XX XXX XX"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 2: Informations de l'ordonnateur */}
            {currentStep === 2 && (
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                    <User className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Compte de Ordonnateur
                  </h2>
                  <p className="text-gray-600">
                    Créez le compte de ordonnateur principal de la commune
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={ordonnateurData.nom}
                      onChange={(e) => handleOrdinateurChange('nom', e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                        errors.nom ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Nom de famille"
                    />
                    {errors.nom && <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />{errors.nom}
                    </p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      value={ordonnateurData.prenom}
                      onChange={(e) => handleOrdinateurChange('prenom', e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                        errors.prenom ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Prénom"
                    />
                    {errors.prenom && <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />{errors.prenom}
                    </p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email professionnel *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={ordonnateurData.email}
                        onChange={(e) => handleOrdinateurChange('email', e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                          errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        placeholder="ordonnateur@email.com"
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />{errors.email}
                    </p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mot de passe *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        value={ordonnateurData.motDePasse}
                        onChange={(e) => handleOrdinateurChange('motDePasse', e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                          errors.motDePasse ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        placeholder="Minimum 6 caractères"
                      />
                    </div>
                    {errors.motDePasse && <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />{errors.motDePasse}
                    </p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirmer le mot de passe *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        value={ordonnateurData.confirmerMotDePasse}
                        onChange={(e) => handleOrdinateurChange('confirmerMotDePasse', e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                          errors.confirmerMotDePasse ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        placeholder="Confirmez votre mot de passe"
                      />
                    </div>
                    {errors.confirmerMotDePasse && <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />{errors.confirmerMotDePasse}
                    </p>}
                  </div>
                </div>
              </div>
            )}

            {/* Étape 3: Vérification du code */}
            {currentStep === 3 && (
              <div className="max-w-md mx-auto text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-6">
                  <Mail className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Vérification Email
                </h2>
                <p className="text-gray-600 mb-8">
                  Un code de vérification a été envoyé à<br />
                  <span className="font-semibold text-indigo-600 text-lg">{ordonnateurData.email}</span>
                </p>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Code de vérification (6 chiffres)
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-2xl tracking-widest font-mono hover:border-gray-300 transition-all"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>

                <button
                  onClick={resendCode}
                  disabled={isLoading}
                  className="text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {isLoading ? 'Envoi en cours...' : 'Renvoyer le code de vérification'}
                </button>
              </div>
            )}

            {/* Boutons de navigation améliorés */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
              <button
                onClick={prevStep}
                disabled={currentStep === 1 || isLoading}
                className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  currentStep === 1 || isLoading
                    ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 border-2 border-gray-300 hover:border-gray-400'
                }`}
              >
                <ChevronLeft size={20} className="mr-2" />
                Retour
              </button>

              <div className="text-center text-gray-500">
                <span className="text-sm font-medium">
                  Étape {currentStep} sur 3
                </span>
              </div>

              <button
                onClick={nextStep}
                disabled={isLoading || (currentStep === 3 && verificationCode.length !== 6)}
                className={`flex items-center px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg ${
                  isLoading || (currentStep === 3 && verificationCode.length !== 6)
                    ? 'bg-gray-400 cursor-not-allowed shadow-none transform-none'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {currentStep === 2 ? 'Envoi du code...' : currentStep === 3 ? 'Finalisation...' : 'Chargement...'}
                  </>
                ) : currentStep === 3 ? (
                  <>
                    Terminer inscription
                    <CheckCircle2 size={20} className="ml-2" />
                  </>
                ) : (
                  <>
                    Continuer
                    <ChevronRight size={20} className="ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer avec informations supplémentaires */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            Vous avez déjà un compte ? 
            <a href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium ml-1 transition-colors">
              Se connecter
            </a>
          </p>
          <div className="flex justify-center items-center space-x-6 mt-4 text-xs">
            <a href="/terms" className="hover:text-indigo-600 transition-colors">Conditions utilisation</a>
            <span className="text-gray-400">•</span>
            <a href="/privacy" className="hover:text-indigo-600 transition-colors">Politique de confidentialité</a>
            <span className="text-gray-400">•</span>
            <a href="/support" className="hover:text-indigo-600 transition-colors">Aide</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommuneRegistration;