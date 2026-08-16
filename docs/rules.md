# TaskFlow --- Development Rules

## 1. Core Rule

**Do not remove existing functionality while implementing a new feature
unless the change is explicitly approved.**

Every feature change must preserve:

-   Authentication.
-   Task CRUD.
-   Offline persistence.
-   Synchronization.
-   Task status changes.
-   Navigation.
-   Existing UI behavior.
-   Validation.
-   Notifications.

## 2. TypeScript

-   Prefer explicit interfaces/types for domain models.
-   Do not introduce `any` to hide a type error.
-   Fix the actual type mismatch instead.
-   Run:

``` bash
npx tsc --noEmit
```

before considering a feature complete.

## 3. React Native

-   Use `<Text>` for rendered strings.
-   Avoid placing raw strings directly inside `<View>`, `<Pressable>`,
    etc.
-   Keep reusable UI components platform-safe.
-   Respect Safe Area requirements.
-   Avoid hard-coded device-specific dimensions.

## 4. State Management

-   Redux Toolkit is the application state-management standard.
-   Keep reducers predictable and serializable.
-   Avoid putting UI-only transient values into global state unless
    required.
-   Do not duplicate the same task state in multiple independent stores.

## 5. Offline-first

Local persistence is authoritative for immediate user interaction.

A task operation should not require an active internet connection to
update the local UI.

When offline:

``` text
Local write → pending operation
```

When online:

``` text
Pending operation → Firestore → synchronized
```

Never silently discard a failed synchronization operation.

## 6. Firebase

-   Never bypass authentication for user task access.
-   Every user task path must be scoped to the authenticated UID.
-   Keep Firestore rules restrictive.
-   Do not use unrestricted production rules such as:

``` text
allow read, write: if true;
```

## 7. UI Changes

Before changing an existing component:

1.  Understand its current props.
2.  Understand where it is rendered.
3.  Check whether another screen/component contains a duplicate
    implementation.
4.  Preserve existing behavior.
5.  Then modify the UI.

## 8. Forms

-   Required fields must have basic validation.
-   Optional due date/time must remain optional.
-   Date/time should use native pickers.
-   Avoid free-form text entry for structured date/time values.
-   Disable or prevent duplicate submissions when a save operation is
    already in progress.

## 9. Navigation

-   Keep authentication and application navigation separate.
-   Do not create duplicate screens for the same responsibility without
    a clear reason.
-   If a screen is lazy-loaded, its props must still be typed correctly.

## 10. Performance

-   Use `FlatList` for potentially large task lists.
-   Avoid unnecessary full-list re-renders.
-   Keep expensive synchronization operations outside render.
-   Lazy-load screens where it improves startup/bundle behavior.

## 11. Documentation

Whenever architecture changes:

-   Update `architecture.md`.
-   Update `phases.md` if project status changes.
-   Update `memory.md` if a durable technical decision changes.

## 12. Git

Commit small logical changes.

Recommended format:

``` text
feat: add task reminders
fix: resolve task sync permission error
refactor: extract task form component
docs: update architecture documentation
chore: update dependencies
```

Never commit:

-   `.env`
-   passwords
-   private keys
-   local machine secrets
-   unnecessary build artifacts
-   `node_modules/`
