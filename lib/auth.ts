// Système d'authentification et de gestion des rôles

export interface AuthUser {
  id?: number;
  email: string;
  nom: string;
  prenom?: string;
  role: string;
  avatar?: string;
  telephone?: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    user: {
      id?: string;
      email: string;
      nom: string;
      prenom?: string;
      photoUrl?: string;
      telephone?: string;
      departement?: string;
      // autres propriétés de votre API
    };
  };
  message?: string;
}

export type UserRole = 
  | 'ordonnateur'
  | 'directeur' 
  | 'regisseur'
  | 'regisseur_principal'
  | 'percepteur'
  | 'createur_marche';

export interface DecodedToken {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: UserRole;
  avatar?: string;
  telephone?: string;
}


import { jwtDecode } from 'jwt-decode';

/**
 * Extrait les informations utilisateur depuis le token JWT
 * @param token - Le token JWT
 * @returns Les informations utilisateur ou null
 */
export function extractUserFromToken(token: string): AuthUser | null {
  try {
    if (!token) return null;
    
    const decoded = jwtDecode<DecodedToken>(token);
    
    return {
      id: decoded.id,
      email: decoded.email,
      nom: decoded.nom,
      prenom: decoded.prenom,
      role: decoded.role,
      avatar: decoded.avatar,
      telephone: decoded.telephone,
    };
  } catch (error) {
    console.error('Erreur lors du décodage du token:', error);
    return null;
  }
}















// // Permissions par rôle
// export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
//   Admin: [
//     'users.create', 'users.read', 'users.update', 'users.delete',
//     'markets.create', 'markets.read', 'markets.update', 'markets.delete',
//     'merchants.create', 'merchants.read', 'merchants.update', 'merchants.delete',
//     'config.read', 'config.update',
//     'reports.read', 'reports.create',
//     'dashboard.admin'
//   ],
//   PRMC: [
//     'markets.create', 'markets.read', 'markets.update', 'markets.delete',
//     'merchants.create', 'merchants.read', 'merchants.update', 'merchants.delete',
//     'users.read', 'users.create',
//     'reports.read', 'reports.create',
//     'dashboard.prmc'
//   ],
//   Ordonnateur: [
//     'markets.read',
//     'merchants.read',
//     'config.read', 'config.update',
//     'reports.read',
//     'dashboard.ordonnateur'
//   ],
//   Régisseur: [
//     'markets.read',
//     'merchants.read', 'merchants.update',
//     'reports.read',
//     'dashboard.regisseur'
//   ],
//   PERP: [
//     'markets.read',
//     'merchants.read',
//     'reports.read',
//     'dashboard.perp'
//   ],
//   Utilisateur: [
//     'markets.read',
//     'dashboard.user'
//   ]
// };

// Routes par rôle
export const ROLE_ROUTES: Record<UserRole, string[]> = {
  Admin: [
    '/dashboard',
    '/dashboard/admin',
    '/dashboard/prmc',
    '/dashboard/ordo',
    '/dashboard/regisseur',
    '/dashboard/perp'
  ],
  PRMC: [
    '/dashboard',
    '/dashboard/prmc',
    '/dashboard/directeur/utilisateurs/liste',
    '/dashboard/directeur/utilisateurs/creer',
    '/dashboard/directeur/marches/[marketId]',
  ],
  Ordonnateur: [
    '/dashboard',
    '/dashboard/ordo',
    '/dashboard/ordo/creerPrmc',
    '/dashboard/ordo/marchands'
  ],
  regisseur: [
    '/dashboard',
    '/dashboard/regisseur'
  ],

  regisseur_principal: [
    '/dashboard',
    '/dashboard/regisseur_principal'
  ],
  PERP: [
    '/dashboard',
    '/dashboard/perp'
  ],
  Utilisateur: [
    '/dashboard'
  ]
};

// Dashboard par défaut par rôle
export const DEFAULT_DASHBOARD: Record<UserRole, string> = {
  Admin: '/dashboard',
  PRMC: '/dashboard/prmc',
  Ordonnateur: '/dashboard/ordonnateur',
  regisseur: '/dashboard/regisseur',
  regisseur_principal: '/dashboard/regisseur_principal',
  PERP: '/dashboard/perp',
  Utilisateur: '/dashboard'
};


// Fonction pour obtenir l'utilisateur actuel (simulation)
export const getCurrentUser = (): AuthUser | null => {
  // Dans une vraie application, ceci viendrait du localStorage, cookies, ou contexte
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  }
  return null;
};

// Fonction pour sauvegarder l'utilisateur actuel
export const setCurrentUser = (user: AuthUser | null): void => {
  if (typeof window !== 'undefined') {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }
};

// Fonction de déconnexion
export const logout = (): void => {
  setCurrentUser(null);
};
