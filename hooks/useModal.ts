'use client';

import { useState, useCallback } from 'react';

interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useModal = (initialState: boolean = false): UseModalReturn => {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};

// Hook pour gérer plusieurs modals
export const useModals = <T extends string>(modalNames: T[]) => {
  const [openModals, setOpenModals] = useState<Set<T>>(new Set());

  const openModal = useCallback((name: T) => {
    setOpenModals(prev => new Set([...prev, name]));
  }, []);

  const closeModal = useCallback((name: T) => {
    setOpenModals(prev => {
      const newSet = new Set(prev);
      newSet.delete(name);
      return newSet;
    });
  }, []);

  const toggleModal = useCallback((name: T) => {
    setOpenModals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      return newSet;
    });
  }, []);

  const isModalOpen = useCallback((name: T) => openModals.has(name), [openModals]);

  const closeAllModals = useCallback(() => {
    setOpenModals(new Set());
  }, []);

  return {
    openModal,
    closeModal,
    toggleModal,
    isModalOpen,
    closeAllModals,
  };
};
