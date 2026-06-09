// ═══════════════════════════════════════════════
// CineTrack — Page Renderers
// ═══════════════════════════════════════════════

let currentPage = "home";

function showPage(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.querySelectorAll(".nav-item, .bnav-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.page === page);
  });
  const el = document.getElementById("page-" + page);
  if (el) {
    el.classList.remove("hidden");
    currentPage = page;
    renderPage(page);
  }
}

function renderPage(page) {
  switch (page) {
    case "home":       renderHome(); break;
    case "discover":   renderDiscover(); break;
    case "indian":     renderIndian(); break;
    case "watchlist":  renderWatchlist(); break;
    case "favourites": renderFavourites(); break;
    case "reviews":    renderReviews(); break;
    case "watchtime":  renderWatchtime(); break;
    case "stats":      renderStats(); break;
    case "profile":    renderProfile(); break;
  }
}

// ── HOME PAGE ─────────────────────────────────────────────────────────────────
async function renderHome() {
  const el = document.getElementById("page-home");
  const user = getCurrentUser();
  const wlItems = getUserWatchlistAll();
  const doneCount  = wlItems.filter(i => i.status === "done").length;
  const watchCount = wlItems.filter(i => i.status === "watching").length;

  el.innerHTML = `
    <div style="margin-bottom:6px;font-size:12px;color:var(--text3);font-weight:600">Welcome back 👋</div>
    <h1 style="font-size:24px;font-weight:900;margin-bottom:20px">${user.name.split(" ")[0]}<span style="color:var(--accent2)">.</span></h1>

    <div class="stats-row" style="margin-bottom:28px">
      <div class="stat-card"><div class="stat-n" style="color:var(--blue)">${wlItems.length}</div><div class="stat-l">In Library</div></div>
      <div class="stat-card"><div class="stat-n" style="color:var(--green)">${doneCount}</div><div class="stat-l">Completed</div></div>
      <div class="stat-card"><div class="stat-n" style="color:var(--accent2)">${watchCount}</div><div class="stat-l">Watching</div></div>
      <div class="stat-card"><div class="stat-n" style="color:var(--yellow)">${INDIAN_SERIES.filter(s=>getWatchStatus(getIndianWatch(s.id))==="done").length}</div><div class="stat-l">Indian Done</div></div>
    </div>

    <div id="home-hero" style="margin-bottom:28px"></div>

    <div class="section-hdr">
      <div class="section-title">Trending <span>Now</span></div>
      <button class="see-all" onclick="showPage('discover')">See all →</button>
    </div>
    <div id="home-trending" class="h-scroll" style="margin-bottom:28px">
      ${skeletonCards(6)}
    </div>

    <div class="section-hdr">
      <div class="section-title">🇮🇳 Indian <span>Series</span></div>
      <button class="see-all" onclick="showPage('indian')">See all →</button>
    </div>
    <div id="home-indian" class="h-scroll" style="margin-bottom:28px">
      ${indHScroll()}
    </div>

    ${watchCount > 0 ? `
    <div class="section-hdr">
      <div class="section-title">Continue <span>Watching</span></div>
    </div>
    <div id="home-continue" style="margin-bottom:20px">
      ${wlItems.filter(i=>i.status==="watching").slice(0,3).map(wlRowHTML).join("")}
    </div>` : ""}
  `;

  // Load trending async
  loadHomeTrending();
}

async function loadHomeTrending() {
  const data = await getTrending("all");
  const items = data ? data.results.slice(0, 10).map(normaliseItem) : FALLBACK_MOVIES.concat(FALLBACK_SERIES);

  if (items.length > 0) {
    const hero = items[0];
    document.getElementById("home-hero").innerHTML = heroHTML(hero);
  }

  document.getElementById("home-trending").innerHTML =
    items.map(item => mediaCardHTML(item)).join("");
}

function indHScroll() {
  return INDIAN_SERIES.slice(0, 8).map(s => {
    const ws = getWatchStatus(getIndianWatch(s.id));
    const cfg = STATUS_CONFIG[ws];
    return `<div class="media-card" style="min-width:140px" onclick="openIndianDetail('${s.id}')">
      <div class="card-poster" style="aspect-ratio:2/3">
        <div class="card-poster-placeholder">${s.emoji}</div>
        <span class="card-type" style="background:rgba(255,107,43,0.25);color:#ff6b45">🇮🇳</span>
        <span style="position:absolute;bottom:6px;right:6px;font-size:14px" title="${cfg.label}">${cfg.icon}</span>
      </div>
      <div class="card-body">
        <div class="card-title">${s.name}</div>
        <div class="card-meta"><span>${s.year}</span><span>${s.session}</span></div>
      </div>
    </div>`;
  }).join("");
}

function heroHTML(item) {
  const wlEntry = getWatchlistEntry(item.id);
  return `<div class="hero" onclick="openDetail(${JSON.stringify(item).replace(/"/g,"&quot;")})">
    <div class="hero-bg">${item.poster_path ? `<img src="${backdropUrl(item.backdrop_path || item.poster_path)}" onerror="this.style.display='none'">` : ""}</div>
    <div class="hero-gradient"></div>
    <div class="hero-content">
      <div class="hero-badge">✦ FEATURED</div>
      <div class="hero-title">${item.title}</div>
      <div class="hero-meta">
        <span>📅 ${item.release_date}</span>
        <span>⭐ ${item.vote_average}</span>
        <span>${item.type === "series" ? "📺 Series" : "🎬 Movie"}</span>
      </div>
      <div class="hero-btns">
        <button class="hero-btn hero-btn-primary" onclick="event.stopPropagation();openDetail(${JSON.stringify(item).replace(/"/g,"&quot;")})">+ Add to List</button>
        <button class="hero-btn hero-btn-sec" onclick="event.stopPropagation();openDetail(${JSON.stringify(item).replace(/"/g,"&quot;")})">ℹ More Info</button>
      </div>
    </div>
  </div>`;
}

function skeletonCards(n) {
  return Array(n).fill(0).map(() => `
    <div class="skeleton-card" style="min-width:140px">
      <div class="skeleton skeleton-poster"></div>
      <div class="skeleton skeleton-line"></div>
      <div class="skeleton skeleton-line-sm"></div>
    </div>`).join("");
}

// ── DISCOVER PAGE ─────────────────────────────────────────────────────────────
let discoverType = "all", discoverSort = "popularity.desc", discoverPage = 1, discoverItems = [];

async function renderDiscover() {
  const el = document.getElementById("page-discover");
  el.innerHTML = `
    <h2 style="font-size:22px;font-weight:900;margin-bottom:16px">Discover <span style="color:var(--accent2)">Titles</span></h2>
    <div class="filter-row" id="disc-type-filters">
      ${["all","movie","series"].map(t => `<button class="fchip${discoverType===t?" on":""}" onclick="setDiscoverType('${t}')">${t==="all"?"🎬 All":t==="movie"?"🎥 Movies":"📺 Series"}</button>`).join("")}
      <button class="fchip" onclick="setDiscoverType('top')" style="${discoverType==='top'?'background:var(--accent-dim);border-color:var(--accent);color:var(--accent2)':''}">⭐ Top Rated</button>
    </div>
    <div id="disc-grid" class="grid-2">${skeletonCards(12)}</div>
    <div style="text-align:center;padding:20px">
      <button onclick="loadMoreDiscover()" style="background:var(--surface2);border:1px solid var(--border2);color:var(--text2);padding:11px 28px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer" id="disc-more-btn">Load More</button>
    </div>
  `;
  await loadDiscover(true);
}

async function setDiscoverType(type) {
  discoverType = type; discoverPage = 1; discoverItems = [];
  document.querySelectorAll("#disc-type-filters .fchip").forEach((b, i) => {
    b.classList.toggle("on", ["all","movie","series","top"][i] === type);
  });
  document.getElementById("disc-grid").innerHTML = skeletonCards(12);
  await loadDiscover(true);
}

async function loadDiscover(reset = false) {
  if (reset) { discoverPage = 1; discoverItems = []; }
  let data;
  if (discoverType === "top") {
    const [m, t] = await Promise.all([getTopRatedMovies(), getTopRatedSeries()]);
    const items = [...(m?.results||[]).map(i=>({...i,media_type:"movie"})), ...(t?.results||[]).map(i=>({...i,media_type:"tv"}))];
    data = { results: items.sort((a,b) => b.vote_average - a.vote_average) };
  } else if (discoverType === "movie") {
    data = await getPopularMovies(discoverPage);
    if (data) data.results = data.results.map(i => ({...i, media_type:"movie"}));
  } else if (discoverType === "series") {
    data = await getPopularSeries(discoverPage);
    if (data) data.results = data.results.map(i => ({...i, media_type:"tv"}));
  } else {
    data = await getTrending("all", discoverPage);
  }

  const items = data ? data.results.map(normaliseItem) : [...FALLBACK_MOVIES, ...FALLBACK_SERIES];
  discoverItems = reset ? items : [...discoverItems, ...items];
  discoverPage++;

  const grid = document.getElementById("disc-grid");
  if (grid) grid.innerHTML = discoverItems.map(mediaCardHTML).join("");
}

async function loadMoreDiscover() {
  const btn = document.getElementById("disc-more-btn");
  if (btn) { btn.textContent = "Loading..."; btn.disabled = true; }
  await loadDiscover(false);
  if (btn) { btn.textContent = "Load More"; btn.disabled = false; }
}

// ── INDIAN SERIES PAGE — Excel-Style Table ────────────────────────────────────
let indFilter  = "all";
let indYearF   = "All";
let indOTTF    = "All";
let indSrch    = "";
let indGroup   = true;
let indNextId  = 100;

// OTT colour map
const IND_OTT_STYLE = {
  "amazon prime": { bg:"rgba(0,168,224,0.14)", color:"#00a8e0", border:"rgba(0,168,224,0.3)" },
  "prime video":  { bg:"rgba(0,168,224,0.14)", color:"#00a8e0", border:"rgba(0,168,224,0.3)" },
  "netflix":      { bg:"rgba(229,9,20,0.12)",  color:"#e50914", border:"rgba(229,9,20,0.28)" },
  "jiocinema":    { bg:"rgba(255,77,0,0.12)",  color:"#ff6b35", border:"rgba(255,77,0,0.28)" },
  "jiohotstar":   { bg:"rgba(31,128,224,0.12)",color:"#1f80e0", border:"rgba(31,128,224,0.28)"},
  "zee5":         { bg:"rgba(139,43,226,0.12)",color:"#9f5cf7", border:"rgba(139,43,226,0.28)"},
  "sonyliv":      { bg:"rgba(0,48,135,0.18)",  color:"#4d8aff", border:"rgba(0,100,200,0.28)" },
  "voot":         { bg:"rgba(123,45,139,0.14)",color:"#c47cf5", border:"rgba(123,45,139,0.28)"},
  "mx player":    { bg:"rgba(0,183,255,0.12)", color:"#00b7ff", border:"rgba(0,183,255,0.28)" },
  "aha":          { bg:"rgba(245,199,0,0.12)", color:"#f5c700", border:"rgba(245,199,0,0.28)" },
};
function indOttStyle(ott) {
  const k = (ott||"").toLowerCase().replace(/\s+/g,"");
  for (const [n,s] of Object.entries(IND_OTT_STYLE)) {
    if (k.includes(n.replace(/\s+/g,""))) return s;
  }
  return { bg:"rgba(90,120,150,0.1)", color:"#5a7899", border:"rgba(90,120,150,0.22)" };
}

const IND_WATCH_STYLE = {
  "Done":     { bg:"rgba(34,197,94,0.12)",  color:"#22c55e", border:"rgba(34,197,94,0.3)"   },
  "Watching": { bg:"rgba(245,158,11,0.12)", color:"#f59e0b", border:"rgba(245,158,11,0.3)"  },
  "Pending":  { bg:"rgba(90,120,150,0.1)",  color:"#5a7899", border:"rgba(90,120,150,0.22)" },
  "Dropped":  { bg:"rgba(239,68,68,0.1)",   color:"#ef4444", border:"rgba(239,68,68,0.28)"  },
};

// Convert internal "done/partial/no" → display string
function wsToDisplay(ws) {
  if (ws === "done")    return "Done";
  if (ws === "partial") return "Watching";
  return "Pending";
}
function displayToWatch(d) {
  if (d === "Done")     return "Done";
  if (d === "Watching") return "1";
  if (d === "Dropped")  return "dropped";
  return "";
}

// Build mutable series list from INDIAN_SERIES + localStorage overrides
function getIndianTableData() {
  const saved = DB.get("indian_table_extra") || [];
  const base = INDIAN_SERIES.map(s => ({
    _id:     s.id,
    name:    s.name,
    session: s.session,
    year:    s.year,
    genre:   s.genre,
    episode: s.episodes ? `01-${String(s.episodes).padStart(2,"0")}` : "—",
    release: s.release || "",
    lang:    s.lang,
    ott:     s.ott,
    watched: wsToDisplay(getWatchStatus(getIndianWatch(s.id) ?? s.watched)),
    remark:  "",
  }));
  return [...base, ...saved];
}

function saveIndianExtra(extra) { DB.set("indian_table_extra", extra); }
function getIndianExtra()       { return DB.get("indian_table_extra") || []; }

function renderIndian() {
  const el = document.getElementById("page-indian");
  const years = ["All", ...new Set(INDIAN_SERIES.map(s=>s.year).sort((a,b)=>a-b))];
  const otts  = ["All", ...new Set(INDIAN_SERIES.map(s=>s.ott).filter(Boolean))].sort();

  el.innerHTML = `
    <!-- Page header -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;flex-wrap:wrap;gap:10px">
      <div>
        <h2 style="font-size:22px;font-weight:900;margin-bottom:2px">🇮🇳 Indian <span style="color:var(--accent2)">Series</span></h2>
        <p style="font-size:12px;color:var(--text3)">${INDIAN_SERIES.length} series from your library</p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="fchip on" id="ind-grp-btn" onclick="toggleIndianGroup()" style="font-size:11px">📅 Group by Year</button>
        <button class="fchip" onclick="exportIndianCSV()" style="font-size:11px">⬇ Export CSV</button>
        <button onclick="openIndianAddModal()" style="background:linear-gradient(135deg,var(--accent),var(--accent2));border:none;color:#fff;font-family:inherit;font-size:12px;font-weight:700;padding:7px 16px;border-radius:9px;cursor:pointer">+ Add Series</button>
      </div>
    </div>

    <!-- Stats bar -->
    <div id="ind-tbl-stats" style="display:flex;gap:8px;overflow-x:auto;margin-bottom:14px;padding-bottom:2px"></div>

    <!-- Filters -->
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;align-items:center">
      <input type="text" class="form-input" placeholder="🔍  Search name, genre, OTT..." id="ind-srch"
        oninput="indSrch=this.value;renderIndianTable()" style="flex:1;min-width:180px;margin-bottom:0">
      ${["all","Done","Watching","Pending","Dropped"].map((f,i)=>
        `<button class="fchip${indFilter===f?" on":""}" id="indf-${f}" onclick="setIndFilter('${f}')">${["All","✓ Done","▶ Watching","○ Pending","✕ Dropped"][i]}</button>`
      ).join("")}
    </div>
    <div style="display:flex;gap:6px;overflow-x:auto;margin-bottom:6px;padding-bottom:2px" id="ind-year-row">
      ${years.map(y=>`<button class="fchip${indYearF==y?" on":""}" onclick="indYearF='${y}';renderIndianYearRow();renderIndianTable()">${y}</button>`).join("")}
    </div>
    <div style="display:flex;gap:6px;overflow-x:auto;margin-bottom:14px;padding-bottom:2px" id="ind-ott-row">
      ${otts.map(o=>`<button class="fchip${indOTTF===o?" on":""}" onclick="indOTTF='${o}';renderIndianOTTRow();renderIndianTable()"
        style="${o!=="All"?`color:${indOttStyle(o).color}`:""}">
        ${o||"Unknown"}</button>`).join("")}
    </div>

    <!-- TABLE -->
    <div class="ind-tbl-wrap">
      <table class="ind-tbl">
        <thead>
          <tr>
            <th>S. No.</th>
            <th>Name</th>
            <th>Session</th>
            <th>Genre</th>
            <th>Episode</th>
            <th>Release</th>
            <th>Language</th>
            <th>OTT</th>
            <th>Watched</th>
            <th>Remark</th>
          </tr>
        </thead>
        <tbody id="ind-tbl-body"></tbody>
      </table>
    </div>

    <!-- Add row trigger -->
    <button onclick="openIndianAddModal()" class="ind-add-row-btn">＋ Add New Series</button>

    <!-- Add Modal -->
    <div class="ind-modal-overlay hide" id="ind-add-modal" onclick="closeIndianModal(event)">
      <div class="ind-modal" onclick="event.stopPropagation()">
        <div style="font-size:16px;font-weight:800;color:var(--accent2);margin-bottom:18px">➕ Add New Series</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
          ${[
            ["ind-f-name","Name","text","Series name"],
            ["ind-f-session","Session","text","e.g. 1, S2"],
            ["ind-f-genre","Genre","text","Crime, Drama"],
            ["ind-f-episode","Episodes","text","e.g. 01-08"],
            ["ind-f-release","Release Date","text","e.g. Jan 15, 2025"],
          ].map(([id,lbl,type,ph])=>`
            <div>
              <div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:1px;text-transform:uppercase;margin-bottom:5px">${lbl}</div>
              <input id="${id}" type="${type}" placeholder="${ph}" class="form-input" style="margin-bottom:0">
            </div>`).join("")}
          <div>
            <div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:1px;text-transform:uppercase;margin-bottom:5px">Language</div>
            <select id="ind-f-lang" class="sort-select" style="width:100%">
              ${["Hindi","Tamil","Telugu","Malayalam","Marathi","Bengali","Other"].map(l=>`<option>${l}</option>`).join("")}
            </select>
          </div>
          <div>
            <div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:1px;text-transform:uppercase;margin-bottom:5px">OTT Platform</div>
            <select id="ind-f-ott" class="sort-select" style="width:100%">
              ${["Amazon Prime","Netflix","JioCinema","Zee5","SonyLIV","Voot","JioHotstar","MX Player","aha","Other"].map(o=>`<option>${o}</option>`).join("")}
            </select>
          </div>
          <div>
            <div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:1px;text-transform:uppercase;margin-bottom:5px">Watched</div>
            <select id="ind-f-watched" class="sort-select" style="width:100%">
              ${["Done","Watching","Pending","Dropped"].map(w=>`<option>${w}</option>`).join("")}
            </select>
          </div>
          <div>
            <div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:1px;text-transform:uppercase;margin-bottom:5px">Remark / Link</div>
            <input id="ind-f-remark" placeholder="https://..." class="form-input" style="margin-bottom:0">
          </div>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button onclick="closeIndianModal()" class="btn-ghost" style="padding:9px 20px;width:auto">Cancel</button>
          <button onclick="submitIndianAdd()" class="btn-primary" style="padding:9px 22px;width:auto">Add Series ✓</button>
        </div>
      </div>
    </div>
  `;

  renderIndianTable();
}

function setIndFilter(f) {
  indFilter = f;
  ["all","Done","Watching","Pending","Dropped"].forEach(k => {
    document.getElementById("indf-"+k)?.classList.toggle("on", k===f);
  });
  renderIndianTable();
}

function renderIndianYearRow() {
  document.querySelectorAll("#ind-year-row .fchip").forEach(b => {
    b.classList.toggle("on", b.textContent.trim() == indYearF);
  });
}
function renderIndianOTTRow() {
  document.querySelectorAll("#ind-ott-row .fchip").forEach(b => {
    b.classList.toggle("on", b.textContent.trim() === indOTTF);
  });
}

function toggleIndianGroup() {
  indGroup = !indGroup;
  const btn = document.getElementById("ind-grp-btn");
  if (btn) { btn.classList.toggle("on", indGroup); btn.textContent = indGroup ? "📅 Group by Year" : "📋 Flat List"; }
  renderIndianTable();
}

function renderIndianTable() {
  const rows = getIndianTableData();
  const q    = indSrch.toLowerCase();

  const filtered = rows.filter(r => {
    const wOk  = indFilter === "all" || r.watched === indFilter;
    const yOk  = indYearF === "All" || r.year == indYearF;
    const oOk  = indOTTF === "All" || (r.ott||"").toLowerCase().includes(indOTTF.toLowerCase());
    const qOk  = !q || r.name.toLowerCase().includes(q)
                    || (r.genre||"").toLowerCase().includes(q)
                    || (r.ott||"").toLowerCase().includes(q)
                    || (r.lang||"").toLowerCase().includes(q);
    return wOk && yOk && oOk && qOk;
  });

  // Stats
  const statsEl = document.getElementById("ind-tbl-stats");
  if (statsEl) {
    const done    = rows.filter(r=>r.watched==="Done").length;
    const watching= rows.filter(r=>r.watched==="Watching").length;
    const pending = rows.filter(r=>r.watched==="Pending").length;
    const dropped = rows.filter(r=>r.watched==="Dropped").length;
    statsEl.innerHTML = [
      { n:rows.length, l:"Total",    c:"#60a5fa" },
      { n:done,        l:"Done",     c:"#22c55e" },
      { n:watching,    l:"Watching", c:"#f59e0b" },
      { n:pending,     l:"Pending",  c:"#5a7899" },
      { n:dropped,     l:"Dropped",  c:"#ef4444" },
    ].map(s=>`<div class="stat-card" style="flex-shrink:0;min-width:64px;text-align:center">
      <div class="stat-n" style="color:${s.c};font-size:20px">${s.n}</div>
      <div class="stat-l">${s.l}</div>
    </div>`).join("");
  }

  // Render body
  const tbody = document.getElementById("ind-tbl-body");
  if (!tbody) return;
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:50px;color:var(--text3);font-size:14px;font-weight:600">No series found</td></tr>`;
    return;
  }

  let html = "";
  let sno  = 1;

  if (indGroup) {
    const years = [...new Set(filtered.map(r=>r.year))].sort((a,b)=>a-b);
    years.forEach(yr => {
      const grp = filtered.filter(r=>r.year===yr);
      html += `<tr class="ind-yr-hdr"><td colspan="10">📅 ${yr} — ${grp.length} series</td></tr>`;
      grp.forEach(r => { html += indTableRowHTML(r, sno++); });
    });
  } else {
    filtered.forEach(r => { html += indTableRowHTML(r, sno++); });
  }

  tbody.innerHTML = html;
}

function indTableRowHTML(r, sno) {
  const os = indOttStyle(r.ott);
  const ws = IND_WATCH_STYLE[r.watched] || IND_WATCH_STYLE["Pending"];
  const rid = r._id;
  const isExtra = typeof rid === "number" && rid >= 100;

  const remark = r.remark
    ? (r.remark.startsWith("http")
        ? `<a href="${r.remark}" target="_blank" class="ind-link">Link ↗</a>`
        : `<span class="ind-link" style="cursor:default">${r.remark}</span>`)
    : `<span style="color:var(--text3);font-size:11px">—</span>`;

  return `<tr class="ind-tbl-row" id="indr-${rid}">
    <td class="ind-sno">${sno}</td>
    <td class="ind-name-cell" title="Double-click to edit" ondblclick="indEditCell(this,'${rid}','name')">${r.name}</td>
    <td style="color:var(--text2);text-align:center" ondblclick="indEditCell(this,'${rid}','session')">${r.session}</td>
    <td class="ind-genre-cell" ondblclick="indEditCell(this,'${rid}','genre')">${r.genre||"—"}</td>
    <td style="font-family:var(--mono,monospace);font-size:11px;color:var(--text2);text-align:center">${r.episode||"—"}</td>
    <td style="font-size:11px;color:var(--text2);white-space:nowrap" ondblclick="indEditCell(this,'${rid}','release')">${r.release||"—"}</td>
    <td style="color:var(--text2);text-align:center" ondblclick="indEditCell(this,'${rid}','lang')">${r.lang}</td>
    <td style="text-align:center">
      <span class="ind-ott-badge" style="background:${os.bg};color:${os.color};border-color:${os.border}">${r.ott||"—"}</span>
    </td>
    <td style="text-align:center">
      <div class="ind-watch-wrap" id="indw-${rid}" style="background:${ws.bg};border-color:${ws.border}">
        <span class="ind-watch-lbl" style="color:${ws.color}">${r.watched}</span>
        <span style="font-size:8px;color:${ws.color}">▾</span>
        <select onchange="indChangeWatch('${rid}',this.value)" style="position:absolute;inset:0;opacity:0;cursor:pointer;width:100%">
          ${["Done","Watching","Pending","Dropped"].map(v=>`<option${r.watched===v?" selected":""}>${v}</option>`).join("")}
        </select>
      </div>
    </td>
    <td style="text-align:center">
      ${remark}
      ${isExtra ? `<button onclick="indDeleteExtra('${rid}')" class="ind-del-btn" title="Delete">✕</button>` : ""}
    </td>
  </tr>`;
}

function indChangeWatch(rid, val) {
  // Update the built-in series via indianWatch store
  const builtin = INDIAN_SERIES.find(s => s.id === rid);
  if (builtin) {
    setIndianWatch(rid, displayToWatch(val));
  } else {
    // Update extra
    const extras = getIndianExtra();
    const row    = extras.find(e => String(e._id) === String(rid));
    if (row) { row.watched = val; saveIndianExtra(extras); }
  }
  // Update badge in DOM
  const wrap = document.getElementById("indw-" + rid);
  if (wrap) {
    const ws = IND_WATCH_STYLE[val] || IND_WATCH_STYLE["Pending"];
    wrap.style.background  = ws.bg;
    wrap.style.borderColor = ws.border;
    const lbl = wrap.querySelector(".ind-watch-lbl");
    if (lbl) { lbl.style.color = ws.color; lbl.textContent = val; }
  }
  updateIndianHomeStats();
  showNotif(`Updated → ${val}`, "ok");
}

function indEditCell(cell, rid, field) {
  cell.setAttribute("contenteditable","true");
  cell.focus(); cell.style.background="rgba(232,71,42,0.08)"; cell.style.outline="1px solid var(--accent)"; cell.style.borderRadius="4px";
  cell.onblur = () => {
    const val = cell.textContent.trim();
    const extras = getIndianExtra();
    const row    = extras.find(e => String(e._id) === String(rid));
    if (row) { row[field] = val; saveIndianExtra(extras); }
    cell.removeAttribute("contenteditable");
    cell.style.background = ""; cell.style.outline = ""; cell.style.borderRadius = "";
  };
  cell.onkeydown = e => { if (e.key==="Enter") { e.preventDefault(); cell.blur(); } };
}

function indDeleteExtra(rid) {
  if (!confirm("Delete this series?")) return;
  const extras = getIndianExtra().filter(e => String(e._id) !== String(rid));
  saveIndianExtra(extras);
  renderIndianTable();
  showNotif("Deleted", "ok");
}

function openIndianAddModal()  { document.getElementById("ind-add-modal").classList.remove("hide"); }
function closeIndianModal(e)   {
  if (e && e.target !== document.getElementById("ind-add-modal")) return;
  document.getElementById("ind-add-modal").classList.add("hide");
}

function submitIndianAdd() {
  const name = document.getElementById("ind-f-name").value.trim();
  if (!name) { showNotif("Name is required", "err"); return; }
  const extras = getIndianExtra();
  const newRow = {
    _id:     indNextId++,
    name,
    session: document.getElementById("ind-f-session").value.trim() || "1",
    year:    new Date().getFullYear(),
    genre:   document.getElementById("ind-f-genre").value.trim(),
    episode: document.getElementById("ind-f-episode").value.trim() || "01-08",
    release: document.getElementById("ind-f-release").value.trim(),
    lang:    document.getElementById("ind-f-lang").value,
    ott:     document.getElementById("ind-f-ott").value,
    watched: document.getElementById("ind-f-watched").value,
    remark:  document.getElementById("ind-f-remark").value.trim(),
  };
  extras.push(newRow);
  saveIndianExtra(extras);
  document.getElementById("ind-add-modal").classList.add("hide");
  ["ind-f-name","ind-f-session","ind-f-genre","ind-f-episode","ind-f-release","ind-f-remark"].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = "";
  });
  showNotif(`✓ "${name}" added`, "ok");
  renderIndianTable();
}

function exportIndianCSV() {
  const rows = getIndianTableData();
  const cols = ["S.No","Name","Session","Genre","Episode","Release","Language","OTT","Watched","Remark"];
  const csv  = [cols, ...rows.map((r,i) => [i+1,r.name,r.session,r.genre,r.episode,r.release,r.lang,r.ott,r.watched,r.remark])]
    .map(row => row.map(v => `"${(v||"").toString().replace(/"/g,'""')}"`).join(",")).join("\n");
  const a    = Object.assign(document.createElement("a"), {
    href: "data:text/csv;charset=utf-8," + encodeURIComponent(csv),
    download: "indian_series_tracker.csv"
  });
  a.click();
  showNotif("CSV exported ✓", "ok");
}

function updateIndianHomeStats() {
  // Refresh home page stat if visible
  if (currentPage === "home") renderHome();
}

// ── WATCHLIST PAGE ────────────────────────────────────────────────────────────
let wlFilter = "all", wlSort = "addedAt";

function renderWatchlist() {
  const el = document.getElementById("page-watchlist");
  const items = getUserWatchlistAll();

  el.innerHTML = `
    <h2 style="font-size:22px;font-weight:900;margin-bottom:16px">My <span style="color:var(--accent2)">Watchlist</span></h2>
    <div class="pill-tabs" id="wl-tabs">
      ${[["all","All"],["watching","Watching"],["done","Completed"],["want","Want"],["dropped","Dropped"]].map(([k,l])=>
        `<button class="pill-tab${wlFilter===k?" active":""}" onclick="setWLFilter('${k}')">${l}</button>`
      ).join("")}
    </div>
    <div class="sort-wrap">
      <span class="sort-label">Sort:</span>
      <select class="sort-select" onchange="wlSort=this.value;renderWatchlistList()">
        <option value="addedAt" ${wlSort==="addedAt"?"selected":""}>Recently Added</option>
        <option value="title"   ${wlSort==="title"?"selected":""}>Title A–Z</option>
        <option value="rating"  ${wlSort==="rating"?"selected":""}>Rating</option>
      </select>
    </div>
    <div id="wl-list"></div>
  `;
  renderWatchlistList();
}

function setWLFilter(f) {
  wlFilter = f;
  document.querySelectorAll("#wl-tabs .pill-tab").forEach((b,i)=>{
    b.classList.toggle("active", ["all","watching","done","want","dropped"][i]===f);
  });
  renderWatchlistList();
}

function renderWatchlistList() {
  const el = document.getElementById("wl-list");
  if (!el) return;
  let items = getUserWatchlistAll();
  if (wlFilter !== "all") items = items.filter(i => i.status === wlFilter);
  items.sort((a,b) => {
    if (wlSort === "title")  return (a.title||"").localeCompare(b.title||"");
    if (wlSort === "rating") return (b.vote_average||0) - (a.vote_average||0);
    return (b.addedAt||0) - (a.addedAt||0);
  });
  if (!items.length) { el.innerHTML = `<div class="empty"><div class="empty-icon">📚</div><div class="empty-title">Nothing here yet</div><div class="empty-sub">Discover titles and add to your list</div></div>`; return; }
  el.innerHTML = items.map(wlRowHTML).join("");
}

function wlRowHTML(item) {
  const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG["want"];
  const prog = item.progress || 0;
  const total = item.episodes || null;
  const pct = total ? Math.round((prog/total)*100) : 0;
  const poster = item.poster_path ? `<img src="${posterUrl(item.poster_path)}" onerror="this.outerHTML='<div class=wl-poster-ph>${item.emoji||"🎬"}</div>'">` : `<div class="wl-poster-ph">${item.emoji||"🎬"}</div>`;
  return `<div class="wl-row" onclick="openDetail(${JSON.stringify(item).replace(/"/g,"&quot;")})">
    <div class="wl-poster">${poster}</div>
    <div class="wl-info">
      <div class="wl-title">${item.title}</div>
      <div class="wl-sub">
        <span>${item.release_date||""}</span>
        ${item.vote_average ? `<span>⭐ ${item.vote_average}</span>` : ""}
        ${item.type ? `<span>${item.type==="series"?"📺":"🎬"} ${item.type}</span>` : ""}
      </div>
      ${total ? `<div class="wl-prog"><div class="wl-prog-fill" style="width:${pct}%"></div></div>` : ""}
    </div>
    <span class="wl-status" style="background:${cfg.bg};color:${cfg.color};border:1px solid ${cfg.color}44">${cfg.icon} ${cfg.label}</span>
  </div>`;
}

// ── REVIEWS PAGE ──────────────────────────────────────────────────────────────
function renderReviews() {
  const el = document.getElementById("page-reviews");
  const reviews = getReviews();
  const allReviews = Object.entries(reviews).flatMap(([itemId, rs]) =>
    rs.map(r => ({ ...r, itemId }))
  ).sort((a,b) => b.date?.localeCompare(a.date||"")||0);

  const myReviews = allReviews.filter(r => r.userId === getCurrentUser()?.id);

  el.innerHTML = `
    <h2 style="font-size:22px;font-weight:900;margin-bottom:16px">My <span style="color:var(--accent2)">Reviews</span></h2>
    ${myReviews.length === 0 ? `
      <div class="empty">
        <div class="empty-icon">⭐</div>
        <div class="empty-title">No reviews yet</div>
        <div class="empty-sub">Open any title and leave a rating & review</div>
      </div>` : myReviews.map(r => `
        <div class="review-card">
          <div class="review-card-top">
            <div class="review-user">${r.itemId.replace("tmdb_","#").replace("in","🇮🇳 #")}</div>
            <div class="review-date">${r.date}</div>
          </div>
          <div class="review-stars">${"★".repeat(r.rating)}${"☆".repeat(5-r.rating)}</div>
          <div class="review-text">${r.text || "<em>No written review</em>"}</div>
        </div>`).join("")}
  `;
}

// ── STATS PAGE ────────────────────────────────────────────────────────────────
function renderStats() {
  const el = document.getElementById("page-stats");
  const items = getUserWatchlistAll();
  const indItems = INDIAN_SERIES.map(s => ({ ...s, status: getWatchStatus(getIndianWatch(s.id)) }));

  const byStatus = {
    done:     items.filter(i=>i.status==="done").length,
    watching: items.filter(i=>i.status==="watching").length,
    want:     items.filter(i=>i.status==="want").length,
    dropped:  items.filter(i=>i.status==="dropped").length,
  };
  const movies  = items.filter(i=>i.type==="movie").length;
  const series  = items.filter(i=>i.type==="series").length;
  const indDone = indItems.filter(i=>i.status==="done").length;
  const reviews = getReviews();
  const myReviewCount = Object.values(reviews).flat().filter(r=>r.userId===getCurrentUser()?.id).length;

  // bar data
  const years = [2019,2020,2021,2022,2023,2024,2025];
  const indByYear = years.map(y => indItems.filter(i=>i.year===y&&i.status==="done").length);
  const maxBar = Math.max(...indByYear, 1);

  el.innerHTML = `
    <h2 style="font-size:22px;font-weight:900;margin-bottom:20px">My <span style="color:var(--accent2)">Stats</span></h2>

    <div class="stats-row" style="margin-bottom:24px">
      <div class="stat-card"><div class="stat-n" style="color:var(--blue)">${items.length}</div><div class="stat-l">Total Library</div></div>
      <div class="stat-card"><div class="stat-n" style="color:var(--green)">${byStatus.done}</div><div class="stat-l">Completed</div></div>
      <div class="stat-card"><div class="stat-n" style="color:var(--yellow)">${myReviewCount}</div><div class="stat-l">Reviews</div></div>
      <div class="stat-card"><div class="stat-n" style="color:var(--accent2)">${indDone}</div><div class="stat-l">Indian Done</div></div>
    </div>

    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:16px">
      <div style="font-size:14px;font-weight:800;margin-bottom:16px">Library Breakdown</div>
      <div class="donut-wrap">
        <svg width="100" height="100" viewBox="0 0 36 36">
          ${donutPath(movies, series, byStatus.done, items.length)}
        </svg>
        <div class="donut-legend">
          ${[["Movies",movies,"#3b8bff"],["Series",series,"#aa66ff"],["Completed",byStatus.done,"#00e87a"],["Watching",byStatus.watching,"#ff6b45"]].map(([l,v,c])=>`
            <div class="donut-legend-item">
              <div class="donut-dot" style="background:${c}"></div>
              <span class="donut-legend-label">${l}</span>
              <span class="donut-legend-val">${v}</span>
            </div>`).join("")}
        </div>
      </div>
    </div>

    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:16px">
      <div style="font-size:14px;font-weight:800;margin-bottom:16px">🇮🇳 Indian Series Watched by Year</div>
      <div class="bar-chart">
        ${years.map((y,i) => `
          <div class="bar-col">
            <div class="bar-val">${indByYear[i]}</div>
            <div class="bar-fill" style="height:${Math.round((indByYear[i]/maxBar)*64)+4}px"></div>
            <div class="bar-label">${y}</div>
          </div>`).join("")}
      </div>
    </div>

    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px">
      <div style="font-size:14px;font-weight:800;margin-bottom:14px">Watch Status</div>
      ${Object.entries(byStatus).map(([k,v]) => {
        const cfg = STATUS_CONFIG[k] || STATUS_CONFIG["want"];
        const pct = items.length > 0 ? Math.round((v/items.length)*100) : 0;
        return `<div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px">
            <span style="color:${cfg.color};font-weight:700">${cfg.icon} ${cfg.label}</span>
            <span style="color:var(--text3)">${v} (${pct}%)</span>
          </div>
          <div class="prog-track"><div class="prog-fill" style="width:${pct}%;background:${cfg.color}"></div></div>
        </div>`;
      }).join("")}
    </div>
  `;
}

function donutPath(movies, series, done, total) {
  if (total === 0) return `<circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#1a2235" stroke-width="3.2"/>`;
  const r = 15.9, c = 2 * Math.PI * r;
  const segments = [
    { val: movies,  color: "#3b8bff" },
    { val: series,  color: "#aa66ff" },
  ].filter(s => s.val > 0);
  let offset = 0;
  return segments.map(s => {
    const pct = s.val / (total || 1);
    const dash = pct * c;
    const path = `<circle cx="18" cy="18" r="${r}" fill="transparent" stroke="${s.color}" stroke-width="3.2" stroke-dasharray="${dash} ${c}" stroke-dashoffset="${-offset}" transform="rotate(-90 18 18)" opacity="0.8"/>`;
    offset += dash;
    return path;
  }).join("");
}

// ── PROFILE PAGE ──────────────────────────────────────────────────────────────
function renderProfile() {
  const el = document.getElementById("page-profile");
  const user = getCurrentUser();
  el.innerHTML = `
    <div class="profile-card">
      <div class="profile-avatar">${(user.name||"U")[0].toUpperCase()}</div>
      <div class="profile-name">${user.name}</div>
      <div class="profile-email">${user.email}</div>
      <div style="font-size:12px;color:var(--text3);margin-top:8px">Member since ${user.joinDate || "2026"}</div>
    </div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px">
      <div class="info-row"><span class="info-row-label">Library</span><span class="info-row-value">${getUserWatchlistAll().length} titles</span></div>
      <div class="info-row"><span class="info-row-label">Reviews</span><span class="info-row-value">${Object.values(getReviews()).flat().filter(r=>r.userId===user.id).length}</span></div>
      <div class="info-row"><span class="info-row-label">Indian Series</span><span class="info-row-value">${INDIAN_SERIES.filter(s=>getWatchStatus(getIndianWatch(s.id))==="done").length} watched</span></div>
    </div>
    <div style="margin-top:16px">
      <button class="btn-ghost" onclick="handleLogout()">🚪 Logout</button>
    </div>
  `;
}

// ── WATCH TIME PAGE ───────────────────────────────────────────────────────────
function renderWatchtime() {
  const el = document.getElementById("page-watchtime");
  if (!el) return;
  const totalMin = getTotalWatchMinutes();
  const days     = getWatchTimeByDay();
  const streak   = getLongestStreak();
  const avgMin   = days.length > 0 ? Math.round(days.reduce((s,d)=>s+d.total,0)/days.length) : 0;
  const maxBar   = Math.max(...days.map(d=>d.total), 1);

  el.innerHTML = `
    <h2 style="font-size:22px;font-weight:900;margin-bottom:20px">⏱️ <span style="color:var(--accent2)">Watch Time</span></h2>

    <div class="stats-row" style="margin-bottom:24px">
      <div class="stat-card"><div class="stat-n" style="color:var(--accent2)">${formatMinutes(totalMin)}</div><div class="stat-l" data-lang="totalTime">Total Time</div></div>
      <div class="stat-card"><div class="stat-n" style="color:var(--blue)">${formatMinutes(avgMin)}</div><div class="stat-l" data-lang="avgPerDay">Avg/Day</div></div>
      <div class="stat-card"><div class="stat-n" style="color:var(--green)">${streak}</div><div class="stat-l" data-lang="longestStreak">Day Streak</div></div>
      <div class="stat-card"><div class="stat-n" style="color:var(--yellow)">${days.length}</div><div class="stat-l">Days Active</div></div>
    </div>

    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:20px">
      <div style="font-size:14px;font-weight:800;margin-bottom:16px">📅 Last 30 Days</div>
      ${days.length === 0 ? `<div style="color:var(--text3);font-size:13px;text-align:center;padding:20px">No watch time logged yet.<br>Open any title and tap ⏱️ to log time.</div>` : `
      <div class="bar-chart" style="height:100px">
        ${days.slice(-14).map(d => `
          <div class="bar-col">
            <div class="bar-val">${d.total >= 60 ? Math.round(d.total/60)+'h' : d.total+'m'}</div>
            <div class="bar-fill" style="height:${Math.round((d.total/maxBar)*80)+4}px"></div>
            <div class="bar-label">${d.date.slice(5)}</div>
          </div>`).join("")}
      </div>`}
    </div>

    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:20px">
      <div style="font-size:14px;font-weight:800;margin-bottom:14px">⏱️ Log Watch Time</div>
      <p style="font-size:12px;color:var(--text3);margin-bottom:12px">Open any title from your Watchlist or Indian Series and tap the ⏱️ button to log time.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        ${getUserWatchlistAll().filter(i=>i.status==='watching').slice(0,4).map(i=>`
          <button onclick="openWatchTimeModal('${i.id}','${(i.title||'').replace(/'/g,"\\'")}'" style="background:var(--surface2);border:1px solid var(--border2);border-radius:10px;padding:10px 14px;color:var(--text2);font-family:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border2)'">
            ⏱️ ${i.title}
          </button>`).join("")}
      </div>
    </div>
  `;
  applyLang();
}

// ── FAVOURITES PAGE ───────────────────────────────────────────────────────────
function renderFavourites() {
  const el   = document.getElementById("page-favourites");
  if (!el)   return;
  const favs = getUserFavourites();

  el.innerHTML = `
    <h2 style="font-size:22px;font-weight:900;margin-bottom:6px">❤️ <span style="color:var(--accent2)">Favourites</span></h2>
    <p style="font-size:12px;color:var(--text3);margin-bottom:20px">${favs.length} titles in your favourites</p>
    ${favs.length === 0
      ? `<div class="empty"><div class="empty-icon">❤️</div><div class="empty-title">No favourites yet</div><div class="empty-sub">Tap ❤️ on any title to add it here</div></div>`
      : `<div class="grid-2">${favs.map(item => mediaCardHTML(item)).join("")}</div>`}
  `;
}

// Patch showPage to support new pages
const _origRenderPage = typeof renderPage === 'function' ? renderPage : null;
