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
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("loginUser").value;
        const logged = loginUser(username);

        if (logged) {
            window.location.href = "pages/games.html";
        }
    });
}
