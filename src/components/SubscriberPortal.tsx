import React, { useState } from 'react';
import { 
  Wifi, 
  CreditCard, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Receipt, 
  History, 
  ArrowRight, 
  Smartphone, 
  Copy, 
  Check, 
  ChevronRight, 
  Search, 
  User, 
  Plus, 
  FileText,
  Sliders,
  Sparkles,
  HelpCircle,
  Phone,
  Lock
} from 'lucide-react';
import { Subscriber, SubscriptionHistoryRecord, PlanPreset, BaseSettings, PaymentMethod } from '../types';
import { formatMga, formatDate, calculateNextDueDate, getTodayIso, getCurrentCyclePeriod, getCycleLabel, generateReceiptNumber } from '../utils/formatters';

interface SubscriberPortalProps {
  subscribers: Subscriber[];
  packages: PlanPreset[];
  settings: BaseSettings;
  activeSubscriber: Subscriber | null;
  onSelectSubscriber: (subscriber: Subscriber) => void;
  onConfirmPayment: (
    subscriberId: number,
    paymentDate: string,
    paymentMethod: PaymentMethod,
    note: string
  ) => void;
  onUpdateRate: (subscriber: Subscriber) => void;
  onViewReceipt: (subscriber: Subscriber, historyRecord?: SubscriptionHistoryRecord) => void;
  onNewRegistration: () => void;
  onSwitchToAdmin: () => void;
}

export const SubscriberPortal: React.FC<SubscriberPortalProps> = ({
  subscribers,
  packages,
  settings,
  activeSubscriber,
  onSelectSubscriber,
  onConfirmPayment,
  onUpdateRate,
  onViewReceipt,
  onNewRegistration,
  onSwitchToAdmin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isChangingSubscriber, setIsChangingSubscriber] = useState(false);
  const [showPayForm, setShowPayForm] = useState(false);
  const [paymentDate, setPaymentDate] = useState(getTodayIso());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MVola');
  const [txRef, setTxRef] = useState('');
  const [payNote, setPayNote] = useState('');
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // If no active subscriber selected, pick the first one or prompt
  const currentSub = activeSubscriber || subscribers[0];

  const handleCopyAccount = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(label);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSub) return;
    const note = [txRef ? `Ref: ${txRef}` : '', payNote ? payNote : ''].filter(Boolean).join(' · ');
    onConfirmPayment(currentSub.id, paymentDate, paymentMethod, note);
    setShowPayForm(false);
    setTxRef('');
    setPayNote('');
  };

  // Filtered subscribers for lookup
  const filteredSubscribers = subscribers.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      String(s.id).includes(q) ||
      (s.phone || '').toLowerCase().includes(q) ||
      (s.observation || '').toLowerCase().includes(q)
    );
  });

  if (!currentSub) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          No Subscribers Registered Yet
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Start by registering your subscription line for YWAM Land of Canaan.
        </p>
        <button
          onClick={onNewRegistration}
          className="mt-4 px-4 py-2 bg-sky-700 text-white rounded-lg text-sm font-semibold"
        >
          Register Subscription
        </button>
      </div>
    );
  }

  const isPaid = !!currentSub.paymentDate;
  const { dueDateStr, daysRemaining } = calculateNextDueDate(
    currentSub.subscriptionDate,
    currentSub.billingDayOfMonth
  );
  const isOverdue = !isPaid && daysRemaining < 0;
  const isDueSoon = !isPaid && daysRemaining >= 0 && daysRemaining <= settings.reminderDaysBeforeDue;
  const historyList = currentSub.history || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Welcome & User Selector Bar */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-lg shrink-0">
            {currentSub.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {currentSub.name}
              </h2>
              <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                Line N°{currentSub.id}
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>{currentSub.category || 'Resident'}</span>
              <span>·</span>
              <span>Subscribed {formatDate(currentSub.subscriptionDate)}</span>
              {currentSub.phone && (
                <>
                  <span>·</span>
                  <span className="font-mono">{currentSub.phone}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Change Account / Search user */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsChangingSubscriber(!isChangingSubscriber)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>{isChangingSubscriber ? 'Close Search' : 'Switch Line'}</span>
          </button>
          <button
            onClick={onNewRegistration}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 dark:bg-sky-600 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Line</span>
          </button>
        </div>
      </div>

      {/* Switch Subscriber Dropdown Search Drawer */}
      {isChangingSubscriber && (
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-sky-200 dark:border-sky-800 shadow-md animate-in fade-in duration-150 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by subscriber name, room, or phone number..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto">
            {filteredSubscribers.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  onSelectSubscriber(s);
                  setIsChangingSubscriber(false);
                }}
                className={`p-2.5 rounded-lg text-left text-xs border transition-colors flex items-center justify-between ${
                  s.id === currentSub.id
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="truncate">
                  <div className="font-semibold text-slate-900 dark:text-white truncate">
                    {s.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {formatMga(s.monthlyRateMga)} · {s.monthlyDataGb}GB
                  </div>
                </div>
                <span className="font-mono text-[10px] text-slate-400 shrink-0 ml-1">
                  N°{s.id}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Status & Rate Hero Split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Subscription Quota & Rate */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Current Plan
              </span>
              <button
                type="button"
                onClick={() => onUpdateRate(currentSub)}
                className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline flex items-center gap-1"
                title="Change or customize your monthly rate"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Change Rate</span>
              </button>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                  {currentSub.monthlyDataGb}
                </span>
                <span className="text-sm font-semibold text-slate-500">GB / month</span>
              </div>
              <div className="mt-1 font-mono text-xl font-bold text-sky-700 dark:text-sky-400 tabular-nums">
                {formatMga(currentSub.monthlyRateMga)}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            {currentSub.observation ? (
              <span className="line-clamp-2 italic">"{currentSub.observation}"</span>
            ) : (
              <span>Standard YWAM campus line</span>
            )}
          </div>
        </div>

        {/* Card 2: Payment Status & Due Date */}
        <div className="md:col-span-2 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Monthly Billing Status
              </span>
              <span className="text-xs font-mono text-slate-400">
                Cycle: {getCycleLabel(getCurrentCyclePeriod())}
              </span>
            </div>

            {/* Status Message */}
            <div className="mt-3">
              {isPaid ? (
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-xl shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-emerald-800 dark:text-emerald-300">
                      Payment Settled for Current Month
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Settled on <strong className="font-mono">{formatDate(currentSub.paymentDate)}</strong>{' '}
                      {currentSub.paymentMethod ? `via ${currentSub.paymentMethod}` : ''}.
                    </p>
                    <div className="mt-2">
                      <button
                        onClick={() => onViewReceipt(currentSub)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>View / Print Payment Receipt</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : isOverdue ? (
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 rounded-xl shrink-0">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-rose-800 dark:text-rose-300">
                      Subscription Payment Overdue ({Math.abs(daysRemaining)} days)
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Your monthly due date was <strong className="font-mono">{formatDate(dueDateStr)}</strong>. Please settle {formatMga(currentSub.monthlyRateMga)} to prevent service interruption.
                    </p>
                  </div>
                </div>
              ) : isDueSoon ? (
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-xl shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-amber-800 dark:text-amber-300">
                      Payment Due in {daysRemaining} Day{daysRemaining === 1 ? '' : 's'}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Due date: <strong className="font-mono">{formatDate(dueDateStr)}</strong>. Amount due: <strong className="font-mono">{formatMga(currentSub.monthlyRateMga)}</strong>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 rounded-xl shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Payment Pending (Due in {daysRemaining} days)
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Upcoming due date: <strong className="font-mono">{formatDate(dueDateStr)}</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Button */}
          {!isPaid && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Ready to pay? Use Mobile Money or Cash at Base Office.
              </span>
              <button
                type="button"
                onClick={() => setShowPayForm(!showPayForm)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <CreditCard className="w-4 h-4" />
                <span>{showPayForm ? 'Hide Payment Form' : 'I Have Paid / Settle Now'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Settle Payment Drawer */}
      {showPayForm && !isPaid && (
        <form
          onSubmit={handlePaySubmit}
          className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-md animate-in fade-in duration-150 space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Confirm Monthly Payment for {currentSub.name}
              </h3>
              <p className="text-xs text-slate-500">
                Amount to settle: <strong className="font-mono text-emerald-700 dark:text-emerald-400">{formatMga(currentSub.monthlyRateMga)}</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPayForm(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date Payment Was Made
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <option value="MVola">MVola (Telma)</option>
                <option value="Orange Money">Orange Money</option>
                <option value="Airtel Money">Airtel Money</option>
                <option value="Cash">Cash (Base Office)</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Transaction Reference / SMS Code (Optional)
              </label>
              <input
                type="text"
                value={txRef}
                onChange={(e) => setTxRef(e.target.value)}
                placeholder="e.g. MV294819"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Note (Housing / Room #)
              </label>
              <input
                type="text"
                value={payNote}
                onChange={(e) => setPayNote(e.target.value)}
                placeholder="e.g. House 3 room 4"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowPayForm(false)}
              className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Generate Receipt</span>
            </button>
          </div>
        </form>
      )}

      {/* How To Pay Section: Mobile Money Accounts at YWAM Land of Canaan */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-sky-600" />
            <span>How to Pay Internet Subscription (Madagascar Mobile Money & Cash)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Send money to any of the official YWAM Land of Canaan numbers below, with your Subscriber Name or N°{currentSub.id} as the reference note.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* MVola */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-amber-600">MVola (Telma)</span>
                <span className="text-[10px] text-slate-400">Telma network</span>
              </div>
              <div className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 break-all">
                {settings.mvolaNumber}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopyAccount(settings.mvolaNumber, 'mvola')}
              className="mt-3 w-full py-1.5 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1"
            >
              {copiedAccount === 'mvola' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Number Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy MVola Number</span>
                </>
              )}
            </button>
          </div>

          {/* Orange Money */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-orange-600">Orange Money</span>
                <span className="text-[10px] text-slate-400">Orange network</span>
              </div>
              <div className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 break-all">
                {settings.orangeMoneyNumber}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopyAccount(settings.orangeMoneyNumber, 'orange')}
              className="mt-3 w-full py-1.5 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1"
            >
              {copiedAccount === 'orange' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Number Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Orange Number</span>
                </>
              )}
            </button>
          </div>

          {/* Airtel Money / Cash */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-red-600">Airtel / Cash Office</span>
                <span className="text-[10px] text-slate-400">Airtel / Cashier</span>
              </div>
              <div className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 break-all">
                {settings.airtelMoneyNumber}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Cash Office: {settings.cashOfficeHours}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopyAccount(settings.airtelMoneyNumber, 'airtel')}
              className="mt-3 w-full py-1.5 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1"
            >
              {copiedAccount === 'airtel' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Number Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Airtel Number</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Available Tariff Packages at YWAM Canaan */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Campus Internet Packages & Rates
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Current tariffs available at YWAM Land of Canaan. Need to adjust your plan? Click any package.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {packages.map((pkg) => {
            const isCurrent =
              currentSub.monthlyRateMga === pkg.rateMga &&
              currentSub.monthlyDataGb === pkg.dataGb;

            return (
              <div
                key={pkg.name}
                onClick={() => onUpdateRate(currentSub)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isCurrent
                    ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 ring-1 ring-sky-500'
                    : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {pkg.name}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300 uppercase">
                      Active
                    </span>
                  )}
                </div>

                <div className="mt-1 font-mono text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {formatMga(pkg.rateMga)}
                </div>
                <div className="font-mono text-xs text-slate-500 mt-0.5">
                  {pkg.dataGb} GB
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* My Past Billing History & Receipts */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-500" />
              <span>My Subscription History & Receipts</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review past payments and download official vouchers for {currentSub.name}.
            </p>
          </div>
        </div>

        {historyList.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            No past billing cycles recorded yet for this subscriber.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {historyList.map((item) => (
              <div
                key={item.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {item.cycleLabel}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      ({formatDate(item.subscriptionDate)})
                    </span>
                    {item.receiptNumber && (
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.receiptNumber}
                      </span>
                    )}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 mt-0.5 flex items-center gap-2 font-mono">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatMga(item.monthlyRateMga)}
                    </span>
                    <span>·</span>
                    <span>{item.monthlyDataGb} GB</span>
                    {item.paymentMethod && <span>via {item.paymentMethod}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.paymentDate ? (
                    <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Paid {formatDate(item.paymentDate)}
                    </span>
                  ) : (
                    <span className="text-xs text-amber-700 font-medium">Unsettled</span>
                  )}
                  <button
                    onClick={() => onViewReceipt(currentSub, item)}
                    className="p-1.5 text-slate-500 hover:text-sky-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="View & print receipt voucher"
                  >
                    <Receipt className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Campus WiFi Details & Discreet Admin Switch */}
      <div className="p-4 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-sky-600" />
          <span>
            YWAM Land of Canaan Campus Network · Need assistance? Visit the Base Finance Office.
          </span>
        </div>

        {/* Discreet link to switch to Admin Database view if needed */}
        <button
          onClick={onSwitchToAdmin}
          className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-sky-700 dark:hover:text-sky-300 underline flex items-center gap-1.5"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Staff & Finance Database (Admin) &rarr;</span>
        </button>
      </div>
    </div>
  );
};
