import React from 'react';
import { Building2, Phone, Sparkles, LogOut } from 'lucide-react';

interface HeaderProps {
  currentView: 'calculator' | 'admin';
  onNavigate: (view: 'calculator' | 'admin') => void;
  adminUser?: any | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, adminUser, onLogout }) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => onNavigate('calculator')}
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950">
            <Building2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-xl tracking-tight text-white">
                ASTHIWAR
              </span>
              <span className="badge badge-gold">
                <Sparkles className="w-3 h-3" /> Tamil Nadu
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Design & Build • Turnkey Construction</p>
          </div>
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 mr-2">
            <button 
              onClick={() => onNavigate('calculator')}
              className={`text-sm font-semibold transition-colors ${
                currentView === 'calculator' ? 'text-amber-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              Cost Calculator
            </button>
            <a 
              href="#packages-overview"
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Packages
            </a>
            <button 
              onClick={() => onNavigate('admin')}
              className={`text-sm font-semibold transition-colors ${
                currentView === 'admin' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin Portal
            </button>
          </div>

          {/* Quick Helpline Hotline */}
          <a 
            href="tel:+919876543210" 
            className="btn btn-secondary text-xs sm:text-sm py-2 px-3 sm:px-4"
          >
            <Phone className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">+91 98765 43210</span>
            <span className="sm:hidden">Call</span>
          </a>

          {/* Sign Out button when Admin is logged in */}
          {adminUser && (
            <button
              onClick={onLogout}
              className="btn btn-secondary text-xs sm:text-sm py-2 px-3 sm:px-4 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 text-slate-300 flex items-center gap-1.5 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
