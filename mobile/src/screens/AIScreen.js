// src/screens/AIScreen.js
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WatchlistContext } from '../utils/WatchlistContext';
import { getTrending, normaliseItem, posterUrl, FALLBACK_MOVIES, FALLBACK_SERIES } from '../utils/tmdb';

const C = { bg:'#0a0c14', surface:'#10131f', surface2:'#161926', border:'#1f2538', border2:'#283048', accent:'#6c63ff', accent2:'#8b83ff', green:'#22c55e', text:'#e4eaf8', text2:'#6a82a8', text3:'#344060', yellow:'#fbbf24', red:'#ef4444' };

export default function AIScreen() {
  const nav = useNavigation();
  const { getUserItems } = useContext(WatchlistContext);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecs();
  }, []);

  async function loadRecs() {
    const data = await getTrending('all');
    const items = data ? data.results.slice(0, 10).map(normaliseItem) : [...FALLBACK_MOVIES, ...FALLBACK_SERIES];
    setRecs(items);
    setLoading(false);
  }

  const wlItems = getUserItems();
  const done    = wlItems.filter(i => i.status === 'done').length;
  const genres  = ['Crime', 'Drama', 'Thriller', 'Sci-Fi', 'Comedy'];
  const reasons = ['Based on your watch history', 'You loved similar titles', 'Trending in India', 'Matches your taste', 'Top rated in your category'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={styles.header}>
        <Text style={styles.title}>🤖 AI <Text style={{ color: C.accent2 }}>For You</Text></Text>
      </View>

      {/* AI Summary bubble */}
      <View style={styles.aiBubble}>
        <Text style={styles.aiBubbleText}>
          Based on <Text style={{ color: C.accent2, fontWeight: '800' }}>{done}</Text> completed titles, here are your personalised picks! Top genre: <Text style={{ fontWeight: '800' }}>Crime, Drama</Text>
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color={C.accent} style={{ marginTop: 40 }} />
      ) : (
        recs.map((item, i) => (
          <TouchableOpacity key={item.id} style={styles.aiCard} onPress={() => nav.navigate('Detail', { item })} activeOpacity={0.85}>
            <View style={styles.aiCardHeader}>
              <View style={styles.aiPoster}>
                {item.poster_path
                  ? <Image source={{ uri: posterUrl(item.poster_path) }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  : <Text style={{ fontSize: 24, textAlign: 'center' }}>{item.type === 'series' ? '📺' : '🎬'}</Text>
                }
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.aiMeta}>{item.release_date} · ⭐{item.vote_average}</Text>
                <View style={styles.aiReason}>
                  <Text style={styles.aiReasonText}>{reasons[i % reasons.length]}</Text>
                </View>
              </View>
            </View>
            {item.overview ? <Text style={styles.aiOverview} numberOfLines={2}>{item.overview}</Text> : null}
            <TouchableOpacity style={styles.addBtn} onPress={() => nav.navigate('Detail', { item })}>
              <Text style={styles.addBtnText}>+ Add to List</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: C.bg },
  header:      { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 14 },
  title:       { fontSize: 22, fontWeight: '900', color: C.text },
  aiBubble:    { margin: 16, marginTop: 0, backgroundColor: 'rgba(108,99,255,0.12)', borderWidth: 1, borderColor: '#6c63ff', borderRadius: 14, padding: 14 },
  aiBubbleText:{ fontSize: 13, color: C.text2, lineHeight: 20 },
  aiCard:      { marginHorizontal: 16, marginBottom: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border2, borderRadius: 14, padding: 14 },
  aiCardHeader:{ flexDirection: 'row', gap: 12, marginBottom: 8 },
  aiPoster:    { width: 52, height: 72, borderRadius: 10, overflow: 'hidden', backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  aiTitle:     { fontSize: 14, fontWeight: '800', color: C.text, marginBottom: 3 },
  aiMeta:      { fontSize: 11, color: C.text3, marginBottom: 6 },
  aiReason:    { backgroundColor: 'rgba(108,99,255,0.12)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  aiReasonText:{ fontSize: 10, fontWeight: '700', color: C.accent2 },
  aiOverview:  { fontSize: 12, color: C.text3, lineHeight: 18, marginBottom: 10 },
  addBtn:      { backgroundColor: 'rgba(108,99,255,0.12)', borderWidth: 1, borderColor: C.accent, borderRadius: 9, paddingVertical: 8, alignItems: 'center' },
  addBtnText:  { fontSize: 12, fontWeight: '700', color: C.accent2 },
});
