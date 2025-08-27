'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, RefreshCw, Mail } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastContainer';
import communeService from '@/services/communeService';

interface CodeValidationProps {
  email: string;
  communeData: any; // Données de la commune
  ordonnateurData: any; // Données de l'ordonnateur
  onBack?: () => void;
}

const CodeValidation = ({ email, communeData, ordonnateurData, onBack }: CodeValidationProps) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isValidating, setIsValidating] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { showSuccess, showError, showInfo } = useToast();

  // Timer pour le renvoi de code
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Focus automatique sur le premier input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Empêcher la saisie de plusieurs caractères

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Passer au champ suivant si un chiffre est saisi
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Supprimer et revenir au champ précédent
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Coller le code complet
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6).split('');
        const newCode = [...code];
        digits.forEach((digit, i) => {
          if (i < 6) newCode[i] = digit;
        });
        setCode(newCode);
        
        // Focus sur le dernier champ rempli ou le suivant
        const nextIndex = Math.min(digits.length, 5);
        inputRefs.current[nextIndex]?.focus();
      });
    }
  };

  const handleValidate = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      showError('Code incomplet', 'Veuillez saisir les 6 chiffres du code');
      return;
    }

    setIsValidating(true);

    try {
      // Créer le compte complet avec les données commune + ordonnateur + code
      const payload = {
        commune: communeData,
        ordonnateur: ordonnateurData,
        validationCode: fullCode,
        email: ordonnateurData.email, // Ajout de l'email ici
      };
        console.log('Payload de création:', payload);
      const response = await communeService.createCommuneOrdonnateur(payload);
        
      if (response.success) {
        showSuccess('Compte créé avec succès', 'Votre commune et compte ordonnateur ont été créés');
        router.push('/login');
      } else {
        showError('Erreur de création', response.message || 'Impossible de créer le compte');
        // Réinitialiser le code en cas d'erreur
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('Erreur de création:', error);
      showError('Erreur', 'Une erreur est survenue lors de la création du compte');
    } finally {
      setIsValidating(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);

    try {
      const response = await communeService.sendValidationCode(email);

      if (response.success) {
        showSuccess('Code renvoyé', 'Un nouveau code a été envoyé à votre email');
        setTimeLeft(60); // 1 minute avant de pouvoir renvoyer
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        showError('Erreur de renvoi', response.message || 'Impossible de renvoyer le code');
      }
    } catch (error) {
      console.error('Erreur de renvoi:', error);
      showError('Erreur', 'Une erreur est survenue lors du renvoi');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 mb-4">
          <Shield className="h-6 w-6 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Validation par code
        </h2>
        <p className="mt-2 text-gray-600">
          Saisissez le code à 6 chiffres envoyé à
        </p>
        <p className="text-blue-600 font-medium">{email}</p>
      </div>

      {/* Champs de saisie du code */}
      <div className="flex justify-center space-x-3">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="text"
            inputMode="numeric"
            pattern="[0-9]"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
          />
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <Button
          onClick={handleValidate}
          loading={isValidating}
          disabled={code.join('').length !== 6}
          className="w-full"
        >
          {isValidating ? 'Validation...' : 'Valider le code'}
        </Button>

        {/* Renvoyer le code */}
        <div className="text-center">
          {timeLeft > 0 ? (
            <p className="text-sm text-gray-500">
              Renvoyer le code dans {timeLeft}s
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending}
              className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Renvoi en cours...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Renvoyer le code
                </>
              )}
            </button>
          )}
        </div>

        {/* Bouton retour */}
        {onBack && (
          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              disabled={isValidating || isResending}
              className="text-sm"
            >
              Modifier l'email
            </Button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="text-sm text-gray-600">
          <p className="font-medium mb-2">Vous ne recevez pas le code ?</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Vérifiez votre dossier spam/courrier indésirable</li>
            <li>Assurez-vous que l'adresse email est correcte</li>
            <li>Attendez quelques minutes, la livraison peut prendre du temps</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CodeValidation;
