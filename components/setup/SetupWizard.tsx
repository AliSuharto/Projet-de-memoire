'use client';

import { useState } from 'react';
import { Building2, User, Shield } from 'lucide-react';
import Stepper, { StepperStep } from '@/components/ui/Stepper';
import CommuneForm from './CommuneForm';
import OrdonnateurForm from './OrdonnateurForm';
import CodeValidation from './CodeValidation';
import { useToast } from '@/components/ui/ToastContainer';
import communeService, { Commune, Ordonnateur, CommuneOrdonnateur } from '@/services/communeService';

const steps: StepperStep[] = [
  {
    id: 'commune',
    title: 'Commune',
    description: 'Informations de base',
    icon: Building2,
  },
  {
    id: 'ordonnateur',
    title: 'Ordonnateur',
    description: 'Responsable principal',
    icon: User,
  },
  {
    id: 'validation',
    title: 'Validation',
    description: 'Code de vérification',
    icon: Shield,
  },
];

const SetupWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [communeData, setCommuneData] = useState<Commune | null>(null);
  const [ordonnateurData, setOrdonnateurData] = useState<Ordonnateur | null>(null);
  const { showError, showSuccess } = useToast();

  const handleCommuneNext = (data: Commune) => {
    setCommuneData(data);
    setCurrentStep(2);
  };

  const handleOrdonnateurNext = async (data: Ordonnateur) => {
    if (!communeData) {
      showError('Erreur', 'Données de commune manquantes');
      return;
    }

    // Stocker les données de l'ordonnateur et passer à l'étape suivante
    // Le code a déjà été envoyé dans OrdonnateurForm
    setOrdonnateurData(data);
    setCurrentStep(3);
  };

  const handleBackToCommune = () => {
    setCurrentStep(1);
  };

  const handleBackToOrdonnateur = () => {
    setCurrentStep(2);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CommuneForm
            onNext={handleCommuneNext}
            initialData={communeData || undefined}
            isLoading={isLoading}
          />
        );
      
      case 2:
        return (
          <OrdonnateurForm
            onNext={handleOrdonnateurNext}
            onBack={handleBackToCommune}
            initialData={ordonnateurData || undefined}
            isLoading={isLoading}
          />
        );
      
      case 3:
        return (
          <CodeValidation
            email={ordonnateurData?.email || ''}
            communeData={communeData}
            ordonnateurData={ordonnateurData}
            onBack={handleBackToOrdonnateur}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configuration initiale
          </h1>
          <p className="text-gray-600">
            Configurons votre commune en quelques étapes simples
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        {/* Contenu de l'étape */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {renderCurrentStep()}
        </div>

        {/* Aide */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Besoin d'aide ? Contactez le support technique
          </p>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
