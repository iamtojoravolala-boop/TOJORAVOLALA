import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Check, RotateCcw, Tag, Users } from 'lucide-react';
import { PlanPreset, Subscriber, YWAM_PRESETS } from '../types';
import { formatMga } from '../utils/formatters';

interface ManageRatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  packages: PlanPreset[];
  subscribers: Subscriber[];
  onSavePackages: (packages: PlanPreset[]) => void;
  onApplyPackageToSubscribers?: (packageName: string, newRateMga: number, newDataGb: number) => void;
}

export const ManageRatesModal: React.FC<ManageRatesModalProps> = ({
  isOpen,
  onClose,
  packages,
  subscribers,
  onSavePackages,
  onApplyPackageToSubscribers,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRate, setEditRate] = useState(60000);
  const [editData, setEditData] = useState(30);
  const [editDesc, setEditDesc] = useState('');

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRate, setNewRate] = useState(50000);
  const [newData, setNewData] = useState(25);
  const [newDesc, setNewDesc] = useState('');

  if (!isOpen) return null;

  const handleStartEdit = (pkg: PlanPreset) => {
    setEditingId(pkg.id || pkg.name);
    setEditName(pkg.name);
    setEditRate(pkg.rateMga);
    setEditData(pkg.dataGb);
    setEditDesc(pkg.description);
  };

  const handleSaveEdit = (originalPkg: PlanPreset) => {
    const updated = packages.map((p) => {
      if ((p.id && p.id === originalPkg.id) || p.name === originalPkg.name) {
        return {
          ...p,
          name: editName.trim() || p.name,
          rateMga: Number(editRate) || 0,
          dataGb: Number(editData) || 0,
          description: editDesc.trim(),
        };
      }
      return p;
    });

    onSavePackages(updated);
    setEditingId(null);
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newPkg: PlanPreset = {
      id: `plan-${Date.now()}`,
      name: newName.trim(),
      rateMga: Number(newRate) || 0,
      dataGb: Number(newData) || 0,
      description: newDesc.trim() || 'Custom rate package',
    };

    onSavePackages([...packages, newPkg]);
    setIsAddingNew(false);
    setNewName('');
    setNewRate(50000);
    setNewData(25);
    setNewDesc('');
  };

  const handleDelete = (pkgToDelete: PlanPreset) => {
    if (packages.length <= 1) {
      alert('You must have at least one rate plan defined.');
      return;
    }
    if (window.confirm(`Delete rate plan "${pkgToDelete.name}"?`)) {
      onSavePackages(packages.filter((p) => p.name !== pkgToDelete.name));
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all packages back to YWAM Canaan standard rates?')) {
      onSavePackages(YWAM_PRESETS);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 rounded-lg">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Manage Internet Rate Packages
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure monthly tariffs (MGA) and bandwidth quotas for YWAM Land of Canaan
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Active Tariff Plans ({packages.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
                title="Reset to default presets"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddingNew(!isAddingNew)}
                className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingNew ? 'Cancel' : 'New Rate Package'}</span>
              </button>
            </div>
          </div>

          {/* Add New Rate Package Form */}
          {isAddingNew && (
            <form
              onSubmit={handleAddNew}
              className="p-4 bg-sky-50/50 dark:bg-sky-950/30 rounded-xl border border-sky-200 dark:border-sky-800 space-y-3"
            >
              <div className="text-xs font-bold text-sky-900 dark:text-sky-200">
                Create New Rate Package
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Package Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Intern Special"
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Rate (MGA)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={newRate}
                    onChange={(e) => setNewRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Quota (GB)
                  </label>
                  <input
                    type="number"
                    value={newData}
                    onChange={(e) => setNewData(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description / Eligibility
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. For outreach teams and visiting ministers"
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-semibold"
                >
                  Save Package
                </button>
              </div>
            </form>
          )}

          {/* List of existing packages */}
          <div className="space-y-2.5">
            {packages.map((pkg) => {
              const pkgId = pkg.id || pkg.name;
              const isEditing = editingId === pkgId;

              // Count subscribers currently paying this exact rate
              const matchingSubscribers = subscribers.filter(
                (s) => s.monthlyRateMga === pkg.rateMga
              );

              return (
                <div
                  key={pkg.name}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors"
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Monthly Rate (MGA)
                          </label>
                          <input
                            type="number"
                            step="1000"
                            value={editRate}
                            onChange={(e) => setEditRate(parseFloat(e.target.value) || 0)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Quota (GB)
                          </label>
                          <input
                            type="number"
                            value={editData}
                            onChange={(e) => setEditData(parseFloat(e.target.value) || 0)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        {onApplyPackageToSubscribers && matchingSubscribers.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Update all ${matchingSubscribers.length} subscribers on this rate to ${formatMga(
                                    editRate
                                  )} and ${editData} GB?`
                                )
                              ) {
                                onApplyPackageToSubscribers(pkg.name, editRate, editData);
                              }
                            }}
                            className="text-xs text-sky-700 dark:text-sky-400 hover:underline flex items-center gap-1 font-medium"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>
                              Update all {matchingSubscribers.length} active subscribers to this new rate
                            </span>
                          </button>
                        )}
                        <div className="flex items-center gap-2 ml-auto">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(pkg)}
                            className="px-3 py-1 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Save Changes</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {pkg.name}
                          </span>
                          <span className="font-mono text-slate-500 font-medium">
                            {pkg.dataGb} GB
                          </span>
                          <span className="text-[11px] text-slate-400">
                            ({matchingSubscribers.length} subscribers currently)
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                          {pkg.description || 'YWAM campus subscription package'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="font-mono text-base font-bold text-slate-900 dark:text-white tabular-nums">
                            {formatMga(pkg.rateMga)}
                          </span>
                          <span className="text-[11px] text-slate-400 block">per month</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(pkg)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                            title="Edit this rate"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(pkg)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                            title="Delete this package"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
