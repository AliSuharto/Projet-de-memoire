'use client';

import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  // Détection automatique du variant basée sur le statut
  const getVariantFromStatus = (status: string): string => {
    const statusLower = status.toLowerCase();
    
    if (['actif', 'active', 'success', 'completed', 'approved'].includes(statusLower)) {
      return 'success';
    }
    if (['inactif', 'inactive', 'disabled', 'suspended', 'rejected'].includes(statusLower)) {
      return 'danger';
    }
    if (['pending', 'en attente', 'processing', 'maintenance'].includes(statusLower)) {
      return 'warning';
    }
    if (['info', 'draft', 'new', 'nouveau'].includes(statusLower)) {
      return 'info';
    }
    
    return variant;
  };

  const finalVariant = getVariantFromStatus(status);

  // Classes CSS pour les différents variants
  const getVariantClasses = () => {
    switch (finalVariant) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'danger':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Classes CSS pour les différentes tailles
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'lg':
        return 'px-3 py-1 text-sm';
      default:
        return 'px-2.5 py-0.5 text-xs';
    }
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full border font-medium
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${className}
      `}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
