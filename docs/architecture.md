# TaskFlow --- Architecture

## 1. Architecture Overview

TaskFlow follows a modular React Native architecture with a clear
separation between:

``` text
UI
 ↓
Navigation / Screens
 ↓
Feature Components
 ↓
Redux Toolkit
 ↓
Domain / Services
 ↓
Local SQLite Persistence
 ↓
Sync Layer
 ↓
Firebase Firestore
```

Authentication is handled by Firebase Authentication.

Connectivity is handled separately so the synchronization layer can
react to online/offline transitions.

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

The assignment explicitly expects Redux Toolkit, React Navigation, a
local database such as SQLite/Realm, Firebase Authentication, Firestore
synchronization, notifications, theming, multi-environment
configuration, FlatList optimization, and lazy loading.

## 3. Current Folder Structure

The current structure shown in the project is appropriate for a scalable
React Native application:


TaskFlow/
├── .vscode/
├── android/
├── docs/
├── ios/
├── node_modules/
├── src/
│   ├── app/
│   │   ├── providers/
│   │   ├── appSlice.ts
│   │   └── store.ts
│   │
│   ├── components/
│   │   ├── Button/
│   │   ├── ErrorState/
│   │   ├── Input/
│   │   ├── Loading/
│   │   ├── OfflineBanner/
│   │   └── Screen/
│   │
│   ├── config/
│   ├── database/
│   ├── features/
│   ├── hooks/
│   ├── navigation/
│   ├── theme/
│   ├── types/
│   └── utils/
│
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

`src/services/` may be added at the root of `src/` if shared
infrastructure services become numerous enough to justify a separate
layer. Existing feature-local services can remain inside their feature.

## 4. Task Data Flow

### Online create

``` text
User
 ↓
Task Form
 ↓
Redux / Task Action
 ↓
SQLite
 ↓
Sync Queue
 ↓
Firestore
 ↓
Synced state
```

### Offline create

``` text
User
 ↓
Task Form
 ↓
Redux / Task Action
 ↓
SQLite
 ↓
Pending Sync Queue
 ↓
UI shows Offline / Pending Sync
```

### Reconnection

``` text
Network becomes available
 ↓
NetInfo event
 ↓
Sync service
 ↓
Read pending local operations
 ↓
Firestore write/delete
 ↓
Mark operation synchronized
 ↓
Refresh local state
 ↓
UI shows Synced
```

## 5. Authentication Flow

``` text
App
 ↓
Firebase Auth session check
 ├── No session → Auth Stack
 │      ├── Login
 │      └── Sign Up
 │
 └── Session exists → App Stack
        ├── Main tabs/screens
        ├── Task Details
        └── Task Form
```

## 6. Firestore Structure

The task ownership model is:

``` text
users/
  {userId}/
    tasks/
      {taskId}
```

A task belongs to the authenticated user.

Recommended Firestore rule:

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

## 7. Performance

-   Use `FlatList` for task collections.
-   Provide stable keys.
-   Avoid unnecessary inline object/function recreation in large lists
    where profiling shows impact.
-   Use memoized task row components where useful.
-   Lazy load heavier screens/components.
-   Avoid loading all remote data repeatedly when local state is
    authoritative.
-   Keep synchronization work outside render paths.

## 8. Security

-   Do not hard-code passwords/secrets.
-   Do not commit real `.env` files.
-   Use Firebase Authentication for identity.
-   Enforce Firestore ownership rules using `request.auth.uid`.
-   Validate user-owned task paths.
