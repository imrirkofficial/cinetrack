// ═══════════════════════════════════════════════
// CineTrack — TMDB API Integration
// ═══════════════════════════════════════════════
// Get your free API key at: https://www.themoviedb.org/settings/api
// Replace TMDB_API_KEY below with your key

const TMDB_KEY  = "4e4da842c0aa548be7f2dde8b628c3ef"; // ← Replace with your key
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG  = "https://image.tmdb.org/t/p/w500";
const TMDB_BACK = "https://image.tmdb.org/t/p/w1280";

const _cache = {};

async function tmdbFetch(endpoint, params = {}) {
  const cacheKey = endpoint + JSON.stringify(params);
  if (_cache[cacheKey]) return _cache[cacheKey];

  const url = new URL(TMDB_BASE + endpoint);
  url.searchParams.set("api_key", TMDB_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("TMDB " + res.status);
    const data = await res.json();
    _cache[cacheKey] = data;
    return data;
  } catch (e) {
    console.warn("TMDB fetch error:", e.message);
    return null;
  }
}

function posterUrl(path, size = "w500") {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

function backdropUrl(path) { return posterUrl(path, "w1280"); }

// ── TRENDING ──────────────────────────────────────────────────────────────────
async function getTrending(type = "all", page = 1) {
  return await tmdbFetch(`/trending/${type}/week`, { page });
}

// ── POPULAR ───────────────────────────────────────────────────────────────────
async function getPopularMovies(page = 1) {
  return await tmdbFetch("/movie/popular", { page, region: "IN" });
}

async function getPopularSeries(page = 1) {
  return await tmdbFetch("/tv/popular", { page });
}

// ── TOP RATED ────────────────────────────────────────────────────────────────
async function getTopRatedMovies() {
  return await tmdbFetch("/movie/top_rated", { region: "IN" });
}

async function getTopRatedSeries() {
  return await tmdbFetch("/tv/top_rated");
}

// ── SEARCH ────────────────────────────────────────────────────────────────────
async function searchTMDB(query) {
  if (!query || query.length < 2) return [];
  const data = await tmdbFetch("/search/multi", { query, include_adult: false, language: "en-US" });
  return (data?.results || []).filter(r => r.media_type === "movie" || r.media_type === "tv").slice(0, 12);
}

// ── DETAIL ────────────────────────────────────────────────────────────────────
async function getMovieDetail(id) {
  return await tmdbFetch(`/movie/${id}`, { append_to_response: "credits,similar" });
}

async function getTVDetail(id) {
  return await tmdbFetch(`/tv/${id}`, { append_to_response: "credits,similar" });
}

// ── GENRES ───────────────────────────────────────────────────────────────────
async function getGenres() {
  const [movies, tv] = await Promise.all([
    tmdbFetch("/genre/movie/list"),
    tmdbFetch("/genre/tv/list"),
  ]);
  const all = [...(movies?.genres || []), ...(tv?.genres || [])];
  return [...new Map(all.map(g => [g.id, g])).values()];
}

// ── DISCOVER ──────────────────────────────────────────────────────────────────
async function discoverMovies(opts = {}) {
  return await tmdbFetch("/discover/movie", {
    sort_by: opts.sort || "popularity.desc",
    with_genres: opts.genre || "",
    year: opts.year || "",
    page: opts.page || 1,
  });
}

async function discoverTV(opts = {}) {
  return await tmdbFetch("/discover/tv", {
    sort_by: opts.sort || "popularity.desc",
    with_genres: opts.genre || "",
    first_air_date_year: opts.year || "",
    page: opts.page || 1,
  });
}

// ── NORMALISE (Movie/TV → common shape) ─────────────────────────────────────
function normaliseItem(item) {
  const isTV = item.media_type === "tv" || item.name !== undefined;
  return {
    id:           "tmdb_" + item.id,
    tmdb_id:      item.id,
    title:        item.title || item.name || "Unknown",
    type:         isTV ? "series" : "movie",
    poster_path:  item.poster_path,
    backdrop_path:item.backdrop_path,
    vote_average: item.vote_average ? item.vote_average.toFixed(1) : "N/A",
    release_date: (item.release_date || item.first_air_date || "").slice(0, 4),
    overview:     item.overview || "",
    genre_ids:    item.genre_ids || [],
    genres:       (item.genres || []).map(g => g.name),
    media_type:   isTV ? "tv" : "movie",
  };
}

// ── FALLBACK DATA (when no API key) ──────────────────────────────────────────
const FALLBACK_MOVIES = [
  { id:"tmdb_27205", tmdb_id:27205, title:"Inception", type:"movie", vote_average:"8.8", release_date:"2010", overview:"A thief who steals corporate secrets through dream-sharing technology.", emoji:"🌀", genres:["Action","Sci-Fi","Thriller"] },
  { id:"tmdb_157336", tmdb_id:157336, title:"Interstellar", type:"movie", vote_average:"8.7", release_date:"2014", overview:"A team of explorers travel through a wormhole in space.", emoji:"🌌", genres:["Sci-Fi","Drama","Adventure"] },
  { id:"tmdb_872585", tmdb_id:872585, title:"Oppenheimer", type:"movie", vote_average:"8.5", release_date:"2023", overview:"The story of American scientist J. Robert Oppenheimer.", emoji:"☢️", genres:["Drama","History","Thriller"] },
  { id:"tmdb_1011985", tmdb_id:1011985, title:"Kung Fu Panda 4", type:"movie", vote_average:"7.0", release_date:"2024", overview:"Po must train a new Dragon Warrior.", emoji:"🐼", genres:["Animation","Comedy","Family"] },
  { id:"tmdb_693134", tmdb_id:693134, title:"Dune: Part Two", type:"movie", vote_average:"8.5", release_date:"2024", overview:"Paul Atreides unites with Chani and the Fremen.", emoji:"🏜️", genres:["Sci-Fi","Adventure","Drama"] },
  { id:"tmdb_519182", tmdb_id:519182, title:"Despicable Me 4", type:"movie", vote_average:"7.0", release_date:"2024", overview:"Gru faces a new nemesis.", emoji:"💛", genres:["Animation","Comedy","Family"] },
];
const FALLBACK_SERIES = [
  { id:"tmdb_1396", tmdb_id:1396, title:"Breaking Bad", type:"series", vote_average:"9.5", release_date:"2008", overview:"A high school chemistry teacher turned methamphetamine manufacturer.", emoji:"⚗️", genres:["Crime","Drama","Thriller"] },
  { id:"tmdb_94997", tmdb_id:94997, title:"House of the Dragon", type:"series", vote_average:"8.4", release_date:"2022", overview:"The story of House Targaryen set 200 years before Game of Thrones.", emoji:"🐉", genres:["Fantasy","Drama","Action"] },
  { id:"tmdb_100088", tmdb_id:100088, title:"The Last of Us", type:"series", vote_average:"8.8", release_date:"2023", overview:"Post-apocalyptic story of survival and love.", emoji:"🌿", genres:["Drama","Horror","Sci-Fi"] },
  { id:"tmdb_37854", tmdb_id:37854, title:"One Piece", type:"series", vote_average:"8.9", release_date:"1999", overview:"Monkey D. Luffy explores the Grand Line to find the treasure One Piece.", emoji:"🏴‍☠️", genres:["Animation","Adventure","Comedy"] },
  { id:"tmdb_114461", tmdb_id:114461, title:"Severance", type:"series", vote_average:"8.7", release_date:"2022", overview:"Workers have their memories surgically divided between work and personal life.", emoji:"🏢", genres:["Drama","Mystery","Sci-Fi"] },
  { id:"tmdb_120089", tmdb_id:120089, title:"Shogun", type:"series", vote_average:"8.9", release_date:"2024", overview:"English navigator arrives in feudal Japan.", emoji:"⚔️", genres:["Drama","History","Action"] },
];
