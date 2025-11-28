'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  TableColumn,
  TableAction,
  PaginationOptions,
  SearchOptions,
} from '@/app/types/common';

interface DataTableProps<T extends { id: number | string }> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  loading?: boolean;
  title?: string;
  searchOptions?: SearchOptions;
  paginationOptions?: PaginationOptions;
  onRowClick?: (item: T) => void;
  className?: string;
  emptyMessage?: string;
  emptyDescription?: string;
}

const DataTable = <T extends { id: number | string }>({
  data = [],
  columns,
  actions = [],
  loading = false,
  title,
  searchOptions = {},
  paginationOptions = {
    itemsPerPage: 10,
    showItemsPerPageSelector: true,
    itemsPerPageOptions: [5, 10, 20, 50],
    showInfo: true,
  },
  onRowClick,
  className = '',
  emptyMessage = 'Aucune donnée trouvée',
  emptyDescription = "Il n'y a aucun élément à afficher pour le moment.",
}: DataTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(
    paginationOptions.itemsPerPage
  );
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  /** 🧩 Obtenir une propriété imbriquée (ex: user.address.city) */
  const getNestedValue = (obj: any, path: string): any =>
    path.split('.').reduce((current, key) => current?.[key], obj);

  /** 🔍 Filtrage */
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const searchableFields =
      searchOptions.searchableFields || columns.map((col) => col.key);

    return data.filter((item) =>
      searchableFields.some((field) => {
        const value = getNestedValue(item, field);
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, searchOptions.searchableFields, columns]);

  /** 🔽 Tri */
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return sortConfig.direction === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [filteredData, sortConfig]);

  /** 📄 Pagination */
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  /** 🔁 Gérer le tri */
  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey);
    if (!column?.sortable) return;

    setSortConfig((current) => {
      if (current?.key === columnKey) {
        return current.direction === 'asc'
          ? { key: columnKey, direction: 'desc' }
          : null;
      }
      return { key: columnKey, direction: 'asc' };
    });
  };

  /** 🧭 Pagination */
  const handlePageChange = (page: number) =>
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  /** 🧱 Rendu d'une cellule */
  const renderCell = (item: T, column: TableColumn<T>) => {
    if (column.render) return column.render(item);
    if (column.accessor) return column.accessor(item);

    const value = getNestedValue(item, column.key);
    return value !== null && value !== undefined ? String(value) : '-';
  };

  /** 📄 Numéros de page */
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  /** ⬆ Icône de tri */
  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey)
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;

    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="h-4 w-4 text-blue-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-blue-600" />
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* 🧭 Header avec titre et recherche */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b border-gray-200 gap-4">
        {title && <h2 className="text-xl font-semibold text-gray-800">{title}</h2>}
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder={searchOptions.placeholder || 'Rechercher...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full sm:w-64 ${
              searchOptions.className || ''
            }`}
          />
        </div>
      </div>

      {/* 🧾 Tableau principal */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => column.sortable && handleSort(column.key)}
                  className={`px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-700' : ''
                  } ${column.className || ''}`}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="px-6 py-12 text-center"
                >
                  <div className="flex justify-center items-center">
                    <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div>
                    <span className="ml-2 text-gray-500">Chargement...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="text-lg font-medium">{emptyMessage}</div>
                  <div className="text-sm mt-1">{emptyDescription}</div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr
                  key={`${item.id || 'row'}-${index}`}
                  className={`${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } ${onRowClick ? 'hover:bg-blue-50 cursor-pointer' : 'hover:bg-gray-100'}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <td
                      key={`${item.id}-${column.key}`}
                      className={`px-4 py-3 text-sm text-gray-900 ${column.className || ''}`}
                    >
                      {renderCell(item, column)}
                    </td>
                  ))}

                  {actions.length > 0 && (
                    <td className="px-4 py-3 text-sm">
                      <div className="flex space-x-2">
                        {actions.map((action, actionIndex) => {
                          const Icon = action.icon;
                          const getVariantClasses = () => {
                            switch (action.variant) {
                              case 'danger':
                                return 'text-red-600 hover:text-red-800 hover:bg-red-50';
                              case 'secondary':
                                return 'text-gray-600 hover:text-gray-800 hover:bg-gray-50';
                              default:
                                return 'text-blue-600 hover:text-blue-800 hover:bg-blue-50';
                            }
                          };

                          return (
                            <button
                              key={`${item.id}-${actionIndex}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(item);
                              }}
                              className={`p-2 rounded-full transition-colors ${getVariantClasses()} ${
                                action.className || ''
                              }`}
                              title={action.label}
                            >
                              {Icon ? (
                                <Icon className="h-4 w-4" />
                              ) : (
                                <span className="text-xs">{action.label}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🧭 Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 border-t border-gray-200 gap-4">
          {paginationOptions.showItemsPerPageSelector && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Afficher:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {paginationOptions.itemsPerPageOptions?.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-700">par page</span>
            </div>
          )}

          {paginationOptions.showInfo && (
            <span className="text-sm text-gray-700">
              {startIndex + 1} - {Math.min(startIndex + itemsPerPage, sortedData.length)} sur{' '}
              {sortedData.length}
            </span>
          )}

          <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              aria-label="Page précédente"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {getPageNumbers().map((page) => (
              <button
                key={`page-${page}`}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded-lg border text-sm transition-colors ${
                  page === currentPage
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              aria-label="Page suivante"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
