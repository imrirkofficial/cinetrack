// src/components/MediaCard.js
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { WatchlistContext } from '../utils/WatchlistContext';
import { posterUrl } from '../utils/tmdb';

const C = { surface:'#0c0f1a', surface2:'#111622', border:'#1a2235', accent:'#e8472a', accent2:'#ff6b45', text:'#dde4f2', text2:'#5a7899', text3:'#2d3f5a', yellow:'#ffd166' };

export default function MediaCard({ item, width = 150, onPress }) {
  const { getEntry, addItem, removeItem } = useContext(WatchlistContext);
  const entry = getEntry(item.id);
  const inWL  = !!entry;

  function toggleWL(e) {
    if (inWL) removeItem(item.id);
    else addItem(item, 'want');
  }

  const isTV    = item.type === 'series';
  const typeBg  = isTV ? 'rgba(170,102,255,0.25)' : 'rgba(59,139,255,0.25)';
  const typeClr = isTV ? '#aa66ff' : '#3b8bff';

  return (
    <TouchableOpacity style={[styles.card, { width }]} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.posterWrap}>
        {item.poster_path
          ? <Image source={{ uri: posterUrl(item.poster_path) }} style={styles.poster} resizeMode="cover"/>
          : <View style={styles.posterPh}><Text style={styles.posterEmoji}>{item.emoji || '🎬'}</Text></View>
        }
        {/* Type badge */}
        <View style={[styles.typeBadge, { backgroundColor: typeBg }]}>
          <Text style={[styles.typeBadgeText, { color: typeClr }]}>{isTV ? 'TV' : 'FILM'}</Text>
        </View>
        {/* WL button */}
        <TouchableOpacity style={[styles.wlBtn, inWL && { backgroundColor: C.accent }]} onPress={toggleWL}>
          <Text style={styles.wlBtnText}>{inWL ? '✓' : '+'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{item.release_date || ''}</Text>
          <Text style={styles.rating}>⭐ {item.vote_average || 'N/A'}</Text>
        </View>
        {item.genres?.length > 0 && (
          <View style={styles.genreRow}>
            {item.genres.slice(0, 2).map(g => (
              <View key={g} style={styles.genreChip}>
                <Text style={styles.genreText}>{g}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card:        { backgroundColor: C.surface, borderWidth:1, borderColor:C.border, borderRadius:14, overflow:'hidden' },
  posterWrap:  { position:'relative', aspectRatio: 2/3 },
  poster:      { width:'100%', height:'100%' },
  posterPh:    { width:'100%', height:'100%', backgroundColor:C.surface2, alignItems:'center', justifyContent:'center' },
  posterEmoji: { fontSize:40 },
  typeBadge:   { position:'absolute', top:7, left:7, borderRadius:5, paddingHorizontal:6, paddingVertical:2 },
  typeBadgeText:{ fontSize:8, fontWeight:'800', letterSpacing:0.6 },
  wlBtn:       { position:'absolute', top:6, right:6, width:28, height:28, borderRadius:14, backgroundColor:'rgba(0,0,0,0.55)', alignItems:'center', justifyContent:'center' },
  wlBtnText:   { color:'#fff', fontSize:14, fontWeight:'800' },
  body:        { padding:10 },
  title:       { fontSize:11, fontWeight:'700', color:C.text, lineHeight:15, marginBottom:5 },
  metaRow:     { flexDirection:'row', justifyContent:'space-between', marginBottom:5 },
  meta:        { fontSize:10, color:C.text2 },
  rating:      { fontSize:10, color:C.yellow, fontWeight:'700' },
  genreRow:    { flexDirection:'row', gap:4, flexWrap:'wrap' },
  genreChip:   { backgroundColor:'rgba(255,255,255,0.04)', borderRadius:4, paddingHorizontal:6, paddingVertical:2 },
  genreText:   { fontSize:8, color:C.text3, fontWeight:'600' },
});
