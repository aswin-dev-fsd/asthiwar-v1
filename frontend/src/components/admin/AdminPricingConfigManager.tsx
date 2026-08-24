import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Save,
  Loader2,
  CheckCircle2,
  Plus,
  X,
} from 'lucide-react';
import {
  getAdminPackageConfigs,
  updatePackagePrices,
  getAdminAddonConfigs,
  updateAddonVariantPrice,
  getAdminLocationConfigs,
  updateLocationMultiplier,
  createAdminLocation,
} from '../../services/adminApi';

export const AdminPricingConfigManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'packages' | 'addons' | 'locations'>('packages');
  const [packages, setPackages] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | number | null>(null);

  // Edit states for packages
  const [pkgEdit, setPkgEdit] = useState<Record<string, { std: number; vol: number; reason: string }>>({});
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
    ])
      .then(([pkgs, adds, locs]) => {
        setPackages(pkgs);
        setAddons(adds);
        setLocations(locs);

        // Initialize edit states with active database values
        const pkgMap: any = {};
        pkgs.forEach((p) => {
          const std = p.activePrice?.pricePerSqft ?? p.pricePerSqft ?? p.standardPricePerSqft ?? 0;
          const vol = p.activePrice?.volumePricePerSqft ?? p.volumePricePerSqft ?? 0;
          pkgMap[p.slug] = {
            std: Number(std),
            vol: Number(vol),
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
            const edit = pkgEdit[pkg.slug] || { std: 0, vol: 0, reason: '' };
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label text-[11px]">
                      Standard Rate (≤ 3,500 sqft)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">₹</span>
                      <input
                        type="number"
                        className="form-input pl-7 font-bold text-amber-400"
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

                  <div className="form-group">
                    <label className="form-label text-[11px]">
                      Volume Rate (&gt; 3,500 sqft)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">₹</span>
                      <input
                        type="number"
                        className="form-input pl-7 font-bold text-amber-400"
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
    </div>
  );
};
