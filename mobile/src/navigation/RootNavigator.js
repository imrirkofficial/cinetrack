// src/navigation/RootNavigator.js — v5 with all screens
import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { AuthContext } from '../utils/AuthContext';
import LoginScreen     from '../screens/LoginScreen';
import HomeScreen      from '../screens/HomeScreen';
import DiscoverScreen  from '../screens/DiscoverScreen';
import IndianScreen    from '../screens/IndianScreen';
import WatchlistScreen from '../screens/WatchlistScreen';
import DetailScreen    from '../screens/DetailScreen';
import ProfileScreen   from '../screens/ProfileScreen';
import ReviewsScreen   from '../screens/ReviewsScreen';
import AIScreen        from '../screens/AIScreen';
import TrendingScreen  from '../screens/TrendingScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();
const C = { accent2:'#8b83ff', text3:'#344060' };

const TABS = [
  { name:'HomeTab',     icon:'🏠', label:'Home'    },
  { name:'Indian',      icon:'🇮🇳', label:'Indian'  },
  { name:'AI',          icon:'🤖', label:'AI'      },
  { name:'Trending',    icon:'🔥', label:'Trend'   },
  { name:'Watchlist',   icon:'📚', label:'List'    },
  { name:'Reviews',     icon:'⭐', label:'Reviews' },
];

function TabIcon({ name, focused }) {
  const tab = TABS.find(t => t.name === name);
  return (
    <View style={{ alignItems:'center', paddingTop:2 }}>
      <Text style={{ fontSize:19 }}>{tab?.icon||'🏠'}</Text>
      <Text style={{ fontSize:9, fontWeight:'700', color:focused?C.accent2:C.text3, marginTop:2 }}>{tab?.label||name}</Text>
    </View>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown:false }}>
      <Stack.Screen name="HomeMain"  component={HomeScreen} />
      <Stack.Screen name="Detail"    component={DetailScreen} options={{ presentation:'modal' }} />
      <Stack.Screen name="Profile"   component={ProfileScreen} />
      <Stack.Screen name="Discover"  component={DiscoverScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown:false, tabBarStyle:{ backgroundColor:'#0a0c14', borderTopColor:'#1f2538', height:62, paddingBottom:8 }, tabBarShowLabel:false }}>
      <Tab.Screen name="HomeTab"   component={HomeStack}      options={{ tabBarIcon:({focused})=><TabIcon name="HomeTab"   focused={focused}/> }}/>
      <Tab.Screen name="Indian"    component={IndianScreen}   options={{ tabBarIcon:({focused})=><TabIcon name="Indian"    focused={focused}/> }}/>
      <Tab.Screen name="AI"        component={AIScreen}       options={{ tabBarIcon:({focused})=><TabIcon name="AI"        focused={focused}/> }}/>
      <Tab.Screen name="Trending"  component={TrendingScreen} options={{ tabBarIcon:({focused})=><TabIcon name="Trending"  focused={focused}/> }}/>
      <Tab.Screen name="Watchlist" component={WatchlistScreen}options={{ tabBarIcon:({focused})=><TabIcon name="Watchlist" focused={focused}/> }}/>
      <Tab.Screen name="Reviews"   component={ReviewsScreen}  options={{ tabBarIcon:({focused})=><TabIcon name="Reviews"   focused={focused}/> }}/>
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { user } = useContext(AuthContext);
  return (
    <Stack.Navigator screenOptions={{ headerShown:false }}>
      {user
        ? <Stack.Screen name="Main"  component={MainTabs} />
        : <Stack.Screen name="Login" component={LoginScreen} options={{ animationTypeForReplace:'pop' }} />
      }
    </Stack.Navigator>
  );
}
