const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function getSelectedRadioValue(name) {
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : null;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}



const THEME_KEY = "fitgenei-theme";

function applyTheme(theme) {
  const body = document.body;
  if (theme === "dark") {
    body.classList.remove("light-theme");
  } else {
    body.classList.add("light-theme");
  }
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || "dark";
  applyTheme(saved);

  const themeToggle = $("#themeToggle");
  const icon = themeToggle.querySelector("i");

  const updateIcon = () => {
    const isDark = !document.body.classList.contains("light-theme");
    icon.className = isDark ? "fa-solid fa-moon" : "fa-solid fa-sun";
  };

  updateIcon();

  themeToggle.addEventListener("click", () => {
    const isDark = !document.body.classList.contains("light-theme");
    const newTheme = isDark ? "light" : "dark";
    applyTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    updateIcon();
  });
}


function calculateBMI(heightCm, weightKg) {
  const heightM = heightCm / 100;
  if (!heightM || !weightKg) return { bmi: null, status: "Invalid" };
  const bmi = weightKg / (heightM * heightM);

  let status = "";
  if (bmi < 18.5) status = "Underweight";
  else if (bmi < 25) status = "Normal";
  else if (bmi < 30) status = "Overweight";
  else status = "Obese";

  return { bmi: Number(bmi.toFixed(1)), status };
}

function calculateCalories({ age, gender, height, weight, activity, goal }) {

  let bmr;
  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const activityFactor =
    activity === "sedentary" ? 1.2 : activity === "moderate" ? 1.45 : 1.7;

  let calories = bmr * activityFactor;

  if (goal === "loss") {
    calories -= 350; 
  } else if (goal === "gain") {
    calories += 250; 
  }

  return Math.round(calories);
}

function calculateWaterIntake(weightKg) {
  
  if (!weightKg) return null;
  const ml = weightKg * 35;
  const liters = ml / 1000;
  return Number(liters.toFixed(1));
}

function calculateStepSuggestion(activity, goal) {
  let base =
    activity === "sedentary" ? 6000 : activity === "moderate" ? 8000 : 10000;
  if (goal === "loss") base += 2000;
  return base;
}


const MEAL_TEMPLATES = {
  breakfast: [
    {
      type: "veg",
      items: [
        "Overnight oats with chia & berries",
        "1 boiled egg (optional) or Greek yogurt",
      ],
      meta: "High fiber • Slow-release carbs • 400–450 kcal",
    },
    {
      type: "nonveg",
      items: [
        "Scrambled eggs with veggies & 1 multigrain toast",
        "Handful of nuts",
      ],
      meta: "High protein • Healthy fats • 400–450 kcal",
    },
    {
      type: "mixed",
      items: [
        "Veggie omelette + 1 fruit",
        "Green tea or black coffee (no sugar)",
      ],
      meta: "Protein rich • Antioxidants • 350–400 kcal",
    },
  ],
  lunch: [
    {
      type: "veg",
      items: [
        "1–2 multigrain rotis or 1 cup brown rice",
        "Dal / paneer sabzi + mixed salad",
      ],
      meta: "Balanced carbs & protein • 500–550 kcal",
    },
    {
      type: "nonveg",
      items: [
        "Grilled chicken / fish + quinoa or rice",
        "Sauteed veggies & salad",
      ],
      meta: "Lean protein • Complex carbs • 550–600 kcal",
    },
    {
      type: "mixed",
      items: [
        "Buddha bowl with grains, veggies, beans, seeds",
        "Light yogurt dressing",
      ],
      meta: "Colorful micronutrients • 500–550 kcal",
    },
  ],
  snacks: [
    {
      type: "veg",
      items: [
        "Roasted chana or trail mix",
        "Green tea / lemon water",
      ],
      meta: "Light yet satiating • 150–200 kcal",
    },
    {
      type: "nonveg",
      items: [
        "Small tuna / chicken salad wrap",
      ],
      meta: "Protein focused • 200–250 kcal",
    },
    {
      type: "mixed",
      items: [
        "Fruit + handful of nuts or seeds",
      ],
      meta: "Natural sugars • Healthy fats • 150–200 kcal",
    },
  ],
  dinner: [
    {
      type: "veg",
      items: [
        "Veg soup + sautéed paneer / tofu",
        "Small portion of whole grains",
      ],
      meta: "Lighter dinner • 400–450 kcal",
    },
    {
      type: "nonveg",
      items: [
        "Grilled fish / chicken + veggies",
        "No heavy carbs post 8 PM",
      ],
      meta: "Protein recovery • 400–450 kcal",
    },
    {
      type: "mixed",
      items: [
        "Khichdi with ghee + salad",
        "Buttermilk / low-fat curd",
      ],
      meta: "Comforting & gut-friendly • 400–450 kcal",
    },
  ],
};

function pickMeal(mealType, preference) {
  const candidates = MEAL_TEMPLATES[mealType];
  if (!candidates) return null;

  if (preference === "veg" || preference === "nonveg") {
    const exact = candidates.filter((m) => m.type === preference);
    const mixed = candidates.filter((m) => m.type === "mixed");
    const pool = [...exact, ...mixed];
    return pool[Math.floor(Math.random() * pool.length)];
  }
  
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function renderDietPlan(preference, calories, goal) {
  const container = $("#dietPlan");
  container.innerHTML = "";

  const meals = [
    { key: "breakfast", label: "Breakfast" },
    { key: "lunch", label: "Lunch" },
    { key: "snacks", label: "Snacks" },
    { key: "dinner", label: "Dinner" },
  ];

  meals.forEach((meal) => {
    const data = pickMeal(meal.key, preference);
    if (!data) return;

    const card = document.createElement("article");
    card.className = "meal-card";
    card.innerHTML = `
      <h3>${meal.label}</h3>
      <ul class="meal-items">
        ${data.items.map((i) => `<li>${i}</li>`).join("")}
      </ul>
      <p class="meal-meta">
        ${data.meta} ${
          goal === "loss"
            ? " • Slight deficit for fat loss"
            : goal === "gain"
            ? " • Slight surplus for muscle gain"
            : " • Maintenance friendly"
        }
      </p>
    `;
    container.appendChild(card);
  });
}


const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function createWorkoutForDay(dayIndex, activity, goal) {
  const baseIntensity =
    activity === "sedentary" ? "Beginner" : activity === "moderate" ? "Intermediate" : "Advanced";

  const isActiveDay = [0, 1, 3, 4, 6].includes(dayIndex); // 5 active days

  if (!isActiveDay) {
    return {
      day: DAYS[dayIndex],
      type: "Recovery & Mobility",
      desc: "10–15 min light stretching, deep breathing, short walk.",
    };
  }

  let focus;
  if (goal === "loss") {
    focus = "Cardio + Core";
  } else if (goal === "gain") {
    focus = "Strength & Muscle";
  } else {
    focus = "Balanced Full Body";
  }

  const suggestions = {
    loss: [
      "25–35 min brisk walk / jog",
      "10 min core (planks, crunches)",
      "Cool down and stretch",
    ],
    gain: [
      "3×10 bodyweight squats & lunges",
      "3×10 push-ups (knee or full)",
      "3×15 glute bridges",
    ],
    maintain: [
      "20–25 min brisk walk / easy run",
      "15 min bodyweight circuit",
      "5–10 min stretching",
    ],
  };

  const lines =
    goal === "loss" ? suggestions.loss : goal === "gain" ? suggestions.gain : suggestions.maintain;

  return {
    day: DAYS[dayIndex],
    type: `${baseIntensity} • ${focus}`,
    desc: lines.join(" • "),
  };
}

function renderWorkoutPlan(activity, goal) {
  const container = $("#workoutPlan");
  container.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const plan = createWorkoutForDay(i, activity, goal);
    const el = document.createElement("article");
    el.className = "workout-day";
    el.innerHTML = `
      <h3>${plan.day}</h3>
      <p class="workout-type">${plan.type}</p>
      <p class="workout-desc">${plan.desc}</p>
    `;
    container.appendChild(el);
  }
}


const QUOTES = [
  "Your body achieves what your mind believes.",
  "Small habits every day create big results.",
  "You don’t need extreme changes, just consistent ones.",
  "One workout is better than none. Move today.",
  "Discipline beats motivation when motivation is gone.",
  "Food is fuel. Choose what makes you feel strong.",
  "You’re one healthy choice away from a better day.",
  "Strong looks different on every body. Build your version.",
  "Don’t compare. Just compete with yesterday’s you.",
  "Progress over perfection. Always.",
];

function setRandomQuote() {
  const quoteText = $("#quoteText");
  const index = Math.floor(Math.random() * QUOTES.length);
  quoteText.textContent = QUOTES[index];
}


const RECIPES = [
  {
    title: "High-Protein Veggie Bowl",
    details:
      "Quinoa + chickpeas + roasted veggies + hummus drizzle.",
    meta: "Packed with fiber and plant protein.",
    type: "veg",
  },
  {
    title: "Greek Yogurt Power Parfait",
    details:
      "Greek yogurt layered with fruits, nuts, and chia seeds.",
    meta: "Great as post-workout or breakfast.",
    type: "mixed",
  },
  {
    title: "Grilled Chicken Rainbow Plate",
    details:
      "Grilled chicken breast, sweet potato, broccoli, and salad.",
    meta: "Balanced protein, carbs, and micronutrients.",
    type: "nonveg",
  },
  {
    title: "Paneer Stir-Fry Wrap",
    details:
      "Whole wheat wrap filled with paneer, peppers, onions, and lettuce.",
    meta: "Perfect quick lunch option.",
    type: "veg",
  },
  {
    title: "Lentil & Veggie Soup",
    details:
      "Comforting lentil soup loaded with carrots, celery, and spinach.",
    meta: "Light dinner with good protein.",
    type: "veg",
  },
  {
    title: "Protein Smoothie",
    details:
      "Banana, protein powder, peanut butter, oats, and milk/plant milk.",
    meta: "Great pre or post workout fuel.",
    type: "mixed",
  },
];

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function renderRecipes(preference) {
  const container = $("#recipesContainer");
  container.innerHTML = "";

  let filtered = RECIPES;
  if (preference === "veg") {
    filtered = RECIPES.filter((r) => r.type === "veg" || r.type === "mixed");
  } else if (preference === "nonveg") {
    filtered = RECIPES.filter((r) => r.type === "nonveg" || r.type === "mixed");
  }

  const selected = shuffleArray(filtered).slice(0, 3);

  selected.forEach((recipe) => {
    const item = document.createElement("article");
    item.className = "recipe-card-item";
    item.innerHTML = `
      <h3 class="recipe-title">${recipe.title}</h3>
      <p class="recipe-details">${recipe.details}</p>
      <p class="recipe-meta">${recipe.meta}</p>
    `;
    container.appendChild(item);
  });
}


const PROGRESS_KEY = "fitgenei-progress";

let progressData = [];
let progressChart = null;

function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    console.error("Failed to parse stored progress", e);
    return [];
  }
}

function saveProgress() {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressData));
}

function initChart() {
  const ctx = document.getElementById("progressChart");
  if (!ctx) return;

  const labels = progressData.map((entry) => entry.dateLabel);
  const weights = progressData.map((entry) => entry.weight);

  const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 220);
  gradient.addColorStop(0, "rgba(56, 189, 248, 0.7)");
  gradient.addColorStop(1, "rgba(56, 189, 248, 0.03)");

  progressChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Weight (kg)",
          data: weights,
          borderColor: "#06b6d4",
          backgroundColor: gradient,
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#06b6d4",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label(ctx) {
              return `${ctx.parsed.y} kg`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: "rgba(148, 163, 184, 0.3)",
          },
          ticks: {
            color: "rgba(156, 163, 175, 0.9)",
            maxRotation: 0,
          },
        },
        y: {
          grid: {
            color: "rgba(148, 163, 184, 0.25)",
          },
          ticks: {
            color: "rgba(156, 163, 175, 0.9)",
          },
        },
      },
    },
  });
}

function updateChart() {
  if (!progressChart) {
    initChart();
    return;
  }
  progressChart.data.labels = progressData.map((e) => e.dateLabel);
  progressChart.data.datasets[0].data = progressData.map((e) => e.weight);
  progressChart.update();
}

function addProgressEntry(dateStr, weight) {
  const date = dateStr ? new Date(dateStr) : new Date();
  const label = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  progressData.push({
    timestamp: date.getTime(),
    dateLabel: label,
    weight: Number(weight),
  });

  progressData.sort((a, b) => a.timestamp - b.timestamp);
  saveProgress();
  updateChart();
}


let stepInterval = null;
let stepCount = 0;

function updateStepDisplay() {
  $("#stepCount").textContent = stepCount.toString();
  $("#heroSteps").textContent = stepCount.toString();
}

function startStepSimulation() {
  const speedInput = $("#stepSpeed");
  const speed = Number(speedInput.value || 3);
  const intervalMs = clamp(700 - speed * 120, 150, 700); 
  if (stepInterval) clearInterval(stepInterval);
  stepInterval = setInterval(() => {
    stepCount += Math.floor(Math.random() * 7) + 4;
    updateStepDisplay();
  }, intervalMs);
}

function stopStepSimulation() {
  if (stepInterval) {
    clearInterval(stepInterval);
    stepInterval = null;
  }
}

function resetStepSimulation() {
  stopStepSimulation();
  stepCount = 0;
  updateStepDisplay();
}


const PROFILE_KEY = "fitgenei-profile";

function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse profile", e);
    return null;
  }
}

function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function populateProfileForm(profile) {
  if (!profile) return;
  $("#age").value = profile.age || "";
  $("#height").value = profile.height || "";
  $("#weight").value = profile.weight || "";
  $("#activity").value = profile.activity || "moderate";
  $("#goal").value = profile.goal || "maintain";

  const genderRadio = document.querySelector(
    `input[name="gender"][value="${profile.gender || "male"}"]`
  );
  if (genderRadio) genderRadio.checked = true;

  const preferenceRadio = document.querySelector(
    `input[name="dietPreference"][value="${profile.preference || "mixed"}"]`
  );
  if (preferenceRadio) preferenceRadio.checked = true;
}

function updateHeroQuickStats({ bmi, bmiStatus, calories, water, goal, activity }) {
  $("#heroBmi").textContent = bmi ?? "--";
  $("#heroCalories").textContent = calories ?? "--";
  $("#heroWaterIntake").textContent = water ? `${water} L` : "--";
  $("#heroGoalLabel").textContent =
    goal === "loss" ? "Weight Loss" : goal === "gain" ? "Weight Gain" : "Maintain";
  $("#heroActivityLabel").textContent =
    activity === "sedentary"
      ? "Sedentary"
      : activity === "moderate"
      ? "Moderate"
      : "Active";

  const heroStatus = $("#heroBmiStatus");
  if (bmi == null) {
    heroStatus.textContent = "Awaiting data";
  } else {
    heroStatus.textContent = bmiStatus;
  }
}

function generatePlanFromForm() {
  const age = Number($("#age").value);
  const height = Number($("#height").value);
  const weight = Number($("#weight").value);
  const activity = $("#activity").value;
  const goal = $("#goal").value;
  const gender = getSelectedRadioValue("gender") || "male";
  const preference = getSelectedRadioValue("dietPreference") || "mixed";

  if (!age || !height || !weight) {
    $("#profileForm").classList.add("shake");
    setTimeout(() => $("#profileForm").classList.remove("shake"), 320);
    return;
  }

  const { bmi, status } = calculateBMI(height, weight);
  const calories = calculateCalories({ age, gender, height, weight, activity, goal });
  const water = calculateWaterIntake(weight);
  const stepsSuggestion = calculateStepSuggestion(activity, goal);

 
  $("#bmiValue").textContent = bmi;
  $("#bmiStatus").textContent = status;
  $("#calorieValue").textContent = calories;
  $("#waterValue").textContent = `${water} L`;
  $("#stepsSuggestion").textContent = stepsSuggestion.toLocaleString();

 
  const profile = { age, gender, height, weight, activity, goal, preference };
  saveProfile(profile);

 
  updateHeroQuickStats({
    bmi,
    bmiStatus: status,
    calories,
    water,
    goal,
    activity,
  });

 
  renderDietPlan(preference, calories, goal);
  renderWorkoutPlan(activity, goal);

 
  renderRecipes(preference);
}

function resetProfileForm() {
  $("#profileForm").reset();
  localStorage.removeItem(PROFILE_KEY);

  $("#bmiValue").textContent = "--";
  $("#bmiStatus").textContent = "Not calculated";
  $("#calorieValue").textContent = "--";
  $("#waterValue").textContent = "--";
  $("#stepsSuggestion").textContent = "--";
  $("#dietPlan").innerHTML = "";
  $("#workoutPlan").innerHTML = "";

  updateHeroQuickStats({
    bmi: null,
    bmiStatus: "Awaiting data",
    calories: null,
    water: null,
    goal: "maintain",
    activity: "moderate",
  });
}


function triggerPdfDownload() {
 
  window.print();
}


document.addEventListener("DOMContentLoaded", () => {
 
  initTheme();

 
  $("#scrollToProgress").addEventListener("click", () => {
    $("#progressSection").scrollIntoView({ behavior: "smooth", block: "start" });
  });


  setRandomQuote();
  $("#newQuoteBtn").addEventListener("click", setRandomQuote);

 
  const profile = loadProfile();
  populateProfileForm(profile);

  if (profile) {
    
    generatePlanFromForm();
  } else {
   
    renderRecipes("mixed");
  }

  $("#profileForm").addEventListener("submit", (e) => {
    e.preventDefault();
    generatePlanFromForm();
  });

  $("#resetProfile").addEventListener("click", resetProfileForm);

  
  progressData = loadProgress();
  if (progressData.length) {
    initChart();
  } else {
    initChart(); 
  }

  $("#addLogBtn").addEventListener("click", () => {
    const date = $("#logDate").value;
    const weightVal = Number($("#logWeight").value);
    if (!weightVal || weightVal < 30 || weightVal > 250) {
      $("#logWeight").classList.add("shake");
      setTimeout(() => $("#logWeight").classList.remove("shake"), 320);
      return;
    }
    addProgressEntry(date, weightVal);
    $("#logWeight").value = "";
  });

  $("#clearLogsBtn").addEventListener("click", () => {
    if (!progressData.length) return;
    if (!confirm("Clear all saved progress entries?")) return;
    progressData = [];
    saveProgress();
    updateChart();
  });

 
  
  $("#startSteps").addEventListener("click", startStepSimulation);
  $("#stopSteps").addEventListener("click", stopStepSimulation);
  $("#resetSteps").addEventListener("click", resetStepSimulation);
  $("#stepSpeed").addEventListener("input", () => {
    if (stepInterval) {
      
      startStepSimulation();
    }
  });
  updateStepDisplay();

  
  $("#newRecipesBtn").addEventListener("click", () => {
    const preference = getSelectedRadioValue("dietPreference") || "mixed";
    renderRecipes(preference);
  });

 
  $("#downloadPdfBtn").addEventListener("click", triggerPdfDownload);

  
  $$("[data-countup]").forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(6px)";
    setTimeout(() => {
      el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 150);
  });
});
