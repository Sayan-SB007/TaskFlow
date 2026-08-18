# TaskFlow

TaskFlow is a cross-platform React Native task-management application
built with a modular, offline-first architecture.

The application demonstrates authentication, task management, offline
SQLite persistence, Firestore synchronization, notifications, Redux
Toolkit, React Navigation, theming, performance optimization, and
production-oriented project organization.

------------------------------------------------------------------------

## Features

### Authentication

-   Firebase email/password authentication
-   User registration and login
-   Session persistence
-   Logout
-   Protected application navigation

### Task Management

-   Create, edit and delete tasks
-   Mark tasks complete/incomplete
-   Task details
-   Low / Medium / High priority
-   Optional due date/time
-   Validation
-   Native date/time picker
-   All / Today / Upcoming filters

### Offline-first

-   SQLite local persistence
-   Tasks remain available offline
-   Local-first task operations
-   Pending synchronization queue
-   Firestore synchronization when connectivity returns
-   Offline synchronization status
-   Background synchronization
-   Debounced synchronization
-   Remote state refresh after synchronization

### Notifications

-   Local task reminders
-   Reminder scheduling
-   Notification indicator
-   Today's reminder view

### Performance

-   `FlatList`
-   Stable list keys
-   Focused task-row components
-   Lazy loading where applicable
-   Debounced background synchronization
-   SQLite-first updates
-   Synchronization outside render paths
-   Refactored `TasksScreen`
-   Modular task components

### Theming

-   Light mode
-   Dark mode
-   Theme switching from Settings
-   Theme-aware navigation, cards and sheets

------------------------------------------------------------------------

# Architecture

``` text
                    ┌──────────────────┐
                    │   React Native   │
                    │       UI         │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │ React Navigation │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │ Redux Toolkit    │
                    │ App / Feature    │
                    │ State            │
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
     ┌────────▼─────────┐          ┌────────▼─────────┐
     │ Feature Logic /  │          │ Firebase Auth    │
     │ Services         │          │                  │
     └────────┬─────────┘          └──────────────────┘
              │
     ┌────────▼─────────┐
     │ Repository Layer │
     └────────┬─────────┘
              │
     ┌────────▼─────────┐
     │ SQLite / Local   │
     │ Persistence      │
     └────────┬─────────┘
              │
     ┌────────▼─────────┐
     │ Sync / NetInfo   │
     └────────┬─────────┘
              │
     ┌────────▼─────────┐
     │ Firebase         │
     │ Firestore        │
     └──────────────────┘
```

The main principle is:

``` text
Local write first
       ↓
Immediate UI update
       ↓
Background synchronization
       ↓
Remote synchronization
```

------------------------------------------------------------------------

# Project Structure

``` text
TaskFlow/
├── .vscode/
├── android/
├── docs/
│   ├── prd.md
│   ├── architecture.md
│   ├── rules.md
│   ├── phases.md
│   ├── design.md
│   └── memory.md
├── ios/
├── src/
│   ├── app/
│   │   ├── providers/
│   │   ├── appSlice.ts
│   │   └── store.ts
│   ├── components/
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   │   └── v1.ts
│   │   ├── repositories/
│   │   │   ├── syncRepository.ts
│   │   │   └── taskRepository.ts
│   │   ├── debug.ts
│   │   └── sqlite.ts
│   ├── features/
│   │   ├── auth/
│   │   ├── notifications/
│   │   ├── settings/
│   │   ├── sync/
│   │   └── tasks/
│   ├── hooks/
│   ├── navigation/
│   ├── theme/
│   ├── types/
│   └── utils/
├── App.tsx
├── package.json
├── .gitignore
└── README.md
```

  Directory                   Responsibility
  --------------------------- ---------------------------------------
  `app/`                      Application-wide store/provider setup
  `components/`               Shared reusable UI
  `config/`                   Application configuration
  `database/`                 SQLite and persistence
  `features/auth/`            Authentication
  `features/notifications/`   Notifications
  `features/settings/`        Settings and theme
  `features/sync/`            Synchronization orchestration
  `features/tasks/`           Task domain
  `hooks/`                    Reusable hooks
  `navigation/`               Navigation
  `theme/`                    Design tokens and themes
  `types/`                    Shared TypeScript types
  `utils/`                    Shared utilities

------------------------------------------------------------------------

# Tasks Feature Architecture

The original `TasksScreen` became very large and was refactored into
focused components without removing functionality.

``` text
src/features/tasks/
├── components/
│   ├── TaskCard.tsx
│   ├── ProductivityCard.tsx
│   ├── TasksHeader.tsx
│   ├── TaskFilters.tsx
│   ├── TaskEmptyState.tsx
│   ├── DeleteConfirmation.tsx
│   ├── NotificationsSheet.tsx
│   ├── TaskLoadingOverlay.tsx
│   ├── TaskFormSheet.tsx
│   └── TaskDetailsSheet.tsx
├── screens/
│   └── TasksScreen.tsx
└── utils/
    └── taskDateUtils.ts
```

`TasksScreen.tsx` primarily orchestrates Redux state/actions, filters,
selected task, modal visibility and callbacks. Focused components own
presentation and local UI concerns.

------------------------------------------------------------------------

# Main Technologies

  Technology                   Purpose
  ---------------------------- -------------------------------
  React Native                 Mobile application
  TypeScript                   Type safety
  Redux Toolkit                Application and feature state
  React Navigation             Navigation
  Firebase Authentication      Authentication
  Cloud Firestore              Remote synchronization
  SQLite                       Local persistence
  NetInfo                      Network connectivity
  DateTimePicker               Native date/time selection
  Local Notifications          Task reminders
  FontAwesome / Icon library   Application icons

------------------------------------------------------------------------

# Data Flow

TaskFlow uses a local-first task architecture. The UI does not directly
communicate with SQLite or Firestore.

``` text
                         USER ACTION
                              │
                              ▼
                       Redux Thunk
                              │
                              ▼
                        TaskService
                              │
                              ▼
                      TaskRepository
                              │
                              ▼
                           SQLite
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
                Redux/UI        Pending Operation
                immediately             │
                                       ▼
                              Sync Scheduler
                                (~400ms)
                                       │
                              ┌────────┴────────┐
                              │                 │
                           Offline           Online
                              │                 │
                              ▼                 ▼
                       Keep Pending       Background
                          Queue              Sync
                              │                 │
                              │                 ▼
                              │             Firestore
                              │                 │
                              │                 ▼
                              │              SQLite
                              │                 │
                              │                 ▼
                              │          refreshTasks()
                              │                 │
                              └─────────────────┴──────► Redux/UI
```

------------------------------------------------------------------------

# Online Task Flow

``` text
User Action
    ↓
Redux Thunk
    ↓
TaskService
    ↓
TaskRepository
    ↓
SQLite
    ↓
Redux/UI updates immediately
    ↓
Sync Scheduler (~400ms)
    ↓
Background Firestore Sync
```

Normal online synchronization is intentionally silent.

Multiple close changes are grouped:

``` text
Create
Edit
Complete
Delete
Create
   ↓
~400ms debounce
   ↓
One background sync cycle
   ↓
Firestore
```

------------------------------------------------------------------------

# Offline Task Flow

``` text
User Action
    ↓
Redux Thunk
    ↓
TaskService
    ↓
TaskRepository
    ↓
SQLite
    ↓
Pending Queue
    ↓
Redux/UI updates immediately
    ↓
Wait for Network
```

Example:

``` text
Create Task A
Edit Task B
Complete Task C
Delete Task D
        ↓
4 pending operations
        ↓
SQLite
```

------------------------------------------------------------------------

# Offline Synchronization

``` text
                    ┌─────────────────┐
                    │   User Action   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   Redux Thunk   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Task Service   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Task Repository │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │     SQLite      │
                    │ Local Database  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Pending Queue   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Network         │
                    │ Available?      │
                    └───────┬─────────┘
                         No │       │ Yes
                            │       │
                  ┌─────────▼──┐ ┌──▼────────────┐
                  │ Keep       │ │ Background    │
                  │ Pending    │ │ Sync          │
                  └─────┬──────┘ └──────┬────────┘
                        │               │
                        │        ┌──────▼──────┐
                        │        │  Firestore  │
                        │        └──────┬──────┘
                        │               │
                        │        ┌──────▼──────┐
                        │        │ Mark Synced │
                        │        └──────┬──────┘
                        │               │
                        └───────┬───────┘
                                │
                       ┌────────▼────────┐
                       │ refreshTasks()  │
                       └────────┬────────┘
                                │
                       ┌────────▼────────┐
                       │   Redux / UI    │
                       └─────────────────┘
```

------------------------------------------------------------------------

# Reconnection Flow

``` text
Network becomes available
        ↓
NetInfo
        ↓
Sync Service
        ↓
Read pending operations
        ↓
Firestore write/delete
        ↓
Mark operation synchronized
        ↓
Pull remote task state
        ↓
SQLite
        ↓
refreshTasks()
        ↓
Redux
        ↓
UI
```

During reconnection:

``` text
Back online · Syncing...
        ↓
All changes synced
```

Normal online background synchronization remains silent.

------------------------------------------------------------------------

# Initial Data Hydration

``` text
User Login
    ↓
Firebase Authentication
    ↓
Initial Sync
    ↓
Firestore
    ↓
SQLite
    ↓
refreshTasks()
    ↓
Redux
    ↓
Task UI
```

The explicit `refreshTasks()` step ensures synchronized Firestore data
is reflected in Redux immediately.

------------------------------------------------------------------------

# Synchronization Responsibilities

``` text
TasksScreen
    ↓
Task UI / Redux actions

TaskService
    ↓
Task business/application operations

TaskRepository
    ↓
SQLite persistence

SyncService
    ↓
Connectivity + synchronization orchestration

Firestore
    ↓
Remote persistence
```

UI components do not execute raw SQLite or Firestore operations.

------------------------------------------------------------------------

# Authentication Flow

``` text
APP
 │
 ▼
Firebase Auth Session
 │
 ├── No User → AuthNavigator → Login / Signup
 │
 └── User → AppNavigator → Tasks / Settings
```

------------------------------------------------------------------------

# Database Architecture

``` text
database/
├── migrations/
│   └── v1.ts
├── repositories/
│   ├── taskRepository.ts
│   └── syncRepository.ts
├── sqlite.ts
└── debug.ts
```

-   `sqlite.ts` --- SQLite initialization and low-level access.
-   `migrations/` --- schema/version changes.
-   `taskRepository.ts` --- task persistence.
-   `syncRepository.ts` --- synchronization persistence.
-   `debug.ts` --- database debugging.

Screens/components do not contain raw SQLite queries.

------------------------------------------------------------------------

# Redux Architecture

``` text
Component
 ↓
Redux Action / Thunk
 ↓
Feature Logic
 ↓
Redux State
 ↓
Component
```

``` text
Redux
 ↓
Runtime state

SQLite
 ↓
Durable local state

Firestore
 ↓
Remote synchronized state
```

------------------------------------------------------------------------

# Repository Pattern

``` text
TaskService
     ↓
TaskRepository
     ↓
SQLite
```

Synchronization:

``` text
SyncService
     ↓
SyncRepository
     ↓
SQLite
```

This keeps persistence details outside screens and components.

------------------------------------------------------------------------

# Navigation

``` text
RootNavigator
├── AuthNavigator
│   ├── Login
│   └── Signup
└── AppNavigator
    ├── Tasks
    └── Settings
```

------------------------------------------------------------------------

# Notifications

``` text
Task
  ↓
Due Date / Reminder
  ↓
Notification Feature
  ↓
Local Notification
  ↓
Device
```

Firebase Cloud Messaging/server push remains a future enhancement.

------------------------------------------------------------------------

# Theme Architecture

``` text
src/theme/
├── lightTheme.ts
├── darkTheme.ts
├── ThemeProvider.tsx
├── colors.ts
├── shadows.ts
├── spacing.ts
└── typography.ts
```

Components consume the active theme:

``` tsx
const { theme } = useTheme();
```

------------------------------------------------------------------------

# Performance

-   `FlatList` for task collections
-   Stable task keys
-   Focused task-row components
-   Memoization where useful
-   Lazy loading where applicable
-   SQLite-first updates
-   Debounced background synchronization
-   Synchronization outside render paths
-   Modular task components

------------------------------------------------------------------------

# Security

-   Firebase Authentication controls identity.
-   Firestore access is user-scoped.
-   `request.auth.uid` enforces ownership.
-   Secrets must not be committed.
-   Real `.env` files remain ignored.
-   Firebase client configuration is not an authorization boundary.
-   Firestore security rules enforce access control.

------------------------------------------------------------------------

# Environment Configuration

Supported environments:

``` text
Development
Staging
Production
```

Sample files:

``` text
.env.example
.env.development.example
.env.staging.example
.env.production.example
```

Example:

``` env
APP_ENV=development

FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
```

Real environment files must not be committed.

------------------------------------------------------------------------

# Development

``` bash
npm install
npx react-native start
npx react-native run-android
npx react-native run-ios
```

Type checking:

``` bash
npx tsc --noEmit
```

------------------------------------------------------------------------

# QA Checklist

-   [ ] Login
-   [ ] Registration
-   [ ] Logout
-   [ ] Session persistence
-   [ ] Create task
-   [ ] Edit task
-   [ ] Delete task
-   [ ] Complete/incomplete
-   [ ] Priority
-   [ ] Due date/time
-   [ ] All tasks
-   [ ] Today tasks
-   [ ] Upcoming tasks
-   [ ] SQLite persistence
-   [ ] Offline CRUD
-   [ ] Pending synchronization
-   [ ] Reconnection synchronization
-   [ ] Initial Firestore → SQLite → Redux hydration
-   [ ] Firestore user ownership
-   [ ] Local reminders
-   [ ] Notification UI
-   [ ] Light theme
-   [ ] Dark theme
-   [ ] Theme switching
-   [ ] FlatList
-   [ ] Lazy loading
-   [ ] Debounced background synchronization
-   [ ] Environment configuration
-   [ ] TypeScript validation
-   [ ] Android build
-   [ ] iOS verification where available

------------------------------------------------------------------------

# Known Limitations / Future Enhancements

-   Firebase Cloud Messaging/server push
-   Recurring tasks
-   Shared/team tasks
-   Attachments
-   Advanced analytics
-   Advanced conflict resolution
-   Expanded automated testing
-   CI/CD pipeline
-   Production monitoring and crash reporting

------------------------------------------------------------------------

# Documentation

``` text
docs/
├── prd.md
├── architecture.md
├── rules.md
├── phases.md
├── design.md
└── memory.md
```

Main architecture reference:

``` text
docs/architecture.md
```

------------------------------------------------------------------------

# Project Summary

``` text
React Native
     ↓
TypeScript
     ↓
Redux Toolkit
     ↓
Feature Services
     ↓
Repository Layer
     ↓
SQLite
     ↓
Sync Service + NetInfo
     ↓
Firebase Firestore
```

TaskFlow follows a local-first approach where task changes are persisted
locally and reflected in the UI immediately, while remote
synchronization happens independently in the background.
