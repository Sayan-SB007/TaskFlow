# TaskFlow

TaskFlow is a cross-platform React Native task-management application built with a modular, offline-first architecture.

It demonstrates authentication, task management, offline-first SQLite persistence, Firestore synchronization, notifications, Redux Toolkit, React Navigation, theming, FlatList/lazy-loading performance, modular architecture, and production-oriented code organization.

## Features

### Authentication
- Firebase email/password authentication
- Session persistence
- Login, registration and logout
- Protected application navigation

### Task Management
- Create, edit and delete tasks
- Mark complete/incomplete
- Task details
- Priority: Low / Medium / High
- Optional due date/time
- Basic validation
- Native date/time pickers
- All / Today / Upcoming filtering

### Offline-first
- SQLite local persistence
- Tasks remain available offline
- Local changes are queued for synchronization
- Firestore synchronization when connectivity returns
- Sync/offline state surfaced to the user

### Notifications
- Local task reminders
- Notification handling
- Today's reminder UI and notification indicator
- Firebase Cloud Messaging/server push is a bonus/future enhancement

### Performance
- `FlatList` for task collections
- Stable keys
- Focused task-row components
- Lazy loading where applicable
- Sync work outside render paths
- Refactored large TasksScreen

### Theming
- Light theme
- Dark theme
- Theme switching from Settings
- Theme-aware screens, cards, sheets and navigation


## Architecture


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
                    │  App / Feature   │
                    │      State       │
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
     │   Persistence    │
     └────────┬─────────┘
              │
     ┌────────▼─────────┐
     │ Sync / NetInfo   │
     └────────┬─────────┘
              │
     ┌────────▼─────────┐
     │ Firebase         │
     │   Firestore      │
     └──────────────────┘

### Folder Structure

```text
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

`features/` owns domain functionality, `components/` shared UI, `database/` local persistence, `config/` configuration, `navigation/` navigation, `theme/` design tokens, and `app/` application-wide store/provider setup.

A root `src/services/` layer can be introduced if shared infrastructure services become numerous enough to justify it. It is not required just to make the folder tree look more complex.


## Main Libraries

  Library / Technology                       Purpose
  ------------------------------------------ -----------------------------------
  React Native                               Cross-platform mobile application
  TypeScript                                 Type safety
  Redux Toolkit                              Application state
  React Navigation                           Navigation
  Firebase Authentication                    Authentication
  Cloud Firestore                            Remote task synchronization
  SQLite                                     Offline/local task persistence
  NetInfo                                    Connectivity detection
  `@react-native-community/datetimepicker`   Native date/time picker
  Local notification library                 Task reminders
  Project icon package / FontAwesome6         Icons 

## Requirements

- Node.js compatible with installed React Native
- npm
- Android Studio / Android SDK
- Xcode for iOS on macOS
- Firebase project

Check `package.json` for exact versions.

## Installation

```bash
git clone <your-repository-url>
cd TaskFlow
npm install
npx react-native start
npx react-native run-android
```

For iOS:

```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

## Type Checking

```bash
npx tsc --noEmit
```

The project should pass TypeScript validation before submission.

## Tasks Feature Refactor

The original TasksScreen grew to several thousand lines and was decomposed without removing functionality:

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

`TasksScreen` primarily orchestrates Redux state/actions, filters, selected task, modal visibility and callbacks. Focused components own presentation and local UI concerns.

## Data Flow

### Online

```text
User → Task Form → Feature/Redux → Task Repository → SQLite
     → Sync Queue → Firestore → Synced state
```

### Offline

```text
User → Task Form → Feature/Redux → Task Repository
     → SQLite → Pending Sync Queue → Local UI state
```

### Reconnection

```text
NetInfo online
 ↓
Sync service
 ↓
Pending local operations
 ↓
Firestore write/delete
 ↓
Mark synchronized
 ↓
Refresh local state
```

UI components do not need to know the SQLite/Firestore implementation details.

## Authentication Flow

```text
App
 ↓
Firebase Auth session check
 ├── No session → AuthNavigator → Login / Sign Up
 └── Session → AppNavigator → Tasks / Settings
```

The project does **not** require an artificial `AuthProvider.tsx`; authentication remains aligned with the existing auth feature/state/navigation implementation.

## Firestore

Tasks are user-owned:

```text
users/{userId}/tasks/{taskId}
```

Recommended Firestore ownership rule:

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

Never use unrestricted production rules.

## Environment Configuration

The assignment expects development, staging and production configuration with sample files:

```text
.env.example
.env.development.example
.env.staging.example
.env.production.example
```

Real environment files/secrets must not be committed.

Example:

```env
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
```

Use the project's actual configuration mechanism.



## Offline Testing

1. Log in.
2. Load tasks.
3. Disable network.
4. Create/edit/delete tasks.
5. Confirm local changes remain visible.
6. Re-enable network.
7. Confirm pending operations synchronize.
8. Confirm synced state.

## Notification Testing

1. Create a task.
2. Select due date/time.
3. Save.
4. Verify local notification.
5. Edit/delete the task.
6. Verify reminder handling updates.

## Performance Verification

Verify FlatList, stable keys, focused task rows, lazy loading where configured, and synchronization outside render paths.

## Security

Do not commit:

```text
.env
.env.local
private keys
passwords
service-account credentials
local machine secrets
```

Firebase client configuration is not an authorization boundary. Firestore rules must enforce ownership.

## Known Limitations / Future Enhancements

- Firebase Cloud Messaging/server push is bonus/future scope.
- Recurring tasks.
- Shared/team tasks.
- Attachments.
- Advanced analytics.
- iOS notification behavior requires iOS testing.
- Exact dependency compatibility follows `package.json`.
- Development/staging/production configuration should be verified before submission.

## Final QA

- [ ] Authentication / registration / logout
- [ ] Task CRUD
- [ ] Complete/incomplete
- [ ] Task details
- [ ] All/Today/Upcoming filtering
- [ ] SQLite persistence
- [ ] Offline create/edit/delete
- [ ] Reconnection sync
- [ ] Firestore ownership rules
- [ ] Local reminders
- [ ] Notification UI
- [ ] Light/dark theme
- [ ] Theme switching
- [ ] Safe-area sheets
- [ ] FlatList
- [ ] Lazy loading
- [ ] Environment configuration
- [ ] `npx tsc --noEmit`
- [ ] Android build/install
- [ ] iOS verification when available

## Documentation

- [`docs/prd.md`](docs/prd.md)
- [`docs/architecture.md`](docs/architecture.md)
- [`docs/rules.md`](docs/rules.md)
- [`docs/phases.md`](docs/phases.md)
- [`docs/design.md`](docs/design.md)
- [`docs/memory.md`](docs/memory.md)
