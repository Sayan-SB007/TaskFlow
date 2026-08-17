# TaskFlow --- UI/UX Design Guidelines

## 1. Design Direction

TaskFlow uses a clean productivity-app visual language:

-   Blue primary actions.
-   Rounded cards and sheets.
-   Clear typography hierarchy.
-   Semantic priority colors.
-   Muted secondary information.
-   FontAwesome6 iconography.
-   Elevated modal/sheet treatment.
-   Light and dark themes.

## 2. Light Theme

``` text
Light background
 ↓
White elevated surfaces
 ↓
Blue primary actions
```

## 3. Dark Theme

``` text
Dark background
 ↓
Dark elevated surfaces
 ↓
Blue primary actions
 ↓
Light primary text
 ↓
Muted secondary text
```

Components must consume the active theme instead of importing
`lightTheme` directly.

## 4. Tasks Header

The header provides:

-   Time-of-day greeting.
-   Main title.
-   Notification action.
-   Notification badge when unread reminders exist.
-   Consistent iconography.

Core actions should use FontAwesome6 rather than arbitrary emoji glyphs.

## 5. Productivity Card

Communicates:

-   Completion percentage.
-   Total tasks.
-   Completed tasks.
-   Remaining tasks.

It must maintain readable contrast in both themes.

## 6. Task Cards

Each task card provides:

-   Completion control.
-   Task title.
-   Due date/time.
-   Priority.
-   Details/overflow action.

Task collections use FlatList.

Task cards use the active theme.

## 7. Task Filters

``` text
All | Today | Upcoming
```

Selected state must be visually clear. Today filtering uses
calendar-date semantics.

## 8. Create/Edit Task Sheet

The task form is an elevated sheet:

``` text
Underlying task page
 ↓
Theme-aware backdrop
 ↓
Elevated sheet
 ↓
Form
```

Requirements:

-   Rounded top corners.
-   Shadow/elevation.
-   Safe-area support.
-   Scrollable content.
-   Bottom action never overlaps system navigation.

## 9. Task Details Sheet

The details sheet follows the same modal treatment and contains:

-   Task status.
-   Title.
-   Description.
-   Due date/time.
-   Priority.
-   Complete/incomplete action.
-   Edit.
-   Delete.
-   Close.

The displayed task must reflect changes made in the underlying task
state.

## 10. Notification Sheet

Notification UI should look like a modal/sheet rather than the same flat
surface as the underlying page.

It uses:

-   Theme-aware backdrop.
-   Elevated surface.
-   Bell icon.
-   Today's reminder heading.
-   Reminder list or caught-up state.
-   Close action.

## 11. Priority

``` text
Low    → green
Medium → amber/orange
High   → red
```

Selected priority can use the primary blue outline.

## 12. Inputs

Text fields need readable placeholders, borders and values in both
themes.

Date/time use native pickers and calendar/clock icons.

## 13. Buttons

Primary:

-   Blue.
-   Adequate height.
-   Rounded.
-   Disabled/loading state.

Secondary:

-   Theme-aware surface/border.

Destructive:

-   Semantic danger color.

## 14. Icons

Use FontAwesome6 consistently:

-   Bell.
-   Calendar.
-   Clock.
-   Check.
-   Close.
-   Trash.
-   Plus.
-   Sun/moon.

## 15. Typography

``` text
Screen title → large/bold
Section label → small/medium
Task title → semibold
Body → regular
Helper → small/muted
Button → medium/semibold
```

## 16. Accessibility

-   Meaningful accessibility labels.
-   Adequate touch targets.
-   Do not rely on color alone.
-   Maintain readable contrast.
-   Avoid extremely small text.

## 17. Responsive Layout

Use Flexbox, safe areas, FlatList/ScrollView and keyboard-aware behavior
where needed. Avoid device-specific fixed layouts.

## 18. Modal Principle

All sheets should communicate elevation:

``` text
Underlying page
      ↓
Semi-transparent theme-aware overlay
      ↓
Elevated surface
```

Create task, edit/details and notifications should follow this shared
visual principle.
