// Types centralisés pour la navigation

export type NavIcon = React.ComponentType<{ className?: string }>;

export type SideNavSubItem = {
  href: string;
  label: string;
  subItems?: SideNavSubItem[];
};

export type SideNavItem = {
  href?: string;
  icon: NavIcon;
  label: string;
  subItems?: SideNavSubItem[];
};

export type TopNavSubItem = {
  href: string;
  label: string;
  icon?: NavIcon;
  description?: string;
};

export type TopNavItem = {
  href: string;
  label: string;
  icon: NavIcon;
  subItems?: TopNavSubItem[];
};
