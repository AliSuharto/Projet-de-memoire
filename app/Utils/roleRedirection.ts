// utils/roleRedirection.ts
/**
 * Détermine la route de redirection basée sur le rôle
 */
export function getRoleRedirectPath(role: string): string {
  const roleRoutes: Record<string, string> = {
    'ordonnateur': '/dashboard/ordo',
    'directeur': '/dashboard/directeur',
    'regisseur': '/dashboard/regisseur',
    'regisseur_principal': '/dashboard/regisseur_principal',
    'percepteur': '/dashboard/perp',
    'createur_marche': '/dashboard/createur-marche',
  };

  return roleRoutes[role] || '/dashboard';
}

/**
 * Vérifie si l'utilisateur a accès à une route selon son rôle
 */
export function hasRoleAccess(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.length === 0 || allowedRoles.includes(userRole);
}