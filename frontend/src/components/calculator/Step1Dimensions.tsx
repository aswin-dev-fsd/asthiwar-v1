import React from 'react';
import { ArrowRight, Ruler, Car, ArrowLeft, Layers, AlertCircle, Building } from 'lucide-react';
import { EstimateFormState } from '../../types';

interface Step1Props {
  formData: EstimateFormState;
  onChange: (fields: Partial<EstimateFormState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PRESET_AREAS = [800, 1000, 1200, 1500, 1800, 2000, 2400, 3000];

// Removed FLOOR_OPTIONS

export const Step1Dimensions: React.FC<Step1Props> = ({
  formData,
  onChange,
  onNext,
  onBack,
}) => {
  // Convert plot area to equivalent sqft for display and boundary enforcement
  let plotSqft = formData.plotArea;
  if (formData.plotAreaUnit === 'cents') plotSqft = Math.round(formData.plotArea * 435.6);
  if (formData.plotAreaUnit === 'sqyards') plotSqft = Math.round(formData.plotArea * 9);
  if (formData.plotAreaUnit === 'sqm') plotSqft = Math.round(formData.plotArea * 10.764);

  const maxFootprint = Math.max(500, plotSqft > 0 ? plotSqft : 5000);
  const isFootprintExceeded = plotSqft > 0 && formData.builtupAreaPerFloor > plotSqft;

  const floorsCount = (formData.floorCount || 0) + 1;

  const visiblePresets = plotSqft > 0
    ? PRESET_AREAS.filter((area) => area <= plotSqft)
    : PRESET_AREAS;

  const handlePlotAreaChange = (val: number) => {
    let calculatedPlotSqft = val;
    if (formData.plotAreaUnit === 'cents') calculatedPlotSqft = Math.round(val * 435.6);
    if (formData.plotAreaUnit === 'sqyards') calculatedPlotSqft = Math.round(val * 9);
    if (formData.plotAreaUnit === 'sqm') calculatedPlotSqft = Math.round(val * 10.764);

    const updates: Partial<EstimateFormState> = { plotArea: val };
    if (calculatedPlotSqft > 0 && formData.builtupAreaPerFloor > calculatedPlotSqft) {
      updates.builtupAreaPerFloor = calculatedPlotSqft;
      
      // Update floorBreakdown array if it exceeds the new plot area
      if (formData.isVariableArea) {
        updates.floorBreakdown = formData.floorBreakdown.map(area => Math.min(area, calculatedPlotSqft));
      } else {
        updates.floorBreakdown = Array(floorsCount).fill(calculatedPlotSqft);
      }
    }
    onChange(updates);
  };

  const handleFloorCountChange = (aboveGroundCount: number) => {
    const newCount = aboveGroundCount + 1;
    let newBreakdown = [...formData.floorBreakdown];
    
    if (newCount > newBreakdown.length) {
      // Add more floors with the same area as the last floor (or base area)
      const lastArea = newBreakdown[newBreakdown.length - 1] || formData.builtupAreaPerFloor;
      const extraFloors = Array(newCount - newBreakdown.length).fill(lastArea);
      newBreakdown = [...newBreakdown, ...extraFloors];
    } else if (newCount < newBreakdown.length) {
      // Truncate the array
      newBreakdown = newBreakdown.slice(0, newCount);
    }
    
    onChange({ floorCount: aboveGroundCount, floorBreakdown: newBreakdown });
  };

  const handleVariableToggle = (isVar: boolean) => {
    let newBreakdown = [...formData.floorBreakdown];
    if (!isVar) {
      // Reset all floors to the base area
      newBreakdown = Array(floorsCount).fill(formData.builtupAreaPerFloor);
    }
    onChange({ isVariableArea: isVar, floorBreakdown: newBreakdown });
  };

  const handleFloorAreaChange = (index: number, area: number) => {
    const newBreakdown = [...formData.floorBreakdown];
    newBreakdown[index] = area;
    onChange({ floorBreakdown: newBreakdown });
  };

  // Helper function to calculate total built-up area
  const totalBuiltupArea = formData.isVariableArea 
    ? formData.floorBreakdown.reduce((sum, val) => sum + val, 0)
    : formData.builtupAreaPerFloor * floorsCount;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <span className="badge badge-gold mb-3">Step 2 of 4 • Dimensions & Floors</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          Dimensions & Floor Configuration
        </h2>
        <p className="text-sm text-slate-400">
          Specify your plot size, floor layout, and other areas.
        </p>
      </div>

      <div className="asthiwar-card space-y-6">
        {/* Plot Area & Unit */}
        <div>
          <label className="form-label flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-amber-400" /> Total Plot Area <span className="text-red-400">*</span>
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
                step="1"
                className="form-input text-lg font-bold"
                value={formData.plotArea || ''}
                onChange={(e) => handlePlotAreaChange(parseFloat(e.target.value) || 0)}
                placeholder="e.g. 2400"
              />
            </div>
            <div>
              <select
                className="form-select font-semibold"
                value={formData.plotAreaUnit}
                onChange={(e) => {
                  const newUnit = e.target.value as any;
                  let newPlotSqft = formData.plotArea;
                  if (newUnit === 'cents') newPlotSqft = Math.round(formData.plotArea * 435.6);
                  if (newUnit === 'sqyards') newPlotSqft = Math.round(formData.plotArea * 9);
                  if (newUnit === 'sqm') newPlotSqft = Math.round(formData.plotArea * 10.764);
                  
                  const updates: Partial<EstimateFormState> = { plotAreaUnit: newUnit };
                  if (newPlotSqft > 0 && formData.builtupAreaPerFloor > newPlotSqft) {
                     updates.builtupAreaPerFloor = newPlotSqft;
                     updates.floorBreakdown = formData.isVariableArea 
                        ? formData.floorBreakdown.map(area => Math.min(area, newPlotSqft))
                        : Array(floorsCount).fill(newPlotSqft);
                  }
                  onChange(updates);
                }}
              >
                <option value="sqft">Sq.Ft</option>
                <option value="cents">Cents</option>
                <option value="sqyards">Sq.Yards</option>
                <option value="sqm">Sq.Meter</option>
              </select>
            </div>
          </div>
        </div>

        {/* Floor Selection */}
        <div className="pt-4 border-t border-slate-800">
           <label className="form-label flex items-center gap-1.5 mb-3">
              <Building className="w-4 h-4 text-amber-400" /> Number of Floors <span className="text-red-400">*</span>
           </label>
           <div className="flex items-center gap-3">
             <div className="flex-1 bg-slate-900 border border-slate-700 rounded-xl flex items-center p-2">
               <span className="text-slate-400 font-semibold px-3 border-r border-slate-700">G +</span>
               <input
                 type="number"
                 min={0}
                 max={10}
                 value={formData.floorCount}
                 onChange={(e) => {
                   let val = parseInt(e.target.value, 10);
                   if (isNaN(val)) val = 0;
                   if (val < 0) val = 0;
                   if (val > 10) val = 10;
                   handleFloorCountChange(val);
                 }}
                 className="bg-transparent border-none focus:ring-0 text-white font-bold w-full text-center"
                 placeholder="0"
               />
             </div>
             <div className="flex-1 text-sm text-slate-400">
               {formData.floorCount === 0 ? 'Ground Only' : `Ground + ${formData.floorCount} Floors`}
             </div>
           </div>
        </div>

        {/* Built-up Area Configuration */}
        <div className="pt-4 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
            <label className="form-label flex items-center gap-1.5 mb-0">
              <Layers className="w-4 h-4 text-amber-400" /> Built-up Area <span className="text-red-400">*</span>
            </label>
            {floorsCount > 1 && (
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.isVariableArea}
                  onChange={(e) => handleVariableToggle(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/30 bg-slate-800"
                />
                Different Area Per Floor
              </label>
            )}
          </div>

          {!formData.isVariableArea ? (
            // Single Sliders (Same area for all floors)
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-300">Footprint Per Floor</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={100}
                    max={maxFootprint}
                    value={formData.builtupAreaPerFloor || ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      onChange({ 
                        builtupAreaPerFloor: val, 
                        floorBreakdown: Array(floorsCount).fill(val) 
                      });
                    }}
                    className="form-input text-lg font-extrabold text-amber-400 w-28 text-right py-1 px-2 h-auto"
                  />
                  <span className="text-amber-400 font-bold">Sq.Ft</span>
                </div>
              </div>
              <input
                type="range"
                min={400}
                max={maxFootprint}
                step={1}
                value={Math.min(formData.builtupAreaPerFloor, maxFootprint)}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  onChange({ 
                    builtupAreaPerFloor: val, 
                    floorBreakdown: Array(floorsCount).fill(val) 
                  });
                }}
                className="w-full mb-3"
              />
              {visiblePresets.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {visiblePresets.map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => onChange({ 
                        builtupAreaPerFloor: area,
                        floorBreakdown: Array(floorsCount).fill(area) 
                      })}
                      className={`text-[11px] px-2.5 py-1 rounded-md border font-semibold transition-all ${
                        formData.builtupAreaPerFloor === area
                          ? 'bg-amber-500 text-slate-950 border-amber-500'
                          : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {area.toLocaleString()} sqft
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Variable Inputs (Different Area Per Floor)
            <div className="space-y-3">
              {Array.from({ length: floorsCount }).map((_, i) => {
                const floorName = i === 0 ? 'Ground Floor' : `Floor ${i}`;
                const val = formData.floorBreakdown[i] || 0;
                return (
                  <div key={i} className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                    <span className="text-sm font-semibold text-slate-300 w-28">{floorName}</span>
                    <input
                      type="range"
                      min={100}
                      max={maxFootprint}
                      step={1}
                      value={Math.min(val, maxFootprint)}
                      onChange={(e) => handleFloorAreaChange(i, parseInt(e.target.value, 10))}
                      className="flex-1"
                    />
                    <div className="w-32 flex items-center justify-end gap-1.5">
                       <input
                         type="number"
                         min={100}
                         max={maxFootprint}
                         value={val || ''}
                         onChange={(e) => handleFloorAreaChange(i, parseInt(e.target.value, 10) || 0)}
                         className="form-input text-sm font-bold text-amber-400 w-20 text-right py-1 px-2 h-auto"
                       />
                       <span className="text-sm font-bold text-amber-400">Sq.Ft</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {isFootprintExceeded && (
            <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>A floor footprint cannot exceed the total plot area ({plotSqft.toLocaleString('en-IN')} Sq.Ft).</span>
            </div>
          )}
          
          <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Built-up Area:</span>
            <span className="text-base font-extrabold text-white">{totalBuiltupArea.toLocaleString()} Sq.Ft</span>
          </div>
        </div>

        {/* Other Areas (Car Parking, Head Room, Compound Wall, Gate) */}
        <div className="pt-4 border-t border-slate-800">
          <label className="form-label flex items-center gap-1.5 mb-3">
            <Car className="w-4 h-4 text-amber-400" /> Additional Areas (Sq.Ft) <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
               <span className="block text-xs font-semibold text-slate-400 mb-1.5">Car Parking Area (Sq.Ft)</span>
               <input
                  type="number"
                  min={0}
                  step={50}
                  className="form-input text-sm"
                  value={formData.carParkingAreaSqft || ''}
                  onChange={(e) => onChange({ carParkingAreaSqft: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g. 200"
               />
            </div>
            <div>
               <span className="block text-xs font-semibold text-slate-400 mb-1.5">Head Room Area (Sq.Ft)</span>
               <input
                  type="number"
                  min={0}
                  step={25}
                  className="form-input text-sm"
                  value={formData.headRoomAreaSqft || ''}
                  onChange={(e) => onChange({ headRoomAreaSqft: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g. 100"
               />
            </div>
            <div>
               <span className="block text-xs font-semibold text-slate-400 mb-1.5">Gate Area (Sq.Ft)</span>
               <input
                  type="number"
                  min={0}
                  step={10}
                  className="form-input text-sm"
                  value={formData.gateAreaSqft || ''}
                  onChange={(e) => onChange({ gateAreaSqft: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g. 80"
               />
            </div>
            <div>
               <div className="flex justify-between items-end mb-1.5">
                  <span className="block text-xs font-semibold text-slate-400">Compound Wall (R.Ft)</span>
               </div>
               <input
                  type="number"
                  min={0}
                  step={10}
                  className="form-input text-sm"
                  value={formData.compoundWallPerimeter || ''}
                  onChange={(e) => onChange({ compoundWallPerimeter: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g. 120"
               />
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button type="button" onClick={onBack} className="btn btn-secondary text-xs">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!formData.plotArea || isFootprintExceeded || totalBuiltupArea <= 0 || isNaN(formData.carParkingAreaSqft) || isNaN(formData.headRoomAreaSqft) || isNaN(formData.compoundWallPerimeter) || isNaN(formData.gateAreaSqft)}
            className="btn btn-primary text-xs"
          >
            <span>Select Package</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
