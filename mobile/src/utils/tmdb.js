// src/utils/tmdb.js
const TMDB_KEY  = '4e4da842c0aa548be7f2dde8b628c3ef'; // ← Replace with your key
const TMDB_BASE = 'https://api.themoviedb.org/3';

const _cache = {};
async function tmdbFetch(endpoint, params = {}) {
  const qs  = new URLSearchParams({ api_key: TMDB_KEY, ...params }).toString();
  const url = `${TMDB_BASE}${endpoint}?${qs}`;
  if (_cache[url]) return _cache[url];
  try {
    const res  = await fetch(url);
    const data = await res.json();
    _cache[url] = data;
    return data;
  } catch { return null; }
}

export function posterUrl(path, size = 'w500') {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}

export async function getTrending(type = 'all', page = 1) {
  return tmdbFetch(`/trending/${type}/week`, { page });
}
export async function getPopularMovies(page = 1) { return tmdbFetch('/movie/popular', { page }); }
export async function getPopularSeries(page = 1) { return tmdbFetch('/tv/popular',    { page }); }
export async function getTopRatedMovies()         { return tmdbFetch('/movie/top_rated'); }
export async function getTopRatedSeries()         { return tmdbFetch('/tv/top_rated'); }
export async function searchTMDB(query) {
  if (!query || query.length < 2) return [];
  const data = await tmdbFetch('/search/multi', { query, include_adult: false });
  return (data?.results || []).filter(r => r.media_type === 'movie' || r.media_type === 'tv').slice(0, 12);
}

export function normaliseItem(item) {
  const isTV = item.media_type === 'tv' || (item.name && !item.title);
  return {
    id:           'tmdb_' + item.id,
    tmdb_id:      item.id,
    title:        item.title || item.name || 'Unknown',
    type:         isTV ? 'series' : 'movie',
    poster_path:  item.poster_path,
    backdrop_path:item.backdrop_path,
    vote_average: item.vote_average ? item.vote_average.toFixed(1) : 'N/A',
    release_date: (item.release_date || item.first_air_date || '').slice(0, 4),
    overview:     item.overview || '',
    genres:       (item.genres || []).map(g => g.name),
    media_type:   isTV ? 'tv' : 'movie',
  };
}

export const FALLBACK_MOVIES = [
  { id:'tmdb_27205',  title:'Inception',    type:'movie',  vote_average:'8.8', release_date:'2010', emoji:'🌀', genres:['Sci-Fi','Thriller'] },
  { id:'tmdb_157336', title:'Interstellar', type:'movie',  vote_average:'8.7', release_date:'2014', emoji:'🌌', genres:['Sci-Fi','Drama'] },
  { id:'tmdb_693134', title:'Dune: Part Two',type:'movie', vote_average:'8.5', release_date:'2024', emoji:'🏜️', genres:['Sci-Fi','Adventure'] },
];
export const FALLBACK_SERIES = [
  { id:'tmdb_1396',   title:'Breaking Bad',        type:'series', vote_average:'9.5', release_date:'2008', emoji:'⚗️', genres:['Crime','Drama'] },
  { id:'tmdb_100088', title:'The Last of Us',      type:'series', vote_average:'8.8', release_date:'2023', emoji:'🌿', genres:['Drama','Horror'] },
  { id:'tmdb_114461', title:'Severance',            type:'series', vote_average:'8.7', release_date:'2022', emoji:'🏢', genres:['Drama','Sci-Fi'] },
];
