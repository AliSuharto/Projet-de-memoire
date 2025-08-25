import api from './api';

export interface Commune {
  id?: string;
  nom: string;
  localisation: string;
  codePostal?: string;
  region?: string;
  pays?: string;
}

export interface Ordonnateur {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
}

export interface CommuneOrdonnateur {
  commune: Commune;
  ordonnateur: Ordonnateur;
}

export interface ValidationRequest {
  email: string;
  code: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class CommuneService {
  // Vérifier si une commune existe
  async checkCommune(): Promise<ApiResponse<Commune | null>> {
    try {
      const response = await api.get('/commune/check');
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
        return {
          success: false,
          error: 'database_disconnected',
          message: 'Base de données non reliée',
        };
      }
      
      if (error.response?.status === 404) {
        return {
          success: true,
          data: null,
          message: 'Aucune commune trouvée',
        };
      }

      return {
        success: false,
        error: 'unknown_error',
        message: 'Une erreur inattendue s\'est produite',
      };
    }
  }

  // Créer une commune et un ordonnateur
  async createCommuneOrdonnateur(data: CommuneOrdonnateur): Promise<ApiResponse<any>> {
    try {
      const response = await api.post('/communeordonnateur/create', data);
      return {
        success: true,
        data: response.data,
        message: 'Commune et ordonnateur créés avec succès',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'creation_failed',
        message: error.response?.data?.message || 'Échec de la création',
      };
    }
  }

  // Valider le code de vérification
  async validateCode(data: ValidationRequest): Promise<ApiResponse<any>> {
    try {
      const response = await api.post('/auth/validate-code', data);
      return {
        success: true,
        data: response.data,
        message: 'Code validé avec succès',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'validation_failed',
        message: error.response?.data?.message || 'Code de validation invalide',
      };
    }
  }

  // Renvoyer le code de validation
  async resendCode(email: string): Promise<ApiResponse<any>> {
    try {
      const response = await api.post('/auth/resend-code', { email });
      return {
        success: true,
        data: response.data,
        message: 'Code renvoyé avec succès',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'resend_failed',
        message: error.response?.data?.message || 'Échec du renvoi du code',
      };
    }
  }
}

export default new CommuneService();
