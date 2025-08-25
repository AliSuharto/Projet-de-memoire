'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
    period?: string;
  };
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue',
  className = '',
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-green-500',
          icon: 'bg-green-100 text-green-600',
          text: 'text-green-600',
        };
      case 'red':
        return {
          bg: 'bg-red-500',
          icon: 'bg-red-100 text-red-600',
          text: 'text-red-600',
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-500',
          icon: 'bg-yellow-100 text-yellow-600',
          text: 'text-yellow-600',
        };
      case 'purple':
        return {
          bg: 'bg-purple-500',
          icon: 'bg-purple-100 text-purple-600',
          text: 'text-purple-600',
        };
      case 'gray':
        return {
          bg: 'bg-gray-500',
          icon: 'bg-gray-100 text-gray-600',
          text: 'text-gray-600',
        };
      default:
        return {
          bg: 'bg-blue-500',
          icon: 'bg-blue-100 text-blue-600',
          text: 'text-blue-600',
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          
          {trend && (
            <div className="flex items-center mt-2">
              <div className={`flex items-center ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                <span className="text-sm font-medium">
                  {Math.abs(trend.value)}%
                </span>
              </div>
              <span className="text-sm text-gray-500 ml-2">
                {trend.period || 'vs mois dernier'}
              </span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-full ${colors.icon}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
