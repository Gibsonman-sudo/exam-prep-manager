import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import Dashboard from './components/Dashboard';
import SubjectList from './components/SubjectList';
import SubjectDetail from './components/SubjectDetail';
import StudyTimerButton from './components/StudyTimerButton';
import SearchBar from './components/SearchBar';
import DataManager from './components/DataManager';
import ProgressPage from './components/ProgressPage';

function App() {
  const { subjects } = useApp();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [showDataManager, setShowDataManager] = useState(false);
  const [showProgressPage, setShowProgressPage] = useState(false);

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

  const handleLogoClick = () => {
    if (!selectedSubjectId && !showDataManager && !showProgressPage) {
      // Already on dashboard, scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Navigate to dashboard
      setSelectedSubjectId(null);
      setShowDataManager(false);
      setShowProgressPage(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1d1e]">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#26292b]/95 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center" style={{ gap: '16px' }}>
              <button 
                onClick={handleLogoClick}
                className="flex items-center group cursor-pointer transition-transform duration-200 hover:scale-105"
                style={{ gap: '12px' }}
                aria-label="Go to dashboard"
              >
                <div className="w-10 h-10 bg-[#2d9ca8] flex items-center justify-center shadow-md" style={{ borderRadius: '8px' }}>
                  <span className="text-2xl">📚</span>
                </div>
                <div>
                  <h1 className="font-semibold text-[#e8e8e8] group-hover:text-[#2d9ca8] transition-colors" style={{ fontSize: '20px', lineHeight: '1.2', letterSpacing: '-0.01em' }}>
                    Exam Prep Manager
                  </h1>
                  <p className="text-[#a0a0a0] group-hover:text-[#e8e8e8]/80 transition-colors" style={{ fontSize: '12px' }}>Smart study tracking</p>
                </div>
              </button>
            </div>
            <div className="flex items-center" style={{ gap: '12px' }}>
              <SearchBar />
              <button
                onClick={() => {
                  setShowProgressPage(!showProgressPage);
                  setShowDataManager(false);
                  setSelectedSubjectId(null);
                }}
                className={`btn-icon group relative ${showProgressPage ? 'bg-[#2d9ca8]/10' : ''}`}
                title="Analytics & Progress"
                aria-label="View analytics and progress"
              >
                <svg className={`w-5 h-5 transition-colors ${showProgressPage ? 'text-[#2d9ca8]' : 'text-[#a0a0a0] group-hover:text-[#2d9ca8]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setShowDataManager(!showDataManager);
                  setShowProgressPage(false);
                }}
                className="btn-icon group relative"
                title="Settings"
                aria-label="Open settings and data manager"
              >
                <svg className="w-5 h-5 text-[#a0a0a0] group-hover:text-[#2d9ca8] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
        {/* Breadcrumbs */}
        {(selectedSubject || showDataManager || showProgressPage) && (
          <nav className="flex items-center text-sm animate-slide-down" style={{ gap: '8px', marginBottom: '24px' }} aria-label="Breadcrumb">
            <button 
              onClick={handleLogoClick}
              className="text-[#a0a0a0] hover:text-[#2d9ca8] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2d9ca8] focus-visible:rounded px-2 py-1"
              aria-label="Go to home page"
            >
              Home
            </button>
            <svg className="w-4 h-4 text-[#a0a0a0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[#e8e8e8] font-medium">
              {showDataManager ? 'Data Management' : showProgressPage ? 'Progress & Analytics' : selectedSubject?.name}
            </span>
          </nav>
        )}

        {showDataManager ? (
          <div className="animate-fade-in">
            <button
              onClick={() => setShowDataManager(false)}
              className="btn-secondary mb-6 inline-flex items-center gap-2 hover:gap-3 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <DataManager onClose={() => setShowDataManager(false)} />
          </div>
        ) : showProgressPage ? (
          <ProgressPage 
            onSubjectClick={(id) => {
              setSelectedSubjectId(id);
              setShowProgressPage(false);
            }}
            onClose={() => setShowProgressPage(false)}
          />
        ) : selectedSubject ? (
          <div className="animate-fade-in">
            <button
              onClick={() => setSelectedSubjectId(null)}
              className="btn-secondary mb-6 inline-flex items-center gap-2 hover:gap-3 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
            <SubjectDetail subject={selectedSubject} />
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            <Dashboard />
            <SubjectList onSelectSubject={setSelectedSubjectId} />
          </div>
        )}
      </main>

      {/* Floating Study Timer */}
      <StudyTimerButton />
    </div>
  );
}

export default App;
