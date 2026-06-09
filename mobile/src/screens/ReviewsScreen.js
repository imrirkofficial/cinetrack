// src/screens/ReviewsScreen.js
import React, { useContext } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { AuthContext } from '../utils/AuthContext';
import { WatchlistContext } from '../utils/WatchlistContext';
import { INDIAN_SERIES } from '../utils/data';

const C = { bg:'#07090f', surface:'#0c0f1a', surface2:'#111622', border:'#1a2235', text:'#dde4f2', text2:'#5a7899', text3:'#2d3f5a', accent2:'#ff6b45', yellow:'#ffd166' };

export default function ReviewsScreen() {
  const { user }    = useContext(AuthContext);
  const { getItemReviews } = useContext(WatchlistContext);

  // Gather all review keys — we don't have a flat list, so pull from Indian + TMDB items
  // We'll use a trick: review context stores by itemId key
  // For display, show all reviews authored by current user
  // Since reviews are stored per item, we collect from known items
  const knownIds = INDIAN_SERIES.map(s => s.id);
  const myReviews = [];
  knownIds.forEach(id => {
    const rs = getItemReviews(id);
    const mine = rs.find(r => r.userId === user?.id);
    if (mine) {
      const series = INDIAN_SERIES.find(s => s.id === id);
      myReviews.push({ ...mine, itemName: series?.name || id, itemEmoji: series?.emoji || '🎬' });
    }
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding:20, paddingTop:64 }}>
      <Text style={styles.title}>My <Text style={{ color:C.accent2 }}>Reviews</Text></Text>

      {myReviews.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>⭐</Text>
          <Text style={styles.emptyTitle}>No reviews yet</Text>
          <Text style={styles.emptySub}>Open any title and leave a rating & review</Text>
        </View>
      ) : (
        myReviews.map((r, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardEmoji}>{r.itemEmoji}</Text>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{r.itemName}</Text>
                <Text style={styles.cardDate}>{r.date}</Text>
              </View>
            </View>
            <Text style={styles.stars}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</Text>
            {r.text ? <Text style={styles.reviewText}>{r.text}</Text> : null}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:  { flex:1, backgroundColor:C.bg },
  title:      { fontSize:22, fontWeight:'900', color:C.text, marginBottom:20 },
  empty:      { alignItems:'center', paddingTop:60 },
  emptyIcon:  { fontSize:52, marginBottom:14 },
  emptyTitle: { fontSize:16, fontWeight:'700', color:C.text3, marginBottom:4 },
  emptySub:   { fontSize:12, color:C.text3, textAlign:'center' },
  card:       { backgroundColor:C.surface, borderWidth:1, borderColor:C.border, borderRadius:12, padding:16, marginBottom:12 },
  cardTop:    { flexDirection:'row', alignItems:'center', gap:12, marginBottom:10 },
  cardEmoji:  { fontSize:32 },
  cardInfo:   { flex:1 },
  cardName:   { fontSize:14, fontWeight:'700', color:C.text, marginBottom:2 },
  cardDate:   { fontSize:11, color:C.text3 },
  stars:      { color:C.yellow, fontSize:18, marginBottom:8 },
  reviewText: { fontSize:13, color:C.text2, lineHeight:18 },
});


// ═══════════════════════════════════════════════
// src/screens/ProfileScreen.js
// ═══════════════════════════════════════════════
import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { AuthContext } from '../utils/AuthContext';
import { WatchlistContext } from '../utils/WatchlistContext';
import { INDIAN_SERIES, getWatchStatus } from '../utils/data';

const PC = { bg:'#07090f', surface:'#0c0f1a', surface2:'#111622', border:'#1a2235', border2:'#212d45', accent:'#e8472a', accent2:'#ff6b45', text:'#dde4f2', text2:'#5a7899', text3:'#2d3f5a', green:'#00e87a', blue:'#3b8bff', yellow:'#ffd166' };

export function ProfileScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const { getUserItems, getIndianWatch } = useContext(WatchlistContext);

  const items    = getUserItems();
  const indDone  = INDIAN_SERIES.filter(s => getWatchStatus(getIndianWatch(s.id) ?? s.watched) === 'done').length;
  const movies   = items.filter(i => i.type === 'movie').length;
  const series   = items.filter(i => i.type === 'series').length;
  const done     = items.filter(i => i.status === 'done').length;
  const watching = items.filter(i => i.status === 'watching').length;

  return (
    <ScrollView style={pStyles.container} contentContainerStyle={{ padding:20, paddingTop:64 }}>
      {/* Back */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom:16 }}>
        <Text style={{ color:PC.accent2, fontSize:13, fontWeight:'700' }}>← Back</Text>
      </TouchableOpacity>

      {/* Avatar card */}
      <View style={pStyles.avatarCard}>
        <View style={pStyles.avatar}>
          <Text style={pStyles.avatarText}>{(user?.name||'U')[0].toUpperCase()}</Text>
        </View>
        <Text style={pStyles.name}>{user?.name}</Text>
        <Text style={pStyles.email}>{user?.email}</Text>
        <Text style={pStyles.since}>Member since {user?.joinDate || '2026'}</Text>
      </View>

      {/* Stats grid */}
      <View style={pStyles.statsGrid}>
        {[
          { n:items.length, l:'Library',   c:PC.blue },
          { n:done,         l:'Completed', c:PC.green },
          { n:movies,       l:'Movies',    c:PC.blue },
          { n:series,       l:'Series',    c:'#aa66ff' },
          { n:watching,     l:'Watching',  c:PC.accent2 },
          { n:indDone,      l:'Indian 🇮🇳', c:PC.yellow },
        ].map(s => (
          <View key={s.l} style={pStyles.statCard}>
            <Text style={[pStyles.statN, { color:s.c }]}>{s.n}</Text>
            <Text style={pStyles.statL}>{s.l}</Text>
          </View>
        ))}
      </View>

      {/* Info rows */}
      <View style={pStyles.infoCard}>
        {[
          { l:'Account',    v: user?.email },
          { l:'Joined',     v: user?.joinDate || '2026' },
          { l:'Indian Done',v: `${indDone} / ${INDIAN_SERIES.length}` },
        ].map(row => (
          <View key={row.l} style={pStyles.infoRow}>
            <Text style={pStyles.infoLabel}>{row.l}</Text>
            <Text style={pStyles.infoValue}>{row.v}</Text>
          </View>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={pStyles.logoutBtn} onPress={logout}>
        <Text style={pStyles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>

      <View style={{ height:40 }}/>
    </ScrollView>
  );
}

export default ProfileScreen;

const pStyles = StyleSheet.create({
  container:  { flex:1, backgroundColor:PC.bg },
  avatarCard: { backgroundColor:PC.surface, borderWidth:1, borderColor:PC.border2, borderRadius:20, padding:28, alignItems:'center', marginBottom:16 },
  avatar:     { width:80, height:80, borderRadius:40, backgroundColor:PC.accent, alignItems:'center', justifyContent:'center', marginBottom:16 },
  avatarText: { color:'#fff', fontSize:32, fontWeight:'900' },
  name:       { fontSize:22, fontWeight:'900', color:PC.text, marginBottom:4 },
  email:      { fontSize:13, color:PC.text3, marginBottom:4 },
  since:      { fontSize:12, color:PC.text3 },
  statsGrid:  { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:16 },
  statCard:   { width:'30.5%', backgroundColor:PC.surface, borderWidth:1, borderColor:PC.border, borderRadius:12, padding:12, alignItems:'center' },
  statN:      { fontSize:22, fontWeight:'900' },
  statL:      { fontSize:9, color:PC.text3, fontWeight:'700', marginTop:2, textAlign:'center' },
  infoCard:   { backgroundColor:PC.surface, borderWidth:1, borderColor:PC.border, borderRadius:14, padding:16, marginBottom:16 },
  infoRow:    { flexDirection:'row', justifyContent:'space-between', paddingVertical:12, borderBottomWidth:1, borderBottomColor:PC.border },
  infoLabel:  { fontSize:12, color:PC.text3, fontWeight:'600' },
  infoValue:  { fontSize:13, fontWeight:'700', color:PC.text },
  logoutBtn:  { borderWidth:1, borderColor:'rgba(255,64,96,0.3)', borderRadius:12, padding:14, alignItems:'center', backgroundColor:'rgba(255,64,96,0.06)' },
  logoutText: { color:'#ff4060', fontSize:14, fontWeight:'700' },
});
