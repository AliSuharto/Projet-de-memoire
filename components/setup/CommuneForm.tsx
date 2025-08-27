'use client';

import { useForm } from 'react-hook-form';
import { MapPin, Building2, ArrowRight, CheckCircle } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
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

const CommuneForm = ({ onNext, onBack, initialData, isLoading }: CommuneFormProps) => {
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
    },
    mode: 'onChange',
  });

  const onSubmit = (data: FormData) => {
    onNext(data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Guide d'utilisation */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Configuration de votre commune
            </h3>
            <p className="text-gray-700 mb-4">
              Pour continuer à utiliser la plateforme, veuillez renseigner ci-dessous les informations 
              de votre commune. Ces données nous permettront de personnaliser votre expérience et de vous 
              proposer des services adaptés à votre région.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Informations sécurisées</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Configuration rapide</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Modifiable à tout moment</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* En-tête du formulaire */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Informations de la commune
        </h2>
        <p className="text-lg text-gray-600">
          Complétez les champs ci-dessous pour finaliser votre configuration
        </p>
      </div>

      {/* Formulaire */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Informations principales - 2 colonnes */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Building2 className="h-5 w-5 text-blue-600 mr-2" />
              Informations principales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nom de la commune"
                placeholder="Ex: Commune de Diego"
                leftIcon={Building2}
                error={errors.nom?.message}
                required
                {...register('nom', {
                  required: 'Le nom de la commune est requis',
                  minLength: {
                    value: 2,
                    message: 'Le nom doit contenir au moins 2 caractères',
                  },
                })}
              />

              <Input
                label="Localisation"
                placeholder="Ex: Antsiranana, Madagascar"
                leftIcon={MapPin}
                error={errors.localisation?.message}
                required
                {...register('localisation', {
                  required: 'La localisation est requise',
                  minLength: {
                    value: 3,
                    message: 'La localisation doit contenir au moins 3 caractères',
                  },
                })}
              />
            </div>
          </div>

          {/* Informations géographiques - 3 colonnes */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 text-green-600 mr-2" />
              Informations géographiques
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Code postal"
                placeholder="Ex: 101"
                type="text"
                error={errors.codePostal?.message}
                {...register('codePostal', {
                  pattern: {
                    value: /^[0-9]{2,5}$/,
                    message: 'Le code postal doit contenir entre 2 et 5 chiffres',
                  },
                })}
              />

              <Input
                label="Région"
                placeholder="Ex: DIANA"
                error={errors.region?.message}
                {...register('region', {
                  minLength: {
                    value: 2,
                    message: 'La région doit contenir au moins 2 caractères',
                  },
                })}
              />

              <Input
                label="Pays"
                placeholder="Ex: Madagascar"
                error={errors.pays?.message}
                {...register('pays', {
                  required: 'Le pays est requis',
                  minLength: {
                    value: 2,
                    message: 'Le pays doit contenir au moins 2 caractères',
                  },
                })}
              />
            </div>
          </div>

<div>
  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
    <CheckCircle className="h-5 w-5 text-purple-600 mr-2" />
    Coordonnées
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Input
      label="Adresse e-mail"
      placeholder="Ex: commune@example.com"
      type="email"
      // error={errors.mail?.message}
      {...register('mail', {
        required: 'L’adresse e-mail est requise',
        pattern: {
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: 'Veuillez entrer une adresse e-mail valide',
        },
      })}
    />

    <Input
      label="Numéro de téléphone"
      placeholder="Ex: 034 12 345 67"
      type="tel"
      error={errors.telephone?.message}
      {...register('telephone', {
        required: 'Le numéro de téléphone est requis',
        pattern: {
          value: /^[0-9]{9,10}$/,
          message: 'Le numéro doit contenir entre 9 et 10 chiffres',
        },
      })}
    />
  </div>
</div>









          {/* Message d'aide */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 flex items-start">
              <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              Les champs marqués d'un astérisque (*) sont obligatoires. Les autres informations 
              nous aideront à mieux vous servir mais restent optionnelles.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            {onBack ? (
              <Button
                type="button"
                variant="secondary"
                onClick={onBack}
                disabled={isLoading}
                className="px-6"
              >
                Retour
              </Button>
            ) : (
              <div />
            )}
            
            <Button
              type="submit"
              disabled={!isValid}
              loading={isLoading}
              className="px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isLoading ? (
                'Configuration en cours...'
              ) : (
                <span className="flex items-center">
                  Continuer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Barre de progression (optionnelle) */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <div className="w-8 h-0.5 bg-blue-500"></div>
          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          <div className="w-8 h-0.5 bg-gray-300"></div>
          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          <span className="ml-3">Étape 1 sur 3</span>
        </div>
      </div>
    </div>
  );
};

export default CommuneForm;