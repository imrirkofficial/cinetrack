# 🎬 CineTrack v6 — Ultimate Movie & Series Tracker
### Web App + Android App | 30+ Features

---

## 🚀 Quick Start

### ⭐ Easiest — Open in browser directly
```
web/cinetrack-v6-standalone.html  ← Open this!
```
TMDB API key set ✓ | No server needed ✓ | Works offline ✓

---

## ✨ All Features

### 📂 4 Categories
🇮🇳 Indian Series | 🌍 English Series | 🎬 Hindi Movie | 🎥 English Movie

### 🤖 Smart Features
- AI Recommendations (watch history analysis)
- Similar Titles suggestions
- Mood-based Picks (8 moods)
- Trending India (TMDB live)
- Upcoming Release Calendar

### 👥 Social Features
- Watch Party planner + invite sharing
- Friends watchlist compare
- Leaderboard (scoring system)
- Comments per title

### 📊 Analytics
- Genre Taste Analysis (bar charts)
- Binge Score calculator
- Parental Rating breakdown
- Subtitle language tracker
- Year in Review (Wrapped style)
- Monthly activity chart
- PDF/Print report

### 🆕 v6 New Features
| Feature | Details |
|---------|---------|
| 🔧 Firebase Ready | Backup/Restore JSON export/import |
| 📸 Profile Photo | Upload photo from device |
| 🔔 Push Notifications | Release reminders via browser |
| 👥 Multi-user | Multiple accounts on same device |
| 💾 Backup & Restore | JSON export/import |
| 📺 Season Tracker | S1E1, S1E2... per episode tracking |
| 📜 Subtitle Tracker | Track subtitle languages |
| 📡 OTT Checker | Where to watch indicator |
| ⬇️ Download Tracker | Track offline downloads |
| 🔞 Parental Filter | PG, R, 18+ ratings |
| 📋 Custom Lists | "Rainy Day", "With Family" etc |
| 😊 Mood Picks | 8 mood categories |
| 📱 QR Share | QR code for sharing |
| 🏅 Badges | 12 achievement badges |
| 🎉 Year Wrapped | Annual review stats |

### Per Title
- 🖼️ TMDB poster (auto-search)
- ⭐ Rating & review
- 📝 Personal notes
- 💬 Comments
- 📺 Season/episode tracker (clickable grid)
- ❤️ Favourite
- ✏️ Edit / Delete

---

## 🔑 TMDB API Key
`4e4da842c0aa548be7f2dde8b628c3ef` — Already configured ✓

---

## 📱 Android Setup
```bash
cd mobile && npm install
npx react-native run-android

# Release APK:
cd android && ./gradlew assembleRelease
```

---

## 📁 Files
```
cinetrack/
├── web/
│   ├── cinetrack-v6-standalone.html  ← ⭐ MAIN FILE (open this)
│   ├── cinetrack-v5-standalone.html  ← v5 backup
│   ├── index.html                    ← Multi-file web app
│   ├── sw.js                         ← PWA offline support
│   ├── manifest.json
│   ├── css/ js/
└── mobile/                           ← React Native Android
    ├── App.js
    ├── package.json
    └── src/
        ├── navigation/
        ├── screens/ (12 screens)
        └── utils/
```
