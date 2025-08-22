'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

// Définition des types
interface TableColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  accessor?: (item: T) => string | number | React.ReactNode;
}

interface Props<T extends object> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  className?: string;
  uniqueKey: keyof T; // Clé unique pour identifier chaque ligne
  onRowClick?: (item: T) => void;
}

const ReusableDataTable = <T extends object>({
  columns,
  data = [],
  loading = false,
  className = "",
  uniqueKey,
  onRowClick
}: Props<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Fonction pour accéder aux valeurs imbriquées
        const getNestedValue = <T extends object>(obj: T, path: string): string | number | null => {
        const result = path.split('.').reduce((acc: unknown, part: string) => {
            if (acc && typeof acc === 'object' && part in acc) {
            return (acc as Record<string, unknown>)[part];
            }
            return null;
        }, obj);

        if (result === null || result === undefined) {
            return null;
        }

        if (typeof result === 'string' || typeof result === 'number') {
            return result;
        }

        return String(result);
        };

  // 🔎 Filtrage des données
  const searchData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(item => {
      return columns.some(column => {
        const value = column.accessor 
          ? column.accessor(item)
          : getNestedValue(item, column.key);
        
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, columns]);

  // 📄 Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return searchData.slice(startIndex, startIndex + itemsPerPage);
  }, [searchData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(searchData.length / itemsPerPage);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => setCurrentPage(1), [searchTerm, itemsPerPage]);

  // Calcul des numéros de page à afficher
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  // Rendu d'une cellule
  const renderCell = (item: T, column: TableColumn<T>) => {
    try {
      if (column.render) {
        return column.render(item);
      }
      
      if (column.accessor) {
        return column.accessor(item);
      }
      
      // Gestion des chemins imbriqués (ex: "place.name")
      const value = getNestedValue(item, column.key);
      return value !== undefined ? value : null;
    } catch (error) {
      console.error(`Error rendering cell for column ${column.key}:`, error);
      return null;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* 🔹 Header avec recherche */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:p-6 border-b border-gray-200 gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Données</h2>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full md:w-64"
          />
        </div>
      </div>

      {/* 🔹 Tableau */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead className="bg-blue-600">
            <tr>
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  className="px-4 py-3 text-left text-sm font-medium text-white uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div>
                    <span className="ml-2">Chargement...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  Aucune donnée trouvée
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr 
                  key={String(row[uniqueKey])}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col) => (
                    <td 
                      key={`${String(row[uniqueKey])}-${col.key}`} 
                      className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                    >
                      {renderCell(row, col)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🔹 Footer avec pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center px-4 py-3 border-t border-gray-200 gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Afficher:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {[10, 20, 30, 50, 100].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span className="text-sm text-gray-700">par page</span>
        </div>
        
        <span className="text-sm text-gray-700">
          {Math.min((currentPage - 1) * itemsPerPage + 1, searchData.length)} -{' '}
          {Math.min(currentPage * itemsPerPage, searchData.length)} sur {searchData.length}
        </span>
        
        {totalPages > 1 && (
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => setCurrentPage(p => p - 1)} 
              disabled={currentPage === 1}
              className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Page précédente"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {getPageNumbers().map(p => (
              <button 
                key={p} 
                onClick={() => setCurrentPage(p)}
                className={`px-3 py-1 rounded-lg border text-sm ${
                  p === currentPage
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                {p}
              </button>
            ))}
            
            <button 
              onClick={() => setCurrentPage(p => p + 1)} 
              disabled={currentPage === totalPages}
              className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Page suivante"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReusableDataTable;