'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
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

const OrdonnateurForm = ({ onNext, onBack, initialData, isLoading }: OrdonnateurFormProps) => {
  const [sendingCode, setSendingCode] = useState(false);
  const { showError, showSuccess } = useToast();
  
  const {
    register,
    handleSubmit,
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
  const { confirmPassword, ...dataToSend } = data; // on enlève confirmPassword
  setSendingCode(true);
  
  try {
    const { default: communeService } = await import('@/services/communeService');
    console.log('Envoi du code à:', dataToSend.email);
    const response = await communeService.sendValidationCode(dataToSend.email);
    
    if (response.success) {
      showSuccess('Code envoyé', 'Un code de validation a été envoyé à votre email');
      onNext(dataToSend); // on passe dataToSend sans confirmPassword
    } else {
      showError('Erreur d\'envoi', response.message || 'Impossible d\'envoyer le code de validation');
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi du code:', error);
    showError('Erreur', 'Une erreur inattendue s\'est produite lors de l\'envoi du code');
  } finally {
    setSendingCode(false);
  }
};

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
          <User className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Informations de l'ordonnateur
        </h2>
        <p className="mt-2 text-gray-600">
          Renseignez les informations du responsable principal
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Nom */}
          <Input
            label="Nom"
            placeholder="Ex: Diop"
            leftIcon={User}
            error={errors.nom?.message}
            required
            {...register('nom', {
              required: 'Le nom est requis',
              minLength: {
                value: 2,
                message: 'Le nom doit contenir au moins 2 caractères',
              },
              pattern: {
                value: /^[A-Za-zÀ-ÿ\s'-]+$/,
                message: 'Le nom ne peut contenir que des lettres',
              },
            })}
          />

          {/* Prénom */}
          <Input
            label="Prénom"
            placeholder="Ex: Amadou"
            leftIcon={User}
            error={errors.prenom?.message}
            required
            {...register('prenom', {
              required: 'Le prénom est requis',
              minLength: {
                value: 2,
                message: 'Le prénom doit contenir au moins 2 caractères',
              },
              pattern: {
                value: /^[A-Za-zÀ-ÿ\s'-]+$/,
                message: 'Le prénom ne peut contenir que des lettres',
              },
            })}
          />
        </div>

        {/* Email */}
        <Input
          label="Adresse email"
          type="email"
          placeholder="amadou.diop@commune.sn"
          leftIcon={Mail}
          error={errors.email?.message}
          required
          {...register('email', {
            required: 'L\'adresse email est requise',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Adresse email invalide',
            },
          })}
        />

        {/* Téléphone */}
        <Input
          label="Numéro de téléphone"
          type="tel"
          placeholder="Ex: +221 77 123 45 67"
          leftIcon={Phone}
          error={errors.telephone?.message}
          helperText="Numéro de téléphone pour les notifications importantes"
          {...register('telephone', {
            pattern: {
              value: /^(\+221|0)?[0-9\s\-\.]{8,15}$/,
              message: 'Numéro de téléphone invalide',
            },
          })}
        />


<div className="flex gap-4">
  <div className="w-1/2">
    


        <Input
        label="Mot de passe"
        type="password"
        placeholder="********"
        error={errors.password?.message}
        required
        {...register('password', {
          required: 'Le mot de passe est requis',
          minLength: {
            value: 6,
            message: 'Le mot de passe doit contenir au moins 6 caractères',
          },
        })}
      />
         </div>
      {/* Confirmer le mot de passe */}
      <div className="w-1/2">
        
      <Input
        label="Confirmer le mot de passe"
        type="password"
        placeholder="********"
        error={errors.confirmPassword?.message}
        required
        {...register('confirmPassword', {
          required: 'Veuillez confirmer le mot de passe',
          validate: (value, { password }) =>
            value === password || 'Les mots de passe ne correspondent pas',
        })}
      />
      </div>
      </div>

        {/* Informations importantes */}
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Mail className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Important
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Un code de validation sera envoyé à cette adresse email. 
                  Assurez-vous qu'elle soit correcte et accessible.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-6">
          {onBack ? (
            <Button
              type="button"
              variant="secondary"
              onClick={onBack}
              disabled={isLoading}
            >
              Retour
            </Button>
          ) : (
            <div />
          )}
          
          <Button
            type="submit"
            disabled={!isValid}
            loading={sendingCode || isLoading}
          >
            {sendingCode ? 'Envoi du code...' : 'Envoyer le code'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OrdonnateurForm;
