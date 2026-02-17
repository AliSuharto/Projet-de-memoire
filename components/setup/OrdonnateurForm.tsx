'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, Lock, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/ToastContainer';
import { Ordonnateur } from '@/services/communeService';

interface OrdonnateurFormProps {
  onNext: (data: Ordonnateur) => void;
  onBack?: () => void;
  initialData?: Partial<Ordonnateur>;
  isLoading?: boolean;
}

interface FormData extends Ordonnateur {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  password: string;
  confirmPassword: string;
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const fieldWrap: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: '#6B7280',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px 9px 36px',
  borderRadius: 10,
  border: '1.5px solid #E5E7EB',
  fontSize: 14,
  color: '#111827',
  background: '#F9FAFB',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
};

const iconWrap: React.CSSProperties = {
  position: 'absolute',
  left: 10,
  top: '50%',
  transform: 'translateY(-50%)',
  pointerEvents: 'none',
  color: '#9CA3AF',
};

const errorStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#EF4444',
  marginTop: 2,
};

// ── Field component ───────────────────────────────────────────────────────────
const Field = ({
  label: lbl,
  icon: Icon,
  error,
  required,
  rightEl,
  ...rest
}: {
  label: string;
  icon: React.ElementType;
  error?: string;
  required?: boolean;
  rightEl?: React.ReactNode;
  [key: string]: any;
}) => (
  <div style={fieldWrap}>
    <span style={labelStyle}>
      {lbl}{required && <span style={{ color: '#7C3AED' }}> *</span>}
    </span>
    <div style={{ position: 'relative' }}>
      <div style={iconWrap}><Icon size={14} /></div>
      <input
        style={{
          ...inputBase,
          paddingRight: rightEl ? 38 : 12,
          borderColor: error ? '#EF4444' : '#E5E7EB',
        }}
        onFocus={e => {
          e.target.style.borderColor = '#7C3AED';
          e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)';
          e.target.style.background = '#fff';
        }}
        onBlur={e => {
          e.target.style.borderColor = error ? '#EF4444' : '#E5E7EB';
          e.target.style.boxShadow = 'none';
          e.target.style.background = '#F9FAFB';
        }}
        {...rest}
      />
      {rightEl && (
        <div style={{
          position: 'absolute', right: 10, top: '50%',
          transform: 'translateY(-50%)', cursor: 'pointer', color: '#9CA3AF',
        }}>
          {rightEl}
        </div>
      )}
    </div>
    {error && <span style={errorStyle}>{error}</span>}
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────
const OrdonnateurForm = ({ onNext, onBack, initialData, isLoading }: OrdonnateurFormProps) => {
  const [sendingCode, setSendingCode] = useState(false);
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { showError, showSuccess }    = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
    defaultValues: {
      nom: initialData?.nom || '',
      prenom: initialData?.prenom || '',
      email: initialData?.email || '',
      telephone: initialData?.telephone || '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: FormData) => {
    const { confirmPassword, ...dataToSend } = data;
    setSendingCode(true);
    try {
      const { default: communeService } = await import('@/services/communeService');
      const response = await communeService.sendValidationCode(dataToSend.email);
      if (response.success) {
        showSuccess('Code envoyé', 'Un code de validation a été envoyé à votre email');
        onNext(dataToSend);
      } else {
        showError("Erreur d'envoi", response.message || 'Impossible d\'envoyer le code');
      }
    } catch {
      showError('Erreur', 'Une erreur inattendue s\'est produite');
    } finally {
      setSendingCode(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'linear-gradient(135deg,#D1FAE5,#A7F3D0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <User size={20} color="#059669" />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1E1B4B' }}>
            Informations de l'Ordonnateur
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: '#9CA3AF' }}>
            Renseignez les informations du responsable principal
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Nom + Prénom */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Nom" icon={User} required error={errors.nom?.message}
            placeholder="Ex: Rabe"
            {...register('nom', {
              required: 'Requis',
              minLength: { value: 2, message: 'Min 2 car.' },
              pattern: { value: /^[A-Za-zÀ-ÿ\s'-]+$/, message: 'Lettres uniquement' },
            })}
          />
          <Field label="Prénom" icon={User} required error={errors.prenom?.message}
            placeholder="Ex: Ali"
            {...register('prenom', {
              required: 'Requis',
              minLength: { value: 2, message: 'Min 2 car.' },
              pattern: { value: /^[A-Za-zÀ-ÿ\s'-]+$/, message: 'Lettres uniquement' },
            })}
          />
        </div>

        {/* Email + Téléphone */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Adresse email" icon={Mail} type="email" required error={errors.email?.message}
            placeholder="rakoto@commune.mg"
            {...register('email', {
              required: 'Requis',
              pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Email invalide' },
            })}
          />
          <Field label="Téléphone" icon={Phone} type="tel" error={errors.telephone?.message}
            placeholder="+221 77 123 45 67"
            {...register('telephone', {
              pattern: { value: /^(\+221|0)?[0-9\s\-\.]{8,15}$/, message: 'Numéro invalide' },
            })}
          />
        </div>

        {/* Mot de passe + Confirmation */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field
            label="Mot de passe" icon={Lock} type={showPwd ? 'text' : 'password'}
            required error={errors.password?.message}
            placeholder="••••••••"
            rightEl={
              <span onClick={() => setShowPwd(v => !v)}>
                {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
              </span>
            }
            {...register('password', {
              required: 'Requis',
              minLength: { value: 6, message: 'Min 6 caractères' },
            })}
          />
          <Field
            label="Confirmer" icon={Lock} type={showConfirm ? 'text' : 'password'}
            required error={errors.confirmPassword?.message}
            placeholder="••••••••"
            rightEl={
              <span onClick={() => setShowConfirm(v => !v)}>
                {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
              </span>
            }
            {...register('confirmPassword', {
              required: 'Requis',
              validate: (v) => v === watch('password') || 'Mots de passe différents',
            })}
          />
        </div>

        {/* Info banner */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          padding: '10px 14px', borderRadius: 10,
          background: '#EFF6FF', border: '1px solid #BFDBFE',
        }}>
          <Mail size={15} color="#3B82F6" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ margin: 0, fontSize: 12, color: '#1D4ED8', lineHeight: 1.5 }}>
            Un code de validation sera envoyé à l'adresse email saisie. Vérifiez qu'elle est correcte et accessible.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid || sendingCode || isLoading}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 12,
            border: 'none',
            background: (!isValid || sendingCode || isLoading)
              ? '#E5E7EB'
              : 'linear-gradient(135deg,#6D28D9,#7C3AED)',
            color: (!isValid || sendingCode || isLoading) ? '#9CA3AF' : '#fff',
            fontSize: 15,
            fontWeight: 700,
            cursor: (!isValid || sendingCode || isLoading) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => {
            if (isValid && !sendingCode) (e.currentTarget as HTMLButtonElement).style.opacity = '0.9';
          }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
        >
          {sendingCode ? 'Envoi du code...' : 'Envoyer le code'}
          {!sendingCode && <ChevronRight size={18} />}
        </button>
      </form>
    </div>
  );
};

export default OrdonnateurForm;