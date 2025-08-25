'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
  onRightIconClick?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className = '', 
    label, 
    error, 
    helperText, 
    leftIcon: LeftIcon, 
    rightIcon: RightIcon, 
    onRightIconClick,
    type = 'text',
    ...props 
  }, ref) => {
    const baseClasses = `
      block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset 
      placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6
      transition-colors duration-200
    `;

    const stateClasses = error
      ? 'ring-red-300 focus:ring-red-500'
      : 'ring-gray-300 focus:ring-blue-500 hover:ring-gray-400';

    const paddingClasses = LeftIcon && RightIcon 
      ? 'pl-10 pr-10'
      : LeftIcon 
      ? 'pl-10 pr-3'
      : RightIcon 
      ? 'pl-3 pr-10'
      : 'px-3';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {LeftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <LeftIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
          )}
          
          <input
            ref={ref}
            type={type}
            className={`${baseClasses} ${stateClasses} ${paddingClasses} ${className}`}
            {...props}
          />
          
          {RightIcon && (
            <div className={`absolute inset-y-0 right-0 flex items-center pr-3 ${
              onRightIconClick ? 'cursor-pointer' : 'pointer-events-none'
            }`}>
              <RightIcon 
                className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" 
                aria-hidden="true"
                onClick={onRightIconClick}
              />
            </div>
          )}
          
          {error && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-2 text-sm text-red-600" id={`${props.id}-error`}>
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500" id={`${props.id}-description`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
