// ═══════════════════════════════════════════════════════════════
// CineTrack — Extra Features
// Watch Time | Favourites | Notes | Share | Reminder | Theme | i18n
// ═══════════════════════════════════════════════════════════════

// ── LANGUAGE / i18n ───────────────────────────────────────────────────────────
const LANG_DATA = {
  en: {
    home:"Home", discover:"Discover", indian:"Indian Series", watchlist:"Watchlist",
    reviews:"Reviews", stats:"Stats", profile:"Profile",
    welcome:"Welcome back 👋", library:"In Library", completed:"Completed",
    watching:"Watching", added:"Added to", removed:"Removed from watchlist",
    addToList:"ADD TO WATCHLIST", rateReview:"RATE & REVIEW", allReviews:"ALL REVIEWS",
    submitReview:"Submit Review", updateReview:"Update Review",
    search:"Search movies, series...", noResults:"No results",
    logout:"Logout", trending:"Trending Now", continueWatching:"Continue Watching",
    watchTime:"Watch Time", favourites:"Favourites", notes:"Notes",
    share:"Share", reminder:"Set Reminder", top10:"My Top 10",
    totalTime:"Total Watch Time", avgPerDay:"Avg per Day", longestStreak:"Longest Streak",
    addNote:"Add a note...", saveNote:"Save Note", deleteNote:"Delete",
    favAdded:"Added to Favourites ❤️", favRemoved:"Removed from Favourites",
    reminderSet:"Reminder set!", print:"Print / Export PDF",
    theme:"Theme", language:"Language",
  },
  bn: {
    home:"হোম", discover:"আবিষ্কার", indian:"ভারতীয় সিরিজ", watchlist:"ওয়াচলিস্ট",
    reviews:"রিভিউ", stats:"পরিসংখ্যান", profile:"প্রোফাইল",
    welcome:"স্বাগতম 👋", library:"লাইব্রেরিতে", completed:"সম্পন্ন",
    watching:"দেখছি", added:"যোগ করা হয়েছে", removed:"ওয়াচলিস্ট থেকে মুছে ফেলা হয়েছে",
    addToList:"ওয়াচলিস্টে যোগ করুন", rateReview:"রেটিং ও রিভিউ", allReviews:"সব রিভিউ",
    submitReview:"রিভিউ জমা দিন", updateReview:"রিভিউ আপডেট করুন",
    search:"মুভি, সিরিজ খুঁজুন...", noResults:"কিছু পাওয়া যায়নি",
    logout:"লগআউট", trending:"এখন ট্রেন্ডিং", continueWatching:"দেখা চালিয়ে যান",
    watchTime:"দেখার সময়", favourites:"প্রিয়", notes:"নোট",
    share:"শেয়ার", reminder:"রিমাইন্ডার", top10:"আমার সেরা ১০",
    totalTime:"মোট দেখার সময়", avgPerDay:"দৈনিক গড়", longestStreak:"দীর্ঘতম ধারাবাহিক",
    addNote:"একটি নোট যোগ করুন...", saveNote:"নোট সংরক্ষণ", deleteNote:"মুছুন",
    favAdded:"প্রিয়তে যোগ হয়েছে ❤️", favRemoved:"প্রিয় থেকে সরানো হয়েছে",
    reminderSet:"রিমাইন্ডার সেট হয়েছে!", print:"প্রিন্ট / PDF এক্সপোর্ট",
    theme:"থিম", language:"ভাষা",
  },
};

let currentLang = DB.get("lang") || "en";
function t(key) { return (LANG_DATA[currentLang] || LANG_DATA.en)[key] || key; }

function setLang(lang) {
  currentLang = lang;
  DB.set("lang", lang);
  applyLang();
  renderPage(currentPage);
}

function applyLang() {
  document.querySelectorAll("[data-lang]").forEach(el => {
    const key = el.dataset.lang;
    if (key) el.textContent = t(key);
  });
}

// ── THEME ─────────────────────────────────────────────────────────────────────
let currentTheme = DB.get("theme") || "dark";

function setTheme(theme) {
  currentTheme = theme;
  DB.set("theme", theme);
  applyTheme();
}

function applyTheme() {
  const root = document.documentElement;
  if (currentTheme === "light") {
    root.style.setProperty("--bg",        "#f0f2f8");
    root.style.setProperty("--surface",   "#ffffff");
    root.style.setProperty("--surface2",  "#f4f6fc");
    root.style.setProperty("--surface3",  "#e8ecf6");
    root.style.setProperty("--border",    "#d8ddef");
    root.style.setProperty("--border2",   "#c4cce4");
    root.style.setProperty("--text",      "#1a2030");
    root.style.setProperty("--text2",     "#4a5680");
    root.style.setProperty("--text3",     "#8894b0");
  } else {
    root.style.setProperty("--bg",        "#07090f");
    root.style.setProperty("--surface",   "#0c0f1a");
    root.style.setProperty("--surface2",  "#111622");
    root.style.setProperty("--surface3",  "#161c2e");
    root.style.setProperty("--border",    "#1a2235");
    root.style.setProperty("--border2",   "#212d45");
    root.style.setProperty("--text",      "#dde4f2");
    root.style.setProperty("--text2",     "#5a7899");
    root.style.setProperty("--text3",     "#2d3f5a");
  }
  document.querySelectorAll(".theme-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.theme === currentTheme);
  });
}

// ── WATCH TIME TRACKER ────────────────────────────────────────────────────────
function getWatchTimeData() { return DB.get("watch_time") || {}; }
function saveWatchTimeData(d) { DB.set("watch_time", d); }

function logWatchTime(itemId, minutes) {
  const data  = getWatchTimeData();
  const today = new Date().toISOString().slice(0, 10);
  if (!data[today]) data[today] = {};
  data[today][itemId] = (data[today][itemId] || 0) + minutes;
  saveWatchTimeData(data);
}

function getTotalWatchMinutes() {
  const data = getWatchTimeData();
  return Object.values(data).reduce((sum, day) =>
    sum + Object.values(day).reduce((s, v) => s + v, 0), 0);
}

function getWatchTimeByDay() {
  const data = getWatchTimeData();
  return Object.entries(data)
    .map(([date, items]) => ({ date, total: Object.values(items).reduce((s,v)=>s+v,0) }))
    .sort((a,b)=>a.date.localeCompare(b.date))
    .slice(-30);
}

function getLongestStreak() {
  const data = getWatchTimeData();
  const days = Object.keys(data).sort();
  let max = 0, cur = 0, prev = null;
  days.forEach(d => {
    if (prev) {
      const diff = (new Date(d) - new Date(prev)) / 86400000;
      cur = diff === 1 ? cur + 1 : 1;
    } else cur = 1;
    max = Math.max(max, cur);
    prev = d;
  });
  return max;
}

function formatMinutes(min) {
  const h = Math.floor(min / 60), m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ── WATCH TIME LOG MODAL ──────────────────────────────────────────────────────
function openWatchTimeModal(itemId, itemTitle) {
  const overlay = document.getElementById("detail-overlay");
  const modal   = document.getElementById("detail-modal");
  overlay.classList.remove("hidden");

  modal.innerHTML = `
    <div style="padding:24px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
        <div style="font-size:16px;font-weight:800">⏱️ Log Watch Time</div>
        <button onclick="closeDetail()" style="background:rgba(255,255,255,0.06);border:none;color:var(--text2);width:32px;height:32px;border-radius:10px;cursor:pointer;font-size:14px">✕</button>
      </div>
      <div style="font-size:13px;color:var(--text2);margin-bottom:18px">${itemTitle}</div>
      <div style="margin-bottom:16px">
        <label style="font-size:10px;font-weight:800;color:var(--text3);letter-spacing:1px;display:block;margin-bottom:6px">MINUTES WATCHED</label>
        <input type="number" id="wt-min" class="form-input" value="30" min="1" max="300" placeholder="e.g. 45">
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:18px">
        ${[30,45,60,90].map(m=>`<button onclick="document.getElementById('wt-min').value=${m}" style="background:var(--surface2);border:1px solid var(--border2);border-radius:9px;padding:8px;color:var(--text2);font-family:inherit;font-size:12px;font-weight:700;cursor:pointer">${m}m</button>`).join("")}
      </div>
      <button onclick="submitWatchTime('${itemId}','${itemTitle}')" class="btn-primary">Log Time ⏱️</button>
    </div>
  `;
}

function submitWatchTime(itemId, itemTitle) {
  const min = parseInt(document.getElementById("wt-min")?.value) || 0;
  if (min < 1) { showNotif("Enter valid minutes", "err"); return; }
  logWatchTime(itemId, min);
  showNotif(`⏱️ +${min}min logged for ${itemTitle}`, "ok");
  closeDetail();
  if (currentPage === "stats") renderStats();
}

// ── FAVOURITES ────────────────────────────────────────────────────────────────
function getFavourites() { return DB.get("favourites") || {}; }
function saveFavourites(f) { DB.set("favourites", f); }

function toggleFavourite(itemId, item) {
  const favs = getFavourites();
  const userId = getCurrentUser()?.id;
  const key = (userId || "guest") + "_" + itemId;
  if (favs[key]) {
    delete favs[key];
    saveFavourites(favs);
    showNotif(t("favRemoved"), "info");
    return false;
  } else {
    favs[key] = { ...item, addedAt: Date.now() };
    saveFavourites(favs);
    showNotif(t("favAdded"), "ok");
    return true;
  }
}

function isFavourite(itemId) {
  const favs   = getFavourites();
  const userId = getCurrentUser()?.id;
  return !!favs[(userId || "guest") + "_" + itemId];
}

function getUserFavourites() {
  const favs   = getFavourites();
  const userId = getCurrentUser()?.id;
  const prefix = (userId || "guest") + "_";
  return Object.entries(favs)
    .filter(([k]) => k.startsWith(prefix))
    .map(([,v]) => v)
    .sort((a,b) => (b.addedAt||0) - (a.addedAt||0));
}

// ── NOTES ─────────────────────────────────────────────────────────────────────
function getNotes() { return DB.get("notes") || {}; }
function saveNotes(n) { DB.set("notes", n); }

function getItemNotes(itemId) {
  const userId = getCurrentUser()?.id || "guest";
  return (getNotes()[userId + "_" + itemId] || []);
}

function addNote(itemId, text) {
  const notes  = getNotes();
  const userId = getCurrentUser()?.id || "guest";
  const key    = userId + "_" + itemId;
  if (!notes[key]) notes[key] = [];
  notes[key].push({ id: Date.now(), text, date: new Date().toLocaleDateString("en-IN", { year:"numeric", month:"short", day:"numeric" }) });
  saveNotes(notes);
}

function deleteNote(itemId, noteId) {
  const notes  = getNotes();
  const userId = getCurrentUser()?.id || "guest";
  const key    = userId + "_" + itemId;
  if (notes[key]) notes[key] = notes[key].filter(n => n.id !== noteId);
  saveNotes(notes);
}

// ── REMINDERS ─────────────────────────────────────────────────────────────────
function getReminders() { return DB.get("reminders") || []; }
function saveReminders(r) { DB.set("reminders", r); }

function addReminder(itemId, itemTitle, dateStr) {
  const reminders = getReminders();
  reminders.push({ id: Date.now(), itemId, itemTitle, date: dateStr, notified: false });
  saveReminders(reminders);
  showNotif(t("reminderSet"), "ok");
}

function deleteReminder(id) {
  saveReminders(getReminders().filter(r => r.id !== id));
  if (currentPage === "stats") renderStats();
}

function checkReminders() {
  const today     = new Date().toISOString().slice(0, 10);
  const reminders = getReminders();
  let changed     = false;
  reminders.forEach(r => {
    if (!r.notified && r.date <= today) {
      showNotif(`⏰ Reminder: ${r.itemTitle}`, "info");
      r.notified = true;
      changed = true;
    }
  });
  if (changed) saveReminders(reminders);
}

// ── SHARE WATCHLIST ───────────────────────────────────────────────────────────
function generateShareLink() {
  const items = getUserWatchlistAll();
  const favs  = getUserFavourites();
  const payload = {
    user: getCurrentUser()?.name || "Anonymous",
    watchlist: items.map(i => ({ title: i.title, status: i.status, type: i.type, rating: i.vote_average })),
    favourites: favs.map(f => ({ title: f.title, type: f.type })),
    generated: new Date().toLocaleDateString("en-IN"),
  };
  const encoded = btoa(encodeURIComponent(JSON.stringify(payload)));
  const url = `${window.location.origin}${window.location.pathname}?share=${encoded}`;
  return url;
}

function copyShareLink() {
  const link = generateShareLink();
  if (navigator.clipboard) {
    navigator.clipboard.writeText(link).then(() => showNotif("🔗 Share link copied!", "ok"));
  } else {
    const ta = document.createElement("textarea");
    ta.value = link; document.body.appendChild(ta); ta.select();
    document.execCommand("copy"); document.body.removeChild(ta);
    showNotif("🔗 Share link copied!", "ok");
  }
}

function openShareModal() {
  const overlay = document.getElementById("detail-overlay");
  const modal   = document.getElementById("detail-modal");
  const items   = getUserWatchlistAll();
  const favs    = getUserFavourites();
  const link    = generateShareLink();

  overlay.classList.remove("hidden");
  modal.innerHTML = `
    <div style="padding:24px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
        <div style="font-size:16px;font-weight:800">🔗 Share Watchlist</div>
        <button onclick="closeDetail()" style="background:rgba(255,255,255,0.06);border:none;color:var(--text2);width:32px;height:32px;border-radius:10px;cursor:pointer;font-size:14px">✕</button>
      </div>
      <div style="background:var(--surface2);border:1px solid var(--border2);border-radius:11px;padding:12px;margin-bottom:14px;font-size:11px;color:var(--text2);word-break:break-all;font-family:monospace">
        ${link.slice(0,80)}...
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px">
        <div style="background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center">
          <div style="font-size:28px;font-weight:900;color:var(--blue)">${items.length}</div>
          <div style="font-size:10px;color:var(--text3);font-weight:700;margin-top:2px">TITLES</div>
        </div>
        <div style="background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center">
          <div style="font-size:28px;font-weight:900;color:var(--yellow)">${favs.length}</div>
          <div style="font-size:10px;color:var(--text3);font-weight:700;margin-top:2px">FAVOURITES</div>
        </div>
      </div>
      <button onclick="copyShareLink()" class="btn-primary" style="margin-bottom:10px">📋 Copy Link</button>
      <button onclick="printWatchlist()" class="btn-ghost">🖨️ ${t("print")}</button>
    </div>
  `;
}

// ── PRINT / PDF EXPORT ────────────────────────────────────────────────────────
function printWatchlist() {
  const items  = getUserWatchlistAll();
  const favs   = getUserFavourites();
  const indian = INDIAN_SERIES.map(s => ({
    ...s, watched: wsToDisplay ? wsToDisplay(getWatchStatus(getIndianWatch(s.id) ?? s.watched)) : s.watched
  }));
  const user   = getCurrentUser();

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>CineTrack — ${user?.name || "My"} Watchlist</title>
<style>
  body { font-family: Arial, sans-serif; background:#fff; color:#111; padding:24px; font-size:12px; }
  h1   { font-size:22px; margin-bottom:4px; } h2 { font-size:15px; margin:20px 0 8px; border-bottom:2px solid #e8472a; padding-bottom:4px; }
  table { width:100%; border-collapse:collapse; margin-bottom:16px; }
  th { background:#1a2436; color:#fff; padding:8px 10px; text-align:left; font-size:11px; }
  td { padding:7px 10px; border-bottom:1px solid #eee; }
  tr:nth-child(even) { background:#f9f9f9; }
  .done { color:#16a34a; font-weight:700; } .watching { color:#d97706; font-weight:700; }
  .pending { color:#6b7280; } .dropped { color:#dc2626; font-weight:700; }
  .badge { display:inline-block; padding:2px 8px; border-radius:4px; font-size:10px; font-weight:700; }
  @media print { body { padding:0; } }
</style></head><body>
  <h1>🎬 CineTrack — ${user?.name || "My"} Watchlist</h1>
  <p style="color:#666;margin-bottom:20px">Generated: ${new Date().toLocaleDateString("en-IN", { year:"numeric", month:"long", day:"numeric" })}</p>

  <h2>📚 My Watchlist (${items.length} titles)</h2>
  <table><thead><tr><th>#</th><th>Title</th><th>Type</th><th>Status</th><th>Rating</th></tr></thead>
  <tbody>${items.map((it,i)=>`<tr><td>${i+1}</td><td><b>${it.title}</b></td><td>${it.type}</td><td class="${it.status}">${it.status}</td><td>${it.vote_average||"—"}</td></tr>`).join("")}</tbody></table>

  <h2>❤️ Favourites (${favs.length})</h2>
  <table><thead><tr><th>#</th><th>Title</th><th>Type</th></tr></thead>
  <tbody>${favs.map((f,i)=>`<tr><td>${i+1}</td><td><b>${f.title}</b></td><td>${f.type}</td></tr>`).join("")}</tbody></table>

  <h2>🇮🇳 Indian Series (${indian.length})</h2>
  <table><thead><tr><th>#</th><th>Name</th><th>Session</th><th>OTT</th><th>Status</th></tr></thead>
  <tbody>${indian.map((s,i)=>`<tr><td>${i+1}</td><td><b>${s.name}</b></td><td>${s.session}</td><td>${s.ott||"—"}</td><td class="${(s.watched||"").toLowerCase()}">${s.watched||"Pending"}</td></tr>`).join("")}</tbody></table>
</body></html>`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 500);
}

// ── RENDER FAVOURITES PAGE ────────────────────────────────────────────────────
function renderFavourites() {
  const el   = document.getElementById("page-favourites");
  if (!el)   return;
  const favs = getUserFavourites();

  el.innerHTML = `
    <h2 style="font-size:22px;font-weight:900;margin-bottom:6px">❤️ <span style="color:var(--accent2)">Favourites</span></h2>
    <p style="font-size:12px;color:var(--text3);margin-bottom:20px">${favs.length} titles in your favourites</p>
    ${favs.length === 0 ? `<div class="empty"><div class="empty-icon">❤️</div><div class="empty-title">No favourites yet</div><div class="empty-sub">Tap ❤️ on any title to add it here</div></div>` : `
      <div class="grid-2">${favs.map(item => mediaCardHTML(item)).join("")}</div>`}
  `;
}

// ── RENDER NOTES SECTION (inside detail modal) ────────────────────────────────
function notesHTML(itemId) {
  const notes = getItemNotes(itemId);
  return `
    <div class="dm-section" style="margin-top:20px">${t("notes").toUpperCase()}</div>
    <textarea class="review-input" id="note-input" placeholder="${t("addNote")}" rows="2" style="margin-bottom:8px"></textarea>
    <button onclick="submitNote('${itemId}')" style="background:var(--surface2);border:1px solid var(--border2);color:var(--text2);font-family:inherit;font-size:12px;font-weight:700;padding:8px 18px;border-radius:9px;cursor:pointer;margin-bottom:14px">
      💾 ${t("saveNote")}
    </button>
    <div id="notes-list">
      ${notes.length === 0 ? `<p style="color:var(--text3);font-size:12px">No notes yet.</p>` :
        notes.map(n => `
          <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:11px 13px;margin-bottom:8px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
              <span style="font-size:10px;color:var(--text3)">${n.date}</span>
              <button onclick="removeNote('${itemId}',${n.id})" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:12px" title="Delete">✕</button>
            </div>
            <div style="font-size:13px;color:var(--text2);line-height:1.5">${n.text}</div>
          </div>`).join("")}
    </div>
  `;
}

function submitNote(itemId) {
  const input = document.getElementById("note-input");
  const text  = input?.value.trim();
  if (!text) { showNotif("Note cannot be empty", "err"); return; }
  addNote(itemId, text);
  if (input) input.value = "";
  const list = document.getElementById("notes-list");
  if (list) {
    const notes = getItemNotes(itemId);
    list.innerHTML = notes.map(n => `
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:11px 13px;margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
          <span style="font-size:10px;color:var(--text3)">${n.date}</span>
          <button onclick="removeNote('${itemId}',${n.id})" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:12px">✕</button>
        </div>
        <div style="font-size:13px;color:var(--text2);line-height:1.5">${n.text}</div>
      </div>`).join("");
  }
  showNotif("Note saved 📝", "ok");
}

function removeNote(itemId, noteId) {
  deleteNote(itemId, noteId);
  const list  = document.getElementById("notes-list");
  const notes = getItemNotes(itemId);
  if (list) {
    list.innerHTML = notes.length === 0
      ? `<p style="color:var(--text3);font-size:12px">No notes yet.</p>`
      : notes.map(n => `
          <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:11px 13px;margin-bottom:8px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
              <span style="font-size:10px;color:var(--text3)">${n.date}</span>
              <button onclick="removeNote('${itemId}',${n.id})" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:12px">✕</button>
            </div>
            <div style="font-size:13px;color:var(--text2);line-height:1.5">${n.text}</div>
          </div>`).join("");
  }
}

// ── REMINDER MODAL ────────────────────────────────────────────────────────────
function openReminderModal(itemId, itemTitle) {
  const overlay = document.getElementById("detail-overlay");
  const modal   = document.getElementById("detail-modal");
  const reminders = getReminders().filter(r => r.itemId === itemId);
  overlay.classList.remove("hidden");

  modal.innerHTML = `
    <div style="padding:24px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
        <div style="font-size:16px;font-weight:800">⏰ Set Reminder</div>
        <button onclick="closeDetail()" style="background:rgba(255,255,255,0.06);border:none;color:var(--text2);width:32px;height:32px;border-radius:10px;cursor:pointer;font-size:14px">✕</button>
      </div>
      <div style="font-size:13px;color:var(--text2);margin-bottom:16px">${itemTitle}</div>
      <div style="margin-bottom:14px">
        <label style="font-size:10px;font-weight:800;color:var(--text3);letter-spacing:1px;display:block;margin-bottom:6px">REMINDER DATE</label>
        <input type="date" id="rem-date" class="form-input" min="${new Date().toISOString().slice(0,10)}">
      </div>
      <button onclick="saveReminder('${itemId}','${itemTitle.replace(/'/g,"\\'")}'" class="btn-primary" style="margin-bottom:14px">⏰ Set Reminder</button>
      ${reminders.length > 0 ? `
        <div style="font-size:10px;font-weight:800;color:var(--text3);letter-spacing:1.5px;margin-bottom:8px">EXISTING REMINDERS</div>
        ${reminders.map(r => `
          <div style="display:flex;justify-content:space-between;align-items:center;background:var(--surface2);border:1px solid var(--border);border-radius:9px;padding:9px 12px;margin-bottom:6px">
            <span style="font-size:12px;color:var(--text2)">📅 ${r.date}</span>
            <button onclick="deleteReminder(${r.id});openReminderModal('${itemId}','${itemTitle.replace(/'/g,"\\'")}'" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:13px">✕</button>
          </div>`).join("")}` : ""}
    </div>
  `;
}

function saveReminder(itemId, itemTitle) {
  const date = document.getElementById("rem-date")?.value;
  if (!date) { showNotif("Please pick a date", "err"); return; }
  addReminder(itemId, itemTitle, date);
  closeDetail();
}

// ── INIT EXTRA FEATURES ───────────────────────────────────────────────────────
function initExtraFeatures() {
  applyTheme();
  applyLang();
  checkReminders();
  // Check reminders every 60s
  setInterval(checkReminders, 60000);
}
