'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, RefreshCw, Mail, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/ToastContainer';
import communeService from '@/services/communeService';

interface CodeValidationProps {
  email: string;
  communeData: any;
  ordonnateurData: any;
  onBack?: () => void;
}

const CodeValidation = ({ email, communeData, ordonnateurData, onBack }: CodeValidationProps) => {
  const [code, setCode]             = useState(['', '', '', '', '', '']);
  const [isValidating, setIsValidating] = useState(false);
  const [isResending, setIsResending]   = useState(false);
  const [timeLeft, setTimeLeft]         = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router    = useRouter();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(v => v - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timeLeft]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const next = [...code];
    next[index] = value;
    setCode(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6).split('');
        const next = [...code];
        digits.forEach((d, i) => { if (i < 6) next[i] = d; });
        setCode(next);
        inputRefs.current[Math.min(digits.length, 5)]?.focus();
      });
    }
  };

  const handleValidate = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      showError('Code incomplet', 'Veuillez saisir les 6 chiffres');
      return;
    }
    setIsValidating(true);
    try {
      const payload = {
        commune: communeData,
        ordonnateur: ordonnateurData,
        validationCode: fullCode,
        email: ordonnateurData.email,
      };
      const response = await communeService.createCommuneOrdonnateur(payload);
      if (response.success) {
        showSuccess('Compte créé !', 'Votre commune et compte ont été créés');
        router.push('/login');
      } else {
        showError('Erreur', response.message || 'Impossible de créer le compte');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch {
      showError('Erreur', 'Une erreur est survenue');
    } finally {
      setIsValidating(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const response = await communeService.sendValidationCode(email);
      if (response.success) {
        showSuccess('Code renvoyé', 'Vérifiez votre boîte mail');
        setTimeLeft(60);
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        showError('Erreur', response.message || 'Impossible de renvoyer');
      }
    } catch {
      showError('Erreur', 'Une erreur est survenue');
    } finally {
      setIsResending(false);
    }
  };

  const isFull = code.join('').length === 6;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>

      {/* Icon + Title — horizontal, compact */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, alignSelf: 'flex-start', width: '100%' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: 'linear-gradient(135deg,#EDE9FE,#DDD6FE)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Shield size={18} color="#7C3AED" />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1E1B4B' }}>
            Validation par code
          </h2>
          <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>
            Code envoyé à <span style={{ color: '#6D28D9', fontWeight: 600 }}>{email}</span>
          </p>
        </div>
      </div>

      {/* OTP inputs — smaller */}
      <div style={{ display: 'flex', gap: 8 }}>
        {code.map((digit, i) => (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            style={{
              width: 44, height: 48,
              textAlign: 'center',
              fontSize: 20,
              fontWeight: 700,
              borderRadius: 10,
              border: `2px solid ${digit ? '#7C3AED' : '#E5E7EB'}`,
              background: digit ? '#F5F3FF' : '#F9FAFB',
              color: '#1E1B4B',
              outline: 'none',
              transition: 'all 0.15s',
              caretColor: '#7C3AED',
            }}
            onFocus={e => {
              e.target.style.borderColor = '#7C3AED';
              e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)';
            }}
            onBlur={e => {
              e.target.style.borderColor = digit ? '#7C3AED' : '#E5E7EB';
              e.target.style.boxShadow = 'none';
            }}
          />
        ))}
      </div>

      {/* Validate button */}
      <button
        onClick={handleValidate}
        disabled={!isFull || isValidating}
        style={{
          width: '100%',
          padding: '11px',
          borderRadius: 10,
          border: 'none',
          background: (!isFull || isValidating)
            ? '#E5E7EB'
            : 'linear-gradient(135deg,#6D28D9,#7C3AED)',
          color: (!isFull || isValidating) ? '#9CA3AF' : '#fff',
          fontSize: 14,
          fontWeight: 700,
          cursor: (!isFull || isValidating) ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 7,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => { if (isFull && !isValidating) (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
      >
        {isValidating ? 'Validation...' : <><CheckCircle size={15} /> Valider le code</>}
      </button>

      {/* Resend + back — one compact row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {timeLeft > 0 ? (
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>
            Renvoyer dans <span style={{ color: '#7C3AED', fontWeight: 600 }}>{timeLeft}s</span>
          </span>
        ) : (
          <button onClick={handleResend} disabled={isResending} style={{
            background: 'none', border: 'none', color: '#6D28D9', fontSize: 12,
            fontWeight: 600, cursor: isResending ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 5, padding: 0,
            opacity: isResending ? 0.6 : 1,
          }}>
            <RefreshCw size={12} style={{ animation: isResending ? 'spin 1s linear infinite' : 'none' }} />
            {isResending ? 'Renvoi...' : 'Renvoyer le code'}
          </button>
        )}
        {onBack && (
          <button onClick={onBack} disabled={isValidating || isResending} style={{
            background: 'none', border: 'none', color: '#9CA3AF',
            fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0,
          }}>
            <Mail size={12} /> Modifier l'email
          </button>
        )}
      </div>

      {/* Help — collapsed inline row */}
      <div style={{
        width: '100%', padding: '10px 14px', borderRadius: 10,
        background: '#F9FAFB', border: '1px solid #F3F4F6',
        display: 'flex', alignItems: 'flex-start', gap: 8,
      }}>
        <Shield size={13} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ margin: 0, fontSize: 12, color: '#6B7280', lineHeight: 1.6 }}>
          Pas de code reçu ? Vérifiez votre spam ou que l'adresse email est correcte.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default CodeValidation;