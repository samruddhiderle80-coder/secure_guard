import React from 'react';

interface ScoreRingProps {
  score: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 180,
  strokeWidth = 14,
  label = 'Security Score',
}) => {
  const normalizedScore = Math.max(0, Math.min(100, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalizedScore / 100) * circumference;

  let strokeColor = '#10b981'; // green for >= 80
  let textColor = 'text-emerald-600';
  let badgeText = 'Robust';

  if (normalizedScore < 40) {
    strokeColor = '#ef4444'; // red
    textColor = 'text-rose-600';
    badgeText = 'Critical Risk';
  } else if (normalizedScore < 60) {
    strokeColor = '#f97316'; // orange
    textColor = 'text-orange-600';
    badgeText = 'High Risk';
  } else if (normalizedScore < 80) {
    strokeColor = '#f59e0b'; // yellow/amber
    textColor = 'text-amber-600';
    badgeText = 'Moderate Risk';
  }

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-slate-100"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated score circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-4xl font-extrabold tracking-tight ${textColor}`}>
            {normalizedScore}
          </span>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            / 100
          </span>
        </div>
      </div>

      {label && (
        <div className="mt-3 text-center">
          <p className="text-sm font-semibold text-slate-700">{label}</p>
          <span className={`inline-block mt-1 px-2.5 py-0.5 text-xs font-medium rounded-full ${
            normalizedScore >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            normalizedScore >= 60 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
            normalizedScore >= 40 ? 'bg-orange-50 text-orange-700 border border-orange-200' :
            'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {badgeText}
          </span>
        </div>
      )}
    </div>
  );
};
