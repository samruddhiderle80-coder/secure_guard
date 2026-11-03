import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  KeyRound,
  Globe,
  EyeOff,
  CheckSquare,
  Fish,
  GraduationCap,
  AlertTriangle,
  History,
  MessageSquareHeart,
  Settings,
  Shield,
  BarChart3,
  Users,
  FileCheck,
  ShieldQuestion
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { isAdmin } = useAuth();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-all ${
      isActive
        ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs border border-brand-200/60'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto px-3 py-4 select-none shrink-0">
      <div className="space-y-6">
        {/* Main Section */}
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Control Center
          </p>
          <nav className="space-y-1">
            <NavLink to="/dashboard" className={navClass}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/assessment" className={navClass}>
              <ShieldAlert size={18} />
              <span>Security Assessment</span>
            </NavLink>
          </nav>
        </div>

        {/* Security Tools */}
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Security Tools
          </p>
          <nav className="space-y-1">
            <NavLink to="/tools/password-security" className={navClass}>
              <KeyRound size={18} />
              <span>Password Security</span>
            </NavLink>
            <NavLink to="/tools/url-analyzer" className={navClass}>
              <Globe size={18} />
              <span>URL Analyzer</span>
            </NavLink>
            <NavLink to="/tools/privacy-check" className={navClass}>
              <EyeOff size={18} />
              <span>Privacy Check</span>
            </NavLink>
            <NavLink to="/tools/mfa-checklist" className={navClass}>
              <CheckSquare size={18} />
              <span>MFA Checklist</span>
            </NavLink>
          </nav>
        </div>

        {/* Awareness */}
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Awareness
          </p>
          <nav className="space-y-1">
            <NavLink to="/awareness/phishing-lab" className={navClass}>
              <Fish size={18} />
              <span>Phishing Lab</span>
            </NavLink>
            <NavLink to="/awareness/training" className={navClass}>
              <GraduationCap size={18} />
              <span>Security Training</span>
            </NavLink>
          </nav>
        </div>

        {/* Security & History */}
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Security Operations
          </p>
          <nav className="space-y-1">
            <NavLink to="/incidents" className={navClass}>
              <AlertTriangle size={18} />
              <span>Incidents</span>
            </NavLink>
            <NavLink to="/history" className={navClass}>
              <History size={18} />
              <span>Security History</span>
            </NavLink>
          </nav>
        </div>

        {/* Feedback & Settings */}
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Account
          </p>
          <nav className="space-y-1">
            <NavLink to="/feedback" className={navClass}>
              <MessageSquareHeart size={18} />
              <span>Feedback</span>
            </NavLink>
            <NavLink to="/settings" className={navClass}>
              <Settings size={18} />
              <span>Settings</span>
            </NavLink>
          </nav>
        </div>

        {/* Admin Portal (Conditional) */}
        {isAdmin && (
          <div className="pt-2 border-t border-slate-200">
            <p className="px-3 text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Shield size={14} /> Administration
            </p>
            <nav className="space-y-1">
              <NavLink to="/admin" className={navClass} end>
                <BarChart3 size={18} className="text-amber-600" />
                <span>Admin Dashboard</span>
              </NavLink>
              <NavLink to="/admin/users" className={navClass}>
                <Users size={18} className="text-amber-600" />
                <span>User Analytics</span>
              </NavLink>
              <NavLink to="/admin/risk-analytics" className={navClass}>
                <ShieldQuestion size={18} className="text-amber-600" />
                <span>Risk Analytics</span>
              </NavLink>
              <NavLink to="/admin/incidents" className={navClass}>
                <AlertTriangle size={18} className="text-amber-600" />
                <span>Incident Management</span>
              </NavLink>
              <NavLink to="/admin/feedback" className={navClass}>
                <FileCheck size={18} className="text-amber-600" />
                <span>Feedback Analytics</span>
              </NavLink>
            </nav>
          </div>
        )}
      </div>
    </aside>
  );
};
