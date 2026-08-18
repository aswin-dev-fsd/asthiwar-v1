import React from 'react';
import { Ruler, Car, ArrowRight, ArrowLeft, Layers } from 'lucide-react';
import { EstimateFormState } from '../../types';

interface Step1Props {
  formData: EstimateFormState;
  onChange: (fields: Partial<EstimateFormState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PRESET_AREAS = [1000, 1200, 1500, 1800, 2000, 2500, 3000];

export const Step1Dimensions: React.FC<Step1Props> = ({
  formData,
  onChange,
  onNext,
  onBack,
}) => {
  // Convert plot area to equivalent sqft for display
  let plotSqft = formData.plotArea;
  if (formData.plotAreaUnit === 'cents') plotSqft = Math.round(formData.plotArea * 435.6);
  if (formData.plotAreaUnit === 'sqyards') plotSqft = Math.round(formData.plotArea * 9);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <span className="badge badge-gold mb-3">Step 2 of 5 • Dimensions</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          Plot Area & Built-up Area
        </h2>
        <p className="text-sm text-slate-400">
          Specify your plot dimensions and desired floor footprint.
        </p>
      </div>

      <div className="asthiwar-card space-y-6">
        {/* Plot Area & Unit */}
        <div>
          <label className="form-label flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-amber-400" /> Total Plot Area
            </span>
            {formData.plotAreaUnit !== 'sqft' && (
              <span className="text-xs text-amber-400 font-semibold">
                ≈ {plotSqft.toLocaleString('en-IN')} Sq.Ft
              </span>
            )}
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <input
                type="number"
                min={100}
                max={50000}
                className="form-input text-lg font-bold"
                value={formData.plotArea || ''}
                onChange={(e) => onChange({ plotArea: parseFloat(e.target.value) || 0 })}
                placeholder="e.g. 2400"
              />
            </div>
            <div>
              <select
                className="form-select font-semibold"
                value={formData.plotAreaUnit}
                onChange={(e) => onChange({ plotAreaUnit: e.target.value as any })}
              >
                <option value="sqft">Sq.Ft</option>
                <option value="cents">Cents</option>
                <option value="sqyards">Sq.Yards</option>
              </select>
            </div>
          </div>
        </div>

        {/* Built-up Area Per Floor */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <label className="form-label flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" /> Built-up Area Per Floor
            </label>
            <span className="text-lg font-extrabold text-amber-400">
              {formData.builtupAreaPerFloor.toLocaleString('en-IN')} Sq.Ft
            </span>
          </div>

          <input
            type="range"
            min={500}
            max={5000}
            step={50}
            value={formData.builtupAreaPerFloor}
            onChange={(e) => onChange({ builtupAreaPerFloor: parseInt(e.target.value, 10) })}
            className="w-full mb-3"
          />

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {PRESET_AREAS.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => onChange({ builtupAreaPerFloor: area })}
                className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                  formData.builtupAreaPerFloor === area
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                {area.toLocaleString()} sqft
              </button>
            ))}
          </div>
        </div>

        {/* Car Parking Area */}
        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <label className="form-label flex items-center gap-1.5">
              <Car className="w-4 h-4 text-amber-400" /> Covered Car Parking Area
            </label>
            <span className="text-sm font-bold text-slate-200">
              {formData.carParkingAreaSqft} Sq.Ft ({formData.carCount} Car{formData.carCount > 1 ? 's' : ''})
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { count: 0, area: 0, label: 'None' },
              { count: 1, area: 200, label: '1 Car (200 sqft)' },
              { count: 2, area: 400, label: '2 Cars (400 sqft)' },
            ].map((opt) => (
              <button
                key={opt.count}
                type="button"
                onClick={() => onChange({ carCount: opt.count, carParkingAreaSqft: opt.area })}
                className={`p-3 rounded-xl border text-center transition-all ${
                  formData.carCount === opt.count
                    ? 'bg-amber-500/15 border-amber-500 text-white font-bold'
                    : 'bg-slate-800/50 border-slate-700/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs">{opt.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
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
            disabled={formData.plotArea <= 0 || formData.builtupAreaPerFloor <= 0}
            onClick={onNext}
            className="btn btn-primary"
          >
            <span>Floor Selector</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
