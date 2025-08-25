'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Database, RefreshCw, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastContainer';
import communeService from '@/services/communeService';

interface CommuneCheckProps {
  onCommuneExists?: () => void;
  onNoCommuneFound?: () => void;
}

const CommuneCheck = ({ onCommuneExists, onNoCommuneFound }: CommuneCheckProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();
  const { showError, showSuccess } = useToast();

  const checkCommune = async () => {
    setIsChecking(true);
    setError(null);

    try {
      const response = await communeService.checkCommune();

      if (!response.success) {
        if (response.error === 'database_disconnected') {
          setError('database_disconnected');
          showError('Erreur de connexion', 'Base de données non reliée. Veuillez réessayer.');
        } else {
          setError('unknown_error');
          showError('Erreur', response.message || 'Une erreur inattendue s\'est produite');
        }
        return;
      }

      // Commune trouvée
      if (response.data) {
        showSuccess('Commune trouvée', `Bienvenue dans ${response.data.nom}`);
        if (onCommuneExists) {
          onCommuneExists();
        } else {
          router.push('/login');
        }
        return;
      }

      // Aucune commune trouvée
      if (onNoCommuneFound) {
        onNoCommuneFound();
      } else {
        router.push('/setup');
      }

    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      setError('unknown_error');
      showError('Erreur', 'Une erreur inattendue s\'est produite');
    } finally {
      setIsChecking(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    checkCommune();
  };

  // Vérification automatique au montage
  useEffect(() => {
    checkCommune();
  }, []);

  if (isChecking && retryCount === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Vérification en cours...
          </h2>
          <p className="text-gray-600">
            Nous vérifions la configuration de votre commune
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              {error === 'database_disconnected' ? (
                <Database className="h-16 w-16 text-red-500 mx-auto mb-4" />
              ) : (
                <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              )}
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {error === 'database_disconnected' 
                  ? 'Base de données non reliée'
                  : 'Erreur de connexion'
                }
              </h2>
              
              <p className="text-gray-600 mb-6">
                {error === 'database_disconnected'
                  ? 'Impossible de se connecter à la base de données. Veuillez vérifier votre connexion et réessayer.'
                  : 'Une erreur inattendue s\'est produite. Veuillez réessayer dans quelques instants.'
                }
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleRetry}
                loading={isChecking}
                className="w-full"
                leftIcon={RefreshCw}
              >
                {isChecking ? 'Vérification...' : 'Réessayer'}
              </Button>
              
              {retryCount > 2 && (
                <p className="text-sm text-gray-500">
                  Problème persistant ? Contactez votre administrateur système.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // État de chargement pour les tentatives suivantes
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Nouvelle tentative...
          </h2>
          <p className="text-gray-600">
            Tentative {retryCount} de connexion
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default CommuneCheck;
