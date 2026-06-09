// src/screens/IndianScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WatchlistContext } from '../utils/WatchlistContext';
import { INDIAN_SERIES, getWatchStatus, getOttColor, STATUS_CONFIG } from '../utils/data';

const C = { bg:'#07090f', surface:'#0c0f1a', surface2:'#111622', border:'#1a2235', border2:'#212d45', accent:'#e8472a', accent2:'#ff6b45', text:'#dde4f2', text2:'#5a7899', text3:'#2d3f5a', green:'#00e87a', blue:'#3b8bff' };

const TABS   = [['all','All'],['done','Watched'],['partial','In Progress'],['no','Unwatched']];
const YEARS  = ['All', ...new Set(INDIAN_SERIES.map(s => s.year).sort((a,b)=>b-a))];
const OTTS   = ['All', ...new Set(INDIAN_SERIES.map(s => s.ott).filter(Boolean))].sort();

export default function IndianScreen() {
  const navigation = useNavigation();
  const { getIndianWatch } = useContext(WatchlistContext);
  const [tab,    setTab]    = useState('all');
  const [year,   setYear]   = useState('All');
  const [ott,    setOtt]    = useState('All');
  const [search, setSearch] = useState('');

  function ws(s) { return getWatchStatus(getIndianWatch(s.id) ?? s.watched); }

  const filtered = INDIAN_SERIES.filter(s => {
    const w   = ws(s);
    const q   = search.toLowerCase();
    const tabOk  = tab === 'all' || w === tab;
    const yearOk = year === 'All' || s.year == year;
    const ottOk  = ott === 'All' || (s.ott||'').toLowerCase().includes(ott.toLowerCase());
    const qOk    = !q || s.name.toLowerCase().includes(q) || (s.genre||'').toLowerCase().includes(q);
    return tabOk && yearOk && ottOk && qOk;
  });

  const done    = INDIAN_SERIES.filter(s => ws(s) === 'done').length;
  const partial = INDIAN_SERIES.filter(s => ws(s) === 'partial').length;
  const no      = INDIAN_SERIES.filter(s => ws(s) === 'no').length;

  function SeriesRow({ item }) {
    const w   = ws(item);
    const cfg = STATUS_CONFIG[w];
    const oc  = getOttColor(item.ott);
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => navigation.navigate('Detail', { item: { ...item, isIndian: true } })}
        activeOpacity={0.8}
      >
        <Text style={styles.rowEmoji}>{item.emoji}</Text>
        <View style={styles.rowInfo}>
          <Text style={styles.rowName} numberOfLines={1}>{item.name} <Text style={{ fontSize:10, color:C.text3 }}>{item.session}</Text></Text>
          <View style={styles.rowSub}>
            <Text style={styles.subText}>📅 {item.year}</Text>
            <Text style={styles.subText}>🗣️ {item.lang}</Text>
            {item.episodes ? <Text style={styles.subText}>📺 {item.episodes}ep</Text> : null}
          </View>
          {item.ott ? <Text style={[styles.ottText, { color: oc }]}>▶ {item.ott}</Text> : null}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg, borderColor: cfg.color + '66' }]}>
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.icon} {cfg.label}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🇮🇳 Indian <Text style={{ color:C.accent2 }}>Series</Text></Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { n:INDIAN_SERIES.length, l:'Total', c:C.blue },
            { n:done,    l:'Watched',  c:C.green },
            { n:partial, l:'Progress', c:C.accent2 },
            { n:no,      l:'Pending',  c:C.text3 },
          ].map(s => (
            <View key={s.l} style={styles.statCard}>
              <Text style={[styles.statN, { color:s.c }]}>{s.n}</Text>
              <Text style={styles.statL}>{s.l}</Text>
            </View>
          ))}
        </View>

        {/* Tab bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap:6, marginBottom:10 }}>
          {TABS.map(([k,l]) => (
            <TouchableOpacity key={k} onPress={() => setTab(k)} style={[styles.chip, tab===k && styles.chipActive]}>
              <Text style={[styles.chipText, tab===k && { color:C.accent2 }]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Search */}
        <TextInput style={styles.search} placeholder="Search series..." placeholderTextColor={C.text3} value={search} onChangeText={setSearch}/>

        {/* Year & OTT filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap:5, marginBottom:6 }}>
          {YEARS.map(y => (
            <TouchableOpacity key={y} onPress={() => setYear(String(y))} style={[styles.chip, year==y && styles.chipActive]}>
              <Text style={[styles.chipText, year==y && { color:C.accent2 }]}>{y}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap:5 }}>
          {OTTS.map(o => (
            <TouchableOpacity key={o} onPress={() => setOtt(o)} style={[styles.chip, ott===o && styles.chipActive]}>
              <Text style={[styles.chipText, ott===o && { color: getOttColor(o) }]}>{o||'Unknown'}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={({ item }) => <SeriesRow item={item}/>}
        contentContainerStyle={{ padding:12 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🎬</Text>
            <Text style={styles.emptyText}>No series found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex:1, backgroundColor:C.bg },
  header:      { paddingTop:56, paddingHorizontal:14, paddingBottom:10, borderBottomWidth:1, borderBottomColor:C.border, backgroundColor:C.bg },
  title:       { fontSize:22, fontWeight:'900', color:C.text, marginBottom:12 },
  statsRow:    { flexDirection:'row', gap:6, marginBottom:12 },
  statCard:    { flex:1, backgroundColor:C.surface, borderWidth:1, borderColor:C.border, borderRadius:10, padding:8, alignItems:'center' },
  statN:       { fontSize:18, fontWeight:'900' },
  statL:       { fontSize:8, color:C.text3, fontWeight:'700', marginTop:1 },
  chip:        { borderWidth:1, borderColor:C.border, borderRadius:7, paddingHorizontal:12, paddingVertical:5 },
  chipActive:  { backgroundColor:'rgba(232,71,42,0.12)', borderColor:C.accent },
  chipText:    { fontSize:10, fontWeight:'700', color:C.text3 },
  search:      { backgroundColor:C.surface2, borderWidth:1, borderColor:C.border, borderRadius:10, color:C.text, fontSize:13, padding:9, marginBottom:8 },
  row:         { backgroundColor:C.surface, borderWidth:1, borderColor:C.border, borderRadius:12, flexDirection:'row', alignItems:'center', gap:10, padding:12, marginBottom:8 },
  rowEmoji:    { fontSize:28, minWidth:38, textAlign:'center' },
  rowInfo:     { flex:1, minWidth:0 },
  rowName:     { fontSize:13, fontWeight:'700', color:C.text, marginBottom:3 },
  rowSub:      { flexDirection:'row', gap:8, marginBottom:3, flexWrap:'wrap' },
  subText:     { fontSize:10, color:C.text3 },
  ottText:     { fontSize:10, fontWeight:'700' },
  statusBadge: { borderWidth:1, borderRadius:8, paddingHorizontal:8, paddingVertical:4 },
  statusText:  { fontSize:9, fontWeight:'800' },
  empty:       { alignItems:'center', padding:60 },
  emptyIcon:   { fontSize:48, marginBottom:12 },
  emptyText:   { fontSize:14, fontWeight:'600', color:C.text3 },
});
