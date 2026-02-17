'use client';

import { useForm } from 'react-hook-form';
import { Building2, MapPin, Mail, Phone, ChevronRight } from 'lucide-react';
import { Commune } from '@/services/communeService';

interface CommuneFormProps {
  onNext: (data: Commune) => void;
  onBack?: () => void;
  initialData?: Partial<Commune>;
  isLoading?: boolean;
}

interface FormData extends Commune {
  nom: string;
  localisation: string;
  codePostal?: string;
  region?: string;
  pays?: string;
  mail?: string;
  telephone?: string;
}

// ── Shared field style ────────────────────────────────────────────────────────
const fieldWrap: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

const label: React.CSSProperties = {
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

// ── Reusable input with icon ──────────────────────────────────────────────────
const Field = ({
  label: lbl,
  icon: Icon,
  error,
  required,
  ...rest
}: {
  label: string;
  icon: React.ElementType;
  error?: string;
  required?: boolean;
  [key: string]: any;
}) => (
  <div style={fieldWrap}>
    <span style={label}>
      {lbl}{required && <span style={{ color: '#7C3AED' }}> *</span>}
    </span>
    <div style={{ position: 'relative' }}>
      <div style={iconWrap}><Icon size={14} /></div>
      <input
        style={{
          ...inputBase,
          ...(error ? { borderColor: '#EF4444' } : {}),
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
    </div>
    {error && <span style={errorStyle}>{error}</span>}
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────
const CommuneForm = ({ onNext, initialData, isLoading }: CommuneFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    defaultValues: {
      nom: initialData?.nom || '',
      localisation: initialData?.localisation || '',
      codePostal: initialData?.codePostal || '',
      region: initialData?.region || '',
      pays: initialData?.pays || 'Madagascar',
      mail: initialData?.mail || '',
      telephone: initialData?.telephone || '',
    },
    mode: 'onChange',
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'linear-gradient(135deg,#EDE9FE,#DDD6FE)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Building2 size={20} color="#7C3AED" />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1E1B4B' }}>
            Informations de la Commune
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: '#9CA3AF' }}>
            Renseignez les informations officielles de votre commune
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onNext)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Nom — full width */}
        <Field
          label="Nom de la commune"
          icon={Building2}
          placeholder="Entrez le nom de la commune"
          required
          error={errors.nom?.message}
          {...register('nom', {
            required: 'Le nom est requis',
            minLength: { value: 2, message: 'Minimum 2 caractères' },
          })}
        />

        {/* Région + Email — 2 cols */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field
            label="Région"
            icon={MapPin}
            placeholder="Sélectionnez une région"
            required
            error={errors.region?.message}
            {...register('region', {
              required: 'La région est requise',
              minLength: { value: 2, message: 'Minimum 2 caractères' },
            })}
          />
          <Field
            label="Email de la commune"
            icon={Mail}
            type="email"
            placeholder="mairie@commune.mg"
            required
            error={errors.mail?.message}
            {...register('mail', {
              required: "L'email est requis",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Email invalide',
              },
            })}
          />
        </div>

        {/* Adresse complète — textarea styled as input */}
        <div style={fieldWrap}>
          <span style={label}>Adresse complète <span style={{ color: '#7C3AED' }}>*</span></span>
          <div style={{ position: 'relative' }}>
            <div style={{ ...iconWrap, top: 14, transform: 'none' }}>
              <MapPin size={14} />
            </div>
            <textarea
              rows={2}
              placeholder="Entrez l'adresse complète de la commune"
              style={{
                ...inputBase,
                resize: 'none',
                lineHeight: '1.5',
                borderColor: errors.localisation ? '#EF4444' : '#E5E7EB',
              }}
              onFocus={e => {
                e.target.style.borderColor = '#7C3AED';
                e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)';
                e.target.style.background = '#fff';
              }}
              onBlur={e => {
                e.target.style.borderColor = errors.localisation ? '#EF4444' : '#E5E7EB';
                e.target.style.boxShadow = 'none';
                e.target.style.background = '#F9FAFB';
              }}
              {...register('localisation', {
                required: "L'adresse est requise",
                minLength: { value: 3, message: 'Minimum 3 caractères' },
              })}
            />
          </div>
          {errors.localisation && <span style={errorStyle}>{errors.localisation.message}</span>}
        </div>

        {/* Code postal + Téléphone */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field
            label="Code postal"
            icon={MapPin}
            placeholder="101"
            error={errors.codePostal?.message}
            {...register('codePostal', {
              pattern: { value: /^[0-9]{2,5}$/, message: '2 à 5 chiffres' },
            })}
          />
          <Field
            label="Téléphone"
            icon={Phone}
            type="tel"
            placeholder="+261 XX XX XXX XX"
            error={errors.telephone?.message}
            {...register('telephone', {
              pattern: { value: /^[0-9]{9,10}$/, message: '9 à 10 chiffres' },
            })}
          />
        </div>

        {/* Submit */}
        <div style={{ marginTop: 4 }}>
          <button
            type="submit"
            disabled={!isValid || isLoading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 12,
              border: 'none',
              background: (!isValid || isLoading)
                ? '#E5E7EB'
                : 'linear-gradient(135deg,#6D28D9,#7C3AED)',
              color: (!isValid || isLoading) ? '#9CA3AF' : '#fff',
              fontSize: 15,
              fontWeight: 700,
              cursor: (!isValid || isLoading) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'opacity 0.2s, transform 0.1s',
            }}
            onMouseEnter={e => {
              if (isValid && !isLoading) (e.currentTarget as HTMLButtonElement).style.opacity = '0.9';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.opacity = '1';
            }}
          >
            {isLoading ? 'Chargement...' : 'Continuer'}
            {!isLoading && <ChevronRight size={18} />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommuneForm;