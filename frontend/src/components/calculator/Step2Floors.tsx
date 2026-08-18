import React from 'react';
import { Building, ArrowRight, ArrowLeft, Clock, Sparkles, Check } from 'lucide-react';
import { EstimateFormState } from '../../types';

interface Step2Props {
  formData: EstimateFormState;
  onChange: (fields: Partial<EstimateFormState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const FLOOR_OPTIONS: Array<{
  id: 'Ground' | 'G+1' | 'G+2' | 'G+3';
  title: string;
  multiplier: number;
  floorsCount: number;
  duration: string;
  description: string;
}> = [
  {
    id: 'Ground',
    title: 'Ground Floor Only',
    multiplier: 1.0,
    floorsCount: 1,
    duration: '5 - 6 Months',
    description: 'Compact single-level bungalow / starter home',
  },
  {
    id: 'G+1',
    title: 'Ground + 1st Floor (Duplex)',
    multiplier: 2.0,
    floorsCount: 2,
    duration: '7 - 9 Months',
    description: 'Most popular family home layout with 3-4 bedrooms',
  },
  {
    id: 'G+2',
    title: 'Ground + 2 Floors (Triplex)',
    multiplier: 3.0,
    floorsCount: 3,
    duration: '10 - 12 Months',
    description: 'Spacious joint family residence or rental unit',
  },
  {
    id: 'G+3',
    title: 'Ground + 3 Floors',
    multiplier: 4.0,
    floorsCount: 4,
    duration: '12 - 14 Months',
    description: 'Multi-family residential building / apartment style',
  },
];

export const Step2Floors: React.FC<Step2Props> = ({
  formData,
  onChange,
  onNext,
  onBack,
}) => {
  const currentFloor = FLOOR_OPTIONS.find((f) => f.id === formData.floorCount) || FLOOR_OPTIONS[1];
  const totalBuiltup = (formData.builtupAreaPerFloor * currentFloor.floorsCount) + formData.carParkingAreaSqft;
  const isVolumeDiscount = totalBuiltup > 3500;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <span className="badge badge-gold mb-3">Step 3 of 5 • Floor Elevation</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          Select Floor Configuration
        </h2>
        <p className="text-sm text-slate-400">
          Choose the number of storeys for your residential construction.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {FLOOR_OPTIONS.map((floor) => {
          const isSelected = formData.floorCount === floor.id;
          const calculatedArea = (formData.builtupAreaPerFloor * floor.floorsCount) + formData.carParkingAreaSqft;

          return (
            <div
              key={floor.id}
              onClick={() => onChange({ floorCount: floor.id })}
              className={`asthiwar-card cursor-pointer relative overflow-hidden transition-all text-left ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                  : 'hover:border-slate-600'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-400'
                }`}>
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-base text-white">{floor.id}</h4>
                  <p className="text-xs text-slate-400">{floor.title}</p>
                </div>
              </div>

              <p className="text-xs text-slate-400 mb-3">{floor.description}</p>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> {floor.duration}
                </span>
                <span className="font-bold text-amber-400">
                  {calculatedArea.toLocaleString('en-IN')} Sq.Ft
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Built-up Summary Badge */}
      <div className="asthiwar-card-elevated p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Built-Up Area</span>
          <div className="text-xl font-extrabold text-white">
            {totalBuiltup.toLocaleString('en-IN')} Sq.Ft
            <span className="text-xs font-normal text-slate-400 ml-2">
              ({formData.builtupAreaPerFloor} sqft × {currentFloor.floorsCount} floors + {formData.carParkingAreaSqft} sqft parking)
            </span>
          </div>
        </div>

        {isVolumeDiscount && (
          <div className="badge badge-gold self-start sm:self-center">
            <Sparkles className="w-3.5 h-3.5" /> Volume Discount (&gt;3,500 sqft) Unlocked!
          </div>
        )}
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
          <span>Choose Package</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
