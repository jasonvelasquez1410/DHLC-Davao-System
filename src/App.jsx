import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { LogOut, LayoutDashboard, User, Scan, Users, Menu, X, Globe, LogIn, MessageSquare, Cloud } from 'lucide-react';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import LeaderPortal from './pages/LeaderPortal';
import MemberDashboard from './pages/MemberDashboard';
import Discuss from './pages/Discuss';
import HeadPastorDashboard from './pages/HeadPastorDashboard';
import CloudDrive from './pages/CloudDrive';
import Documents from './pages/Documents';

import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getMessaging, getToken } from 'firebase/messaging';

// --- Auth Context ---
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // --- Fetch Profile ---
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        let userData;
        if (userDoc.exists()) {
          userData = { uid: firebaseUser.uid, ...userDoc.data() };
        } else {
          userData = { uid: firebaseUser.uid, email: firebaseUser.email, role: 'member', name: firebaseUser.displayName || 'Member' };
        }
        setUser(userData);

        // --- Setup Notifications (FCM) ---
        const requestPermission = async () => {
          try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              const messaging = getMessaging();
              const token = await getToken(messaging, { 
                vapidKey: 'BNoo-NlyhFzREpZpxT6yF8xKqMsk1pXz-uU6X7Gf7B_hI' // Generic/Public key placeholder
              });
              if (token) {
                console.log('FCM Token Generated:', token);
                await setDoc(doc(db, 'users', firebaseUser.uid), { fcmToken: token }, { merge: true });
              }
            }
          } catch (err) {
            console.error('Notification Setup Error:', err);
          }
        };
        requestPermission();
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    window.location.href = '/';
  };

  if (loading) return (
    <div className="hero" style={{ justifyContent: 'center', textAlign: 'center' }}>
      <div className="animate-fade-in">
        <img src="/logo.jpg" alt="DHLC LOGO" style={{ width: '120px', borderRadius: '50%', marginBottom: '20px' }} />
        <h2 className="text-gradient">Initializing Secure Portal...</h2>
      </div>
    </div>
  );

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// --- Protected Route ---
const ProtectedRoute = ({ children, role, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  
  if (roles && !roles.includes(user.role)) {
    if (user.role === 'admin') return children;
    return <Navigate to="/" />;
  }

  if (role && user.role !== role) {
     if (user.role === 'admin' || user.role === 'leader' || user.role === 'head_pastor') return children; // Allow elevated roles to see lower role areas
     return <Navigate to="/" />;
  }
  return children;
};

// --- Navbar Component ---
const Navbar = () => {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="glass-nav" style={{ padding: scrolled ? '0.8rem 5%' : '1.5rem 5%', background: scrolled ? 'rgba(0, 18, 38, 0.95)' : 'rgba(0, 18, 38, 0.7)' }}>
      <Link to="/" className="logo">
        <img src="/logo.jpg" alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
        <span className="font-serif">DHLC <span className="logo-accent">DAVAO</span></span>
      </Link>
      
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        {user ? (
          <>
            <Link to="/discuss" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <MessageSquare size={16} /> Discuss
            </Link>
            <Link to="/cloud" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Cloud size={16} /> Cloud Drive
            </Link>
            <Link to="/member" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><User size={16} /> My Profile</Link>
            {user.role === 'admin' && <Link to="/admin" className="nav-link">Admin Panel</Link>}
            {user.role === 'leader' && <Link to="/leader" className="nav-link">Leader Portal</Link>}
            {(user.role === 'head_pastor' || user.role === 'accountant' || user.role === 'admin') && (
              <>
                <Link to="/documents" className="nav-link">Records</Link>
                <Link to="/command-center" className="nav-link" style={{color: 'var(--primary)', fontWeight: 'bold'}}>Leadership Hub</Link>
              </>
            )}
            <div style={{ marginRight: '1rem', color: 'var(--text-dim)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--primary)' }} />
              ) : (
                <User size={14} />
              )}
              <span>Welcome, {user.name?.split(' ')[0]}</span>
            </div>
            <button onClick={logout} className="btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="btn-primary" style={{ padding: '0.6rem 1.2rem' }}>
            <LogIn size={16} /> Login
          </Link>
        )}
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/discuss" element={
            <ProtectedRoute>
              <Discuss />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/leader" element={
            <ProtectedRoute role="leader">
              <LeaderPortal />
            </ProtectedRoute>
          } />
          <Route path="/member" element={
            <ProtectedRoute role="member">
              <MemberDashboard />
            </ProtectedRoute>
          } />
          <Route path="/command-center" element={
            <ProtectedRoute roles={['head_pastor', 'accountant']}>
              <HeadPastorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/cloud" element={
            <ProtectedRoute>
              <CloudDrive />
            </ProtectedRoute>
          } />
          <Route path="/documents" element={
            <ProtectedRoute roles={['head_pastor', 'accountant', 'admin']}>
              <Documents />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
