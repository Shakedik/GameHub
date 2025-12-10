document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const user = document.getElementById("loginUser").value;

    // בהמשך נוסיף בדיקות אמיתיות
    localStorage.setItem("currentUser", user);

    window.location.href = "pages/games.html";
});
