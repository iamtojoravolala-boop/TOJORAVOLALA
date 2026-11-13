import React from 'react';
import { X, Printer, CheckCircle, ShieldCheck } from 'lucide-react';
import { Subscriber, SubscriptionHistoryRecord } from '../types';
import { formatMga, formatDate, generateReceiptNumber } from '../utils/formatters';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriber: Subscriber | null;
  historyRecord?: SubscriptionHistoryRecord | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  subscriber,
  historyRecord,
}) => {
  if (!isOpen || !subscriber) return null;

  const paymentDate = historyRecord?.paymentDate || subscriber.paymentDate || '2026-11-12';
  const receiptNo =
    historyRecord?.receiptNumber || generateReceiptNumber(subscriber, paymentDate);
  const rateMga = historyRecord?.monthlyRateMga || subscriber.monthlyRateMga;
  const dataGb = historyRecord?.monthlyDataGb || subscriber.monthlyDataGb;
  const paymentMethod = historyRecord?.paymentMethod || subscriber.paymentMethod || 'Cash';
  const cyclePeriod = historyRecord?.cycleLabel || 'November 2026';
  const obs = historyRecord?.observation || subscriber.observation;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden print-container animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print px-6 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">Official Payment Voucher</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Voucher</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Body */}
        <div className="p-8 font-sans space-y-6">
          {/* Header with YWAM Land of Canaan Brand */}
          <div className="border-b-2 border-slate-900 pb-4 text-center">
            <div className="inline-block px-2.5 py-0.5 bg-slate-900 text-white font-bold text-xs tracking-widest uppercase mb-1">
              YWAM MADAGASCAR
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              YWAM Land of Canaan
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Campus Internet Network · Subscription Official Receipt
            </p>
          </div>

          {/* Receipt Meta Strip */}
          <div className="flex justify-between items-baseline text-xs border-b border-slate-200 pb-3 font-mono">
            <div>
              <span className="text-slate-500">Receipt N°: </span>
              <strong className="text-slate-900">{receiptNo}</strong>
            </div>
            <div>
              <span className="text-slate-500">Issue Date: </span>
              <strong className="text-slate-900">{formatDate(paymentDate)}</strong>
            </div>
          </div>

          {/* Subscriber & Package Details Table */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Subscriber Name:</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">
                  {subscriber.name}
                </span>
                <span className="text-slate-500 text-[11px]">Database ID: N° {subscriber.id}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Billing Period:</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">
                  {cyclePeriod}
                </span>
                <span className="text-slate-500 text-[11px]">
                  Subscribed: {formatDate(subscriber.subscriptionDate)}
                </span>
              </div>
            </div>

            <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3 text-left font-semibold text-slate-700">Description</th>
                    <th className="py-2 px-3 text-center font-semibold text-slate-700">Quota</th>
                    <th className="py-2 px-3 text-right font-semibold text-slate-700">Amount (MGA)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">
                        Monthly Campus Internet Access
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Method: {paymentMethod}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-medium">
                      {dataGb} GB
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatMga(rateMga)}
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-50 font-semibold border-t-2 border-slate-900">
                  <tr>
                    <td colSpan={2} className="py-2 px-3 text-right text-xs uppercase tracking-wider">
                      Total Paid:
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-sm text-slate-900 tabular-nums">
                      {formatMga(rateMga)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {obs && (
              <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                <strong className="text-slate-800">Observation: </strong>
                {obs}
              </div>
            )}
          </div>

          {/* Paid Stamp & Signatures */}
          <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
            <div className="border-2 border-emerald-700 text-emerald-800 px-3 py-1.5 rounded rotate-[-2deg] text-xs font-bold tracking-widest uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>PAID IN FULL</span>
            </div>

            <div className="text-right text-[11px]">
              <div className="w-36 border-b border-slate-400 mb-1"></div>
              <span className="text-slate-500">Authorized Signature & Stamp</span>
              <div className="text-[10px] text-slate-400 font-medium">Finance Dept · YWAM Canaan</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
