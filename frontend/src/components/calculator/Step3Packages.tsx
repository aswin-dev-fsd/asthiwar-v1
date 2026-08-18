import { Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { Package, EstimateFormState } from '../../types';

interface Step3Props {
  formData: EstimateFormState;
  packages: Package[];
  onChange: (fields: Partial<EstimateFormState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PACKAGE_HIGHLIGHTS: Record<string, string[]> = {
  basic: [
    'ISI Fe 550D TMT Steel & ISI Cement',
    'Solid Concrete Blocks Masonry',
    '1 Putnam + 2 ISI Emulsion Paint',
    '2\'x2\' Vitrified Flooring (Rs. 45/sqft)',
    'Standard UPVC Sliding Windows',
    '10-Year Structural Warranty',
  ],
  standard: [
    'SPA / Vizag Steel & JSW / Ramco Cement',
    'Fly Ash / AAC Blocks Masonry',
    'Parryware Sanitary Fittings (Rs. 20,000/bath)',
    '4\'x2\' Vitrified Tiles (Rs. 50/sqft)',
    'Dr. Fixit Waterproofing Included',
    'Readymade Teak Main Door (5"x4")',
  ],
  premium: [
    'ARS / Suryadev Fe 550D & Ultratech Cement',
    'Jaquar Premium Sanitary (Rs. 30,000/bath)',
    'Granite Staircase Flooring (Rs. 120/sqft)',
    '1st Quality Teak Main Door (3.5\'x7\')',
    'Asian Apex Weatherproof Exterior Paint',
    'Soil Testing & Architect Site Visits Included',
  ],
  luxury: [
    'JSW / TATA Fe 550D & Ultratech Cement',
    '100% Solid Red Bricks & RCC Basement',
    'Toto / Kohler Luxury Bathrooms (Rs. 45,000/bath)',
    '1st Quality Burma Teak Doors (3.5\'x8\')',
    'Italian / Premium Tiles (Rs. 100/sqft)',
    'VR 3D Walkthrough & Full Dedicated Site Engineer',
  ],
};

export const Step3Packages: React.FC<Step3Props> = ({
  formData,
  packages,
  onChange,
  onNext,
  onBack,
}) => {
  // Calculate total builtup area to determine volume rate
  const floorMultipliers: Record<string, number> = { Ground: 1, 'G+1': 2, 'G+2': 3, 'G+3': 4 };
  const multiplier = floorMultipliers[formData.floorCount] || 2;
  const totalBuiltup = (formData.builtupAreaPerFloor * multiplier) + formData.carParkingAreaSqft;
  const isVolume = totalBuiltup > 3500;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in" id="packages-overview">
      <div className="text-center mb-8">
        <span className="badge badge-gold mb-3">Step 4 of 5 • Specification Tier</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          Choose Construction Package
        </h2>
        <p className="text-sm text-slate-400">
          Transparent rates per sq.ft with zero hidden escalation clauses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {packages.map((pkg) => {
          const isSelected = formData.packageSlug === pkg.slug;
          const rate = isVolume ? pkg.volumePricePerSqft : pkg.standardPricePerSqft;
          const highlights = PACKAGE_HIGHLIGHTS[pkg.slug] || [];
          const isPopular = pkg.slug === 'premium';

          return (
            <div
              key={pkg.id}
              onClick={() => onChange({ packageSlug: pkg.slug as any })}
              className={`asthiwar-card cursor-pointer relative flex flex-col justify-between transition-all ${
                isSelected
                  ? 'border-amber-500 bg-slate-900/95 ring-2 ring-amber-500/40 shadow-xl shadow-amber-500/10'
                  : 'hover:border-slate-700 bg-slate-900/60'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider py-1 px-3 rounded-full shadow-md">
                  ★ Most Popular
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-heading font-extrabold text-lg text-white">{pkg.name}</h4>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-amber-500 text-slate-950' : 'border border-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                <p className="text-xs text-amber-400/90 font-semibold mb-3">{pkg.tagline}</p>

                {/* Price Display */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-slate-400">₹</span>
                    <span className="text-2xl font-extrabold text-white">
                      {rate.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-slate-400">/ sq.ft</span>
                  </div>
                  {isVolume && (
                    <div className="text-[10px] text-emerald-400 font-semibold mt-1">
                      Volume Discount Applied (&gt;3,500 sqft)
                    </div>
                  )}
                </div>

                {/* Inclusions List */}
                <ul className="space-y-2 text-xs text-slate-300 mb-6">
                  {highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                className={`btn w-full text-xs py-2.5 ${
                  isSelected ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {isSelected ? 'Selected Tier' : 'Select Package'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="btn btn-secondary"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="btn btn-primary"
        >
          <span>Customize & Add-Ons</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
