// ═══════════════════════════════════════════════
// CineTrack — App Init + Detail Modal + Search
// ═══════════════════════════════════════════════

// ── INIT ─────────────────────────────────────────────────────────────────────
window.addEventListener("load", () => {
  setTimeout(() => {
    const user = getCurrentUser();
    if (user) {
      enterApp();
    } else {
      document.getElementById("auth-screen").classList.remove("hidden");
    }
  }, 2100);
});

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
let _notifTimer = null;
function showNotif(msg, type = "ok") {
  const el = document.getElementById("notif");
  if (!el) return;
  clearTimeout(_notifTimer);
  const colors = {
    ok:   { bg: "rgba(0,232,122,0.12)", border: "#00e87a", color: "#00ff88" },
    info: { bg: "rgba(59,139,255,0.12)", border: "#3b8bff", color: "#88bbff" },
    err:  { bg: "rgba(255,64,96,0.12)", border: "#ff4060", color: "#ff7080" },
  };
  const c = colors[type] || colors.ok;
  el.style.cssText = `background:${c.bg};border:1px solid ${c.border};color:${c.color}`;
  el.textContent = msg;
  el.classList.remove("hidden");
  _notifTimer = setTimeout(() => el.classList.add("hidden"), 2500);
}

// ── CARD HTML ─────────────────────────────────────────────────────────────────
function mediaCardHTML(item) {
  const wlEntry = getWatchlistEntry(item.id);
  const inWL = !!wlEntry;
  const poster = item.poster_path
    ? `<img src="${posterUrl(item.poster_path)}" loading="lazy" onerror="this.outerHTML='<div class=card-poster-placeholder>${item.emoji||"🎬"}</div>'">`
    : `<div class="card-poster-placeholder">${item.emoji || "🎬"}</div>`;
  const typeBg = item.type === "series" ? "rgba(170,102,255,0.25)" : "rgba(59,139,255,0.25)";
  const typeColor = item.type === "series" ? "#aa66ff" : "#3b8bff";

  return `<div class="media-card" onclick="openDetail(${JSON.stringify(item).replace(/"/g,"&quot;")})">
    <div class="card-poster">
      ${poster}
      <span class="card-type" style="background:${typeBg};color:${typeColor}">${item.type==="series"?"TV":"FILM"}</span>
      <button class="card-wl-btn" onclick="event.stopPropagation();quickAddWL(${JSON.stringify(item).replace(/"/g,"&quot;")})"
        title="${inWL?"In Watchlist":"Add to Watchlist"}" style="${inWL?"background:var(--accent)":""}">
        ${inWL ? "✓" : "+"}
      </button>
    </div>
    <div class="card-body">
      <div class="card-title">${item.title}</div>
      <div class="card-meta">
        <span>${item.release_date || ""}</span>
        <div class="card-rating">⭐ ${item.vote_average || "N/A"}</div>
      </div>
      ${item.genres?.length ? `<div class="card-genres">${item.genres.slice(0,2).map(g=>`<span class="genre-chip">${g}</span>`).join("")}</div>` : ""}
    </div>
  </div>`;
}

function quickAddWL(item) {
  const entry = getWatchlistEntry(item.id);
  if (entry) {
    removeFromWatchlist(item.id);
    showNotif("Removed from watchlist", "info");
  } else {
    addToWatchlist(item, "want");
    showNotif("Added to watchlist ★", "ok");
  }
  if (currentPage === "watchlist") renderWatchlist();
  if (currentPage === "discover") {
    document.querySelectorAll(".card-wl-btn").forEach(btn => {});
  }
}

// ── DETAIL MODAL ──────────────────────────────────────────────────────────────
let _detailItem = null;
let _selectedStars = 0;

function openDetail(item) {
  _detailItem = item;
  _selectedStars = 0;
  const overlay = document.getElementById("detail-overlay");
  const modal   = document.getElementById("detail-modal");
  overlay.classList.remove("hidden");

  const wlEntry   = getWatchlistEntry(item.id);
  const userReview = getUserReview(item.id);
  const itemReviews = getItemReviews(item.id);
  if (userReview) _selectedStars = userReview.rating;

  const poster = item.poster_path
    ? `<img src="${posterUrl(item.poster_path)}" onerror="this.style.display='none'">`
    : `<div class="dm-backdrop-ph">${item.emoji || "🎬"}</div>`;

  const statuses = [
    { key:"want",     label:"★ Want to Watch" },
    { key:"watching", label:"▶ Watching" },
    { key:"done",     label:"✓ Completed" },
    { key:"dropped",  label:"✕ Dropped" },
  ];

  const genreList = (item.genres||[]).length > 0 ? item.genres : (item.genre||"").split(",").map(g=>g.trim()).filter(Boolean);
  const overview = item.overview || "No description available.";

  const isFav = isFavourite(item.id);

  modal.innerHTML = `
    <div class="dm-backdrop">
      ${poster}
      <div class="dm-backdrop-grad"></div>
      <button class="dm-close" onclick="closeDetail()">✕</button>
    </div>
    <div class="dm-body">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
        <span class="badge ${item.type==="series"?"badge-series":"badge-movie"}">${item.type==="series"?"📺 Series":"🎬 Movie"}</span>
        <div style="display:flex;gap:6px">
          <button onclick="handleFavToggle('${item.id}',${JSON.stringify(item).replace(/"/g,"&quot;")})" title="Favourite"
            style="background:${isFav?"rgba(239,68,68,0.15)":"var(--surface2)"};border:1px solid ${isFav?"#ef4444":"var(--border2)"};border-radius:9px;padding:5px 10px;cursor:pointer;font-size:14px;transition:all 0.2s" id="fav-btn-${item.id}">
            ${isFav?"❤️":"🤍"}
          </button>
          <button onclick="openWatchTimeModal('${item.id}','${(item.title||'').replace(/'/g,"\\'")}'" title="Log Watch Time"
            style="background:var(--surface2);border:1px solid var(--border2);border-radius:9px;padding:5px 10px;cursor:pointer;font-size:14px">⏱️</button>
          <button onclick="openReminderModal('${item.id}','${(item.title||'').replace(/'/g,"\\'")}'" title="Set Reminder"
            style="background:var(--surface2);border:1px solid var(--border2);border-radius:9px;padding:5px 10px;cursor:pointer;font-size:14px">⏰</button>
        </div>
      </div>
      <div class="dm-title" style="margin-top:8px">${item.title}</div>
      <div class="dm-meta">
        ${item.release_date ? `<span>📅 ${item.release_date}</span>` : ""}
        ${item.vote_average ? `<span>⭐ ${item.vote_average}</span>` : ""}
        ${item.episodes ? `<span>📺 ${item.episodes} ep</span>` : ""}
        ${item.lang ? `<span>🗣️ ${item.lang}</span>` : ""}
        ${item.ott ? `<span style="color:${getOttColor(item.ott)};font-weight:700">▶ ${item.ott}</span>` : ""}
      </div>
      ${genreList.length ? `<div class="dm-genres">${genreList.map(g=>`<span class="dm-genre">${g}</span>`).join("")}</div>` : ""}
      <p class="dm-overview">${overview}</p>

      <div class="dm-section">ADD TO WATCHLIST</div>
      <div class="dm-action-grid">
        ${statuses.map(s => `
          <button class="dm-action${wlEntry?.status===s.key?" active":""}" onclick="setDetailStatus('${s.key}')">
            ${s.label}
          </button>`).join("")}
      </div>

      ${wlEntry?.status==="watching" && item.episodes ? `
        <div style="margin-bottom:20px">
          <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text3);margin-bottom:6px">
            <span>Episode Progress</span>
            <span style="color:var(--accent2);font-weight:800" id="ep-val">${wlEntry.progress||0} / ${item.episodes}</span>
          </div>
          <div class="prog-track" style="margin-bottom:8px">
            <div class="prog-fill" id="ep-bar" style="width:${((wlEntry.progress||0)/item.episodes)*100}%"></div>
          </div>
          <input type="range" min="0" max="${item.episodes}" value="${wlEntry.progress||0}" oninput="updateEpProgress(this.value,${item.episodes})">
        </div>` : ""}

      <div class="dm-section">RATE & REVIEW</div>
      <div class="star-row" id="star-row">
        ${[1,2,3,4,5].map(i=>`<button class="star-btn" onclick="selectStar(${i})" id="star-${i}">${i<=_selectedStars?"★":"☆"}</button>`).join("")}
      </div>
      <textarea class="review-input" id="review-text" placeholder="Write your thoughts..." rows="3">${userReview?.text||""}</textarea>
      <button onclick="submitReview()" style="width:100%;padding:11px;background:linear-gradient(135deg,var(--accent),var(--accent2));border:none;border-radius:10px;color:#fff;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;margin-bottom:20px">
        ${userReview ? "Update Review" : "Submit Review"} ⭐
      </button>

      ${notesHTML(item.id)}

      ${itemReviews.length > 0 ? `
        <div class="dm-section" style="margin-top:20px">ALL REVIEWS (${itemReviews.length})</div>
        ${itemReviews.map(r=>`
          <div class="review-card">
            <div class="review-card-top">
              <div class="review-user">${r.userName}</div>
              <div class="review-date">${r.date}</div>
            </div>
            <div class="review-stars">${"★".repeat(r.rating)}${"☆".repeat(5-r.rating)}</div>
            ${r.text ? `<div class="review-text">${r.text}</div>` : ""}
          </div>`).join("")}` : ""}
    </div>
  `;
}

function closeDetail(e) {
  if (e && e.target !== document.getElementById("detail-overlay")) return;
  document.getElementById("detail-overlay").classList.add("hidden");
  _detailItem = null;
  if (currentPage === "watchlist") renderWatchlistList();
  if (currentPage === "reviews")   renderReviews();
  if (currentPage === "stats")     renderStats();
}

document.getElementById("detail-overlay")?.addEventListener("click", closeDetail);

function setDetailStatus(status) {
  if (!_detailItem) return;
  const existing = getWatchlistEntry(_detailItem.id);
  if (existing?.status === status) {
    removeFromWatchlist(_detailItem.id);
    showNotif("Removed from watchlist", "info");
  } else {
    addToWatchlist(_detailItem, status);
    showNotif(`Added: ${STATUS_CONFIG[status]?.label || status} ✓`, "ok");
  }
  openDetail(_detailItem); // re-render
  updateWatchlistBadge();
}

function updateEpProgress(val, total) {
  const wl = getWatchlist();
  const userId = getCurrentUser()?.id;
  const key = userId + "_" + _detailItem?.id;
  if (wl[key]) { wl[key].progress = parseInt(val); saveWatchlist(wl); }
  const bar = document.getElementById("ep-bar");
  const label = document.getElementById("ep-val");
  if (bar) bar.style.width = `${(val/total)*100}%`;
  if (label) label.textContent = `${val} / ${total}`;
}

function selectStar(n) {
  _selectedStars = n;
  [1,2,3,4,5].forEach(i => {
    const btn = document.getElementById("star-" + i);
    if (btn) btn.textContent = i <= n ? "★" : "☆";
  });
}

function submitReview() {
  if (!_detailItem) return;
  if (!_selectedStars) { showNotif("Please select a star rating", "err"); return; }
  const text = document.getElementById("review-text")?.value.trim() || "";
  addReview(_detailItem.id, _selectedStars, text);
  showNotif("Review saved ⭐", "ok");
  openDetail(_detailItem);
}

// ── INDIAN DETAIL MODAL ────────────────────────────────────────────────────────
function openIndianDetail(id) {
  const s = INDIAN_SERIES.find(x => x.id === id);
  if (!s) return;
  const ws  = getWatchStatus(getIndianWatch(s.id));
  const cfg = STATUS_CONFIG[ws];
  const oc  = getOttColor(s.ott);
  const userReview = getUserReview(s.id);
  _selectedStars = userReview?.rating || 0;
  _detailItem = s;

  const overlay = document.getElementById("detail-overlay");
  const modal   = document.getElementById("detail-modal");
  overlay.classList.remove("hidden");

  modal.innerHTML = `
    <div class="dm-backdrop">
      <div class="dm-backdrop-ph">${s.emoji}</div>
      <div class="dm-backdrop-grad"></div>
      <button class="dm-close" onclick="closeDetail()">✕</button>
    </div>
    <div class="dm-body">
      <span class="badge badge-series">🇮🇳 Indian Series</span>
      <div class="dm-title" style="margin-top:8px">${s.name}</div>
      <div class="dm-meta">
        <span>📅 ${s.year}</span>
        <span>📺 ${s.session}</span>
        ${s.episodes ? `<span>${s.episodes} episodes</span>` : ""}
        <span>🗣️ ${s.lang}</span>
        ${s.ott ? `<span style="color:${oc};font-weight:700">▶ ${s.ott}</span>` : ""}
      </div>
      <div class="dm-genres">${(s.genre||"").split(",").map(g=>`<span class="dm-genre">${g.trim()}</span>`).join("")}</div>

      <div class="dm-section">WATCH STATUS</div>
      <div class="dm-action-grid">
        ${[["done","✓ Watched"],["partial","◑ In Progress"],["no","○ Not Watched"]].map(([k,l])=>`
          <button class="dm-action${ws===k?" active":""}" onclick="setIndianStatus('${id}','${k}')"
            style="${ws===k?`background:${cfg.bg};border-color:${cfg.color};color:${cfg.color}`:""}">
            ${l}
          </button>`).join("")}
      </div>

      <div class="dm-section">RATE & REVIEW</div>
      <div class="star-row" id="star-row">
        ${[1,2,3,4,5].map(i=>`<button class="star-btn" onclick="selectStar(${i})" id="star-${i}">${i<=_selectedStars?"★":"☆"}</button>`).join("")}
      </div>
      <textarea class="review-input" id="review-text" placeholder="Write your review..." rows="3">${userReview?.text||""}</textarea>
      <button onclick="submitReview()" style="width:100%;padding:11px;background:linear-gradient(135deg,var(--accent),var(--accent2));border:none;border-radius:10px;color:#fff;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer">
        ${userReview?"Update":"Submit"} Review ⭐
      </button>
    </div>
  `;
}

function setIndianStatus(id, status) {
  const watched = status === "done" ? "Done" : status === "partial" ? "1" : "";
  setIndianWatch(id, watched);
  showNotif(status === "done" ? "Marked as Watched ✓" : status === "partial" ? "Marked as In Progress ◑" : "Marked as Not Watched", "ok");
  openIndianDetail(id);
  if (currentPage === "indian") renderIndianList();
  if (currentPage === "home") renderHome();
  updateWatchlistBadge();
}

// ── SEARCH ────────────────────────────────────────────────────────────────────
let _searchTimer = null;

function openSearch() {
  document.getElementById("search-overlay").classList.remove("hidden");
  setTimeout(() => document.getElementById("search-input")?.focus(), 100);
}

function closeSearch() {
  document.getElementById("search-overlay").classList.add("hidden");
  document.getElementById("search-input").value = "";
  document.getElementById("search-results").innerHTML = "";
}

document.getElementById("search-overlay")?.addEventListener("click", (e) => {
  if (e.target === document.getElementById("search-overlay")) closeSearch();
});

async function handleSearch(q) {
  clearTimeout(_searchTimer);
  const el = document.getElementById("search-results");
  if (!q || q.length < 2) {
    // Search Indian series locally
    const indResults = INDIAN_SERIES.filter(s => s.name.toLowerCase().includes(q.toLowerCase())).slice(0, 4);
    el.innerHTML = indResults.length
      ? `<div style="padding:8px 12px;font-size:10px;font-weight:800;color:var(--text3);letter-spacing:2px">🇮🇳 INDIAN SERIES</div>` +
        indResults.map(s => searchItemHTML({
          id: s.id, title: s.name, emoji: s.emoji, sub: `${s.year} · ${s.ott||""}`,
          isIndian: true,
        })).join("")
      : `<div class="search-empty"><div class="search-empty-icon">🔍</div><div class="search-empty-text">Type to search...</div></div>`;
    return;
  }

  el.innerHTML = `<div class="spinner"></div>`;

  _searchTimer = setTimeout(async () => {
    // Local Indian search
    const indResults = INDIAN_SERIES.filter(s =>
      s.name.toLowerCase().includes(q.toLowerCase()) ||
      (s.genre||"").toLowerCase().includes(q.toLowerCase())
    ).slice(0, 3);

    // TMDB search
    const tmdbResults = await searchTMDB(q);
    const items = (tmdbResults || []).map(normaliseItem).slice(0, 8);

    let html = "";
    if (indResults.length) {
      html += `<div style="padding:8px 12px;font-size:10px;font-weight:800;color:var(--text3);letter-spacing:2px">🇮🇳 INDIAN</div>`;
      html += indResults.map(s => searchItemHTML({ id: s.id, title: s.name, emoji: s.emoji, sub: `${s.year} · ${s.ott||""}`, isIndian: true })).join("");
    }
    if (items.length) {
      html += `<div style="padding:8px 12px;font-size:10px;font-weight:800;color:var(--text3);letter-spacing:2px">🌍 GLOBAL</div>`;
      html += items.map(item => searchItemHTML({
        id: item.id, title: item.title,
        poster: item.poster_path ? posterUrl(item.poster_path, "w92") : null,
        emoji: item.emoji || "🎬",
        sub: `${item.release_date||""} · ⭐${item.vote_average}`,
        item,
      })).join("");
    }
    if (!html) html = `<div class="search-empty"><div class="search-empty-icon">😔</div><div class="search-empty-text">No results for "${q}"</div></div>`;
    el.innerHTML = html;
  }, 400);
}

function searchItemHTML({ id, title, poster, emoji, sub, isIndian, item }) {
  const fn = isIndian ? `openIndianDetail('${id}');closeSearch()` : `openDetail(${JSON.stringify(item||{}).replace(/"/g,"&quot;")});closeSearch()`;
  return `<div class="search-item" onclick="${fn}">
    <div class="search-item-poster">
      ${poster ? `<img src="${poster}" onerror="this.outerHTML='<div class=search-item-poster-ph>${emoji}</div>'">` : `<div class="search-item-poster-ph">${emoji}</div>`}
    </div>
    <div class="search-item-info">
      <div class="search-item-title">${title}</div>
      <div class="search-item-sub">${sub}</div>
    </div>
  </div>`;
}

// ── FAVOURITE TOGGLE (from detail modal) ──────────────────────────────────────
function handleFavToggle(itemId, item) {
  const isFav = toggleFavourite(itemId, item);
  const btn = document.getElementById("fav-btn-" + itemId);
  if (btn) {
    btn.textContent = isFav ? "❤️" : "🤍";
    btn.style.background = isFav ? "rgba(239,68,68,0.15)" : "var(--surface2)";
    btn.style.borderColor = isFav ? "#ef4444" : "var(--border2)";
  }
  if (currentPage === "favourites") renderFavourites();
}

// ── THEME BTN ACTIVE STATE ────────────────────────────────────────────────────
function updateThemeBtns() {
  document.querySelectorAll(".theme-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.theme === currentTheme);
    b.style.background = b.dataset.theme === currentTheme ? "var(--accent-dim)" : "";
    b.style.borderColor = b.dataset.theme === currentTheme ? "var(--accent)" : "";
  });
}

// ── LANG BTN LABEL ────────────────────────────────────────────────────────────
function updateLangBtn() {
  const btn = document.getElementById("lang-btn");
  if (btn) btn.textContent = currentLang === "en" ? "বাং" : "EN";
}

// Patch setLang to also update UI
const _origSetLang = setLang;
window.setLang = function(lang) {
  _origSetLang(lang);
  updateLangBtn();
};

// Patch setTheme to also update btn styles
const _origSetTheme = setTheme;
window.setTheme = function(theme) {
  _origSetTheme(theme);
  updateThemeBtns();
};

// ── PWA SERVICE WORKER REGISTRATION ──────────────────────────────────────────
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js")
      .then(() => console.log("CineTrack SW registered"))
      .catch(e => console.warn("SW error:", e));
  });
}

// ── PWA INSTALL PROMPT ────────────────────────────────────────────────────────
let _deferredPrompt;
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  _deferredPrompt = e;
  // Show install button if available
  const btn = document.getElementById("pwa-install-btn");
  if (btn) btn.style.display = "";
});

function installPWA() {
  if (_deferredPrompt) {
    _deferredPrompt.prompt();
    _deferredPrompt.userChoice.then(() => { _deferredPrompt = null; });
  }
}
