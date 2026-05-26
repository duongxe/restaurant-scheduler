# Sushi Revolution Roster

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

Start the dev app:

```bash
npm run dev
```

This starts both Vite and the local email API server.

Build for production:

```bash
npm run build
```

On Windows PowerShell, if `npm` is blocked by script execution policy, use `npm.cmd` instead:

```bash
npm.cmd install
npm.cmd run dev
```

## Real Email Setup

The app sends real schedule emails through a small local Node server at
`server/email-server.mjs`. The React app never receives the Resend API key.

1. Create a Resend account and API key.
2. Create `.env.local` from `.env.example`.
3. Fill in:

```bash
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL="Sushi Revolution <your-verified-sender@example.com>"
EMAIL_API_PORT=8787
EMAIL_ALLOWED_ORIGIN=http://localhost:5173
VITE_EMAIL_API_URL=http://localhost:8787
```

4. Run the app:

```bash
npm.cmd run dev
```

This starts both the frontend and the email API server. To run only one side for
debugging, use `npm.cmd run vite:dev` or `npm.cmd run email:dev`.

For production sending, verify a sender domain in Resend and use that address in
`RESEND_FROM_EMAIL`. The default `onboarding@resend.dev` is useful for quick API
testing, but a verified domain is the right setup for staff emails.

## MVP Scope

- Mock username/password login using lowercase names with password `1`
- Staff profile fields for email and phone number with a separate Save button
- Staff profile data persisted in browser `localStorage` as a mock database
- Employee weekly availability form
- Owner dashboard tabs
- Weekly 7-day roster board
- Role sections for waiter, sushi maker, and kitchen
- Morning and night shift assignment cells
- Side assignment panel filtered by submitted availability
- Candidate list only shows employees matching the selected role
- Per-person start and end time editing after assignment
- Per-person unpaid break editing after assignment
- Default 1 hour break when a staff member is scheduled for more than 6 hours in one day
- Per-day `Night end` control to extend every night-shift employee on that day
- Remove assigned staff from a shift with the `x` control
- Send schedule panel with recipient checkboxes and Select all
- Real per-staff schedule emails through the local email API server
- Each employee only receives their own assigned shifts
- Weekly staff-hours summary calculated from each assigned employee's start/end time
- Employee directory with editable pay levels, level rates, and weekly availability summary
- Payroll tab with weekly base-pay estimate by employee

## Payroll Notes

The payroll screen is an MVP estimate only. It calculates:

```text
paid hours = scheduled hours - unpaid break hours
weekday pay = weekday paid hours * base hourly rate
saturday pay = saturday paid hours * base hourly rate * 1.25
sunday pay = sunday paid hours * base hourly rate * 1.50
estimated pay = weekday pay + saturday pay + sunday pay
```

Australian award rules can depend on the correct award, classification,
employment type, penalty rates, overtime, allowances, and break entitlements.
Those rules should be integrated later through a payroll backend or official
pay-rule source before using the numbers for final payment.

The current MVP default uses Restaurant Industry Award permanent ordinary-hour
weekend multipliers as a starting point only. Casual loading, casual Level 3-6
Sunday rates, overtime, public holidays, late-night allowances, and other award
details are not automated yet.

Helpful official references:

- [Fair Work Ombudsman Restaurant Industry Award MA000119](https://awards.fairwork.gov.au/MA000119.html)
- [Fair Work Ombudsman Pay Guides](https://www.fairwork.gov.au/pay-and-wages/minimum-wages/pay-guides)
- [Fair Work Pay and Conditions Tool](https://calculate.fairwork.gov.au/)

## Future Backend Integration

The current data layer is intentionally small and local:

- Mock records live in `src/data/mockData.ts`
- Shared interfaces live in `src/types/schedule.ts`
- Local state updates are coordinated in `src/App.tsx`
- Scheduling helpers live in `src/utils/schedule.ts`

When adding a backend, replace the mock data and local state handlers with API calls or data hooks. Good first endpoints would be employees, availability by week, weekly schedule assignments, unpaid break records, payroll summaries, award/classification settings, and authentication sessions.

For production schedule sending, deploy the email server behind authentication
and store send history in the database. The frontend already builds one message
per employee so the backend can send only that employee's assigned shifts to
their saved email address.

Email references:

- [Resend Send Email API](https://resend.com/docs/api-reference/emails/send-email)
- [Resend Domain Verification](https://resend.com/docs/dashboard/domains/introduction)
