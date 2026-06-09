// ═══════════════════════════════════════════════
// CineTrack React Native — App.js
// ═══════════════════════════════════════════════
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/utils/AuthContext';
import { WatchlistProvider } from './src/utils/WatchlistContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <WatchlistProvider>
          <NavigationContainer>
            <StatusBar barStyle="light-content" backgroundColor="#07090f" />
            <RootNavigator />
          </NavigationContainer>
        </WatchlistProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
