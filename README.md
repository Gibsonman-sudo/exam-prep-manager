# 📚 Exam Prep Manager

An intelligent exam preparation task manager built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**. Track your college end-semester exam study progress across multiple subjects, chapters, and topics with smart recommendations and progress analytics.

## ✨ Features

### Subject Management
- ✅ Add/edit/delete subjects with name, exam date, chapters, priority, and color
- ✅ Sort subjects by exam date, priority, or progress
- ✅ Visual color-coding for each subject

### Chapter & Topic Tracking
- ✅ Organize subjects into chapters with multiple topics
- ✅ Mark status: Not Started, In Progress, Completed, Needs Review
- ✅ Add notes, difficulty level, and time estimates per topic
- ✅ Track actual time spent on each topic
- ✅ Set chapter deadlines

### Smart Dashboard
- ✅ Overall progress across all subjects
- ✅ Subject-wise progress with visual bars
- ✅ Study streak tracker 🔥
- ✅ Today/week time stats
- ✅ Upcoming deadlines and overdue items highlighted
- ✅ Urgent alerts for subjects with exams <7 days away

### Study Session Tracking
- ✅ Start/stop timer for active study sessions
- ✅ Automatic time accumulation per topic
- ✅ Daily study logs and history
- ✅ Floating timer widget

### Smart Features
- ✅ AI-powered recommendation: which subject to study next
- ✅ Urgency algorithm based on exam proximity, progress, and priority
- ✅ Milestone celebrations
- ✅ Search across all subjects/chapters/topics
- ✅ Quick-add mode for rapid entry

### Data Persistence
- ✅ LocalStorage with versioning
- ✅ Export/import data as JSON (backup)
- ✅ Clear completed subjects after exams

### Design
- ✅ Modern dark mode UI (default)
- ✅ Tailwind CSS with smooth animations
- ✅ Mobile responsive
- ✅ Premium feel with gradient accents

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm (or yarn/pnpm)
- Modern browser with ES2020 support

### Installation

1. **Navigate to the project directory:**

```powershell
cd exam-prep
```

2. **Install dependencies:**

```powershell
npm install
```

### Development

Run the development server with hot reload:

```powershell
npm run dev
```

Open your browser to http://localhost:5173

### Build for Production

```powershell
npm run build
```

The optimized build will be in the `dist/` folder.

### Preview Production Build

```powershell
npm run preview
```

### Lint & Type Check

```powershell
npm run lint
```

## 📁 Project Structure

```
exam-prep/
├── src/
│   ├── components/         # React components
│   │   ├── Dashboard.tsx         # Main dashboard with stats
│   │   ├── SubjectList.tsx       # Subject grid view
│   │   ├── SubjectDetail.tsx     # Subject detail page
│   │   ├── AddSubjectModal.tsx   # Add subject form
│   │   ├── StudyTimer.tsx        # Floating timer widget
│   │   ├── SearchBar.tsx         # Global search
│   │   └── DataManager.tsx       # Export/import/clear data
│   ├── context/
│   │   └── AppContext.tsx        # Global state management
│   ├── types/
│   │   └── index.ts              # TypeScript types & enums
│   ├── utils/
│   │   ├── storage.ts            # LocalStorage service
│   │   └── calculations.ts       # Progress & recommendation logic
│   ├── App.tsx                   # Root component
│   ├── main.tsx                  # App entry point
│   └── index.css                 # Tailwind + custom styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🎯 Usage

### Adding a Subject
1. Click **"+ Add Subject"**
2. Fill in name, exam date, total chapters, priority, and color
3. Click **"Add Subject"**

### Studying
1. Click on a subject card to view details
2. Add chapters and topics
3. Click **"Start Study Session"** on a topic
4. Study timer will track time automatically
5. Click **"Stop Session"** when done

### Smart Recommendations
- Dashboard shows **"Study This Next"** card
- Algorithm considers:
  - Days until exam
  - Current progress
  - Subject priority
  - Overdue chapters

### Data Management
1. Click **"⚙️ Data"** in header
2. Export backup as JSON
3. Import from backup file
4. Clear old subjects or all data

## 🛠️ Tech Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS 3 (dark mode default)
- **State:** React Context API
- **Storage:** Browser LocalStorage
- **Charts:** Recharts (for weekly patterns)
- **Linting:** ESLint + TypeScript ESLint

## 🎨 Customization

### Theme Colors
Edit `tailwind.config.js` to customize colors:

```js
theme: {
  extend: {
    colors: {
      status: {
        notStarted: '#ef4444', // red
        inProgress: '#f59e0b', // amber
        completed: '#22c55e', // green
        review: '#3b82f6',     // blue
      },
    }
  }
}
```

### Subject Colors
Available colors are defined in `src/types/index.ts`:
- Red, Orange, Yellow, Green, Blue, Indigo, Purple, Pink

## 📝 Roadmap

- [ ] Full chapter/topic CRUD UI
- [ ] Weekly study pattern chart (Recharts integration)
- [ ] Pomodoro timer integration
- [ ] Notes with rich text editor
- [ ] PDF export of study plan
- [ ] Cloud sync (Firebase/Supabase)
- [ ] Desktop notifications for deadlines
- [ ] Keyboard shortcuts
- [ ] Print study schedule

## 🐛 Known Issues

- Subject detail page shows placeholder (full CRUD UI pending)
- Search is UI-only (functional search pending)
- Charts not yet rendered (Recharts integration pending)

## 📄 License

MIT License - feel free to use for your exam prep!

## 🙏 Acknowledgements

Built with ❤️ for students tackling end-semester exams. Good luck! 🎓

---

**Questions or issues?** Open an issue or contribute via PR!
