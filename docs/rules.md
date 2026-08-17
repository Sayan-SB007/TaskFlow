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

-   Prefer explicit types/interfaces.
-   Do not use `any` to hide errors.
-   Run `npx tsc --noEmit` after meaningful changes.

## 3. React Native
-   Use `<Text>` for rendered strings.
-   Avoid placing raw strings directly inside `<View>`, `<Pressable>`,
    etc.
-   Keep reusable UI components platform-safe.-   Respect Safe Area requirements.
-   Avoid device-specific hard-coded dimensions.
-   Keep bottom actions clear of system navigation.
-   Use platform-safe components.

## 4. State Management

-   Redux Toolkit is the application state standard.
-   Keep reducers predictable and serializable.
-   Avoid putting UI-only transient values into global state unless  required.
-   Do not duplicate the same task state in multiple independent stores.
-   Do not use Redux as a replacement for SQLite.

## 5. Database

Use repositories as the boundary:

``` text
Feature → Repository → SQLite
```

Do not put raw SQLite queries inside screens/components.

Keep the existing structure:

``` text
database/
├── migrations/
├── repositories/
├── sqlite.ts
└── debug.ts
```

Do not restructure it merely to make the folder tree look more complex.

## 6. Offline-first

``` text
Local write → pending operation → Firestore when online
```

Never silently discard a failed sync operation.

## 7. Firebase

-   Never bypass authentication for user task access.
-   Every user task path must be scoped to the authenticated UID.
-   Never use unrestricted production rules such as
    `allow read, write: if true;`.
-   Never commit secrets.

## 8. Component Architecture

Large screens should be decomposed by responsibility.

When refactoring:

1.  Identify independent UI responsibilities.
2.  Extract focused components.
3.  Keep orchestration in the screen.
4.  Keep presentation in feature components.
5.  Keep persistence/sync outside presentation.
6.  Verify imports/usages before deleting old implementations.

## 9. Duplicate Implementations

Before editing/deleting a task form or details implementation:

``` text
Search usages
 ↓
Trace imports
 ↓
Identify rendered implementation
 ↓
Modify active implementation
 ↓
Delete duplicate only after verification
```

## 10. Theme

Use the active theme:

``` tsx
const {theme} = useTheme();
```

Prefer:

``` tsx
theme.colors.surface
```

over:

``` tsx
lightTheme.colors.surface
```

Components supporting dark mode must not hard-code light-theme colors.

## 11. Forms

-   Required fields need validation.
-   Due date/time remain optional.
-   Use native pickers.
-   Prevent duplicate submissions.
-   Preserve edit behavior.

## 12. Notifications

Keep scheduling/handling separate from task-list rendering.
Update/cancel reminders when task reminder data changes.

## 13. Performance

-   Use `FlatList` for potentially large task lists.
-   Avoid unnecessary full-list re-renders.
-   Keep expensive synchronization operations outside render.
-   Lazy-load screens where it improves startup/bundle behavior.

## 14. Documentation

After architecture changes update:

-   `README.md`
-   `architecture.md`
-   `phases.md`
-   `memory.md`

Update `design.md` for significant UI/theme decisions.

## 15. Git

Recommended commit style:

``` text
feat: add task reminders
fix: resolve task sync issue
refactor: extract task screen components
feat: add dark theme
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

## 16. Verification

Run:

``` bash
npx tsc --noEmit
```

Then verify authentication, CRUD, offline/reconnect sync, notifications,
theme switching, modal safe-area behavior and Android build/install.
