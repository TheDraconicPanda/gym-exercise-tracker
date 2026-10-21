# Gym Exercise Tracker

Current version: **0.2.0** — daily workouts, editable sets and reps, and browser history.

A small, mobile-friendly workout tracker for a beginner four-day gym routine. Built with plain HTML, CSS, and JavaScript.

## Run locally

Open `index.html` in a modern browser. No build step, framework, server, or account is required.

## Daily workout view

The app opens on today's local calendar date. Use the arrows to browse one day at a time, or Today to return. Refreshing always returns to today. Unscheduled days show a rest day.

Each exercise has editable sets and repetitions (1–99). Defaults use the routine's prescribed sets and the upper end of its rep range. Tap a number to type, or hold it for a moment and slide up to increase or down to decrease. Per-side exercises are labelled accordingly.

Changes save automatically to local storage, separately for each date and exercise. The next session shows the most recent earlier saved values beneath each exercise; browsing back also restores those entries. These are entered values, not a record of completed sets. Weekly overview is collapsed below the workout.

## Storage and privacy

History stays in this browser on this device and site address. No account or cloud service is required. Clearing site data removes history; private browsing may not retain it. Storage errors are shown beside the workout.

## Validation

Run `node --test tests/dashboard.test.cjs` to check daily navigation, prescription defaults, saved history, reload behavior, calendar boundaries, and storage errors. Run `node --check app.js` for syntax validation. Browser checks should also cover narrow screens, keyboard editing, and holding/sliding the number inputs on a touch device.

## Training plan note

Use comfortable ranges and controlled movements. Start light, leave roughly three reps in reserve, and rest 60–90 seconds between sets. Stop or adjust movements that cause pain; seek an appropriate clinical assessment if knee symptoms recur, worsen, or affect normal walking.
