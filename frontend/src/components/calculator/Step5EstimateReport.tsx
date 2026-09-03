import React, { useState, useEffect } from 'react';
import {
  Download,
  Share2,
  Calendar,
  Calculator,
  RefreshCw,
  Clock,
  Sparkles,
  CheckCircle2,
  Send,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CalculationResult } from '../../types';
import { submitEnquiry } from '../../services/api';
import { formatINR } from '../../utils/formatters';
import { Modal } from '../common/Modal';

interface Step5Props {
  result: CalculationResult;
  onReset: () => void;
}

export const Step5EstimateReport: React.FC<Step5Props> = ({ result, onReset }) => {
  if (!result || !result.breakdown) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center asthiwar-card animate-fade-in">
        <h3 className="text-xl font-bold text-white mb-2">Estimate Generation Incomplete</h3>
        <p className="text-xs text-slate-400 mb-6">Could not load calculation breakdown. Please try recalculating.</p>
        <button onClick={onReset} className="btn btn-primary">
          <RefreshCw className="w-4 h-4 mr-2" /> Start Over
        </button>
      </div>
    );
  }

  const breakdown = result.breakdown || {};
  const customer = result.customer;
  const dimensions = result.dimensions;
  const pkg = result.package;
  const milestones = result.milestones || [];

  const totalCost = Number(breakdown.totalProjectCost || 0);
  const builtupArea = Number(dimensions?.totalBuiltupAreaSqft || breakdown.totalBuiltupAreaSqft || 0);
  const effectiveRate = Number(
    pkg?.effectiveRatePerSqft ||
      breakdown.effectiveTotalCostPerSqft ||
      breakdown.effectiveRatePerSqft ||
      (builtupArea > 0 ? totalCost / builtupArea : 0)
  );

  const [loanPercent, setLoanPercent] = useState<number>(80);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(20);

  const [showConsultModal, setShowConsultModal] = useState<boolean>(false);
  const [preferredTime, setPreferredTime] = useState<string>('Morning (9 AM - 12 PM)');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'],
      });
    } catch {
    }
  }, []);

  const loanAmount = (totalCost * loanPercent) / 100;
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
    setIsSubmitting(true);
    try {
      await submitEnquiry({
        fullName: customer.name,
        phone: customer.phone,
        email: customer.email,
        plotLocation: customer.location,
        estimateNumber: result.estimateNumber,
        preferredContactTime: preferredTime,
        requirementNotes: customNotes || 'Booked site assessment via web calculator report',
      });
      setBookingSuccess(true);
      setIsSubmitting(false);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🏗️ ASTHIWAR Construction Estimate (${result.estimateNumber || 'Ref'})\nTotal Cost: ${formatINR(
        totalCost
      )}\nArea: ${builtupArea} sq.ft\nLocation: ${customer?.location || 'Tamil Nadu'}\nDownload PDF: ${window.location.origin}/api/v1/calculator/estimate/${result.estimateNumber}/pdf`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
      <div className="asthiwar-card relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border-amber-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-gold">
                <Sparkles className="w-3 h-3" /> Verified Estimate
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {result.estimateNumber || 'EST-DRAFT'}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {formatINR(totalCost)}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Estimated Total Investment • Effective Rate:{' '}
              <strong className="text-amber-400">
                {formatINR(effectiveRate)} / Sq.Ft
              </strong>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {result.estimateNumber && (
              <a
                href={`/api/v1/calculator/estimate/${result.estimateNumber}/pdf?download=true`}
                className="btn btn-primary text-xs sm:text-sm py-3 px-5 shadow-lg shadow-amber-500/20"
                target="_blank"
                rel="noreferrer"
              >
                <Download className="w-4 h-4" />
                <span>Download Quotation PDF</span>
              </a>
            )}

            <button
              onClick={handleWhatsAppShare}
              className="btn btn-secondary text-xs sm:text-sm py-3 px-4 bg-emerald-600/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30"
            >
              <Share2 className="w-4 h-4" />
              <span>Share WhatsApp</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400">Total Built-Up Area:</span>
            <div className="font-bold text-white text-sm">
              {builtupArea.toLocaleString('en-IN')} Sq.Ft
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
              {formatINR(breakdown.upgradesCost || 0)}
            </div>
          </div>
          <div>
            <span className="text-slate-400">Add-Ons Subtotal:</span>
            <div className="font-bold text-white text-sm">
              {formatINR(breakdown.addonsCost || 0)}
            </div>
          </div>
        </div>
      </div>

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
          <span className="badge badge-gold">100% Balanced</span>
        </div>

        <div className="space-y-3">
          {milestones.map((stage, idx) => {
            const stageNum = stage.stageNumber || stage.stage || idx + 1;
            const stageTitle = stage.stageName || stage.name || `Stage ${stageNum}`;
            const amount = Number(stage.amount || 0);

            return (
              <div
                key={idx}
                className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">
                    {stageNum}
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-white">{stageTitle}</h5>
                    {stage.keyDeliverables && (
                      <p className="text-[11px] text-slate-400 line-clamp-1">{stage.keyDeliverables}</p>
                    )}
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
                  <span className="font-bold text-white text-sm">{formatINR(amount)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="asthiwar-card bg-slate-900/60 border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            <h3 className="font-heading font-bold text-base text-white">Home Construction Loan EMI Estimator</h3>
          </div>
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 whitespace-nowrap">Assisting in Loan</span>
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

      {/* 11 Standard Exclusions & Client Scope Card */}
      <div className="asthiwar-card bg-slate-900/60 border-slate-800">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-heading font-bold text-base text-white">
              Standard Exclusions & Client Scope
            </h3>
            <p className="text-xs text-slate-400">
              Contract transparency: The following statutory, interior, and utility items are managed directly with respective authorities or available as custom add-ons.
            </p>
          </div>
          <span className="badge badge-silver text-[10px]">Scope Clarity</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-slate-300">
          <div className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-amber-400 font-bold shrink-0">1.</span>
            <span><strong>Elevation Work:</strong> Custom architectural facade & exterior stone/HPL claddings beyond standard design</span>
          </div>
          <div className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-amber-400 font-bold shrink-0">2.</span>
            <span><strong>Outer Area Development:</strong> Setbacks, perimeter pavers, compound pathways & landscaping</span>
          </div>
          <div className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-amber-400 font-bold shrink-0">3.</span>
            <span><strong>Interior Works & Carpentry:</strong> Wardrobes, kitchen cabinets, modular woodwork & loose furniture</span>
          </div>
          <div className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-amber-400 font-bold shrink-0">4.</span>
            <span><strong>Building Plan Sanction:</strong> DTCP / Local body building plan approval & government liaison fees</span>
          </div>
          <div className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-amber-400 font-bold shrink-0">5.</span>
            <span><strong>Electricity Board (EB):</strong> Permanent line connection charges, meter deposit & statutory tariffs</span>
          </div>
          <div className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-amber-400 font-bold shrink-0">6.</span>
            <span><strong>Gas Connection:</strong> Piped gas line connection & municipal pipeline installation charges</span>
          </div>
          <div className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-amber-400 font-bold shrink-0">7.</span>
            <span><strong>Water & Drainage (UGD):</strong> Municipal drinking water & underground drainage connection fees</span>
          </div>
          <div className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-amber-400 font-bold shrink-0">8.</span>
            <span><strong>Borewell Drilling:</strong> Borewell drilling, PVC casing pipes & submersible pump depth piping</span>
          </div>
          <div className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-amber-400 font-bold shrink-0">9.</span>
            <span><strong>Water Motors & Pumps:</strong> Supply & installation of motors (unless chosen in Add-Ons)</span>
          </div>
          <div className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-amber-400 font-bold shrink-0">10.</span>
            <span><strong>Electrical Appliances:</strong> TV, Refrigerator, Air Conditioners, Chimney, Hob & Geysers</span>
          </div>
          <div className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 md:col-span-2">
            <span className="text-amber-400 font-bold shrink-0">11.</span>
            <span><strong>Taxes & Levies:</strong> Vacant Land Tax (VLT), property assessment taxes & municipal duties</span>
          </div>
        </div>
      </div>

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

      <Modal
        isOpen={showConsultModal}
        onClose={() => {
          setShowConsultModal(false);
          setBookingSuccess(false);
        }}
        title="Book Free Site Assessment"
        subtitle={`Ref: ${result.estimateNumber || 'EST-REF'}`}
        maxWidth="max-w-md"
      >
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
            <div className="text-xs text-slate-400">
              Site Location: <strong className="text-white">{customer?.location || 'Tamil Nadu'}</strong> • Ref:{' '}
              <strong className="text-amber-400">{result.estimateNumber || 'EST-REF'}</strong>
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
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConsultModal(false)}
                className="btn btn-secondary text-xs py-2 px-4 w-1/3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary text-xs py-2.5 px-4 w-2/3 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Confirm Booking</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
