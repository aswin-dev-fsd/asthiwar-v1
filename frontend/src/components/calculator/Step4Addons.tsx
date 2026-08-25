import React, { useEffect, useState } from 'react';
import { Check, ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import {
  EstimateFormState,
  PackageConfigResponse,
  AddonItem,
  AddonVariant,
} from '../../types';
import { getPackageConfig } from '../../services/api';

interface Step4AddonsProps {
  formData: EstimateFormState;
  onChange: (fields: Partial<EstimateFormState>) => void;
  onNext: () => void;
  onBack: () => void;
  packageConfig?: PackageConfigResponse | null;
}

export const Step4Addons: React.FC<Step4AddonsProps> = ({
  formData,
  onChange,
  onNext,
  onBack,
  packageConfig,
}) => {
  const [config, setConfig] = useState<PackageConfigResponse | null>(packageConfig || null);
  const [loading, setLoading] = useState<boolean>(!packageConfig);

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
        console.error('Failed to load add-ons config:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [formData.packageSlug, packageConfig]);

  const toggleAddon = (addonSlug: string, variantSlug: string, defaultQty: number = 1) => {
    const exists = formData.addons.some((a) => a.addonSlug === addonSlug && a.variantSlug === variantSlug);
    if (exists) {
      onChange({
        addons: formData.addons.filter((a) => !(a.addonSlug === addonSlug && a.variantSlug === variantSlug)),
      });
    } else {
      // Remove any other variant of the same addon
      const filtered = formData.addons.filter((a) => a.addonSlug !== addonSlug);
      onChange({
        addons: [...filtered, { addonSlug, variantSlug, quantity: defaultQty }],
      });
    }
  };

  const updateAddonQty = (addonSlug: string, qty: number) => {
    onChange({
      addons: formData.addons.map((a) => (a.addonSlug === addonSlug ? { ...a, quantity: qty } : a)),
    });
  };

  // Compute live total investment of selected add-ons
  const totalSelectedAddonsCost = formData.addons.reduce((acc, selected) => {
    const addon = config?.addons.find((a) => a.slug === selected.addonSlug);
    const variant = addon?.variants.find((v) => v.variantSlug === selected.variantSlug);
    if (!variant || variant.price <= 0) return acc;
    const qty = selected.quantity || (addon?.defaultQuantity ? Number(addon.defaultQuantity) : 1);
    return acc + Math.round(variant.price * qty);
  }, 0);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-400 mx-auto mb-4" />
        <p className="text-sm text-slate-400">Loading 15 add-ons catalog...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-6">
        <span className="badge badge-gold mb-3">Step 4 of 5 • Additional Add-Ons</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          15 Add-Ons & Infrastructure Catalog
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Elevate your home with sustainable energy, water management, perimeter security, and luxury convenience systems.
        </p>
      </div>

      {/* Selected Add-Ons Live Summary Bar */}
      <div className="asthiwar-card p-4 mb-6 bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">
              {formData.addons.length === 0
                ? 'No Add-Ons Selected (Optional)'
                : `${formData.addons.length} Add-On${formData.addons.length > 1 ? 's' : ''} Selected`}
            </div>
            <div className="text-[11px] text-slate-400">
              {formData.addons.length === 0
                ? 'Select any items below or click continue to skip.'
                : 'Added to your customized civil construction estimate.'}
            </div>
          </div>
        </div>

        <div className="text-right sm:border-l sm:border-slate-800 sm:pl-5">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
            Add-Ons Investment
          </div>
          <div className="text-lg font-mono font-extrabold text-amber-400">
            ₹{totalSelectedAddonsCost.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* 15 Add-Ons Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {config?.addons.map((addon: AddonItem) => {
          const selectedVariant = formData.addons.find((a) => a.addonSlug === addon.slug);
          const isChecked = Boolean(selectedVariant);

          return (
            <div
              key={addon.id}
              className={`asthiwar-card p-5 transition-all ${
                isChecked
                  ? 'border-amber-500/80 bg-slate-900/90 shadow-md shadow-amber-500/10'
                  : 'border-slate-800 bg-slate-900/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-heading font-bold text-sm text-white">{addon.name}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{addon.description}</p>
                </div>
                <span className="badge badge-gold shrink-0">{addon.pricingUnit.replace(/_/g, ' ')}</span>
              </div>

              {/* Variants Selection */}
              <div className="space-y-2 mt-3 pt-3 border-t border-slate-800/80">
                {addon.variants.map((v: AddonVariant) => {
                  const isVariantSelected = selectedVariant?.variantSlug === v.variantSlug;
                  const defaultQty = addon.defaultQuantity
                    ? parseFloat(addon.defaultQuantity.toString())
                    : 1;

                  return (
                    <div
                      key={v.id}
                      onClick={() => toggleAddon(addon.slug, v.variantSlug, defaultQty)}
                      className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between text-xs transition-all ${
                        isVariantSelected
                          ? 'border-amber-500 bg-amber-500/10 text-white font-semibold'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center ${
                            isVariantSelected ? 'bg-amber-500 text-slate-950' : 'border border-slate-700'
                          }`}
                        >
                          {isVariantSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{v.variantName}</span>
                      </div>
                      <span className="text-amber-400 font-bold">
                        {v.price > 0 ? `₹${v.price.toLocaleString('en-IN')}` : 'Custom Quote'}
                      </span>
                    </div>
                  );
                })}

                {/* Quantity and Calculations for non-fixed addons */}
                {isChecked && (
                  <div className="pt-3 mt-2 border-t border-slate-800/50 space-y-2">
                    {addon.pricingUnit === 'per_litre' && (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Capacity / Volume:</span>
                          <span className="font-bold text-amber-400">
                            {(selectedVariant?.quantity || Number(addon.defaultQuantity || 5000)).toLocaleString()} Litres
                          </span>
                        </div>
                        <input
                          type="range"
                          min={Number(addon.minQuantity || 3000)}
                          max={Number(addon.maxQuantity || 15000)}
                          step={1000}
                          value={selectedVariant?.quantity || Number(addon.defaultQuantity || 5000)}
                          onChange={(e) => updateAddonQty(addon.slug, parseInt(e.target.value, 10))}
                          className="w-full"
                        />
                      </div>
                    )}

                    {addon.pricingUnit === 'per_rft' && (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-400">Total Length (R.Ft):</span>
                        <input
                          type="number"
                          min={Number(addon.minQuantity || 1)}
                          max={Number(addon.maxQuantity || 999)}
                          value={selectedVariant?.quantity || Number(addon.defaultQuantity || 1)}
                          onChange={(e) => updateAddonQty(addon.slug, parseInt(e.target.value, 10) || 0)}
                          className="form-input text-xs font-bold text-amber-400 w-24 text-right py-1 px-2 h-auto"
                        />
                      </div>
                    )}

                    {addon.pricingUnit === 'per_sqft_gate' && (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-400">Gate Area (Sq.Ft):</span>
                        <input
                          type="number"
                          min={Number(addon.minQuantity || 1)}
                          max={Number(addon.maxQuantity || 500)}
                          value={selectedVariant?.quantity || Number(addon.defaultQuantity || 1)}
                          onChange={(e) => updateAddonQty(addon.slug, parseInt(e.target.value, 10) || 0)}
                          className="form-input text-xs font-bold text-amber-400 w-24 text-right py-1 px-2 h-auto"
                        />
                      </div>
                    )}

                    {addon.pricingUnit === 'per_sqft_terrace' && (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-400">Terrace Area (Sq.Ft):</span>
                        <input
                          type="number"
                          min={Number(addon.minQuantity || 1)}
                          max={Number(addon.maxQuantity || 10000)}
                          value={selectedVariant?.quantity || Number(addon.defaultQuantity || 1)}
                          onChange={(e) => updateAddonQty(addon.slug, parseInt(e.target.value, 10) || 0)}
                          className="form-input text-xs font-bold text-amber-400 w-24 text-right py-1 px-2 h-auto"
                        />
                      </div>
                    )}

                    {/* Real-time Calculation Details */}
                    {(() => {
                      const activeVariant = addon.variants.find((v) => v.variantSlug === selectedVariant?.variantSlug);
                      if (!activeVariant || addon.pricingUnit === 'fixed') return null;
                      const qty = selectedVariant?.quantity || Number(addon.defaultQuantity || 1);
                      const total = Math.round(activeVariant.price * qty);
                      return (
                        <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded text-[11px] text-slate-400 mt-2">
                          <span>Calculated Cost:</span>
                          <span className="font-semibold text-white">
                            {qty.toLocaleString()} × ₹{activeVariant.price.toLocaleString('en-IN')} = <span className="text-amber-400">₹{total.toLocaleString('en-IN')}</span>
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
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
          <span>Back to Customisations</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="btn btn-primary text-base py-3 px-6 shadow-lg shadow-amber-500/25 flex items-center gap-2"
        >
          <span>Continue to Contact Details</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
