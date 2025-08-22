'use client';

import { ConfigOption } from '@/app/types/config';

interface ConfigSidebarProps {
  options: ConfigOption[];
  activeOption: string;
  onOptionSelect: (optionId: string) => void;
}

const ConfigSidebar = ({ 
  options, 
  activeOption, 
  onOptionSelect 
}: ConfigSidebarProps) => {
  return (
    <div className="w-1/5 min-w-[200px] bg-gray-50 border-r border-gray-200 p-4">
      <nav className="space-y-2">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onOptionSelect(option.id)}
            className={`
              w-full text-left px-3 py-2 rounded-lg transition-colors duration-200
              ${activeOption === option.id 
                ? 'bg-blue-100 text-blue-700 font-medium' 
                : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            {option.icon && <span className="mr-2">{option.icon}</span>}
            {option.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ConfigSidebar;