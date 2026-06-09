// src/screens/HomeScreen.js
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AuthContext } from '../utils/AuthContext';
import { WatchlistContext } from '../utils/WatchlistContext';
import { getTrending, normaliseItem, posterUrl, FALLBACK_MOVIES, FALLBACK_SERIES } from '../utils/tmdb';
import { INDIAN_SERIES, getWatchStatus } from '../utils/data';
import MediaCard from '../components/MediaCard';

const { width } = Dimensions.get('window');
const C = { bg:'#07090f', surface:'#0c0f1a', border:'#1a2235', accent:'#e8472a', accent2:'#ff6b45', text:'#dde4f2', text2:'#5a7899', text3:'#2d3f5a', green:'#00e87a', blue:'#3b8bff', yellow:'#ffd166' };

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { getUserItems, getIndianWatch } = useContext(WatchlistContext);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrending().then(data => {
      const items = data ? data.results.slice(0, 12).map(normaliseItem) : [...FALLBACK_MOVIES, ...FALLBACK_SERIES];
      setTrending(items);
      setLoading(false);
    });
  }, []);

  const wlItems    = getUserItems();
  const doneCount  = wlItems.filter(i => i.status === 'done').length;
  const watchCount = wlItems.filter(i => i.status === 'watching').length;
  const indDone    = INDIAN_SERIES.filter(s => getWatchStatus(getIndianWatch(s.id) ?? s.watched) === 'done').length;
  const featured   = trending[0];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome back 👋</Text>
          <Text style={styles.name}>{(user?.name||'User').split(' ')[0]}<Text style={{ color: C.accent2 }}>.</Text></Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.name||'U')[0].toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { n: wlItems.length,    l: 'Library',   c: C.blue },
          { n: doneCount,         l: 'Completed',  c: C.green },
          { n: watchCount,        l: 'Watching',   c: C.accent2 },
          { n: indDone,           l: 'Indian',     c: C.yellow },
        ].map(s => (
          <View key={s.l} style={styles.statCard}>
            <Text style={[styles.statN, { color: s.c }]}>{s.n}</Text>
            <Text style={styles.statL}>{s.l}</Text>
          </View>
        ))}
      </View>

      {/* Hero / Featured */}
      {featured && (
        <TouchableOpacity style={styles.hero} onPress={() => navigation.navigate('Detail', { item: featured })}>
          <View style={styles.heroBg}>
            {featured.poster_path && (
              <Image source={{ uri: posterUrl(featured.poster_path) }} style={styles.heroBgImg} blurRadius={3}/>
            )}
            <LinearGradient colors={['rgba(7,9,15,0.0)','rgba(7,9,15,0.98)']} style={styles.heroGrad}/>
          </View>
          <View style={styles.heroContent}>
            <Text style={styles.heroBadge}>✦ FEATURED</Text>
            <Text style={styles.heroTitle} numberOfLines={2}>{featured.title}</Text>
            <View style={styles.heroMeta}>
              <Text style={styles.heroMetaText}>📅 {featured.release_date}</Text>
              <Text style={styles.heroMetaText}>⭐ {featured.vote_average}</Text>
              <Text style={styles.heroMetaText}>{featured.type === 'series' ? '📺 Series' : '🎬 Movie'}</Text>
            </View>
            <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.navigate('Detail', { item: featured })}>
              <Text style={styles.heroBtnText}>+ Add to List</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* Trending */}
      <View style={styles.sectionHdr}>
        <Text style={styles.sectionTitle}>Trending <Text style={{ color: C.accent2 }}>Now</Text></Text>
        <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Discover')}>
          <Text style={styles.seeAll}>See all →</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator color={C.accent} style={{ marginVertical: 40 }}/>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
          {trending.map(item => (
            <MediaCard key={item.id} item={item} width={140} onPress={() => navigation.navigate('Detail', { item })}/>
          ))}
        </ScrollView>
      )}

      {/* Indian */}
      <View style={[styles.sectionHdr, { marginTop: 24 }]}>
        <Text style={styles.sectionTitle}>🇮🇳 Indian <Text style={{ color: C.accent2 }}>Series</Text></Text>
        <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Indian')}>
          <Text style={styles.seeAll}>See all →</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 4 }}>
        {INDIAN_SERIES.slice(0, 8).map(s => (
          <TouchableOpacity key={s.id} style={styles.indCard} onPress={() => navigation.navigate('Detail', { item: { ...s, isIndian: true } })}>
            <Text style={styles.indEmoji}>{s.emoji}</Text>
            <Text style={styles.indName} numberOfLines={2}>{s.name}</Text>
            <Text style={styles.indSub}>{s.year}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ height: 32 }}/>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: C.bg },
  header:      { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:16, paddingTop:56, paddingBottom:16 },
  welcome:     { fontSize:12, color:C.text3, fontWeight:'600', marginBottom:2 },
  name:        { fontSize:26, fontWeight:'900', color:C.text },
  avatar:      { width:42, height:42, borderRadius:21, backgroundColor:C.accent, alignItems:'center', justifyContent:'center' },
  avatarText:  { color:'#fff', fontWeight:'900', fontSize:16 },
  statsRow:    { flexDirection:'row', paddingHorizontal:12, gap:8, marginBottom:20 },
  statCard:    { flex:1, backgroundColor:C.surface, borderWidth:1, borderColor:C.border, borderRadius:12, padding:12, alignItems:'center' },
  statN:       { fontSize:22, fontWeight:'900' },
  statL:       { fontSize:9, color:C.text3, fontWeight:'700', marginTop:2, letterSpacing:0.4 },
  hero:        { marginHorizontal:16, borderRadius:18, overflow:'hidden', marginBottom:24, height:220 },
  heroBg:      { position:'absolute', top:0, left:0, right:0, bottom:0 },
  heroBgImg:   { width:'100%', height:'100%' },
  heroGrad:    { position:'absolute', top:0, left:0, right:0, bottom:0 },
  heroContent: { position:'absolute', bottom:20, left:20, right:20 },
  heroBadge:   { fontSize:9, color:C.accent2, fontWeight:'800', letterSpacing:2, marginBottom:6 },
  heroTitle:   { fontSize:22, fontWeight:'900', color:'#fff', marginBottom:6, lineHeight:28 },
  heroMeta:    { flexDirection:'row', gap:12, marginBottom:12 },
  heroMetaText:{ fontSize:11, color:'rgba(255,255,255,0.6)' },
  heroBtn:     { backgroundColor:C.accent, paddingHorizontal:20, paddingVertical:10, borderRadius:10, alignSelf:'flex-start' },
  heroBtnText: { color:'#fff', fontSize:13, fontWeight:'700' },
  sectionHdr:  { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:16, marginBottom:12 },
  sectionTitle:{ fontSize:18, fontWeight:'900', color:C.text },
  seeAll:      { fontSize:12, color:C.accent, fontWeight:'700' },
  indCard:     { width:110, backgroundColor:C.surface, borderWidth:1, borderColor:C.border, borderRadius:12, padding:12, alignItems:'center' },
  indEmoji:    { fontSize:32, marginBottom:8 },
  indName:     { fontSize:11, fontWeight:'700', color:C.text, textAlign:'center', marginBottom:4 },
  indSub:      { fontSize:10, color:C.text3 },
});
