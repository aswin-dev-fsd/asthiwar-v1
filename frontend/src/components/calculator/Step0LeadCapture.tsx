import React from 'react';
import { User, Phone, Mail, MapPin, ArrowRight, ArrowLeft, Shield } from 'lucide-react';
import { Location, EstimateFormState } from '../../types';

interface Step0Props {
  formData: EstimateFormState;
  locations: Location[];
  onChange: (fields: Partial<EstimateFormState>) => void;
  onNext: () => void;
  onBack?: () => void;
}

export const Step0LeadCapture: React.FC<Step0Props> = ({
  formData,
  locations,
  onChange,
  onNext,
  onBack,
}) => {
  const isValid =
    formData.customerName.trim().length >= 2 &&
    /^[6-9]\d{9}$/.test(formData.customerPhone.trim()) &&
    (formData.customerEmail.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail.trim())) &&
    formData.plotLocation.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onNext();
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <span className="badge badge-gold mb-3">Step 5 of 5 • Contact Details</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          Almost Done!
        </h2>
        <p className="text-sm text-slate-400">
          Enter your details to view your instant, 100% authoritative construction budget and milestone schedule.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="asthiwar-card space-y-4">
        <div className="form-group">
          <label className="form-label flex items-center gap-1.5">
            <User className="w-4 h-4 text-amber-400" /> Full Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Aswin Kumar"
            className="form-input"
            value={formData.customerName}
            onChange={(e) => onChange({ customerName: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-amber-400" /> Mobile Number *
            </label>
            <input
              type="tel"
              required
              maxLength={10}
              placeholder="10-digit mobile (e.g. 9876543210)"
              className="form-input"
              value={formData.customerPhone}
              onChange={(e) => onChange({ customerPhone: e.target.value.replace(/\D/g, '') })}
            />
            {formData.customerPhone.length > 0 && !/^[6-9]\d{9}$/.test(formData.customerPhone) && (
              <p className="text-red-400 text-xs mt-1.5">
                Please enter a valid 10-digit Indian mobile number.
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-amber-400" /> Email Address (Optional)
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              className="form-input"
              value={formData.customerEmail}
              onChange={(e) => onChange({ customerEmail: e.target.value })}
            />
            {formData.customerEmail.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail) && (
              <p className="text-red-400 text-xs mt-1.5">
                Please enter a valid email address.
              </p>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-amber-400" /> Plot Location (Tamil Nadu) *
          </label>
          <select
            className="form-select"
            value={formData.plotLocation}
            onChange={(e) => {
              const loc = locations.find((l) => l.name === e.target.value);
              onChange({
                plotLocation: e.target.value,
                locationId: loc ? loc.id : null,
              });
            }}
          >
            <option value="">Select your site location...</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.name}>
                {loc.name} {Number(loc.priceMultiplier) !== 1.0 ? `(${loc.priceMultiplier}x rate)` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          {onBack && (
            <button type="button" onClick={onBack} className="btn btn-secondary text-xs">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </button>
          )}
          <button
            type="submit"
            disabled={!isValid}
            className="btn btn-primary py-3 px-6 text-base"
          >
            <span>View Estimate</span>
            <ArrowRight className="w-5 h-5 ml-1.5" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-slate-500">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Your information is strictly protected and never shared with 3rd parties.</span>
        </div>
      </form>
    </div>
  );
};
