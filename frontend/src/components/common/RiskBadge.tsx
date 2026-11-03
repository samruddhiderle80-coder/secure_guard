import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, ShieldX } from 'lucide-react';

interface RiskBadgeProps {
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md' }) => {
  const normalizedLevel = (level || 'LOW').toUpperCase();

  const configs = {
    LOW: {
      label: 'Low Risk',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: ShieldCheck,
    },
    MODERATE: {
      label: 'Moderate Risk',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: AlertTriangle,
    },
    HIGH: {
      label: 'High Risk',
      color: 'bg-orange-50 text-orange-700 border-orange-200',
      icon: ShieldAlert,
    },
    CRITICAL: {
      label: 'Critical Risk',
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: ShieldX,
    },
  };

  const config = configs[normalizedLevel as keyof typeof configs] || configs.LOW;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium gap-1',
    md: 'px-2.5 py-1 text-xs font-semibold gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm font-bold gap-2',
  }[size];

  const iconSizes = { sm: 12, md: 14, lg: 18 }[size];

  return (
    <span className={`inline-flex items-center rounded-full border ${config.color} ${sizeClasses}`}>
      <Icon size={iconSizes} />
      <span>{config.label}</span>
    </span>
  );
};
