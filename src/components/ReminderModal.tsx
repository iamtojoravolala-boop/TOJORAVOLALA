import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  Send, 
  Copy, 
  Check, 
  MessageSquare, 
  Phone, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  Settings2,
  ExternalLink
} from 'lucide-react';
import { Subscriber, BaseSettings } from '../types';
import { 
  calculateNextDueDate, 
  generateReminderMessage, 
  formatMga, 
  formatDate,
  getTodayIso 
} from '../utils/formatters';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscribers: Subscriber[];
  settings: BaseSettings;
  onUpdateSettings: (settings: BaseSettings) => void;
  onMarkReminderSent: (subscriberId: number) => void;
  selectedSubscriberId?: number;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  subscribers,
  settings,
  onUpdateSettings,
  onMarkReminderSent,
  selectedSubscriberId,
}) => {
  const [activeTab, setActiveTab] = useState<'reminders' | 'settings'>('reminders');
  const [selectedSubId, setSelectedSubId] = useState<number>(
    selectedSubscriberId || subscribers[0]?.id || 1
  );
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const [copied, setCopied] = useState(false);
  const [batchCopied, setBatchCopied] = useState(false);

  // Settings form state
  const [leadDays, setLeadDays] = useState(settings.reminderDaysBeforeDue);
  const [mvolaNum, setMvolaNum] = useState(settings.mvolaNumber);
  const [orangeNum, setOrangeNum] = useState(settings.orangeMoneyNumber);
  const [airtelNum, setAirtelNum] = useState(settings.airtelMoneyNumber);
  const [cashHours, setCashHours] = useState(settings.cashOfficeHours);
  const [treasurer, setTreasurer] = useState(settings.treasurerName);

  if (!isOpen) return null;

  // Classify all subscribers needing attention (unpaid)
  const unpaidSubscribers = subscribers.filter((s) => !s.paymentDate);

  const enrichedSubscribers = unpaidSubscribers.map((s) => {
    const { dueDate, dueDateStr, daysRemaining } = calculateNextDueDate(
      s.subscriptionDate,
      s.billingDayOfMonth
    );
    const isOverdue = daysRemaining < 0;
    const isDueSoon = daysRemaining >= 0 && daysRemaining <= settings.reminderDaysBeforeDue;
    return {
      ...s,
      dueDateStr,
      daysRemaining,
      isOverdue,
      isDueSoon,
    };
  });

  // Sort by daysRemaining ascending (most urgent first: overdue, then due soon, then upcoming)
  enrichedSubscribers.sort((a, b) => a.daysRemaining - b.daysRemaining);

  const activeSub =
    enrichedSubscribers.find((s) => s.id === selectedSubId) ||
    enrichedSubscribers[0] ||
    subscribers[0];

  const reminderText = activeSub
    ? generateReminderMessage(activeSub, settings, language)
    : '';

  const handleCopyMessage = () => {
    if (!reminderText) return;
    navigator.clipboard.writeText(reminderText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    if (!activeSub) return;
    const cleanPhone = (activeSub.phone || '').replace(/[^0-9]/g, '');
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(reminderText)}`
      : `https://wa.me/?text=${encodeURIComponent(reminderText)}`;
    window.open(url, '_blank');
    onMarkReminderSent(activeSub.id);
  };

  const handleCopyBatchReminders = () => {
    const dueAndOverdue = enrichedSubscribers.filter(
      (s) => s.isOverdue || s.isDueSoon
    );
    if (dueAndOverdue.length === 0) return;

    const combined = dueAndOverdue
      .map((s) => `--- REMINDER FOR: ${s.name} (N° ${s.id}) ---\n${generateReminderMessage(s, settings, language)}\n\n`)
      .join('\n');

    navigator.clipboard.writeText(combined);
    setBatchCopied(true);
    setTimeout(() => setBatchCopied(false), 2500);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      reminderDaysBeforeDue: leadDays,
      mvolaNumber: mvolaNum,
      orangeMoneyNumber: orangeNum,
      airtelMoneyNumber: airtelNum,
      cashOfficeHours: cashHours,
      treasurerName: treasurer,
    });
    setActiveTab('reminders');
  };

  const overdueCount = enrichedSubscribers.filter((s) => s.isOverdue).length;
  const dueSoonCount = enrichedSubscribers.filter((s) => s.isDueSoon).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Subscription Due Dates & Reminders
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track payment deadlines and dispatch reminders for YWAM Land of Canaan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
              <button
                onClick={() => setActiveTab('reminders')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === 'reminders'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Send Reminders
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                  activeTab === 'settings'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Config</span>
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Reminders & Due Dates */}
        {activeTab === 'reminders' ? (
          <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-5 min-h-[420px]">
            {/* Left list: Subscribed users with due date status */}
            <div className="md:col-span-2 border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-3 space-y-2 bg-slate-50/50 dark:bg-slate-900/50">
              {/* Due Date Alert Summary */}
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Due Status</span>
                  <span className="font-mono text-slate-500">{enrichedSubscribers.length} pending</span>
                </div>
                <div className="mt-2 space-y-1 text-[11px]">
                  <div className="flex justify-between text-rose-700 dark:text-rose-400 font-medium">
                    <span>Overdue</span>
                    <span className="font-mono">{overdueCount}</span>
                  </div>
                  <div className="flex justify-between text-amber-700 dark:text-amber-400 font-medium">
                    <span>Due in ≤ {settings.reminderDaysBeforeDue} days</span>
                    <span className="font-mono">{dueSoonCount}</span>
                  </div>
                </div>

                {enrichedSubscribers.length > 0 && (
                  <button
                    onClick={handleCopyBatchReminders}
                    className="mt-3 w-full py-1.5 px-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    {batchCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>All Due Reminders Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy All Urgent Reminders</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* List of subscribers */}
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1 pt-1">
                Subscribers ({enrichedSubscribers.length})
              </div>

              {enrichedSubscribers.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  All subscribers are currently settled!
                </div>
              ) : (
                enrichedSubscribers.map((sub) => {
                  const isSelected = activeSub?.id === sub.id;

                  return (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSubId(sub.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/40 dark:border-sky-500 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                          {sub.name}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400 shrink-0">
                          N°{sub.id}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center justify-between text-xs">
                        <span className="font-mono font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                          {formatMga(sub.monthlyRateMga)}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {sub.monthlyDataGb} GB
                        </span>
                      </div>

                      {/* Due date badge & timing */}
                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                        {sub.isOverdue ? (
                          <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1 font-mono">
                            <AlertTriangle className="w-3 h-3" />
                            {Math.abs(sub.daysRemaining)}d Overdue
                          </span>
                        ) : sub.isDueSoon ? (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            Due in {sub.daysRemaining}d
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono">
                            Due in {sub.daysRemaining}d
                          </span>
                        )}

                        {sub.lastReminderSent ? (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                            Sent {formatDate(sub.lastReminderSent)}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Not reminded</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right details & action panel */}
            <div className="md:col-span-3 p-5 flex flex-col justify-between overflow-y-auto">
              {activeSub ? (
                <div className="space-y-4">
                  {/* Selected subscriber header card */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {activeSub.name}
                        </h4>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>N° {activeSub.id}</span>
                          <span>·</span>
                          <span>Subscribed {formatDate(activeSub.subscriptionDate)}</span>
                          {activeSub.phone && (
                            <>
                              <span>·</span>
                              <span className="font-mono">{activeSub.phone}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-base text-slate-900 dark:text-white">
                          {formatMga(activeSub.monthlyRateMga)}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          Quota: {activeSub.monthlyDataGb} GB
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Monthly Due Date: </span>
                        <strong className="font-mono text-slate-900 dark:text-white">
                          {formatDate(activeSub.dueDateStr)}
                        </strong>
                      </div>

                      {activeSub.lastReminderSent && (
                        <div className="text-[11px] text-slate-500">
                          Last reminder: <strong>{formatDate(activeSub.lastReminderSent)}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Language switch */}
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Reminder Message Template
                    </label>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-md text-xs">
                      <button
                        type="button"
                        onClick={() => setLanguage('en')}
                        className={`px-2 py-0.5 rounded transition-colors ${
                          language === 'en'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium shadow-2xs'
                            : 'text-slate-500'
                        }`}
                      >
                        English
                      </button>
                      <button
                        type="button"
                        onClick={() => setLanguage('fr')}
                        className={`px-2 py-0.5 rounded transition-colors ${
                          language === 'fr'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium shadow-2xs'
                            : 'text-slate-500'
                        }`}
                      >
                        Français
                      </button>
                    </div>
                  </div>

                  {/* Message Preview Box */}
                  <div className="relative">
                    <pre className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-sans text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                      {reminderText}
                    </pre>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => onMarkReminderSent(activeSub.id)}
                      className="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:underline flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Log as Sent without WhatsApp</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyMessage}
                        className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Text</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleSendWhatsApp}
                        className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Send via WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400 text-xs">
                  Select a subscriber on the left to generate and send payment reminders.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Tab 2: Settings for Reminders & Base Payment Info */
          <form onSubmit={handleSaveSettings} className="p-6 space-y-4 overflow-y-auto">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Reminder & Payment Configuration
              </h4>
              <p className="text-xs text-slate-500">
                Customize lead time and base mobile money accounts included in reminders.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Send Reminders How Many Days Before Due?
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={leadDays}
                    onChange={(e) => setLeadDays(parseInt(e.target.value, 10) || 3)}
                    className="w-24 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-center"
                    required
                  />
                  <span className="text-xs text-slate-500">days prior to monthly due date</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Base Treasurer / Department Name
                </label>
                <input
                  type="text"
                  value={treasurer}
                  onChange={(e) => setTreasurer(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Madagascar Mobile Money & Cash Accounts (Shown in Reminders)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    MVola (Telma) Account
                  </label>
                  <input
                    type="text"
                    value={mvolaNum}
                    onChange={(e) => setMvolaNum(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Orange Money Account
                  </label>
                  <input
                    type="text"
                    value={orangeNum}
                    onChange={(e) => setOrangeNum(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Airtel Money Account
                  </label>
                  <input
                    type="text"
                    value={airtelNum}
                    onChange={(e) => setAirtelNum(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Cash Office Hours at Base
                </label>
                <input
                  type="text"
                  value={cashHours}
                  onChange={(e) => setCashHours(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('reminders')}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
              >
                Back to Reminders
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow-sm"
              >
                Save Settings
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
