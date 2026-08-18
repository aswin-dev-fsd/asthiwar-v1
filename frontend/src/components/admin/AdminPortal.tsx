import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Sliders,
  LogOut,
  Building2,
  Loader2,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { adminGetMe, adminLogout } from '../../services/adminApi';
import { AdminLogin } from './AdminLogin';
import { AdminDashboardOverview } from './AdminDashboardOverview';
import { AdminEnquiriesManager } from './AdminEnquiriesManager';
import { AdminEstimatesExplorer } from './AdminEstimatesExplorer';
import { AdminPricingConfigManager } from './AdminPricingConfigManager';
import { ErrorBoundary } from '../common/ErrorBoundary';

interface AdminPortalProps {
  onBackToCalculator: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToCalculator }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'enquiries' | 'estimates' | 'pricing'>('overview');

  useEffect(() => {
    adminGetMe()
      .then((u) => {
        setUser(u);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await adminLogout();
      setUser(null);
    } catch (err) {
      console.error(err);
      setUser(null);
    }
  };

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
    return <AdminLogin onSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Admin Top Banner Bar */}
      <div className="asthiwar-card p-4 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-amber-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-md">
            <Building2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-extrabold text-lg text-white">ASTHIWAR Control Center</h2>
              <span className="badge badge-gold">
                <ShieldCheck className="w-3 h-3" /> {user.role || 'Super Admin'}
              </span>
            </div>
            <p className="text-xs text-slate-400">Signed in as {user.fullName} ({user.email})</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCalculator}
            className="btn btn-secondary text-xs py-2 px-3.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Public Calculator</span>
          </button>

          <button
            onClick={handleLogout}
            className="btn btn-secondary text-xs py-2 px-3.5 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-800 pb-4">
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
