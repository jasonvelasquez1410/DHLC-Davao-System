# DHLC Davao Church Management System - Project Status

## Project Overview
A cloud-native church management system for **Divine Healing Life-Changing Church (DHLC) Davao City**. The system features a public landing page, member QR-code attendance tracking, leader portals, and an admin dashboard with real-time analytics.

---

## ☁️ Current State: Head Pastor "Command Center" & Financial Access Control
We have successfully implemented the specialized dashboard for the Head Pastor and Pastor Glady Ebana with integrated role-based security.

### Completed Tasks:
- [x] **Branding**: Official Navy Blue and Gold theme applied across all portals.
- [x] **Firebase Integration**: Auth & Firestore integration for real-time data.
- [x] **Head Pastor Dashboard**: "Command Center" created with ministry health analytics.
- [x] **Financial Access Control**: 
    - **Head Pastor (Master Admin)**: Sees attendance and tithing "Status" (Checkmarks) without viewing specific amounts.
    - **Pastor Glady (Accountant)**: Full access to financial totals and individual tithing amounts.
- [x] **Live Activity Feed**: Real-time tracking of church happenings on the dashboard.

---

## 🛠️ Next Features & Roadmap

### 1. Minister Information & Leadership Directory
- [x] **Profiles**: In-depth minister profiles with contact, family, and ministry info.
- [x] **Cell Groups**: Linking ministers to the specific cell groups they oversee.

### 2. Divinity Class Tracker
- [x] **Visual Progress**: Progress bars showing completion percentage of leadership classes.
- [x] **Course Records**: History of finished subjects (Theology, Hermeneutics, etc.).

### 3. "MIA" Retention System
- [x] **Automated Alerts**: Flags members who have missed 3+ consecutive services.
- [x] **Task Delegation**: Head Pastor can assign ministers to follow up with absentee members.

### 4. Deployment & Maintenance
- [ ] Finalize Vercel/Netlify deployment from GitHub.
- [ ] Continuous backup of Firestore data.

---

## 🔑 Firebase Configuration (Active)
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDBWurvGNq_ld0BMqUlhzs0sKRrU8CBUD8",
  authDomain: "dhlc-davao-system.firebaseapp.com",
  projectId: "dhlc-davao-system",
  storageBucket: "dhlc-davao-system.firebasestorage.app",
  messagingSenderId: "695103836847",
  appId: "1:695103836847:web:f126abb2d96979f23bba5a"
};
```

---

## 📚 Conversation Reference
- **Last Action**: Implemented Minister Directory, Divinity Class Tracker, and MIA Retention System into the Command Center.
- **Context**: Working on leadership development and specialized pastoral reporting.
- **Tools**: Vite, React, Lucide-Icons, and Firebase.
