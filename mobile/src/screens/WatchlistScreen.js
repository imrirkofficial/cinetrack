// src/screens/WatchlistScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WatchlistContext } from '../utils/WatchlistContext';
import { posterUrl } from '../utils/tmdb';
import { STATUS_CONFIG } from '../utils/data';

const C = { bg:'#07090f', surface:'#0c0f1a', surface2:'#111622', border:'#1a2235', border2:'#212d45', accent:'#e8472a', accent2:'#ff6b45', text:'#dde4f2', text2:'#5a7899', text3:'#2d3f5a', green:'#00e87a', blue:'#3b8bff', yellow:'#ffd166' };

const TABS   = [['all','All'],['watching','Watching'],['done','Completed'],['want','Want'],['dropped','Dropped']];
const SORTS  = [['addedAt','Recent'],['title','A–Z'],['rating','Rating']];

export default function WatchlistScreen() {
  const navigation = useNavigation();
  const { getUserItems } = useContext(WatchlistContext);
  const [tab,  setTab]  = useState('all');
  const [sort, setSort] = useState('addedAt');

  let items = getUserItems();
  if (tab !== 'all') items = items.filter(i => i.status === tab);
  items = [...items].sort((a, b) => {
    if (sort === 'title')  return (a.title||'').localeCompare(b.title||'');
    if (sort === 'rating') return parseFloat(b.vote_average||0) - parseFloat(a.vote_average||0);
    return (b.addedAt||0) - (a.addedAt||0);
  });

  const total   = getUserItems();
  const done    = total.filter(i => i.status === 'done').length;
  const watching= total.filter(i => i.status === 'watching').length;

  function WLRow({ item }) {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG['want'];
    const pct = item.episodes && item.progress ? Math.round((item.progress/item.episodes)*100) : 0;
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => navigation.navigate('Detail', { item })}
        activeOpacity={0.8}
      >
        <View style={styles.poster}>
          {item.poster_path
            ? <Image source={{ uri: posterUrl(item.poster_path) }} style={styles.posterImg} resizeMode="cover"/>
            : <View style={styles.posterPh}><Text style={{ fontSize:22 }}>{item.emoji||'🎬'}</Text></View>
          }
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{item.title}</Text>
          <View style={styles.subRow}>
            {item.release_date ? <Text style={styles.subText}>{item.release_date}</Text> : null}
            {item.vote_average ? <Text style={styles.subText}>⭐ {item.vote_average}</Text> : null}
            {item.type ? <Text style={styles.subText}>{item.type === 'series' ? '📺' : '🎬'} {item.type}</Text> : null}
          </View>
          {item.episodes && item.progress > 0 ? (
            <View style={styles.progTrack}>
              <View style={[styles.progFill, { width:`${pct}%` }]}/>
            </View>
          ) : null}
        </View>
        <View style={[styles.badge, { backgroundColor:cfg.bg, borderColor:cfg.color+'55' }]}>
          <Text style={[styles.badgeText, { color:cfg.color }]}>{cfg.icon} {cfg.label}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My <Text style={{ color:C.accent2 }}>Watchlist</Text></Text>

        {/* Mini stats */}
        <View style={styles.statsRow}>
          {[
            { n:total.length, l:'Total',    c:C.blue },
            { n:done,         l:'Completed',c:C.green },
            { n:watching,     l:'Watching', c:C.accent2 },
          ].map(s => (
            <View key={s.l} style={styles.statCard}>
              <Text style={[styles.statN, { color:s.c }]}>{s.n}</Text>
              <Text style={styles.statL}>{s.l}</Text>
            </View>
          ))}
        </View>

        {/* Tab chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap:6, marginBottom:10 }}>
          {TABS.map(([k,l]) => (
            <TouchableOpacity key={k} onPress={() => setTab(k)} style={[styles.chip, tab===k && styles.chipOn]}>
              <Text style={[styles.chipTxt, tab===k && { color:C.accent2 }]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap:5, alignItems:'center' }}>
          <Text style={{ fontSize:10, color:C.text3, fontWeight:'700', marginRight:2 }}>Sort:</Text>
          {SORTS.map(([k,l]) => (
            <TouchableOpacity key={k} onPress={() => setSort(k)} style={[styles.chip, sort===k && { borderColor:C.border2 }]}>
              <Text style={[styles.chipTxt, sort===k && { color:C.text2 }]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={items}
        keyExtractor={i => String(i.id)}
        renderItem={({ item }) => <WLRow item={item}/>}
        contentContainerStyle={{ padding:12 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptySub}>Discover titles and add to your list</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex:1, backgroundColor:C.bg },
  header:     { paddingTop:56, paddingHorizontal:14, paddingBottom:10, borderBottomWidth:1, borderBottomColor:C.border, backgroundColor:C.bg },
  title:      { fontSize:22, fontWeight:'900', color:C.text, marginBottom:12 },
  statsRow:   { flexDirection:'row', gap:8, marginBottom:14 },
  statCard:   { flex:1, backgroundColor:C.surface, borderWidth:1, borderColor:C.border, borderRadius:10, padding:10, alignItems:'center' },
  statN:      { fontSize:22, fontWeight:'900' },
  statL:      { fontSize:8, color:C.text3, fontWeight:'700', marginTop:2 },
  chip:       { borderWidth:1, borderColor:C.border, borderRadius:7, paddingHorizontal:12, paddingVertical:5 },
  chipOn:     { backgroundColor:'rgba(232,71,42,0.12)', borderColor:C.accent },
  chipTxt:    { fontSize:11, fontWeight:'700', color:C.text3 },
  row:        { backgroundColor:C.surface, borderWidth:1, borderColor:C.border, borderRadius:12, flexDirection:'row', alignItems:'center', gap:12, padding:12, marginBottom:8 },
  poster:     { width:46, height:62, borderRadius:8, overflow:'hidden', backgroundColor:C.surface2 },
  posterImg:  { width:'100%', height:'100%' },
  posterPh:   { width:'100%', height:'100%', alignItems:'center', justifyContent:'center' },
  info:       { flex:1, minWidth:0 },
  name:       { fontSize:13, fontWeight:'700', color:C.text, marginBottom:3 },
  subRow:     { flexDirection:'row', gap:8, marginBottom:4, flexWrap:'wrap' },
  subText:    { fontSize:10, color:C.text3 },
  progTrack:  { height:4, backgroundColor:C.border, borderRadius:4, overflow:'hidden' },
  progFill:   { height:'100%', backgroundColor:C.accent2, borderRadius:4 },
  badge:      { borderWidth:1, borderRadius:8, paddingHorizontal:8, paddingVertical:4 },
  badgeText:  { fontSize:9, fontWeight:'800' },
  empty:      { alignItems:'center', padding:60 },
  emptyIcon:  { fontSize:48, marginBottom:14 },
  emptyTitle: { fontSize:16, fontWeight:'700', color:C.text3, marginBottom:4 },
  emptySub:   { fontSize:12, color:C.text3 },
});
