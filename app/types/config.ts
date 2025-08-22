// types/config.ts
export interface ConfigOption {
  id: string;
  label: string;
  icon?: string;
}

export interface ConfigPageProps {
  title: string;
  options: ConfigOption[];
}

export type SubMenuItem = {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
};

export type NavigationItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: SubMenuItem[];
};

