import React, { useState } from 'react';
import { Printer, Download, Eye, FileDown, RefreshCw } from 'lucide-react';
import { Subscriber } from '../types';
import { formatMga, formatDate } from '../utils/formatters';

interface PrintableLedgerProps {
  subscribers: Subscriber[];
}

export const PrintableLedger: React.FC<PrintableLedgerProps> = ({ subscribers }) => {
  const [includeBlankRows, setIncludeBlankRows] = useState(true);
  const totalRowsDesired = 18;

  // Fill up to 18 rows or paginate by 18
  const rows = [...subscribers];
  const blankRowsNeeded = Math.max(0, totalRowsDesired - rows.length);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Control Banner (Hidden in Print) */}
      <div className="no-print p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Official Ledger View (Matches PDF Template)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Designed to match the YWAM Land of Canaan Internet Subscription Database sheet.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer mr-2">
            <input
              type="checkbox"
              checked={includeBlankRows}
              onChange={(e) => setIncludeBlankRows(e.target.checked)}
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <span>Pad with blank lined rows (up to 18)</span>
          </label>

          <a
            href="/assets/aistudio/Copy_of_YWAM_Land_of_Canaan_Internet_Subscription_Database_c1d9b3eb.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <FileDown className="w-3.5 h-3.5 text-slate-500" />
            <span>Open Original PDF</span>
          </a>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Ledger Page</span>
          </button>
        </div>
      </div>

      {/* Ledger Sheet Paper Frame */}
      <div className="bg-white text-slate-900 p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-200 print-container overflow-x-auto">
        {/* Document Header in Print */}
        <div className="mb-4 pb-2 border-b border-slate-300 flex justify-between items-baseline">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              YWAM Land of Canaan — Internet Subscription Database
            </h1>
            <p className="text-xs text-slate-500">
              Youth With A Mission Madagascar · Campus Network Registry
            </p>
          </div>
          <div className="text-right text-xs text-slate-400 font-mono">
            Generated: {new Date().toLocaleDateString('en-GB')}
          </div>
        </div>

        {/* The Exact PDF Table Format with Navy Header */}
        <table className="w-full border-collapse text-xs text-left">
          <thead>
            <tr className="bg-[#183656] text-white font-semibold border border-[#183656]">
              <th className="py-3 px-3 w-10 text-center border-r border-[#264b73]">N</th>
              <th className="py-3 px-4 border-r border-[#264b73]">Name of the Subscriber</th>
              <th className="py-3 px-4 border-r border-[#264b73]">Date of Subscription</th>
              <th className="py-3 px-4 text-center border-r border-[#264b73]">Monthly Data Consumption (GB)</th>
              <th className="py-3 px-4 text-right border-r border-[#264b73]">Monthly Rate (MGA)</th>
              <th className="py-3 px-4 border-r border-[#264b73]">Date of Payment</th>
              <th className="py-3 px-4">Observation</th>
            </tr>
          </thead>
          <tbody>
            {/* Populated rows */}
            {rows.map((sub) => (
              <tr key={sub.id} className="border-b border-sky-100 hover:bg-slate-50 transition-colors">
                <td className="py-2.5 px-3 text-center font-mono font-medium text-slate-800 border-r border-slate-200">
                  {sub.id}
                </td>
                <td className="py-2.5 px-4 font-semibold text-slate-900 border-r border-slate-200">
                  {sub.name}
                </td>
                <td className="py-2.5 px-4 font-mono text-slate-700 border-r border-slate-200">
                  {formatDate(sub.subscriptionDate)}
                </td>
                <td className="py-2.5 px-4 text-center font-mono text-slate-800 border-r border-slate-200">
                  {sub.monthlyDataGb}
                </td>
                <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900 border-r border-slate-200">
                  {formatMga(sub.monthlyRateMga)}
                </td>
                <td className="py-2.5 px-4 font-mono text-slate-700 border-r border-slate-200">
                  {formatDate(sub.paymentDate)}
                </td>
                <td className="py-2.5 px-4 text-slate-600">
                  {sub.observation || '—'}
                </td>
              </tr>
            ))}

            {/* Optional blank lined rows matching the original PDF template */}
            {includeBlankRows &&
              Array.from({ length: blankRowsNeeded }).map((_, idx) => {
                const rowNum = rows.length + idx + 1;
                return (
                  <tr key={`blank-${rowNum}`} className="border-b border-sky-100 h-9">
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400 border-r border-slate-200">
                      {rowNum}
                    </td>
                    <td className="py-2.5 px-4 border-r border-slate-200"></td>
                    <td className="py-2.5 px-4 border-r border-slate-200"></td>
                    <td className="py-2.5 px-4 border-r border-slate-200"></td>
                    <td className="py-2.5 px-4 border-r border-slate-200"></td>
                    <td className="py-2.5 px-4 border-r border-slate-200"></td>
                    <td className="py-2.5 px-4"></td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        {/* Ledger Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-500 font-mono">
          <div>
            Total Active Monthly Commitment:{' '}
            <strong className="text-slate-800">
              {formatMga(subscribers.reduce((acc, s) => acc + (s.monthlyRateMga || 0), 0))}
            </strong>
          </div>
          <div>
            Total Allocated Quota:{' '}
            <strong className="text-slate-800">
              {subscribers.reduce((acc, s) => acc + (s.monthlyDataGb || 0), 0)} GB
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
