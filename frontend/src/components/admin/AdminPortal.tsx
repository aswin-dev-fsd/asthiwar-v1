import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Sliders,
  Loader2,
  LogOut,
  User,
} from 'lucide-react';
import { adminGetMe } from '../../services/adminApi';
import { AdminLogin } from './AdminLogin';
import { AdminDashboardOverview } from './AdminDashboardOverview';
import { AdminEnquiriesManager } from './AdminEnquiriesManager';
import { AdminEstimatesExplorer } from './AdminEstimatesExplorer';
import { AdminPricingConfigManager } from './AdminPricingConfigManager';
import { ErrorBoundary } from '../common/ErrorBoundary';

interface AdminPortalProps {
  onBackToCalculator?: () => void;
  user: any | null;
  onUserChange: (user: any | null) => void;
  onLogout: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  user,
  onUserChange,
  onLogout,
}) => {
  const [loading, setLoading] = useState<boolean>(!user);
  const [activeTab, setActiveTab] = useState<'overview' | 'enquiries' | 'estimates' | 'pricing'>('overview');

  useEffect(() => {
    if (!user) {
      adminGetMe()
        .then((u) => {
          onUserChange(u);
          setLoading(false);
        })
        .catch(() => {
          onUserChange(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="py-36 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-amber-400 mx-auto mb-4" />
        <h3 className="font-heading font-bold text-lg text-white mb-1">Verifying Admin Session</h3>
        <p className="text-xs text-slate-400">Authenticating credentials against Neon PostgreSQL session store...</p>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin onSuccess={(u) => onUserChange(u)} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Admin Header & Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'Executive Dashboard', icon: LayoutDashboard },
            { id: 'enquiries', label: 'Leads & Enquiries CRM', icon: Users },
            { id: 'estimates', label: 'Estimates Explorer', icon: FileText },
            { id: 'pricing', label: 'Pricing & Matrix Engine', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Info & Logout Button */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>{user.fullName || user.email}</span>
            <span className="badge badge-gold text-[10px] px-1.5 py-0.5">{user.role || 'ADMIN'}</span>
          </div>
          <button
            onClick={onLogout}
            title="Sign Out"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 text-xs font-bold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <ErrorBoundary fallbackTitle="Admin Tab Error">
        {activeTab === 'overview' && <AdminDashboardOverview />}
        {activeTab === 'enquiries' && <AdminEnquiriesManager />}
        {activeTab === 'estimates' && <AdminEstimatesExplorer />}
        {activeTab === 'pricing' && <AdminPricingConfigManager />}
      </ErrorBoundary>
    </div>
  );
};
