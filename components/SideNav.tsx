// components/SideNav.tsx
"use client";
import Link from "next/link";
import { LucideIcon, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

type SubNavItem = {
  href: string;
  label: string;
  subItems?: SubNavItem[];
};

type NavItem = {
  href?: string;
  icon: LucideIcon;
  label: string;
  subItems?: SubNavItem[];
};

interface SideNavProps {
  items: NavItem[];
  currentPath?: string; // Passé depuis le parent
  className?: string;
}

export default function SideNav({ items, currentPath = "/", className = "" }: SideNavProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  // Persistance de l'état des menus ouverts
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('sideNav-openItems');
    if (saved) {
      try {
        setOpenItems(new Set(JSON.parse(saved)));
      } catch (error) {
        console.warn('Erreur lors du chargement de l\'état du menu:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted && openItems.size > 0) {
      localStorage.setItem('sideNav-openItems', JSON.stringify([...openItems]));
    }
  }, [openItems, mounted]);

  // Auto-ouvrir les menus qui contiennent la page active
  useEffect(() => {
    if (mounted && currentPath) {
      const newOpenItems = new Set(openItems);
      
      const findParentOfActivePage = (items: NavItem[], path: string) => {
        for (const item of items) {
          if (item.subItems) {
            for (const subItem of item.subItems) {
              if (isActive(subItem.href, path) || 
                  (subItem.subItems && hasActiveChild(subItem.subItems, path))) {
                newOpenItems.add(item.label);
                if (subItem.subItems && hasActiveChild(subItem.subItems, path)) {
                  newOpenItems.add(`${item.label}-${subItem.label}`);
                }
              }
            }
          }
        }
      };

      findParentOfActivePage(items, currentPath);
      setOpenItems(newOpenItems);
    }
  }, [currentPath, mounted, items]);

  const toggleItem = (key: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(key)) {
      newOpenItems.delete(key);
    } else {
      newOpenItems.add(key);
    }
    setOpenItems(newOpenItems);
  };

  const isActive = (href: string, pathToCheck: string = currentPath) => {
    if (!pathToCheck || !href) return false;
    return pathToCheck === href || pathToCheck.startsWith(href + '/');
  };

  const hasActiveChild = (subItems: SubNavItem[], pathToCheck: string = currentPath): boolean => {
    if (!pathToCheck) return false;
    return subItems.some(subItem => 
      isActive(subItem.href, pathToCheck) || 
      (subItem.subItems && hasActiveChild(subItem.subItems, pathToCheck))
    );
  };

  const renderSubMenu = (
    subItems: SubNavItem[], 
    parentKey: string, 
    level: number = 1
  ) => {
    const marginLeft = level === 1 ? 'ml-8' : `ml-${4 + level * 4}`;
    
    return (
      <div className={`overflow-hidden transition-all duration-200 ease-in-out ${
        openItems.has(parentKey) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <ul className={`${marginLeft} mt-1 space-y-1`}>
          {subItems.map((subItem) => {
            const subKey = `${parentKey}-${subItem.label}`;
            const hasSubItems = subItem.subItems && subItem.subItems.length > 0;
            const isSubOpen = openItems.has(subKey);

            return (
              <li key={subItem.href || subKey}>
                {hasSubItems ? (
                  <>
                    <button
                      onClick={() => toggleItem(subKey)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all duration-150 text-sm ${
                        hasActiveChild(subItem.subItems!, currentPath)
                          ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex-1 text-left truncate">
                        {subItem.label}
                      </span>
                      <div className={`transition-transform duration-200 ${
                        isSubOpen ? 'rotate-90' : ''
                      }`}>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </button>
                    {renderSubMenu(subItem.subItems!, subKey, level + 1)}
                  </>
                ) : (
                  <Link
                    href={subItem.href}
                    className={`block p-2 rounded-lg transition-all duration-150 text-sm relative ${
                      isActive(subItem.href)
                        ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500 font-medium'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {subItem.label}
                    {isActive(subItem.href) && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 rounded-r"></div>
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  if (!mounted) {
    return (
      <aside className={`fixed top-0 left-0 h-full w-0 md:w-48 pt-16 bg-white border-r border-gray-200 transition-all duration-300 ${className}`}>
        <div className="p-3">
          <div className="animate-pulse space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
   <aside
  className={`hidden md:block fixed top-0 left-0 h-full w-48 pt-16 bg-white border-r border-gray-200 transition-all duration-300 shadow-sm ${className}`}
>
  <nav className="p-3 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <ul className="space-y-1">
          {items.map((item) => {
            const isOpen = openItems.has(item.label);
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isItemActive = item.href ? isActive(item.href) : false;
            const hasActiveSubItem = hasSubItems ? hasActiveChild(item.subItems!) : false;

            return (
              <li key={item.label}>
                {hasSubItems ? (
                  <button
                    onClick={() => toggleItem(item.label)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-150 group ${
                      hasActiveSubItem
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                      hasActiveSubItem ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-600'
                    }`} />
                    <span className="text-sm font-medium truncate flex-1 text-left">
                      {item.label}
                    </span>
                    <div className={`transition-all duration-200 ${
                      isOpen ? 'rotate-90 text-blue-600' : 'text-gray-400'
                    }`}>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                ) : (
                  <Link
                    href={item.href!}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-150 group relative ${
                      isItemActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm font-medium'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                      isItemActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-600'
                    }`} />
                    <span className="text-sm font-medium truncate">
                      {item.label}
                    </span>
                    {isItemActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r"></div>
                    )}
                  </Link>
                )}

                {hasSubItems && renderSubMenu(item.subItems!, item.label)}
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Styles pour la scrollbar personnalisée */}
      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }
        .scrollbar-track-gray-100::-webkit-scrollbar-track {
          background-color: #f3f4f6;
        }
      `}</style>
    </aside>
  );
}