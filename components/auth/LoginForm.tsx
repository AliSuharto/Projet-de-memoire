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
import { getRoleRedirectPath } from '@/app/Utils/roleRedirection';
import { AuthUser } from '@/lib/auth';

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
      console.log('Réponse login:', response);
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        
        // Stocker le token (si nécessaire pour votre authService)
        if (token) {
          localStorage.setItem('authToken', token);
          // ou utiliser votre méthode de stockage de token
        }
        
        // Récupérer le rôle mappé depuis authService
        const mappedRole = authService.getUserRole();
        
        // Convertir vers AuthUser pour le contexte
        const authUser: AuthUser = {
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom || '',
          role: mappedRole,
          avatar: user.photoUrl || undefined,
          telephone: user.telephone
        };
        
        // Mettre à jour le contexte d'authentification
        login(authUser);
        
        // Message de succès avec le nom complet
        const fullName = user.prenom ? `${user.nom} ${user.prenom}` : user.nom;
        showSuccess('Connexion réussie', `Bienvenue ${fullName}`);
        
        // Redirection basée sur le rôle
        const dashboardRoute = getRoleRedirectPath(mappedRole);
        const finalRedirect = redirectTo || dashboardRoute;
        
        console.log(`Redirection: ${mappedRole} -> ${finalRedirect}`);
        
        // Petite temporisation pour que l'utilisateur voie le message de succès
        setTimeout(() => {
          router.push(finalRedirect);
        }, 500);
        
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