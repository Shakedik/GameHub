/* js/trivia.js - קובץ מלא עם תיקון לכפתור התחל */

// --- מאגר השאלות ---
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

const level4 = [
    { text: 'מהי היבשת הגדולה ביותר בעולם?', answers: ['אפריקה', 'אירופה', 'אסיה', 'אמריקה הצפונית'], correct: 2 },
    { text: 'איזה כוכב לכת הוא הקרוב ביותר לשמש?', answers: ['נוגה', 'מאדים', 'כדור הארץ', 'חמה (מרקורי)'], correct: 3 },
    { text: 'כמה שניות יש בדקה וחצי?', answers: ['60', '90', '100', '120'], correct: 1 },
    { text: 'מי צייר את המונה ליזה?', answers: ['ואן גוך', 'פיקאסו', 'לאונרדו דה וינצ\'י', 'מיכלאנג\'לו'], correct: 2 },
    { text: 'מהו החומר הקשה ביותר בטבע?', answers: ['ברזל', 'יהלום', 'זהב', 'פלדה'], correct: 1 }
];

const level5 = [
    { text: 'באיזו שנה הוקמה מדינת ישראל?', answers: ['1947', '1948', '1956', '1967'], correct: 1 },
    { text: 'מהו האיבר הגדול ביותר בגוף האדם?', answers: ['המוח', 'הכבד', 'העור', 'הלב'], correct: 2 },
    { text: 'מי היה ראש הממשלה הראשון של ישראל?', answers: ['מנחם בגין', 'יצחק רבין', 'דוד בן גוריון', 'שמעון פרס'], correct: 2 },
    { text: 'כמה ימים יש בשנה מעוברת?', answers: ['365', '366', '360', '354'], correct: 1 },
    { text: 'מהי בירת ברזיל?', answers: ['ריו דה ז\'ניירו', 'סאו פאולו', 'ברזיליה', 'בואנוס איירס'], correct: 2 }
];

const allLevels = [level1, level2, level3, level4, level5]; 

// --- משתני ניהול משחק ---
let currentLevelIndex = 0; 
let questions = allLevels[0];
let currentQIndex = 0;
let score = 0;
let correctCount = 0;
let timerInterval;
let timeLeft = 15;
const MAX_TIME = 15;

const COSTS = { SKIP: 6, FIFTY: 5, TIME: 3 };
let lifelines = { skip: 1, fifty: 1, time: 1 };

// אלמנטים
const timerText = document.getElementById('timerText');
const progressRing = document.getElementById('progressRing');
const questionText = document.getElementById('questionText');
const answerBtns = document.querySelectorAll('.answer-btn');
const qCurrent = document.getElementById('qCurrent');
const stageIndicator = document.getElementById('stageNumber');

const RADIUS = 30;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

document.addEventListener('DOMContentLoaded', () => {
    // 1. קודם כל מפעילים את הכפתור כדי שלא ייתקע
    const startBtn = document.getElementById('realStartBtn');
    if(startBtn) {
        startBtn.addEventListener('click', () => {
            document.getElementById('startScreen').classList.add('fade-out');
            document.querySelector('.game-container').classList.remove('blur-bg');
            loadQuestion(); 
        });
    }

    // 2. בדיקה באיזה שלב להתחיל
    const urlParams = new URLSearchParams(window.location.search);
    const levelParam = urlParams.get('level');

    if (levelParam) {
        // בחירה ידנית מהמפה
        const levelIndex = parseInt(levelParam) - 1;
        if (levelIndex >= 0 && levelIndex < allLevels.length) {
            currentLevelIndex = levelIndex;
        }
    } else {
        // כניסה אוטומטית (ברירת מחדל: השלב המקסימלי שנפתח)
        if (typeof UserStore !== 'undefined') {
            try {
                // משתמשים ב-getUserLevel (דרגה מקסימלית) כדי לא לאפס
                const maxLevel = UserStore.getUserLevel(); 
                
                if (maxLevel > allLevels.length) {
                    // אם סיים את כל המשחק - מתחיל מ-1
                    currentLevelIndex = 0;
                } else {
                    // מתחיל בשלב הכי גבוה שפתוח
                    currentLevelIndex = maxLevel - 1;
                }
            } catch (e) {
                console.error("Error accessing UserStore:", e);
                currentLevelIndex = 0; // ברירת מחדל במקרה תקלה
            }
        }
    }

    // טעינת השאלות
    questions = allLevels[currentLevelIndex];

    if(progressRing) {
        progressRing.style.strokeDasharray = `${CIRCUMFERENCE} ${CIRCUMFERENCE}`;
        progressRing.style.strokeDashoffset = 0;
    }
    
    updateCoinsDisplay();

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
        if(user) document.getElementById('coinsCount').innerText = user.coins || 0;
    }
}

function loadQuestion() {
    clearInterval(timerInterval);
    if(stageIndicator) stageIndicator.innerText = currentLevelIndex + 1;

    answerBtns.forEach(btn => {
        btn.className = 'answer-btn';
        btn.disabled = false;
        btn.style.visibility = 'visible';
        btn.onclick = (e) => checkAnswer(e, Array.from(answerBtns).indexOf(e.target));
    });

    const q = questions[currentQIndex];
    questionText.innerText = q.text;
    qCurrent.innerText = currentQIndex + 1;
    
    answerBtns.forEach((btn, idx) => {
        if (q.answers[idx]) {
            btn.innerText = q.answers[idx];
            btn.style.display = 'block'; 
        } else {
            btn.style.display = 'none'; 
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
            handleWrongAnswer(-1); 
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
        score += 20 + timeLeft; 
        correctCount++; 
    } else {
        if(selectedIdx !== -1) e.target.classList.add('wrong');
        if(answerBtns[correctIdx]) answerBtns[correctIdx].classList.add('correct');
    }

    answerBtns.forEach(btn => btn.disabled = true);
    setTimeout(handleNextStep, 1500);
}

function handleWrongAnswer(idx) {
    const correctIdx = questions[currentQIndex].correct;
    if(answerBtns[correctIdx]) answerBtns[correctIdx].classList.add('correct');
    answerBtns.forEach(btn => btn.disabled = true);
    setTimeout(handleNextStep, 1500);
}

function handleNextStep() {
    currentQIndex++;
    if (currentQIndex >= questions.length) {
        handleGameOver();
    } else {
        loadQuestion();
    }
}

function useSkip() {
    if (lifelines.skip > 0 && UserStore.spendCoinsFromCurrent(COSTS.SKIP)) {
        updateCoinsDisplay();
        lifelines.skip--;
        document.getElementById('skipCount').innerText = lifelines.skip;
        document.querySelector('#skipBtn .lifeline-btn').disabled = true;
        handleNextStep();
    }
}

function useFifty() {
    if (lifelines.fifty > 0 && UserStore.spendCoinsFromCurrent(COSTS.FIFTY)) {
        updateCoinsDisplay();
        lifelines.fifty--;
        document.getElementById('fiftyCount').innerText = lifelines.fifty;
        document.querySelector('#fiftyBtn .lifeline-btn').disabled = true;

        const correct = questions[currentQIndex].correct;
        let hiddenCount = 0;
        answerBtns.forEach((btn, i) => {
            if (i !== correct && hiddenCount < 2 && btn.style.display !== 'none') {
                if (Math.random() > 0.3 || hiddenCount === 0) {
                    btn.style.visibility = 'hidden';
                    hiddenCount++;
                }
            }
        });
    }
}

function useTime() {
    if (lifelines.time > 0 && UserStore.spendCoinsFromCurrent(COSTS.TIME)) {
        updateCoinsDisplay();
        lifelines.time--;
        document.getElementById('timeCount').innerText = lifelines.time;
        document.querySelector('#timeBtn .lifeline-btn').disabled = true;
        timeLeft = Math.min(timeLeft + 10, MAX_TIME);
        updateTimerUI(timeLeft);
    }
}

function handleGameOver() {
    if (typeof timerInterval !== 'undefined') clearInterval(timerInterval);

    const totalQuestions = questions.length;
    const successRate = (correctCount / totalQuestions) * 100;
    const isWin = successRate > 50;

    const modal = document.getElementById('gameResultModal');
    const title = document.getElementById('resultTitle');
    const message = document.getElementById('resultMessage');
    const actionBtn = document.getElementById('modalActionBtn');

    if (!modal || !title || !actionBtn) return;

    if (isWin) {
        title.innerText = "שלב הושלם! 🏆";
        title.style.color = "#4cd137"; 
        message.innerText = `צברת ${correctCount} כוכבים!`;
        
        if (typeof UserStore !== 'undefined') {
            UserStore.saveLevelProgress(currentLevelIndex + 1, correctCount);
            UserStore.updateGameStats(score);
            UserStore.recordTriviaResult(true, score, 10);
        }

        actionBtn.innerText = "למפת השלבים 🗺️";
        actionBtn.onclick = function() { window.location.href = "levels.html"; };

    } else {
        title.innerText = "נכשלת בשלב... 😕";
        title.style.color = "#e84118"; 
        message.innerText = `צריך מעל 50% כדי לעבור.\nענית נכון על ${correctCount} מתוך ${totalQuestions}.`;

        if (typeof UserStore !== 'undefined') {
             // שמירת הנתונים כך שהמפה תדע שנכשלת בשלב הספציפי,
             // אבל users.js דואג שהדרגה המקסימלית לא תיפגע
             UserStore.saveLevelProgress(currentLevelIndex + 1, correctCount);
             UserStore.recordTriviaResult(false, 0, 0);
        }

        actionBtn.innerText = "חזור למפה 🗺️";
        actionBtn.onclick = function() { window.location.href = "levels.html"; };
    }

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}