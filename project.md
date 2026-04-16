# ⛪ DHLC Davao Church Management System - Mission Log

## 🛡️ Current Status: STABLE & DEPLOYED
**Last Sync:** April 16, 2026 (20:53 UTC)
**Admin Hub URL:** [dhlcdavaocity.vercel.app/admin](https://dhlcdavaocity.vercel.app/admin)

---

## ✅ Completed Milestones

### 1. 🏰 Mission Command (Admin Hub)
- **Master Admin Access**: `admin@dhlc.com` (Bypass Password: `dhlc2026`).
- **VIP Auto-Promotion**: Google accounts for **Jason Velasquez** and **Regie Glenn** are now automatically recognized as "Master Admins" on every login.
- **Role Control**: Adimns can now promote any member (Leader, Minister, Admin) directly from the Directory tab using the high-contrast role switcher.
- **Attendance Scanner**: Fully functional QR-based scanner linked to the Master Schedule.

### 2. 💬 Communication Hub (Discuss)
- **Odoo-Style Video Call**: Implemented a native in-app video overlay (no new tabs) for superior mobile stability.
- **Emergency Message Engine**: Rewritten to bypass Firebase Search Indexes. Messages now appear **instantly** even if the database is busy.
- **Moderation Tools**: Admins can now permanently delete any message or test log from the chat channels.
- **Presence Indicators**: Real-time "Online" status dots for all ministry members.

### 3. 📅 Operations Hub
- **Master Schedule Ledger**: Admins can pre-plan "Divinity Nights" or "Special Events" as the basis for the Scanner.
- **Digital ID System**: Unique QR codes generated for every member upon enrollment.

---

## 🚀 Upcoming Priorities

1.  **📊 Attendance Analytics**: Build a visual dashboard to track growth trends across different service types.
2.  **🔔 Real-Time Alerts**: Integrate Firebase Cloud Messaging (FCM) for "New Message" notifications on mobile.
3.  **💳 Member Self-Service**: Allow members to view their own Digital ID and certification progress on their home profile.
4.  **📁 Church Drive Expansion**: Finalize the document sharing system for ministry resources.

---

## 🛠️ Technical Manifest
- **Framework**: React (Vite) / Vanilla CSS
- **Database**: Firebase Firestore (Real-time sync)
- **Authentication**: Firebase Auth (Google & Email)
- **Video Engine**: Jitsi External API (IFrame Implementation)
- **Scanner**: Html5-Qrcode
