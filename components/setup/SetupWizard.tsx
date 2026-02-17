'use client';

import { useState } from 'react';
import { Building2, User, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import CommuneForm from './CommuneForm';
import OrdonnateurForm from './OrdonnateurForm';
import CodeValidation from './CodeValidation';
import { useToast } from '@/components/ui/ToastContainer';
import { Commune, Ordonnateur } from '@/services/communeService';

interface Step {
  id: number;
  label: string;
  icon: React.ElementType;
}

const STEPS: Step[] = [
  { id: 1, label: 'Commune',      icon: Building2 },
  { id: 2, label: 'Ordonnateur',  icon: User      },
  { id: 3, label: 'Vérification', icon: Mail      },
];

// ─── Stepper ──────────────────────────────────────────────────────────────────

const WizardStepper = ({ currentStep }: { currentStep: number }) => (
  <div style={{
    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #9333EA 100%)',
    borderRadius: '16px 16px 0 0',
    padding: '16px 0',          // ← was 28px, now 16px
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {STEPS.map((step, idx) => {
        const Icon        = step.icon;
        const isActive    = step.id === currentStep;
        const isCompleted = step.id < currentStep;
        const isLast      = idx === STEPS.length - 1;

        return (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
            {/* Bubble + label */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 38,               // ← was 48
                height: 38,              // ← was 48
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isActive
                  ? 'rgba(255,255,255,1)'
                  : isCompleted
                  ? 'rgba(255,255,255,0.35)'
                  : 'rgba(255,255,255,0.15)',
                border: isActive
                  ? '2.5px solid rgba(255,255,255,1)'
                  : '2px solid rgba(255,255,255,0.3)',
                transition: 'all 0.3s ease',
              }}>
                <Icon size={16} color={isActive ? '#6D28D9' : 'rgba(255,255,255,0.9)'} />  {/* ← was 20 */}
              </div>
              <span style={{
                fontSize: 12,            // ← was 13
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                whiteSpace: 'nowrap',
              }}>
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {!isLast && (
              <div style={{
                width: 90,              // ← was 100
                height: 2,
                marginBottom: 18,       // ← was 24
                marginLeft: 6,
                marginRight: 6,
                background: isCompleted ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)',
                borderRadius: 2,
                transition: 'background 0.3s ease',
              }} />
            )}
          </div>
        );
      })}
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const SetupWizard = () => {
  const [currentStep, setCurrentStep]         = useState(1);
  const [isLoading]                           = useState(false);
  const [communeData, setCommuneData]         = useState<Commune | null>(null);
  const [ordonnateurData, setOrdonnateurData] = useState<Ordonnateur | null>(null);
  const { showError } = useToast();

  const handleCommuneNext = (data: Commune) => {
    setCommuneData(data);
    setCurrentStep(2);
  };

  const handleOrdonnateurNext = async (data: Ordonnateur) => {
    if (!communeData) { showError('Erreur', 'Données de commune manquantes'); return; }
    setOrdonnateurData(data);
    setCurrentStep(3);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <CommuneForm onNext={handleCommuneNext} initialData={communeData || undefined} isLoading={isLoading} />;
      case 2: return <OrdonnateurForm onNext={handleOrdonnateurNext} onBack={() => setCurrentStep(1)} initialData={ordonnateurData || undefined} isLoading={isLoading} />;
      case 3: return <CodeValidation email={ordonnateurData?.email || ''} communeData={communeData} ordonnateurData={ordonnateurData} onBack={() => setCurrentStep(2)} />;
      default: return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #EEF2FF 0%, #F5F3FF 40%, #EDE9FE 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '32px 16px',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1E1B4B', margin: 0, letterSpacing: '-0.5px' }}>
          Initialisation du plateforme e-GMC
        </h1>
        <p style={{ marginTop: 6, fontSize: 14, color: '#6B7280' }}>
          Créez votre compte e-GMC en quelques étapes simples
        </p>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 780, borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(79,70,229,0.08), 0 20px 60px -10px rgba(79,70,229,0.18)',
        background: '#fff',
      }}>
        <WizardStepper currentStep={currentStep} />

        {/* Form area */}
        <div style={{ padding: '28px 44px' }}>
          {renderStep()}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #F3F4F6', padding: '12px 44px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep(s => s - 1)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 9,
                border: '1.5px solid #E5E7EB', background: '#fff',
                color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#6D28D9'; (e.currentTarget as HTMLButtonElement).style.color = '#6D28D9'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLButtonElement).style.color = '#374151'; }}
            >
              <ChevronLeft size={14} /> Retour
            </button>
          ) : <div />}

          <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>
            Étape {currentStep} sur {STEPS.length}
          </span>

          <div style={{ width: 90 }} />
        </div>
      </div>

      {/* Footer links */}
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
          Vous avez déjà un compte ?{' '}
          <a href="/login" style={{ color: '#6D28D9', fontWeight: 600, textDecoration: 'none' }}>Se connecter</a>
        </p>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#9CA3AF' }}>
          {['Conditions utilisation', 'Politique de confidentialité', 'Aide'].map((label, i) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <a href="#" style={{ color: '#9CA3AF', textDecoration: 'none' }}>{label}</a>
              {i < 2 && <span style={{ fontSize: 10, color: '#D1D5DB' }}>•</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;