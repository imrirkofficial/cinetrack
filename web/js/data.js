// ═══════════════════════════════════════════════
// CineTrack — Data Layer (Indian Series + Storage)
// ═══════════════════════════════════════════════

const INDIAN_SERIES = [
  {id:"in1",  name:"Mirzapur",                          session:"S1", year:2018, genre:"Crime, Thriller, Action",              lang:"Hindi",        ott:"Amazon Prime",  watched:"",     episodes:9,  emoji:"🔪"},
  {id:"in2",  name:"Rangbaaz",                          session:"S1", year:2018, genre:"Action, Biography, Crime",             lang:"Hindi",        ott:"Zee5",          watched:"Done", episodes:10, emoji:"⚡"},
  {id:"in3",  name:"Delhi Crime",                       session:"S1", year:2019, genre:"Crime, Drama, Police",                 lang:"Hindi",        ott:"Netflix",       watched:"Done", episodes:7,  emoji:"🚔"},
  {id:"in4",  name:"Iru Dhuruvam",                      session:"S1", year:2019, genre:"Crime Thriller",                       lang:"Tamil",        ott:"SonyLIV",       watched:"Done", episodes:9,  emoji:"🕵️"},
  {id:"in5",  name:"Abhay",                             session:"S1", year:2019, genre:"Psychological, Crime, Thriller",       lang:"Hindi",        ott:"Zee5",          watched:"Done", episodes:6,  emoji:"🧠"},
  {id:"in6",  name:"Crackdown",                         session:"S1", year:2020, genre:"Spy Thriller",                         lang:"Hindi",        ott:"Voot",          watched:"Done", episodes:6,  emoji:"💥"},
  {id:"in7",  name:"Illegal - Justice Out of Order",    session:"S1", year:2020, genre:"Crime, Drama, Thriller",               lang:"Hindi",        ott:"Voot",          watched:"Done", episodes:9,  emoji:"⚖️"},
  {id:"in8",  name:"Asur",                              session:"S1", year:2020, genre:"Crime, Mystery, Thriller",             lang:"Hindi",        ott:"Voot",          watched:"Done", episodes:8,  emoji:"👁️"},
  {id:"in9",  name:"Abhay",                             session:"S2", year:2020, genre:"Psychological, Crime, Thriller",       lang:"Hindi",        ott:"Zee5",          watched:"1,2,3",episodes:8, emoji:"🧠"},
  {id:"in10", name:"Breathe: Into the Shadows",         session:"S1", year:2020, genre:"Crime, Drama, Thriller",               lang:"Hindi",        ott:"Amazon Prime",  watched:"Done", episodes:12, emoji:"😰"},
  {id:"in11", name:"Mirzapur",                          session:"S2", year:2020, genre:"Crime, Thriller, Action",              lang:"Hindi",        ott:"Amazon Prime",  watched:"Done", episodes:10, emoji:"🔪"},
  {id:"in12", name:"Undekhi",                           session:"S1", year:2020, genre:"Crime",                                lang:"Hindi",        ott:"SonyLIV",       watched:"",     episodes:10, emoji:"🎭"},
  {id:"in13", name:"Candy",                             session:"S1", year:2021, genre:"Crime, Thriller",                      lang:"Hindi",        ott:"Voot",          watched:"Done", episodes:8,  emoji:"🍬"},
  {id:"in14", name:"Delhi Crime",                       session:"S2", year:2022, genre:"Crime, Drama, Police",                 lang:"Hindi",        ott:"Netflix",       watched:"Done", episodes:6,  emoji:"🚔"},
  {id:"in15", name:"Undekhi",                           session:"S2", year:2022, genre:"Crime",                                lang:"Hindi",        ott:"SonyLIV",       watched:"1",    episodes:10, emoji:"🎭"},
  {id:"in16", name:"Farzi",                             session:"S1", year:2023, genre:"Crime, Drama, Thriller",               lang:"Hindi",        ott:"Amazon Prime",  watched:"Done", episodes:8,  emoji:"🎨"},
  {id:"in17", name:"IRU Dhruvam",                       session:"S2", year:2023, genre:"Crime Thriller",                       lang:"Tamil",        ott:"SonyLIV",       watched:"Done", episodes:9,  emoji:"🕵️"},
  {id:"in18", name:"Taj: Divided by Blood",             session:"S1", year:2023, genre:"Drama, Historical",                    lang:"Hindi",        ott:"Zee5",          watched:"Done", episodes:9,  emoji:"👑"},
  {id:"in19", name:"Rana Naidu",                        session:"S1", year:2023, genre:"Crime, Drama, Action",                 lang:"Hindi",        ott:"Netflix",       watched:"Done", episodes:8,  emoji:"💪"},
  {id:"in20", name:"Taj: Reign of Revenge",             session:"S2", year:2023, genre:"Drama, Historical",                    lang:"Hindi",        ott:"Zee5",          watched:"Done", episodes:9,  emoji:"⚔️"},
  {id:"in21", name:"Dahaad",                            session:"S1", year:2023, genre:"Crime, Drama, Mystery",                lang:"Hindi",        ott:"Amazon Prime",  watched:"Done", episodes:8,  emoji:"🌊"},
  {id:"in22", name:"Inspector Avinash",                 session:"S1", year:2023, genre:"Action, Crime, Thriller",              lang:"Hindi",        ott:"JioCinema",     watched:"Done", episodes:12, emoji:"🎖️"},
  {id:"in23", name:"Asur 2",                            session:"S2", year:2023, genre:"Crime, Mystery, Thriller",             lang:"Hindi",        ott:"JioCinema",     watched:"Done", episodes:8,  emoji:"👁️"},
  {id:"in24", name:"Shaitaan: A Criminal Mind",         session:"S1", year:2023, genre:"Action, Crime, Drama",                 lang:"Telugu",       ott:"aha",           watched:"Done", episodes:8,  emoji:"😈"},
  {id:"in25", name:"Kaalkoot",                          session:"S1", year:2023, genre:"Crime, Drama",                         lang:"Hindi",        ott:"JioCinema",     watched:"Done", episodes:8,  emoji:"🕰️"},
  {id:"in26", name:"Guns & Gulaabs",                    session:"S1", year:2023, genre:"Crime, Thriller, Comedy",              lang:"Hindi",        ott:"Netflix",       watched:"Done", episodes:8,  emoji:"🌹"},
  {id:"in27", name:"Bambai Meri Jaan",                  session:"S1", year:2023, genre:"Crime, Thriller",                      lang:"Hindi",        ott:"Amazon Prime",  watched:"Done", episodes:10, emoji:"🏙️"},
  {id:"in28", name:"Murder In Mahim",                   session:"S1", year:2024, genre:"Drama, Crime",                         lang:"Hindi",        ott:"JioCinema",     watched:"Done", episodes:7,  emoji:"🔍"},
  {id:"in29", name:"Brinda",                            session:"S1", year:2024, genre:"Crime",                                lang:"Telugu/Hindi", ott:"SonyLIV",       watched:"Done", episodes:8,  emoji:"🌺"},
  {id:"in30", name:"Shekhar Home",                      session:"S1", year:2024, genre:"Mystery, Thriller",                    lang:"Hindi",        ott:"",              watched:"1,2",  episodes:8,  emoji:"🏠"},
  {id:"in31", name:"Manorathangal",                     session:"S1", year:2024, genre:"Drama, Anthology",                     lang:"Malayalam",    ott:"Zee5",          watched:"1,2,3,4",episodes:8,emoji:"📖"},
  {id:"in32", name:"Mirzapur",                          session:"S3", year:2024, genre:"Action, Crime, Drama, Thriller",       lang:"Hindi",        ott:"Prime Video",   watched:"Done", episodes:10, emoji:"🔪"},
  {id:"in33", name:"Manvat Murders",                    session:"S1", year:2024, genre:"Crime, Drama, Mystery, Thriller",      lang:"Hindi/Marathi",ott:"SonyLIV",       watched:"Done", episodes:8,  emoji:"🔎"},
  {id:"in34", name:"Murshid",                           session:"S1", year:2024, genre:"Crime, Thriller",                      lang:"Hindi",        ott:"Zee5",          watched:"Done", episodes:8,  emoji:"🌙"},
  {id:"in35", name:"Gyaarah Gyaarah",                   session:"S1", year:2024, genre:"Drama, Fantasy",                       lang:"Hindi",        ott:"Zee5",          watched:"Done", episodes:8,  emoji:"✨"},
  {id:"in36", name:"Tribhuvan Mishra CA Topper",        session:"S1", year:2024, genre:"Comedy, Crime, Drama, Thriller",       lang:"Hindi",        ott:"Netflix",       watched:"1,2",  episodes:8,  emoji:"📊"},
  {id:"in37", name:"Undekhi",                           session:"S3", year:2024, genre:"Crime",                                lang:"Hindi",        ott:"SonyLIV",       watched:"",     episodes:10, emoji:"🎭"},
  {id:"in38", name:"Inspector Rishi",                   session:"S1", year:2024, genre:"Drama, Horror, Mystery",               lang:"Hindi/Tamil",  ott:"Prime Video",   watched:"Done", episodes:8,  emoji:"👻"},
  {id:"in39", name:"Pill",                              session:"S1", year:2024, genre:"Crime",                                lang:"Hindi",        ott:"JioCinema",     watched:"1,2,3",episodes:8,  emoji:"💊"},
  {id:"in40", name:"Aashram",                           session:"S3 P2",year:2025,genre:"Crime, Political, Mystery",           lang:"Hindi",        ott:"MX Player",     watched:"Done", episodes:10, emoji:"🏛️"},
  {id:"in41", name:"Paatal Lok",                        session:"S2", year:2025, genre:"Crime, Drama, Thriller",               lang:"Hindi",        ott:"Amazon Prime",  watched:"1,2",  episodes:8,  emoji:"⬇️"},
  {id:"in42", name:"Kerala Crime Files",                session:"S2", year:2025, genre:"Crime, Drama",                         lang:"Malayalam/Hindi",ott:"JioHotstar",  watched:"Done", episodes:6,  emoji:"🌴"},
  {id:"in43", name:"Regai",                             session:"S1", year:2025, genre:"Crime, Thriller, Police",              lang:"Tamil/Hindi",  ott:"ZEE5",          watched:"Done", episodes:8,  emoji:"🚨"},
  {id:"in44", name:"Kuttram Purindhavan",               session:"S1", year:2025, genre:"Crime, Thriller",                      lang:"Tamil/Hindi",  ott:"SonyLIV",       watched:"Done", episodes:8,  emoji:"⚖️"},
];

const OTT_COLORS = {
  "netflix":      "#e50914",
  "amazon prime": "#00a8e0",
  "prime video":  "#00a8e0",
  "jiocinema":    "#ff4d00",
  "jiohotstar":   "#1f80e0",
  "hotstar":      "#1f80e0",
  "zee5":         "#8b2be2",
  "sonyliv":      "#003087",
  "voot":         "#7b2d8b",
  "mx player":    "#00b7ff",
  "aha":          "#f5c700",
};

function getOttColor(ott) {
  if (!ott) return "#445566";
  const k = ott.toLowerCase().replace(/\s+/g, "");
  for (const [n, c] of Object.entries(OTT_COLORS)) {
    if (k.includes(n.replace(/\s+/g, ""))) return c;
  }
  return "#445566";
}

function getWatchStatus(watched) {
  if (!watched || watched.trim() === "") return "no";
  if (watched.toLowerCase() === "done") return "done";
  return "partial";
}

const STATUS_CONFIG = {
  done:    { label: "Watched",     color: "#00e87a", bg: "rgba(0,232,122,0.1)",    icon: "✓", cls: "badge-done" },
  partial: { label: "In Progress", color: "#ff6b45", bg: "rgba(232,71,42,0.1)",    icon: "◑", cls: "badge-watching" },
  watching:{ label: "Watching",    color: "#ff6b45", bg: "rgba(232,71,42,0.1)",    icon: "▶", cls: "badge-watching" },
  want:    { label: "Want to Watch",color: "#ffd166", bg: "rgba(255,209,102,0.1)", icon: "★", cls: "badge-want" },
  dropped: { label: "Dropped",     color: "#ff4060", bg: "rgba(255,64,96,0.08)",   icon: "✕", cls: "badge-dropped" },
  no:      { label: "Not Watched", color: "#445566", bg: "rgba(68,85,102,0.1)",    icon: "○", cls: "" },
};

// ── LOCAL STORAGE ─────────────────────────────────────────────────────────────
const DB = {
  get(key) {
    try { return JSON.parse(localStorage.getItem("ct_" + key)) || null; } catch { return null; }
  },
  set(key, val) {
    try { localStorage.setItem("ct_" + key, JSON.stringify(val)); } catch {}
  },
  del(key) { localStorage.removeItem("ct_" + key); },
};

// ── WATCHLIST ─────────────────────────────────────────────────────────────────
function getWatchlist() { return DB.get("watchlist") || {}; }
function saveWatchlist(wl) { DB.set("watchlist", wl); }

function addToWatchlist(item, status = "want") {
  const wl = getWatchlist();
  const userId = getCurrentUser()?.id;
  if (!userId) return;
  const key = userId + "_" + item.id;
  wl[key] = { ...item, status, progress: 0, addedAt: Date.now() };
  saveWatchlist(wl);
  updateWatchlistBadge();
}

function removeFromWatchlist(itemId) {
  const wl = getWatchlist();
  const userId = getCurrentUser()?.id;
  const key = userId + "_" + itemId;
  delete wl[key];
  saveWatchlist(wl);
  updateWatchlistBadge();
}

function getWatchlistEntry(itemId) {
  const wl = getWatchlist();
  const userId = getCurrentUser()?.id;
  if (!userId) return null;
  return wl[userId + "_" + itemId] || null;
}

function updateWatchlistStatus(itemId, status) {
  const wl = getWatchlist();
  const userId = getCurrentUser()?.id;
  const key = userId + "_" + itemId;
  if (wl[key]) { wl[key].status = status; saveWatchlist(wl); }
}

function getUserWatchlist() {
  const wl = getWatchlist();
  const userId = getCurrentUser()?.id;
  if (!userId) return [];
  return Object.values(wl).filter(e => String(e.id || e.tmdb_id || "").startsWith("") && wl[userId + "_" + (e.id || e.tmdb_id)]);
}

function getUserWatchlistAll() {
  const wl = getWatchlist();
  const userId = getCurrentUser()?.id;
  if (!userId) return [];
  const prefix = userId + "_";
  return Object.entries(wl).filter(([k]) => k.startsWith(prefix)).map(([, v]) => v);
}

function updateWatchlistBadge() {
  const count = getUserWatchlistAll().length;
  const el = document.getElementById("nav-badge-watchlist");
  if (el) { el.textContent = count; el.style.display = count > 0 ? "" : "none"; }
}

// ── REVIEWS ───────────────────────────────────────────────────────────────────
function getReviews() { return DB.get("reviews") || {}; }
function saveReviews(r) { DB.set("reviews", r); }

function addReview(itemId, rating, text) {
  const reviews = getReviews();
  const user = getCurrentUser();
  if (!reviews[itemId]) reviews[itemId] = [];
  reviews[itemId] = reviews[itemId].filter(r => r.userId !== user.id); // one per user
  reviews[itemId].push({
    userId: user.id, userName: user.name,
    rating, text, date: new Date().toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
  });
  saveReviews(reviews);
}

function getItemReviews(itemId) { return (getReviews()[itemId] || []); }
function getUserReview(itemId) {
  const user = getCurrentUser();
  if (!user) return null;
  return getItemReviews(itemId).find(r => r.userId === user.id) || null;
}

// ── INDIAN SERIES WATCH STATE ─────────────────────────────────────────────────
function getIndianWatchState() { return DB.get("indian_watch") || {}; }
function saveIndianWatchState(s) { DB.set("indian_watch", s); }

function setIndianWatch(id, watched) {
  const state = getIndianWatchState();
  state[id] = watched;
  saveIndianWatchState(state);
}

function getIndianWatch(id) {
  const state = getIndianWatchState();
  if (state[id] !== undefined) return state[id];
  const series = INDIAN_SERIES.find(s => s.id === id);
  return series ? series.watched : "";
}
