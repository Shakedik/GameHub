/* js/leaderboard.js - לוגיקת טבלת מובילים */

document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.getElementById("lbBody");
    const users = UserStore.loadUsers();

    // מיון לפי ניקוד (מהגבוה לנמוך)
    users.sort((a, b) => (b.score || 0) - (a.score || 0));

    // ניקוי הטבלה לפני מילוי
    tbody.innerHTML = "";

    if (users.length === 0) {
        tbody.innerHTML = "<tr><td colspan='4'>אין עדיין שחקנים... היה הראשון!</td></tr>";
        return;
    }

    // הצגת 10 המובילים
    users.slice(0, 10).forEach((u, index) => {
        const tr = document.createElement("tr");
        
        // סימון מקום ראשון
        let medal = "";
        if (index === 0) medal = "👑";
        if (index === 1) medal = "🥈";
        if (index === 2) medal = "🥉";

        tr.innerHTML = `
            <td>#${index + 1}</td>
            <td>${u.username} ${medal}</td>
            <td>${u.score || 0}</td>
            <td>${u.triviaWins || 0}</td>
        `;
        
        // הדגשת המשתמש הנוכחי
        const currentUser = UserStore.getCurrentUser();
        if (currentUser && u.username === currentUser.username) {
            tr.style.backgroundColor = "#e3f2fd";
            tr.style.fontWeight = "bold";
        }

        tbody.appendChild(tr);
    });
});