/* js/profile-modal.js */

document.addEventListener("DOMContentLoaded", () => {
    const modalOverlay = document.getElementById("profileModal");
    const closeBtn = document.getElementById("closeProfileBtn");
    const openBtn = document.getElementById("profileBtn");

    if (!openBtn || !modalOverlay) return;

    // --- פתיחת המודאל ---
    openBtn.addEventListener("click", () => {
        let user = null;
        
        // שליפת המשתמש דרך UserStore הקיים ב-users.js
        if (typeof UserStore !== "undefined") {
            user = UserStore.getCurrentUser();
        }

        // אם אין משתמש מחובר - ניצור משתמש דמה לצורך התצוגה והבדיקה
        if (!user) {
            console.log("לא נמצא משתמש מחובר, מציג דמה.");
            user = {
                username: "אורח",
                createdAt: Date.now(),
                loginAttempts: 1, // שונה מ-visits כדי להתאים למבנה ב-users.js
                gamesPlayed: 0,
                totalPlayTime: 0,
                coins: 0,
                score: 0
            };
        }

        // מילוי הנתונים באלמנטים (לפי ה-IDs בקובץ games.html)
        setText("p_user", user.username);
        setText("p_date", formatDate(user.createdAt || Date.now()));
        
        // ב-users.js לפעמים קוראים לזה loginAttempts ולפעמים visits, נבדוק את שניהם
        const visits = user.visits || user.loginAttempts || 1;
        setText("p_logins", visits);
        
        setText("p_games", user.gamesPlayed || 0);
        setText("p_time", formatTime(user.totalPlayTime || 0));
        setText("p_coins", user.coins || 0);
        setText("p_score", user.score || 0);

        // הצגת המודאל וקלאס לפתיחה חלקה (אם מוגדר ב-CSS)
        modalOverlay.classList.remove("hidden");
        modalOverlay.classList.add("open");
    });

    // --- סגירת המודאל ---
    function closeModal() {
        modalOverlay.classList.add("hidden");
        modalOverlay.classList.remove("open");
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }
    
    // סגירה בלחיצה על הרקע
    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    // --- פונקציות עזר ---
    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    function formatDate(timestamp) {
        if (!timestamp) return "לא ידוע";
        return new Date(timestamp).toLocaleDateString("he-IL");
    }

    function formatTime(ms) {
        if (!ms) return "0 דק'";
        const totalSec = Math.floor(ms / 1000);
        const min = Math.floor(totalSec / 60);
        // אם רוצים גם שעות:
        const hours = Math.floor(min / 60);
        const remainingMin = min % 60;
        
        if (hours > 0) return `${hours} שעות ו-${remainingMin} דק'`;
        return `${min} דק'`;
    }
});