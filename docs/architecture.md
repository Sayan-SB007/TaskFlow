# TaskFlow — Architecture

## 1. Architecture Overview

TaskFlow follows a modular React Native architecture with clear separation between presentation, navigation, feature logic, state, services, persistence, synchronization and remote infrastructure.

```text
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

## 2. Technology Stack

 Area                  Technology
  --------------------- ------------------------------------------------------
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
The assignment expects Redux Toolkit, React Navigation, SQLite/Realm-style local persistence, Firebase Authentication, Firestore synchronization, notifications, theming, multi-environment configuration, FlatList optimization and lazy loading.

## 3. Current Folder Structure

```text
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
│   │   ├── Button/
│   │   ├── ErrorState/
│   │   ├── Input/
│   │   ├── Loading/
│   │   ├── OfflineBanner/
│   │   └── Screen/
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

### Why this structure works

`src/features/` contains domain-specific functionality.

`src/components/` contains reusable UI components.

`src/database/` isolates SQLite/local persistence.

`src/config/` contains environment/configuration concerns.

`src/navigation/` owns navigation structure.

`src/theme/` owns design tokens and theme configuration.

`src/app/` contains application-wide Redux/store/provider setup.
A root `src/services/` directory may be added only if shared infrastructure services become numerous enough to justify it. Existing feature-local services can remain inside their feature.

## 4. Tasks Feature Architecture

The original TasksScreen grew to several thousand lines. It has been refactored without removing existing functionality.

```text
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

`TasksScreen` is the orchestration layer for Redux selectors/actions, active filters, selected task, modal visibility, CRUD callbacks and completion state.

Focused components own presentation and local UI concerns.

## 5. Task Data Flow

### Online

```text
User
 ↓
Task Form
 ↓
Redux / Task Action
 ↓
Task Repository
 ↓
SQLite
 ↓
Sync Queue
 ↓
Firestore
 ↓
Synced state
```

### Offline

```text
User
 ↓
Task Form
 ↓
Redux / Task Action
 ↓
Task Repository
 ↓
SQLite
 ↓
Pending Sync Queue
 ↓
Local UI state
```

### Reconnection

```text
Network becomes available
 ↓
NetInfo event
 ↓
Sync service
 ↓
Read pending operations
 ↓
Firestore write/delete
 ↓
Mark synchronized
 ↓
Refresh local state
```

UI components should not execute raw SQLite or Firestore operations.

## 6. Authentication Flow

```text
App
 ↓
Firebase Auth session check
 ├── No session → AuthNavigator → Login / Sign Up
 └── Session → AppNavigator → Tasks / Settings
```

Authentication uses the existing auth feature/service/state and Firebase Authentication.

An `AuthProvider.tsx` is not required merely to make the architecture appear more complex.

## 7. Firestore Structure

```text
users/
  {userId}/
    tasks/
      {taskId}
```

Recommended rule:

```text
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

The authenticated UID is the ownership boundary.

## 8. Database Architecture

The existing SQLite layer already provides a repository boundary:

```text
database/
├── migrations/
│   └── v1.ts
├── repositories/
│   ├── taskRepository.ts
│   └── syncRepository.ts
├── sqlite.ts
└── debug.ts
```

### `sqlite.ts`
SQLite connection/setup and low-level database access.

### `migrations/`
Schema/version changes.

### `taskRepository.ts`
Task persistence operations.

### `syncRepository.ts`
Persistence for pending synchronization operations.

### `debug.ts`
Database debugging/development support.

Screens/components must not contain raw SQLite queries:

```text
Feature → Repository → SQLite
```

No artificial database restructuring is required.

## 9. Redux Toolkit

Redux Toolkit manages application/feature state.

```text
Component
 ↓
Redux action
 ↓
Feature/reducer logic
 ↓
State update
```

Redux is not the durable database:

```text
Redux → runtime/application state
SQLite → durable local persistence
Firestore → remote synchronized state
```

## 10. Synchronization

NetInfo detects connectivity changes:

```text
NetInfo
 ↓
Online/offline transition
 ↓
Sync feature/service
 ↓
Sync repository
 ↓
Pending operations
 ↓
Firestore
```

Failed synchronization operations must not be silently discarded; they should remain available for retry.

## 11. Navigation

```text
RootNavigator
├── AuthNavigator
│   ├── Login
│   └── Signup
└── AppNavigator
    ├── Tasks
    └── Settings
```

Authentication state determines the active navigation flow.

## 12. Notifications

Current notification architecture focuses on local task reminders:

```text
Task due/reminder data
 ↓
Notification feature
 ↓
Local notification scheduling
 ↓
Device notification
```

The Tasks UI separately exposes today's reminders/notification state.

Firebase Cloud Messaging/server push remains a bonus/future enhancement.

## 13. Theme

```text
src/theme/
├── colors.ts
├── darkTheme.ts
├── lightTheme.ts
├── ThemeProvider.tsx
├── shadows.ts
├── spacing.ts
└── typography.ts
```

Settings controls the user's theme preference.

Components should consume the active theme:

```tsx
const {theme} = useTheme();
```

rather than importing `lightTheme` directly.

## 14. Performance

Current performance-oriented decisions:

- `FlatList` for task collections.
- Stable task keys.
- Focused task row components.
- Memoization where useful.
- Lazy loading where applicable.
- Synchronization outside render paths.
- Local persistence to avoid unnecessary repeated remote reads.
- Component extraction from the original large TasksScreen.

Optimization should remain evidence-driven rather than adding unnecessary abstraction.

## 15. Security

- Firebase Authentication controls identity.
- Firestore access is user-scoped.
- `request.auth.uid` enforces ownership.
- Secrets must not be committed.
- Real `.env` files remain ignored.
- Client Firebase configuration is not a substitute for Firestore security rules.

## 16. Multi-environment Configuration

The assignment expects development, staging and production configuration.

Recommended sample files:

```text
.env.example
.env.development.example
.env.staging.example
.env.production.example
```

The exact environment-loading mechanism is implementation-specific. Environment-specific values must not be hard-coded into feature components.

## 17. Architectural Decisions

### Existing database structure is retained
The current migrations, repositories, SQLite connection and debug utilities already form a useful persistence boundary.

### No artificial AuthProvider
The existing authentication feature/state/navigation flow is sufficient.

### Tasks remain modular
The large TasksScreen is split into focused components while preserving functionality.

### Infrastructure stays out of UI
Screens coordinate features; they should not contain raw SQLite, Firestore or synchronization logic.

### Abstractions must have responsibility
Folders/services should exist because they own a real responsibility, not simply to make the architecture diagram look more enterprise-like.

## 18. Target Architecture

```text
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
