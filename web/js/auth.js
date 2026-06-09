// ═══════════════════════════════════════════════
// CineTrack — Auth System
// ═══════════════════════════════════════════════

function getUsers() { return DB.get("users") || {}; }
function saveUsers(u) { DB.set("users", u); }
function getCurrentUser() { return DB.get("current_user"); }
function saveCurrentUser(u) { DB.set("current_user", u); }

function showAuthTab(tab) {
  document.getElementById("login-form").classList.toggle("hidden", tab !== "login");
  document.getElementById("signup-form").classList.toggle("hidden", tab !== "signup");
  document.getElementById("tab-login").classList.toggle("active", tab === "login");
  document.getElementById("tab-signup").classList.toggle("active", tab === "signup");
}

function handleLogin() {
  const email = document.getElementById("login-email").value.trim();
  const pass  = document.getElementById("login-pass").value;
  const err   = document.getElementById("login-err");
  err.classList.add("hidden");

  if (!email || !pass) { showErr(err, "Please fill in all fields"); return; }
  const users = getUsers();
  const user = Object.values(users).find(u => u.email === email && u.password === pass);
  if (!user) { showErr(err, "Invalid email or password"); return; }

  saveCurrentUser(user);
  enterApp();
}

function handleSignup() {
  const name  = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const pass  = document.getElementById("signup-pass").value;
  const err   = document.getElementById("signup-err");
  err.classList.add("hidden");

  if (!name || !email || !pass) { showErr(err, "Please fill in all fields"); return; }
  if (pass.length < 6) { showErr(err, "Password must be at least 6 characters"); return; }
  if (!email.includes("@")) { showErr(err, "Please enter a valid email"); return; }

  const users = getUsers();
  if (Object.values(users).find(u => u.email === email)) {
    showErr(err, "This email is already registered"); return;
  }

  const id = "u_" + Date.now();
  const user = { id, name, email, password: pass, joinDate: new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long" }) };
  users[id] = user;
  saveUsers(users);
  saveCurrentUser(user);
  enterApp();
}

function handleDemo() {
  const users = getUsers();
  let demo = Object.values(users).find(u => u.email === "demo@cinetrack.app");
  if (!demo) {
    const id = "u_demo";
    demo = { id, name: "Demo User", email: "demo@cinetrack.app", password: "demo123", joinDate: "May 2026" };
    users[id] = demo;
    saveUsers(users);
    // seed some demo watchlist
    const wl = getWatchlist();
    [
      { id:"tt1375666", title:"Inception", type:"movie", poster_path:null, vote_average:8.8, release_date:"2010", emoji:"🌀", status:"done" },
      { id:"tt0944947", title:"Game of Thrones", type:"series", poster_path:null, vote_average:9.3, release_date:"2011", emoji:"🐉", status:"watching" },
    ].forEach(item => { wl[id + "_" + item.id] = { ...item, progress: 0, addedAt: Date.now() }; });
    saveWatchlist(wl);
  }
  saveCurrentUser(demo);
  enterApp();
}

function handleLogout() {
  DB.del("current_user");
  document.getElementById("main-app").classList.add("hidden");
  document.getElementById("auth-screen").classList.remove("hidden");
  document.getElementById("user-menu").classList.add("hidden");
  showAuthTab("login");
  document.getElementById("login-email").value = "";
  document.getElementById("login-pass").value = "";
}

function showErr(el, msg) {
  el.textContent = msg;
  el.classList.remove("hidden");
}

function enterApp() {
  document.getElementById("auth-screen").classList.add("hidden");
  document.getElementById("main-app").classList.remove("hidden");
  const user = getCurrentUser();
  const initial = (user.name || "U")[0].toUpperCase();
  document.getElementById("user-avatar").textContent = initial;
  document.getElementById("menu-username").textContent = user.name;
  document.getElementById("menu-email").textContent = user.email;
  updateWatchlistBadge();
  initExtraFeatures();
  showPage("home");
}

function toggleUserMenu() {
  document.getElementById("user-menu").classList.toggle("hidden");
}

document.addEventListener("click", (e) => {
  const menu = document.getElementById("user-menu");
  const avatar = document.getElementById("user-avatar");
  if (!menu || !avatar) return;
  if (!menu.contains(e.target) && !avatar.contains(e.target)) {
    menu.classList.add("hidden");
  }
});
