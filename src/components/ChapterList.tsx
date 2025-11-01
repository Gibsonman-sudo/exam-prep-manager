import React, { useState, useEffect } from 'react';
import { Chapter, Topic, Status } from '../types';
import { useApp } from '../context/AppContext';
import AddChapterModal from './AddChapterModal';

interface Props {
  subjectId: string;
  chapters: Chapter[];
}

type SortOption = 'number' | 'completion' | 'lastStudied';
type FilterOption = 'all' | 'incomplete' | 'completed';

const ChapterList: React.FC<Props> = ({ subjectId, chapters }) => {
  const { updateChapter, deleteChapter, addChapter } = useApp();
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);
  const [showAddChapterModal, setShowAddChapterModal] = useState(false);
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [selectedChapterForTopic, setSelectedChapterForTopic] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('number');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedChapters, setSelectedChapters] = useState<Set<string>>(new Set());
  const [newTopicName, setNewTopicName] = useState('');
  const [showInlineTopicAdd, setShowInlineTopicAdd] = useState<string | null>(null);

  const handleAddChapter = (newChapter: Omit<Chapter, 'id' | 'createdAt'>) => {
    // Remove topics from the object since addChapter expects it without topics
    const { topics, ...chapterWithoutTopics } = newChapter;
    addChapter(subjectId, chapterWithoutTopics);
  };

  // Calculate progress for a chapter
  const getChapterProgress = (chapter: Chapter): number => {
    if (chapter.topics.length === 0) return 0;
    const completedTopics = chapter.topics.filter(t => t.status === Status.Completed).length;
    return Math.round((completedTopics / chapter.topics.length) * 100);
  };

  // Get progress color
  const getProgressColor = (progress: number): string => {
    if (progress === 0) return '#ef4444';
    if (progress <= 25) return '#ef4444';
    if (progress <= 50) return '#f97316';
    if (progress <= 75) return '#eab308';
    if (progress < 100) return '#84cc16';
    return '#10b981';
  };

  // Toggle chapter completion
  const toggleChapterCompletion = (chapter: Chapter) => {
    const newStatus = chapter.status === Status.Completed ? Status.NotStarted : Status.Completed;
    
    // Update all topics in the chapter
    const updatedTopics = chapter.topics.map(topic => ({
      ...topic,
      status: newStatus,
      completedAt: newStatus === Status.Completed ? new Date().toISOString() : undefined
    }));

    updateChapter(subjectId, chapter.id, {
      status: newStatus,
      topics: updatedTopics,
      actualStudyTime: newStatus === Status.Completed ? chapter.estimatedStudyTime : chapter.actualStudyTime,
      lastStudiedAt: new Date().toISOString()
    });

    // Show confetti if completed
    if (newStatus === Status.Completed) {
      triggerConfetti();
    }
  };

  // Toggle topic completion
  const toggleTopicCompletion = (chapter: Chapter, topicId: string) => {
    const updatedTopics = chapter.topics.map(topic => {
      if (topic.id === topicId) {
        const newStatus = topic.status === Status.Completed ? Status.NotStarted : Status.Completed;
        return {
          ...topic,
          status: newStatus,
          completedAt: newStatus === Status.Completed ? new Date().toISOString() : undefined
        };
      }
      return topic;
    });

    // Check if all topics are completed
    const allCompleted = updatedTopics.every(t => t.status === Status.Completed);
    const anyInProgress = updatedTopics.some(t => t.status === Status.InProgress || t.status === Status.Completed);

    updateChapter(subjectId, chapter.id, {
      topics: updatedTopics,
      status: allCompleted ? Status.Completed : anyInProgress ? Status.InProgress : Status.NotStarted,
      lastStudiedAt: new Date().toISOString()
    });

    // Show confetti if chapter just completed
    if (allCompleted && chapter.status !== Status.Completed) {
      triggerConfetti();
    }
  };

  // Add topic inline
  const handleAddTopicInline = (chapterId: string) => {
    if (!newTopicName.trim()) return;

    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    const newTopic: Topic = {
      id: `topic-${Date.now()}`,
      name: newTopicName.trim(),
      status: Status.NotStarted,
      notes: '',
      difficultyLevel: 'medium',
      estimatedMinutes: 0,
      actualMinutes: 0,
      createdAt: new Date().toISOString()
    };

    updateChapter(subjectId, chapter.id, {
      topics: [...chapter.topics, newTopic]
    });

    setNewTopicName('');
    setShowInlineTopicAdd(null);
  };

  // Delete topic
  const deleteTopic = (chapter: Chapter, topicId: string) => {
    const updatedTopics = chapter.topics.filter(t => t.id !== topicId);
    updateChapter(subjectId, chapter.id, {
      topics: updatedTopics
    });
  };

  // Bulk actions
  const handleBulkComplete = (complete: boolean) => {
    selectedChapters.forEach(chapterId => {
      const chapter = chapters.find(c => c.id === chapterId);
      if (chapter) {
        const newStatus = complete ? Status.Completed : Status.NotStarted;
        const updatedTopics = chapter.topics.map(topic => ({
          ...topic,
          status: newStatus,
          completedAt: newStatus === Status.Completed ? new Date().toISOString() : undefined
        }));

        updateChapter(subjectId, chapter.id, {
          status: newStatus,
          topics: updatedTopics
        });
      }
    });
    setSelectedChapters(new Set());
  };

  const handleBulkDelete = () => {
    if (!confirm(`Delete ${selectedChapters.size} selected chapter(s)? This cannot be undone.`)) return;
    
    selectedChapters.forEach(chapterId => {
      deleteChapter(subjectId, chapterId);
    });
    setSelectedChapters(new Set());
  };

  // Filter and sort chapters
  const getFilteredAndSortedChapters = (): Chapter[] => {
    let filtered = [...chapters];

    // Apply search
    if (searchQuery.trim()) {
      filtered = filtered.filter(ch => 
        ch.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filter
    if (filterBy === 'completed') {
      filtered = filtered.filter(ch => ch.status === Status.Completed);
    } else if (filterBy === 'incomplete') {
      filtered = filtered.filter(ch => ch.status !== Status.Completed);
    }

    // Apply sort
    filtered.sort((a, b) => {
      if (sortBy === 'number') {
        return a.number - b.number;
      } else if (sortBy === 'completion') {
        return getChapterProgress(b) - getChapterProgress(a);
      } else if (sortBy === 'lastStudied') {
        const aTime = a.lastStudiedAt ? new Date(a.lastStudiedAt).getTime() : 0;
        const bTime = b.lastStudiedAt ? new Date(b.lastStudiedAt).getTime() : 0;
        return bTime - aTime;
      }
      return 0;
    });

    return filtered;
  };

  // Confetti animation
  const triggerConfetti = () => {
    // Simple confetti implementation
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'fixed inset-0 pointer-events-none z-50';
    document.body.appendChild(confettiContainer);

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'absolute w-2 h-2 rounded-full animate-confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = '-10px';
      confetti.style.backgroundColor = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)];
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      confettiContainer.appendChild(confetti);
    }

    setTimeout(() => {
      document.body.removeChild(confettiContainer);
    }, 3000);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'c') {
        setShowAddChapterModal(true);
      } else if (e.key === 't' && expandedChapterId) {
        setShowInlineTopicAdd(expandedChapterId);
      } else if (e.key === ' ' && expandedChapterId) {
        e.preventDefault();
        const chapter = chapters.find(c => c.id === expandedChapterId);
        if (chapter) toggleChapterCompletion(chapter);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [expandedChapterId, chapters]);

  const filteredChapters = getFilteredAndSortedChapters();

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        {chapters.length >= 5 && (
          <div className="relative flex-1 min-w-[200px]">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0a0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chapters..."
              className="input pl-10 pr-4 py-2 text-sm"
            />
          </div>
        )}

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="input py-2 px-3 text-sm"
        >
          <option value="number">Sort by Number</option>
          <option value="completion">Sort by Completion</option>
          <option value="lastStudied">Sort by Last Studied</option>
        </select>

        {/* Filter */}
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value as FilterOption)}
          className="input py-2 px-3 text-sm"
        >
          <option value="all">All Chapters</option>
          <option value="incomplete">Incomplete</option>
          <option value="completed">Completed</option>
        </select>

        {/* Bulk Actions */}
        {selectedChapters.size > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-[#a0a0a0]">{selectedChapters.size} selected</span>
            <button
              onClick={() => handleBulkComplete(true)}
              className="btn-secondary py-2 px-3 text-sm"
            >
              Mark Complete
            </button>
            <button
              onClick={() => handleBulkComplete(false)}
              className="btn-secondary py-2 px-3 text-sm"
            >
              Mark Incomplete
            </button>
            <button
              onClick={handleBulkDelete}
              className="btn-danger py-2 px-3 text-sm"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Chapter Cards */}
      <div className="space-y-3">
        {filteredChapters.map((chapter) => {
          const progress = getChapterProgress(chapter);
          const isExpanded = expandedChapterId === chapter.id;
          const isSelected = selectedChapters.has(chapter.id);
          const completedTopics = chapter.topics.filter(t => t.status === Status.Completed).length;

          return (
            <div
              key={chapter.id}
              className={`chapter-card ${chapter.status === Status.Completed ? 'chapter-completed' : ''}`}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: chapter.status === Status.Completed 
                  ? '1px solid rgba(255,255,255,0.08)' 
                  : '1px solid rgba(255, 255, 255, 0.08)',
                borderLeft: chapter.status === Status.Completed ? '3px solid #10b981' : undefined,
                borderRadius: '12px',
                padding: '20px',
                transition: 'all 200ms ease-out',
                opacity: chapter.status === Status.Completed ? 0.7 : 1
              }}
            >
              {/* Chapter Header */}
              <div className="flex items-start gap-4">
                {/* Selection Checkbox */}
                <div className="flex items-center pt-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      const newSelected = new Set(selectedChapters);
                      if (e.target.checked) {
                        newSelected.add(chapter.id);
                      } else {
                        newSelected.delete(chapter.id);
                      }
                      setSelectedChapters(newSelected);
                    }}
                    className="w-4 h-4 rounded border-white/12 bg-transparent text-[#2d9ca8] focus:ring-2 focus:ring-[#2d9ca8] focus:ring-offset-2 focus:ring-offset-[#1a1d1e] cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Chapter Content */}
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => setExpandedChapterId(isExpanded ? null : chapter.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Chapter Number Badge */}
                      <div
                        className="w-10 h-10 flex items-center justify-center font-semibold text-sm"
                        style={{
                          borderRadius: '8px',
                          background: chapter.status === Status.Completed 
                            ? 'rgba(16, 185, 129, 0.2)' 
                            : 'rgba(45, 156, 168, 0.15)',
                          color: chapter.status === Status.Completed ? '#10b981' : '#2d9ca8'
                        }}
                      >
                        {chapter.number}
                      </div>

                      {/* Chapter Info */}
                      <div className="flex-1">
                        <h4 className="text-[#e8e8e8] font-semibold text-base mb-1">
                          {chapter.name}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-[#a0a0a0]">
                          <span>{completedTopics}/{chapter.topics.length} topics completed</span>
                          {chapter.actualStudyTime && (
                            <span>• {Math.round(chapter.actualStudyTime / 60)}h studied</span>
                          )}
                          {chapter.lastStudiedAt && (
                            <span>• Last studied {new Date(chapter.lastStudiedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Completion Checkbox */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleChapterCompletion(chapter);
                      }}
                      className="w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 hover:scale-110"
                      style={{
                        borderColor: chapter.status === Status.Completed ? '#10b981' : 'rgba(255,255,255,0.12)',
                        background: chapter.status === Status.Completed ? '#10b981' : 'transparent'
                      }}
                    >
                      {chapter.status === Status.Completed && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div 
                    className="h-2 rounded-full overflow-hidden"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <div
                      className="h-full transition-all duration-700 ease-out"
                      style={{
                        width: `${progress}%`,
                        background: getProgressColor(progress)
                      }}
                    />
                  </div>

                  {/* Progress Percentage */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-medium" style={{ color: getProgressColor(progress) }}>
                      {progress}% Complete
                    </span>
                    <svg 
                      className={`w-5 h-5 text-[#a0a0a0] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Expanded Topic List */}
              {isExpanded && (
                <div 
                  className="mt-4 pt-4 space-y-2"
                  style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}
                >
                  {chapter.topics.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-[#a0a0a0] text-sm mb-3">No topics yet</p>
                      <button
                        onClick={() => setShowInlineTopicAdd(chapter.id)}
                        className="btn-secondary py-2 px-4 text-sm"
                      >
                        Add First Topic
                      </button>
                    </div>
                  ) : (
                    <>
                      {chapter.topics.map((topic) => (
                        <div
                          key={topic.id}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all duration-150 group"
                        >
                          {/* Topic Checkbox */}
                          <button
                            onClick={() => toggleTopicCompletion(chapter, topic.id)}
                            className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:scale-110"
                            style={{
                              borderColor: topic.status === Status.Completed ? '#10b981' : 'rgba(255,255,255,0.12)',
                              background: topic.status === Status.Completed ? '#10b981' : 'transparent'
                            }}
                          >
                            {topic.status === Status.Completed && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>

                          {/* Topic Name */}
                          <span 
                            className={`flex-1 text-sm ${
                              topic.status === Status.Completed 
                                ? 'text-[#a0a0a0] line-through' 
                                : 'text-[#e8e8e8]'
                            }`}
                          >
                            {topic.name}
                          </span>

                          {/* Delete Topic */}
                          <button
                            onClick={() => deleteTopic(chapter, topic.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all duration-150"
                            aria-label={`Delete topic ${topic.name}`}
                          >
                            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Add Topic Inline */}
                  {showInlineTopicAdd === chapter.id ? (
                    <div className="flex items-center gap-2 mt-3">
                      <input
                        type="text"
                        value={newTopicName}
                        onChange={(e) => setNewTopicName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddTopicInline(chapter.id);
                          if (e.key === 'Escape') {
                            setShowInlineTopicAdd(null);
                            setNewTopicName('');
                          }
                        }}
                        placeholder="Topic name..."
                        className="input flex-1 py-2 px-3 text-sm"
                        autoFocus
                      />
                      <button
                        onClick={() => handleAddTopicInline(chapter.id)}
                        className="btn-primary py-2 px-4 text-sm"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowInlineTopicAdd(null);
                          setNewTopicName('');
                        }}
                        className="btn-secondary py-2 px-3 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : chapter.topics.length > 0 && (
                    <button
                      onClick={() => setShowInlineTopicAdd(chapter.id)}
                      className="w-full mt-2 py-2 px-3 text-sm text-[#2d9ca8] hover:bg-[#2d9ca8]/10 rounded-lg transition-all duration-150 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Topic
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Chapter Button */}
      <button
        onClick={() => setShowAddChapterModal(true)}
        className="btn-secondary w-full py-3 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Chapter (press 'c')
      </button>

      {/* Keyboard Shortcuts Help */}
      <div className="text-xs text-[#a0a0a0] text-center mt-4 space-y-1">
        <p>Keyboard shortcuts: <kbd className="px-2 py-1 bg-white/5 rounded">C</kbd> = Add Chapter, <kbd className="px-2 py-1 bg-white/5 rounded">T</kbd> = Add Topic, <kbd className="px-2 py-1 bg-white/5 rounded">Space</kbd> = Toggle Complete</p>
      </div>

      {/* Add Chapter Modal */}
      <AddChapterModal
        isOpen={showAddChapterModal}
        onClose={() => setShowAddChapterModal(false)}
        onAdd={handleAddChapter}
        existingChapters={chapters}
      />
    </div>
  );
};

export default ChapterList;
