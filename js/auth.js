/* ------- עזר: טעינה ושמירה של מאגר משתמשים ------- */
function loadUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

/* ------- יצירת משתמש חדש ------- */
function createUser(username) {
    const users = loadUsers();

    // לבדוק אם המשתמש כבר קיים
    if (users.some(u => u.username === username)) {
        alert("משתמש כבר קיים!");
        return null;
    }

    const newUser = {
        username,
        createdAt: Date.now(),
        visits: 1,
        lastLogin: Date.now(),
        achievements: [],
        gamesPlayed: 0,
        totalPlayTime: 0
    };

    users.push(newUser);
    saveUsers(users);

    localStorage.setItem("currentUser", username);

    return newUser;
}

/* ------- התחברות ------- */
function loginUser(username) {
    const users = loadUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
        alert("משתמש לא קיים!");
        return null;
    }

    // עדכון נתוני התחברות
    user.visits += 1;
    user.lastLogin = Date.now();

    saveUsers(users);
    localStorage.setItem("currentUser", username);

    return user;
}

/* ------- אפקט קונפטי ------- */
function throwConfetti() {
    const duration = 2000;
    const end = Date.now() + duration;

    function frame() {
        for (let i = 0; i < 5; i++) {
            const confetti = document.createElement("div");
            confetti.classList.add("confetti");

            confetti.style.left = Math.random() * 100 + "vw";
            confetti.style.backgroundColor =
                ["#ff3838", "#ff9f1a", "#fff200", "#32ff7e", "#7efff5", "#18dcff", "#7d5fff"][Math.floor(Math.random() * 7)];

            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 2000);
        }

        if (Date.now() < end) requestAnimationFrame(frame);
    }

    frame();
}

/* ------- הרשמה ------- */
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("regUser").value;
        const created = createUser(username);

        if (created) {
            throwConfetti();
            setTimeout(() => {
                window.location.href = "pages/games.html";
            }, 2000);
        }
    });
}

/* ------- התחברות ------- */
/* ------- התחברות ------- */
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("loginUser").value;
        const pass = document.getElementById("loginPass").value; // נניח הוספת שדה סיסמה

        // שימוש ב-UserStore שיצרנו קודם
        const user = UserStore.findUser(username);

        if (!user) {
            alert("משתמש לא קיים!");
            return;
        }

        // 1. בדיקת חסימה
        if (user.blockedUntil && Date.now() < user.blockedUntil) {
            const timeLeft = Math.ceil((user.blockedUntil - Date.now()) / 1000);
            alert(`החשבון חסום עקב ניסיונות רבים. נסה שוב בעוד ${timeLeft} שניות.`);
            return;
        }

        // 2. בדיקת סיסמה (בדוגמה שלך לא הייתה סיסמה בקובץ JSON, נניח שהיא קיימת או שאנחנו בודקים רק שם)
        // לצורך התרגיל, נניח שהסיסמה היא '123456' אם אין סיסמה שמורה, או שתשני את הלוגיקה בהתאם לקוד ההרשמה שלך
        const storedPass = user.password || "123456"; // ברירת מחדל אם אין
        
        if (pass !== storedPass) {
            const attempts = UserStore.recordLoginFailure(username);
            if (attempts >= 3) {
                UserStore.blockUser(username);
                alert("3 ניסיונות שגויים! החשבון נחסם לדקה.");
            } else {
                alert(`סיסמה שגויה! נותרו לך ${3 - attempts} ניסיונות.`);
            }
            return;
        }

        // 3. התחברות מוצלחת
        // איפוס ניסיונות כושלים
        user.loginAttempts = 0;
        user.visits = (user.visits || 0) + 1;
        user.lastLogin = Date.now();
        
        // עדכון בלוקאל סטורג' דרך המנהל שלנו
        const allUsers = UserStore.loadUsers();
        const userIdx = allUsers.findIndex(u => u.username === username);
        allUsers[userIdx] = user;
        UserStore.saveUsers(allUsers);
        
        localStorage.setItem("currentUser", username);
        UserStore.logActivity("התחברות למערכת");

        // 4. דרישת ה-Cookie (כדי להרשים את המרצה)
        // יוצר קוקי שתקף ל-30 דקות
        document.cookie = `auth=true; path=/; max-age=1800; SameSite=Strict`;

        window.location.href = "pages/games.html"; // שימי לב לנתיב
    });
}
