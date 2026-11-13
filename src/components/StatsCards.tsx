import React from 'react';
import { Subscriber } from '../types';
import { formatMga } from '../utils/formatters';

interface StatsCardsProps {
  subscribers: Subscriber[];
  onFilterStatus?: (status: 'all' | 'paid' | 'pending' | 'overdue') => void;
  activeStatusFilter?: string;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  subscribers,
  onFilterStatus,
  activeStatusFilter,
}) => {
  const totalCount = subscribers.length;
  const totalDataGb = subscribers.reduce((acc, s) => acc + (s.monthlyDataGb || 0), 0);
  const totalRevenueMga = subscribers.reduce((acc, s) => acc + (s.monthlyRateMga || 0), 0);

  const paidSubscribers = subscribers.filter((s) => s.status === 'paid');
  const paidCount = paidSubscribers.length;
  const collectedMga = paidSubscribers.reduce((acc, s) => acc + (s.monthlyRateMga || 0), 0);

  const pendingSubscribers = subscribers.filter((s) => s.status === 'pending');
  const pendingCount = pendingSubscribers.length;
  const pendingMga = pendingSubscribers.reduce((acc, s) => acc + (s.monthlyRateMga || 0), 0);

  const overdueSubscribers = subscribers.filter((s) => s.status === 'overdue');
  const overdueCount = overdueSubscribers.length;
  const overdueMga = overdueSubscribers.reduce((acc, s) => acc + (s.monthlyRateMga || 0), 0);

  const collectionPercent = totalRevenueMga > 0 ? Math.round((collectedMga / totalRevenueMga) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Metric 1: Total Active Subscriptions */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus('all')}
        className={`p-4 rounded-xl border transition-all cursor-pointer ${
          activeStatusFilter === 'all'
            ? 'bg-sky-50/50 dark:bg-sky-950/30 border-sky-300 dark:border-sky-800 ring-1 ring-sky-300 dark:ring-sky-800'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Subscribers</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">N=1 to {totalCount}</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
            {totalCount}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            active lines
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <span className="font-mono tabular-nums font-medium text-slate-700 dark:text-slate-300">{totalDataGb} GB</span>
          <span>allocated bandwidth</span>
        </div>
      </div>

      {/* Metric 2: Monthly Expected Revenue */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Monthly Expected Dues</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">MGA</span>
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
            {formatMga(totalRevenueMga)}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Target subscription volume
        </div>
      </div>

      {/* Metric 3: Collected Revenue */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus('paid')}
        className={`p-4 rounded-xl border transition-all cursor-pointer ${
          activeStatusFilter === 'paid'
            ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 ring-1 ring-emerald-300 dark:ring-emerald-800'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Paid & Collected</span>
          <span className="text-[11px] font-mono font-medium text-emerald-700 dark:text-emerald-400">{collectionPercent}% paid</span>
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400 font-mono tabular-nums">
            {formatMga(collectedMga)}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <span className="font-mono tabular-nums font-medium text-slate-700 dark:text-slate-300">{paidCount}</span>
          <span>subscribers settled</span>
        </div>
      </div>

      {/* Metric 4: Outstanding & Overdue */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus(overdueCount > 0 ? 'overdue' : 'pending')}
        className={`p-4 rounded-xl border transition-all cursor-pointer ${
          activeStatusFilter === 'overdue' || activeStatusFilter === 'pending'
            ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 ring-1 ring-amber-300 dark:ring-amber-800'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending / Overdue</span>
          <span className="text-[11px] text-amber-600 dark:text-amber-400">
            {pendingCount} pending · {overdueCount} overdue
          </span>
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold tracking-tight text-amber-700 dark:text-amber-400 font-mono tabular-nums">
            {formatMga(pendingMga + overdueMga)}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Awaiting base collection
        </div>
      </div>
    </div>
  );
};
