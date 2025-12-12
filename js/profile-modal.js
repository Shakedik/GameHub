/* js/profile-modal.js */

document.addEventListener("DOMContentLoaded", () => {
    const modalOverlay = document.getElementById("profileModal");
    const closeBtn = document.getElementById("closeProfileBtn");
    const openBtn = document.getElementById("profileBtn"); // הכפתור ב-header

    if (!openBtn || !modalOverlay) return;

    // פתיחת מודאל
    openBtn.addEventListener("click", () => {
        const user = UserStore.getCurrentUser();
        if (!user) {
            alert("לא נמצא משתמש מחובר");
            return;
        }

        // מילוי נתונים
        document.getElementById("p_user").textContent = user.username;
        document.getElementById("p_date").textContent = new Date(user.createdAt).toLocaleDateString("he-IL");
        document.getElementById("p_logins").textContent = user.visits || 1;
        document.getElementById("p_games").textContent = user.gamesPlayed || 0;
        document.getElementById("p_time").textContent = formatTime(user.totalPlayTime || 0);
        
        // נתונים חדשים
        document.getElementById("p_coins").textContent = user.coins || 0;
        document.getElementById("p_score").textContent = user.score || 0;

        // הצגה
        modalOverlay.classList.remove("hidden");
        // נותן זמן קצר כדי שה-transition של ה-CSS יעבוד
        setTimeout(() => modalOverlay.classList.add("open"), 10);
    });

    // סגירת מודאל
    function closeModal() {
        modalOverlay.classList.remove("open");
        setTimeout(() => modalOverlay.classList.add("hidden"), 300);
    }

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    
    // סגירה בלחיצה בחוץ
    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    // פונקציית עזר לזמן
    function formatTime(ms) {
        const totalSec = Math.floor(ms / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return `${min} דק' ${sec} שניות`;
    }
});