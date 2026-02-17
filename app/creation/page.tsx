// 'use client';

// import React, { useState } from 'react';
// import { ChevronLeft, ChevronRight, Mail, Lock, User, MapPin, Building2, CheckCircle2, AlertCircle, Phone, AtSign } from 'lucide-react';
// import API_BASE_URL from '@/services/APIbaseUrl';

// // Types
// interface CommuneData {
//   nom: string;
//   region: string;
//   adresse: string;
//   codePostal?: string;
//   telephone?: string;
//   email: string;
// }

// interface OrdonnateurData {
//   nom: string;
//   prenom: string;
//   email: string;
//   motDePasse: string;
//   confirmerMotDePasse: string;
// }

// // Service d'inscription
// class RegistrationService {
//   async sendVerificationCode(email: string) {
//     const response = await fetch(`${API_BASE_URL}/public/ordonnateur/init`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email }),
//     });
//     console.log('Code de vérification envoyé à:', email);

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(errorData.message || 'Erreur lors de l\'envoi du code');
//     }

//     return response.json();
//   }

//   async completeRegistration(commune: CommuneData, ordonateur: OrdonnateurData, verificationCode: string) {
//     const { confirmerMotDePasse, motDePasse, ...restOrdonateur } = ordonateur;
//     const ordonateurPayload = { ...restOrdonateur, password: motDePasse };

//     const payload = {
//       email: ordonateur.email,
//       code: verificationCode,
//       ordonnateur: ordonateurPayload,
//       commune: {
//         nom: commune.nom,
//         adresse: commune.adresse,
//         region: commune.region
//       }
//     };

//     console.log("📤 Données envoyées au backend /finalize :", JSON.stringify(payload, null, 2));

//     const response = await fetch(`${API_BASE_URL}/public/ordonnateur/finalize`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload),
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(errorData.message || 'Erreur lors de l\'inscription');
//     }

//     return response.json();
//   }
// }

// const registrationService = new RegistrationService();

// // Fonctions de validation
// const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// const validateRequired = (value: string): boolean => value.trim().length > 0;

// const CommuneRegistration = () => {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [isLoading, setIsLoading] = useState(false);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [successMessage, setSuccessMessage] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');

//   const [communeData, setCommuneData] = useState<CommuneData>({
//     nom: '',
//     region: '',
//     adresse: '',
//     codePostal: '',
//     telephone: '',
//     email: ''
//   });

//   const [ordonnateurData, setOrdonnateurData] = useState<OrdonnateurData>({
//     nom: '',
//     prenom: '',
//     email: '',
//     motDePasse: '',
//     confirmerMotDePasse: ''
//   });

//   const [verificationCode, setVerificationCode] = useState('');
//   const [codeSent, setCodeSent] = useState(false);

//   // Validation des étapes
//   const validateStep1 = (): boolean => {
//     const newErrors: Record<string, string> = {};
//     if (!validateRequired(communeData.nom)) newErrors.nom = 'Le nom de la commune est requis';
//     if (!validateRequired(communeData.region)) newErrors.region = 'La région est requise';
//     if (!validateRequired(communeData.adresse)) newErrors.adresse = 'L\'adresse est requise';
//     if (!validateRequired(communeData.email)) {
//       newErrors.email = 'L\'email est requis';
//     } else if (!validateEmail(communeData.email)) {
//       newErrors.email = 'Format d\'email invalide';
//     }
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const validateStep2 = (): boolean => {
//     const newErrors: Record<string, string> = {};
//     if (!validateRequired(ordonnateurData.nom)) newErrors.nom = 'Le nom est requis';
//     if (!validateRequired(ordonnateurData.prenom)) newErrors.prenom = 'Le prénom est requis';
//     if (!validateRequired(ordonnateurData.email)) {
//       newErrors.email = 'L\'email est requis';
//     } else if (!validateEmail(ordonnateurData.email)) {
//       newErrors.email = 'Format d\'email invalide';
//     }
//     if (!validateRequired(ordonnateurData.motDePasse)) {
//       newErrors.motDePasse = 'Le mot de passe est requis';
//     } else if (ordonnateurData.motDePasse.length < 6) {
//       newErrors.motDePasse = 'Le mot de passe doit contenir au moins 6 caractères';
//     }
//     if (ordonnateurData.motDePasse !== ordonnateurData.confirmerMotDePasse) {
//       newErrors.confirmerMotDePasse = 'Les mots de passe ne correspondent pas';
//     }
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // Gestion des changements
//   const handleCommuneChange = (field: keyof CommuneData, value: string) => {
//     setCommuneData(prev => ({ ...prev, [field]: value }));
//     if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
//     setErrorMessage('');
//   };

//   const handleOrdinateurChange = (field: keyof OrdonnateurData, value: string) => {
//     setOrdonnateurData(prev => ({ ...prev, [field]: value }));
//     if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
//     setErrorMessage('');
//   };

//   // Envoi du code de vérification
//   const sendVerificationCode = async (): Promise<boolean> => {
//     setIsLoading(true);
//     setErrorMessage('');
//     setSuccessMessage('');
//     try {
//       await registrationService.sendVerificationCode(ordonnateurData.email);
//       setCodeSent(true);
//       setSuccessMessage('Code de vérification envoyé à votre email !');
//       return true;
//     } catch (error) {
//       setErrorMessage(error instanceof Error ? error.message : 'Erreur lors de l\'envoi du code');
//       return false;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Finalisation de l'inscription
//   const completeRegistration = async () => {
//     setIsLoading(true);
//     setErrorMessage('');
//     try {
//       await registrationService.completeRegistration(communeData, ordonnateurData, verificationCode);
//       setSuccessMessage('Inscription réussie ! Redirection vers la page de connexion...');
//       setTimeout(() => { window.location.href = '/login'; }, 2000);
//     } catch (error) {
//       setErrorMessage(error instanceof Error ? error.message : 'Erreur lors de l\'inscription');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Navigation
//   const nextStep = async () => {
//     setErrorMessage('');
//     setSuccessMessage('');
//     if (currentStep === 1 && validateStep1()) {
//       setCurrentStep(2);
//     } else if (currentStep === 2 && validateStep2()) {
//       const ok = await sendVerificationCode();
//       if (ok) setCurrentStep(3);
//     } else if (currentStep === 3 && verificationCode.length === 6) {
//       await completeRegistration();
//     }
//   };

//   const prevStep = () => {
//     if (currentStep > 1) {
//       setCurrentStep(currentStep - 1);
//       setErrorMessage('');
//       setSuccessMessage('');
//     }
//   };

//   const resendCode = async () => { await sendVerificationCode(); };

//   // Styles réutilisables pour les champs
//   const inputBase = (hasError: boolean) =>
//     `w-full py-3 px-4 text-sm text-gray-800 bg-white border-[1.5px] rounded-xl outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${
//       hasError ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
//     }`;

//   const inputWithIcon = (hasError: boolean) =>
//     `w-full py-3 pl-11 pr-4 text-sm text-gray-800 bg-white border-[1.5px] rounded-xl outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 appearance-none ${
//       hasError ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
//     }`;

//   const fieldLabel = 'block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide';

//   const steps = [
//     { step: 1, title: 'Commune', icon: Building2 },
//     { step: 2, title: 'Ordonnateur', icon: User },
//     { step: 3, title: 'Vérification', icon: Mail },
//   ];

//   return (
//     <div
//       className="min-h-screen py-10 px-4 lg:px-8"
//       style={{ background: 'linear-gradient(135deg, #e8eaf6 0%, #ede7f6 45%, #c5cae9 100%)' }}
//     >
//       <div className="max-w-4xl mx-auto">

//         {/* ── Titre de page ── */}
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
//             Inscription de votre Commune
//           </h1>
//           <p className="text-base text-gray-500">
//             Créez votre compte e-GMC en quelques étapes simples
//           </p>
//         </div>

//         {/* ── Carte principale ── */}
//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

//           {/* ── Barre d'étapes ── */}
//           <div
//             className="px-8 py-7"
//             style={{ background: 'linear-gradient(135deg, #5c6bc0 0%, #7e57c2 100%)' }}
//           >
//             <div className="flex items-center justify-center" style={{ maxWidth: 420, margin: '0 auto' }}>
//               {steps.map(({ step, title, icon: Icon }, idx) => (
//                 <React.Fragment key={step}>
//                   <div className="flex flex-col items-center gap-2.5">
//                     <div
//                       className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
//                       style={
//                         step <= currentStep
//                           ? { background: 'white', color: '#5c6bc0', boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }
//                           : { background: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(255,255,255,0.28)' }
//                       }
//                     >
//                       {step < currentStep ? <CheckCircle2 size={20} /> : <Icon size={20} />}
//                     </div>
//                     <span
//                       className="text-xs font-medium"
//                       style={{ color: step <= currentStep ? 'white' : 'rgba(255,255,255,0.55)' }}
//                     >
//                       {title}
//                     </span>
//                   </div>
//                   {idx < steps.length - 1 && (
//                     <div
//                       className="flex-1 mx-2 mb-5 transition-all duration-300"
//                       style={{
//                         height: 1.5,
//                         background: step < currentStep ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)'
//                       }}
//                     />
//                   )}
//                 </React.Fragment>
//               ))}
//             </div>
//           </div>

//           {/* ── Corps du formulaire ── */}
//           <div className="p-10 lg:p-12">

//             {/* Messages globaux */}
//             {errorMessage && (
//               <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3">
//                 <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
//                 <span className="text-sm text-red-700">{errorMessage}</span>
//               </div>
//             )}
//             {successMessage && (
//               <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg flex items-start gap-3">
//                 <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
//                 <span className="text-sm text-green-700">{successMessage}</span>
//               </div>
//             )}

//             {/* ══ ÉTAPE 1 : Commune ══ */}
//             {currentStep === 1 && (
//               <div className="max-w-2xl mx-auto">
//                 <div className="text-center mb-8">
//                   <div
//                     className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
//                     style={{ background: '#ede9fe' }}
//                   >
//                     <Building2 size={28} style={{ color: '#7c3aed' }} />
//                   </div>
//                   <h2 className="text-xl font-bold text-gray-900 mb-1">Informations de la Commune</h2>
//                   <p className="text-sm text-gray-500">Renseignez les informations officielles de votre commune</p>
//                 </div>

//                 <div className="flex flex-col gap-5">
//                   {/* Nom */}
//                   <div>
//                     <label className={fieldLabel}>Nom de la commune *</label>
//                     <div className="relative">
//                       <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//                       <input
//                         type="text"
//                         value={communeData.nom}
//                         onChange={e => handleCommuneChange('nom', e.target.value)}
//                         className={inputWithIcon(!!errors.nom)}
//                         placeholder="Entrez le nom de la commune"
//                       />
//                     </div>
//                     {errors.nom && (
//                       <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
//                         <AlertCircle size={12} />{errors.nom}
//                       </p>
//                     )}
//                   </div>

//                   {/* Région + Email */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                     <div>
//                       <label className={fieldLabel}>Région *</label>
//                       <div className="relative">
//                         <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//                         <select
//                           value={communeData.region}
//                           onChange={e => handleCommuneChange('region', e.target.value)}
//                           className={inputWithIcon(!!errors.region)}
//                         >
//                           <option value="">Sélectionnez une région</option>
//                           <option value="Analamanga">Analamanga</option>
//                           <option value="Vakinankaratra">Vakinankaratra</option>
//                           <option value="Itasy">Itasy</option>
//                           <option value="Bongolava">Bongolava</option>
//                           <option value="Haute Matsiatra">Haute Matsiatra</option>
//                           <option value="Amoron'i Mania">Amoromi Mania</option>
//                           <option value="Vatovavy Fitovinany">Vatovavy Fitovinany</option>
//                           <option value="Ihorombe">Ihorombe</option>
//                           <option value="Atsimo-Atsinanana">Atsimo-Atsinanana</option>
//                           <option value="Atsinanana">Atsinanana</option>
//                           <option value="Analanjirofo">Analanjirofo</option>
//                           <option value="Alaotra-Mangoro">Alaotra-Mangoro</option>
//                           <option value="Boeny">Boeny</option>
//                           <option value="Sofia">Sofia</option>
//                           <option value="Betsiboka">Betsiboka</option>
//                           <option value="Melaky">Melaky</option>
//                           <option value="Atsimo-Andrefana">Atsimo-Andrefana</option>
//                           <option value="Androy">Androy</option>
//                           <option value="Anosy">Anosy</option>
//                           <option value="Menabe">Menabe</option>
//                           <option value="Diana">Diana</option>
//                           <option value="Sava">Sava</option>
//                         </select>
//                       </div>
//                       {errors.region && (
//                         <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
//                           <AlertCircle size={12} />{errors.region}
//                         </p>
//                       )}
//                     </div>

//                     <div>
//                       <label className={fieldLabel}>Email de la commune *</label>
//                       <div className="relative">
//                         <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//                         <input
//                           type="email"
//                           value={communeData.email}
//                           onChange={e => handleCommuneChange('email', e.target.value)}
//                           className={inputWithIcon(!!errors.email)}
//                           placeholder="mairie@commune.mg"
//                         />
//                       </div>
//                       {errors.email && (
//                         <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
//                           <AlertCircle size={12} />{errors.email}
//                         </p>
//                       )}
//                     </div>
//                   </div>

//                   {/* Adresse */}
//                   <div>
//                     <label className={fieldLabel}>Adresse complète *</label>
//                     <textarea
//                       value={communeData.adresse}
//                       onChange={e => handleCommuneChange('adresse', e.target.value)}
//                       className={`w-full py-3 px-4 text-sm text-gray-800 bg-white border-[1.5px] rounded-xl outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none ${
//                         errors.adresse ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
//                       }`}
//                       placeholder="Entrez l'adresse complète de la commune"
//                       rows={3}
//                     />
//                     {errors.adresse && (
//                       <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
//                         <AlertCircle size={12} />{errors.adresse}
//                       </p>
//                     )}
//                   </div>

//                   {/* Code postal + Téléphone */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                     <div>
//                       <label className={fieldLabel}>Code postal</label>
//                       <input
//                         type="text"
//                         value={communeData.codePostal}
//                         onChange={e => handleCommuneChange('codePostal', e.target.value)}
//                         className={inputBase(false)}
//                         placeholder="101"
//                       />
//                     </div>
//                     <div>
//                       <label className={fieldLabel}>Téléphone</label>
//                       <div className="relative">
//                         <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//                         <input
//                           type="tel"
//                           value={communeData.telephone}
//                           onChange={e => handleCommuneChange('telephone', e.target.value)}
//                           className={inputWithIcon(false)}
//                           placeholder="+261 XX XX XXX XX"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* ══ ÉTAPE 2 : Ordonnateur ══ */}
//             {currentStep === 2 && (
//               <div className="max-w-xl mx-auto">
//                 <div className="text-center mb-8">
//                   <div
//                     className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
//                     style={{ background: '#ede9fe' }}
//                   >
//                     <User size={28} style={{ color: '#7c3aed' }} />
//                   </div>
//                   <h2 className="text-xl font-bold text-gray-900 mb-1">Compte de Ordonnateur</h2>
//                   <p className="text-sm text-gray-500">Créez le compte de ordonnateur principal de la commune</p>
//                 </div>

//                 <div className="flex flex-col gap-5">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                     <div>
//                       <label className={fieldLabel}>Nom *</label>
//                       <input
//                         type="text"
//                         value={ordonnateurData.nom}
//                         onChange={e => handleOrdinateurChange('nom', e.target.value)}
//                         className={inputBase(!!errors.nom)}
//                         placeholder="Nom de famille"
//                       />
//                       {errors.nom && (
//                         <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
//                           <AlertCircle size={12} />{errors.nom}
//                         </p>
//                       )}
//                     </div>
//                     <div>
//                       <label className={fieldLabel}>Prénom *</label>
//                       <input
//                         type="text"
//                         value={ordonnateurData.prenom}
//                         onChange={e => handleOrdinateurChange('prenom', e.target.value)}
//                         className={inputBase(!!errors.prenom)}
//                         placeholder="Prénom"
//                       />
//                       {errors.prenom && (
//                         <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
//                           <AlertCircle size={12} />{errors.prenom}
//                         </p>
//                       )}
//                     </div>
//                   </div>

//                   <div>
//                     <label className={fieldLabel}>Email professionnel *</label>
//                     <div className="relative">
//                       <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//                       <input
//                         type="email"
//                         value={ordonnateurData.email}
//                         onChange={e => handleOrdinateurChange('email', e.target.value)}
//                         className={inputWithIcon(!!errors.email)}
//                         placeholder="ordonnateur@email.com"
//                       />
//                     </div>
//                     {errors.email && (
//                       <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
//                         <AlertCircle size={12} />{errors.email}
//                       </p>
//                     )}
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                     <div>
//                       <label className={fieldLabel}>Mot de passe *</label>
//                       <div className="relative">
//                         <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//                         <input
//                           type="password"
//                           value={ordonnateurData.motDePasse}
//                           onChange={e => handleOrdinateurChange('motDePasse', e.target.value)}
//                           className={inputWithIcon(!!errors.motDePasse)}
//                           placeholder="Minimum 6 caractères"
//                         />
//                       </div>
//                       {errors.motDePasse && (
//                         <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
//                           <AlertCircle size={12} />{errors.motDePasse}
//                         </p>
//                       )}
//                     </div>
//                     <div>
//                       <label className={fieldLabel}>Confirmer le mot de passe *</label>
//                       <div className="relative">
//                         <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//                         <input
//                           type="password"
//                           value={ordonnateurData.confirmerMotDePasse}
//                           onChange={e => handleOrdinateurChange('confirmerMotDePasse', e.target.value)}
//                           className={inputWithIcon(!!errors.confirmerMotDePasse)}
//                           placeholder="Confirmez votre mot de passe"
//                         />
//                       </div>
//                       {errors.confirmerMotDePasse && (
//                         <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
//                           <AlertCircle size={12} />{errors.confirmerMotDePasse}
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* ══ ÉTAPE 3 : Vérification ══ */}
//             {currentStep === 3 && (
//               <div className="max-w-sm mx-auto text-center">
//                 <div
//                   className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5"
//                   style={{ background: '#ede9fe' }}
//                 >
//                   <Mail size={28} style={{ color: '#7c3aed' }} />
//                 </div>
//                 <h2 className="text-xl font-bold text-gray-900 mb-3">Vérification Email</h2>
//                 <p className="text-sm text-gray-500 mb-8 leading-relaxed">
//                   Un code de vérification a été envoyé à<br />
//                   <span className="font-semibold text-base" style={{ color: '#5c6bc0' }}>
//                     {ordonnateurData.email}
//                   </span>
//                 </p>

//                 <div className="mb-5 text-left">
//                   <label className={`${fieldLabel} text-center block`}>
//                     Code de vérification (6 chiffres)
//                   </label>
//                   <input
//                     type="text"
//                     value={verificationCode}
//                     onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
//                     className="w-full py-4 px-4 border-[1.5px] border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-center text-3xl tracking-widest font-mono text-gray-800 hover:border-gray-300 transition-all"
//                     placeholder="000000"
//                     maxLength={6}
//                   />
//                 </div>

//                 <button
//                   onClick={resendCode}
//                   disabled={isLoading}
//                   className="text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:underline bg-transparent border-none cursor-pointer"
//                   style={{ color: '#5c6bc0' }}
//                 >
//                   {isLoading ? 'Envoi en cours...' : 'Renvoyer le code de vérification'}
//                 </button>
//               </div>
//             )}

//             {/* ── Boutons de navigation ── */}
//             <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-100">
//               {/* Retour */}
//               <button
//                 onClick={prevStep}
//                 disabled={currentStep === 1 || isLoading}
//                 className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border-[1.5px] transition-all duration-200 ${
//                   currentStep === 1 || isLoading
//                     ? 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed'
//                     : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 cursor-pointer'
//                 }`}
//               >
//                 <ChevronLeft size={18} />
//                 Retour
//               </button>

//               <span className="text-xs font-medium text-gray-400">
//                 Étape {currentStep} sur 3
//               </span>

//               {/* Continuer / Terminer */}
//               <button
//                 onClick={nextStep}
//                 disabled={isLoading || (currentStep === 3 && verificationCode.length !== 6)}
//                 className={`flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-semibold text-white border-none transition-all duration-200 ${
//                   isLoading || (currentStep === 3 && verificationCode.length !== 6)
//                     ? 'bg-gray-300 cursor-not-allowed'
//                     : 'cursor-pointer hover:-translate-y-0.5'
//                 }`}
//                 style={
//                   isLoading || (currentStep === 3 && verificationCode.length !== 6)
//                     ? {}
//                     : {
//                         background: 'linear-gradient(135deg, #5c6bc0 0%, #7e57c2 100%)',
//                         boxShadow: '0 4px 14px rgba(92, 107, 192, 0.4)',
//                       }
//                 }
//               >
//                 {isLoading ? (
//                   <>
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
//                     {currentStep === 2 ? 'Envoi du code...' : currentStep === 3 ? 'Finalisation...' : 'Chargement...'}
//                   </>
//                 ) : currentStep === 3 ? (
//                   <>Terminer inscription <CheckCircle2 size={18} /></>
//                 ) : (
//                   <>Continuer <ChevronRight size={18} /></>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* ── Footer ── */}
//         <div className="text-center mt-7">
//           <p className="text-sm text-gray-500 mb-3">
//             Vous avez déjà un compte ?{' '}
//             <a
//               href="/login"
//               className="font-semibold hover:underline transition-colors"
//               style={{ color: '#5c6bc0' }}
//             >
//               Se connecter
//             </a>
//           </p>
//           <div className="flex justify-center items-center gap-4 text-xs text-gray-400">
//             <a href="/terms" className="hover:text-indigo-500 transition-colors">Conditions utilisation</a>
//             <span>•</span>
//             <a href="/privacy" className="hover:text-indigo-500 transition-colors">Politique de confidentialité</a>
//             <span>•</span>
//             <a href="/support" className="hover:text-indigo-500 transition-colors">Aide</a>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default CommuneRegistration;