# ⛪ DHLC Davao Church Management System - Mission Log

## 🛡️ Current Status: STABLE & DEPLOYED
**Last Sync:** April 17, 2026 (12:58 PH Time)
**Leadership Hub URL:** [dhlcdavaocity.vercel.app/command-center](https://dhlcdavaocity.vercel.app/command-center)

---

## ✅ Completed Milestones

### 1. 🥇 Leadership Hub (Formerly Command Center)
- **Financial Silo Logic**: Strict permission-based tithe tracking. Pastora Gladys (Accountant) managing amounts; Pastor Glenn viewing verification checkmarks only.
- **Attendance Analytics**: Visual growth trends and retention stats for all church services.
- **Member Directory**: Advanced filtering for Leaders, Ministers, and Members.

### 2. 📁 Unified Cloud Drive
- **Universal Preview**: Word, PDF, and Excel files open directly in-app via Google Viewer integration.
- **Workspace Integration**: Native link to Google Workspace for secure ministry resource management.
- **Leader Uploads**: Secure file addition area for authorized ministry heads.

### 3. 💳 Member Portal & Self-Service
- **Digital ID System**: Personal QR codes available for every member for sanctuary scanning.
- **Progress Tracking**: Spiritual growth gamification (Divinity Levels, Foundations).
- **Downloadable IDs**: Members can save their ID to their mobile devices for offline entry.

### 4. 🔔 Real-Time Alert Engine (FCM)
- **Push Notifications**: Integrated Firebase Cloud Messaging for instant church-wide alerts.
- **Background Support**: Service worker created for notifications even when the browser is closed.

---

## 🛠️ Technical Manifest
- **Framework**: React 19 (Vite) / Vanilla CSS (Premium Glassmorphism)
- **Database**: Firebase Firestore (Real-time sync)
- **Auth**: Firebase Auth (Google & Email)
- **Notifications**: Firebase Cloud Messaging (FCM)
- **File Handling**: Google Docs Viewer / Firebase Storage
- **Deployment**: Vercel (Auto-Sync)
