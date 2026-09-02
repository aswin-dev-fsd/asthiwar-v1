import React, { useEffect, useState } from 'react';
import {
  Search,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import {
  getAdminEnquiries,
  updateAdminEnquiry,
  triggerLeadAlert,
} from '../../services/adminApi';
import { Modal } from '../common/Modal';

const STATUS_FILTERS = [
  { label: 'ALL', value: 'ALL' },
  { label: 'NEW', value: 'NEW' },
  { label: 'CONTACTED', value: 'CONTACTED' },
  { label: 'MEETING SCHEDULED', value: 'MEETING_SCHEDULED' },
  { label: 'QUOTATION SENT', value: 'QUOTATION_SENT' },
  { label: 'WON', value: 'CLOSED_WON' },
  { label: 'LOST', value: 'CLOSED_LOST' },
];

export const AdminEnquiriesManager: React.FC = () => {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  const fetchLeads = () => {
    setLoading(true);
    getAdminEnquiries({
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      search: search || undefined,
    })
      .then((res) => {
        setEnquiries(res.items);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateAdminEnquiry(id, { status: newStatus });
      fetchLeads();
      if (selectedEnquiry && selectedEnquiry.id === id) {
        setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendAlert = async (enquiryId: string) => {
    try {
      await triggerLeadAlert(enquiryId);
      setAlertSuccess('Internal lead alert dispatched to sales team!');
      setTimeout(() => setAlertSuccess(null), 4000);
    } catch (err: any) {
      alert(err?.message || 'Failed to dispatch alert');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-heading font-bold text-xl text-white">Leads & Enquiries CRM</h3>
          <p className="text-xs text-slate-400">Manage customer consultations and follow-up pipelines</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, phone, estimate..."
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

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((st) => (
          <button
            key={st.value}
            onClick={() => setStatusFilter(st.value)}
            className={`text-xs px-3.5 py-1.5 rounded-lg border font-semibold transition-all ${
              statusFilter === st.value
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {alertSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{alertSuccess}</span>
        </div>
      )}

      {/* Enquiries Table */}
      <div className="asthiwar-card p-0 overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading enquiries...</p>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No consultation enquiries found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="p-4 font-semibold">Client</th>
                  <th className="p-4 font-semibold">Location</th>
                  <th className="p-4 font-semibold">Preferred Time</th>
                  <th className="p-4 font-semibold">Estimate</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{enq.fullName}</div>
                      <div className="flex items-center gap-3 text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-amber-400" /> {enq.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-500" /> {enq.email}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" /> {enq.plotLocation}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-500" /> {enq.preferredContactTime || 'Anytime'}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-amber-400">
                      {enq.estimateNumber ? (
                        <span className="badge badge-gold">{enq.estimateNumber}</span>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="p-4">
                      <select
                        value={enq.status}
                        onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-bold outline-none"
                      >
                        <option value="NEW">NEW</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="MEETING_SCHEDULED">MEETING SCHEDULED</option>
                        <option value="QUOTATION_SENT">QUOTATION SENT</option>
                        <option value="CLOSED_WON">CLOSED WON</option>
                        <option value="CLOSED_LOST">CLOSED LOST</option>
                      </select>
                    </td>

                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleSendAlert(enq.id)}
                        title="Dispatch Lead Alert to Sales"
                        className="btn btn-secondary text-xs py-1.5 px-2.5"
                      >
                        <Send className="w-3.5 h-3.5 text-amber-400" />
                        <span>Alert Sales</span>
                      </button>

                      <button
                        onClick={() => setSelectedEnquiry(enq)}
                        className="btn btn-primary text-xs py-1.5 px-3"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enquiry Detail Modal */}
      <Modal
        isOpen={Boolean(selectedEnquiry)}
        onClose={() => setSelectedEnquiry(null)}
        title="Consultation Lead Details"
        subtitle={selectedEnquiry?.fullName}
        maxWidth="max-w-lg"
      >
        {selectedEnquiry && (
          <div className="space-y-4">
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400">Client Name:</span>
                  <div className="font-bold text-white text-sm">{selectedEnquiry.fullName}</div>
                </div>
                <div>
                  <span className="text-slate-400">Phone:</span>
                  <div className="font-bold text-amber-400 text-sm">{selectedEnquiry.phone}</div>
                </div>
                <div>
                  <span className="text-slate-400">Email:</span>
                  <div className="text-slate-300">{selectedEnquiry.email}</div>
                </div>
                <div>
                  <span className="text-slate-400">Site Location:</span>
                  <div className="text-slate-300">{selectedEnquiry.plotLocation}</div>
                </div>
              </div>

              <div>
                <span className="text-slate-400">Client Requirement Notes:</span>
                <p className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200 mt-1">
                  {selectedEnquiry.requirementNotes || 'Standard consultation requested.'}
                </p>
              </div>

              {selectedEnquiry.estimateNumber && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-slate-400">Linked Estimate:</span>
                    <div className="font-bold font-mono text-amber-400">{selectedEnquiry.estimateNumber}</div>
                  </div>
                  <a
                    href={`/api/v1/calculator/estimate/${selectedEnquiry.estimateNumber}/pdf?download=true`}
                    className="btn btn-secondary text-xs py-1.5 px-3"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download PDF</span>
                  </a>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedEnquiry(null)}
              className="btn btn-secondary w-full text-xs py-2.5 mt-2"
            >
              Close
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};
