# Today - Minimalist Task Management App

A beautifully simple, one-page to-do list app designed to help you focus on what matters right now. Built for clarity, speed, and peace of mind with intuitive gesture-based navigation.

![Today App Preview](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)

## 🌟 Key Features

### Core Functionality
- **Instant Load** - Opens directly to Today's task list
- **Smart Auto-Rollover** - Incomplete tasks automatically move to the next day
- **Swipe Navigation** - Move between Today, Tomorrow, and Next 3 Days
- **Minimalist Interface** - Clean, calm design that feels like paper
- **One-Tap Task Entry** - Add a task and get back to your day
- **Persistent Storage** - Tasks saved with cookies + localStorage fallback

### Gesture-Based Interactions
- **Tap** - Toggle task completion
- **Long Press** - Reassign task due date
- **Swipe Left** - Delete task (with confirmation)
- **Swipe Right** - Open task details (notes & subtasks)
- **Horizontal Swipe** - Navigate between time views

### Advanced Features
- **Task Details** - Add notes and subtasks to any task
- **Visual Indicators** - Icons show when tasks have additional information
- **Responsive Design** - Mobile-first with desktop support
- **Date Display** - Shows day and date for each view (e.g., "Tuesday, Jun 16")
- **Data Validation** - Robust error handling and data integrity

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/mavcongoc/TODAY.git
cd TODAY

# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Production Build

\`\`\`bash
# Build for production
npm run build

# Start production server
npm start
\`\`\`

## 📱 How to Use

### Basic Task Management
1. **Add Task** - Type in the input field at the top and press Enter or click the + button
2. **Complete Task** - Tap the checkbox or task text to mark as done
3. **Navigate Views** - Swipe left/right or use header arrows to move between Today/Tomorrow/Next 3 Days

### Advanced Interactions
1. **Reassign Date** - Long press any task to change its due date
2. **Delete Task** - Swipe task to the left, then confirm deletion
3. **Add Details** - Swipe task to the right to add notes and subtasks
4. **Auto-Rollover** - Incomplete tasks automatically move forward each day at midnight

## 🛠 Technical Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Gestures**: react-swipeable
- **Date Handling**: date-fns

### Project Structure
\`\`\`
├── app/
│   ├── layout.tsx          # Root layout with fonts and metadata
│   ├── page.tsx            # Main app page with view navigation
│   └── globals.css         # Global styles and Tailwind config
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── view-header.tsx     # Header with date and navigation
│   ├── task-input.tsx      # Task creation input
│   ├── task-list.tsx       # Task list display
│   ├── task-item.tsx       # Individual task with gestures
│   ├── task-details-modal.tsx    # Notes and subtasks modal
│   ├── due-date-reassign-modal.tsx # Date reassignment modal
│   └── delete-confirmation-dialog.tsx # Delete confirmation
├── contexts/
│   └── task-context.tsx    # Global state management
├── hooks/
│   └── use-long-press.ts   # Custom long press detection
├── lib/
│   ├── types.ts           # TypeScript interfaces
│   ├── date-utils.ts      # Date manipulation utilities
│   ├── storage.ts         # Persistent storage management
│   └── utils.ts           # General utilities
└── README.md
\`\`\`

### State Management
- **Context API** - Global task state with React Context
- **Local State** - Component-specific UI state
- **Persistent Storage** - Hybrid cookies + localStorage system

### Data Flow
1. **Tasks** stored in context with automatic persistence
2. **Categories** determined dynamically based on current date
3. **Auto-rollover** handled by date comparison logic
4. **Gestures** processed at component level with event propagation control

## 📝 Development Log

### Initial Setup & Core Features
**Commit**: `feat: Initial Today app setup with basic task management`
- Set up Next.js 15 project with TypeScript and Tailwind
- Implemented basic task creation and completion
- Added responsive mobile-first design
- Created task context for state management

### Navigation & View System  
**Commit**: `feat: Add swipe navigation between time views`
- Implemented horizontal swipe navigation (Today/Tomorrow/Next 3 Days)
- Added view header with date display
- Created task list container with smooth transitions
- Added navigation arrows for desktop users

### Date Management & Auto-Rollover
**Commit**: `feat: Implement auto-rollover and date utilities`
- Built comprehensive date utility functions
- Added automatic task rollover at midnight
- Implemented dynamic task categorization
- Enhanced date display with day names (e.g., "Tuesday, Jun 16")

### Gesture System & Task Interactions
**Commit**: `feat: Add gesture-based task interactions`
- Implemented long press for date reassignment
- Added swipe left for task deletion with confirmation
- Added swipe right for task details (notes & subtasks)
- Created custom long press hook
- Resolved swipe conflicts between page and task levels

### Task Details & Enhanced Features
**Commit**: `feat: Add task details with notes and subtasks`
- Built comprehensive task details modal
- Added notes functionality with textarea
- Implemented subtask creation, completion, and deletion
- Added visual indicators for tasks with additional info
- Enhanced task data structure

### Persistent Storage System
**Commit**: `feat: Implement robust persistent storage with cookies`
- Created hybrid storage system (cookies + localStorage)
- Added cookie chunking for large datasets
- Implemented data validation and migration
- Added loading states and error handling
- Enhanced data reliability across browser sessions

### UI Polish & Bug Fixes
**Commit**: `fix: Resolve input focus outline alignment in modals`
- Fixed modal input field focus outline clipping
- Improved checkbox interaction isolation
- Enhanced modal padding and spacing
- Refined gesture conflict resolution
- Polished overall user experience

## 🎯 Design Philosophy

### Minimalism First
- **Single Purpose** - Focus only on today's priorities
- **Cognitive Load Reduction** - Three simple time buckets instead of complex calendars
- **Visual Clarity** - Clean typography, ample whitespace, neutral colors
- **Gesture-Driven** - Intuitive swipes replace cluttered buttons

### Mobile-First Approach
- **Touch Optimized** - Large tap targets, smooth gestures
- **Responsive Design** - Scales beautifully from mobile to desktop
- **Performance** - Fast loading, smooth animations
- **Accessibility** - Keyboard navigation, screen reader support

### Future-Ready Architecture
- **Modular Components** - Easy to extend and maintain
- **Type Safety** - Full TypeScript coverage
- **Scalable State** - Context-based architecture ready for server sync
- **AI Integration Ready** - Structured for future intelligent features

## 🔮 Roadmap

### Phase 1: AI Integration (Planned)
- Natural language task input ("Remind me to call mom tomorrow")
- Smart task prioritization and suggestions
- Intelligent auto-categorization
- Context-aware reminders

### Phase 2: Sync & Collaboration (Future)
- Cross-device synchronization
- Shared task lists
- Team collaboration features
- Cloud backup and restore

### Phase 3: Advanced Features (Future)
- Task templates and recurring tasks
- Time tracking and analytics
- Integration with calendar apps
- Voice input and commands

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain mobile-first responsive design
- Write meaningful commit messages
- Test gesture interactions on multiple devices
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** - Beautiful, accessible UI components
- **Lucide** - Clean, consistent icons
- **Tailwind CSS** - Utility-first CSS framework
- **Next.js** - React framework for production
- **Vercel** - Deployment and hosting platform

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/mavcongoc/TODAY/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mavcongoc/TODAY/discussions)
- **Email**: [Contact](mailto:your-email@example.com)

---

**Built with ❤️ for productivity enthusiasts who value simplicity and focus.**
