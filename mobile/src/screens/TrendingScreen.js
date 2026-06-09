// src/screens/TrendingScreen.js
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { tmdb as tmdbFetch, posterUrl, normaliseItem } from '../utils/tmdb';
import { WatchlistContext } from '../utils/WatchlistContext';

const C = { bg:'#0a0c14', surface:'#10131f', surface2:'#161926', border:'#1f2538', accent:'#6c63ff', accent2:'#8b83ff', text:'#e4eaf8', text2:'#6a82a8', text3:'#344060', green:'#22c55e' };

export default function TrendingScreen() {
  const nav = useNavigation();
  const { addItem, getEntry } = useContext(WatchlistContext);
  const [movies, setMovies] = useState([]);
  const [tv, setTv]         = useState([]);
  const [tab, setTab]       = useState('movies');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=4e4da842c0aa548be7f2dde8b628c3ef&region=IN`).then(r=>r.json()),
      fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=4e4da842c0aa548be7f2dde8b628c3ef&region=IN`).then(r=>r.json()),
    ]).then(([m, t]) => {
      setMovies((m?.results || []).slice(0, 15).map(i => ({...normaliseItem(i), media_type:'movie'})));
      setTv((t?.results || []).slice(0, 15).map(i => ({...normaliseItem(i), media_type:'tv'})));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const medals = ['🥇','🥈','🥉'];
  const list   = tab === 'movies' ? movies : tv;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔥 Trending <Text style={{ color:'#ff6b35' }}>India</Text></Text>
        <Text style={styles.sub}>Live from TMDB · Updates weekly</Text>
        <View style={styles.tabRow}>
          <TouchableOpacity onPress={() => setTab('movies')} style={[styles.tabBtn, tab==='movies' && styles.tabActive]}>
            <Text style={[styles.tabLabel, tab==='movies' && { color: C.text }]}>🎬 Movies</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab('tv')} style={[styles.tabBtn, tab==='tv' && styles.tabActive]}>
            <Text style={[styles.tabLabel, tab==='tv' && { color: C.text }]}>📺 Series</Text>
          </TouchableOpacity>
        </View>
      </View>
      {loading ? <ActivityIndicator color={C.accent} style={{ flex: 1 }} /> : (
        <ScrollView contentContainerStyle={{ padding: 14 }}>
          {list.map((item, i) => {
            const added = !!getEntry(item.id);
            return (
              <TouchableOpacity key={item.id} style={styles.row} onPress={() => nav.navigate('Detail', { item })} activeOpacity={0.85}>
                <View style={[styles.rank, i < 3 && { backgroundColor:'rgba(108,99,255,0.15)', borderColor: C.accent }]}>
                  <Text style={[styles.rankText, i < 3 && { color: C.accent2 }]}>{i < 3 ? medals[i] : i+1}</Text>
                </View>
                <View style={styles.poster}>
                  {item.poster_path ? <Image source={{ uri: posterUrl(item.poster_path) }} style={{ width:'100%', height:'100%' }} resizeMode="cover" /> : <Text style={{ fontSize: 20, textAlign:'center' }}>🎬</Text>}
                </View>
                <View style={styles.info}>
                  <Text style={styles.rowTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.rowMeta}>{item.release_date} · ⭐{item.vote_average}</Text>
                </View>
                {added
                  ? <Text style={styles.addedText}>✓ Added</Text>
                  : <TouchableOpacity onPress={() => addItem(item,'want')} style={styles.addBtn}><Text style={styles.addBtnText}>+Add</Text></TouchableOpacity>
                }
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:C.bg },
  header:    { paddingTop:56, paddingHorizontal:16, paddingBottom:12, borderBottomWidth:1, borderBottomColor:C.border, backgroundColor:C.bg },
  title:     { fontSize:22, fontWeight:'900', color:C.text, marginBottom:2 },
  sub:       { fontSize:11, color:C.text3, marginBottom:12 },
  tabRow:    { flexDirection:'row', backgroundColor:C.surface2, borderRadius:11, padding:4, gap:4 },
  tabBtn:    { flex:1, paddingVertical:9, borderRadius:8, alignItems:'center' },
  tabActive: { backgroundColor:C.surface, shadowColor:'#000', shadowOpacity:0.3, shadowRadius:4 },
  tabLabel:  { fontSize:13, fontWeight:'700', color:C.text3 },
  row:       { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:C.surface, borderWidth:1, borderColor:C.border, borderRadius:12, padding:10, marginBottom:8 },
  rank:      { width:28, height:28, borderRadius:14, borderWidth:1, borderColor:C.border, alignItems:'center', justifyContent:'center', flexShrink:0 },
  rankText:  { fontSize:12, fontWeight:'800', color:C.text3 },
  poster:    { width:40, height:56, borderRadius:8, overflow:'hidden', backgroundColor:C.surface2, flexShrink:0, alignItems:'center', justifyContent:'center' },
  info:      { flex:1, minWidth:0 },
  rowTitle:  { fontSize:13, fontWeight:'700', color:C.text, marginBottom:3 },
  rowMeta:   { fontSize:10, color:C.text3 },
  addBtn:    { backgroundColor:'rgba(108,99,255,0.12)', borderWidth:1, borderColor:C.accent, borderRadius:8, paddingHorizontal:10, paddingVertical:5 },
  addBtnText:{ fontSize:10, fontWeight:'800', color:C.accent2 },
  addedText: { fontSize:10, fontWeight:'700', color:C.green, flexShrink:0 },
});


// ════════════════════════════════════════════════
// src/screens/AnalyticsScreen.js
// ════════════════════════════════════════════════
import React, { useContext } from 'react';
import { View as VW, Text as TW, ScrollView as SV, TouchableOpacity as TO, StyleSheet as SS } from 'react-native';
import { AuthContext } from '../utils/AuthContext';
import { WatchlistContext } from '../utils/WatchlistContext';
import { INDIAN_SERIES, getWatchStatus, STATUS_CONFIG } from '../utils/data';

const AC = { bg:'#0a0c14', surface:'#10131f', surface2:'#161926', border:'#1f2538', border2:'#283048', accent:'#6c63ff', accent2:'#8b83ff', text:'#e4eaf8', text2:'#6a82a8', text3:'#344060', green:'#22c55e', yellow:'#fbbf24', red:'#ef4444' };
const GCOLORS = ['#6c63ff','#22c55e','#f59e0b','#ef4444','#3b82f6','#a855f7','#ec4899','#14b8a6'];

export function AnalyticsScreen() {
  const { user } = useContext(AuthContext);
  const { getUserItems, getIndianWatch } = useContext(WatchlistContext);
  const items    = getUserItems();
  const done     = items.filter(i => i.status === 'done');
  const watching = items.filter(i => i.status === 'watching');
  const indDone  = INDIAN_SERIES.filter(s => getWatchStatus(getIndianWatch(s.id) ?? s.watched) === 'done').length;

  // Genre analysis
  const allGenres = items.flatMap(i => (i.genres || []).concat((i.genre || '').split(',').map(g => g.trim()).filter(Boolean)));
  const genreCount = {};
  allGenres.forEach(g => { if(g) genreCount[g] = (genreCount[g] || 0) + 1; });
  const topGenres = Object.entries(genreCount).sort(([,a],[,b]) => b - a).slice(0, 6);
  const maxG = topGenres[0]?.[1] || 1;

  // Binge score
  const totalEp = done.filter(d => d.episodes).reduce((s, d) => s + (parseInt(d.episodes) || 0), 0);
  const bingeScore = totalEp + done.filter(d => !d.episodes).length * 2;
  const estHours = Math.round(totalEp * 0.4 + done.filter(d => !d.episodes).length * 2);

  // Status breakdown
  const byStatus = {
    done: done.length, watching: watching.length,
    want: items.filter(i => i.status === 'want').length,
    dropped: items.filter(i => i.status === 'dropped').length,
  };

  return (
    <SV style={aStyles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <VW style={aStyles.header}>
        <TW style={aStyles.title}>📊 My <TW style={{ color: AC.accent2 }}>Analytics</TW></TW>
      </VW>

      {/* Binge Score */}
      <VW style={aStyles.card}>
        <TW style={aStyles.cardTitle}>🔥 Binge Score</TW>
        <VW style={{ flexDirection:'row', alignItems:'center', gap:16 }}>
          <VW style={aStyles.scoreCircle}>
            <TW style={aStyles.scoreNum}>{bingeScore}</TW>
            <TW style={aStyles.scoreLbl}>SCORE</TW>
          </VW>
          <VW style={{ flex:1 }}>
            {[
              ['Episodes done', totalEp],
              ['Movies done', done.filter(d => !d.episodes).length],
              ['Est. watch time', `~${estHours}h`],
              ['Indian done', indDone],
            ].map(([l, v]) => (
              <VW key={l} style={{ flexDirection:'row', justifyContent:'space-between', paddingVertical:4, borderBottomWidth:1, borderBottomColor:AC.border }}>
                <TW style={{ fontSize:11, color:AC.text3 }}>{l}</TW>
                <TW style={{ fontSize:11, fontWeight:'800', color:AC.text }}>{v}</TW>
              </VW>
            ))}
          </VW>
        </VW>
      </VW>

      {/* Genre Taste */}
      <VW style={aStyles.card}>
        <TW style={aStyles.cardTitle}>🎭 Genre Taste</TW>
        {topGenres.length ? topGenres.map(([g, n], i) => (
          <VW key={g} style={{ marginBottom: 10 }}>
            <VW style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:4 }}>
              <TW style={{ fontSize:12, fontWeight:'600', color:GCOLORS[i % GCOLORS.length] }}>{g}</TW>
              <TW style={{ fontSize:11, color:AC.text3 }}>{n}</TW>
            </VW>
            <VW style={aStyles.genreTrack}>
              <VW style={[aStyles.genreFill, { width: `${Math.round((n/maxG)*100)}%`, backgroundColor: GCOLORS[i % GCOLORS.length] }]} />
            </VW>
          </VW>
        )) : <TW style={{ color:AC.text3, fontSize:12 }}>Add genres to your titles to see analysis</TW>}
      </VW>

      {/* Status breakdown */}
      <VW style={aStyles.card}>
        <TW style={aStyles.cardTitle}>📈 Watch Status</TW>
        {Object.entries(byStatus).map(([k, n]) => {
          const cfg = STATUS_CONFIG[k] || STATUS_CONFIG['want'];
          const pct = items.length ? Math.round((n / items.length) * 100) : 0;
          return (
            <VW key={k} style={{ marginBottom: 12 }}>
              <VW style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:5 }}>
                <TW style={{ fontSize:12, fontWeight:'700', color:cfg.color }}>{cfg.icon} {cfg.label}</TW>
                <TW style={{ fontSize:11, color:AC.text3 }}>{n} ({pct}%)</TW>
              </VW>
              <VW style={aStyles.genreTrack}>
                <VW style={[aStyles.genreFill, { width: `${pct}%`, backgroundColor: cfg.color }]} />
              </VW>
            </VW>
          );
        })}
      </VW>

      {/* Top rated */}
      <VW style={aStyles.card}>
        <TW style={aStyles.cardTitle}>⭐ Your Top Rated</TW>
        {items.filter(i => i.vote_average).sort((a,b) => parseFloat(b.vote_average) - parseFloat(a.vote_average)).slice(0,5).map((item, i) => (
          <VW key={item.id} style={{ flexDirection:'row', alignItems:'center', gap:10, paddingVertical:8, borderBottomWidth:1, borderBottomColor:AC.border }}>
            <TW style={{ fontSize:11, color:AC.text3, width:18 }}>{i+1}</TW>
            <TW style={{ flex:1, fontSize:13, fontWeight:'700', color:AC.text }}>{item.title}</TW>
            <TW style={{ fontSize:13, color:AC.yellow, fontWeight:'800' }}>⭐{item.vote_average}</TW>
          </VW>
        ))}
        {!items.filter(i => i.vote_average).length && <TW style={{ color:AC.text3, fontSize:12 }}>Rate titles to see rankings</TW>}
      </VW>
    </SV>
  );
}

export default AnalyticsScreen;

const aStyles = SS.create({
  container:   { flex:1, backgroundColor:AC.bg },
  header:      { paddingTop:56, paddingHorizontal:16, paddingBottom:14 },
  title:       { fontSize:22, fontWeight:'900', color:AC.text },
  card:        { margin:16, marginTop:0, marginBottom:12, backgroundColor:AC.surface, borderWidth:1, borderColor:AC.border, borderRadius:14, padding:18 },
  cardTitle:   { fontSize:14, fontWeight:'800', color:AC.text, marginBottom:14 },
  scoreCircle: { width:90, height:90, borderRadius:45, borderWidth:3, borderColor:AC.accent, alignItems:'center', justifyContent:'center', flexShrink:0 },
  scoreNum:    { fontSize:24, fontWeight:'900', color:AC.accent2 },
  scoreLbl:    { fontSize:8, color:AC.text3, fontWeight:'700', letterSpacing:1 },
  genreTrack:  { height:7, backgroundColor:AC.border, borderRadius:5, overflow:'hidden' },
  genreFill:   { height:'100%', borderRadius:5 },
});


// ════════════════════════════════════════════════
// src/screens/LeaderboardScreen.js
// ════════════════════════════════════════════════
import React, { useContext } from 'react';
import { View as LV, Text as LT, ScrollView as LS, StyleSheet as LSS } from 'react-native';
import { WatchlistContext } from '../utils/WatchlistContext';

const LC = { bg:'#0a0c14', surface:'#10131f', surface2:'#161926', border:'#1f2538', accent:'#6c63ff', accent2:'#8b83ff', text:'#e4eaf8', text2:'#6a82a8', text3:'#344060', green:'#22c55e', yellow:'#fbbf24' };
const LCOLORS = ['#fbbf24','#94a3b8','#cd7c2f','#6c63ff','#344060'];
const LMEDALS = ['🥇','🥈','🥉','4️⃣','5️⃣'];

export function LeaderboardScreen() {
  const { getUserItems } = useContext(WatchlistContext);
  const items = getUserItems();
  const done  = items.filter(i => i.status === 'done').length;
  const myScore = done * 10 + items.filter(i => i.status === 'watching').length * 3;
  const binge = items.filter(i => i.episodes && i.status === 'done').reduce((s, i) => s + (parseInt(i.episodes)||0), 0);

  const board = [
    { name:'You',       score:myScore,           done,        binge,       isMe:true },
    { name:'Rahul M',   score:Math.max(0,myScore-12), done:Math.max(0,done-2),  binge:binge-5  },
    { name:'Priya S',   score:myScore+18,        done:done+4, binge:binge+15 },
    { name:'Amit K',    score:Math.max(0,myScore-25), done:Math.max(0,done-5),  binge:Math.max(0,binge-20) },
    { name:'Sara J',    score:myScore+30,        done:done+6, binge:binge+25 },
  ].sort((a,b) => b.score - a.score);

  return (
    <LS style={lStyles.container} contentContainerStyle={{ paddingBottom:30 }}>
      <LV style={lStyles.header}>
        <LT style={lStyles.title}>🏆 <LT style={{ color:LC.yellow }}>Leaderboard</LT></LT>
        <LT style={lStyles.sub}>Score = Done×10 + Watching×3</LT>
      </LV>

      {board.map((p, i) => (
        <LV key={p.name} style={[lStyles.row, p.isMe && { borderColor:LC.accent, backgroundColor:'rgba(108,99,255,0.08)' }]}>
          <LV style={[lStyles.medal, { backgroundColor:`${LCOLORS[i]}22`, borderColor:`${LCOLORS[i]}44` }]}>
            <LT style={{ fontSize:16 }}>{LMEDALS[i]}</LT>
          </LV>
          <LV style={[lStyles.avatar, { backgroundColor:`${LCOLORS[i % LCOLORS.length]}22` }]}>
            <LT style={{ fontSize:14, fontWeight:'900', color:LCOLORS[i % LCOLORS.length] }}>{p.name[0]}</LT>
          </LV>
          <LV style={lStyles.info}>
            <LT style={lStyles.name}>{p.name}{p.isMe ? ' (You)' : ''}</LT>
            <LT style={lStyles.lsub}>✓ {p.done} done · 🔥 Binge: {Math.max(0,p.binge)}</LT>
          </LV>
          <LT style={[lStyles.score, { color: p.isMe ? LC.accent2 : LC.text2 }]}>{p.score}</LT>
        </LV>
      ))}

      <LV style={lStyles.myCard}>
        <LT style={lStyles.myCardTitle}>📊 Your Stats</LT>
        <LV style={{ flexDirection:'row', justifyContent:'space-around', marginTop:10 }}>
          {[['#'+( board.findIndex(p=>p.isMe)+1),'Your Rank',LC.accent2],[myScore+'','Score',LC.yellow],[binge+'','Binge',LC.green]].map(([v,l,c])=>(
            <LV key={l} style={{ alignItems:'center' }}>
              <LT style={{ fontSize:24, fontWeight:'900', color:c }}>{v}</LT>
              <LT style={{ fontSize:9, color:LC.text3, fontWeight:'700', marginTop:2 }}>{l}</LT>
            </LV>
          ))}
        </LV>
      </LV>
    </LS>
  );
}

export default LeaderboardScreen;

const lStyles = LSS.create({
  container: { flex:1, backgroundColor:LC.bg },
  header:    { paddingTop:56, paddingHorizontal:16, paddingBottom:14 },
  title:     { fontSize:22, fontWeight:'900', color:LC.text, marginBottom:2 },
  sub:       { fontSize:11, color:LC.text3 },
  row:       { flexDirection:'row', alignItems:'center', gap:10, marginHorizontal:16, marginBottom:8, backgroundColor:LC.surface, borderWidth:1, borderColor:LC.border, borderRadius:12, padding:12 },
  medal:     { width:32, height:32, borderRadius:16, borderWidth:1, alignItems:'center', justifyContent:'center', flexShrink:0 },
  avatar:    { width:38, height:38, borderRadius:19, alignItems:'center', justifyContent:'center', flexShrink:0 },
  info:      { flex:1, minWidth:0 },
  name:      { fontSize:13, fontWeight:'700', color:LC.text, marginBottom:2 },
  lsub:      { fontSize:10, color:LC.text3 },
  score:     { fontSize:20, fontWeight:'900' },
  myCard:    { margin:16, backgroundColor:LC.surface, borderWidth:1, borderColor:LC.border, borderRadius:14, padding:18 },
  myCardTitle:{ fontSize:14, fontWeight:'800', color:LC.text },
});
