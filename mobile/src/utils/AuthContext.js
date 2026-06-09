// src/utils/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('ct_user').then(val => {
      if (val) setUser(JSON.parse(val));
      setLoading(false);
    });
  }, []);

  async function login(email, password) {
    const usersStr = await AsyncStorage.getItem('ct_users');
    const users = usersStr ? JSON.parse(usersStr) : {};
    const found = Object.values(users).find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Invalid email or password');
    await AsyncStorage.setItem('ct_user', JSON.stringify(found));
    setUser(found);
  }

  async function signup(name, email, password) {
    const usersStr = await AsyncStorage.getItem('ct_users');
    const users = usersStr ? JSON.parse(usersStr) : {};
    if (Object.values(users).find(u => u.email === email)) throw new Error('Email already registered');
    const id = 'u_' + Date.now();
    const newUser = { id, name, email, password, joinDate: new Date().toLocaleDateString('en-IN', { year:'numeric', month:'long' }) };
    users[id] = newUser;
    await AsyncStorage.setItem('ct_users', JSON.stringify(users));
    await AsyncStorage.setItem('ct_user', JSON.stringify(newUser));
    setUser(newUser);
  }

  async function loginDemo() {
    const demoUser = { id:'u_demo', name:'Demo User', email:'demo@cinetrack.app', password:'demo123', joinDate:'May 2026' };
    await AsyncStorage.setItem('ct_user', JSON.stringify(demoUser));
    setUser(demoUser);
  }

  async function logout() {
    await AsyncStorage.removeItem('ct_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
