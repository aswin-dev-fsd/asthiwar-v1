import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  ArrowUpRight,
  Loader2,
  Building,
} from 'lucide-react';
import { getDashboardAnalytics } from '../../services/adminApi';

function formatINR(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) return '₹0';
  const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  if (isNaN(num) || num === 0) return '₹0';
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} Lakh`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}

export const AdminDashboardOverview: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardAnalytics()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err?.message || 'Failed to fetch dashboard metrics');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-400 mx-auto mb-4" />
        <p className="text-xs text-slate-400">Loading live analytics from Neon PostgreSQL...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
        {error}
      </div>
    );
  }

  const kpis = data?.kpis || data?.metrics || {};
  const metrics = {
    totalPipelineValue: kpis.totalPipelineValue || 0,
    totalEstimates: kpis.totalEstimates || 0,
    totalEnquiries: kpis.totalEnquiries || 0,
    newEnquiriesCount: kpis.newEnquiriesCount || 0,
    averageEstimateValue: kpis.avgProjectValue || kpis.averageEstimateValue || 0,
  };
  const recentEnquiries = data?.recentEnquiries || [];
  const estimatesByPackage = data?.estimatesByPackage || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="asthiwar-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Pipeline Value
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {formatINR(metrics.totalPipelineValue)}
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> Cumulative calculated estimates
          </span>
        </div>

        <div className="asthiwar-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Estimates
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {metrics.totalEstimates}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Avg: {formatINR(metrics.averageEstimateValue)} / estimate
          </span>
        </div>

        <div className="asthiwar-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Leads / Enquiries
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {metrics.totalEnquiries}
          </div>
          <span className="text-[11px] text-amber-400 font-semibold mt-1 block">
            {metrics.newEnquiriesCount} New Leads awaiting contact
          </span>
        </div>

        <div className="asthiwar-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Lead Conversion
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {metrics.totalEstimates > 0
              ? `${((metrics.totalEnquiries / metrics.totalEstimates) * 100).toFixed(1)}%`
              : '0%'}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Estimate-to-consultation rate
          </span>
        </div>
      </div>

      {/* Two Column Section: Recent Leads & Package Share */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Enquiries List */}
        <div className="lg:col-span-2 asthiwar-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-heading font-bold text-base text-white">
                Recent Consultation Leads
              </h4>
              <p className="text-xs text-slate-400">Latest customer enquiries from calculator</p>
            </div>
            <span className="badge badge-gold">{recentEnquiries.length} Recent</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Client</th>
                  <th className="pb-3 font-semibold">Location</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Estimate Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentEnquiries.map((enq: any) => (
                  <tr key={enq.id} className="hover:bg-slate-800/30">
                    <td className="py-3">
                      <div className="font-bold text-white">{enq.fullName}</div>
                      <div className="text-slate-400 text-[11px]">{enq.phone}</div>
                    </td>
                    <td className="py-3 text-slate-300">{enq.plotLocation}</td>
                    <td className="py-3">
                      <span
                        className={`badge ${
                          enq.status === 'NEW'
                            ? 'badge-gold'
                            : enq.status === 'CONTACTED'
                            ? 'badge-blue'
                            : 'badge-green'
                        }`}
                      >
                        {enq.status}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-amber-400">
                      {enq.estimateNumber || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Package Popularity Share */}
        <div className="asthiwar-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building className="w-4 h-4 text-amber-400" />
            <h4 className="font-heading font-bold text-base text-white">Tier Popularity</h4>
          </div>

          <div className="space-y-4">
            {estimatesByPackage.map((pkg: any) => {
              const share = metrics.totalEstimates > 0 ? (pkg.count / metrics.totalEstimates) * 100 : 0;
              return (
                <div key={pkg.packageSlug} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white capitalize">{pkg.packageSlug}</span>
                    <span className="text-slate-400">{pkg.count} ({share.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 text-right">
                    Value: {formatINR(pkg.totalValue)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
