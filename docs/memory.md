# TaskFlow --- Project Memory

This file is a durable technical context document for future development
sessions.

## Product

TaskFlow is a React Native task-management application.

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

Tasks belong to the authenticated user.

Firestore path:

``` text
users/{userId}/tasks/{taskId}
```

The authenticated Firebase UID is the source of ownership.

## Offline Model

The application is offline-first for task operations.

``` text
UI
 ↓
Local state / SQLite
 ↓
Pending sync
 ↓
Firestore when online
```

The user should never lose a task merely because connectivity is
temporarily unavailable.

## Sync States

The UI can communicate states such as:

-   Offline.
-   Syncing.
-   Synced.
-   Pending changes.
-   Sync error.

Do not remove sync feedback without replacing it with an equally clear
user experience.

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

The exact project type should remain the source of truth if it differs
from this conceptual model.

## UI Decisions

-   Task creation/editing uses a sheet/modal.
-   Modal has an elevated white surface above a dimmed background.
-   Priority uses semantic colors.
-   Date/time controls use native pickers.
-   Date/time controls use muted borders rather than the strong
    selected-priority border.
-   Primary actions use blue.
-   Iconography should use a consistent icon library.

## Important Development Rules

1.  Do not remove existing functionality during refactoring.
2.  Check both screen-level and component-level duplicate
    implementations before changing a feature.
3.  Keep task persistence and synchronization separate from
    presentation.
4.  Keep Firestore rules user-scoped.
5.  Run TypeScript validation after changes.
6.  Test offline and reconnect flows after synchronization changes.
7.  Update documentation when architecture changes.

## Known Duplicate-Implementation Risk

During development, task form/task details components may exist in both
screen and component locations.

Before editing one:

``` text
Search all usages
    ↓
Identify the rendered implementation
    ↓
Trace imports
    ↓
Modify the active implementation
```

Do not delete a duplicate until all imports/usages have been checked.

## Final Verification Checklist

-   Auth works.
-   Task CRUD works.
-   Complete/incomplete works.
-   SQLite works.
-   Offline operations work.
-   Reconnection sync works.
-   Firestore rules work.
-   Task detail reflects status changes.
-   Date/time picker works.
-   Modal does not overlap system UI.
-   Notifications work.
-   Lazy loading works.
-   FlatList works.
-   TypeScript passes.
-   Environment configuration is documented.
-   Light/dark theme is verified.
