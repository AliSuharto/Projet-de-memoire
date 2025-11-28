import { AuthUser } from '@/lib/auth';
import api from './api';

export interface ApiUser {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  telephone: string;
  photoUrl?: string;
  pseudo?: string;
  communeNom?: string;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt?: string;
  createdByName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ✅ Interface corrigée pour correspondre à la structure réelle de votre API
export interface LoginResponse {
  token: string;
  type: string; // "Bearer"
  user: ApiUser; // Utilisateur complet de l'API
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}



class AuthService {
  // Connexion utilisateur
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // ✅ Gestion du double niveau "data" selon votre structure
      const loginData = response.data.data || response.data;
      
      if (loginData.token) {
        // Stocker le token
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('user', JSON.stringify(loginData.user));
      }

      return {
        success: true,
        data: loginData, // Contient { token, type, user }
        message: response.data.message || 'Connexion réussie',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'login_failed',
        message: error.response?.data?.message || 'Email ou mot de passe incorrect',
      };
    }
  }

  // Déconnexion
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyer le stockage local
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // ✅ Récupérer l'utilisateur actuel avec conversion vers AuthUser
  getCurrentUser(): AuthUser | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const apiUser: ApiUser = JSON.parse(userStr);
        
        // Convertir ApiUser vers AuthUser pour le contexte
        return {
          id: apiUser.id,
          email: apiUser.email,
          nom: apiUser.nom,
          prenom: apiUser.prenom,
          role: this.mapApiRoleToLowerCase(apiUser.role),
          avatar: apiUser.photoUrl || undefined,
        };
      } catch (error) {
        console.error('Erreur lors du parsing de l\'utilisateur:', error);
        return null;
      }
    }
    return null;
  }

  // ✅ Récupérer les données brutes de l'utilisateur API
  getRawUser(): ApiUser | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Erreur lors du parsing de l\'utilisateur:', error);
        return null;
      }
    }
    return null;
  }

  // ✅ Mapper le rôle API vers minuscules pour la navigation
  private mapApiRoleToLowerCase(apiRole: string): string {
    const roleMapping: { [key: string]: string } = {
      'ORDONNATEUR': 'ordonnateur',
      'DIRECTEUR': 'directeur',
      'REGISSEUR': 'regisseur',
      'REGISSEUR_PRINCIPAL': 'regisseur_principal',
      'PERCEPTEUR': 'percepteur',
      'CREATEUR_MARCHE': 'createur_marche',
    };

    return roleMapping[apiRole.toUpperCase()] || 'ordonnateur';
  }

  // ✅ Méthode publique pour obtenir le rôle mappé
  public getUserRole(): string {
    const user = this.getRawUser();
    return user ? this.mapApiRoleToLowerCase(user.role) : '';
  }

  // Récupérer le token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Vérifier le token avec le serveur
  async verifyToken(): Promise<ApiResponse<any>> {
    try {
      const response = await api.get('/auth/verify');
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'token_invalid',
        message: 'Token invalide ou expiré',
      };
    }
  }
}

export default new AuthService();