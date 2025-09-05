'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface SideNavItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
  subItems?: SideNavItem[];
}

interface SideNavProps {
  items: SideNavItem[];
}

export default function SideNav({ items }: SideNavProps) {
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (label: string) => {
    setOpenItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const isActive = (href?: string) => href === pathname;

  const hasActiveChild = (subItems: SideNavItem[]): boolean =>
    subItems.some(
      (subItem) =>
        isActive(subItem.href) ||
        (subItem.subItems && hasActiveChild(subItem.subItems))
    );

  const renderNavItems = (navItems: SideNavItem[], level = 0) => (
    <ul className={`${level > 0 ? 'ml-4' : ''} space-y-1`}>
      {navItems.map((item) => {
        const isItemActive = isActive(item.href);
        const hasSubItems = item.subItems && item.subItems.length > 0;
        const isOpen = openItems.includes(item.label);
        const hasActiveSubItem = hasSubItems ? hasActiveChild(item.subItems!) : false;

        return (
          <li key={item.label}>
            {hasSubItems ? (
              <div>
                <button
                  onClick={() => toggleItem(item.label)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-150 group ${
                    hasActiveSubItem
                      ? ' text-blue-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 bg-white'
                  }`}
                >
                  {item.icon && <item.icon className="w-5 h-5" />}
                  <span className="text-sm">{item.label}</span> {/* Taille réduite */}
                  {isOpen ? (
                    <ChevronUp className="ml-auto w-4 h-4" />
                  ) : (
                    <ChevronDown className="ml-auto w-4 h-4" />
                  )}
                </button>
                {isOpen && renderNavItems(item.subItems!, level + 1)}
              </div>
            ) : (
              <Link
                href={item.href || '#'}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-150 group relative ${
                  isItemActive
                    ? 'bg-blue-50 text-blue-700 '
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 bg-white'
                }`}
              >
                {item.icon && <item.icon className="w-5 h-5" />}
                <span className="text-sm">{item.label}</span> {/* Taille réduite */}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <nav className="hidden md:block w-48 fixed top-4 left-0 h-full bg-white shadow-lg pt-16 p-4">
      {renderNavItems(items)}
    </nav>
  );
}
