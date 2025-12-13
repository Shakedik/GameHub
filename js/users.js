/* js/users.js - גרסה סופית ומתוקנת */

const UserStore = {
    // --- טעינה ושמירה ---
    loadUsers: function() {
        return JSON.parse(localStorage.getItem("users")) || [];
    },

    saveUsers: function(users) {
        localStorage.setItem("users", JSON.stringify(users));
    },

    // --- ניהול משתמש נוכחי ---
    getCurrentUser: function() {
        const username = localStorage.getItem("currentUser");
        if (!username) return null;
        const users = this.loadUsers();
        return users.find(u => u.username === username);
    },

    updateCurrentUser: function(updates) {
        const username = localStorage.getItem("currentUser");
        if (!username) return false;

        const users = this.loadUsers();
        const index = users.findIndex(u => u.username === username);
        
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            this.saveUsers(users);
            return true;
        }
        return false;
    },

    // --- סטטיסטיקות ---
    updateGameStats: function(timePlayedMs) {
        const user = this.getCurrentUser();
        if (!user) return;
        const newGamesPlayed = (user.gamesPlayed || 0) + 1;
        const newTotalTime = (user.totalPlayTime || 0) + timePlayedMs;
        this.updateCurrentUser({ gamesPlayed: newGamesPlayed, totalPlayTime: newTotalTime });
    },

    logActivity: function(description) {
        const user = this.getCurrentUser();
        if (!user) return;
        const newActivity = { date: new Date().toLocaleString("he-IL"), desc: description };
        let activities = user.activity || [];
        activities.unshift(newActivity); 
        if (activities.length > 10) activities.pop();
        this.updateCurrentUser({ activity: activities });
    },

    spendCoinsFromCurrent: function(amount) {
        const user = this.getCurrentUser();
        if (!user) return false;
        if ((user.coins || 0) < amount) {
            alert("אין לך מספיק מטבעות! 💰");
            return false;
        }
        this.updateCurrentUser({ coins: user.coins - amount });
        return true;
    },

    recordTriviaResult: function(isWin, scoreChange, coinsReward) {
        const user = this.getCurrentUser();
        if (!user) return;
        const newScore = (user.score || 0) + scoreChange;
        const newCoins = (user.coins || 0) + coinsReward;
        const newWins = isWin ? (user.triviaWins || 0) + 1 : (user.triviaWins || 0);
        const newLosses = !isWin ? (user.triviaLosses || 0) + 1 : (user.triviaLosses || 0);
        this.updateCurrentUser({ score: newScore, coins: newCoins, triviaWins: newWins, triviaLosses: newLosses });
        
        const status = isWin ? "ניצחון" : "הפסד";
        this.logActivity(`${status} בטריוויה: ${scoreChange > 0 ? '+' : ''}${scoreChange} נק'`);
    },

    // --- שמירת התקדמות חכמה (שומרת על הדרגה הגבוהה) ---
    saveLevelProgress: function(levelNum, starsCount) {
        const user = this.getCurrentUser();
        if (!user) return;

        let progress = user.levelProgress || {}; 
        // מעדכנים את הכוכבים של השלב הנוכחי (כדי שהמפה תראה אם נכשלת בו ספציפית)
        progress[levelNum] = starsCount;

        // חישוב הדרגה המקסימלית (Max Level) - עולה רק אם הצלחנו, לא יורדת לעולם
        let currentMaxLevel = parseInt(user.level) || 1;
        
        // אם עברנו בהצלחה (3 כוכבים ומעלה) את השלב שהיינו תקועים בו
        if (starsCount >= 3 && levelNum === currentMaxLevel) {
            if (currentMaxLevel < 6) { // 5 שלבים מקסימום
                currentMaxLevel++;
            }
        }
        
        this.updateCurrentUser({ 
            levelProgress: progress,
            level: currentMaxLevel
        });
    },

    // --- פונקציה לחישוב השלב ה"בעייתי" למפה ---
    // מחזירה את השלב הראשון שבו יש פחות מ-3 כוכבים (או את הבא בתור)
    getRealLevel: function() {
        const user = this.getCurrentUser();
        if (!user) return 1;
        
        const progress = user.levelProgress || {};
        // בודקים שלבים 1 עד 5. הראשון שאין בו 3 כוכבים הוא ה"אמיתי" לעיצוב המפה
        for (let i = 1; i <= 5; i++) {
             if ((progress[i] || 0) < 3) return i;
        }
        return 6; // הכל הושלם
    },

    // --- קבלת הדרגה המקסימלית (מה שפותח את המנעולים) ---
    getUserLevel: function() {
        const user = this.getCurrentUser();
        return user ? (parseInt(user.level) || 1) : 1;
    },

    // --- התחברות ---
    logout: function() {
        localStorage.removeItem("currentUser");
        document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "../index.html"; 
    },

    findUser: function(username) {
        const users = this.loadUsers();
        return users.find(u => u.username === username);
    },

    blockUser: function(username) {
        const users = this.loadUsers();
        const user = users.find(u => u.username === username);
        if (user) {
            user.blockedUntil = Date.now() + (60 * 1000); 
            user.loginAttempts = 0; 
            this.saveUsers(users);
        }
    },
    
    recordLoginFailure: function(username) {
        const users = this.loadUsers();
        const user = users.find(u => u.username === username);
        if (user) {
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            this.saveUsers(users);
            return user.loginAttempts;
        }
        return 0;
    }
};