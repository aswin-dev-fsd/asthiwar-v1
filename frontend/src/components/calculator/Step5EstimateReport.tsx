import React, { useState, useEffect } from 'react';
import {
  Download,
  Share2,
  Calendar,
  CheckCircle2,
  Calculator,
  RefreshCw,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CalculationResult } from '../../types';
import { submitEnquiry } from '../../services/api';

interface Step5Props {
  result: CalculationResult;
  onReset: () => void;
}

function formatINR(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Rs. 0';
  return 'Rs. ' + num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export const Step5EstimateReport: React.FC<Step5Props> = ({ result, onReset }) => {
  const { breakdown, milestones, customer } = result;

  // EMI Calculator State
  const [loanPercent, setLoanPercent] = useState<number>(80);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(20);

  // Lead Booking Modal State
  const [showConsultModal, setShowConsultModal] = useState<boolean>(false);
  const [preferredTime, setPreferredTime] = useState<string>('Morning (9 AM - 12 PM)');
  const [notes, setNotes] = useState<string>('');
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Trigger celebration confetti on mount
  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'],
    });
  }, []);

  // Compute EMI
  const loanAmount = (breakdown.totalProjectCost * loanPercent) / 100;
  const monthlyRate = interestRate / 12 / 100;
  const totalMonths = tenureYears * 12;
  const emi =
    loanAmount > 0 && monthlyRate > 0
      ? Math.round(
          (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
            (Math.pow(1 + monthlyRate, totalMonths) - 1)
        )
      : 0;

  const handleBookConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    setSubmitting(true);
    try {
      await submitEnquiry({
        fullName: customer.name,
        phone: customer.phone,
        email: customer.email,
        plotLocation: customer.location,
        estimateNumber: result.estimateNumber,
        preferredContactTime: preferredTime,
        requirementNotes: notes || 'Booked site assessment via web calculator report',
      });
      setBookingSuccess(true);
      setSubmitting(false);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🏗️ ASTHIWAR Construction Estimate (${result.estimateNumber})\nTotal Cost: ${formatINR(
        breakdown.totalProjectCost
      )}\nArea: ${breakdown.totalBuiltupAreaSqft} sq.ft\nLocation: ${customer?.location}\nDownload PDF: ${window.location.origin}/api/v1/calculator/estimate/${result.estimateNumber}/pdf`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
      {/* Top Banner Card */}
      <div className="asthiwar-card relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border-amber-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-gold">Verified Estimate</span>
              <span className="text-xs text-slate-400 font-mono">
                {result.estimateNumber}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {formatINR(breakdown.totalProjectCost)}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Estimated Total Investment • Effective Rate:{' '}
              <strong className="text-amber-400">
                {formatINR(breakdown.effectiveRatePerSqft)} / Sq.Ft
              </strong>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={`/api/v1/calculator/estimate/${result.estimateNumber}/pdf?download=true`}
              className="btn btn-primary text-xs sm:text-sm py-3 px-5 shadow-lg shadow-amber-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Download Quotation PDF</span>
            </a>

            <button
              onClick={handleWhatsAppShare}
              className="btn btn-secondary text-xs sm:text-sm py-3 px-4 bg-emerald-600/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30"
            >
              <Share2 className="w-4 h-4" />
              <span>Share WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Quick Spec Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400">Total Built-Up Area:</span>
            <div className="font-bold text-white text-sm">
              {breakdown.totalBuiltupAreaSqft.toLocaleString('en-IN')} Sq.Ft
            </div>
          </div>
          <div>
            <span className="text-slate-400">Base Construction:</span>
            <div className="font-bold text-white text-sm">
              {formatINR(breakdown.baseConstructionCost)}
            </div>
          </div>
          <div>
            <span className="text-slate-400">Brand Upgrades:</span>
            <div className="font-bold text-white text-sm">
              {formatINR(breakdown.upgradesCost)}
            </div>
          </div>
          <div>
            <span className="text-slate-400">Add-Ons Subtotal:</span>
            <div className="font-bold text-white text-sm">
              {formatINR(breakdown.addonsCost)}
            </div>
          </div>
        </div>
      </div>

      {/* 10-Stage Milestone Phase Schedule */}
      <div className="asthiwar-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-lg text-white">
              10-Stage Milestone Payment Schedule
            </h3>
            <p className="text-xs text-slate-400">
              Zero front-loading. Payments strictly tied to verified civil site stages.
            </p>
          </div>
          <span className="badge badge-blue">100% Balanced</span>
        </div>

        <div className="space-y-3">
          {milestones.map((stage, idx) => (
            <div
              key={idx}
              className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">
                  {stage.stage || idx + 1}
                </div>
                <div>
                  <h5 className="font-semibold text-xs text-white">{stage.name}</h5>
                  <div className="w-36 sm:w-48 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full"
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center text-xs">
                <span className="text-slate-400 font-semibold">{stage.percentage}%</span>
                <span className="font-bold text-white text-sm">{formatINR(stage.amount)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly EMI Estimator Slider */}
      <div className="asthiwar-card bg-slate-900/60 border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-amber-400" />
          <h3 className="font-heading font-bold text-base text-white">Home Construction Loan EMI Estimator</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-400">Loan Percentage ({loanPercent}%):</span>
              <span className="font-bold text-amber-400">{formatINR(loanAmount)}</span>
            </div>
            <input
              type="range"
              min={50}
              max={90}
              step={5}
              value={loanPercent}
              onChange={(e) => setLoanPercent(parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-400">Interest Rate:</span>
              <span className="font-bold text-amber-400">{interestRate}% p.a.</span>
            </div>
            <input
              type="range"
              min={7.5}
              max={12.0}
              step={0.25}
              value={interestRate}
              onChange={(e) => setInterestRate(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-400">Tenure:</span>
              <span className="font-bold text-amber-400">{tenureYears} Years</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={1}
              value={tenureYears}
              onChange={(e) => setTenureYears(parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Estimated Monthly EMI</span>
            <div className="text-2xl font-extrabold text-emerald-400">{formatINR(emi)} / month</div>
          </div>
          <span className="text-[11px] text-slate-500 max-w-xs text-right hidden sm:inline">
            Bank loan assistance available with SBI, HDFC, ICICI, and Axis Bank.
          </span>
        </div>
      </div>

      {/* Action CTA Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <button
          type="button"
          onClick={onReset}
          className="btn btn-secondary text-xs sm:text-sm w-full sm:w-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Start New Calculation</span>
        </button>

        <button
          type="button"
          onClick={() => setShowConsultModal(true)}
          className="btn btn-primary text-sm sm:text-base py-3.5 px-8 w-full sm:w-auto shadow-xl shadow-amber-500/25"
        >
          <Calendar className="w-5 h-5" />
          <span>Book Free Site Visit & Floor Plan Discussion</span>
        </button>
      </div>

      {/* Free Site Visit Booking Modal */}
      {showConsultModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="asthiwar-card max-w-md w-full animate-fade-in bg-slate-900 border-amber-500/40">
            {bookingSuccess ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h4 className="text-xl font-bold text-white mb-2">Site Visit Requested!</h4>
                <p className="text-xs text-slate-300 mb-6">
                  Our Senior Project Architect will contact you shortly to schedule your on-site plot assessment.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowConsultModal(false);
                    setBookingSuccess(false);
                  }}
                  className="btn btn-primary w-full"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookConsultation} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h4 className="font-heading font-bold text-base text-white">
                    Book Free Site Assessment
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowConsultModal(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="text-xs text-slate-400">
                  Site Location: <strong className="text-white">{customer?.location}</strong> • Ref:{' '}
                  <strong className="text-amber-400">{result.estimateNumber}</strong>
                </div>

                <div className="form-group">
                  <label className="form-label flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" /> Preferred Consultation Time
                  </label>
                  <select
                    className="form-select text-xs"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                  >
                    <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                    <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                    <option value="Evening (4 PM - 7:30 PM)">Evening (4 PM - 7:30 PM)</option>
                    <option value="Weekend Saturday/Sunday">Weekend (Saturday / Sunday)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Special Requirements / Custom Notes</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Need vaastu compliant floor plan with pooja room facing north-east..."
                    className="form-textarea text-xs"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary w-full py-3 text-sm"
                >
                  {submitting ? 'Submitting...' : 'Confirm Free Site Visit'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
