'use client';

import { useForm } from 'react-hook-form';
import { MapPin, Building2 } from 'lucide-react';
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
      pays: initialData?.pays || 'Sénégal',
    },
    mode: 'onChange',
  });

  const onSubmit = (data: FormData) => {
    onNext(data);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
          <Building2 className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Informations de la commune
        </h2>
        <p className="mt-2 text-gray-600">
          Renseignez les informations de base de votre commune
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Nom de la commune */}
          <Input
            label="Nom de la commune"
            placeholder="Ex: Commune de Dakar"
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

          {/* Localisation */}
          <Input
            label="Localisation"
            placeholder="Ex: Dakar, Sénégal"
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

          {/* Code postal */}
          <Input
            label="Code postal"
            placeholder="Ex: 201"
            type="text"
            error={errors.codePostal?.message}
            {...register('codePostal', {
              pattern: {
                value: /^[0-9]{2}$/,
                message: 'Le code postal doit contenir au moins 2 chiffres',
              },
            })}
          />

          {/* Région */}
          <Input
            label="Région"
            placeholder="Ex: Dakar"
            error={errors.region?.message}
            {...register('region', {
              minLength: {
                value: 2,
                message: 'La région doit contenir au moins 2 caractères',
              },
            })}
          />

          {/* Pays */}
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
            loading={isLoading}
          >
            Suivant
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CommuneForm;
