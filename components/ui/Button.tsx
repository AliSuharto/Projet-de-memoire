'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  // Classes pour les variantes
  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-100 text-gray-900 hover:bg-gray-200 border-gray-300';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700 border-red-600';
      case 'success':
        return 'bg-green-600 text-white hover:bg-green-700 border-green-600';
      case 'outline':
        return 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300';
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600';
    }
  };

  // Classes pour les tailles
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  // Classes pour l'icône
  const getIconClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-6 w-6';
      default:
        return 'h-5 w-5';
    }
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`
        inline-flex items-center justify-center
        font-medium rounded-lg border
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${getIconClasses()} ${children ? 'mr-2' : ''}`} />
      )}
      
      {Icon && !loading && iconPosition === 'left' && (
        <Icon className={`${getIconClasses()} ${children ? 'mr-2' : ''}`} />
      )}
      
      {children}
      
      {Icon && !loading && iconPosition === 'right' && (
        <Icon className={`${getIconClasses()} ${children ? 'ml-2' : ''}`} />
      )}
    </button>
  );
};

export default Button;
