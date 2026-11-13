import React, { useState, useEffect } from 'react';
import { X, Check, DollarSign, ArrowRight, Sparkles, Plus, Minus } from 'lucide-react';
import { Subscriber, PlanPreset } from '../types';
import { formatMga } from '../utils/formatters';

interface RateChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscribers: Subscriber[]; // Can be single or multiple for batch update
  packages: PlanPreset[];
  onConfirmRateChange: (
    subscriberIds: number[],
    newRateMga: number,
    newDataGb?: number,
    logNote?: string
  ) => void;
}

export const RateChangeModal: React.FC<RateChangeModalProps> = ({
  isOpen,
  onClose,
  subscribers,
  packages,
  onConfirmRateChange,
}) => {
  const isMultiple = subscribers.length > 1;
  const firstSub = subscribers[0];

  const [rateMga, setRateMga] = useState<number>(firstSub?.monthlyRateMga || 60000);
  const [dataGb, setDataGb] = useState<number>(firstSub?.monthlyDataGb || 30);
  const [updateDataQuota, setUpdateDataQuota] = useState(false);
  const [logInHistory, setLogInHistory] = useState(true);
  const [reasonNote, setReasonNote] = useState('');

  useEffect(() => {
    if (firstSub) {
      setRateMga(firstSub.monthlyRateMga);
      setDataGb(firstSub.monthlyDataGb);
      setReasonNote('');
    }
  }, [firstSub, isOpen]);

  if (!isOpen || subscribers.length === 0) return null;

  const handleSelectPackage = (pkg: PlanPreset) => {
    setRateMga(pkg.rateMga);
    setDataGb(pkg.dataGb);
    setUpdateDataQuota(true);
    setReasonNote(`Switched to ${pkg.name} package`);
  };

  const handleAdjustRate = (delta: number) => {
    setRateMga((prev) => Math.max(0, prev + delta));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ids = subscribers.map((s) => s.id);
    onConfirmRateChange(
      ids,
      Number(rateMga) || 0,
      updateDataQuota ? Number(dataGb) : undefined,
      logInHistory ? reasonNote.trim() : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isMultiple
                ? `Update Rate for ${subscribers.length} Subscribers`
                : `Change Rate for ${firstSub.name}`}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              YWAM Land of Canaan Internet Subscription Rate
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current vs New comparison */}
          {!isMultiple && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block">Current Rate</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm tabular-nums">
                  {formatMga(firstSub.monthlyRateMga)}
                </span>
                <span className="text-[11px] text-slate-400 block font-mono">
                  {firstSub.monthlyDataGb} GB
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <div className="text-right">
                <span className="text-slate-500 block">New Rate</span>
                <span className="font-mono font-bold text-sky-700 dark:text-sky-400 text-sm tabular-nums">
                  {formatMga(rateMga)}
                </span>
                <span className="text-[11px] text-slate-400 block font-mono">
                  {updateDataQuota ? `${dataGb} GB` : `${firstSub.monthlyDataGb} GB (unchanged)`}
                </span>
              </div>
            </div>
          )}

          {/* Quick Package Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Standard Rate Package
            </label>
            <div className="grid grid-cols-2 gap-2">
              {packages.map((pkg) => (
                <button
                  type="button"
                  key={pkg.name}
                  onClick={() => handleSelectPackage(pkg)}
                  className={`p-2 text-left rounded-lg border text-xs transition-colors ${
                    rateMga === pkg.rateMga && (updateDataQuota ? dataGb === pkg.dataGb : true)
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="truncate">{pkg.name}</div>
                  <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {formatMga(pkg.rateMga)} · {pkg.dataGb}GB
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Rate Input & +/- Quick Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Monthly Rate (MGA) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="1000"
                value={rateMga}
                onChange={(e) => setRateMga(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-base font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-slate-900 dark:text-white"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                MGA
              </span>
            </div>

            {/* Quick Adjust Buttons */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400 mr-1">Quick adjust:</span>
              <button
                type="button"
                onClick={() => handleAdjustRate(-10000)}
                className="px-2 py-1 text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-mono"
              >
                -10k
              </button>
              <button
                type="button"
                onClick={() => handleAdjustRate(-5000)}
                className="px-2 py-1 text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-mono"
              >
                -5k
              </button>
              <button
                type="button"
                onClick={() => handleAdjustRate(5000)}
                className="px-2 py-1 text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-mono"
              >
                +5k
              </button>
              <button
                type="button"
                onClick={() => handleAdjustRate(10000)}
                className="px-2 py-1 text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-mono"
              >
                +10k
              </button>
            </div>
          </div>

          {/* Also Update Data Quota Toggle */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={updateDataQuota}
                onChange={(e) => setUpdateDataQuota(e.target.checked)}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-4 h-4"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Also adjust Monthly Data Quota (GB)
              </span>
            </label>

            {updateDataQuota && (
              <div className="pl-6">
                <div className="relative max-w-xs">
                  <input
                    type="number"
                    min="1"
                    value={dataGb}
                    onChange={(e) => setDataGb(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    GB
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Log in notes / history */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reason / Observation Note (Optional)
            </label>
            <input
              type="text"
              value={reasonNote}
              onChange={(e) => setReasonNote(e.target.value)}
              placeholder="e.g. Rate updated per base leadership decision"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Apply New Rate</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
