import React, { useState } from 'react';
import { X, Check, CreditCard, DollarSign } from 'lucide-react';
import { Subscriber, PaymentMethod } from '../types';
import { getTodayIso, formatMga, formatDate } from '../utils/formatters';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriber: Subscriber | null;
  onConfirmPayment: (
    subscriberId: number,
    paymentDate: string,
    paymentMethod: PaymentMethod,
    note: string
  ) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  subscriber,
  onConfirmPayment,
}) => {
  const [paymentDate, setPaymentDate] = useState(getTodayIso());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [transactionRef, setTransactionRef] = useState('');
  const [additionalNote, setAdditionalNote] = useState('');

  if (!isOpen || !subscriber) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const note = [
      transactionRef ? `Ref: ${transactionRef}` : '',
      additionalNote ? additionalNote : '',
    ]
      .filter(Boolean)
      .join(' · ');

    onConfirmPayment(subscriber.id, paymentDate, paymentMethod, note);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-lg">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Record Payment
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                YWAM Land of Canaan Internet Fee
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Subscriber & Dues Summary */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500 dark:text-slate-400">Subscriber</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {subscriber.name}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500 dark:text-slate-400">Database Entry</span>
              <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                N° {subscriber.id} · Subscribed {formatDate(subscriber.subscriptionDate)}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500 dark:text-slate-400">Monthly Quota</span>
              <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                {subscriber.monthlyDataGb} GB
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Amount Due
              </span>
              <span className="text-base font-bold text-emerald-700 dark:text-emerald-400 font-mono tabular-nums">
                {formatMga(subscriber.monthlyRateMga)}
              </span>
            </div>
          </div>

          {/* Date of Payment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Date of Payment <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              required
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Cash', 'MVola', 'Orange Money', 'Airtel Money', 'Bank Transfer'] as PaymentMethod[]).map(
                (method) => (
                  <button
                    type="button"
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-3 text-xs rounded-lg border text-left transition-all ${
                      paymentMethod === method
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-500 font-semibold text-emerald-900 dark:text-emerald-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {method}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Transaction Ref / Receipt number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Transaction ID / Ref (Optional)
            </label>
            <input
              type="text"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="e.g. MV29481 or Cash Receipt #104"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
            />
          </div>

          {/* Additional note to append to observation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Update Observation (Optional)
            </label>
            <input
              type="text"
              value={additionalNote}
              onChange={(e) => setAdditionalNote(e.target.value)}
              placeholder="e.g. Paid for current month in full"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Payment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
