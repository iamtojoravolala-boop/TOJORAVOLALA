import { Subscriber, BaseSettings, PaymentStatus } from '../types';

export function formatMga(amount: number): string {
  const formatted = new Intl.NumberFormat('fr-MG').format(amount);
  return `${formatted} MGA`;
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return dateString;
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getTodayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentCyclePeriod(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getCycleLabel(cyclePeriod: string): string {
  try {
    const [year, month] = cyclePeriod.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
  } catch {
    return cyclePeriod;
  }
}

/**
 * Calculates the monthly due date for a given subscription date.
 * Typically the anniversary day of the month (e.g. 10th of every month).
 */
export function calculateNextDueDate(
  subscriptionDate: string,
  customBillingDay?: number,
  refDate: Date = new Date()
): { dueDate: Date; dueDateStr: string; daysRemaining: number } {
  let billingDay = customBillingDay;
  if (!billingDay && subscriptionDate) {
    const parts = subscriptionDate.split('-');
    if (parts.length === 3) {
      billingDay = parseInt(parts[2], 10);
    }
  }
  if (!billingDay || isNaN(billingDay)) {
    billingDay = 1;
  }

  const currentYear = refDate.getFullYear();
  const currentMonth = refDate.getMonth(); // 0-indexed

  // Ensure day doesn't exceed days in this month
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dayThisMonth = Math.min(billingDay, daysInCurrentMonth);

  const dueDateThisMonth = new Date(currentYear, currentMonth, dayThisMonth);
  
  // Calculate difference in days (ignoring hours)
  const todayReset = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());
  const dueReset = new Date(dueDateThisMonth.getFullYear(), dueDateThisMonth.getMonth(), dueDateThisMonth.getDate());
  
  const diffTime = dueReset.getTime() - todayReset.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const yyyy = dueDateThisMonth.getFullYear();
  const mm = String(dueDateThisMonth.getMonth() + 1).padStart(2, '0');
  const dd = String(dueDateThisMonth.getDate()).padStart(2, '0');

  return {
    dueDate: dueDateThisMonth,
    dueDateStr: `${yyyy}-${mm}-${dd}`,
    daysRemaining: diffDays,
  };
}

/**
 * Evaluates payment status considering current date, payment date, and reminder window
 */
export function evaluateSubscriberStatus(
  subscriber: Subscriber,
  reminderDaysThreshold = 3,
  refDate: Date = new Date()
): PaymentStatus {
  // If paymentDate is provided for this current period
  if (subscriber.paymentDate) {
    // Check if payment was made in current month or future
    return 'paid';
  }

  const { daysRemaining } = calculateNextDueDate(
    subscriber.subscriptionDate,
    subscriber.billingDayOfMonth,
    refDate
  );

  if (daysRemaining < 0) {
    return 'overdue';
  }
  if (daysRemaining <= reminderDaysThreshold) {
    return 'due_soon';
  }
  return 'pending';
}

/**
 * Formats a friendly WhatsApp / SMS reminder in English or French for YWAM Land of Canaan
 */
export function generateReminderMessage(
  subscriber: Subscriber,
  settings: BaseSettings,
  language: 'en' | 'fr' = 'en'
): string {
  const { dueDateStr, daysRemaining } = calculateNextDueDate(subscriber.subscriptionDate, subscriber.billingDayOfMonth);
  const formattedDueDate = formatDate(dueDateStr);
  const formattedRate = formatMga(subscriber.monthlyRateMga);

  if (language === 'fr') {
    let timingMsg = `arrivera à échéance le ${formattedDueDate} (dans ${daysRemaining} jours).`;
    if (daysRemaining === 0) timingMsg = `arrive à échéance AUJOURD'HUI (${formattedDueDate}).`;
    if (daysRemaining < 0) timingMsg = `est en retard depuis le ${formattedDueDate} (${Math.abs(daysRemaining)} jours).`;

    return `Bonjour ${subscriber.name},

Rappel amical de ${settings.baseName} :
Votre abonnement Internet (${subscriber.monthlyDataGb} Go) ${timingMsg}

Montant à régler : ${formattedRate}

Options de paiement :
- MVola : ${settings.mvolaNumber}
- Orange Money : ${settings.orangeMoneyNumber}
- Airtel Money : ${settings.airtelMoneyNumber}
- En espèces : Bureau des finances (${settings.cashOfficeHours})

Merci de préciser votre nom ou N° ${subscriber.id} lors du paiement.
Bénédictions,
${settings.treasurerName} - ${settings.baseName}`;
  }

  let timingMsg = `is due on ${formattedDueDate} (${daysRemaining} days remaining).`;
  if (daysRemaining === 0) timingMsg = `is due TODAY (${formattedDueDate}).`;
  if (daysRemaining < 0) timingMsg = `is OVERDUE since ${formattedDueDate} (${Math.abs(daysRemaining)} days ago).`;

  return `Hello ${subscriber.name},

Friendly reminder from ${settings.baseName}:
Your Internet Subscription (${subscriber.monthlyDataGb} GB) ${timingMsg}

Monthly Rate: ${formattedRate}

Payment Options:
- MVola: ${settings.mvolaNumber}
- Orange Money: ${settings.orangeMoneyNumber}
- Airtel Money: ${settings.airtelMoneyNumber}
- Cash: Base Finance Office (${settings.cashOfficeHours})

Please reference your name or Subscriber N° ${subscriber.id} with your payment.
Blessings,
${settings.treasurerName} · ${settings.baseName}`;
}

export function generateReceiptNumber(subscriber: Subscriber, paymentDate: string): string {
  const parts = paymentDate.split('-');
  const year = parts[0] || '2026';
  const month = parts[1] || '11';
  return `YLOC-NET-${year}${month}-${String(subscriber.id).padStart(3, '0')}`;
}

export function exportToCsv(subscribers: Subscriber[]): void {
  const headers = [
    'N',
    'Name of the Subscriber',
    'Date of Subscription',
    'Monthly Data Consumption (GB)',
    'Monthly Rate (MGA)',
    'Date of Payment',
    'Observation',
    'Category',
    'Phone',
    'Payment Method',
    'Payment Status',
    'Last Reminder'
  ];

  const rows = subscribers.map((sub) => [
    sub.id,
    `"${sub.name.replace(/"/g, '""')}"`,
    sub.subscriptionDate,
    sub.monthlyDataGb,
    sub.monthlyRateMga,
    sub.paymentDate || '',
    `"${(sub.observation || '').replace(/"/g, '""')}"`,
    sub.category || '',
    sub.phone || '',
    sub.paymentMethod || '',
    sub.status,
    sub.lastReminderSent || ''
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `YWAM_Land_of_Canaan_Internet_Database_${getTodayIso()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseCsv(csvText: string): Partial<Subscriber>[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const results: Partial<Subscriber>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values: string[] = [];
    let insideQuotes = false;
    let currentValue = '';

    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"' && line[c + 1] === '"') {
        currentValue += '"';
        c++;
      } else if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue);

    if (values.length >= 2 && values[1].trim()) {
      const idNum = parseInt(values[0], 10);
      const name = values[1].trim();
      const subDate = values[2]?.trim() || getTodayIso();
      const dataGb = parseFloat(values[3]) || 20;
      const rateMga = parseFloat(values[4]) || 50000;
      const paymentDate = values[5]?.trim() ? values[5].trim() : null;
      const observation = values[6]?.trim() || '';

      results.push({
        id: isNaN(idNum) ? undefined : idNum,
        name,
        subscriptionDate: subDate,
        monthlyDataGb: dataGb,
        monthlyRateMga: rateMga,
        paymentDate,
        observation,
        status: paymentDate ? 'paid' : 'pending',
      });
    }
  }

  return results;
}
