import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Menu, X, LogOut, User, LayoutDashboard, Settings, ShieldAlert, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight block leading-tight">
                SOCIAL GUARD
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-600 block">
                Security Platform
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {!user ? (
              <>
                <Link
                  to="/threats"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/threats') ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Security Threats
                </Link>
                <Link
                  to="/education"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/education') ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Security Education
                </Link>
                <Link
                  to="/about"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/about') ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  About
                </Link>
                <div className="h-4 w-px bg-slate-200 my-auto" />
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-600/20 transition-all hover:-translate-y-0.5"
                >
                  Start Assessment
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/dashboard') ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <Link
                  to="/assessment"
                  className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/assessment') ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldAlert size={16} />
                  Assessment
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center px-2.5 py-1 text-xs font-bold text-amber-800 bg-amber-100/80 border border-amber-300 rounded-lg hover:bg-amber-200 transition-colors"
                  >
                    Admin Portal
                  </Link>
                )}

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                      {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-semibold text-slate-700 max-w-[120px] truncate">
                      {user.full_name}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-900 truncate">{user.full_name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                            Administrator
                          </span>
                        )}
                      </div>
                      <Link
                        to="/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Settings size={16} /> Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 border-t border-slate-100"
                      >
                        <LogOut size={16} /> Log Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          {!user ? (
            <>
              <Link
                to="/threats"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Security Threats
              </Link>
              <Link
                to="/education"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Security Education
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                About
              </Link>
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-brand-600 rounded-xl shadow-sm"
                >
                  Start Assessment
                </Link>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Dashboard
              </Link>
              <Link
                to="/assessment"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Security Assessment
              </Link>
              <Link
                to="/tools/password-security"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Password Security Tool
              </Link>
              <Link
                to="/tools/url-analyzer"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                URL Security Analyzer
              </Link>
              <Link
                to="/awareness/phishing-lab"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Phishing Awareness Lab
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-bold text-amber-800 bg-amber-50 rounded-lg"
                >
                  Admin Portal
                </Link>
              )}
              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-base font-medium text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                >
                  <LogOut size={18} /> Log Out
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
