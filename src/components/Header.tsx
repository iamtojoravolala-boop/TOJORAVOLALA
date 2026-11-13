import React from 'react';
import { 
  Plus, 
  Printer, 
  FileText, 
  Sun, 
  Moon, 
  Bell, 
  Tag, 
  User, 
  LayoutDashboard, 
  Lock, 
  LogOut, 
  ShieldCheck, 
  KeyRound 
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'portal' | 'table' | 'ledger' | 'analytics';
  onTabChange: (tab: 'portal' | 'table' | 'ledger' | 'analytics') => void;
  onNewSubscriber: () => void;
  onOpenReminders: () => void;
  onOpenManageRates: () => void;
  onExportCsv: () => void;
  onImportCsvClick: () => void;
  onPrintLedger: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  remindersDueCount: number;
  isAdmin: boolean;
  onAdminLoginClick: () => void;
  onAdminLogout: () => void;
  onChangeAdminPasswordClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onNewSubscriber,
  onOpenReminders,
  onOpenManageRates,
  onExportCsv,
  onImportCsvClick,
  onPrintLedger,
  darkMode,
  onToggleDarkMode,
  remindersDueCount,
  isAdmin,
  onAdminLoginClick,
  onAdminLogout,
  onChangeAdminPasswordClick,
}) => {
  const handleAdminTabRequest = (tab: 'table' | 'ledger' | 'analytics') => {
    if (!isAdmin) {
      onAdminLoginClick();
    } else {
      onTabChange(tab);
    }
  };

  const handleAdminActionRequest = (action: () => void) => {
    if (!isAdmin) {
      onAdminLoginClick();
    } else {
      action();
    }
  };

  return (
    <header className="no-print bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-sky-700 text-white flex items-center justify-center font-bold tracking-wider shadow-sm">
              <span className="text-sm font-semibold">YWAM</span>
            </div>
            <div>
              <button 
                type="button"
                onClick={() => onTabChange('portal')} 
                className="text-left text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap block leading-tight hover:text-sky-700 dark:hover:text-sky-400 transition-colors cursor-pointer"
              >
                Land of Canaan
              </button>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block tracking-normal">
                Internet Subscription Portal
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (User Interface primary, Admin Console protected) */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onTabChange('portal')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                currentTab === 'portal'
                  ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>User Interface</span>
            </button>
            <button
              onClick={() => handleAdminTabRequest('table')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                currentTab === 'table'
                  ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Admin Console</span>
              {!isAdmin && <Lock className="w-3 h-3 text-slate-400 ml-0.5" />}
            </button>
            <button
              onClick={() => handleAdminTabRequest('ledger')}
              className={`hidden sm:flex px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 items-center gap-1.5 ${
                currentTab === 'ledger'
                  ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Printable Ledger</span>
              {!isAdmin && <Lock className="w-3 h-3 text-slate-400 ml-0.5" />}
            </button>
          </nav>

          {/* Zone 3: Primary Action & Direct Affordances */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Manage Rates Action */}
            <button
              onClick={() => handleAdminActionRequest(onOpenManageRates)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1"
              title={isAdmin ? "Manage internet rates & tariff packages" : "Admin login required to manage rates"}
              aria-label="Manage Rates"
            >
              <Tag className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-semibold">Rates</span>
              {!isAdmin && <Lock className="w-2.5 h-2.5 text-slate-400" />}
            </button>

            {/* Reminders Bell Action */}
            <button
              onClick={() => handleAdminActionRequest(onOpenReminders)}
              className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title={isAdmin ? "Track payment deadlines & send reminders" : "Admin login required for payment reminders"}
              aria-label="Payment Reminders"
            >
              <Bell className="w-4 h-4" />
              {remindersDueCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
            </button>

            {/* Dark mode switch */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Admin Session Controls / Login button */}
            {isAdmin ? (
              <div className="flex items-center gap-1 sm:gap-1.5 pl-1.5 sm:pl-2 border-l border-slate-200 dark:border-slate-800">
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Admin</span>
                </span>
                <button
                  type="button"
                  onClick={onChangeAdminPasswordClick}
                  className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Change Admin Password"
                  aria-label="Change Admin Password"
                >
                  <KeyRound className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onAdminLogout}
                  className="px-2 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1"
                  title="Log out of Admin Console"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onAdminLoginClick}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                title="Admin Authentication"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Admin Login</span>
              </button>
            )}

            {/* Register Line Action Button */}
            <button
              onClick={onNewSubscriber}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Register Line</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
