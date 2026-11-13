import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  AlertTriangle,
  Edit3, 
  Trash2, 
  Receipt, 
  Plus, 
  FileSpreadsheet,
  Phone,
  Filter,
  History,
  Bell,
  DollarSign
} from 'lucide-react';
import { Subscriber, PaymentStatus, SubscriberCategory } from '../types';
import { formatMga, formatDate, calculateNextDueDate } from '../utils/formatters';

interface SubscriberTableProps {
  subscribers: Subscriber[];
  onAddSubscriber: () => void;
  onEditSubscriber: (subscriber: Subscriber) => void;
  onDeleteSubscriber: (id: number) => void;
  onQuickPay: (subscriber: Subscriber) => void;
  onViewReceipt: (subscriber: Subscriber) => void;
  onViewHistory: (subscriber: Subscriber) => void;
  onSendReminder: (subscriber: Subscriber) => void;
  onQuickEditRate: (subscriber: Subscriber) => void;
  onBatchChangeRates: (selectedSubs: Subscriber[]) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

type SortField = 'id' | 'name' | 'subscriptionDate' | 'monthlyDataGb' | 'monthlyRateMga' | 'paymentDate' | 'status';
type SortOrder = 'asc' | 'desc';

export const SubscriberTable: React.FC<SubscriberTableProps> = ({
  subscribers,
  onAddSubscriber,
  onEditSubscriber,
  onDeleteSubscriber,
  onQuickPay,
  onViewReceipt,
  onViewHistory,
  onSendReminder,
  onQuickEditRate,
  onBatchChangeRates,
  statusFilter,
  onStatusFilterChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Toggle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter & Sort
  const filteredSubscribers = useMemo(() => {
    return subscribers
      .filter((sub) => {
        // Status filter
        if (statusFilter !== 'all') {
          if (statusFilter === 'due_soon') {
            if (sub.status !== 'due_soon') return false;
          } else if (sub.status !== statusFilter) {
            return false;
          }
        }
        // Category filter
        if (categoryFilter !== 'all' && sub.category !== categoryFilter) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = sub.name.toLowerCase().includes(q);
          const matchObs = (sub.observation || '').toLowerCase().includes(q);
          const matchId = String(sub.id).includes(q);
          const matchPhone = (sub.phone || '').toLowerCase().includes(q);
          const matchCategory = (sub.category || '').toLowerCase().includes(q);
          return matchName || matchObs || matchId || matchPhone || matchCategory;
        }
        return true;
      })
      .sort((a, b) => {
        let valA: string | number | null = a[sortField];
        let valB: string | number | null = b[sortField];

        if (valA === null || valA === undefined) valA = '';
        if (valB === null || valB === undefined) valB = '';

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }

        const comp = String(valA).localeCompare(String(valB));
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [subscribers, statusFilter, categoryFilter, searchQuery, sortField, sortOrder]);

  // Handle select all
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredSubscribers.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
      {/* Control Bar: Search & Filters */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by subscriber name, room, observation, phone..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Controls: Functional Segmented Buttons & Dropdown */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-xs font-medium">
            <button
              onClick={() => onStatusFilterChange('all')}
              className={`px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({subscribers.length})
            </button>
            <button
              onClick={() => onStatusFilterChange('paid')}
              className={`px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                statusFilter === 'paid'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => onStatusFilterChange('due_soon')}
              className={`px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                statusFilter === 'due_soon'
                  ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Due Soon
            </button>
            <button
              onClick={() => onStatusFilterChange('pending')}
              className={`px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                statusFilter === 'pending'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => onStatusFilterChange('overdue')}
              className={`px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                statusFilter === 'overdue'
                  ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Overdue
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="all">All Groups</option>
              <option value="Staff">Staff</option>
              <option value="DTS Student">DTS Student</option>
              <option value="Guest House">Guest House</option>
              <option value="Base Office">Base Office</option>
              <option value="Ministry / Clinic">Ministry / Clinic</option>
            </select>
          </div>
        </div>
      </div>

      {/* Selected items notification bar */}
      {selectedIds.length > 0 && (
        <div className="px-4 py-2 bg-sky-50 dark:bg-sky-950/40 border-b border-sky-100 dark:border-sky-900/40 flex items-center justify-between text-xs text-sky-900 dark:text-sky-300">
          <span>{selectedIds.length} subscriber(s) selected</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                selectedIds.forEach((id) => {
                  const s = subscribers.find((sub) => sub.id === id);
                  if (s && s.status !== 'paid') {
                    onQuickPay(s);
                  }
                });
                setSelectedIds([]);
              }}
              className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-700 rounded text-xs font-medium hover:bg-sky-100 transition-colors"
            >
              Batch Pay Selected
            </button>
            <button
              onClick={() => {
                const selected = subscribers.filter((s) => selectedIds.includes(s.id));
                onBatchChangeRates(selected);
              }}
              className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-700 rounded text-xs font-medium hover:bg-sky-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 text-slate-800 dark:text-slate-200"
            >
              <DollarSign className="w-3.5 h-3.5 text-sky-600" />
              <span>Change Rates ({selectedIds.length})</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs underline text-sky-700 dark:text-sky-400"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* Database Table with Exact PDF Schema */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white dark:bg-slate-950 text-xs font-semibold tracking-wider uppercase border-b border-slate-800">
              <th className="py-3 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    filteredSubscribers.length > 0 &&
                    selectedIds.length === filteredSubscribers.length
                  }
                  className="rounded border-slate-700 text-sky-600 focus:ring-sky-500"
                  aria-label="Select all rows"
                />
              </th>
              {/* Column 1: N */}
              <th 
                onClick={() => handleSort('id')}
                className="py-3 px-3 w-14 cursor-pointer hover:bg-slate-800 transition-colors text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>N</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Column 2: Name of the Subscriber */}
              <th 
                onClick={() => handleSort('name')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-800 transition-colors min-w-[180px]"
              >
                <div className="flex items-center gap-1">
                  <span>Name of the Subscriber</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Column 3: Date of Subscription */}
              <th 
                onClick={() => handleSort('subscriptionDate')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-800 transition-colors min-w-[140px]"
              >
                <div className="flex items-center gap-1">
                  <span>Date of Subscription</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Column 4: Monthly Data Consumption (GB) */}
              <th 
                onClick={() => handleSort('monthlyDataGb')}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-800 transition-colors min-w-[120px]"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Data (GB)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Column 5: Monthly Rate (MGA) */}
              <th 
                onClick={() => handleSort('monthlyRateMga')}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-800 transition-colors min-w-[140px]"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Monthly Rate (MGA)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Column 6: Date of Payment & Due Date */}
              <th 
                onClick={() => handleSort('paymentDate')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-800 transition-colors min-w-[150px]"
              >
                <div className="flex items-center gap-1">
                  <span>Date of Payment</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Column 7: Observation */}
              <th className="py-3 px-4 min-w-[200px]">
                <span>Observation</span>
              </th>

              {/* Row Actions */}
              <th className="py-3 px-4 text-right min-w-[180px] no-print">
                <span>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredSubscribers.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <div className="max-w-sm mx-auto flex flex-col items-center">
                    <FileSpreadsheet className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      No subscribers found
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {searchQuery
                        ? 'Try clearing the search filter or change your criteria.'
                        : 'Start by adding a subscriber to the Land of Canaan database.'}
                    </p>
                    <button
                      onClick={onAddSubscriber}
                      className="mt-4 px-3 py-1.5 bg-sky-700 text-white rounded-lg text-xs font-semibold hover:bg-sky-800 transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Subscriber</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredSubscribers.map((subscriber) => {
                const isPaid = !!subscriber.paymentDate;
                const isSelected = selectedIds.includes(subscriber.id);
                const historyCount = (subscriber.history || []).length;
                const { dueDateStr, daysRemaining } = calculateNextDueDate(
                  subscriber.subscriptionDate,
                  subscriber.billingDayOfMonth
                );
                const isOverdue = !isPaid && daysRemaining < 0;
                const isDueSoon = !isPaid && daysRemaining >= 0 && daysRemaining <= 3;

                return (
                  <tr
                    key={subscriber.id}
                    className={`transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50 ${
                      isSelected ? 'bg-sky-50/40 dark:bg-sky-950/20' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(subscriber.id)}
                        className="rounded border-slate-300 dark:border-slate-700 text-sky-600 focus:ring-sky-500"
                        aria-label={`Select ${subscriber.name}`}
                      />
                    </td>

                    {/* Column 1: N */}
                    <td className="py-3 px-3 text-center font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300 text-xs">
                      {subscriber.id}
                    </td>

                    {/* Column 2: Name */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white leading-tight">
                        {subscriber.name}
                      </div>
                      {/* Quiet unboxed metadata */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {subscriber.category && <span>{subscriber.category}</span>}
                        {subscriber.category && subscriber.phone && <span aria-hidden="true">·</span>}
                        {subscriber.phone && (
                          <span className="flex items-center gap-1 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {subscriber.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Column 3: Date of Subscription */}
                    <td className="py-3 px-4 font-mono text-xs text-slate-700 dark:text-slate-300 tabular-nums">
                      {formatDate(subscriber.subscriptionDate)}
                    </td>

                    {/* Column 4: Monthly Data (GB) */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-medium text-slate-900 dark:text-slate-100">
                      {subscriber.monthlyDataGb}{' '}
                      <span className="text-xs text-slate-500 font-sans">GB</span>
                    </td>

                    {/* Column 5: Monthly Rate (MGA) */}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onQuickEditRate(subscriber)}
                        className="group inline-flex items-center justify-end gap-1.5 font-mono tabular-nums font-semibold text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer"
                        title="Click to manually change rate for this subscriber"
                      >
                        <span>{formatMga(subscriber.monthlyRateMga)}</span>
                        <Edit3 className="w-3 h-3 text-slate-300 dark:text-slate-600 group-hover:text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </button>
                    </td>

                    {/* Column 6: Date of Payment & Status */}
                    <td className="py-3 px-4">
                      {subscriber.paymentDate ? (
                        <div>
                          <div className="font-mono text-xs text-emerald-700 dark:text-emerald-400 font-medium tabular-nums flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>{formatDate(subscriber.paymentDate)}</span>
                          </div>
                          {subscriber.paymentMethod && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              via {subscriber.paymentMethod}
                            </div>
                          )}
                        </div>
                      ) : isOverdue ? (
                        <div>
                          <div className="flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-400 font-mono">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>Overdue ({Math.abs(daysRemaining)}d)</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            Due {formatDate(dueDateStr)}
                          </div>
                        </div>
                      ) : isDueSoon ? (
                        <div>
                          <div className="flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 font-mono">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>Due in {daysRemaining} days</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            Due {formatDate(dueDateStr)}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 font-mono">
                            <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                            <span>Due {formatDate(dueDateStr)}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            in {daysRemaining} days
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Column 7: Observation */}
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300 max-w-xs">
                      {subscriber.observation ? (
                        <p className="line-clamp-2 leading-relaxed">{subscriber.observation}</p>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 italic">—</span>
                      )}
                    </td>

                    {/* Column 8: Actions */}
                    <td className="py-3 px-4 text-right no-print">
                      <div className="flex items-center justify-end gap-1">
                        {!isPaid ? (
                          <>
                            <button
                              onClick={() => onQuickPay(subscriber)}
                              className="px-2 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded border border-emerald-200 dark:border-emerald-800 transition-colors whitespace-nowrap"
                              title="Record payment for this month"
                            >
                              Mark Paid
                            </button>

                            <button
                              onClick={() => onSendReminder(subscriber)}
                              className={`p-1.5 rounded transition-colors ${
                                isOverdue || isDueSoon
                                  ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100'
                                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                              title="Send / copy payment reminder"
                            >
                              <Bell className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => onViewReceipt(subscriber)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                            title="View / Print Receipt Voucher"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                        )}

                        {/* History button to view past subscription records */}
                        <button
                          onClick={() => onViewHistory(subscriber)}
                          className="p-1.5 text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors relative"
                          title={`View subscription history & past rates (${historyCount} past entries)`}
                        >
                          <History className="w-4 h-4" />
                          {historyCount > 0 && (
                            <span className="absolute -top-1 -right-1 text-[9px] font-mono bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200 rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">
                              {historyCount}
                            </span>
                          )}
                        </button>

                        {/* Change rate manually button */}
                        <button
                          onClick={() => onQuickEditRate(subscriber)}
                          className="p-1.5 text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                          title="Change monthly rate manually"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onEditSubscriber(subscriber)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                          title="Edit subscriber details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDeleteSubscriber(subscriber.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                          title="Delete subscriber"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Summary Info */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-3">
        <div>
          Showing {filteredSubscribers.length} of {subscribers.length} total entries
        </div>
        <div className="flex items-center gap-4">
          <span>
            Total Filtered Quota:{' '}
            <strong className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
              {filteredSubscribers.reduce((acc, s) => acc + (s.monthlyDataGb || 0), 0)} GB
            </strong>
          </span>
          <span>
            Total Filtered Dues:{' '}
            <strong className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
              {formatMga(filteredSubscribers.reduce((acc, s) => acc + (s.monthlyRateMga || 0), 0))}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};
