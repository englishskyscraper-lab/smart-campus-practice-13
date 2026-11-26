# Project memory

## Product intent & audience

- Smart Campus availability/booking tool: lets users check whether a room can be booked at a given start time and duration without creating or mutating bookings.
- Acceptance contract: AC1 start in future; AC2 duration 0–120 min; AC3 no overlapping bookings; AC4 blocked room unavailable; AC5 clear decision without changing bookings; AC6 invalid input gets understandable feedback.
- Fictional data only; no real backend, auth, payment, or persistence.

## Brand personality & voice

- Production-grade, polished, non-generic UI per global instructions (see `.bolt/prompt`).

## Visual design & UX direction

- React + TypeScript + Vite, Tailwind CSS, lucide-react icons, `@/` path alias.
- Responsive layout with breakpoints for desktop and narrow screens.
- Green/red result banner plus explanation panel showing availability decision.
- Timeline, room picker, filters, and booking fixtures are existing UI patterns to preserve.
- Deterministic testing UI: "current time" is a slider rather than a real clock; times are minutes within a single day (00:00–24:00).

## Decisions, constraints & rationale

- Availability result exposes three parts: `isAvailable: boolean`, reason code, human-readable message.
- Strict separation: input validation, deterministic availability calculation, and UI presentation live in distinct files.
- Engine-level guard added so non-numeric/`NaN` time input returns `input-error` instead of slipping through comparisons and falsely reporting "available".
- Reused/improved existing rule engine; preserved existing Smart Campus functionality and fictional booking fixtures.
- Supabase/database untouched to honor "no real backend" constraint.
- Tests executed for real: 10 files / 125 tests passing, including 6 acceptance-criteria tests and 24 pre-existing engine tests; typecheck and build clean.
- Files touched: type definitions, availability engine, availability hook, result banner, main app screen, new acceptance-criteria test file.

## Open questions & assumptions

- Assumes current time slider model and single-day minute-based times are acceptable; real clock and multi-day support not implemented.
- No persistence assumption is intentional; availability checks never create bookings (AC5).
- Back-to-back (touching endpoints) bookings treated as allowed; exact boundary semantics around current time should stay consistent with AC1.