// src/screens/DetailScreen.js
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, TextInput, Alert, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { WatchlistContext } from '../utils/WatchlistContext';
import { AuthContext } from '../utils/AuthContext';
import { posterUrl } from '../utils/tmdb';
import { STATUS_CONFIG, getWatchStatus, getOttColor } from '../utils/data';

const { width } = Dimensions.get('window');
const C = { bg:'#07090f', surface:'#0c0f1a', surface2:'#111622', border:'#1a2235', border2:'#212d45', accent:'#e8472a', accent2:'#ff6b45', text:'#dde4f2', text2:'#5a7899', text3:'#2d3f5a', green:'#00e87a', yellow:'#ffd166' };

const WL_STATUSES = [
  { key:'want',     label:'★ Want to Watch' },
  { key:'watching', label:'▶ Watching' },
  { key:'done',     label:'✓ Completed' },
  { key:'dropped',  label:'✕ Dropped' },
];

const INDIAN_STATUSES = [
  { key:'done',    val:'Done', label:'✓ Watched' },
  { key:'partial', val:'1',   label:'◑ In Progress' },
  { key:'no',      val:'',    label:'○ Not Watched' },
];

export default function DetailScreen({ route, navigation }) {
  const { item } = route.params;
  const { user } = useContext(AuthContext);
  const { getEntry, addItem, removeItem, updateStatus, updateProgress,
          getIndianWatch, setIndianWatch, getUserReview, getItemReviews, addReview } = useContext(WatchlistContext);

  const isIndian = !!item.isIndian;
  const entry    = isIndian ? null : getEntry(item.id);
  const indWatch = isIndian ? (getIndianWatch(item.id) ?? item.watched) : null;
  const indWS    = isIndian ? getWatchStatus(indWatch) : null;

  const [stars,       setStars]       = useState(0);
  const [reviewText,  setReviewText]  = useState('');
  const [epProgress,  setEpProgress]  = useState(entry?.progress || 0);

  useEffect(() => {
    const ur = getUserReview(item.id);
    if (ur) { setStars(ur.rating); setReviewText(ur.text || ''); }
  }, []);

  async function handleWLStatus(status) {
    if (entry?.status === status) { await removeItem(item.id); }
    else { await addItem(item, status); }
  }

  async function handleIndianStatus(val) {
    await setIndianWatch(item.id, val);
  }

  async function handleEpProgress(val) {
    setEpProgress(val);
    await updateProgress(item.id, val);
  }

  async function handleSubmitReview() {
    if (!stars) { Alert.alert('Rating needed', 'Please select a star rating'); return; }
    await addReview(item.id, stars, reviewText.trim());
    Alert.alert('Saved!', 'Your review has been saved.');
  }

  const allReviews  = getItemReviews(item.id);
  const genres      = item.genres?.length ? item.genres : (item.genre||'').split(',').map(g=>g.trim()).filter(Boolean);
  const oc          = isIndian ? getOttColor(item.ott) : '#445566';

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Backdrop */}
        <View style={styles.backdrop}>
          {item.poster_path
            ? <Image source={{ uri: posterUrl(item.poster_path) }} style={styles.backdropImg}/>
            : <View style={styles.backdropPh}><Text style={{ fontSize:80 }}>{item.emoji||'🎬'}</Text></View>
          }
          <LinearGradient colors={['transparent','rgba(7,9,15,0.85)','#07090f']} style={styles.backdropGrad}/>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {/* Badge */}
          <View style={styles.typeBadge}>
            <Text style={[styles.typeBadgeText, { color: isIndian ? '#ff6b45' : item.type==='series' ? '#aa66ff' : '#3b8bff' }]}>
              {isIndian ? '🇮🇳 Indian Series' : item.type==='series' ? '📺 Series' : '🎬 Movie'}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{item.title || item.name}</Text>
          {item.session ? <Text style={styles.session}>{item.session}</Text> : null}

          {/* Meta */}
          <View style={styles.metaRow}>
            {item.year || item.release_date ? <Text style={styles.metaTxt}>📅 {item.year||item.release_date}</Text> : null}
            {item.vote_average ? <Text style={styles.metaTxt}>⭐ {item.vote_average}</Text> : null}
            {item.episodes ? <Text style={styles.metaTxt}>📺 {item.episodes} ep</Text> : null}
            {item.lang ? <Text style={styles.metaTxt}>🗣️ {item.lang}</Text> : null}
            {item.ott ? <Text style={[styles.metaTxt, { color:oc, fontWeight:'700' }]}>▶ {item.ott}</Text> : null}
          </View>

          {/* Genres */}
          {genres.length > 0 && (
            <View style={styles.genreRow}>
              {genres.map(g => <View key={g} style={styles.genreTag}><Text style={styles.genreTagText}>{g}</Text></View>)}
            </View>
          )}

          {/* Overview */}
          {item.overview ? <Text style={styles.overview}>{item.overview}</Text> : null}

          {/* ── WATCHLIST ACTIONS ── */}
          <Text style={styles.sectionLabel}>ADD TO WATCHLIST</Text>
          <View style={styles.actionGrid}>
            {(isIndian ? INDIAN_STATUSES : WL_STATUSES).map(s => {
              const active = isIndian
                ? indWS === s.key
                : entry?.status === s.key;
              const cfg = STATUS_CONFIG[s.key] || STATUS_CONFIG['want'];
              return (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.actionBtn, active && { backgroundColor:cfg.bg, borderColor:cfg.color }]}
                  onPress={() => isIndian ? handleIndianStatus(s.val) : handleWLStatus(s.key)}
                >
                  <Text style={[styles.actionBtnText, active && { color:cfg.color }]}>{s.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Episode Progress (series in watchlist + watching) */}
          {!isIndian && entry?.status === 'watching' && item.episodes ? (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Episode Progress</Text>
                <Text style={[styles.progressVal, { color:C.accent2 }]}>{epProgress} / {item.episodes}</Text>
              </View>
              <View style={styles.progTrack}>
                <View style={[styles.progFill, { width:`${Math.round((epProgress/item.episodes)*100)}%` }]}/>
              </View>
              <View style={styles.epBtns}>
                <TouchableOpacity style={styles.epBtn} onPress={() => handleEpProgress(Math.max(0, epProgress-1))}>
                  <Text style={styles.epBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.epCenter}>{epProgress} watched</Text>
                <TouchableOpacity style={styles.epBtn} onPress={() => handleEpProgress(Math.min(item.episodes, epProgress+1))}>
                  <Text style={styles.epBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {/* ── RATE & REVIEW ── */}
          <Text style={styles.sectionLabel}>RATE & REVIEW</Text>
          <View style={styles.starRow}>
            {[1,2,3,4,5].map(i => (
              <TouchableOpacity key={i} onPress={() => setStars(i)}>
                <Text style={[styles.star, { color: i <= stars ? C.yellow : C.text3 }]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.reviewInput}
            value={reviewText}
            onChangeText={setReviewText}
            placeholder="Write your thoughts..."
            placeholderTextColor={C.text3}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <TouchableOpacity style={styles.reviewBtn} onPress={handleSubmitReview}>
            <Text style={styles.reviewBtnText}>Submit Review ⭐</Text>
          </TouchableOpacity>

          {/* All Reviews */}
          {allReviews.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>ALL REVIEWS ({allReviews.length})</Text>
              {allReviews.map((r, idx) => (
                <View key={idx} style={styles.reviewCard}>
                  <View style={styles.reviewTop}>
                    <Text style={styles.reviewUser}>{r.userName}</Text>
                    <Text style={styles.reviewDate}>{r.date}</Text>
                  </View>
                  <Text style={styles.reviewStars}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</Text>
                  {r.text ? <Text style={styles.reviewText}>{r.text}</Text> : null}
                </View>
              ))}
            </>
          )}

          <View style={{ height:40 }}/>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex:1, backgroundColor:C.bg },
  backdrop:        { height:280, position:'relative' },
  backdropImg:     { width:'100%', height:'100%', resizeMode:'cover' },
  backdropPh:      { width:'100%', height:'100%', backgroundColor:C.surface2, alignItems:'center', justifyContent:'center' },
  backdropGrad:    { position:'absolute', bottom:0, left:0, right:0, height:180 },
  backBtn:         { position:'absolute', top:48, left:16, backgroundColor:'rgba(0,0,0,0.55)', borderRadius:10, paddingHorizontal:14, paddingVertical:8 },
  backBtnText:     { color:'#fff', fontSize:13, fontWeight:'700' },
  body:            { padding:20 },
  typeBadge:       { backgroundColor:C.surface2, borderWidth:1, borderColor:C.border2, borderRadius:7, paddingHorizontal:10, paddingVertical:3, alignSelf:'flex-start', marginBottom:8 },
  typeBadgeText:   { fontSize:10, fontWeight:'800', letterSpacing:0.5 },
  title:           { fontSize:24, fontWeight:'900', color:C.text, lineHeight:30, marginBottom:4 },
  session:         { fontSize:13, color:C.text3, marginBottom:8 },
  metaRow:         { flexDirection:'row', flexWrap:'wrap', gap:10, marginBottom:12 },
  metaTxt:         { fontSize:12, color:C.text3 },
  genreRow:        { flexDirection:'row', flexWrap:'wrap', gap:6, marginBottom:14 },
  genreTag:        { backgroundColor:C.surface2, borderWidth:1, borderColor:C.border2, borderRadius:7, paddingHorizontal:10, paddingVertical:4 },
  genreTagText:    { fontSize:11, color:C.text2 },
  overview:        { fontSize:13, color:C.text2, lineHeight:20, marginBottom:20 },
  sectionLabel:    { fontSize:10, fontWeight:'800', color:C.text3, letterSpacing:2, marginBottom:10, marginTop:4 },
  actionGrid:      { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:20 },
  actionBtn:       { flex:1, minWidth:'45%', borderWidth:1, borderColor:C.border2, borderRadius:11, padding:12, alignItems:'center' },
  actionBtnText:   { fontSize:12, fontWeight:'700', color:C.text3 },
  progressSection: { marginBottom:20 },
  progressHeader:  { flexDirection:'row', justifyContent:'space-between', marginBottom:8 },
  progressLabel:   { fontSize:12, color:C.text3, fontWeight:'600' },
  progressVal:     { fontSize:12, fontWeight:'800' },
  progTrack:       { height:6, backgroundColor:C.border, borderRadius:4, overflow:'hidden', marginBottom:12 },
  progFill:        { height:'100%', backgroundColor:C.accent2, borderRadius:4 },
  epBtns:          { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:16 },
  epBtn:           { backgroundColor:C.surface2, borderWidth:1, borderColor:C.border2, width:40, height:40, borderRadius:20, alignItems:'center', justifyContent:'center' },
  epBtnText:       { fontSize:20, color:C.text, fontWeight:'700' },
  epCenter:        { fontSize:13, color:C.text2, fontWeight:'600' },
  starRow:         { flexDirection:'row', gap:8, marginBottom:12 },
  star:            { fontSize:32 },
  reviewInput:     { backgroundColor:C.surface2, borderWidth:1, borderColor:C.border, borderRadius:10, color:C.text, fontSize:13, padding:12, marginBottom:12, minHeight:80 },
  reviewBtn:       { backgroundColor:C.accent, borderRadius:11, padding:13, alignItems:'center', marginBottom:20 },
  reviewBtnText:   { color:'#fff', fontSize:14, fontWeight:'700' },
  reviewCard:      { backgroundColor:C.surface2, borderWidth:1, borderColor:C.border, borderRadius:11, padding:14, marginBottom:10 },
  reviewTop:       { flexDirection:'row', justifyContent:'space-between', marginBottom:6 },
  reviewUser:      { fontSize:13, fontWeight:'700', color:C.text },
  reviewDate:      { fontSize:10, color:C.text3 },
  reviewStars:     { color:C.yellow, fontSize:13, marginBottom:6 },
  reviewText:      { fontSize:13, color:C.text2, lineHeight:18 },
});
