import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles, HelpCircle } from 'lucide-react';
import { Subscriber, SubscriberCategory, PaymentMethod, YWAM_PRESETS, PlanPreset } from '../types';
import { getTodayIso, formatMga } from '../utils/formatters';

interface SubscriberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subscriber: Subscriber) => void;
  subscriberToEdit?: Subscriber | null;
  nextId: number;
  packages?: PlanPreset[];
}

export const SubscriberModal: React.FC<SubscriberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subscriberToEdit,
  nextId,
  packages = YWAM_PRESETS,
}) => {
  const [name, setName] = useState('');
  const [subscriptionDate, setSubscriptionDate] = useState(getTodayIso());
  const [monthlyDataGb, setMonthlyDataGb] = useState<number>(30);
  const [monthlyRateMga, setMonthlyRateMga] = useState<number>(60000);
  const [hasPaid, setHasPaid] = useState(false);
  const [paymentDate, setPaymentDate] = useState<string>(getTodayIso());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [observation, setObservation] = useState('');
  const [category, setCategory] = useState<SubscriberCategory>('Staff');
  const [phone, setPhone] = useState('');
  const [customId, setCustomId] = useState<number>(nextId);

  useEffect(() => {
    if (subscriberToEdit) {
      setCustomId(subscriberToEdit.id);
      setName(subscriberToEdit.name);
      setSubscriptionDate(subscriberToEdit.subscriptionDate);
      setMonthlyDataGb(subscriberToEdit.monthlyDataGb);
      setMonthlyRateMga(subscriberToEdit.monthlyRateMga);
      setHasPaid(!!subscriberToEdit.paymentDate);
      setPaymentDate(subscriberToEdit.paymentDate || getTodayIso());
      setPaymentMethod(subscriberToEdit.paymentMethod || 'Cash');
      setObservation(subscriberToEdit.observation || '');
      setCategory(subscriberToEdit.category || 'Staff');
      setPhone(subscriberToEdit.phone || '');
    } else {
      setCustomId(nextId);
      setName('');
      setSubscriptionDate(getTodayIso());
      setMonthlyDataGb(30);
      setMonthlyRateMga(60000);
      setHasPaid(false);
      setPaymentDate(getTodayIso());
      setPaymentMethod('Cash');
      setObservation('');
      setCategory('Staff');
      setPhone('');
    }
  }, [subscriberToEdit, nextId, isOpen]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: PlanPreset) => {
    setMonthlyDataGb(preset.dataGb);
    setMonthlyRateMga(preset.rateMga);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const status = hasPaid ? 'paid' : 'pending';

    const newSubscriber: Subscriber = {
      id: customId,
      name: name.trim(),
      subscriptionDate: subscriptionDate || getTodayIso(),
      monthlyDataGb: Number(monthlyDataGb) || 0,
      monthlyRateMga: Number(monthlyRateMga) || 0,
      paymentDate: hasPaid ? paymentDate : null,
      paymentMethod: hasPaid ? paymentMethod : undefined,
      observation: observation.trim(),
      status,
      category,
      phone: phone.trim() || undefined,
      lastUpdated: new Date().toISOString(),
    };

    onSave(newSubscriber);
  };

  const quickObservationSnippets = [
    'Paid via MVola',
    'Paid via Orange Money',
    'Paid via Airtel Money',
    'Paid cash at Base Finance',
    'Staff House B3',
    'DTS 2026 Student',
    'Guest House Room',
    'Speed throttled - high usage',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {subscriberToEdit ? 'Edit Subscriber Record' : 'Add New Subscriber'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              YWAM Land of Canaan Internet Subscription Database
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quick Plan Presets Bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Quick Subscription Packages
              </label>
              <span className="text-[11px] text-slate-400">Click to apply standard rates</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {packages.map((preset) => {
                const isSelected =
                  monthlyDataGb === preset.dataGb && monthlyRateMga === preset.rateMga;
                return (
                  <button
                    type="button"
                    key={preset.name}
                    onClick={() => handleApplyPreset(preset)}
                    className={`p-2 text-left rounded-lg border text-xs transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/40 dark:border-sky-500 font-medium'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="font-semibold text-slate-900 dark:text-white">{preset.name}</div>
                    <div className="font-mono text-slate-600 dark:text-slate-300 mt-0.5 tabular-nums">
                      {preset.dataGb} GB · {formatMga(preset.rateMga)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row: N (ID) & Subscriber Name */}
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                N° (ID)
              </label>
              <input
                type="number"
                min="1"
                value={customId}
                onChange={(e) => setCustomId(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-center"
                required
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Name of the Subscriber <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tojo Ravelonarivo or DTS Classroom"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Row: Category & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subscriber Group / Role
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SubscriberCategory)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
              >
                <option value="Staff">Staff</option>
                <option value="DTS Student">DTS Student</option>
                <option value="Guest House">Guest House</option>
                <option value="Base Office">Base Office</option>
                <option value="Ministry / Clinic">Ministry / Clinic</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone / WhatsApp
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+261 34 00 000 00"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Row: Date of Subscription, Monthly Data (GB), Monthly Rate (MGA) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date of Subscription
              </label>
              <input
                type="date"
                value={subscriptionDate}
                onChange={(e) => setSubscriptionDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Data Quota (GB)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={monthlyDataGb}
                  onChange={(e) => setMonthlyDataGb(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 pr-10 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-slate-900 dark:text-white"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                  GB
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monthly Rate (MGA)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={monthlyRateMga}
                  onChange={(e) => setMonthlyRateMga(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 pr-12 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-slate-900 dark:text-white"
                  required
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-medium text-slate-400">
                  MGA
                </span>
              </div>
            </div>
          </div>

          {/* Payment Status Accordion */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasPaid}
                  onChange={(e) => setHasPaid(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Mark as Paid for current month
                </span>
              </label>
              {hasPaid && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {formatMga(monthlyRateMga)}
                </span>
              )}
            </div>

            {hasPaid && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                    Date of Payment
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Cash">Cash (Base Office)</option>
                    <option value="MVola">MVola (Telma)</option>
                    <option value="Orange Money">Orange Money</option>
                    <option value="Airtel Money">Airtel Money</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Observation Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Observation (Notes, room, payment refs, quota restrictions)
              </label>
            </div>
            <textarea
              rows={2}
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="e.g. Paid cash at Base Office. House 3 room 4. Staff rate."
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
            />
            {/* Quick tag chips for quick insert into observation */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              <span className="text-[11px] text-slate-400 mr-1 self-center">Insert note:</span>
              {quickObservationSnippets.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => {
                    setObservation((prev) => (prev ? `${prev}. ${tag}` : tag));
                  }}
                  className="text-[10px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-0.5 rounded transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{subscriberToEdit ? 'Save Changes' : 'Add Subscriber'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
