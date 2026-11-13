import React, { useState } from 'react';
import { X, Calendar, Plus, Clock, CheckCircle2, AlertCircle, Receipt, Trash2 } from 'lucide-react';
import { Subscriber, SubscriptionHistoryRecord, PaymentMethod } from '../types';
import { formatMga, formatDate, getTodayIso } from '../utils/formatters';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriber: Subscriber | null;
  onAddHistoryRecord: (subscriberId: number, record: SubscriptionHistoryRecord) => void;
  onDeleteHistoryRecord: (subscriberId: number, recordId: string) => void;
  onViewReceiptFromHistory: (subscriber: Subscriber, record: SubscriptionHistoryRecord) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  subscriber,
  onAddHistoryRecord,
  onDeleteHistoryRecord,
  onViewReceiptFromHistory,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [cyclePeriod, setCyclePeriod] = useState('2026-10');
  const [cycleLabel, setCycleLabel] = useState('October 2026');
  const [subscriptionDate, setSubscriptionDate] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [monthlyRateMga, setMonthlyRateMga] = useState(60000);
  const [monthlyDataGb, setMonthlyDataGb] = useState(30);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [observation, setObservation] = useState('');

  if (!isOpen || !subscriber) return null;

  const history = subscriber.history || [];

  const handlePeriodChange = (val: string) => {
    setCyclePeriod(val);
    try {
      const [y, m] = val.split('-');
      const d = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
      setCycleLabel(new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(d));
    } catch {
      setCycleLabel(val);
    }
  };

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: SubscriptionHistoryRecord = {
      id: `hist-${Date.now()}`,
      subscriberId: subscriber.id,
      cyclePeriod,
      cycleLabel,
      subscriptionDate: subscriptionDate || subscriber.subscriptionDate,
      paymentDate: paymentDate || null,
      monthlyRateMga: Number(monthlyRateMga) || subscriber.monthlyRateMga,
      monthlyDataGb: Number(monthlyDataGb) || subscriber.monthlyDataGb,
      paymentMethod,
      receiptNumber: receiptNumber.trim() || `YLOC-NET-${cyclePeriod.replace('-', '')}-${String(subscriber.id).padStart(3, '0')}`,
      observation: observation.trim(),
      recordedAt: new Date().toISOString(),
    };

    onAddHistoryRecord(subscriber.id, newRecord);
    setShowAddForm(false);
    setObservation('');
    setPaymentDate('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Subscription & Payment History
              </h3>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                (N° {subscriber.id})
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {subscriber.name} · Subscribed since {formatDate(subscriber.subscriptionDate)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Current Cycle Highlight */}
          <div className="p-4 bg-sky-50/60 dark:bg-sky-950/30 rounded-xl border border-sky-100 dark:border-sky-900/40">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-sky-800 dark:text-sky-300 uppercase tracking-wider">
                  Current Billing Cycle (November 2026)
                </span>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {subscriber.monthlyDataGb} GB · {formatMga(subscriber.monthlyRateMga)}
                </div>
              </div>
              <div>
                {subscriber.paymentDate ? (
                  <div className="text-right">
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Paid {formatDate(subscriber.paymentDate)}
                    </span>
                    {subscriber.paymentMethod && (
                      <span className="text-[11px] text-slate-500">via {subscriber.paymentMethod}</span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Payment Pending
                  </span>
                )}
              </div>
            </div>
            {subscriber.observation && (
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-sky-100/60 dark:border-sky-900/30">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Observation: </span>
                {subscriber.observation}
              </div>
            )}
          </div>

          {/* Historical Log Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Past Subscription Records & Rates ({history.length})
              </h4>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  setSubscriptionDate(subscriber.subscriptionDate);
                  setMonthlyRateMga(subscriber.monthlyRateMga);
                  setMonthlyDataGb(subscriber.monthlyDataGb);
                }}
                className="text-xs text-sky-700 dark:text-sky-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddForm ? 'Cancel Entry' : 'Add Past Period Record'}</span>
              </button>
            </div>

            {/* Retroactive Entry Form */}
            {showAddForm && (
              <form onSubmit={handleCreateRecord} className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 mb-4 space-y-3">
                <div className="text-xs font-semibold text-slate-800 dark:text-white">
                  Record Historical Subscription Details
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Billing Month / Period
                    </label>
                    <input
                      type="month"
                      value={cyclePeriod}
                      onChange={(e) => handlePeriodChange(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Subscription Date Active
                    </label>
                    <input
                      type="date"
                      value={subscriptionDate}
                      onChange={(e) => setSubscriptionDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Monthly Rate (MGA)
                    </label>
                    <input
                      type="number"
                      step="1000"
                      value={monthlyRateMga}
                      onChange={(e) => setMonthlyRateMga(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Quota (GB)
                    </label>
                    <input
                      type="number"
                      value={monthlyDataGb}
                      onChange={(e) => setMonthlyDataGb(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Date of Payment
                    </label>
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md"
                    >
                      <option value="Cash">Cash</option>
                      <option value="MVola">MVola</option>
                      <option value="Orange Money">Orange Money</option>
                      <option value="Airtel Money">Airtel Money</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Receipt Ref #
                    </label>
                    <input
                      type="text"
                      value={receiptNumber}
                      onChange={(e) => setReceiptNumber(e.target.value)}
                      placeholder="e.g. YLOC-NET-202610-001"
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Observation for that cycle
                  </label>
                  <input
                    type="text"
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    placeholder="e.g. Paid cash at office. Receipt issued."
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-md"
                  >
                    Save Historical Entry
                  </button>
                </div>
              </form>
            )}

            {/* List of past records */}
            {history.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                No past subscription cycles recorded yet for this subscriber.
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((record) => (
                  <div
                    key={record.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {record.cycleLabel}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          (Subscribed: {formatDate(record.subscriptionDate)})
                        </span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-300 mt-1 flex flex-wrap items-center gap-2">
                        <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                          {formatMga(record.monthlyRateMga)}
                        </span>
                        <span>·</span>
                        <span className="font-mono tabular-nums">{record.monthlyDataGb} GB</span>
                        {record.paymentMethod && (
                          <>
                            <span>·</span>
                            <span>via {record.paymentMethod}</span>
                          </>
                        )}
                        {record.receiptNumber && (
                          <>
                            <span>·</span>
                            <span className="font-mono text-slate-400">{record.receiptNumber}</span>
                          </>
                        )}
                      </div>
                      {record.observation && (
                        <div className="mt-1 text-[11px] text-slate-500 italic">
                          "{record.observation}"
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        {record.paymentDate ? (
                          <div className="font-mono text-emerald-700 dark:text-emerald-400 font-medium tabular-nums flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Paid {formatDate(record.paymentDate)}</span>
                          </div>
                        ) : (
                          <div className="font-mono text-amber-700 dark:text-amber-400 font-medium tabular-nums flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Unsettled</span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <button
                        onClick={() => onViewReceiptFromHistory(subscriber, record)}
                        className="p-1.5 text-slate-500 hover:text-sky-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="View printable receipt for this cycle"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteHistoryRecord(subscriber.id, record.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete this record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
};
