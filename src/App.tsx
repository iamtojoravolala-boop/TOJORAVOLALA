import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { SubscriberTable } from './components/SubscriberTable';
import { SubscriberModal } from './components/SubscriberModal';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { HistoryModal } from './components/HistoryModal';
import { ReminderModal } from './components/ReminderModal';
import { RateChangeModal } from './components/RateChangeModal';
import { ManageRatesModal } from './components/ManageRatesModal';
import { PrintableLedger } from './components/PrintableLedger';
import { AnalyticsView } from './components/AnalyticsView';
import { SubscriberPortal } from './components/SubscriberPortal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ChangeAdminPasswordModal } from './components/ChangeAdminPasswordModal';
import { INITIAL_SUBSCRIBERS } from './data/initialData';
import { 
  Subscriber, 
  SubscriptionHistoryRecord, 
  BaseSettings, 
  DEFAULT_SETTINGS,
  PaymentMethod,
  PlanPreset,
  YWAM_PRESETS
} from './types';
import { 
  exportToCsv, 
  parseCsv, 
  getTodayIso, 
  getCurrentCyclePeriod,
  getCycleLabel,
  generateReceiptNumber,
  calculateNextDueDate,
  formatMga
} from './utils/formatters';
import { Bell, AlertTriangle, Tag, Lock, ShieldCheck, KeyRound } from 'lucide-react';

const STORAGE_KEY_SUBSCRIBERS = 'ywam_loc_subscribers_v2';
const STORAGE_KEY_SETTINGS = 'ywam_loc_settings_v2';
const STORAGE_KEY_PACKAGES = 'ywam_loc_packages_v2';
const STORAGE_KEY_THEME = 'ywam_loc_theme';
const STORAGE_KEY_ADMIN_PASSWORD = 'ywam_loc_admin_password_v1';
const STORAGE_KEY_ADMIN_AUTH = 'ywam_loc_admin_auth_session';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved !== null) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Data state
  const [subscribers, setSubscribers] = useState<Subscriber[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SUBSCRIBERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse subscribers from localStorage', e);
    }
    return INITIAL_SUBSCRIBERS;
  });

  const [settings, setSettings] = useState<BaseSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse settings', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [packages, setPackages] = useState<PlanPreset[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PACKAGES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse packages from localStorage', e);
    }
    return YWAM_PRESETS;
  });

  // UI state
  const [currentTab, setCurrentTab] = useState<'portal' | 'table' | 'ledger' | 'analytics'>('portal');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeSubscriberId, setActiveSubscriberId] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('ywam_loc_active_sub_id');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return 1;
  });

  useEffect(() => {
    localStorage.setItem('ywam_loc_active_sub_id', String(activeSubscriberId));
  }, [activeSubscriberId]);

  const activeSubscriber = subscribers.find((s) => s.id === activeSubscriberId) || subscribers[0] || null;

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [subscriberToEdit, setSubscriberToEdit] = useState<Subscriber | null>(null);

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [subscriberToPay, setSubscriberToPay] = useState<Subscriber | null>(null);

  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [subscriberForReceipt, setSubscriberForReceipt] = useState<Subscriber | null>(null);
  const [historyRecordForReceipt, setHistoryRecordForReceipt] = useState<SubscriptionHistoryRecord | null>(null);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [subscriberForHistory, setSubscriberForHistory] = useState<Subscriber | null>(null);

  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [selectedReminderSubId, setSelectedReminderSubId] = useState<number | undefined>(undefined);

  // Rate Change Modals state
  const [isRateChangeOpen, setIsRateChangeOpen] = useState(false);
  const [subsForRateChange, setSubsForRateChange] = useState<Subscriber[]>([]);
  const [isManageRatesOpen, setIsManageRatesOpen] = useState(false);

  // Admin Authentication State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY_ADMIN_AUTH) === 'true';
    } catch {
      return false;
    }
  });

  const [adminPassword, setAdminPassword] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ADMIN_PASSWORD);
      if (saved) return saved;
    } catch (e) {
      console.error(e);
    }
    return 'canaan-admin'; // Default password for YWAM Canaan
  });

  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [pendingAdminAction, setPendingAdminAction] = useState<(() => void) | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'light');
    }
  }, [darkMode]);

  // Persist subscribers
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SUBSCRIBERS, JSON.stringify(subscribers));
  }, [subscribers]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Persist rate packages
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PACKAGES, JSON.stringify(packages));
  }, [packages]);

  // Calculate subscribers needing reminders
  const overdueAndDueSoon = subscribers.filter((s) => {
    if (s.paymentDate) return false;
    const { daysRemaining } = calculateNextDueDate(s.subscriptionDate, s.billingDayOfMonth);
    return daysRemaining <= settings.reminderDaysBeforeDue;
  });

  // Handlers
  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleOpenAddSubscriber = () => {
    setSubscriberToEdit(null);
    setIsAddEditOpen(true);
  };

  const handleEditSubscriber = (sub: Subscriber) => {
    setSubscriberToEdit(sub);
    setIsAddEditOpen(true);
  };

  const handleDeleteSubscriber = (id: number) => {
    const target = subscribers.find((s) => s.id === id);
    if (!target) return;
    if (window.confirm(`Delete subscriber "${target.name}" (N° ${target.id})?`)) {
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleSaveSubscriber = (savedSub: Subscriber) => {
    setSubscribers((prev) => {
      const exists = prev.some((s) => s.id === savedSub.id);
      if (exists) {
        return prev.map((s) => (s.id === savedSub.id ? { ...savedSub, history: s.history || [] } : s));
      } else {
        return [...prev, { ...savedSub, history: [] }];
      }
    });
    setIsAddEditOpen(false);
  };

  // Quick Payment Handlers
  const handleOpenQuickPay = (sub: Subscriber) => {
    setSubscriberToPay(sub);
    setIsPaymentOpen(true);
  };

  const handleConfirmPayment = (
    subscriberId: number,
    paymentDate: string,
    paymentMethod: PaymentMethod,
    note: string
  ) => {
    const currentPeriod = getCurrentCyclePeriod();
    const currentLabel = getCycleLabel(currentPeriod);

    setSubscribers((prev) =>
      prev.map((sub) => {
        if (sub.id !== subscriberId) return sub;

        const newHistoryRecord: SubscriptionHistoryRecord = {
          id: `hist-${Date.now()}`,
          subscriberId: sub.id,
          cyclePeriod: currentPeriod,
          cycleLabel: currentLabel,
          subscriptionDate: sub.subscriptionDate,
          paymentDate,
          monthlyRateMga: sub.monthlyRateMga,
          monthlyDataGb: sub.monthlyDataGb,
          paymentMethod,
          receiptNumber: generateReceiptNumber(sub, paymentDate),
          observation: note ? `${note} (Settled on ${paymentDate})` : sub.observation,
          recordedAt: new Date().toISOString(),
        };

        const updatedHistory = [newHistoryRecord, ...(sub.history || [])];

        const updatedObs = note
          ? sub.observation
            ? `${sub.observation}. ${note}`
            : note
          : sub.observation;

        return {
          ...sub,
          paymentDate,
          paymentMethod,
          status: 'paid',
          observation: updatedObs,
          history: updatedHistory,
          lastUpdated: new Date().toISOString(),
        };
      })
    );

    setIsPaymentOpen(false);

    // Open receipt modal automatically
    const targetSub = subscribers.find((s) => s.id === subscriberId);
    if (targetSub) {
      setSubscriberForReceipt({
        ...targetSub,
        paymentDate,
        paymentMethod,
        status: 'paid',
      });
      setHistoryRecordForReceipt(null);
      setIsReceiptOpen(true);
    }
  };

  // View Receipt
  const handleViewReceipt = (sub: Subscriber) => {
    setSubscriberForReceipt(sub);
    setHistoryRecordForReceipt(null);
    setIsReceiptOpen(true);
  };

  const handleViewReceiptFromHistory = (sub: Subscriber, record: SubscriptionHistoryRecord) => {
    setSubscriberForReceipt(sub);
    setHistoryRecordForReceipt(record);
    setIsReceiptOpen(true);
  };

  // View History
  const handleViewHistory = (sub: Subscriber) => {
    setSubscriberForHistory(sub);
    setIsHistoryOpen(true);
  };

  const handleAddHistoryRecord = (subscriberId: number, record: SubscriptionHistoryRecord) => {
    setSubscribers((prev) =>
      prev.map((sub) => {
        if (sub.id !== subscriberId) return sub;
        return {
          ...sub,
          history: [record, ...(sub.history || [])],
        };
      })
    );
    setSubscriberForHistory((prev) => {
      if (!prev || prev.id !== subscriberId) return prev;
      return {
        ...prev,
        history: [record, ...(prev.history || [])],
      };
    });
  };

  const handleDeleteHistoryRecord = (subscriberId: number, recordId: string) => {
    setSubscribers((prev) =>
      prev.map((sub) => {
        if (sub.id !== subscriberId) return sub;
        return {
          ...sub,
          history: (sub.history || []).filter((h) => h.id !== recordId),
        };
      })
    );
    setSubscriberForHistory((prev) => {
      if (!prev || prev.id !== subscriberId) return prev;
      return {
        ...prev,
        history: (prev.history || []).filter((h) => h.id !== recordId),
      };
    });
  };

  // Rate Editing Handlers
  const handleOpenQuickEditRate = (sub: Subscriber) => {
    setSubsForRateChange([sub]);
    setIsRateChangeOpen(true);
  };

  const handleOpenBatchChangeRates = (selectedSubs: Subscriber[]) => {
    setSubsForRateChange(selectedSubs);
    setIsRateChangeOpen(true);
  };

  const handleConfirmRateChange = (
    subscriberIds: number[],
    newRateMga: number,
    newDataGb?: number,
    logNote?: string
  ) => {
    const today = getTodayIso();
    setSubscribers((prev) =>
      prev.map((sub) => {
        if (!subscriberIds.includes(sub.id)) return sub;
        const oldRate = sub.monthlyRateMga;
        const noteText = logNote
          ? logNote
          : `Rate manually adjusted from ${formatMga(oldRate)} to ${formatMga(newRateMga)} on ${today}`;

        const updatedObs = sub.observation
          ? `${sub.observation}. [${noteText}]`
          : `[${noteText}]`;

        return {
          ...sub,
          monthlyRateMga: newRateMga,
          monthlyDataGb: newDataGb !== undefined ? newDataGb : sub.monthlyDataGb,
          observation: updatedObs,
          lastUpdated: new Date().toISOString(),
        };
      })
    );
  };

  const handleApplyPackageToSubscribers = (
    packageName: string,
    newRateMga: number,
    newDataGb: number
  ) => {
    setSubscribers((prev) =>
      prev.map((sub) => {
        return {
          ...sub,
          monthlyRateMga: newRateMga,
          monthlyDataGb: newDataGb,
          observation: sub.observation
            ? `${sub.observation}. [Rate updated to ${packageName} tier (${formatMga(newRateMga)})]`
            : `[Rate updated to ${packageName} tier (${formatMga(newRateMga)})]`,
          lastUpdated: new Date().toISOString(),
        };
      })
    );
  };

  // Reminders
  const handleOpenReminders = (sub?: Subscriber) => {
    if (sub) {
      setSelectedReminderSubId(sub.id);
    } else {
      setSelectedReminderSubId(overdueAndDueSoon[0]?.id || subscribers[0]?.id);
    }
    setIsReminderOpen(true);
  };

  const handleMarkReminderSent = (subscriberId: number) => {
    const today = getTodayIso();
    setSubscribers((prev) =>
      prev.map((sub) => {
        if (sub.id !== subscriberId) return sub;
        return {
          ...sub,
          lastReminderSent: today,
          reminderCount: (sub.reminderCount || 0) + 1,
        };
      })
    );
  };

  // CSV Import/Export
  const handleExportCsv = () => {
    exportToCsv(subscribers);
  };

  const handleImportCsvClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const parsed = parseCsv(content);
      if (parsed.length === 0) {
        alert('Could not parse any valid subscriber rows from CSV file.');
        return;
      }

      setSubscribers((prev) => {
        let maxId = prev.reduce((max, s) => Math.max(max, s.id), 0);
        const newItems: Subscriber[] = parsed.map((item) => {
          maxId++;
          return {
            id: item.id || maxId,
            name: item.name || 'Unknown Subscriber',
            subscriptionDate: item.subscriptionDate || getTodayIso(),
            monthlyDataGb: item.monthlyDataGb || 20,
            monthlyRateMga: item.monthlyRateMga || 50000,
            paymentDate: item.paymentDate || null,
            observation: item.observation || '',
            status: item.paymentDate ? 'paid' : 'pending',
            category: 'Staff',
            history: [],
          };
        });
        return [...prev, ...newItems];
      });

      alert(`Successfully imported ${parsed.length} subscriber(s)!`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsText(file);
  };

  const handleResetData = () => {
    setSubscribers(INITIAL_SUBSCRIBERS);
    setSettings(DEFAULT_SETTINGS);
    setPackages(YWAM_PRESETS);
    localStorage.removeItem(STORAGE_KEY_SUBSCRIBERS);
    localStorage.removeItem(STORAGE_KEY_SETTINGS);
    localStorage.removeItem(STORAGE_KEY_PACKAGES);
  };

  // Admin Security Wrappers
  const handleRequestAdminAction = (action: () => void) => {
    if (isAdmin) {
      action();
    } else {
      setPendingAdminAction(() => action);
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    try {
      sessionStorage.setItem(STORAGE_KEY_ADMIN_AUTH, 'true');
    } catch (e) {
      console.error(e);
    }
    setIsAdminLoginOpen(false);
    if (pendingAdminAction) {
      pendingAdminAction();
      setPendingAdminAction(null);
    } else {
      setCurrentTab('table');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    try {
      sessionStorage.removeItem(STORAGE_KEY_ADMIN_AUTH);
    } catch (e) {
      console.error(e);
    }
    setCurrentTab('portal');
  };

  const handleUpdateAdminPassword = (newPass: string) => {
    setAdminPassword(newPass);
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_PASSWORD, newPass);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTabChange = (tab: 'portal' | 'table' | 'ledger' | 'analytics') => {
    if (tab === 'portal') {
      setCurrentTab('portal');
    } else if (isAdmin) {
      setCurrentTab(tab);
    } else {
      setPendingAdminAction(() => () => setCurrentTab(tab));
      setIsAdminLoginOpen(true);
    }
  };

  // Next available ID for subscriber creation
  const nextId = subscribers.reduce((max, s) => Math.max(max, s.id), 0) + 1;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-sky-200 selection:text-sky-900">
      {/* Hidden file input for CSV import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv,text/csv"
        className="hidden"
      />

      {/* Top Bar Header */}
      <Header
        currentTab={currentTab}
        onTabChange={handleTabChange}
        onNewSubscriber={handleOpenAddSubscriber}
        onOpenReminders={() => handleRequestAdminAction(() => handleOpenReminders())}
        onOpenManageRates={() => handleRequestAdminAction(() => setIsManageRatesOpen(true))}
        onExportCsv={() => handleRequestAdminAction(handleExportCsv)}
        onImportCsvClick={() => handleRequestAdminAction(handleImportCsvClick)}
        onPrintLedger={() => handleRequestAdminAction(() => setCurrentTab('ledger'))}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        remindersDueCount={overdueAndDueSoon.length}
        isAdmin={isAdmin}
        onAdminLoginClick={() => {
          setPendingAdminAction(null);
          setIsAdminLoginOpen(true);
        }}
        onAdminLogout={handleAdminLogout}
        onChangeAdminPasswordClick={() => setIsChangePasswordOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Due Date & Reminder Alert Notice if any overdue or due soon (visible in Admin Console) */}
        {overdueAndDueSoon.length > 0 && currentTab === 'table' && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <strong className="font-semibold">
                  {overdueAndDueSoon.length} subscriber(s) due or overdue for internet payment.
                </strong>{' '}
                <span className="text-amber-700 dark:text-amber-300">
                  Send WhatsApp/SMS reminders with YWAM Canaan mobile money info.
                </span>
              </div>
            </div>
            <button
              onClick={() => handleOpenReminders()}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Review Reminders</span>
            </button>
          </div>
        )}

        {/* View Switch: Subscriber Self-Service User Interface (Default) */}
        {currentTab === 'portal' && (
          <SubscriberPortal
            subscribers={subscribers}
            packages={packages}
            settings={settings}
            activeSubscriber={activeSubscriber}
            onSelectSubscriber={(sub) => setActiveSubscriberId(sub.id)}
            onConfirmPayment={handleConfirmPayment}
            onUpdateRate={handleOpenQuickEditRate}
            onViewReceipt={handleViewReceipt}
            onNewRegistration={handleOpenAddSubscriber}
            onSwitchToAdmin={() => handleRequestAdminAction(() => setCurrentTab('table'))}
          />
        )}

        {/* Protection Gate: If user tries to access admin views without authenticating */}
        {currentTab !== 'portal' && !isAdmin && (
          <div className="py-16 sm:py-24 max-w-md mx-auto text-center space-y-4 px-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 mx-auto flex items-center justify-center shadow-xs">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Admin Authentication Required
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                The Staff Console and subscriber database are restricted to authorized YWAM Land of Canaan administration & finance staff only.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentTab('portal')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Back to User Portal
              </button>
              <button
                type="button"
                onClick={() => setIsAdminLoginOpen(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-sky-700 hover:bg-sky-800 dark:bg-sky-600 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Log In as Admin</span>
              </button>
            </div>
          </div>
        )}

        {/* View Switch: Subscribers Admin Table (Protected) */}
        {currentTab === 'table' && isAdmin && (
          <div>
            {/* KPI Stats Cards */}
            <StatsCards
              subscribers={subscribers}
              onFilterStatus={(status) => setStatusFilter(status)}
              activeStatusFilter={statusFilter}
            />

            {/* Subscriber Table */}
            <SubscriberTable
              subscribers={subscribers}
              onAddSubscriber={handleOpenAddSubscriber}
              onEditSubscriber={handleEditSubscriber}
              onDeleteSubscriber={handleDeleteSubscriber}
              onQuickPay={handleOpenQuickPay}
              onViewReceipt={handleViewReceipt}
              onViewHistory={handleViewHistory}
              onSendReminder={(sub) => handleOpenReminders(sub)}
              onQuickEditRate={handleOpenQuickEditRate}
              onBatchChangeRates={handleOpenBatchChangeRates}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />
          </div>
        )}

        {/* View Switch: Official Printable Ledger Sheet (Protected) */}
        {currentTab === 'ledger' && isAdmin && (
          <PrintableLedger subscribers={subscribers} />
        )}

        {/* View Switch: Summary Analytics & Rates (Protected) */}
        {currentTab === 'analytics' && isAdmin && (
          <AnalyticsView
            subscribers={subscribers}
            packages={packages}
            onOpenManageRates={() => setIsManageRatesOpen(true)}
            onExportCsv={handleExportCsv}
            onResetData={handleResetData}
            onSelectSubscriberForHistory={handleViewHistory}
          />
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="no-print mt-auto border-t border-slate-200 dark:border-slate-800 py-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            YWAM Land of Canaan · Campus Internet Subscription Database
          </div>
          <div className="flex items-center gap-3">
            <span>Rates in Malagasy Ariary (MGA)</span>
            <span>·</span>
            <span>Local Time: Nov 2026</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SubscriberModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        onSave={handleSaveSubscriber}
        subscriberToEdit={subscriberToEdit}
        nextId={nextId}
        packages={packages}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        subscriber={subscriberToPay}
        onConfirmPayment={handleConfirmPayment}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        subscriber={subscriberForReceipt}
        historyRecord={historyRecordForReceipt}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        subscriber={subscriberForHistory}
        onAddHistoryRecord={handleAddHistoryRecord}
        onDeleteHistoryRecord={handleDeleteHistoryRecord}
        onViewReceiptFromHistory={handleViewReceiptFromHistory}
      />

      <ReminderModal
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        subscribers={subscribers}
        settings={settings}
        onUpdateSettings={setSettings}
        onMarkReminderSent={handleMarkReminderSent}
        selectedSubscriberId={selectedReminderSubId}
      />

      {/* Manual Rate Changer Modal */}
      <RateChangeModal
        isOpen={isRateChangeOpen}
        onClose={() => setIsRateChangeOpen(false)}
        subscribers={subsForRateChange}
        packages={packages}
        onConfirmRateChange={handleConfirmRateChange}
      />

      {/* Manage Rate Packages & Tariffs Modal */}
      <ManageRatesModal
        isOpen={isManageRatesOpen}
        onClose={() => setIsManageRatesOpen(false)}
        packages={packages}
        subscribers={subscribers}
        onSavePackages={setPackages}
        onApplyPackageToSubscribers={handleApplyPackageToSubscribers}
      />

      {/* Admin Authentication & Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
        currentPassword={adminPassword}
      />

      {/* Change Admin Password Modal */}
      <ChangeAdminPasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        currentPassword={adminPassword}
        onUpdatePassword={handleUpdateAdminPassword}
      />
    </div>
  );
}
