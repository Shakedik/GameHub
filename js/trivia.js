/* js/trivia.js */

const questions = [
    { text: 'מה שם תרופת הדגל של חברת "טבע"?', answers: ['חיסון הקורונה', 'אזילקט', 'טיסברי', 'קופקסון'], correct: 3 },
    { text: 'מהו טייפון?', answers: ['מאכל נורבגי', 'מכשיר חשמלי', 'סופה טרופית', 'תקליט'], correct: 2 },
    { text: 'איזה צבע מתקבל מערבוב של כחול וצהוב?', answers: ['ירוק', 'סגול', 'כתום', 'חום'], correct: 0 },
    { text: 'מי כתב את "התקווה"?', answers: ['ביאליק', 'הרצל', 'נפתלי הרץ אימבר', 'אריק איינשטיין'], correct: 2 },
    { text: 'כמה רגליים יש לעכביש?', answers: ['4', '6', '8', '10'], correct: 2 }
];

let currentQIndex = 0;
let score = 0;
let timerInterval;
let timeLeft = 15;
const MAX_TIME = 15;

// מחירים
const COSTS = {
    SKIP: 6,
    FIFTY: 5,
    TIME: 3
};

let lifelines = { skip: 1, fifty: 1, time: 1 };

// אלמנטים
const timerText = document.getElementById('timerText');
const progressRing = document.getElementById('progressRing');
const questionText = document.getElementById('questionText');
const answerBtns = document.querySelectorAll('.answer-btn');
const qCurrent = document.getElementById('qCurrent');

const RADIUS = 30;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

document.addEventListener('DOMContentLoaded', () => {
    // אתחול טבעת טיימר
    progressRing.style.strokeDasharray = `${CIRCUMFERENCE} ${CIRCUMFERENCE}`;
    progressRing.style.strokeDashoffset = 0;
    
    updateCoinsDisplay();

    // כפתור התחלה במסך נחיתה
    document.getElementById('realStartBtn').addEventListener('click', () => {
        document.getElementById('startScreen').classList.add('fade-out');
        document.querySelector('.game-container').classList.remove('blur-bg');
        loadQuestion(); // רק עכשיו טוענים את השאלה
    });

    // כפתורי עזרה
    document.getElementById('skipBtn').onclick = useSkip;
    document.getElementById('fiftyBtn').onclick = useFifty;
    document.getElementById('timeBtn').onclick = useTime;
});

function updateCoinsDisplay() {
    const user = UserStore.getCurrentUser();
    if(user) {
        document.getElementById('coinsCount').innerText = user.coins || 0;
    }
}

function loadQuestion() {
    clearInterval(timerInterval);
    
    if (currentQIndex >= questions.length) {
        endGame();
        return;
    }

    answerBtns.forEach(btn => {
        btn.className = 'answer-btn';
        btn.disabled = false;
        btn.style.visibility = 'visible';
        // ניקוי אירועי קליק ישנים
        btn.onclick = (e) => checkAnswer(e, Array.from(answerBtns).indexOf(e.target));
    });

    const q = questions[currentQIndex];
    questionText.innerText = q.text;
    qCurrent.innerText = currentQIndex + 1;
    
    answerBtns.forEach((btn, idx) => {
        btn.innerText = q.answers[idx];
    });

    timeLeft = MAX_TIME;
    startTimer();
}

function startTimer() {
    updateTimerUI(timeLeft);
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerUI(timeLeft);
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleWrongAnswer(-1); // זמן עבר
        }
    }, 1000);
}

function updateTimerUI(time) {
    timerText.innerText = time;
    const offset = CIRCUMFERENCE - (time / MAX_TIME) * CIRCUMFERENCE;
    progressRing.style.strokeDashoffset = offset;
    progressRing.style.stroke = time <= 5 ? '#ff0000' : '#ff0055';
}

function checkAnswer(e, selectedIdx) {
    clearInterval(timerInterval);
    const correctIdx = questions[currentQIndex].correct;
    
    if (selectedIdx === correctIdx) {
        e.target.classList.add('correct');
        score += 20; 
    } else {
        if(selectedIdx !== -1) e.target.classList.add('wrong');
        answerBtns[correctIdx].classList.add('correct');
    }

    answerBtns.forEach(btn => btn.disabled = true);

    setTimeout(() => {
        currentQIndex++;
        loadQuestion();
    }, 1500);
}

function handleWrongAnswer(idx) {
    const correctIdx = questions[currentQIndex].correct;
    answerBtns[correctIdx].classList.add('correct');
    answerBtns.forEach(btn => btn.disabled = true);
    setTimeout(() => {
        currentQIndex++;
        loadQuestion();
    }, 1500);
}

// --- Lifelines Logic (עם הורדת מטבעות) ---

function useSkip() {
    if (lifelines.skip > 0) {
        // ניסיון לשלם
        if (UserStore.spendCoinsFromCurrent(COSTS.SKIP)) {
            // תשלום הצליח
            updateCoinsDisplay(); // עדכון UI מיידי
            lifelines.skip--;
            document.getElementById('skipCount').innerText = lifelines.skip;
            document.querySelector('#skipBtn .lifeline-btn').disabled = true;
            
            // ביצוע הפעולה
            currentQIndex++;
            loadQuestion();
        }
    }
}

function useFifty() {
    if (lifelines.fifty > 0) {
        if (UserStore.spendCoinsFromCurrent(COSTS.FIFTY)) {
            updateCoinsDisplay();
            lifelines.fifty--;
            document.getElementById('fiftyCount').innerText = lifelines.fifty;
            document.querySelector('#fiftyBtn .lifeline-btn').disabled = true;

            const correct = questions[currentQIndex].correct;
            let hiddenCount = 0;
            for (let i = 0; i < 4; i++) {
                if (i !== correct && hiddenCount < 2) {
                    if (Math.random() > 0.3 || hiddenCount === 0) {
                        answerBtns[i].style.visibility = 'hidden';
                        hiddenCount++;
                    }
                }
            }
        }
    }
}

function useTime() {
    if (lifelines.time > 0) {
        if (UserStore.spendCoinsFromCurrent(COSTS.TIME)) {
            updateCoinsDisplay();
            lifelines.time--;
            document.getElementById('timeCount').innerText = lifelines.time;
            document.querySelector('#timeBtn .lifeline-btn').disabled = true;
            
            timeLeft = Math.min(timeLeft + 10, MAX_TIME);
            updateTimerUI(timeLeft);
        }
    }
}

function endGame() {
    const passed = score >= 60; // צריך 60 במשחק כדי לעבור
    const coinsReward = passed ? 5 : 0; // 5 מטבעות לניצחון
    
    // חישוב הנקודות לדירוג לפי הדרישה החדשה
    // ניצחון = 100 נקודות, הפסד = מינוס 35 נקודות
    const rankPoints = passed ? 100 : -35;
    
    // שליחת העדכון ל"מוח" של המערכת
    UserStore.recordTriviaResult(passed, rankPoints, coinsReward);
    
    // עדכון התצוגה במודאל סיום המשחק
    const modal = document.getElementById('resultModal');
    document.getElementById('resTitle').innerText = passed ? "ניצחון! 🏆" : "הפסדת... 😞";
    
    // כאן נציג למשתמש כמה נקודות דירוג הוא קיבל/איבד
    const pointsMsg = passed ? `+${rankPoints} נקודות לדירוג!` : `${rankPoints} נקודות מהדירוג.`;
    document.getElementById('resScore').innerText = `ניקוד במשחק: ${score} | ${pointsMsg}`;
    
    modal.classList.remove('hidden');
}