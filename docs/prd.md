# TaskFlow --- Product Requirements Document

## 1. Product Overview

TaskFlow is a cross-platform React Native task-management application.
The product is designed around reliable task management with
authentication, local/offline persistence, synchronization, and
reminders.

This document is aligned with the React Native Team Lead take-home
assignment, which requires authentication, task management, offline
storage/sync, push notifications, modular architecture, Redux Toolkit,
React Navigation, multi-environment configuration, theming, FlatList
optimization, and lazy-loaded screens.  

## 2. Product Goals

-   Give authenticated users a simple place to manage tasks.
-   Make task operations available even when the device is offline.
-   Synchronize local changes with Firestore when connectivity returns.
-   Provide clear sync feedback so users understand the current data
    state.
-   Provide task reminders through local notifications.
-   Keep the codebase modular and maintainable.

## 3. Functional Requirements

### 3.1 Authentication

-   Email/password registration.
-   Email/password login.
-   Persist authenticated session.
-   Logout.
-   Protect authenticated application screens.

### 3.2 Task Management

Each task supports:

-   Title --- required.
-   Description --- optional.
-   Priority --- low, medium, or high.
-   Due date --- optional.
-   Due time --- optional.
-   Status --- pending/completed.
-   Created timestamp.
-   Updated timestamp.
-   User ownership.

Users can:

-   Create tasks.
-   View tasks.
-   Edit tasks.
-   Delete tasks.
-   Mark tasks complete.
-   Mark tasks incomplete.
-   Open task details.

### 3.3 Offline Support

The application should continue to work when there is no network
connection.

Offline operations:

-   Create a task.
-   Edit a task.
-   Delete a task.
-   Change completion status.

Local changes are stored first and queued for synchronization.

When connectivity is restored:

1.  Detect online state.
2.  Process pending local changes.
3.  Write changes to Firestore.
4.  Mark successfully synchronized operations as completed.
5.  Update the UI to reflect sync status.

### 3.4 Notifications

Local task reminders are supported/planned for tasks with a due
date/time.

The assignment also lists server push using Firebase Cloud Messaging as
a bonus requirement.  

### 3.5 Navigation

The application uses a structured navigation approach with:

-   Authentication flow.
-   Main application flow.
-   Task list.
-   Task details.
-   Task form.

### 3.6 State Management

Redux Toolkit is used for application state.

Local persistence and remote synchronization are separated from UI state
so that screens do not need to know the implementation details of
Firestore synchronization.

## 4. Validation

-   Task title cannot be empty.
-   Due date/time are optional.
-   Date/time values are selected through native pickers rather than
    unrestricted text input.
-   A task can only be modified by its owner.
-   Firebase security rules restrict user task access to the
    authenticated user's UID.

## 5. Non-functional Requirements

-   TypeScript.
-   Cross-platform React Native implementation.
-   Modular feature-based structure.
-   Offline-first task experience.
-   Secure Firestore access.
-   Responsive mobile UI.
-   FlatList-based task rendering.
-   Lazy loading where appropriate.
-   Clear error/loading/sync states.

## 6. Assignment Acceptance Criteria

The project should satisfy the following assignment areas:

-   Authentication.
-   Task CRUD.
-   Offline local storage and synchronization.
-   Local push/reminder notifications.
-   Redux Toolkit.
-   React Navigation.
-   Multi-environment configuration.
-   Light/dark theme.
-   FlatList optimization.
-   Lazy-loaded screens.
-   Production-ready folder structure.
-   README and environment documentation.  

## 7. Out of Scope / Future Enhancements

-   Server-side push notification infrastructure.
-   Team/shared tasks.
-   Task collaboration.
-   Recurring tasks.
-   Attachments.
-   Advanced analytics.
-   Backend APIs outside Firebase.
