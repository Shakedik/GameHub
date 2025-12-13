/* js/users.js - ניהול מרכזי של משתמשים ונתונים - מעודכן */

const UserStore = {
    loadUsers: function() {
        return JSON.parse(localStorage.getItem("users")) || [];
    },

    saveUsers: function(users) {
        localStorage.setItem("users", JSON.stringify(users));
    },

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

    // --- פונקציה חדשה שהוספנו ---
    updateGameStats: function(timePlayedMs) {
        const user = this.getCurrentUser();
        if (!user) return;

        // עדכון מונה המשחקים
        const newGamesPlayed = (user.gamesPlayed || 0) + 1;
        // עדכון הזמן הכולל (במילי-שניות)
        const newTotalTime = (user.totalPlayTime || 0) + timePlayedMs;

        this.updateCurrentUser({
            gamesPlayed: newGamesPlayed,
            totalPlayTime: newTotalTime
        });
    },
    // ---------------------------

    logActivity: function(description) {
        const user = this.getCurrentUser();
        if (!user) return;
        
        const newActivity = {
            date: new Date().toLocaleString("he-IL"),
            desc: description
        };

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

        this.updateCurrentUser({
            score: newScore,
            coins: newCoins,
            triviaWins: newWins,
            triviaLosses: newLosses
        });

        const status = isWin ? "ניצחון" : "הפסד";
        this.logActivity(`${status} בטריוויה: ${scoreChange > 0 ? '+' : ''}${scoreChange} נק'`);
    },

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