'use client';

import ConfigLayout from '@/components/(Ordonnateur)/ConfigLayout';
import { ConfigOption } from '@/app/types/config';
import UsersSection from '@/components/(Ordonnateur)/Config-section/UsersSection';
import GeneralSection from '@/components/(Ordonnateur)/Config-section/GeneralSection';
import MarcheSection from '@/components/(Ordonnateur)/Config-section/MarcheeSection';
import CommuneManager from '@/components/(Ordonnateur)/Config-section/CommuneSection';

const configOptions: ConfigOption[] = [
  { id: 'users', label: 'Utilisateurs', icon: '👥' },
  { id: 'commune', label: 'Commune', icon: '🏛️' },
  { id: 'marche', label: 'Marché', icon: '🏪' },
  { id: 'general', label: 'Config Générale', icon: '⚙️' },
];

export default function ConfigurationPage() {
  const renderContent = (activeOption: string) => {
    switch (activeOption) {
      case 'users':
        return <UsersSection />;
      case 'commune':
        return <CommuneManager />;
      case 'marche':
        return <MarcheSection />;
    //   case 'general':
    //     return <GeneralSection />;
      default:
        return <GeneralSection />;
     }
  };

  return (
    <ConfigLayout
      title="Configuration"
      options={configOptions}
    >
      {renderContent}
    </ConfigLayout>
  );
}