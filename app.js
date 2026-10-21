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

const EXERCISE_GUIDES = {
  "Leg press": {
    "image": "images/monday-illustrations.png",
    "cue": "Press the platform away without locking your knees.",
    "column": 0,
    "row": 0
  },
  "Seated chest press": {
    "image": "images/chest-press-steps.png",
    "standalone": true,
    "cue": "Push the handles forward from chest height. Keep your back on the pad; slowly return until your elbows are bent."
  },
  "Seated cable row": {
    "image": "images/monday-illustrations.png",
    "cue": "Pull toward your ribs, keeping your torso steady.",
    "column": 0,
    "row": 1
  },
  "Seated hamstring curl": {
    "image": "images/hamstring-curl-steps.png",
    "standalone": true,
    "cue": "Curl your lower legs down and back under the seat against the ankle roller. Keep thighs under the pad; slowly return. This is a curl, not a leg extension."
  },
  "Lat pulldown": {
    "image": "images/lat-pulldown-steps.png",
    "standalone": true,
    "cue": "Sit facing the machine with thighs under the pad. Pull the bar down in front of you to your upper chest, then return overhead with control."
  },
  "Seated shoulder press": {
    "image": "images/wednesday-illustrations.png",
    "cue": "Press upward smoothly, keeping your back supported.",
    "column": 1,
    "row": 0
  },
  "Glute drive machine": {
    "image": "images/wednesday-illustrations.png",
    "size": 180,
    "top": 90,
    "cue": "Drive through your feet and raise your hips without arching your back.",
    "column": 0,
    "row": 1
  },
  "Biceps curl machine": {
    "image": "images/biceps-curl-steps.png",
    "standalone": true,
    "cue": "Keep upper arms on the preacher pad. Bend your elbows to curl the handles toward your shoulders, then lower slowly."
  },
  "Cable triceps pushdown": {
    "image": "images/thursday-illustrations.png",
    "cue": "Keep elbows by your sides and extend your forearms downward.",
    "column": 0,
    "row": 0
  },
  "Pallof press": {
    "image": "images/thursday-illustrations.png",
    "cue": "Press straight out from your chest; resist turning toward the cable.",
    "column": 1,
    "row": 0
  },
  "Bird dog": {
    "image": "images/thursday-illustrations.png",
    "cue": "Reach opposite arm and leg out, keeping your hips level. Alternate sides.",
    "column": 0,
    "row": 1
  },
  "Chest press variation": {
    "image": "images/chest-press-variation-steps.png",
    "standalone": true,
    "cue": "Use a neutral grip, with palms facing each other. Push the handles forward at chest height, then return slowly with your back on the pad."
  },
  "Chest-supported row": {
    "image": "images/saturday-illustrations.png",
    "top": 94,
    "cue": "Keep your chest against the pad as you pull your elbows back.",
    "column": 0,
    "row": 1
  },
  "Seated hip abductor": {
    "image": "images/saturday-illustrations.png",
    "top": 94,
    "cue": "Open your knees outward, then return slowly without bouncing.",
    "column": 1,
    "row": 1
  }
};

const STORAGE_KEY = "gym-tracker-sessions-v1";
let sessions = {};
let storageAvailable = true;
try {
  sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  if (!sessions || typeof sessions !== "object" || Array.isArray(sessions)) sessions = {};
} catch { storageAvailable = false; }
const dateKey = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
let selectedDate = new Date();
selectedDate.setHours(12, 0, 0, 0);
const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
function weekStart(date) {
  const start = new Date(date);
  start.setHours(12, 0, 0, 0);
  start.setDate(start.getDate() - (start.getDay() + 6) % 7);
  return start;
}
function scheduleFor(date) {
  const saved = sessions._schedule?.[dateKey(weekStart(date))];
  const defaults = Object.fromEntries(WORKOUTS.map(workout => [workout.id, (workout.day + 6) % 7]));
  if (!saved || !WORKOUTS.every(workout => Number.isInteger(saved[workout.id]) && saved[workout.id] >= 0 && saved[workout.id] <= 6) || new Set(Object.values(saved)).size !== 4) return defaults;
  return saved;
}
function workoutOn(date) {
  const schedule = scheduleFor(date);
  return WORKOUTS.find(workout => schedule[workout.id] === (date.getDay() + 6) % 7);
}
function workoutDate(date, day) {
  const result = weekStart(date);
  result.setDate(result.getDate() + day);
  return result;
}
function isTrainingDay(date) {
  return Boolean(workoutOn(date));
}
function moveToTrainingDay(date, direction, includeCurrent = false) {
  if (!includeCurrent) date.setDate(date.getDate() + direction);
  while (!isTrainingDay(date)) date.setDate(date.getDate() + direction);
  return date;
}
moveToTrainingDay(selectedDate, 1, true);

const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
function previousEntry(workout, index) {
  const key = dateKey(selectedDate);
  for (const day of Object.keys(sessions).filter(day => /^\d{4}-\d{2}-\d{2}$/.test(day) && day < key).sort().reverse()) {
    const entry = sessions[day]?.[workout.id]?.[index];
    if (entry && Number.isInteger(entry.sets) && Number.isInteger(entry.reps)) return {day, ...entry};
  }
  return null;
}
function valuesFor(workout, index) {
  const saved = sessions[dateKey(selectedDate)]?.[workout.id]?.[index];
  const numbers = workout.exercises[index].target.match(/\d+/g).map(Number);
  return {sets: saved?.sets ?? numbers[0], reps: saved?.reps ?? numbers[2] ?? numbers[1], weight: saved?.weight ?? ""};
}
function renderDashboard() {
  document.getElementById("schedule-status").textContent = "";
  const workout = workoutOn(selectedDate);
  renderSchedule();
  const isToday = dateKey(selectedDate) === dateKey(new Date());
  document.getElementById("day-label").textContent = new Intl.DateTimeFormat(undefined, {weekday:"long", month:"short", day:"numeric"}).format(selectedDate);
  const defaultDate = moveToTrainingDay(new Date(), 1, true);
  document.getElementById("today-button").hidden = dateKey(selectedDate) === dateKey(defaultDate);
  document.getElementById("today-button").textContent = isTrainingDay(new Date()) ? "Today" : "Next workout";
  document.getElementById("day-status").textContent = isToday ? "Today" : "Your schedule";
  document.getElementById("workout-title").textContent = workout?.title || "Rest day";
  document.getElementById("workout-list").innerHTML = workout ? workout.exercises.map((exercise,index) => {
    const values = valuesFor(workout,index);
    const previous = previousEntry(workout,index);
    const perSide = exercise.target.includes("side");
    const guide = EXERCISE_GUIDES[exercise.name];
    return `<article class="exercise-row"><div class="exercise-name"><h2><button class="exercise-toggle" type="button" aria-expanded="false" aria-controls="exercise-guide-${index}">${escapeHTML(exercise.name)}<span class="guide-chevron" aria-hidden="true">⌄</span></button></h2><p>${previous ? `Last · ${escapeHTML(previous.day)} · ${previous.sets} × ${previous.reps}${previous.weight !== undefined && previous.weight !== "" ? ` · ${escapeHTML(previous.weight)} kg` : ""}${perSide ? " / side" : ""}` : `Suggested · ${escapeHTML(exercise.target)}`}</p></div><div class="exercise-values"><label><span>Sets</span><input type="number" inputmode="numeric" min="1" max="99" step="1" value="${values.sets}" data-index="${index}" data-field="sets" aria-label="${escapeHTML(exercise.name)} sets"></label><span class="multiply" aria-hidden="true">×</span><label><span>Reps${perSide ? " / side" : ""}</span><input type="number" inputmode="numeric" min="1" max="99" step="1" value="${values.reps}" data-index="${index}" data-field="reps" aria-label="${escapeHTML(exercise.name)} repetitions${perSide ? " per side" : ""}"></label><label class="weight-field"><span>kg</span><input type="number" inputmode="decimal" min="0" max="9999" step="any" placeholder="—" value="${escapeHTML(values.weight)}" data-index="${index}" data-field="weight" aria-label="${escapeHTML(exercise.name)} weight in kilograms"></label></div><div class="exercise-guide" id="exercise-guide-${index}" hidden><div class="exercise-illustration"${guide.standalone ? ' data-layout="standalone"' : ""}><img src="${guide.image}" alt="${guide.standalone ? "Start and finish illustrations of" : "Illustrated"} ${escapeHTML(exercise.name)} with equipment and highlighted working muscles" loading="lazy" style="${guide.standalone ? "" : `left:-${guide.column * 100}%;top:-${guide.top ?? guide.row * 100}%;width:${guide.size ?? 200}%;height:${guide.size ?? 200}%`}"></div><p>${escapeHTML(guide.cue)}</p></div></article>`;
  }).join("") : '<div class="rest-day">No workout planned. Use the arrows to view another day.</div>';
  document.getElementById("session-extras").hidden = !workout;
  document.getElementById("warmup").textContent = workout?.warmup || "";
  document.getElementById("cooldown").textContent = workout?.cooldown || "";
  document.getElementById("workout-note").textContent = workout?.note || "";
  document.getElementById("save-status").textContent = storageAvailable ? "Saved on this browser · tap a number to edit" : "Browser storage unavailable. Changes may be lost on refresh.";
}
function renderSchedule() {
  const schedule = scheduleFor(selectedDate);
  const start = weekStart(selectedDate);
  const end = workoutDate(selectedDate, 6);
  const format = new Intl.DateTimeFormat(undefined, {month:"short", day:"numeric"});
  document.getElementById("schedule-week").textContent = `${format.format(start)} – ${format.format(end)}`;
  document.getElementById("schedule-days").innerHTML = [...WORKOUTS]
    .sort((a,b) => schedule[a.id] - schedule[b.id])
    .map(workout => `<label class="schedule-row"><span>${escapeHTML(workout.title)}</span><select data-workout="${workout.id}" aria-label="Day for ${escapeHTML(workout.title)}">${DAY_NAMES.map((day,index) => `<option value="${index}"${schedule[workout.id] === index ? " selected" : ""}>${day} ${format.format(workoutDate(selectedDate,index))}</option>`).join("")}</select></label>`).join("");
  document.getElementById("planned-days").textContent = Object.values(schedule).sort((a,b)=>a-b).map(day=>DAY_NAMES[day].slice(0,3)).join(" · ");
}
function reschedule(workoutId, newDay) {
  if (!WORKOUTS.some(workout => workout.id === workoutId) || !Number.isInteger(newDay) || newDay < 0 || newDay > 6) return;
  const oldSchedule = scheduleFor(selectedDate);
  if (oldSchedule[workoutId] === newDay) return;
  const currentWorkout = workoutOn(selectedDate);
  const newSchedule = {...oldSchedule};
  const other = WORKOUTS.find(workout => workout.id !== workoutId && oldSchedule[workout.id] === newDay);
  if (other) newSchedule[other.id] = oldSchedule[workoutId];
  newSchedule[workoutId] = newDay;
  const snapshot = JSON.parse(JSON.stringify(sessions));
  // Collect before deleting so swaps preserve both workouts' entries.
  const entries = WORKOUTS.map(workout => ({
    id:workout.id,
    oldKey:dateKey(workoutDate(selectedDate, oldSchedule[workout.id])),
    newKey:dateKey(workoutDate(selectedDate, newSchedule[workout.id]))
  })).map(item => ({...item, entry:sessions[item.oldKey]?.[item.id]}));
  for (const item of entries) {
    if (sessions[item.oldKey]) delete sessions[item.oldKey][item.id];
  }
  for (const item of entries) {
    if (item.entry) {sessions[item.newKey] ||= {}; sessions[item.newKey][item.id] = item.entry;}
  }
  sessions._schedule ||= {};
  sessions._schedule[dateKey(weekStart(selectedDate))] = newSchedule;
  try {
    // Schedule and moved entries persist together in one write.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    sessions = snapshot;
    renderSchedule();
    document.getElementById("schedule-status").textContent = "Could not save the schedule. No workouts were moved. Check browser storage and try again.";
    return;
  }
  storageAvailable = true;
  if (currentWorkout) selectedDate = workoutDate(selectedDate, newSchedule[currentWorkout.id]);
  renderDashboard();
  document.getElementById("schedule-status").textContent = other
    ? "Workouts swapped and saved for this week. Saved values moved with them."
    : "Workout moved and saved for this week. Saved values moved with it.";
}
document.getElementById("schedule-days").addEventListener("change", event => {
  if (event.target.matches("select[data-workout]")) reschedule(event.target.dataset.workout, Number(event.target.value));
});
function saveInput(input) {
  const isWeight = input.dataset.field === "weight";
  const value = isWeight && !input.value.trim() ? "" : Number(input.value);
  const valid = isWeight
    ? value === "" || (Number.isFinite(value) && value >= 0 && value <= 9999)
    : Number.isInteger(value) && value >= 1 && value <= 99 && input.value.trim();
  if (!valid) {
    input.setAttribute("aria-invalid", "true");
    document.getElementById("save-status").textContent = isWeight ? "Enter a weight from 0 to 9999 kg. This change has not been saved." : "Enter a whole number from 1 to 99. This change has not been saved.";
    return;
  }
  input.removeAttribute("aria-invalid");
  const workout = workoutOn(selectedDate);
  const key = dateKey(selectedDate);
  const index = Number(input.dataset.index);
  sessions[key] ||= {};
  sessions[key][workout.id] ||= {};
  sessions[key][workout.id][index] = {...valuesFor(workout,index), [input.dataset.field]: value};
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    storageAvailable = true;
    document.getElementById("save-status").textContent = "Saved on this browser";
  } catch {
    storageAvailable = false;
    document.getElementById("save-status").textContent = "Could not save in this browser. Keep this page open to retain changes.";
  }
}
document.getElementById("workout-list").addEventListener("click", event => {
  if (event.target.closest(".exercise-values, .exercise-guide")) return;
  const button = event.target.closest(".exercise-toggle") ||
    event.target.closest(".exercise-row")?.querySelector(".exercise-toggle");
  if (!button) return;
  const expanded = button.getAttribute("aria-expanded") === "true";
  button.setAttribute("aria-expanded", String(!expanded));
  document.getElementById(button.getAttribute("aria-controls")).hidden = expanded;
});
document.getElementById("workout-list").addEventListener("input", event => {
  if (event.target.matches("input")) saveInput(event.target);
});
for (const [id, offset] of [["previous-day",-1],["next-day",1]]) {
  document.getElementById(id).addEventListener("click", () => {
    moveToTrainingDay(selectedDate, offset);
    renderDashboard();
  });
}
document.getElementById("today-button").addEventListener("click", () => {
  selectedDate = new Date(); selectedDate.setHours(12,0,0,0); moveToTrainingDay(selectedDate, 1, true); renderDashboard();
});
// Long press a number, then slide vertically. A normal tap still opens the keyboard.
let drag;
const list = document.getElementById("workout-list");
list.addEventListener("pointerdown", event => {
  if (!event.target.matches("input") || event.button !== 0) return;
  const input = event.target;
  drag = {input, y:event.clientY, start:Number(input.value) || (input.dataset.field === "weight" ? 0 : 1), active:false};
  drag.timer = setTimeout(() => {
    if (!drag) return;
    drag.active = true;
    input.setPointerCapture(event.pointerId);
    input.classList.add("adjusting");
    input.blur();
  }, 400);
});
list.addEventListener("pointermove", event => {
  if (!drag) return;
  if (!drag.active) {
    if (Math.abs(event.clientY-drag.y)>8) {clearTimeout(drag.timer); drag = null;}
    return;
  }
  const isWeight = drag.input.dataset.field === "weight";
  const value = Math.max(isWeight ? 0 : 1, Math.min(isWeight ? 9999 : 99,
    Math.round((drag.start + Math.trunc((drag.y-event.clientY)/14) * (isWeight ? 0.5 : 1)) * 100) / 100));
  if (Number(drag.input.value)!==value) {drag.input.value=value; saveInput(drag.input);}
});
function stopDrag() {
  if (!drag) return;
  clearTimeout(drag.timer); drag.input.classList.remove("adjusting"); drag=null;
}
list.addEventListener("pointerleave", () => {
  if (drag && !drag.active) stopDrag();
});
list.addEventListener("pointerup",stopDrag);
list.addEventListener("pointercancel",stopDrag);
list.addEventListener("lostpointercapture",stopDrag);
renderDashboard();
