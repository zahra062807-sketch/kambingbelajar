// --- DATA INITIALIZATION ---
let user = localStorage.getItem("user") || "";
let points = parseInt(localStorage.getItem("points")) || 0;
// Sekarang menyimpan objek: [{username: "admin", password: "123"}, ...]
let registeredUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];

// Update UI saat halaman dimuat
window.onload = function() {
    if(document.getElementById("points")) {
        document.getElementById("points").innerText = points;
    }
    if(document.getElementById("displayUser")) {
        document.getElementById("displayUser").innerText = user || "Pelajar";
    }
    if(document.getElementById("leaderboardList")) {
        renderLeaderboard();
    }
};

// --- FITUR DAFTAR (SIGN UP) ---
function handleRegister() {
    let username = document.getElementById("regUser").value.trim();
    let password = document.getElementById("regPass").value.trim();
    let status = document.getElementById("regStatus");

    if (!username || !password) return alert("Nama dan Password tidak boleh kosong!");

    // Cek apakah username sudah ada
    let userExists = registeredUsers.some(u => u.username === username);

    if (userExists) {
        status.innerText = "Nama sudah terdaftar!";
        status.style.color = "red";
    } else {
        // Simpan sebagai objek
        registeredUsers.push({ username: username, password: password });
        localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));
        
        status.innerText = "Berhasil daftar! Silakan login.";
        status.style.color = "green";
        
        document.getElementById("regUser").value = "";
        document.getElementById("regPass").value = "";
        
        setTimeout(() => {
            if (typeof toggleAuth === "function") toggleAuth();
        }, 1500);
    }
}

// --- FITUR MASUK (LOGIN) ---
function handleLogin() {
    let username = document.getElementById("loginUser").value.trim();
    let password = document.getElementById("loginPass").value.trim();
    let status = document.getElementById("loginStatus");

    // Cari user yang username DAN password-nya cocok
    let foundUser = registeredUsers.find(u => u.username === username && u.password === password);

    if (foundUser) {
        user = username;
        localStorage.setItem("user", user);
        
        status.innerText = "Berhasil masuk! Mengalihkan...";
        status.style.color = "green";

        updateLeaderboard();

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);
    } else {
        status.innerText = "Username atau Password salah!";
        status.style.color = "red";
    }
}

// --- FITUR AI TUTOR ---
async function askAI() {
    let questionInput = document.getElementById("question");
    let question = questionInput.value;
    let answerDisplay = document.getElementById("answer");

    if(!user) { 
        alert("Login dulu yuk untuk tanya AI!"); 
        window.location.href = "auth.html";
        return; 
    }
    
    if(!question) return alert("Tanya sesuatu dulu ya!");

    answerDisplay.innerText = "Sedang berpikir...";

    try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer API_KEY_KAMU", // Ganti dengan API Key milikmu
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: question }]
            })
        });

        const data = await res.json();
        const answer = data.choices[0].message.content;
        answerDisplay.innerText = answer;

        // Tambah poin setelah berhasil bertanya
        points += 10;
        localStorage.setItem("points", points);
        if(document.getElementById("points")) {
            document.getElementById("points").innerText = points;
        }
        
        updateLeaderboard();
    } catch (err) {
        answerDisplay.innerText = "Gagal terhubung ke AI. Pastikan API Key benar.";
        console.error(err);
    }
}

// --- FITUR LEADERBOARD ---
function updateLeaderboard() {
    if (!user) return; // Jangan update jika belum login

    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    let existing = leaderboard.find(u => u.name === user);

    if (existing) {
        existing.points = points;
    } else {
        leaderboard.push({ name: user, points: points });
    }
    
    // Urutkan dari poin tertinggi
    leaderboard.sort((a, b) => b.points - a.points);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
    
    if(document.getElementById("leaderboardList")) {
        renderLeaderboard();
    }
}

function renderLeaderboard() {
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    let list = document.getElementById("leaderboardList");
    if(!list) return;
    
    list.innerHTML = "";
    leaderboard.forEach((u, i) => {
        let li = document.createElement("li");
        li.style.padding = "8px";
        li.style.borderBottom = "1px solid #eee";
        li.innerText = `${i+1}. ${u.name} - ${u.points} poin`;
        list.appendChild(li);
    });
}