// src/screens/DiscoverScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MediaCard from '../components/MediaCard';
import { getTrending, getPopularMovies, getPopularSeries, getTopRatedMovies, getTopRatedSeries, normaliseItem, FALLBACK_MOVIES, FALLBACK_SERIES } from '../utils/tmdb';

const C = { bg:'#07090f', surface:'#0c0f1a', surface2:'#111622', border:'#1a2235', border2:'#212d45', accent:'#e8472a', accent2:'#ff6b45', text:'#dde4f2', text2:'#5a7899', text3:'#2d3f5a' };

const TABS = [
  { key:'all',    label:'🎬 All' },
  { key:'movie',  label:'🎥 Movies' },
  { key:'series', label:'📺 Series' },
  { key:'top',    label:'⭐ Top Rated' },
];

export default function DiscoverScreen() {
  const navigation = useNavigation();
  const [tab, setTab]         = useState('all');
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState('');
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async (reset = true) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    const pg = reset ? 1 : page;
    let data;

    if (tab === 'top') {
      const [m, t] = await Promise.all([getTopRatedMovies(), getTopRatedSeries()]);
      const merged = [
        ...(m?.results || []).map(i => ({ ...i, media_type:'movie' })),
        ...(t?.results || []).map(i => ({ ...i, media_type:'tv' })),
      ].sort((a, b) => b.vote_average - a.vote_average);
      data = { results: merged };
    } else if (tab === 'movie') {
      data = await getPopularMovies(pg);
      if (data) data.results = data.results.map(i => ({ ...i, media_type:'movie' }));
    } else if (tab === 'series') {
      data = await getPopularSeries(pg);
      if (data) data.results = data.results.map(i => ({ ...i, media_type:'tv' }));
    } else {
      data = await getTrending('all', pg);
    }

    const fetched = data ? data.results.map(normaliseItem) : [...FALLBACK_MOVIES, ...FALLBACK_SERIES];
    setItems(prev => reset ? fetched : [...prev, ...fetched]);
    setPage(pg + 1);
    setLoading(false);
    setLoadingMore(false);
  }, [tab, page]);

  useEffect(() => { load(true); }, [tab]);

  const filtered = search.length > 1
    ? items.filter(i => i.title.toLowerCase().includes(search.toLowerCase()))
    : items;

  const numCols = 2;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Discover <Text style={{ color:C.accent2 }}>Titles</Text></Text>
        <TextInput
          style={styles.search}
          placeholder="Search..."
          placeholderTextColor={C.text3}
          value={search}
          onChangeText={setSearch}
        />
        {/* Tab chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap:6, paddingVertical:2 }}>
          {TABS.map(t => (
            <TouchableOpacity
              key={t.key}
              onPress={() => { setTab(t.key); setSearch(''); }}
              style={[styles.chip, tab === t.key && styles.chipActive]}
            >
              <Text style={[styles.chipText, tab === t.key && { color:C.accent2 }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator color={C.accent} style={{ flex:1 }}/>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          numColumns={numCols}
          contentContainerStyle={{ padding:12, gap:10 }}
          columnWrapperStyle={{ gap:10 }}
          renderItem={({ item }) => (
            <MediaCard
              item={item}
              width={(null)}
              style={{ flex:1 }}
              onPress={() => navigation.navigate('HomeMain', { screen:'Detail', params:{ item } })}
            />
          )}
          onEndReached={() => { if (!loadingMore && !search) load(false); }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={C.accent} style={{ padding:20 }}/> : null}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:C.bg },
  header:    { paddingTop:56, paddingHorizontal:16, paddingBottom:10, borderBottomWidth:1, borderBottomColor:C.border, backgroundColor:C.bg },
  title:     { fontSize:22, fontWeight:'900', color:C.text, marginBottom:12 },
  search:    { backgroundColor:C.surface2, borderWidth:1, borderColor:C.border, borderRadius:10, color:C.text, fontSize:14, padding:10, marginBottom:10 },
  chip:      { borderWidth:1, borderColor:C.border, borderRadius:8, paddingHorizontal:14, paddingVertical:6, backgroundColor:'transparent' },
  chipActive:{ backgroundColor:'rgba(232,71,42,0.12)', borderColor:C.accent },
  chipText:  { fontSize:11, fontWeight:'700', color:C.text3 },
});
