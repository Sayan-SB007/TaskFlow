# TaskFlow --- Development Phases

## Phase 1 --- Project Foundation

### Completed

-   React Native project created.
-   TypeScript configured.
-   Modular `src` structure established.
-   Redux Toolkit store/application state foundation.
-   React Navigation foundation.
-   Reusable UI components.

## Phase 2 --- Authentication

### Completed

-   Firebase Authentication integration.
-   Login.
-   Registration.
-   Persistent authenticated session.
-   Logout.
-   Authenticated application flow.

## Phase 3 --- Task Management

### Completed

-   Task creation.
-   Task listing.
-   Task details.
-   Task editing.
-   Task deletion.
-   Complete/incomplete status.
-   Priority selection.
-   Description.
-   Basic validation.
-   Optional due date.
-   Optional due time.
-   Native date/time picker integration.

## Phase 4 --- Local Persistence

### Completed

-   SQLite local storage.
-   Local task reads/writes.
-   Offline task availability.

## Phase 5 --- Synchronization

### Completed

-   Network connectivity detection.
-   Pending local operation handling.
-   Firestore synchronization.
-   Retry after reconnection.
-   Sync status UI.
-   User feedback for offline/syncing/synced states.

## Phase 6 --- UI/UX Refinement

### Completed

-   Task form sheet/modal styling.
-   Task details modal styling.
-   Priority visual states.
-   Muted date/time fields.
-   Native picker icons.
-   Modal elevation/shadow treatment.
-   Safe-area-aware layout.
-   Bottom action spacing.

## Phase 7 --- Performance

### Completed

-   FlatList-based task rendering.
-   Lazy loading implemented for applicable screens.

## Phase 8 --- Notifications

### Current

-   Local notification implementation/integration is the next feature
    area.
-   Task reminder scheduling should use the task's optional due
    date/time.
-   Notification cancellation/rescheduling should happen when a task is
    deleted or its reminder changes.

### Bonus / Future

-   Firebase Cloud Messaging server push.

The assignment identifies local task reminders as a requirement and FCM
server push as a bonus.  

## Phase 9 --- Environment Configuration

### Remaining / Verify

The assignment requires:

-   Development environment.
-   Staging environment.
-   Production environment.
-   Sample `.env` files for each environment.  

Before final submission, verify that the project can clearly explain how
each environment is selected and run.

## Phase 10 --- Theming

### Remaining / Verify

The assignment requires dark/light mode.  

Verify:

-   Theme state.
-   System/default behavior.
-   Light theme.
-   Dark theme.
-   Persistence if desired.
-   All major components respond to theme changes.

## Phase 11 --- Final QA

Before submission:

``` text
Authentication
    ↓
Create task
    ↓
Edit task
    ↓
Delete task
    ↓
Complete / incomplete
    ↓
Offline create/edit/delete
    ↓
Reconnect
    ↓
Sync
    ↓
Reminder notification
    ↓
Notification tap
    ↓
Task details
```

Also verify:

-   `npx tsc --noEmit`
-   Android build.
-   iOS build if available.
-   No console errors.
-   No missing SafeAreaProvider errors.
-   No raw text rendering errors.
-   No Firestore permission errors.

## Phase 12 --- Submission

Required deliverables include:

-   GitHub repository.
-   Source code.
-   README.
-   Architecture explanation.
-   Libraries used.
-   Environment setup.
-   Known limitations.
-   Sample environment files.
-   Loom walkthrough.  
