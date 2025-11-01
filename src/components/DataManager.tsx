import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

interface Props {
  onClose: () => void;
}

const DataManager: React.FC<Props> = ({ onClose }) => {
  const { exportData, importData, clearData, clearCompletedSubjects, studyGoal, updateStudyGoal } = useApp();
  const { showToast } = useToast();
  
  const [dailyGoalHours, setDailyGoalHours] = useState(Math.floor(studyGoal.dailyMinutes / 60));
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(studyGoal.dailyMinutes % 60);
  const [weeklyGoalHours, setWeeklyGoalHours] = useState(Math.floor(studyGoal.weeklyMinutes / 60));

  const handleUpdateGoal = () => {
    const newDailyMinutes = dailyGoalHours * 60 + dailyGoalMinutes;
    const newWeeklyMinutes = weeklyGoalHours * 60;
    
    if (newDailyMinutes <= 0) {
      showToast('Daily goal must be at least 1 minute', 'error');
      return;
    }
    
    if (newWeeklyMinutes <= 0) {
      showToast('Weekly goal must be at least 1 hour', 'error');
      return;
    }
    
    updateStudyGoal(newDailyMinutes, newWeeklyMinutes);
    showToast('Study goals updated! 🎯', 'success');
  };

  const handleExport = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exam-prep-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Backup downloaded successfully! 📥', 'success');
    } catch (error) {
      showToast('Failed to export data', 'error');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const success = importData(event.target?.result as string);
            if (success) {
              showToast('Data imported successfully! 🎉', 'success');
            } else {
              showToast('Failed to import data - invalid format', 'error');
            }
          } catch (error) {
            showToast('Failed to import data', 'error');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClearCompleted = () => {
    if (confirm('Remove all subjects with past exam dates? This cannot be undone.')) {
      clearCompletedSubjects();
      showToast('Completed subjects removed', 'success');
    }
  };

  const handleClearAll = () => {
    if (confirm('⚠️ Are you absolutely sure?\n\nThis will delete ALL your data permanently!\n\nType "DELETE" to confirm.') === true) {
      // Additional confirmation
      const userConfirm = prompt('Type DELETE (in capitals) to confirm:');
      if (userConfirm === 'DELETE') {
        clearData();
        showToast('All data cleared', 'info');
        onClose();
      } else {
        showToast('Deletion cancelled', 'info');
      }
    }
  };

  return (
    <div className="card max-w-3xl mx-auto animate-fade-in">
      {/* Study Goals Section */}
      <div className="mb-8">
        <h2 className="section-header mb-2">Study Goals</h2>
        <p className="text-slate-400">Set your daily and weekly study targets</p>
      </div>

      <div className="space-y-6 mb-12">
        {/* Daily Goal */}
        <div className="card border-[#2d9ca8]/30 bg-[#2d9ca8]/5 hover:border-[#2d9ca8]/50 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2d9ca8]/20 to-[#2d9ca8]/10 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-100 mb-1">Daily Study Goal</h3>
              <p className="text-sm text-slate-400 mb-4">How much time do you want to study each day?</p>
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Hours</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={dailyGoalHours}
                    onChange={(e) => setDailyGoalHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                    className="input w-20 text-center"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Minutes</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={dailyGoalMinutes}
                    onChange={(e) => setDailyGoalMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    className="input w-20 text-center"
                  />
                </div>
                <div className="flex-1 text-right">
                  <div className="text-2xl font-bold text-[#2d9ca8]">
                    {dailyGoalHours > 0 && `${dailyGoalHours}h `}
                    {dailyGoalMinutes > 0 && `${dailyGoalMinutes}m`}
                  </div>
                  <div className="text-xs text-slate-500">per day</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Goal */}
        <div className="card border-purple-500/30 bg-purple-950/10 hover:border-purple-500/50 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">📅</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-100 mb-1">Weekly Study Goal</h3>
              <p className="text-sm text-slate-400 mb-4">Your target for the entire week</p>
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={weeklyGoalHours}
                    onChange={(e) => setWeeklyGoalHours(Math.max(1, Math.min(168, parseInt(e.target.value) || 1)))}
                    className="input w-20 text-center"
                  />
                </div>
                <div className="flex-1 text-right">
                  <div className="text-2xl font-bold text-purple-400">
                    {weeklyGoalHours}h
                  </div>
                  <div className="text-xs text-slate-500">per week</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button onClick={handleUpdateGoal} className="btn-primary w-full inline-flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Save Study Goals
        </button>
      </div>

      <div className="divider mb-8"></div>

      {/* Data Management Section */}
      <div className="mb-8">
        <h2 className="section-header mb-2">Data Management</h2>
        <p className="text-slate-400">Backup, restore, or clear your exam preparation data</p>
      </div>

      <div className="space-y-6">
        {/* Export Data */}
        <div className="card border-primary-500/30 bg-primary-950/20 hover:border-primary-500/50 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-100 mb-1">Export Data</h3>
              <p className="text-sm text-slate-400 mb-4">Download a backup of all your data as JSON file</p>
              <button onClick={handleExport} className="btn-primary inline-flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Backup
              </button>
            </div>
          </div>
        </div>

        {/* Import Data */}
        <div className="card border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500/50 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-100 mb-1">Import Data</h3>
              <p className="text-sm text-slate-400 mb-4">Restore data from a previously saved backup file</p>
              <button onClick={handleImport} className="btn-secondary inline-flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Choose File
              </button>
            </div>
          </div>
        </div>

        {/* Clear Completed */}
        <div className="card border-amber-500/30 bg-amber-950/10 hover:border-amber-500/50 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-100 mb-1">Clear Completed Subjects</h3>
              <p className="text-sm text-slate-400 mb-4">Remove subjects with past exam dates to keep your list clean</p>
              <button onClick={handleClearCompleted} className="btn-secondary inline-flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Old Subjects
              </button>
            </div>
          </div>
        </div>

        {/* Clear All - Danger Zone */}
        <div className="card border-red-500/50 bg-red-950/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-red-400 mb-1">Danger Zone</h3>
              <p className="text-sm text-red-300/70 mb-4">⚠️ This action cannot be undone. All data will be permanently deleted.</p>
              <button onClick={handleClearAll} className="btn-danger inline-flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete All Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="divider"></div>

      <button onClick={onClose} className="btn-secondary w-full">
        Close
      </button>
    </div>
  );
};

export default DataManager;
