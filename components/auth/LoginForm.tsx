'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastContainer';
import { useAuth } from '@/components/auth/AuthProvider';
import authService, { LoginRequest } from '@/services/authService';

interface LoginFormProps {
  redirectTo?: string;
}

const LoginForm = ({ redirectTo }: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { showError, showSuccess } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginRequest>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginRequest) => {
    setIsLoading(true);

    try {
      const response = await authService.login(data);

      if (response.success && response.data) {
        // Mettre à jour le contexte d'authentification
        login(response.data.user);
        
        showSuccess('Connexion réussie', `Bienvenue ${response.data.user.name}`);
        
        // Redirection basée sur le rôle
        const roleRoutes: { [key: string]: string } = {
          'ordonnateur': '/dashboard/ordo',
          'directeur': '/dashboard/directeur',
          'regisseur': '/dashboard/regisseur',
          'regisseur_principal': '/dashboard/regisseur-principal',
          'percepteur': '/dashboard/perp',
          'createur_marche': '/dashboard/createur-marche',
        };

        const dashboardRoute = roleRoutes[response.data.user.role.toLowerCase()] || '/dashboard';
        router.push(redirectTo || dashboardRoute);
      } else {
        showError('Connexion échouée', response.message || 'Identifiants incorrects');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      showError('Erreur', 'Une erreur inattendue est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Connexion
        </h2>
        <p className="mt-2 text-gray-600">
          Connectez-vous à votre espace de gestion
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email */}
        <Input
          label="Adresse email"
          type="email"
          placeholder="votre.email@commune.sn"
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

        {/* Mot de passe */}
        <Input
          label="Mot de passe"
          type={showPassword ? 'text' : 'password'}
          placeholder="Votre mot de passe"
          leftIcon={Lock}
          rightIcon={showPassword ? EyeOff : Eye}
          onRightIconClick={() => setShowPassword(!showPassword)}
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

        {/* Options supplémentaires */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-600">
              Se souvenir de moi
            </span>
          </label>
          
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
          >
            Mot de passe oublié ?
          </button>
        </div>

        {/* Bouton de connexion */}
        <Button
          type="submit"
          loading={isLoading}
          disabled={!isValid}
          className="w-full"
          size="lg"
        >
          {isLoading ? 'Connexion...' : 'Se connecter'}
        </Button>
      </form>

      {/* Informations de démo */}
      {/* <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          Comptes de démonstration
        </h3>
        <div className="text-xs text-blue-700 space-y-1">
          <div><strong>Ordonnateur :</strong> ordonnateur@commune.sn</div>
          <div><strong>Directeur :</strong> directeur@commune.sn</div>
          <div><strong>Régisseur :</strong> regisseur@commune.sn</div>
          <div><strong>Percepteur :</strong> percepteur@commune.sn</div>
          <div className="mt-2 text-blue-600">
            <em>Mot de passe : demo123</em>
          </div>
        </div>
      </div> */}

      {/* Lien vers la configuration */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Première utilisation ?{' '}
          <button
            type="button"
            onClick={() => router.push('/setup')}
            className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
          >
            Configurer votre commune
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
