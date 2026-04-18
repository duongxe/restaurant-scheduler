# Sakura Sushi Roster

Simple React MVP for a sushi restaurant staff scheduling flow. The app lets an owner view a weekly roster board, inspect employee availability by shift, and manually assign staff. Employees can submit weekly availability using mock accounts.

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Local React state with mock data

## Run Locally

Install dependencies:

```bash
npm install
```

Start the Vite dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

On Windows PowerShell, if `npm` is blocked by script execution policy, use `npm.cmd` instead:

```bash
npm.cmd install
npm.cmd run dev
```

## MVP Scope

- Placeholder owner and employee login choices
- Employee weekly availability form
- Owner dashboard tabs
- Weekly 7-day roster board
- Role sections for waiter, sushi maker, and kitchen
- Morning and night shift assignment cells
- Side assignment panel filtered by submitted availability
- Candidate list only shows employees matching the selected role
- Per-person start and end time editing after assignment
- Per-day `Night end` control to extend every night-shift employee on that day
- Remove assigned staff from a shift with the `x` control
- Weekly staff-hours summary calculated from each assigned employee's start/end time
- Employee directory with editable pay levels, level rates, and weekly availability summary
- Timesheet and payroll placeholder pages

## Future Backend Integration

The current data layer is intentionally small and local:

- Mock records live in `src/data/mockData.ts`
- Shared interfaces live in `src/types/schedule.ts`
- Local state updates are coordinated in `src/App.tsx`
- Scheduling helpers live in `src/utils/schedule.ts`

When adding a backend, replace the mock data and local state handlers with API calls or data hooks. Good first endpoints would be employees, availability by week, weekly schedule assignments, timesheet entries, payroll summaries, and authentication sessions.
