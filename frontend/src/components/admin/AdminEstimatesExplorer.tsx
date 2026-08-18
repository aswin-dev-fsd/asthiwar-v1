import React, { useEffect, useState } from 'react';
import {
  Search,
  Download,
  Send,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import {
  getAdminEstimates,
  getAdminEstimateById,
  triggerEstimateQuotation,
} from '../../services/adminApi';

function formatINR(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Rs. 0';
  return 'Rs. ' + num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export const AdminEstimatesExplorer: React.FC = () => {
  const [estimates, setEstimates] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [packageFilter, setPackageFilter] = useState<string>('ALL');
  const [selectedEstimate, setSelectedEstimate] = useState<any | null>(null);
  const [notifySuccess, setNotifySuccess] = useState<string | null>(null);

  const fetchEstimates = () => {
    setLoading(true);
    getAdminEstimates({
      packageSlug: packageFilter === 'ALL' ? undefined : packageFilter,
      search: search || undefined,
    })
      .then((res) => {
        setEstimates(res.items);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEstimates();
  }, [packageFilter]);

  const handleInspect = async (id: string) => {
    try {
      const res = await getAdminEstimateById(id);
      setSelectedEstimate(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDispatchNotification = async (estimateId: string) => {
    try {
      await triggerEstimateQuotation(estimateId, ['EMAIL', 'WHATSAPP']);
      setNotifySuccess('Estimate quotation successfully dispatched via WhatsApp & Email!');
      setTimeout(() => setNotifySuccess(null), 4000);
    } catch (err: any) {
      alert(err?.message || 'Failed to dispatch quotation notification');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-heading font-bold text-xl text-white">Estimates Explorer</h3>
          <p className="text-xs text-slate-400">
            Browse, inspect snapshots, and dispatch verified PDF estimates
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchEstimates();
          }}
          className="flex gap-2 w-full sm:w-auto"
        >
          <div className="relative flex-grow sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search estimate #, client, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-9 text-xs py-2"
            />
          </div>
          <button type="submit" className="btn btn-secondary text-xs py-2 px-3">
            Search
          </button>
        </form>
      </div>

      {/* Package Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {['ALL', 'basic', 'standard', 'premium', 'luxury'].map((pkg) => (
          <button
            key={pkg}
            onClick={() => setPackageFilter(pkg)}
            className={`text-xs px-3.5 py-1.5 rounded-lg border font-semibold capitalize transition-all ${
              packageFilter === pkg
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            {pkg === 'ALL' ? 'All Packages' : pkg}
          </button>
        ))}
      </div>

      {notifySuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notifySuccess}</span>
        </div>
      )}

      {/* Estimates Table */}
      <div className="asthiwar-card p-0 overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading estimates...</p>
          </div>
        ) : estimates.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No estimate records found matching the filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="p-4 font-semibold">Estimate #</th>
                  <th className="p-4 font-semibold">Client</th>
                  <th className="p-4 font-semibold">Package & Floor</th>
                  <th className="p-4 font-semibold">Total Area</th>
                  <th className="p-4 font-semibold">Total Cost</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {estimates.map((est) => (
                  <tr key={est.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-amber-400">
                      {est.estimateNumber}
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{est.customerName}</div>
                      <div className="text-slate-400 text-[11px]">{est.customerPhone} • {est.plotLocation}</div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-white capitalize">{est.packageSlug}</div>
                      <div className="text-slate-400 text-[11px]">{est.floorCount} Storey</div>
                    </td>

                    <td className="p-4 font-bold text-slate-200">
                      {parseFloat(est.totalBuiltupAreaSqft).toLocaleString('en-IN')} sqft
                    </td>

                    <td className="p-4 font-bold text-emerald-400 text-sm">
                      {formatINR(est.totalProjectCost)}
                    </td>

                    <td className="p-4 text-right space-x-2">
                      <a
                        href={`/api/v1/admin/estimates/${est.id}/pdf?download=true`}
                        className="btn btn-secondary text-xs py-1.5 px-2.5"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>PDF</span>
                      </a>

                      <button
                        onClick={() => handleDispatchNotification(est.id)}
                        className="btn btn-secondary text-xs py-1.5 px-2.5 bg-emerald-600/20 text-emerald-400 border-emerald-500/30"
                        title="Send via WhatsApp & Email"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Dispatch</span>
                      </button>

                      <button
                        onClick={() => handleInspect(est.id)}
                        className="btn btn-primary text-xs py-1.5 px-3"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Estimate Snapshot Inspection Modal */}
      {selectedEstimate && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="asthiwar-card max-w-2xl w-full bg-slate-900 border-amber-500/40 animate-fade-in max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="font-heading font-bold text-lg text-white">
                  Estimate Snapshot: {selectedEstimate.estimateNumber}
                </h4>
                <p className="text-xs text-slate-400">
                  Immutable record captured on{' '}
                  {new Date(selectedEstimate.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedEstimate(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400">Base Construction:</span>
                <div className="font-bold text-white">{formatINR(selectedEstimate.baseConstructionCost)}</div>
              </div>
              <div>
                <span className="text-slate-400">Upgrades Subtotal:</span>
                <div className="font-bold text-white">{formatINR(selectedEstimate.upgradesCost)}</div>
              </div>
              <div>
                <span className="text-slate-400">Add-Ons Subtotal:</span>
                <div className="font-bold text-white">{formatINR(selectedEstimate.addonsCost)}</div>
              </div>
              <div>
                <span className="text-slate-400">Total Investment:</span>
                <div className="font-bold text-emerald-400 text-sm">{formatINR(selectedEstimate.totalProjectCost)}</div>
              </div>
            </div>

            {/* Inclusions & Brand Specifications */}
            <div>
              <h5 className="font-bold text-xs text-slate-300 uppercase tracking-wider mb-2">
                Itemized Specifications ({selectedEstimate.items?.length || 0})
              </h5>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {selectedEstimate.items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{item.itemName}</span>
                      <span className="text-slate-400 ml-2">Brand: {item.selectedBrand || 'Standard'}</span>
                    </div>
                    <span className="text-amber-400 font-semibold">
                      {parseFloat(item.totalPrice) > 0 ? formatINR(item.totalPrice) : 'Included'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Add-Ons */}
            {selectedEstimate.addons?.length > 0 && (
              <div>
                <h5 className="font-bold text-xs text-slate-300 uppercase tracking-wider mb-2">
                  Selected Add-Ons ({selectedEstimate.addons.length})
                </h5>
                <div className="space-y-2">
                  {selectedEstimate.addons.map((add: any) => (
                    <div
                      key={add.id}
                      className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white">{add.addonName}</span>
                        <span className="text-slate-400 ml-2">({add.variantName})</span>
                      </div>
                      <span className="text-emerald-400 font-bold">{formatINR(add.totalPrice)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <a
                href={`/api/v1/admin/estimates/${selectedEstimate.id}/pdf?download=true`}
                className="btn btn-primary text-xs py-2.5 flex-grow"
              >
                <Download className="w-4 h-4" />
                <span>Download Official PDF</span>
              </a>
              <button
                onClick={() => setSelectedEstimate(null)}
                className="btn btn-secondary text-xs py-2.5 px-6"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
