'use client';

import { useState, useMemo, useCallback } from 'react';

interface UseDataTableProps<T> {
  data: T[];
  searchableFields?: string[];
  initialItemsPerPage?: number;
  initialSort?: {
    key: string;
    direction: 'asc' | 'desc';
  };
}

interface UseDataTableReturn<T> {
  // État
  searchTerm: string;
  currentPage: number;
  itemsPerPage: number;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  
  // Données traitées
  filteredData: T[];
  sortedData: T[];
  paginatedData: T[];
  totalPages: number;
  
  // Actions
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  handleSort: (key: string, sortable?: boolean) => void;
  resetFilters: () => void;
  
  // Utilitaires
  getStartIndex: () => number;
  getEndIndex: () => number;
  getTotalCount: () => number;
}

export const useDataTable = <T extends Record<string, any>>({
  data,
  searchableFields = [],
  initialItemsPerPage = 10,
  initialSort,
}: UseDataTableProps<T>): UseDataTableReturn<T> => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(initialSort || null);

  // Fonction pour obtenir la valeur d'une propriété imbriquée
  const getNestedValue = useCallback((obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }, []);

  // Filtrage des données
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    return data.filter(item => {
      if (searchableFields.length === 0) {
        // Si aucun champ spécifique, rechercher dans toutes les propriétés string
        return Object.values(item).some(value => 
          typeof value === 'string' && 
          value.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return searchableFields.some(field => {
        const value = getNestedValue(item, field);
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, searchableFields, getNestedValue]);

  // Tri des données
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

      // Pour les dates
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === 'asc' 
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      return sortConfig.direction === 'asc' 
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [filteredData, sortConfig, getNestedValue]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  // Actions
  const handleSort = useCallback((key: string, sortable: boolean = true) => {
    if (!sortable) return;

    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
    setSortConfig(initialSort || null);
  }, [initialSort]);

  // Mettre à jour la page courante lors des changements
  const handleSetSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const handleSetItemsPerPage = useCallback((items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  }, []);

  const handleSetCurrentPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  // Utilitaires
  const getStartIndex = useCallback(() => startIndex, [startIndex]);
  const getEndIndex = useCallback(() => Math.min(startIndex + itemsPerPage, sortedData.length), [startIndex, itemsPerPage, sortedData.length]);
  const getTotalCount = useCallback(() => sortedData.length, [sortedData.length]);

  return {
    // État
    searchTerm,
    currentPage,
    itemsPerPage,
    sortConfig,
    
    // Données traitées
    filteredData,
    sortedData,
    paginatedData,
    totalPages,
    
    // Actions
    setSearchTerm: handleSetSearchTerm,
    setCurrentPage: handleSetCurrentPage,
    setItemsPerPage: handleSetItemsPerPage,
    handleSort,
    resetFilters,
    
    // Utilitaires
    getStartIndex,
    getEndIndex,
    getTotalCount,
  };
};
