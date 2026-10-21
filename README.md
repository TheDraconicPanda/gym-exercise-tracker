# Gym Exercise Tracker

Current version: **0.3.0** — weekly workout rescheduling with automatic swaps and saved history.

A small, mobile-friendly workout tracker for a beginner four-day gym routine. Built with plain HTML, CSS, and JavaScript.

## Run locally

Open `index.html` in a modern browser. No build step, framework, server, or account is required.

## Daily workout view

The app opens on today's local calendar date when training is scheduled, or the next planned workout on rest days. The default plan uses Monday, Wednesday, Thursday, and Saturday. Arrows follow the scheduled dates for each week, including any changes made in the weekly editor. Today (or Next workout on rest days) returns to the default date; refreshing also resets to it.

Each exercise has editable sets and repetitions (1–99), followed by weight in kilograms (0–9999, decimals allowed). Weight starts blank; zero records an unweighted exercise. Defaults use the routine's prescribed sets and the upper end of its rep range. Tap a number to type, or hold it for a moment and slide up to increase or down to decrease. Per-side exercises are labelled accordingly.

Changes save automatically to local storage, separately for each date and exercise. The next session shows the most recent earlier saved values beneath each exercise; browsing back also restores those entries. These are entered values, not a record of completed sets. Weekly overview is collapsed below the workout.

## Storage and privacy

History stays in this browser on this device and site address. No account or cloud service is required. Clearing site data removes history; private browsing may not retain it. Storage errors are shown beside the workout.

## Validation

Run `node --test tests/dashboard.test.cjs` to check daily navigation, prescription defaults, saved history, reload behavior, calendar boundaries, and storage errors. Run `node --check app.js` for syntax validation. Browser checks should also cover narrow screens, keyboard editing, and holding/sliding the number inputs on a touch device.

## Training plan note

Use comfortable ranges and controlled movements. Start light, leave roughly three reps in reserve, and rest 60–90 seconds between sets. Stop or adjust movements that cause pain; seek an appropriate clinical assessment if knee symptoms recur, worsen, or affect normal walking.

Tap an exercise card to expand its shaded instructional illustration and movement cue. Original generated illustrations show the figure, equipment, and highlighted muscles. Corrected chest press, hamstring curl, lat pulldown, and biceps curl guides use standalone start/finish images; other illustrations use bundled PNG sheets displayed one exercise at a time, with no external image service or photo dependencies. The sets, reps, and weight controls remain independent of the guide toggle.

## Moving workouts within a week

Open “Adjust this week's days” below the workout and choose a new day for any session. All seven weekdays are available. Moving onto an occupied day swaps the two sessions. Navigation follows the resulting date order and skips empty days. Changes apply to the displayed Monday–Sunday week only; other weeks keep their existing plan. Refresh still opens today's session or the next scheduled one.

Saved sets, reps, and weights move with each rescheduled workout, including both entries in a swap. Schedule and workout data persist together in the existing browser storage record. If storage fails, the move is rolled back. Previous-session reminders use the updated dates.
