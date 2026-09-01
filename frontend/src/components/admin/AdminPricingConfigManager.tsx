import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Save,
  Loader2,
  CheckCircle2,
  Plus,
  X,
  CalendarClock,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import {
  getAdminPackageConfigs,
  updatePackagePrices,
  getAdminAddonConfigs,
  updateAddonVariantPrice,
  getAdminLocationConfigs,
  updateLocationMultiplier,
  createAdminLocation,
  getAdminMilestoneConfigs,
  updateAdminMilestones,
} from '../../services/adminApi';
import { MilestoneStageConfig } from '../../types';

const DEFAULT_MILESTONE_STAGES: MilestoneStageConfig[] = [
  { stageNumber: 1, stageName: 'Design & Approvals', percentage: 3, keyDeliverables: 'Soil test, floor plan, structural drawing, DTCP approval assistance', isActive: true },
  { stageNumber: 2, stageName: 'Earthwork & Excavation', percentage: 4, keyDeliverables: 'Foundation trenching, site leveling, anti-termite treatment', isActive: true },
  { stageNumber: 3, stageName: 'Foundation & Plinth', percentage: 15, keyDeliverables: 'Footing concrete, plinth beam, basement filling, PCC/RCC basement', isActive: true },
  { stageNumber: 4, stageName: 'RCC Structure (Columns & Slabs)', percentage: 22, keyDeliverables: 'Column casting, roof slab shuttering, beam reinforcement & curing', isActive: true },
  { stageNumber: 5, stageName: 'Brickwork & Masonry', percentage: 14, keyDeliverables: 'External & internal walls, lintels, parapet wall construction', isActive: true },
  { stageNumber: 6, stageName: 'Electrical & Plumbing Concealing', percentage: 8, keyDeliverables: 'Conduits, plumbing lines, switch boxes, drainage routing', isActive: true },
  { stageNumber: 7, stageName: 'Plastering (Internal & External)', percentage: 10, keyDeliverables: 'Ceiling plastering, wall leveling, exterior weather-coat plaster', isActive: true },
  { stageNumber: 8, stageName: 'Flooring & Wall Tiling', percentage: 11, keyDeliverables: 'Main vitrified tiles, bathroom tiling, kitchen granite countertop', isActive: true },
  { stageNumber: 9, stageName: 'Painting & Woodwork', percentage: 8, keyDeliverables: 'Putty, primer, emulsion coats, main door & internal door fixing', isActive: true },
  { stageNumber: 10, stageName: 'Fixtures, Finishing & Handover', percentage: 5, keyDeliverables: 'CP & sanitary fittings, switches, lights, glass railings, deep clean', isActive: true },
];

export const AdminPricingConfigManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'packages' | 'addons' | 'locations' | 'milestones'>('packages');
  const [packages, setPackages] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<MilestoneStageConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | number | null>(null);

  // Edit states for packages
  const [pkgEdit, setPkgEdit] = useState<Record<string, { std: number; vol: number; threshold: number; reason: string }>>({});
  // Edit states for addon variants
  const [addonEdit, setAddonEdit] = useState<Record<string, { price: number; reason: string }>>({});
  // Edit states for locations
  const [locEdit, setLocEdit] = useState<Record<number, string>>({});

  // New location form state
  const [showAddLocation, setShowAddLocation] = useState<boolean>(false);
  const [newLocName, setNewLocName] = useState<string>('');
  const [newLocSlug, setNewLocSlug] = useState<string>('');
  const [newLocMultiplier, setNewLocMultiplier] = useState<string>('1.00');
  const [isCreatingLoc, setIsCreatingLoc] = useState<boolean>(false);

  const fetchConfigs = () => {
    setLoading(true);
    Promise.all([
      getAdminPackageConfigs(),
      getAdminAddonConfigs(),
      getAdminLocationConfigs(),
      getAdminMilestoneConfigs(),
    ])
      .then(([pkgs, adds, locs, ms]) => {
        setPackages(pkgs);
        setAddons(adds);
        setLocations(locs);
        setMilestones(
          ms && ms.length > 0
            ? ms.map((m: any) => ({
                id: m.id,
                stageNumber: m.stageNumber,
                stageName: m.stageName,
                percentage: Number(m.percentage),
                keyDeliverables: m.keyDeliverables,
                isActive: m.isActive !== false,
              }))
            : DEFAULT_MILESTONE_STAGES
        );

        // Initialize edit states with active database values
        const pkgMap: any = {};
        pkgs.forEach((p) => {
          const std = p.activePrice?.pricePerSqft ?? p.pricePerSqft ?? p.standardPricePerSqft ?? 0;
          const vol = p.activePrice?.volumePricePerSqft ?? p.volumePricePerSqft ?? 0;
          const threshold = p.activePrice?.volumeDiscountThresholdSqft ?? p.volumeDiscountThresholdSqft ?? 3500;
          pkgMap[p.slug] = {
            std: Number(std),
            vol: Number(vol),
            threshold: Number(threshold),
            reason: '',
          };
        });
        setPkgEdit(pkgMap);

        const addMap: any = {};
        adds.forEach((a) => {
          const variantsList = a.variants || a.activePrices || [];
          variantsList.forEach((v: any) => {
            const vSlug = v.variantSlug || v.slug;
            addMap[`${a.slug}:${vSlug}`] = {
              price: Number(v.price ?? 0),
              reason: '',
            };
          });
        });
        setAddonEdit(addMap);

        const locMap: any = {};
        locs.forEach((l) => {
          locMap[l.id] = Number(l.priceMultiplier ?? 1.0);
        });
        setLocEdit(locMap);

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleMilestoneChange = (index: number, field: keyof MilestoneStageConfig, value: any) => {
    setMilestones((prev: MilestoneStageConfig[]) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: field === 'percentage' ? (parseFloat(value) || 0) : value,
      };
      return next;
    });
  };

  const handleResetMilestones = () => {
    if (window.confirm('Reset all milestone stages to the standard ASTHIWAR 10-stage defaults?')) {
      setMilestones(DEFAULT_MILESTONE_STAGES);
    }
  };

  const milestoneTotalPercentage = milestones
    .filter((m: MilestoneStageConfig) => m.isActive !== false)
    .reduce((acc: number, m: MilestoneStageConfig) => acc + (Number(m.percentage) || 0), 0);

  const isMilestonesValid = Math.abs(milestoneTotalPercentage - 100) < 0.01;

  const handleSaveMilestones = async () => {
    if (!isMilestonesValid) {
      alert(`Milestone percentages sum to ${milestoneTotalPercentage.toFixed(2)}%. They must equal exactly 100.00% to save.`);
      return;
    }
    setSavingId('milestones');
    try {
      await updateAdminMilestones(milestones);
      setSuccessMessage('10-Stage Milestone Payment Schedule updated successfully in PostgreSQL engine!');
      fetchConfigs();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err?.message || 'Failed to update milestone schedule');
    } finally {
      setSavingId(null);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleSavePackage = async (slug: string) => {
    const edit = pkgEdit[slug];
    if (!edit.reason.trim()) {
      alert('Please provide a reason for the pricing change (required for audit trail).');
      return;
    }
    setSavingId(slug);
    try {
      await updatePackagePrices(slug, {
        standardPricePerSqft: edit.std,
        volumePricePerSqft: edit.vol,
        volumeDiscountThresholdSqft: edit.threshold,
        changeReason: edit.reason,
      });
      setSuccessMessage(`Package ${slug.toUpperCase()} prices updated with versioned audit history!`);
      fetchConfigs();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err?.message || 'Failed to update package pricing');
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveAddonVariant = async (addonSlug: string, variantSlug: string) => {
    const key = `${addonSlug}:${variantSlug}`;
    const edit = addonEdit[key];
    if (!edit.reason.trim()) {
      alert('Please enter a change reason for the price update.');
      return;
    }
    setSavingId(key);
    try {
      await updateAddonVariantPrice(addonSlug, variantSlug, {
        price: edit.price,
        changeReason: edit.reason,
      });
      setSuccessMessage(`Addon variant ${variantSlug} rate updated with versioned audit history!`);
      fetchConfigs();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err?.message || 'Failed to update addon pricing');
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveLocation = async (id: number, name: string) => {
    const multiplier = locEdit[id];
    setSavingId(id);
    try {
      await updateLocationMultiplier(id, { priceMultiplier: multiplier });
      setSuccessMessage(`Location factor for ${name} updated to ${multiplier}x!`);
      fetchConfigs();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err?.message || 'Failed to update location multiplier');
    } finally {
      setSavingId(null);
    }
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim()) {
      alert('Please enter a city / location name.');
      return;
    }
    const slug = (newLocSlug.trim() || newLocName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')).replace(/^_+|_+$/g, '');
    const multiplier = parseFloat(newLocMultiplier) || 1.0;

    setIsCreatingLoc(true);
    try {
      await createAdminLocation({
        name: newLocName.trim(),
        slug,
        priceMultiplier: multiplier,
        sortOrder: locations.length + 1,
        isActive: true,
      });
      setSuccessMessage(`Location "${newLocName.trim()}" created successfully!`);
      setNewLocName('');
      setNewLocSlug('');
      setNewLocMultiplier('1.00');
      setShowAddLocation(false);
      fetchConfigs();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err?.message || 'Failed to create location');
    } finally {
      setIsCreatingLoc(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-2" />
        <p className="text-xs text-slate-400">Loading pricing matrices from Neon PostgreSQL...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-heading font-bold text-xl text-white">Pricing & Matrix Control Center</h3>
          <p className="text-xs text-slate-400">
            Immutable versioned pricing engine (Rule 7 & 8 compliant)
          </p>
        </div>

        {/* Tab Selector */}
        <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex gap-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'packages'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Package Rates ({packages.length})
          </button>
          <button
            onClick={() => setActiveTab('addons')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'addons'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            15 Add-Ons ({addons.length})
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'locations'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            City Factors ({locations.length})
          </button>
          <button
            onClick={() => setActiveTab('milestones')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'milestones'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Milestones ({milestones.length})
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tab 1: Package Pricing */}
      {activeTab === 'packages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {packages.map((pkg: any) => {
            const edit = pkgEdit[pkg.slug] || { std: 0, vol: 0, threshold: 3500, reason: '' };
            const isSaving = savingId === pkg.slug;

            return (
              <div key={pkg.slug} className="asthiwar-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-heading font-bold text-lg text-white capitalize">
                      {pkg.name} Tier
                    </h4>
                    <p className="text-xs text-amber-400 font-semibold">{pkg.tagline}</p>
                  </div>
                  <span className="badge badge-gold">Active Rate</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="form-group mb-0">
                    <label className="form-label text-[11px] h-9 flex flex-col justify-end pb-1">
                      <span className="text-slate-200">Standard Rate</span>
                      <span className="text-[10px] text-slate-500 font-normal">≤ {edit.threshold.toLocaleString('en-IN')} sq.ft</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">₹</span>
                      <input
                        type="number"
                        className="form-input pl-8 pr-2 font-bold text-amber-400"
                        value={edit.std}
                        onChange={(e) =>
                          setPkgEdit({
                            ...pkgEdit,
                            [pkg.slug]: { ...edit, std: parseFloat(e.target.value) || 0 },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group mb-0">
                    <label className="form-label text-[11px] h-9 flex flex-col justify-end pb-1">
                      <span className="text-slate-200">Volume Threshold</span>
                      <span className="text-[10px] text-amber-400/80 font-normal">Discount Trigger</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        className="form-input pl-3.5 pr-11 font-bold text-amber-400"
                        value={edit.threshold}
                        onChange={(e) =>
                          setPkgEdit({
                            ...pkgEdit,
                            [pkg.slug]: { ...edit, threshold: parseInt(e.target.value) || 0 },
                          })
                        }
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-semibold uppercase">sqft</span>
                    </div>
                  </div>

                  <div className="form-group mb-0">
                    <label className="form-label text-[11px] h-9 flex flex-col justify-end pb-1">
                      <span className="text-slate-200">Volume Rate</span>
                      <span className="text-[10px] text-emerald-400/90 font-normal">&gt; {edit.threshold.toLocaleString('en-IN')} sq.ft</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">₹</span>
                      <input
                        type="number"
                        className="form-input pl-8 pr-2 font-bold text-amber-400"
                        value={edit.vol}
                        onChange={(e) =>
                          setPkgEdit({
                            ...pkgEdit,
                            [pkg.slug]: { ...edit, vol: parseFloat(e.target.value) || 0 },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label text-[11px]">Audit Change Reason *</label>
                  <input
                    type="text"
                    placeholder="e.g. Q3 Cement & Steel Market Adjustment"
                    className="form-input text-xs"
                    value={edit.reason}
                    onChange={(e) =>
                      setPkgEdit({
                        ...pkgEdit,
                        [pkg.slug]: { ...edit, reason: e.target.value },
                      })
                    }
                  />
                </div>

                <button
                  onClick={() => handleSavePackage(pkg.slug)}
                  disabled={isSaving}
                  className="btn btn-primary w-full text-xs py-2.5"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Versioned Price...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Update {pkg.name} Pricing</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: 15 Add-Ons Pricing */}
      {activeTab === 'addons' && (
        <div className="space-y-4">
          {addons.map((addon: any) => (
            <div key={addon.slug} className="asthiwar-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-heading font-bold text-base text-white">{addon.name}</h4>
                  <p className="text-xs text-slate-400">{addon.description}</p>
                </div>
                <span className="badge badge-blue">{addon.pricingUnit}</span>
              </div>

              <div className="space-y-3 pt-2">
                {(addon.variants || addon.activePrices || []).map((v: any) => {
                  const vSlug = v.variantSlug || v.slug;
                  const key = `${addon.slug}:${vSlug}`;
                  const edit = addonEdit[key] || { price: 0, reason: '' };
                  const isSaving = savingId === key;

                  return (
                    <div
                      key={vSlug}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="sm:w-1/3">
                        <span className="font-bold text-white block">{v.variantName}</span>
                        <span className="text-[11px] text-slate-500">Tier: {v.packageTier}</span>
                      </div>

                      <div className="flex items-center gap-2 sm:w-1/4">
                        <span className="text-slate-400 font-semibold">₹</span>
                        <input
                          type="number"
                          className="form-input py-1 px-2 text-xs font-bold text-amber-400"
                          value={edit.price}
                          onChange={(e) =>
                            setAddonEdit({
                              ...addonEdit,
                              [key]: { ...edit, price: parseFloat(e.target.value) || 0 },
                            })
                          }
                        />
                      </div>

                      <div className="sm:w-1/3">
                        <input
                          type="text"
                          placeholder="Change reason..."
                          className="form-input py-1 px-2 text-xs"
                          value={edit.reason}
                          onChange={(e) =>
                            setAddonEdit({
                              ...addonEdit,
                              [key]: { ...edit, reason: e.target.value },
                            })
                          }
                        />
                      </div>

                      <button
                        onClick={() => handleSaveAddonVariant(addon.slug, v.variantSlug)}
                        disabled={isSaving}
                        className="btn btn-secondary text-xs py-1.5 px-3 self-end sm:self-auto"
                      >
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-amber-400" />}
                        <span>Save</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: City Multipliers */}
      {activeTab === 'locations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Configure cost multipliers per city/district across Tamil Nadu ({locations.length} locations).
            </p>
            <button
              onClick={() => setShowAddLocation(!showAddLocation)}
              className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              {showAddLocation ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-amber-400" />}
              <span>{showAddLocation ? 'Cancel' : 'Add Location'}</span>
            </button>
          </div>

          {showAddLocation && (
            <form
              onSubmit={handleCreateLocation}
              className="asthiwar-card p-5 border-amber-500/40 bg-slate-900/90 shadow-lg space-y-4 animate-fade-in"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Add New Location / City Factor</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label text-[11px]">City / Location Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Salem"
                    className="form-input text-xs"
                    value={newLocName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewLocName(val);
                      if (!newLocSlug || newLocSlug === newLocName.toLowerCase().replace(/[^a-z0-9]+/g, '_')) {
                        setNewLocSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '_'));
                      }
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label text-[11px]">Slug (Unique Identifier) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. salem"
                    className="form-input text-xs"
                    value={newLocSlug}
                    onChange={(e) => setNewLocSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_]+/g, ''))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label text-[11px]">Price Multiplier (0.50 - 2.00) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.5"
                    max="2.0"
                    required
                    className="form-input text-xs font-bold text-amber-400"
                    value={newLocMultiplier}
                    onChange={(e) => setNewLocMultiplier(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLocation(false)}
                  className="btn btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingLoc}
                  className="btn btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  {isCreatingLoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Create Location</span>
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {locations.map((loc: any) => {
              const multiplier = locEdit[loc.id] || loc.priceMultiplier;
              const isSaving = savingId === loc.id;

              return (
                <div key={loc.id} className="asthiwar-card p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-400" />
                      <h4 className="font-heading font-bold text-base text-white">{loc.name}</h4>
                    </div>
                    <span className="badge badge-gold">{multiplier}x Factor</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label text-[11px]">Price Multiplier</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.5"
                      max="2.0"
                      className="form-input text-xs font-bold text-amber-400"
                      value={multiplier}
                      onChange={(e) =>
                        setLocEdit({
                          ...locEdit,
                          [loc.id]: e.target.value,
                        })
                      }
                    />
                  </div>

                  <button
                    onClick={() => handleSaveLocation(loc.id, loc.name)}
                    disabled={isSaving}
                    className="btn btn-primary w-full text-xs py-2"
                  >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save Multiplier</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: 10-Stage Milestone Payment Schedule */}
      {activeTab === 'milestones' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Bar with Live Percentage Meter */}
          <div className="asthiwar-card p-6 bg-slate-900/90 border border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-amber-400" />
                  <h4 className="font-heading font-extrabold text-lg text-white">
                    Civil Construction Milestone Payment Schedule
                  </h4>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Define stage deliverables and payment milestone percentages. The engine balances zero-rounding and guarantees exact budget reconciliation on quotations & PDFs.
                </p>
              </div>

              {/* Validation Status & Action Buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                <div
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold ${
                    isMilestonesValid
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse'
                  }`}
                >
                  {isMilestonesValid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>
                    Total: {milestoneTotalPercentage.toFixed(2)}% {isMilestonesValid ? '• Valid 100%' : '• Must Equal 100%'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleResetMilestones}
                  className="btn btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
                  title="Reset to 10-Stage Standard Schedule"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveMilestones}
                  disabled={!isMilestonesValid || savingId === 'milestones'}
                  className="btn btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingId === 'milestones' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save Milestone Schedule</span>
                </button>
              </div>
            </div>

            {/* Percentage Visual Progress Bar */}
            <div className="mt-5">
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 flex">
                {milestones.map((m: MilestoneStageConfig, idx: number) => {
                  const colors = [
                    'bg-amber-500', 'bg-amber-400', 'bg-emerald-500', 'bg-emerald-400',
                    'bg-blue-500', 'bg-blue-400', 'bg-purple-500', 'bg-indigo-400',
                    'bg-rose-500', 'bg-teal-400'
                  ];
                  const color = colors[idx % colors.length];
                  return (
                    <div
                      key={m.stageNumber}
                      title={`Stage ${m.stageNumber}: ${m.stageName} (${m.percentage}%)`}
                      className={`${color} h-full transition-all duration-300 relative group cursor-pointer`}
                      style={{ width: `${Math.max(0, m.percentage)}%` }}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">
                <span>Stage 1 (Design)</span>
                <span>Stage 4 (Structure)</span>
                <span>Stage 7 (Plastering)</span>
                <span>Stage 10 (Handover)</span>
              </div>
            </div>
          </div>

          {/* Milestone Stages Table / Editor */}
          <div className="asthiwar-card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="p-4 font-semibold w-16 text-center">Stage #</th>
                    <th className="p-4 font-semibold w-64">Stage Name</th>
                    <th className="p-4 font-semibold w-32">Payment %</th>
                    <th className="p-4 font-semibold">Key Deliverables & Work Scope</th>
                    <th className="p-4 font-semibold w-40 text-right">₹50L Project Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {milestones.map((stage: MilestoneStageConfig, idx: number) => {
                    const shareAmount = Math.round(5000000 * (Number(stage.percentage || 0) / 100));

                    return (
                      <tr key={stage.stageNumber} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 text-center">
                          <span className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-amber-400 font-bold inline-flex items-center justify-center text-xs">
                            {stage.stageNumber}
                          </span>
                        </td>

                        <td className="p-4">
                          <input
                            type="text"
                            required
                            className="form-input text-xs font-bold text-white py-1.5 px-2.5"
                            value={stage.stageName}
                            onChange={(e) => handleMilestoneChange(idx, 'stageName', e.target.value)}
                            placeholder="e.g. Foundation & Plinth"
                          />
                        </td>

                        <td className="p-4">
                          <div className="relative">
                            <input
                              type="number"
                              required
                              step="0.5"
                              min="0.1"
                              max="100"
                              className="form-input text-xs font-bold text-amber-400 py-1.5 pl-2.5 pr-6"
                              value={stage.percentage}
                              onChange={(e) => handleMilestoneChange(idx, 'percentage', e.target.value)}
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">
                              %
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <input
                            type="text"
                            required
                            className="form-input text-xs text-slate-300 py-1.5 px-2.5"
                            value={stage.keyDeliverables}
                            onChange={(e) => handleMilestoneChange(idx, 'keyDeliverables', e.target.value)}
                            placeholder="e.g. Footing concrete, plinth beam, basement filling..."
                          />
                        </td>

                        <td className="p-4 text-right font-mono font-bold text-slate-300">
                          ₹{shareAmount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

