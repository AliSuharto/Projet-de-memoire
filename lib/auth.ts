// Système d'authentification et de gestion des rôles

export type UserRole = 'Admin' | 'PRMC' | 'Ordonnateur' | 'Régisseur' | 'PERP' | 'Utilisateur';

export interface AuthUser {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: UserRole;
  permissions: string[];
  commune?: string;
  avatar?: string;
}

// Permissions par rôle
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  Admin: [
    'users.create', 'users.read', 'users.update', 'users.delete',
    'markets.create', 'markets.read', 'markets.update', 'markets.delete',
    'merchants.create', 'merchants.read', 'merchants.update', 'merchants.delete',
    'config.read', 'config.update',
    'reports.read', 'reports.create',
    'dashboard.admin'
  ],
  PRMC: [
    'markets.create', 'markets.read', 'markets.update', 'markets.delete',
    'merchants.create', 'merchants.read', 'merchants.update', 'merchants.delete',
    'users.read', 'users.create',
    'reports.read', 'reports.create',
    'dashboard.prmc'
  ],
  Ordonnateur: [
    'markets.read',
    'merchants.read',
    'config.read', 'config.update',
    'reports.read',
    'dashboard.ordonnateur'
  ],
  Régisseur: [
    'markets.read',
    'merchants.read', 'merchants.update',
    'reports.read',
    'dashboard.regisseur'
  ],
  PERP: [
    'markets.read',
    'merchants.read',
    'reports.read',
    'dashboard.perp'
  ],
  Utilisateur: [
    'markets.read',
    'dashboard.user'
  ]
};

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
    '/dashboard/prmc'
  ],
  Ordonnateur: [
    '/dashboard',
    '/dashboard/ordo'
  ],
  Régisseur: [
    '/dashboard',
    '/dashboard/regisseur'
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
  Ordonnateur: '/dashboard/ordo',
  Régisseur: '/dashboard/regisseur',
  PERP: '/dashboard/perp',
  Utilisateur: '/dashboard'
};

// Fonction pour vérifier les permissions
export const hasPermission = (user: AuthUser | null, permission: string): boolean => {
  if (!user) return false;
  return user.permissions.includes(permission);
};

// Fonction pour vérifier l'accès à une route
export const canAccessRoute = (user: AuthUser | null, route: string): boolean => {
  if (!user) return false;
  const allowedRoutes = ROLE_ROUTES[user.role] || [];
  return allowedRoutes.some(allowedRoute => route.startsWith(allowedRoute));
};

// Fonction pour obtenir les permissions d'un rôle
export const getRolePermissions = (role: UserRole): string[] => {
  return ROLE_PERMISSIONS[role] || [];
};

// Fonction pour créer un utilisateur avec ses permissions
export const createUserWithPermissions = (userData: Omit<AuthUser, 'permissions'>): AuthUser => {
  return {
    ...userData,
    permissions: getRolePermissions(userData.role)
  };
};

// Mock pour la simulation d'authentification
export const MOCK_USERS: AuthUser[] = [
  createUserWithPermissions({
    id: 1,
    email: 'admin@egmc.com',
    nom: 'Admin',
    prenom: 'Super',
    role: 'Admin',
    commune: 'Toutes'
  }),
  createUserWithPermissions({
    id: 2,
    email: 'prmc@egmc.com',
    nom: 'Dupont',
    prenom: 'Marie',
    role: 'PRMC',
    commune: 'Commune de Test'
  }),
  createUserWithPermissions({
    id: 3,
    email: 'ordo@egmc.com',
    nom: 'Martin',
    prenom: 'Jean',
    role: 'Ordonnateur',
    commune: 'Commune de Test'
  }),
  createUserWithPermissions({
    id: 4,
    email: 'regisseur@egmc.com',
    nom: 'Bernard',
    prenom: 'Pierre',
    role: 'Régisseur',
    commune: 'Commune de Test'
  }),
  createUserWithPermissions({
    id: 5,
    email: 'perp@egmc.com',
    nom: 'Durand',
    prenom: 'Sophie',
    role: 'PERP',
    commune: 'Commune de Test'
  })
];

// Fonction de connexion simulée
export const mockLogin = async (email: string, password: string): Promise<AuthUser | null> => {
  // Simulation d'un délai d'API
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const user = MOCK_USERS.find(u => u.email === email);
  
  // Pour la démo, accepter n'importe quel mot de passe
  if (user) {
    return user;
  }
  
  return null;
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
