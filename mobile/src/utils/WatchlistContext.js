// src/utils/WatchlistContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';

export const WatchlistContext = createContext(null);

export function WatchlistProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [watchlist, setWatchlist] = useState({});
  const [indianState, setIndianState] = useState({});
  const [reviews, setReviews] = useState({});

  const load = useCallback(async () => {
    const [wl, is, rv] = await Promise.all([
      AsyncStorage.getItem('ct_watchlist'),
      AsyncStorage.getItem('ct_indian'),
      AsyncStorage.getItem('ct_reviews'),
    ]);
    if (wl) setWatchlist(JSON.parse(wl));
    if (is) setIndianState(JSON.parse(is));
    if (rv) setReviews(JSON.parse(rv));
  }, []);

  useEffect(() => { if (user) load(); }, [user]);

  const saveWL = async (wl) => { setWatchlist(wl); await AsyncStorage.setItem('ct_watchlist', JSON.stringify(wl)); };
  const saveIS = async (is) => { setIndianState(is); await AsyncStorage.setItem('ct_indian',   JSON.stringify(is)); };
  const saveRV = async (rv) => { setReviews(rv);     await AsyncStorage.setItem('ct_reviews',   JSON.stringify(rv)); };

  function getUserItems() {
    if (!user) return [];
    const prefix = user.id + '_';
    return Object.entries(watchlist).filter(([k]) => k.startsWith(prefix)).map(([,v]) => v);
  }

  function getEntry(itemId) {
    if (!user) return null;
    return watchlist[user.id + '_' + itemId] || null;
  }

  async function addItem(item, status = 'want') {
    const wl = { ...watchlist };
    wl[user.id + '_' + item.id] = { ...item, status, progress: 0, addedAt: Date.now() };
    await saveWL(wl);
  }

  async function removeItem(itemId) {
    const wl = { ...watchlist };
    delete wl[user.id + '_' + itemId];
    await saveWL(wl);
  }

  async function updateStatus(itemId, status) {
    const wl = { ...watchlist };
    const key = user.id + '_' + itemId;
    if (wl[key]) { wl[key].status = status; await saveWL(wl); }
  }

  async function updateProgress(itemId, progress) {
    const wl = { ...watchlist };
    const key = user.id + '_' + itemId;
    if (wl[key]) { wl[key].progress = progress; await saveWL(wl); }
  }

  function getIndianWatch(id) { return indianState[id] !== undefined ? indianState[id] : null; }
  async function setIndianWatch(id, val) { await saveIS({ ...indianState, [id]: val }); }

  function getItemReviews(itemId) { return reviews[itemId] || []; }
  function getUserReview(itemId) {
    if (!user) return null;
    return getItemReviews(itemId).find(r => r.userId === user.id) || null;
  }
  async function addReview(itemId, rating, text) {
    const rv = { ...reviews };
    if (!rv[itemId]) rv[itemId] = [];
    rv[itemId] = rv[itemId].filter(r => r.userId !== user.id);
    rv[itemId].push({ userId: user.id, userName: user.name, rating, text,
      date: new Date().toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'numeric' }) });
    await saveRV(rv);
  }

  return (
    <WatchlistContext.Provider value={{
      getUserItems, getEntry, addItem, removeItem, updateStatus, updateProgress,
      getIndianWatch, setIndianWatch, getItemReviews, getUserReview, addReview,
    }}>
      {children}
    </WatchlistContext.Provider>
  );
}
