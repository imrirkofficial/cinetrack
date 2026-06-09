// src/screens/LoginScreen.js
import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { AuthContext } from '../utils/AuthContext';

const C = { bg:'#07090f', surface:'#0c0f1a', surface2:'#111622', border:'#1a2235', border2:'#212d45', accent:'#e8472a', accent2:'#ff6b45', text:'#dde4f2', text2:'#5a7899', text3:'#2d3f5a' };

export default function LoginScreen() {
  const { login, signup, loginDemo } = useContext(AuthContext);
  const [tab, setTab] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email || !pass) { Alert.alert('Error', 'Please fill in all fields'); return; }
    setLoading(true);
    try {
      if (tab === 'login') await login(email.trim(), pass);
      else { if (!name) { Alert.alert('Error', 'Please enter your name'); setLoading(false); return; } await signup(name.trim(), email.trim(), pass); }
    } catch (e) { Alert.alert('Error', e.message); }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView style={{ flex:1, backgroundColor:C.bg }} behavior={Platform.OS==='ios'?'padding':'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>🎬 CineTrack</Text>
        <Text style={styles.sub}>Your Personal Watch Universe</Text>

        <View style={styles.tabRow}>
          {['login','signup'].map(t => (
            <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tabBtn, tab===t && styles.tabBtnActive]}>
              <Text style={[styles.tabLabel, tab===t && { color:'#fff' }]}>{t==='login'?'Login':'Sign Up'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          {tab === 'signup' && (
            <View style={styles.field}>
              <Text style={styles.label}>NAME</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={C.text3} autoCapitalize="words"/>
            </View>
          )}
          <View style={styles.field}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={C.text3} keyboardType="email-address" autoCapitalize="none"/>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput style={styles.input} value={pass} onChangeText={setPass} placeholder="••••••••" placeholderTextColor={C.text3} secureTextEntry/>
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Please wait...' : tab==='login' ? 'Login →' : 'Create Account →'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostBtn} onPress={loginDemo}>
            <Text style={styles.ghostBtnText}>Try Demo Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:   { flexGrow:1, justifyContent:'center', padding:24, backgroundColor:C.bg },
  logo:        { fontSize:28, fontWeight:'900', color:'#fff', textAlign:'center', marginBottom:6 },
  sub:         { fontSize:13, color:C.text3, textAlign:'center', marginBottom:32 },
  tabRow:      { flexDirection:'row', backgroundColor:C.surface2, borderRadius:12, padding:4, marginBottom:20 },
  tabBtn:      { flex:1, paddingVertical:10, borderRadius:9, alignItems:'center' },
  tabBtnActive:{ backgroundColor:C.accent },
  tabLabel:    { fontSize:13, fontWeight:'700', color:C.text3 },
  card:        { backgroundColor:C.surface, borderWidth:1, borderColor:C.border2, borderRadius:20, padding:24 },
  field:       { marginBottom:16 },
  label:       { fontSize:10, fontWeight:'800', color:C.text2, letterSpacing:1, marginBottom:6 },
  input:       { backgroundColor:C.surface2, borderWidth:1, borderColor:C.border, borderRadius:10, color:C.text, fontSize:14, padding:12 },
  btn:         { backgroundColor:C.accent, borderRadius:11, padding:14, alignItems:'center', marginBottom:10 },
  btnText:     { color:'#fff', fontSize:14, fontWeight:'700' },
  ghostBtn:    { borderWidth:1, borderColor:C.border2, borderRadius:11, padding:12, alignItems:'center' },
  ghostBtnText:{ color:C.text2, fontSize:13, fontWeight:'600' },
});
