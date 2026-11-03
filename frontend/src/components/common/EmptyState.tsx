import React from 'react';
import { LucideIcon, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionPath?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = ShieldAlert,
  title,
  description,
  actionLabel,
  actionPath,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-card my-4">
      <div className="p-4 rounded-2xl bg-slate-50 text-slate-400 border border-slate-100 mb-4">
        <Icon size={36} className="stroke-[1.5]" />
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md leading-relaxed mb-6">
        {description}
      </p>

      {actionLabel && (
        actionPath ? (
          <Link
            to={actionPath}
            className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all hover:-translate-y-0.5"
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all hover:-translate-y-0.5"
          >
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
};
