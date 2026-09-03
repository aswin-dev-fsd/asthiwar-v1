import React, { useEffect, useState } from 'react';
import { Check, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import {
  EstimateFormState,
  PackageConfigResponse,
  SpecificationCategory,
  SpecificationItem,
  BrandOption,
} from '../../types';
import { getPackageConfig } from '../../services/api';

interface Step4Props {
  formData: EstimateFormState;
  onChange: (fields: Partial<EstimateFormState>) => void;
  onNext: () => void;
  onBack: () => void;
  packageConfig?: PackageConfigResponse | null;
}

export const Step4Customizations: React.FC<Step4Props> = ({
  formData,
  onChange,
  onNext,
  onBack,
  packageConfig,
}) => {
  const [config, setConfig] = useState<PackageConfigResponse | null>(packageConfig || null);
  const [loading, setLoading] = useState<boolean>(!packageConfig);

  // Auto-select package defaults when config loads
  useEffect(() => {
    if (config && formData.customizations.length === 0) {
      const defaults = config.specifications.flatMap((cat) =>
        cat.items
          .filter((item) => item.isCustomizable)
          .map((item) => {
            const defaultOpt = item.options.find((o) => o.isPackageDefault) || item.options[0];
            return { itemSlug: item.slug, optionSlug: defaultOpt?.slug || '' };
          })
          .filter((c) => c.optionSlug)
      );
      if (defaults.length > 0) {
        onChange({ customizations: defaults });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, formData.customizations.length]);

  useEffect(() => {
    if (packageConfig) {
      setConfig(packageConfig);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    getPackageConfig(formData.packageSlug)
      .then((data) => {
        if (isMounted) {
          setConfig(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load package config:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [formData.packageSlug, packageConfig]);

  const handleOptionChange = (itemSlug: string, optionSlug: string) => {
    const existing = formData.customizations.filter((c) => c.itemSlug !== itemSlug);
    onChange({
      customizations: [...existing, { itemSlug, optionSlug }],
    });
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-400 mx-auto mb-4" />
        <p className="text-sm text-slate-400">Loading package specifications...</p>
      </div>
    );
  }

  // Filter customizable items across categories
  const customizableItems: SpecificationItem[] =
    config?.specifications.flatMap((cat: SpecificationCategory) =>
      cat.items.filter((item: SpecificationItem) => item.isCustomizable && item.options.length > 1)
    ) || [];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-6">
        <span className="badge badge-gold mb-3">Step 3 of 5 • Material Customisations</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          Brand Upgrades & Specifications
        </h2>
        <p className="text-sm text-slate-400">
          Personalize materials and brand selections for structural and finishing works.
        </p>
      </div>

      {/* Brand Customizations List */}
      <div className="space-y-4 mb-8">
        {customizableItems.length === 0 ? (
          <div className="asthiwar-card text-center py-8 text-slate-400">
            No additional brand upgrades required for this tier. Standard inclusions apply.
          </div>
        ) : (
          customizableItems.map((item: SpecificationItem) => {
            const packageDefault = item.options.find(o => o.isPackageDefault) || item.options[0];
            const selectedOption =
              formData.customizations.find((c) => c.itemSlug === item.slug)?.optionSlug ||
              packageDefault?.slug;

            return (
              <div key={item.id} className="asthiwar-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-heading font-bold text-base text-white">{item.name}</h4>
                  <span className="text-xs text-slate-400">Included: {packageDefault?.brandName}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {item.options.map((opt: BrandOption) => {
                    const isSelected = selectedOption === opt.slug;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleOptionChange(item.slug, opt.slug)}
                        className={`p-3 rounded-xl border cursor-pointer text-left transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/10 text-white shadow-sm shadow-amber-500/10'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{opt.brandName}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <div className="text-[11px] font-semibold text-amber-400">
                          {opt.priceDelta > 0 
                            ? `+₹${opt.priceDelta.toLocaleString('en-IN')}${item.unit === 'fixed' || opt.priceType === 'fixed' ? '' : '/sqft'}` 
                            : opt.priceDelta < 0 
                              ? `-₹${Math.abs(opt.priceDelta).toLocaleString('en-IN')}${item.unit === 'fixed' || opt.priceType === 'fixed' ? '' : '/sqft'}` 
                              : 'Included'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
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
          <span>Back to Packages</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="btn btn-primary text-base py-3 px-6 shadow-lg shadow-amber-500/25 flex items-center gap-2"
        >
          <span>Continue to Add-Ons</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
