// Types communs pour toute l'application
export interface BaseEntity {
  id: number;
  dateCreation?: string;
  dateModification?: string;
}

// Types pour les tableaux réutilisables
export interface TableColumn<T> {
  key: string;
  header: string;
  accessor?: (item: T) => React.ReactNode;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface TableAction<T> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (item: T) => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

// Types pour la pagination
export interface PaginationOptions {
  itemsPerPage: number;
  showItemsPerPageSelector?: boolean;
  itemsPerPageOptions?: number[];
  showInfo?: boolean;
}

// Types pour la recherche
export interface SearchOptions {
  placeholder?: string;
  searchableFields?: string[];
  className?: string;
}

// Types pour les utilisateurs
export interface User extends BaseEntity {
  nom: string;
  prenom: string;
  email: string;
  role: 'Admin' | 'Utilisateur' | 'Modérateur' | 'PRMC' | 'Ordonnateur' | 'Régisseur' | 'PERP';
  statut: 'Actif' | 'Inactif';
  dernierLogin?: string;
}

// Types pour les marchés
export interface Market extends BaseEntity {
  nom: string;
  adresse?: string;
  totalPlaces: number;
  tauxOccupation: number;
  statut?: 'Actif' | 'Inactif' | 'Maintenance';
  description?: string;
}

// Types pour les marchands
export interface Merchant extends BaseEntity {
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  typeCommerce: string;
  statut: 'Actif' | 'Inactif' | 'Suspendu';
  marketId?: number;
  placeNumber?: number;
}

// Types pour les modals
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Types pour les dashboards
export interface DashboardStats {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

// Types pour la navigation
export interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: Array<{
    href: string;
    label: string;
    description?: string;
  }>;
}

// Types pour les filtres
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'daterange' | 'text';
  options?: FilterOption[];
}
