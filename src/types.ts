export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'due_soon';

export type PaymentMethod = 'MVola' | 'Orange Money' | 'Airtel Money' | 'Cash' | 'Bank Transfer' | 'Other';

export type SubscriberCategory = 'Staff' | 'DTS Student' | 'Guest House' | 'Base Office' | 'Ministry / Clinic' | 'Other';

export interface SubscriptionHistoryRecord {
  id: string; // Unique record ID
  subscriberId: number;
  cyclePeriod: string; // e.g. "2026-11" (November 2026)
  cycleLabel: string; // e.g. "November 2026"
  subscriptionDate: string; // Active subscription date for this cycle
  paymentDate: string | null; // Date of payment or null if unpaid
  monthlyRateMga: number; // Monthly rate for this period in MGA
  monthlyDataGb: number; // Data consumption quota in GB
  paymentMethod?: PaymentMethod;
  receiptNumber?: string;
  observation?: string;
  recordedAt: string;
}

export interface Subscriber {
  id: number; // Corresponds to 'N' in the PDF (1, 2, 3...)
  name: string; // Name of the Subscriber
  subscriptionDate: string; // Date of Subscription (YYYY-MM-DD)
  monthlyDataGb: number; // Monthly Data Consumption (GB)
  monthlyRateMga: number; // Monthly Rate (MGA)
  paymentDate: string | null; // Date of Payment for current active cycle
  observation: string; // Observation
  status: PaymentStatus;
  category?: SubscriberCategory;
  phone?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  billingDayOfMonth?: number; // Day of month (1-31), defaults to day of subscriptionDate
  lastReminderSent?: string | null; // ISO Date of last reminder sent
  reminderCount?: number;
  history?: SubscriptionHistoryRecord[]; // Historical ledger of past cycles
  lastUpdated?: string;
}

export interface PlanPreset {
  id?: string;
  name: string;
  dataGb: number;
  rateMga: number;
  description: string;
}

export const YWAM_PRESETS: PlanPreset[] = [
  { id: 'plan-student', name: 'Student Essential', dataGb: 15, rateMga: 35000, description: 'Basic study & messaging for DTS students' },
  { id: 'plan-staff', name: 'Standard Staff', dataGb: 30, rateMga: 60000, description: 'Daily staff communication & ministry work' },
  { id: 'plan-power', name: 'Power User / Family', dataGb: 60, rateMga: 100000, description: 'High-speed video calls & family research' },
  { id: 'plan-office', name: 'Base Office / Dept', dataGb: 100, rateMga: 150000, description: 'Operations, finance, and mission admin' },
  { id: 'plan-guest', name: 'Guest Daily / Flex', dataGb: 10, rateMga: 25000, description: 'Short-term visitors & mission teams' },
];

export interface BaseSettings {
  baseName: string;
  baseLocation: string;
  reminderDaysBeforeDue: number; // e.g. 3 or 5 days
  mvolaNumber: string;
  orangeMoneyNumber: string;
  airtelMoneyNumber: string;
  cashOfficeHours: string;
  treasurerName: string;
}

export const DEFAULT_SETTINGS: BaseSettings = {
  baseName: 'YWAM Land of Canaan',
  baseLocation: 'Antananarivo / Madagascar',
  reminderDaysBeforeDue: 3,
  mvolaNumber: '+261 34 88 123 45 (YWAM Finance)',
  orangeMoneyNumber: '+261 32 77 456 78 (YWAM Canaan)',
  airtelMoneyNumber: '+261 33 66 789 01 (YWAM Canaan)',
  cashOfficeHours: 'Mon - Fri, 08:30 - 16:30 at Base Admin',
  treasurerName: 'Finance Department',
};
