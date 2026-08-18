# TaskFlow --- Architecture

## 1. Architecture Overview

TaskFlow follows a modular React Native architecture with separation
between presentation, navigation, feature logic, state, services,
persistence, synchronization, and remote infrastructure.

``` text
UI
 ↓
Navigation / Screens
 ↓
Feature Components
 ↓
Redux Toolkit / Feature Actions
 ↓
Domain / Services
 ↓
Repositories
 ↓
Local SQLite Persistence
 ↓
Sync Layer
 ↓
Firebase Firestore
```
Authentication is handled by Firebase Authentication. Connectivity is handled separately so synchronization can react to online/offline transitions.

------------------------------------------------------------------------

The task architecture follows a local-first approach:

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

## 2. Technology Stack

  Area                  Technology
  --------------------- ------------------------------------------
  Mobile framework      React Native
  Language              TypeScript
  State management      Redux Toolkit
  Navigation            React Navigation
  Authentication        Firebase Authentication
  Remote database       Cloud Firestore
  Local database        SQLite
  Connectivity          NetInfo
  Date/time selection   `@react-native-community/datetimepicker`
  Icons                 React Native icon package/family used by the project
  Notifications         Local notification library
  Build platforms       Android / iOS


The Project expects Redux Toolkit, React Navigation, SQLite/Realm-style local persistence, Firebase Authentication, Firestore synchronization, notifications, theming, multi-environment configuration, FlatList optimization and lazy loading.
------------------------------------------------------------------------

## 3. Folder Structure

``` text
TaskFlow/
├── .vscode/
├── android/
├── docs/
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
└── README.md
```

------------------------------------------------------------------------

`src/components/` contains reusable UI components.

`src/database/` isolates SQLite/local persistence.

`src/config/` contains environment/configuration concerns.

`src/navigation/` owns navigation structure.

`src/theme/` owns design tokens and theme configuration.

`src/app/` contains application-wide Redux/store/provider setup.
A root `src/services/` directory may be added only if shared infrastructure services become numerous enough to justify it. Existing feature-local services can remain inside their feature.
## 4. Tasks Feature Architecture

``` text
features/tasks/
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

The original large `TasksScreen` was decomposed into focused components
while preserving functionality.

------------------------------------------------------------------------

# 5. Complete Task Data Flow

TaskFlow uses a local-first task architecture. The UI does not
communicate directly with SQLite or Firestore.

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

This is the primary task lifecycle.

------------------------------------------------------------------------

# 6. Local Write Architecture

Every task mutation follows:

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
```

SQLite is the first durable persistence layer.

The UI does not wait for Firestore before reflecting the user's change.

------------------------------------------------------------------------

# 7. Redux Update

After the local operation succeeds:

``` text
SQLite
 ↓
Redux
 ↓
UI
```

Conceptually:

``` text
Redux
  = Runtime / UI state

SQLite
  = Durable local state

Firestore
  = Remote synchronized state
```

------------------------------------------------------------------------

# 8. Synchronization Scheduler

After a successful local mutation, the synchronization service schedules
a background synchronization cycle.

``` text
Create
Edit
Toggle
Delete
   ↓
~400ms debounce
   ↓
One background synchronization cycle
```

The debounce prevents closely-spaced operations from unnecessarily
triggering separate synchronization cycles.

------------------------------------------------------------------------

# 9. Online Synchronization

``` text
Pending Operations
 ↓
Sync Service
 ↓
Firestore
 ↓
Mark synchronized
```

Normal online synchronization is silent.

The application does not display a sync banner for every online CRUD
operation.

------------------------------------------------------------------------

# 10. Offline Synchronization

``` text
Local Mutation
 ↓
SQLite
 ↓
Pending Operation
 ↓
Wait for Network
```

The user can continue creating, editing, completing, and deleting tasks
while offline.

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

# 11. Reconnection Flow

NetInfo detects when connectivity becomes available.

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
Mark synchronized
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

Visible status during reconnection:

``` text
Back online · Syncing...
        ↓
All changes synced
```

------------------------------------------------------------------------

# 12. Initial Data Hydration

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

This ensures remote tasks synchronized into SQLite are also reflected in
Redux immediately.

------------------------------------------------------------------------

# 13. Synchronization UI Behavior

### Normal Online Operation

``` text
User changes task
 ↓
SQLite
 ↓
Redux/UI
 ↓
Background Firestore sync
```

No banner.

### Offline

``` text
Task changes
 ↓
Pending queue
 ↓
"3 unsynced changes"
```

### Reconnection

``` text
Network restored
 ↓
"Syncing changes..."
 ↓
"All changes synced"
```

------------------------------------------------------------------------

# 14. Synchronization Responsibility

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

# 15. Authentication Flow

``` text
App
 ↓
Firebase Auth session check
 ├── No session → AuthNavigator → Login / Sign Up
 └── Session → AppNavigator → Tasks / Settings
```

An `AuthProvider.tsx` is not required merely for architectural
appearance.

------------------------------------------------------------------------

# 16. Firestore Structure

``` text
users/
  {userId}/
    tasks/
      {taskId}
```

Recommended ownership rule:

``` text
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/tasks/{taskId} {
      allow read, write: if request.auth != null
                          && request.auth.uid == userId;
    }
  }
}
```

------------------------------------------------------------------------

# 17. Database Architecture

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

Responsibilities:

-   `sqlite.ts` --- SQLite initialization and low-level access.
-   `migrations/` --- database schema/version changes.
-   `taskRepository.ts` --- task persistence.
-   `syncRepository.ts` --- synchronization persistence.
-   `debug.ts` --- database debugging.

Screens/components do not contain raw SQLite queries.

------------------------------------------------------------------------

# 18. Redux Toolkit

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

Redux is runtime state, not the durable database.

``` text
Redux → Runtime state
SQLite → Durable local state
Firestore → Remote synchronized state
```

------------------------------------------------------------------------

# 19. Repository Pattern

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

# 20. Synchronization Layer

``` text
NetInfo
 ↓
Online/offline transition
 ↓
Sync Service
 ↓
Pending operations
 ↓
Firestore
```

The synchronization service owns orchestration.

Repositories own persistence.

------------------------------------------------------------------------

# 21. Navigation

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

# 22. Notifications

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

# 23. Theme

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

# 24. Performance

Current performance-oriented decisions:

-   `FlatList`
-   Stable task keys
-   Focused task-row components
-   Memoization where useful
-   Lazy loading where applicable
-   SQLite-first updates
-   Debounced background synchronization
-   Synchronization outside render paths
-   Modular task components

------------------------------------------------------------------------

# 25. Security

-   Firebase Authentication controls identity.
-   Firestore access is user-scoped.
-   `request.auth.uid` enforces ownership.
-   Secrets must not be committed.
-   Real `.env` files remain ignored.
-   Firebase client configuration is not an authorization boundary.
-   Firestore rules enforce access control.

------------------------------------------------------------------------

# 26. Multi-environment Configuration

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

------------------------------------------------------------------------

# 27. Architectural Decisions

## Local-first task persistence

Task changes are persisted locally before remote synchronization.

## Immediate UI updates

SQLite and Redux allow task changes to appear immediately.

## Background synchronization

Firestore synchronization happens independently from the immediate UI
operation.

## Debounced synchronization

Closely-spaced task changes are grouped into a synchronization cycle.

## Silent online synchronization

Normal online background synchronization does not display a banner for
every task operation.

## Visible offline recovery

Offline/reconnection synchronization can surface useful status
information.

## Repository boundary

Database implementation details remain behind repositories.

## Modular tasks feature

The large `TasksScreen` is decomposed into focused components while
preserving functionality.

------------------------------------------------------------------------

# 28. Target Architecture

``` text
                 ┌──────────────────────┐
                 │    React Native UI   │
                 └──────────┬───────────┘
                            │
                 ┌──────────▼───────────┐
                 │ Navigation / Screens │
                 └──────────┬───────────┘
                            │
                 ┌──────────▼───────────┐
                 │ Feature Components   │
                 └──────────┬───────────┘
                            │
                 ┌──────────▼───────────┐
                 │ Redux / Feature Logic│
                 └──────────┬───────────┘
                            │
                 ┌──────────▼───────────┐
                 │ Domain / Services    │
                 └──────────┬───────────┘
                            │
                 ┌──────────▼───────────┐
                 │ Repository Layer     │
                 └──────────┬───────────┘
                            │
                 ┌──────────▼───────────┐
                 │ SQLite / Persistence │
                 └──────────┬───────────┘
                            │
                 ┌──────────▼───────────┐
                 │ Sync + NetInfo       │
                 └──────────┬───────────┘
                            │
                 ┌──────────▼───────────┐
                 │ Firebase Firestore   │
                 └──────────────────────┘
```

------------------------------------------------------------------------

# 29. End-to-End Architecture Flow

``` text
                    ┌───────────────────┐
                    │       USER        │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ React Native UI   │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │   Redux Thunk     │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │   TaskService     │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ TaskRepository    │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │      SQLite       │
                    └─────────┬─────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
        ┌───────────────┐          ┌────────────────┐
        │   Redux/UI    │          │ Pending Queue  │
        │   Immediate   │          └───────┬────────┘
        └───────────────┘                  │
                                           ▼
                                  ┌────────────────┐
                                  │ Sync Scheduler │
                                  │    ~400ms      │
                                  └───────┬────────┘
                                          │
                              ┌───────────┴───────────┐
                              │                       │
                           Offline                 Online
                              │                       │
                              ▼                       ▼
                       ┌────────────┐         ┌────────────┐
                       │   Keep     │         │ Background │
                       │  Pending   │         │    Sync    │
                       └─────┬──────┘         └─────┬──────┘
                             │                      │
                             │                      ▼
                             │               ┌────────────┐
                             │               │ Firestore  │
                             │               └─────┬──────┘
                             │                     │
                             │                     ▼
                             │               ┌────────────┐
                             │               │   SQLite   │
                             │               └─────┬──────┘
                             │                     │
                             │                     ▼
                             │              ┌─────────────┐
                             │              │refreshTasks │
                             │              └──────┬──────┘
                             │                     │
                             └─────────────────────┴────────► Redux/UI
```

This represents the complete local-first, offline-capable
synchronization architecture used by TaskFlow.
