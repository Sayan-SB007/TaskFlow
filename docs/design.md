# TaskFlow --- UI/UX Design Guidelines

## 1. Design Direction

TaskFlow uses a clean productivity-app visual language:

-   White/light surfaces.
-   Soft gray secondary surfaces.
-   Blue primary actions.
-   Muted borders for secondary controls.
-   Strong typography hierarchy.
-   Rounded cards and sheets.
-   Clear status and priority indicators.

## 2. Task Form

The create/edit task form is presented as a modal/bottom sheet so that
the task list remains visually behind the form.

The visual hierarchy should communicate:

``` text
Dashboard/list
    ↓
dimmed background
    ↓
elevated task sheet
    ↓
form controls
```

The sheet should have:

-   Rounded top corners.
-   Clear elevation/shadow.
-   Safe-area spacing.
-   Scrollable content when the keyboard or small screen reduces
    available height.
-   Bottom action area that never overlaps system navigation.

## 3. Modal Treatment

A modal should look visually elevated above the screen behind it.

Use:

-   Semi-transparent backdrop.
-   White surface.
-   Shadow/elevation.
-   Rounded corners.
-   Enough top/bottom spacing.
-   Safe-area support.

Avoid making the modal and the underlying page look like the same flat
surface.

## 4. Inputs

### Primary text fields

Use:

-   Light gray border/background when inactive.
-   Stronger border only when focused.
-   Clear placeholder text.
-   Adequate vertical padding.

### Date/time fields

Date and time are structured controls, not free-form text inputs.

Use:

-   Native date picker.
-   Native time picker.
-   Muted gray border in the normal state.
-   Calendar/clock icon.
-   Clear action when a value has been selected.
-   Optional helper text.

Avoid using the same strong blue outline used for selected priority
states.

## 5. Priority

Priority uses three semantic colors:

``` text
Low    → green
Medium → amber/orange
High   → red
```

Selected priority may use the primary blue outline because it represents
an active selection.

## 6. Primary Button

The primary create/save action uses the application's primary blue.

The button must:

-   Have sufficient height.
-   Have rounded corners.
-   Remain above the bottom safe area.
-   Never overlap content.
-   Have disabled/loading state when needed.

## 7. Icons

Prefer a consistent icon family instead of text glyphs or
generated-looking symbols.

Examples:

-   Calendar icon for due date.
-   Clock icon for due time.
-   Close icon for modal dismissal.
-   Check icon for completion.
-   Bell icon for reminders.

## 8. Typography

Recommended hierarchy:

``` text
Screen title       → large / bold
Section label      → small / medium / uppercase where appropriate
Task title         → medium / semibold
Body description   → regular
Helper text        → small / muted
Button text        → medium / semibold
```

## 9. Accessibility

-   Buttons should have adequate touch targets.
-   Color must not be the only indication of state.
-   Text must remain readable against its background.
-   Interactive elements should have meaningful accessibility labels.
-   Avoid extremely small text.

## 10. Responsive Layout

Do not depend on a single Android device size.

Use:

-   Flexbox.
-   Safe areas.
-   ScrollView/KeyboardAvoidingView where appropriate.
-   Platform-aware spacing where necessary.

The task sheet must remain usable on smaller screens and when the
keyboard is visible.
