// טעינת משתמשים
function loadUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

// טעינת המשתמש הנוכחי
function loadCurrentUser() {
    const username = localStorage.getItem("currentUser");
    if (!username) return null;

    const users = loadUsers();
    return users.find(u => u.username === username);
}

// תצוגת זמן יפה
function formatTime(ms) {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min} דק' ${sec} שניות`;
}

//----- הפעלת המודאל -----
const modal = document.getElementById("profileModal");
const openBtn = document.getElementById("profileBtn");
const closeBtn = document.getElementById("closeModal");

openBtn.addEventListener("click", () => {
    const user = loadCurrentUser();
    if (!user) return;

    document.getElementById("p_username").innerText = user.username;
    document.getElementById("p_created").innerText = new Date(user.createdAt).toLocaleDateString("he-IL");
    document.getElementById("p_visits").innerText = user.visits;
    document.getElementById("p_gamesPlayed").innerText = user.gamesPlayed || 0;
    document.getElementById("p_totalPlayTime").innerText = formatTime(user.totalPlayTime || 0);

    const achList = document.getElementById("p_achievements");
    achList.innerHTML = "";

    if (user.achievements.length === 0) {
        achList.innerHTML = "<li>אין הישגים עדיין</li>";
    } else {
        user.achievements.forEach(a => {
            const li = document.createElement("li");
            li.innerText = a;
            achList.appendChild(li);
        });
    }

    modal.classList.remove("hidden");
});

closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
});

// סגירה בלחיצה על הרקע
modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
});
