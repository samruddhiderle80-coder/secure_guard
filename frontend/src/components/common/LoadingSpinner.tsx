import React from 'react';
import { Shield } from 'lucide-react';

export const LoadingSpinner: React.FC<{ label?: string }> = ({ label = 'Loading Social Guard security state...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-3 border-brand-200 border-t-brand-600 animate-spin" />
        <Shield size={18} className="absolute text-brand-600 stroke-[2.5]" />
      </div>
      <p className="text-xs font-semibold text-slate-500 animate-pulse">{label}</p>
    </div>
  );
};
