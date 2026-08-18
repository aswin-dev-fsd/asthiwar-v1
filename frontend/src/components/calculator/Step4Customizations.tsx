import React, { useEffect, useState } from 'react';
import { Check, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import {
  EstimateFormState,
  PackageConfigResponse,
  SpecificationCategory,
  SpecificationItem,
  BrandOption,
  AddonItem,
  AddonVariant,
} from '../../types';
import { getPackageConfig } from '../../services/api';

interface Step4Props {
  formData: EstimateFormState;
  onChange: (fields: Partial<EstimateFormState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step4Customizations: React.FC<Step4Props> = ({
  formData,
  onChange,
  onNext,
  onBack,
}) => {
  const [config, setConfig] = useState<PackageConfigResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'customizations' | 'addons'>('customizations');

  useEffect(() => {
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
  }, [formData.packageSlug]);

  const handleOptionChange = (itemSlug: string, optionSlug: string) => {
    const existing = formData.customizations.filter((c) => c.itemSlug !== itemSlug);
    onChange({
      customizations: [...existing, { itemSlug, optionSlug }],
    });
  };

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

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-400 mx-auto mb-4" />
        <p className="text-sm text-slate-400">Loading package specifications & 15 add-ons catalog...</p>
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
        <span className="badge badge-gold mb-3">Step 5 of 5 • Tailor & Upgrade</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          Brand Upgrades & Add-Ons Catalog
        </h2>
        <p className="text-sm text-slate-400">
          Personalize materials and select optional infrastructure add-ons.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex justify-center mb-6">
        <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('customizations')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'customizations'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Brand Customizations ({formData.customizations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('addons')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'addons'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            15 Add-Ons Catalog ({formData.addons.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Brand Customizations */}
      {activeTab === 'customizations' && (
        <div className="space-y-4 mb-8">
          {customizableItems.length === 0 ? (
            <div className="asthiwar-card text-center py-8 text-slate-400">
              No additional brand upgrades required for this tier. Standard inclusions apply.
            </div>
          ) : (
            customizableItems.map((item: SpecificationItem) => {
              const selectedOption =
                formData.customizations.find((c) => c.itemSlug === item.slug)?.optionSlug ||
                item.options[0]?.slug;

              return (
                <div key={item.id} className="asthiwar-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-heading font-bold text-base text-white">{item.name}</h4>
                    <span className="text-xs text-slate-400">Default: {item.options[0]?.brandName}</span>
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
                            {opt.priceDelta > 0 ? `+₹${opt.priceDelta}/sqft` : 'Included in Package'}
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
      )}

      {/* Tab 2: 15 Add-Ons Catalog */}
      {activeTab === 'addons' && (
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

                  {/* Quantity Slider if applicable */}
                  {isChecked && addon.pricingUnit === 'per_litre' && (
                    <div className="pt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Capacity / Volume:</span>
                        <span className="font-bold text-amber-400">
                          {selectedVariant?.quantity || 5000} Litres
                        </span>
                      </div>
                      <input
                        type="range"
                        min={3000}
                        max={15000}
                        step={1000}
                        value={selectedVariant?.quantity || 5000}
                        onChange={(e) => updateAddonQty(addon.slug, parseInt(e.target.value, 10))}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
          className="btn btn-primary text-base py-3 px-6 shadow-lg shadow-amber-500/25"
        >
          <span>Calculate Authoritative Estimate</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
