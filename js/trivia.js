/* js/trivia.js */

// --- מאגר השאלות מחולק לשלבים ---

const level1 = [
    { text: 'מה שם תרופת הדגל של חברת "טבע"?', answers: ['חיסון הקורונה', 'אזילקט', 'טיסברי', 'קופקסון'], correct: 3 },
    { text: 'מהו טייפון?', answers: ['מאכל נורבגי', 'מכשיר חשמלי', 'סופה טרופית', 'תקליט'], correct: 2 },
    { text: 'איזה צבע מתקבל מערבוב של כחול וצהוב?', answers: ['ירוק', 'סגול', 'כתום', 'חום'], correct: 0 },
    { text: 'מי כתב את "התקווה"?', answers: ['ביאליק', 'הרצל', 'נפתלי הרץ אימבר', 'אריק איינשטיין'], correct: 2 },
    { text: 'כמה רגליים יש לעכביש?', answers: ['4', '6', '8', '10'], correct: 2 }
];

const level2 = [
    { text: 'באיזו שנה הפציצה יפן את פרל הארבור?', answers: ['1952', '1939', '1941', '1947'], correct: 2 },
    { text: 'השחקן צ\'ארלי שין (2 גברים וחצי) אובחן כנשא HIV', answers: ['נכון', 'לא נכון'], correct: 0 },
    { text: 'על אישה ביישנית נוכל לומר באנגלית שהיא...', answers: ['SENSIBLE', 'SENSITIVE', 'SLY', 'SHY'], correct: 3 },
    { text: 'איך נקרא מקצועו של הלבורנט בעברית?', answers: ['מעדנון', 'נסיין', 'מעבדן', 'נסיוני'], correct: 2 },
    { text: 'הימורים באינטרנט אינם חוקיים בישראל', answers: ['נכון', 'לא נכון'], correct: 0 }
];

const level3 = [
    { text: 'מה הפירוש של: גֵז', answers: ['פעולת הגזיזה של הצמר', 'גנדרני, מתלבש בהידור', 'ההיפך הוא הנכון', 'ניקה מאבק'], correct: 0 },
    { text: 'מה הפירוש של: אָרְכָה לוֹ הַשָּׁעָה', answers: ['בזעם וברוגז', 'הזמן נדמה בעיניו כנצח', 'ריכל', 'תלש, שלף'], correct: 1 },
    { text: 'מה הפירוש של: זָרָה מֶלַח עַל הַפְּצָעִים', answers: ['הוסיף על צערו', 'דברים שליליים', 'שלם', 'אסון, צרה'], correct: 0 },
    { text: 'מקור המאכל חצ\'אפורי?', answers: ['גיאורגיה', 'מרוקו', 'כורדיסטן', 'פרס'], correct: 0 },
    { text: 'השיר "דימיון חופשי" בוצע במקור על ידי:', answers: ['בעז שרעבי', 'רות דולורס וייס', 'יצחק קלפטר', 'שלום גד'], correct: 2 }
];

const allLevels = [level1, level2, level3]; // מערך שמחזיק את כל השלבים

// --- משתני ניהול משחק ---
let currentLevelIndex = 0; // מתחילים משלב 0 (שלב 1)
let questions = allLevels[0]; // השאלות הנוכחיות הן של שלב 1
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
const stageIndicator = document.getElementById('stageNumber'); // ודאי שיש לך אלמנט כזה ב-HTML

// אלמנטים למעבר שלב
const transitionScreen = document.getElementById('levelTransition');
const levelTitle = document.getElementById('levelTitle');

const RADIUS = 30;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

document.addEventListener('DOMContentLoaded', () => {
    // אתחול טבעת טיימר
    if(progressRing) {
        progressRing.style.strokeDasharray = `${CIRCUMFERENCE} ${CIRCUMFERENCE}`;
        progressRing.style.strokeDashoffset = 0;
    }
    
    updateCoinsDisplay();

    // כפתור התחלה במסך נחיתה
    const startBtn = document.getElementById('realStartBtn');
    if(startBtn) {
        startBtn.addEventListener('click', () => {
            document.getElementById('startScreen').classList.add('fade-out');
            document.querySelector('.game-container').classList.remove('blur-bg');
            loadQuestion(); 
        });
    }

    // כפתורי עזרה
    const skipBtn = document.getElementById('skipBtn');
    if(skipBtn) skipBtn.onclick = useSkip;
    
    const fiftyBtn = document.getElementById('fiftyBtn');
    if(fiftyBtn) fiftyBtn.onclick = useFifty;
    
    const timeBtn = document.getElementById('timeBtn');
    if(timeBtn) timeBtn.onclick = useTime;
});

function updateCoinsDisplay() {
    if (typeof UserStore !== 'undefined') {
        const user = UserStore.getCurrentUser();
        if(user) {
            document.getElementById('coinsCount').innerText = user.coins || 0;
        }
    }
}

function loadQuestion() {
    clearInterval(timerInterval);
    
    // עדכון תצוגת מספר שלב
    if(stageIndicator) stageIndicator.innerText = currentLevelIndex + 1;

    // איפוס כפתורים
    answerBtns.forEach(btn => {
        btn.className = 'answer-btn';
        btn.disabled = false;
        btn.style.visibility = 'visible';
        // ניקוי אירועי קליק ישנים ויצירה מחדש
        btn.onclick = (e) => checkAnswer(e, Array.from(answerBtns).indexOf(e.target));
    });

    // הסתרת כפתורים מיותרים (אם יש שאלות כן/לא עם 2 תשובות בלבד)
    const q = questions[currentQIndex];
    
    questionText.innerText = q.text;
    qCurrent.innerText = currentQIndex + 1;
    
    answerBtns.forEach((btn, idx) => {
        if (q.answers[idx]) {
            btn.innerText = q.answers[idx];
            btn.style.display = 'block'; // מציג אם יש תשובה
        } else {
            btn.style.display = 'none'; // מסתיר אם אין (למשל בשאלות נכון/לא נכון)
        }
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
    if(timerText) timerText.innerText = time;
    if(progressRing) {
        const offset = CIRCUMFERENCE - (time / MAX_TIME) * CIRCUMFERENCE;
        progressRing.style.strokeDashoffset = offset;
        progressRing.style.stroke = time <= 5 ? '#ff0000' : '#ff0055';
    }
}

function checkAnswer(e, selectedIdx) {
    clearInterval(timerInterval);
    const correctIdx = questions[currentQIndex].correct;
    
    if (selectedIdx === correctIdx) {
        e.target.classList.add('correct');
        score += 20 + timeLeft; // ניקוד: 20 + זמן שנותר
    } else {
        if(selectedIdx !== -1) e.target.classList.add('wrong');
        
        // מציאת הכפתור הנכון (גם אם חלק מוסתרים)
        // שים לב: זה עובד לפי האינדקס המקורי של הכפתורים ב-DOM
        if(answerBtns[correctIdx]) answerBtns[correctIdx].classList.add('correct');
    }

    answerBtns.forEach(btn => btn.disabled = true);

    // המתנה ומעבר לשלב הבא
    setTimeout(handleNextStep, 1500);
}

function handleWrongAnswer(idx) {
    const correctIdx = questions[currentQIndex].correct;
    if(answerBtns[correctIdx]) answerBtns[correctIdx].classList.add('correct');
    answerBtns.forEach(btn => btn.disabled = true);
    
    setTimeout(handleNextStep, 1500);
}

// --- פונקציה חדשה לניהול מעבר בין שאלות ושלבים ---
function handleNextStep() {
    currentQIndex++;

    // בדיקה האם נגמרו השאלות בשלב הנוכחי
    if (currentQIndex >= questions.length) {
        
        // בדיקה האם יש שלב הבא
        if (currentLevelIndex + 1 < allLevels.length) {
            // מעבר שלב!
            currentLevelIndex++;
            questions = allLevels[currentLevelIndex]; // טעינת השאלות של השלב הבא
            currentQIndex = 0; // איפוס אינדקס שאלות
            
            // הפעלת אנימציית מעבר
            showLevelTransition();
        } else {
            // נגמרו כל השלבים
            endGame();
        }
    } else {
        // טעינת השאלה הבאה באותו שלב
        loadQuestion();
    }
}

function showLevelTransition() {
    if (levelTitle) levelTitle.innerText = `שלב ${currentLevelIndex + 1}!`;
    if (transitionScreen) {
        transitionScreen.classList.remove('hidden');
        
        // המתנה של 2 שניות ואז התחלת השלב הבא
        setTimeout(() => {
            transitionScreen.classList.add('hidden');
            loadQuestion();
        }, 2000);
    } else {
        // גיבוי למקרה שאין מסך מעבר
        loadQuestion();
    }
}

// --- Lifelines Logic ---

function useSkip() {
    if (lifelines.skip > 0) {
        if (UserStore.spendCoinsFromCurrent(COSTS.SKIP)) {
            updateCoinsDisplay();
            lifelines.skip--;
            document.getElementById('skipCount').innerText = lifelines.skip;
            document.querySelector('#skipBtn .lifeline-btn').disabled = true;
            
            // דילוג משתמש בפונקציית הצעד הבא
            handleNextStep();
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
            
            // לוגיקה מעודכנת להסתרה (מתחשבת בזה שיש שאלות עם 2 תשובות)
            // סופרים כמה כפתורים גלויים כרגע
            let visibleButtonsIndices = [];
            answerBtns.forEach((btn, i) => {
                if(btn.style.display !== 'none') visibleButtonsIndices.push(i);
            });

            // אם יש רק 2 תשובות (נכון/לא נכון), 50:50 לא אמור לעשות כלום או להשאיר רק את הנכון
            if (visibleButtonsIndices.length <= 2) {
                 // במקרה הזה נשאיר רק את הנכון - "מתנה"
                 answerBtns.forEach((btn, i) => {
                     if (i !== correct) btn.style.visibility = 'hidden';
                 });
                 return;
            }

            // הסתרה של 2 תשובות שגויות
            for (let i = 0; i < 4; i++) {
                if (i !== correct && hiddenCount < 2 && answerBtns[i].style.display !== 'none') {
                    if (Math.random() > 0.3 || hiddenCount === 0) { // רנדומליות קלה
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
    const passed = score >= 150; // העליתי את הרף כי יש יותר שאלות
    const coinsReward = passed ? 15 : 2; // תגמול מוגדל
    
    const rankPoints = passed ? 100 : -35;
    
    if (typeof UserStore !== 'undefined') {
        UserStore.recordTriviaResult(passed, rankPoints, coinsReward);
    }
    
    const modal = document.getElementById('resultModal');
    if (modal) {
        document.getElementById('resTitle').innerText = passed ? "ניצחון אדיר! 🏆" : "המשחק נגמר...";
        const pointsMsg = passed ? `+${rankPoints} נקודות לדירוג!` : `${rankPoints} נקודות מהדירוג.`;
        document.getElementById('resScore').innerText = `ניקוד סופי: ${score} | ${pointsMsg}`;
        modal.classList.remove('hidden');
    }
}