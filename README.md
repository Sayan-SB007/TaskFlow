# TaskFlow

TaskFlow is a cross-platform React Native task-management application
built with a modular, offline-first architecture.

It was developed for a React Native Team Lead take-home assignment
covering authentication, task management, offline
storage/synchronization, notifications, modular architecture, Redux
Toolkit, React Navigation, performance, and production-oriented code
organization. fileciteturn88file0

## Features

### Authentication

-   Firebase email/password authentication.
-   Session persistence.
-   Login.
-   Registration.
-   Logout.

### Task Management

-   Create tasks.
-   Edit tasks.
-   Delete tasks.
-   Mark complete/incomplete.
-   Task details.
-   Priority: Low / Medium / High.
-   Optional due date.
-   Optional due time.
-   Basic validation.
-   Native date/time pickers.

### Offline-first

-   SQLite local persistence.
-   Tasks remain available offline.
-   Local changes are queued.
-   Firestore synchronization occurs when connectivity returns.
-   Sync status is surfaced to the user.

### Navigation

-   Authentication flow.
-   Main application flow.
-   Task list.
-   Task details.
-   Task form.

### State Management

-   Redux Toolkit.

### Performance

-   FlatList for task lists.
-   Lazy loading for applicable screens.

### Notifications

-   Local task reminders are part of the notification implementation.
-   Firebase Cloud Messaging/server push is a bonus/future enhancement.

The assignment explicitly requires local task reminders and lists
Firebase Cloud Messaging server push as a bonus. fileciteturn88file0

## Architecture

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
                    └────────┬─────────┘
                             │
                 ┌───────────┴───────────┐
                 │                       │
        ┌────────▼────────┐    ┌────────▼────────┐
        │ SQLite / Local  │    │ Firebase Auth   │
        │ Persistence     │    │ + Firestore     │
        └────────┬────────┘    └────────┬────────┘
                 │                      │
                 └──────────┬───────────┘
                            │
                    ┌───────▼────────┐
                    │ Sync / NetInfo │
                    └────────────────┘
```

### Offline synchronization

``` text
User action
    ↓
SQLite/local state
    ↓
Pending operation
    ↓
Network available?
   / \
 No   Yes
 |     |
Keep   Sync
queue  Firestore
 |      |
 └──────┘
    ↓
Synced
```

## Folder Structure

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
│   ├── features/
│   ├── hooks/
│   ├── navigation/
│   ├── theme/
│   ├── types/
│   └── utils/
├── App.tsx
├── .gitignore
├── package.json
└── README.md
```

This structure keeps reusable UI, feature logic, application state,
navigation, persistence, configuration, and theme code separated.

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

## Requirements

Recommended environment:

-   Node.js version compatible with the installed React Native version.
-   npm.
-   Android Studio / Android SDK for Android.
-   Xcode for iOS development on macOS.
-   Firebase project configured for the application.

Check the project's `package.json` for the exact dependency versions.

## Installation

Clone the repository:

``` bash
git clone <your-repository-url>
cd TaskFlow
```

Install dependencies:

``` bash
npm install
```

For Android:

``` bash
npx react-native run-android
```

For iOS:

``` bash
cd ios
pod install
cd ..
npx react-native run-ios
```

Use the commands appropriate for the installed React Native version and
local development environment.

## Type Checking

Run:

``` bash
npx tsc --noEmit
```

The project should pass TypeScript validation before submission.

## Firebase Setup

Configure:

-   Firebase Authentication.
-   Cloud Firestore.
-   Android/iOS Firebase application configuration.

Recommended Firestore ownership rule:

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

Never use unrestricted production rules.

## Environment Configuration

The assignment requires development, staging, and production environment
support and sample environment files. fileciteturn88file0

Recommended committed examples:

``` text
.env.example
.env.development.example
.env.staging.example
.env.production.example
```

Actual environment files should not be committed.

Example:

``` env
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
```

Use the project's actual configuration mechanism when wiring these
values into native and JavaScript code.

## Offline Testing

To test offline behavior:

1.  Log in.
2.  Load the task list.
3.  Disable network connectivity.
4.  Create/edit/delete tasks.
5.  Confirm changes remain visible locally.
6.  Re-enable connectivity.
7.  Confirm pending operations synchronize to Firestore.
8.  Confirm sync status returns to synced.

## Notification Testing

For a task reminder:

1.  Create a task.
2.  Select a due date.
3.  Select a due time.
4.  Save the task.
5.  Keep the task reminder scheduled.
6.  Verify the local notification.
7.  Edit/delete the task and verify reminder handling.

## Known Limitations

The following should be verified before final submission:

-   Development/staging/production environment configuration must be
    demonstrated clearly.
-   Dark/light theme must be verified across all major screens.
-   Firebase Cloud Messaging server push is a bonus requirement and may
    remain outside the current scope.
-   iOS notification behavior requires testing on an appropriate iOS
    environment.
-   Exact dependency compatibility should follow the versions installed
    in `package.json`.

## Security Notes

Do not commit:

``` text
.env
.env.local
private keys
passwords
service-account credentials
local machine secrets
```

Firebase client configuration values are not a substitute for Firestore
security rules. Data access must be enforced by Firebase Authentication
and Firestore rules.

## Documentation

Detailed project documentation:

-   [`docs/prd.md`](docs/prd.md)
-   [`docs/architecture.md`](docs/architecture.md)
-   [`docs/rules.md`](docs/rules.md)
-   [`docs/phases.md`](docs/phases.md)
-   [`docs/design.md`](docs/design.md)
-   [`docs/memory.md`](docs/memory.md)


