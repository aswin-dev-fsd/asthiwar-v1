import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Sliders,
  Loader2,
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
