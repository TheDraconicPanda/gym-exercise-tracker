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

const STORAGE_KEY = "gym-tracker-sessions-v1";
let sessions = {};
let storageAvailable = true;
try {
  sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  if (!sessions || typeof sessions !== "object" || Array.isArray(sessions)) sessions = {};
} catch { storageAvailable = false; }
let selectedDate = new Date();
selectedDate.setHours(12, 0, 0, 0);
function isTrainingDay(date) {
  return WORKOUTS.some(workout => workout.day === date.getDay());
}
function moveToTrainingDay(date, direction, includeCurrent = false) {
  if (!includeCurrent) date.setDate(date.getDate() + direction);
  while (!isTrainingDay(date)) date.setDate(date.getDate() + direction);
  return date;
}
moveToTrainingDay(selectedDate, 1, true);
const dateKey = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
function previousEntry(workout, index) {
  const key = dateKey(selectedDate);
  for (const day of Object.keys(sessions).filter(day => day < key).sort().reverse()) {
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
  const workout = WORKOUTS.find(item => item.day === selectedDate.getDay());
  const isToday = dateKey(selectedDate) === dateKey(new Date());
  document.getElementById("day-label").textContent = new Intl.DateTimeFormat(undefined, {weekday:"long", month:"short", day:"numeric"}).format(selectedDate);
  const defaultDate = moveToTrainingDay(new Date(), 1, true);
  document.getElementById("today-button").hidden = dateKey(selectedDate) === dateKey(defaultDate);
  document.getElementById("today-button").textContent = isTrainingDay(new Date()) ? "Today" : "Next workout";
  document.getElementById("day-status").textContent = isToday ? "Today" : "Your schedule";
  document.getElementById("workout-title").textContent = workout?.title || "Rest day";
  document.getElementById("session-time").textContent = workout?.minutes || "No scheduled training";
  document.getElementById("workout-list").innerHTML = workout ? workout.exercises.map((exercise,index) => {
    const values = valuesFor(workout,index);
    const previous = previousEntry(workout,index);
    const perSide = exercise.target.includes("side");
    return `<article class="exercise-row"><div class="exercise-name"><h2>${escapeHTML(exercise.name)}</h2><p>${previous ? `Last · ${escapeHTML(previous.day)} · ${previous.sets} × ${previous.reps}${previous.weight !== undefined && previous.weight !== "" ? ` · ${escapeHTML(previous.weight)} kg` : ""}${perSide ? " / side" : ""}` : `Suggested · ${escapeHTML(exercise.target)}`}</p></div><div class="exercise-values"><label><span>Sets</span><input type="number" inputmode="numeric" min="1" max="99" step="1" value="${values.sets}" data-index="${index}" data-field="sets" aria-label="${escapeHTML(exercise.name)} sets"></label><span class="multiply" aria-hidden="true">×</span><label><span>Reps${perSide ? " / side" : ""}</span><input type="number" inputmode="numeric" min="1" max="99" step="1" value="${values.reps}" data-index="${index}" data-field="reps" aria-label="${escapeHTML(exercise.name)} repetitions${perSide ? " per side" : ""}"></label><label class="weight-field"><span>kg</span><input type="number" inputmode="decimal" min="0" max="9999" step="any" placeholder="—" value="${escapeHTML(values.weight)}" data-index="${index}" data-field="weight" aria-label="${escapeHTML(exercise.name)} weight in kilograms"></label></div></article>`;
  }).join("") : '<div class="rest-day">No workout planned. Use the arrows to view another day.</div>';
  document.getElementById("session-extras").hidden = !workout;
  document.getElementById("warmup").textContent = workout?.warmup || "";
  document.getElementById("cooldown").textContent = workout?.cooldown || "";
  document.getElementById("workout-note").textContent = workout?.note || "";
  document.getElementById("save-status").textContent = storageAvailable ? "Saved on this browser · tap a number to edit" : "Browser storage unavailable. Changes may be lost on refresh.";
}
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
  const workout = WORKOUTS.find(item => item.day === selectedDate.getDay());
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
