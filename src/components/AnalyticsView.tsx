import React from 'react';
import { 
  PieChart, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Wifi, 
  DollarSign, 
  History, 
  Download, 
  RotateCcw,
  Tag,
  Edit2
} from 'lucide-react';
import { Subscriber, PlanPreset } from '../types';
import { formatMga } from '../utils/formatters';

interface AnalyticsViewProps {
  subscribers: Subscriber[];
  packages: PlanPreset[];
  onOpenManageRates: () => void;
  onExportCsv: () => void;
  onResetData: () => void;
  onSelectSubscriberForHistory: (subscriber: Subscriber) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  subscribers,
  packages,
  onOpenManageRates,
  onExportCsv,
  onResetData,
  onSelectSubscriberForHistory,
}) => {
  const totalCount = subscribers.length;
  const totalDataGb = subscribers.reduce((acc, s) => acc + (s.monthlyDataGb || 0), 0);
  const totalRevenueMga = subscribers.reduce((acc, s) => acc + (s.monthlyRateMga || 0), 0);

  // Group by category
  const categories: Record<string, { count: number; dataGb: number; revenueMga: number }> = {};
  subscribers.forEach((s) => {
    const cat = s.category || 'Other';
    if (!categories[cat]) {
      categories[cat] = { count: 0, dataGb: 0, revenueMga: 0 };
    }
    categories[cat].count += 1;
    categories[cat].dataGb += s.monthlyDataGb || 0;
    categories[cat].revenueMga += s.monthlyRateMga || 0;
  });

  // Calculate all historical payments across all subscribers
  let totalHistoricalRecords = 0;
  let totalHistoricalRevenueMga = 0;
  subscribers.forEach((s) => {
    if (s.history) {
      totalHistoricalRecords += s.history.length;
      totalHistoricalRevenueMga += s.history.reduce(
        (sum, h) => sum + (h.paymentDate ? h.monthlyRateMga : 0),
        0
      );
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Network Analytics & Departmental Allocations
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Overview of bandwidth quotas, monthly rates (MGA), and subscriber groups at YWAM Canaan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenManageRates}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Tag className="w-4 h-4" />
            <span>Manage Rate Packages</span>
          </button>
          <button
            onClick={onExportCsv}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm('Reset database back to initial sample records? Any unsaved edits will be refreshed.')) {
                onResetData();
              }
            }}
            className="px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Rate Packages Card */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Standard Rate Packages ({packages.length})
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              These rates appear in the subscriber editor and can be adjusted anytime.
            </p>
          </div>
          <button
            onClick={onOpenManageRates}
            className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Package Rates</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {packages.map((pkg) => {
            const count = subscribers.filter((s) => s.monthlyRateMga === pkg.rateMga).length;
            return (
              <div
                key={pkg.name}
                onClick={onOpenManageRates}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 cursor-pointer hover:border-sky-400 dark:hover:border-sky-600 transition-all"
              >
                <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                  {pkg.name}
                </div>
                <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
                  {formatMga(pkg.rateMga)}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {pkg.dataGb} GB quota
                </div>
                <div className="text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                  {count} subscriber{count === 1 ? '' : 's'} on rate
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Category Breakdown & Historical Ledger */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Table */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">
            Subscribers by Department & Ministry
          </h4>
          <div className="space-y-3">
            {Object.entries(categories).map(([catName, stats]) => {
              const countPercent = totalCount > 0 ? Math.round((stats.count / totalCount) * 100) : 0;
              const dataPercent = totalDataGb > 0 ? Math.round((stats.dataGb / totalDataGb) * 100) : 0;

              return (
                <div key={catName} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-baseline text-xs mb-1">
                    <span className="font-semibold text-slate-900 dark:text-white">{catName}</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">
                      {stats.count} users ({countPercent}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-600 h-full rounded-full transition-all"
                      style={{ width: `${dataPercent}%` }}
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>{stats.dataGb} GB quota ({dataPercent}%)</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{formatMga(stats.revenueMga)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Historical Dues & Quick Subscriber Access */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
              Historical Ledger & Past Rates Log
            </h4>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500">Archived Monthly Records</span>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                  {totalHistoricalRecords}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Logged past billing cycles</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500">Past Settled Volume</span>
                <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1">
                  {formatMga(totalHistoricalRevenueMga)}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Total archived collection</div>
              </div>
            </div>

            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Subscriber History Quick-View:
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-52 overflow-y-auto">
              {subscribers.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => onSelectSubscriberForHistory(sub)}
                  className="py-2 px-2 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer rounded transition-colors"
                >
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">{sub.name}</span>
                    <span className="text-slate-400 ml-2 font-mono text-[11px]">N°{sub.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px] font-mono">
                      {(sub.history || []).length} past cycles
                    </span>
                    <span className="text-sky-600 dark:text-sky-400 text-xs font-medium">View &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
