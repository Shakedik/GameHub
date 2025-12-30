/* js/auth.js */

// --- פונקציה להפעלת הקונפטי ---
function startConfetti() {
    const container = document.getElementById("confetti-wrapper");
    if (!container) return; 

    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    
    for (let i = 0; i < 100; i++) {
        const piece = document.createElement('div');
        piece.classList.add('confetti-piece'); 
        
        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        const duration = Math.random() * 2 + 2; 
        piece.style.animationDuration = duration + 's'; 
        piece.style.animationDelay = Math.random() * 1 + 's';
        
        container.appendChild(piece);
    }
}

// --- לוגיקת הרשמה ---
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const fullName = document.getElementById("regFullName").value;
        const username = document.getElementById("regUser").value;
        const email = document.getElementById("regMail").value;
        const password = document.getElementById("regPass").value;

        let users = JSON.parse(localStorage.getItem("users")) || [];
        
        if (users.some(u => u.username === username)) {
            alert("שם המשתמש תפוס!");
            return;
        }

        const newUser = {
            username: username,
            password: password,
            fullName: fullName,
            email: email,
            createdAt: Date.now(),
            visits: 1,
            coins: 100, 
            score: 0,
            gamesPlayed: 0
        };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", username); 

        // --- הפעלת קונפטי ומעבר ---
        startConfetti();
        
        setTimeout(() => {
            window.location.href = "pages/games.html"; 
        }, 2000); 
    });
}

// --- לוגיקת התחברות ---
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("loginUser").value;
        const pass = document.getElementById("loginPass").value;

        let users = JSON.parse(localStorage.getItem("users")) || [];
        const user = users.find(u => u.username === username);

        if (user && user.password === pass) {
            
            user.visits = (user.visits || 0) + 1;
            user.lastLogin = Date.now();
            
            const index = users.findIndex(u => u.username === username);
            users[index] = user;
            localStorage.setItem("users", JSON.stringify(users));
            localStorage.setItem("currentUser", username);

            // --- הפעלת קונפטי ומעבר ---
            startConfetti();

            setTimeout(() => {
                // *** כאן התיקון: הוספנו את התיקייה pages ***
                window.location.href = "pages/games.html"; 
            }, 2000); 

        } else {
            alert("שם משתמש או סיסמה שגויים");
        }
    });
}