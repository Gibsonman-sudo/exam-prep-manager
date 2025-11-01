import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Status } from '../types';
import { bulkSubjectsData, formatDateForApp, mapPriority, getColorForIndex } from '../utils/bulkImport';

interface Props {
  onClose: () => void;
}

// Helper to generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const BulkImportModal: React.FC<Props> = ({ onClose }) => {
  const { addSubjectWithChapters, subjects } = useApp();
  const { showToast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleBulkImport = async () => {
    setIsImporting(true);
    
    const totalSteps = bulkSubjectsData.length;
    let currentStep = 0;
    const importedSubjects: string[] = [];

    try {
      // Add each subject with all its chapters in one atomic operation
      for (let i = 0; i < bulkSubjectsData.length; i++) {
        const subjectData = bulkSubjectsData[i];
        
        // Check if subject already exists
        const existingSubject = subjects.find(s => s.name === subjectData.name);
        if (existingSubject) {
          console.log(`Subject "${subjectData.name}" already exists, skipping...`);
          currentStep++;
          setProgress({ current: currentStep, total: totalSteps });
          continue;
        }

        // Prepare subject data
        const newSubject = {
          name: subjectData.name,
          examDate: formatDateForApp(subjectData.examDate),
          totalChapters: subjectData.chapters.length,
          priority: mapPriority(subjectData.priority),
          color: getColorForIndex(i),
        };

        // Prepare all chapters for this subject with topics
        const chapters = subjectData.chapters.map((chapterData, j) => ({
          number: j + 1,
          name: chapterData.name,
          status: Status.NotStarted,
          topics: chapterData.topics.map((topicName) => ({
            id: generateId(),
            name: topicName,
            status: Status.NotStarted,
            notes: '',
            difficultyLevel: 'medium' as const,
            estimatedMinutes: 0,
            actualMinutes: 0,
            createdAt: new Date().toISOString(),
          })),
        }));

        console.log(`Adding subject: ${newSubject.name} with ${chapters.length} chapters and ${chapters.reduce((sum, ch) => sum + ch.topics.length, 0)} topics`);
        
        // Add subject with all chapters in one atomic operation
        addSubjectWithChapters(newSubject, chapters);
        importedSubjects.push(subjectData.name);

        currentStep++;
        setProgress({ current: currentStep, total: totalSteps });
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (importedSubjects.length === 0) {
        showToast(`ℹ️ All subjects already exist`, 'info');
        setTimeout(() => onClose(), 1000);
        return;
      }

      console.log(`✓ Successfully imported ${importedSubjects.length} subjects with all chapters`);
      showToast(`🎉 Successfully imported ${importedSubjects.length} subject${importedSubjects.length > 1 ? 's' : ''} with all chapters!`, 'success');
      setTimeout(() => onClose(), 1500);
      
    } catch (error) {
      console.error('Bulk import error:', error);
      showToast('❌ Import failed. Please try again.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const progressPercentage = progress.total > 0 
    ? Math.round((progress.current / progress.total) * 100) 
    : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-[#e8e8e8] mb-2">
            📚 Bulk Import Subjects
          </h2>
          <p className="text-[#a0a0a0] text-sm">
            Import {bulkSubjectsData.length} subjects with all their chapters automatically
          </p>
        </div>

        {/* Preview List */}
        {!isImporting && (
          <div className="mb-6 max-h-[400px] overflow-y-auto space-y-3">
            {bulkSubjectsData.map((subject, index) => (
              <div key={index} className="bg-[#1a1d1e] rounded-lg p-4 border border-white/8">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-[#e8e8e8] font-semibold text-sm">
                    {subject.name}
                  </h3>
                  <span className={`badge ${
                    subject.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                    subject.priority === 'MEDIUM' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                    'bg-gray-500/20 text-gray-300 border-gray-500/30'
                  }`}>
                    {subject.priority}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#a0a0a0] mb-2">
                  <span>📅 {subject.examDate}</span>
                  <span>📖 {subject.chapters.length} chapters</span>
                  <span>📝 {subject.chapters.reduce((sum, ch) => sum + ch.topics.length, 0)} topics</span>
                </div>
                <div className="text-xs text-[#808080]">
                  {subject.chapters.slice(0, 2).map(ch => ch.name).join(' • ')}
                  {subject.chapters.length > 2 && ` • +${subject.chapters.length - 2} more`}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Progress Bar */}
        {isImporting && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#a0a0a0]">Importing...</span>
              <span className="text-sm font-semibold text-[#e8e8e8]">
                {progress.current} / {progress.total}
              </span>
            </div>
            <div className="progress-bar h-3">
              <div
                className="progress-fill progress-gradient"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-[#a0a0a0] mt-2 text-center">
              {progressPercentage}% complete
            </p>
          </div>
        )}

        {/* Warning */}
        {!isImporting && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-amber-300 text-sm font-semibold mb-1">
                  Before You Import
                </p>
                <ul className="text-amber-200/80 text-xs space-y-1">
                  <li>• Subjects with duplicate names will be skipped</li>
                  <li>• All chapters will be added automatically</li>
                  <li>• You can edit or delete any item after import</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isImporting}
            className="btn-secondary flex-1"
          >
            {isImporting ? 'Importing...' : 'Cancel'}
          </button>
          <button
            onClick={handleBulkImport}
            disabled={isImporting}
            className="btn-primary flex-1"
          >
            {isImporting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Importing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import All Subjects
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;
