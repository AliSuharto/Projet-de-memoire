// components/HierarchicalBreadcrumb.tsx
import React from 'react';

export interface BreadcrumbItem {
  id?: number;
  name: string;
  type: 'market' | 'zone' | 'hall' | 'place';
  onClick?: () => void;
}

interface HierarchicalBreadcrumbProps {
  items: BreadcrumbItem[];
}

const HierarchicalBreadcrumb: React.FC<HierarchicalBreadcrumbProps> = ({ items }) => {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      {items.map((item, index) => (
        <React.Fragment key={`${item.type}-${item.id || index}`}>
          {index > 0 && (
            <span className="text-gray-400">→</span>
          )}
          <button
            onClick={item.onClick}
            className={`hover:text-blue-600 transition-colors ${
              index === items.length - 1 
                ? 'font-semibold text-gray-800 cursor-default' 
                : 'text-blue-500 hover:underline'
            }`}
            disabled={index === items.length - 1}
          >
            {item.name}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

export default HierarchicalBreadcrumb;