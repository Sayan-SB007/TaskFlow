# TaskFlow --- Project Memory

This document records durable technical decisions and context for future
development sessions.

## Product

TaskFlow is a React Native task-management application focused on
authenticated personal task management, offline persistence, Firestore
synchronization, local reminders and theming.

## Core Architecture

``` text
React Native
├── Firebase Authentication
├── Redux Toolkit
├── SQLite
├── NetInfo
├── Firestore
├── React Navigation
└── Local Notifications
```

## Data Ownership

Tasks belong to the authenticated Firebase user.

Conceptual path:

``` text
users/{userId}/tasks/{taskId}
```

The authenticated Firebase UID is the ownership boundary.

## Database Decision

The existing database structure is intentionally retained:

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

This already provides a meaningful separation between database setup,
schema changes, task persistence and synchronization persistence.

No artificial database restructuring is required.

## Offline Model

``` text
UI
 ↓
Local state / SQLite
 ↓
Pending sync
 ↓
Firestore when online
```

The user should not lose a task because connectivity is temporarily
unavailable.

## Sync States

Possible states include:

-   Offline.
-   Pending changes.
-   Syncing.
-   Synced.
-   Sync error.

Failed operations must not be silently discarded.

## Task Model

Conceptually:

``` ts
type TaskPriority = 'low' | 'medium' | 'high';

type TaskStatus = 'pending' | 'completed';

interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string | null;
  dueTime?: string | null;
  createdAt: string;
  updatedAt: string;
}
```

The project's actual TypeScript type is the source of truth.

## TasksScreen Refactor

The main TasksScreen was decomposed because it had grown to several
thousand lines.

The screen now focuses on orchestration while focused components handle
presentation:

``` text
TaskCard
ProductivityCard
TasksHeader
TaskFilters
TaskEmptyState
DeleteConfirmation
NotificationsSheet
TaskLoadingOverlay
TaskFormSheet
TaskDetailsSheet
```

Date filtering is separated into task utilities.

Benefits:

-   Maintainability.
-   Readability.
-   Easier testing.
-   Easier theme support.
-   Easier debugging.
-   Clearer feature boundaries.

## Theme Decision

Theme support is centralized under:

``` text
src/theme/
├── lightTheme.ts
├── darkTheme.ts
├── ThemeProvider.tsx
├── colors.ts
├── spacing.ts
├── shadows.ts
└── typography.ts
```

Components should use the active theme:

``` tsx
const {theme} = useTheme();
```

Do not hard-code `lightTheme` values in components that need dark-mode
support.

## Authentication Decision

Authentication continues to use the existing auth service/state and
navigation architecture.

An `AuthProvider.tsx` is not required simply for architectural
appearance.

## Notification Decision

Current scope:

-   Local task reminders.
-   Notification handlers.
-   Notification indicator.
-   Today's reminder UI.

Server push via FCM remains a possible bonus/future enhancement.

## UI Decisions

-   Create/edit uses an elevated sheet.
-   Task details uses an elevated sheet.
-   Notifications uses the same elevated modal principle.
-   Modal backdrops are theme-aware.
-   Priority uses semantic colors.
-   Date/time uses native pickers.
-   Core actions use FontAwesome6.
-   Primary actions use blue.
-   Task cards are theme-aware.

## Development Rules

1.  Do not remove existing functionality during refactoring.
2.  Search imports/usages before deleting duplicate components.
3.  Keep persistence separate from presentation.
4.  Keep sync separate from presentation.
5.  Keep Firestore user-scoped.
6.  Run TypeScript validation after changes.
7.  Test offline/reconnect flows after sync changes.
8.  Update documentation after architecture changes.

## Known Duplicate Risk

Task form/details implementations have existed in both screen and
component locations.

Before editing/deleting one:

``` text
Search all usages
 ↓
Trace imports
 ↓
Identify rendered implementation
 ↓
Modify active implementation
 ↓
Delete duplicate only after verification
```

## Final Verification

-   Auth.
-   CRUD.
-   Complete/incomplete.
-   SQLite.
-   Offline operations.
-   Reconnect sync.
-   Firestore permissions.
-   Notifications.
-   Task details state.
-   Date/time picker.
-   Today/Upcoming filters.
-   Safe-area modal behavior.
-   FlatList.
-   Lazy loading.
-   TypeScript.
-   Android build.
-   Light/dark theme.
-   Theme switching.
-   Environment documentation.
