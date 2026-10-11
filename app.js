const WORKOUTS = [
  {
    id: "monday-a",
    day: 1,
    dayName: "Monday",
    title: "Full Body A",
    description: "A balanced strength session to start the week.",
    type: "Strength",
    minutes: "30–40 min",
    warmup: "Stationary bike · 5 min",
    cooldown: "Easy cycling · 5 min",
    exercises: [
      { name: "Leg press", target: "2 × 8–12" },
      { name: "Seated chest press", target: "2 × 8–12" },
      { name: "Seated cable row", target: "2 × 8–12" },
      { name: "Seated hamstring curl", target: "2 × 10–12" }
    ]
  },
  {
    id: "wednesday-b",
    day: 3,
    dayName: "Wednesday",
    title: "Full Body B",
    description: "Upper body pulling and pushing, plus glutes.",
    type: "Strength",
    minutes: "30–40 min",
    warmup: "Stationary bike · 5 min",
    cooldown: "Easy cycling · 5 min",
    exercises: [
      { name: "Lat pulldown", target: "2 × 8–12" },
      { name: "Seated shoulder press", target: "2 × 8–12" },
      { name: "Glute drive machine", target: "2 × 10–12" },
      { name: "Biceps curl machine", target: "2 × 10–12" }
    ]
  },
  {
    id: "thursday-light",
    day: 4,
    dayName: "Thursday",
    title: "Light + Core",
    description: "An intentionally lighter session after Wednesday.",
    type: "Recovery",
    minutes: "25–35 min",
    warmup: "Easy stationary bike · 10 min",
    cooldown: "Gentle mobility or easy cycling",
    exercises: [
      { name: "Cable triceps pushdown", target: "2 × 10–12" },
      { name: "Pallof press", target: "2 × 8–10 / side" },
      { name: "Bird dog", target: "2 × 6–8 / side" }
    ],
    note: "Skip bird dog if kneeling is uncomfortable."
  },
  {
    id: "saturday-c",
    day: 6,
    dayName: "Saturday",
    title: "Full Body C",
    description: "A second lower-body exposure with upper-body balance.",
    type: "Strength",
    minutes: "30–40 min",
    warmup: "Stationary bike · 5 min",
    cooldown: "Easy cycling · 5 min",
    exercises: [
      { name: "Leg press", target: "2 × 8–12" },
      { name: "Chest press variation", target: "2 × 8–12" },
      { name: "Chest-supported row", target: "2 × 8–12" },
      { name: "Seated hip abductor", target: "2 × 10–12" }
    ]
  }
];

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function startOfWeek(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

function renderWorkout(workout, today, weekStart) {
  const sessionDate = new Date(weekStart);
  sessionDate.setDate(weekStart.getDate() + workout.day);
  const isToday = today.getDay() === workout.day;
  const isPastThisWeek = today > sessionDate && !isToday;
  const dateLabel = new Intl.DateTimeFormat(undefined, { day: "numeric" }).format(sessionDate);
  const status = isToday
    ? '<span class="status-pill today">Today</span>'
    : isPastThisWeek
      ? '<span class="status-pill">Scheduled day passed</span>'
      : '<span class="status-pill">Planned</span>';
  const chips = workout.exercises.map(exercise =>
    `<span class="exercise-chip">${exercise.name} <strong>${exercise.target}</strong></span>`
  ).join("");

  return `
    <article class="workout-card">
      <div class="day-block" aria-label="${workout.dayName}, ${dateLabel}">
        <span class="day-short">${workout.dayName.slice(0, 3)}</span>
        <span class="day-date">${dateLabel}</span>
      </div>
      <div class="workout-main">
        <h3>${workout.title}</h3>
        <p class="workout-description">${workout.description}</p>
        <div class="exercise-chips">${chips}</div>
      </div>
      <div class="workout-meta">
        ${status}
        <span class="time-estimate">${workout.minutes}</span>
      </div>
    </article>`;
}

function renderDashboard() {
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const dateFormat = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
  document.title = "Gym Exercise Tracker · v0.1.0";
  document.getElementById("week-label").textContent =
    `${dateFormat.format(weekStart)} – ${dateFormat.format(weekEnd)}`;
  document.getElementById("workout-list").innerHTML =
    WORKOUTS.map(workout => renderWorkout(workout, today, weekStart)).join("");
}

renderDashboard();