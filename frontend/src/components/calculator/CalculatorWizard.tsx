import React, { useState, useEffect } from 'react';
import {
  User,
  Ruler,
  Package as PackageIcon,
  Sliders,
  FileText,
  Loader2,
} from 'lucide-react';
import { Location, Package, EstimateFormState, CalculationResult } from '../../types';
import { getLocations, getPackages, createAuthoritativeEstimate } from '../../services/api';
import { Step0LeadCapture } from './Step0LeadCapture';
import { Step1Dimensions } from './Step1Dimensions';
import { Step3Packages } from './Step3Packages';
import { Step4Customizations } from './Step4Customizations';
import { Step5EstimateReport } from './Step5EstimateReport';

const INITIAL_FORM_STATE: EstimateFormState = {
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  plotLocation: '',
  plotArea: 2400,
  plotAreaUnit: 'sqft',
  builtupAreaPerFloor: 1500,
  carParkingAreaSqft: 200,
  
  isVariableArea: false,
  floorBreakdown: [1500],
  headRoomAreaSqft: 0,
  compoundWallPerimeter: 0,
  gateAreaSqft: 0,

  // Step 2: Floors
  floorCount: 0,
  packageSlug: 'standard',
  customizations: [],
  addons: [],
};

const STEP_LABELS = [
  { step: 0, label: 'Dimensions', icon: Ruler },
  { step: 1, label: 'Package', icon: PackageIcon },
  { step: 2, label: 'Customise', icon: Sliders },
  { step: 3, label: 'Details', icon: User },
  { step: 4, label: 'Estimate', icon: FileText },
];

export const CalculatorWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [formData, setFormData] = useState<EstimateFormState>(INITIAL_FORM_STATE);
  const [locations, setLocations] = useState<Location[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [calculating, setCalculating] = useState<boolean>(false);
  const [estimateResult, setEstimateResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getLocations(), getPackages()])
      .then(([locs, pkgs]) => {
        setLocations(locs);
        setPackages(pkgs);
        if (locs.length > 0) {
          setFormData((prev) => ({ ...prev, plotLocation: locs[0].name }));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load initial calculator data. Please check backend connection.');
        setLoading(false);
      });
  }, []);

  const handleUpdateForm = (fields: Partial<EstimateFormState>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleFinalCalculate = async () => {
    setCalculating(true);
    setError(null);
    try {
      const result = await createAuthoritativeEstimate(formData);
      setEstimateResult(result);
      setCurrentStep(5);
      setCalculating(false);
    } catch (err: any) {
      setError(err?.message || 'Calculation error occurred.');
      setCalculating(false);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_STATE);
    setEstimateResult(null);
    setCurrentStep(0);
  };

  if (loading) {
    return (
      <div className="py-32 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-amber-400 mx-auto mb-4" />
        <h3 className="font-heading font-bold text-lg text-white mb-1">Loading ASTHIWAR Engine</h3>
        <p className="text-xs text-slate-400">Fetching live package rates and Tamil Nadu city multipliers...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Stepper Progress Bar */}
      {currentStep < 4 && (
        <div className="max-w-2xl mx-auto mb-10">
          <div className="grid grid-cols-4 gap-2 text-center">
            {STEP_LABELS.slice(0, 4).map((s) => {
              const Icon = s.icon;
              const isCompleted = currentStep > s.step;
              const isActive = currentStep === s.step;

              return (
                <div key={s.step} className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all mb-1.5 ${
                      isCompleted
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : isActive
                        ? 'bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 shadow-lg shadow-amber-500/30 scale-105'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[11px] font-semibold ${
                      isActive ? 'text-amber-400 font-bold' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Line Bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="max-w-xl mx-auto mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Calculating Loading Overlay */}
      {calculating ? (
        <div className="py-24 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-400 mx-auto mb-4" />
          <h3 className="font-heading font-bold text-xl text-white mb-2">
            Computing Authoritative Estimate...
          </h3>
          <p className="text-xs text-slate-400">
            Applying location factors, brand deltas, volume rules, and generating 10-stage milestones.
          </p>
        </div>
      ) : (
        <>
          {currentStep === 0 && (
            <Step1Dimensions
              formData={formData}
              onChange={handleUpdateForm}
              onNext={() => setCurrentStep(1)}
              onBack={() => {}}
            />
          )}

          {currentStep === 1 && (
            <Step3Packages
              formData={formData}
              packages={packages}
              onChange={handleUpdateForm}
              onNext={() => setCurrentStep(2)}
              onBack={() => setCurrentStep(0)}
            />
          )}

          {currentStep === 2 && (
            <Step4Customizations
              formData={formData}
              onChange={handleUpdateForm}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <Step0LeadCapture
              formData={formData}
              locations={locations}
              onChange={handleUpdateForm}
              onNext={handleFinalCalculate}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && estimateResult && (
            <Step5EstimateReport result={estimateResult} onReset={handleReset} />
          )}
        </>
      )}
    </div>
  );
};
