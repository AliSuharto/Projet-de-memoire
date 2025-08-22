'use client';

import { useState, ReactNode } from 'react';
import ConfigSidebar from './ConfigSidebar';
import ConfigContent from './ConfigContent';
import { ConfigOption } from '@/app/types/config';

interface ConfigLayoutProps {
  title: string;
  options: ConfigOption[];
  children: (activeOption: string) => ReactNode;
}

const ConfigLayout = ({ title, options, children }: ConfigLayoutProps) => {
  const [activeOption, setActiveOption] = useState(options[0]?.id || '');

  const handleOptionSelect = (optionId: string) => {
    console.log('Option sélectionnée:', optionId); // Pour debug
    setActiveOption(optionId);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-2">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </header>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        <ConfigSidebar
          options={options}
          activeOption={activeOption}
          onOptionSelect={handleOptionSelect}
        />
        <ConfigContent activeOption={activeOption}>
          {children(activeOption)}
        </ConfigContent>
      </div>
    </div>
  );
};

export default ConfigLayout;