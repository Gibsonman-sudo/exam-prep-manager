# 🚀 Quick Start Guide

## Run the Exam Prep Manager

### Option 1: Development Mode (Recommended for Development)

```powershell
cd exam-prep
npm run dev
```

Then open http://localhost:5173 in your browser.

### Option 2: Production Build + Preview

```powershell
cd exam-prep
npm run build
npm run preview
```

Then open http://localhost:4173

## First Time Setup

### 1. Add Your First Subject
- Click "**+ Add Subject**" button
- Enter subject name (e.g., "Data Structures")
- Set exam date
- Choose priority and color
- Click "**Add Subject**"

### 2. Add Chapters & Topics
- Click on a subject card
- Add chapters with the "+ Add Chapter" button
- For each chapter, add topics
- Set difficulty, time estimates, and notes

### 3. Start Studying
- Click "**Start Study**" on any topic
- A floating timer appears in bottom-right
- Study as long as you need
- Click "**Stop Session**" when done
- Time is automatically logged

### 4. Track Progress
- Return to dashboard to see overall stats
- Check study streak 🔥
- View recommended next subject to study
- Monitor upcoming deadlines

## Features Tour

### Dashboard Stats
- **Overall Progress**: Percentage across all subjects
- **Study Streak**: Consecutive days studied
- **Today/Week**: Total time spent
- **Smart Alerts**: Urgent subjects with low progress

### Smart Recommendations
The app suggests which subject to study next based on:
- Days until exam
- Current progress %
- Priority level
- Overdue items

### Data Backup
1. Click "**⚙️ Data**" in the header
2. Choose:
   - **Export**: Download JSON backup
   - **Import**: Restore from backup
   - **Clear Old**: Remove past exams
   - **Clear All**: Reset everything

## Keyboard Tips
- **Esc**: Close modals
- **Ctrl+F / Cmd+F**: Focus search bar (browser default)
- Click subject cards to drill down

## Mobile Usage
- Fully responsive design
- Use on phone during breaks
- Timer widget stays visible while scrolling

## Dark Mode
Dark mode is enabled by default for late-night study sessions. Enjoy! 🌙

---

**Need help?** Check the main [README.md](./README.md) for full documentation.
