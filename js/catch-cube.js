// משחק תנועה (DOM בלבד): תפוס את הקובייה
const ROUND_SECONDS = 15;

// ---------- helpers: safe DOM ----------
function $(id) {
  return document.getElementById(id);
}
function must(id) {
  const el = $(id);
  if (!el) console.error("Missing element id:", id);
  return el;
}
function safeOn(el, event, fn) {
  if (!el) return;
  el.addEventListener(event, fn);
}

// ---------- DOM (MUST exist) ----------
const startScreen = must("startScreen");
const resultScreen = must("resultScreen");
const realStartBtn = must("realStartBtn");

const gameArea = must("gameArea");
const target = must("target");

const scoreEl = must("score");
const bestEl = must("best");
const timeLeftEl = must("timeLeft");
const restartBtn = must("restartBtn");
const diffLabel = must("diffLabel");

const stageLabel = must("stageLabel");
const comboLabel = must("comboLabel");

// Start info
const lastPlayedText = must("lastPlayedText");
const lastScoreText = must("lastScoreText");
const bestText = must("bestText");
const lastStageText = must("lastStageText");

// Result
const resultScoreEl = must("resultScore");
const resultDiffEl = must("resultDiff");
const resultBestEl = must("resultBest");
const resultStageEl = must("resultStage");
const resultMaxComboEl = must("resultMaxCombo");

const playAgainBtn = must("playAgainBtn");
const nextLevelBtn = must("nextLevelBtn");

const star1 = must("star1");
const star2 = must("star2");
const star3 = must("star3");

const burstLayer = must("burstLayer");

// stage buttons
const stageBtns = Array.from(document.querySelectorAll(".diff-btn"));

// אם אין כפתורי שלבים - לא מפיל את המשחק, רק מדווח
if (!stageBtns.length) console.warn("No .diff-btn buttons found");

// ---------- state ----------
let score = 0;
let best = 0;

let timeLeft = ROUND_SECONDS;
let isRunning = false;

let stage = 1;          // 1..3
let moveEveryMs = 1600;

let moveIntervalId = null;
let timerIntervalId = null;

// combo
let combo = 1;
let maxCombo = 1;
let lastHitAt = 0;

// ---------- user keys ----------
function getCurrentUsername() {
  return localStorage.getItem("currentUser") || "guest";
}
function keysForUser() {
  const user = getCurrentUsername();
  return {
    bestKey: `movement_best_${user}`,
    lastPlayedKey: `movement_lastPlayed_${user}`,
    lastScoreKey: `movement_lastScore_${user}`,
    lastStageKey: `movement_lastStage_${user}`,
  };
}

function formatLastPlayed(ts) {
  if (!ts) return "—";
  const d = new Date(Number(ts));
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("he-IL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function stageToDiffLabel(s) {
  if (s === 1) return "קל";
  if (s === 2) return "בינוני";
  return "קשה";
}

function applyStageSettings() {
  if (stage === 1) moveEveryMs = 1800;
  else if (stage === 2) moveEveryMs = 1000;
  else moveEveryMs = 650;

  const diffText = stageToDiffLabel(stage);
  if (diffLabel) diffLabel.textContent = diffText;
  if (resultDiffEl) resultDiffEl.textContent = diffText;

  if (stageLabel) stageLabel.textContent = String(stage);
  if (resultStageEl) resultStageEl.textContent = String(stage);

  stageBtns.forEach(btn => {
    btn.classList.toggle("active", Number(btn.dataset.stage) === stage);
  });
}

function loadProfileStats() {
  const { bestKey, lastPlayedKey, lastScoreKey, lastStageKey } = keysForUser();

  const savedBest = parseInt(localStorage.getItem(bestKey) || "0", 10);
  best = Number.isNaN(savedBest) ? 0 : savedBest;

  const savedLastScore = localStorage.getItem(lastScoreKey);
  const savedLastPlayed = localStorage.getItem(lastPlayedKey);
  const savedLastStage = localStorage.getItem(lastStageKey);

  if (bestEl) bestEl.textContent = String(best);
  if (bestText) bestText.textContent = String(best);

  if (lastScoreText) lastScoreText.textContent = (savedLastScore !== null) ? String(savedLastScore) : "—";
  if (lastPlayedText) lastPlayedText.textContent = formatLastPlayed(savedLastPlayed);
  if (lastStageText) lastStageText.textContent = (savedLastStage !== null) ? String(savedLastStage) : "—";
}

function saveBestIfNeeded() {
  if (score <= best) return;

  best = score;
  if (bestEl) bestEl.textContent = String(best);
  if (bestText) bestText.textContent = String(best);

  const { bestKey } = keysForUser();
  localStorage.setItem(bestKey, String(best));

  if (typeof UserStore !== "undefined" && UserStore.getCurrentUser()) {
    UserStore.updateCurrentUser({ movementBest: best });
    UserStore.logActivity(`שיא חדש במשחק תפוס את הקובייה: ${best}`);
  }
}

function saveLastSession() {
  const { lastPlayedKey, lastScoreKey, lastStageKey } = keysForUser();
  localStorage.setItem(lastPlayedKey, String(Date.now()));
  localStorage.setItem(lastScoreKey, String(score));
  localStorage.setItem(lastStageKey, String(stage));
}

// ---------- movement ----------
function randomPosition() {
  if (!gameArea || !target) return;

  const areaRect = gameArea.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  const maxX = areaRect.width - targetRect.width;
  const maxY = areaRect.height - targetRect.height;

  const x = Math.floor(Math.random() * Math.max(1, maxX));
  const y = Math.floor(Math.random() * Math.max(1, maxY));

  target.style.left = x + "px";
  target.style.top = y + "px";
}

function startMovementLoop() {
  clearInterval(moveIntervalId);
  moveIntervalId = setInterval(randomPosition, moveEveryMs);
  randomPosition();
}

function stopAllLoops() {
  clearInterval(moveIntervalId);
  clearInterval(timerIntervalId);
  moveIntervalId = null;
  timerIntervalId = null;
}

// ---------- flow ----------
function resetGameStateForStage() {
  stopAllLoops();
  score = 0;
  timeLeft = ROUND_SECONDS;

  combo = 1;
  maxCombo = 1;
  lastHitAt = 0;

  if (scoreEl) scoreEl.textContent = "0";
  if (timeLeftEl) timeLeftEl.textContent = String(timeLeft);
  if (comboLabel) comboLabel.textContent = "x1";

  applyStageSettings();

  if (target) {
    target.style.left = "40px";
    target.style.top = "40px";
  }
}

function startStage() {
  console.log("startStage() clicked");
  if (isRunning) return;

  loadProfileStats();
  applyStageSettings();

  isRunning = true;
  resetGameStateForStage();

  if (startScreen) startScreen.style.display = "none";
  if (resultScreen) resultScreen.style.display = "none";

  startMovementLoop();

  timerIntervalId = setInterval(() => {
    timeLeft--;
    if (timeLeftEl) timeLeftEl.textContent = String(timeLeft);

    if (timeLeft <= 0) endStage();
  }, 1000);
}

function endStage() {
  isRunning = false;
  stopAllLoops();

  saveBestIfNeeded();
  saveLastSession();
  loadProfileStats();

  if (typeof UserStore !== "undefined" && UserStore.getCurrentUser()) {
    UserStore.logActivity(`סיום שלב ${stage} במשחק תפוס את הקובייה: ${score} נקודות (${stageToDiffLabel(stage)})`);
    if (typeof UserStore.updateGameStats === "function") {
      UserStore.updateGameStats(ROUND_SECONDS * 1000);
    }
  }

  showResultScreen();
}

// ---------- scoring ----------
function updateCombo(now) {
  const windowMs = 650;

  if (now - lastHitAt <= windowMs) combo += 1;
  else combo = 1;

  lastHitAt = now;
  if (combo > maxCombo) maxCombo = combo;

  if (comboLabel) comboLabel.textContent = `x${combo}`;
}

function addScoreForHit() {
  const add = Math.min(combo, 4);
  score += add;
  if (scoreEl) scoreEl.textContent = String(score);
  saveBestIfNeeded();
}

function handleHit(e) {
  if (e) e.preventDefault();
  if (!isRunning) return;

  const now = Date.now();
  updateCombo(now);
  addScoreForHit();

  randomPosition();
  startMovementLoop();
}

safeOn(target, "pointerdown", handleHit);
safeOn(target, "click", handleHit);

// ---------- stars + burst ----------
function calcStars() {
  const base = (stage === 1) ? 5 : (stage === 2) ? 6 : 7;
  if (score >= base * 3) return 3;
  if (score >= base * 2) return 2;
  if (score >= base) return 1;
  return 0;
}

function showStars(starsCount) {
  const stars = [star1, star2, star3].filter(Boolean);
  stars.forEach((s, idx) => s.classList.toggle("on", idx < starsCount));
}

function clearBursts() {
  if (burstLayer) burstLayer.innerHTML = "";
}

function burstStars(amount) {
  clearBursts();
  if (!burstLayer) return;

  for (let b = 0; b < amount; b++) {
    const burst = document.createElement("div");
    burst.className = "burst";

    const offsetX = (Math.random() * 80) - 40;
    const offsetY = (Math.random() * 40) - 20;
    burst.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
    burstLayer.appendChild(burst);

    const parts = 10 + Math.floor(Math.random() * 6);
    for (let i = 0; i < parts; i++) {
      const p = document.createElement("span");
      p.className = "p";

      const angle = Math.random() * Math.PI * 2;
      const dist = 50 + Math.random() * 90;

      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;

      p.style.setProperty("--dx", `${dx}px`);
      p.style.setProperty("--dy", `${dy}px`);
      p.style.animationDelay = `${Math.random() * 120}ms`;

      burst.appendChild(p);
    }
  }

  setTimeout(clearBursts, 900);
}

function showResultScreen() {
  const stars = calcStars();

  if (resultScoreEl) resultScoreEl.textContent = String(score);
  if (resultBestEl) resultBestEl.textContent = String(best);
  if (resultMaxComboEl) resultMaxComboEl.textContent = `x${maxCombo}`;

  applyStageSettings();
  showStars(stars);

  if (stars > 0) burstStars(stars);

  if (startScreen) startScreen.style.display = "none";
  if (resultScreen) resultScreen.style.display = "flex";
}

// ---------- UI actions ----------
safeOn(restartBtn, "click", () => {
  stopAllLoops();
  isRunning = false;
  if (resultScreen) resultScreen.style.display = "none";
  if (startScreen) startScreen.style.display = "flex";
});

stageBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const s = Number(btn.dataset.stage);
    if (!Number.isNaN(s)) {
      stage = s;
      applyStageSettings();
    }
  });
});

safeOn(realStartBtn, "click", startStage);

safeOn(playAgainBtn, "click", () => {
  stopAllLoops();
  isRunning = false;
  if (resultScreen) resultScreen.style.display = "none";
  startStage();
});

safeOn(nextLevelBtn, "click", () => {
  stage = (stage >= 3) ? 1 : stage + 1;
  stopAllLoops();
  isRunning = false;
  if (resultScreen) resultScreen.style.display = "none";
  startStage();
});

// ---------- init ----------
(function init() {
  console.log("catch-cube.js loaded ✅");

  loadProfileStats();
  const { lastStageKey } = keysForUser();
  const savedStage = parseInt(localStorage.getItem(lastStageKey) || "1", 10);
  stage = [1, 2, 3].includes(savedStage) ? savedStage : 1;

  applyStageSettings();
  if (timeLeftEl) timeLeftEl.textContent = String(ROUND_SECONDS);
  if (scoreEl) scoreEl.textContent = "0";
  if (comboLabel) comboLabel.textContent = "x1";

  // להראות את מסך ההתחלה תמיד בהתחלה
  if (startScreen) startScreen.style.display = "flex";
  if (resultScreen) resultScreen.style.display = "none";
})();
