import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db, googleProvider } from '../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../App';
import { Mail, Lock, ArrowRight, ShieldCheck, Globe } from 'lucide-react';

const ministersList = [
  "Deacon Joselito Tolentino", "Deacon Andre J Bughao", "Deacon Azaniah Esther Bughao",
  "Kirstine Irish Canlapan", "Alex Ruelan Jr.", "Niño Villarta", "Camyr Anrie Gelicame",
  "Justyne Olive Dayon", "Le Joshua Guzman", "Anjie Lenard Bacanaya", "Mariz Jenne Villarta",
  "Jenny Eve Canlapan", "April Joyce Dayon", "Liza Degamo", "Aleiah Lyka Degamo",
  "Mary Ann Torres", "Jay Mar Turno"
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleAutoPromote = async (user) => {
    const userDocRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);
    const name = user.displayName || 'New Member';
    const email = (user.email || "").toLowerCase();
    
    let role = 'member';

    // VIP Global Admin Promotion (Master Admins)
    const adminEmails = ['admin@dhlc.com', 'gmcebana.auditor@gmail.com'];
    
    // VIP Leadership List (Lowercased for safety)
    const vipLeaders = [
      'regieglenn@gmail.com', 
      'jasonvelasquez1410@gmail.com', 
      'jason.velasquez1410@gmail.com'
    ]; 

    if (adminEmails.includes(email)) {
      role = 'admin';
    } else if (vipLeaders.includes(email)) {
      role = 'leader';
    }
    // Minister Promotion check
    else if (ministersList.some(m => name.toLowerCase().includes(m.toLowerCase()))) {
      role = 'leader';
    }

    // Force promotion: If existing data says 'member' but logic says they are VIP
    const existingRole = userSnap.exists() ? userSnap.data().role : 'member';
    const finalRole = (role !== 'member') ? role : existingRole;

    const userData = {
      uid: user.uid,
      name: name,
      email: email,
      role: finalRole,
      photoURL: user.photoURL || null,
      lastLogin: serverTimestamp()
    };

    // Save/Update if VIP or New
    if (!userSnap.exists() || finalRole !== existingRole) {
      await setDoc(userDocRef, userData, { merge: true });
    }

    return userData;
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userData = await handleAutoPromote(result.user);
      login(userData);
      
      if (userData.role === 'admin') navigate('/admin');
      else if (userData.role === 'leader') navigate('/leader');
      else navigate('/member');
    } catch (err) {
      console.error("Full Google Sign-in Error:", err);
      
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please keep the window open to login.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Sign-in request was cancelled. Please try again.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for Google Sign-in. Please contact admin to add it to Firebase "Authorized Domains".');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Sign-in popup was blocked. Please allow popups for this site.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Google Sign-in is not enabled in Firebase Console. Please enable it under Authentication > Sign-in Method.');
      } else {
        setError(`Google Sign-in failed: ${err.message || 'Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // --- Master Admin Bypass for Testing ---
      if (email === 'admin@dhlc.com' && password === 'dhlc2026') {
        const masterData = { 
          uid: 'master-admin-001', 
          email: 'admin@dhlc.com', 
          role: 'admin', 
          name: 'Master Admin (Testing)' 
        };
        login(masterData);
        navigate('/admin');
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await handleAutoPromote(userCredential.user);
      login(userData);
      
      if (userData.role === 'admin') navigate('/admin');
      else if (userData.role === 'leader') navigate('/leader');
      else navigate('/member');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero" style={{ justifyContent: 'center', background: 'radial-gradient(circle at center, rgba(0, 45, 98, 0.4) 0%, var(--bg-dark) 100%)' }}>
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <img src="/logo.jpg" alt="DHLC LOGO" style={{ width: '100px', height: '100px', borderRadius: '50%', border: '3px solid var(--primary)', marginBottom: '1.5rem', boxShadow: '0 0 30px var(--primary-glow)' }} />
          <h2 className="font-serif" style={{ fontSize: '2.5rem' }}>Portal <span className="text-gradient">Access</span></h2>
          <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>Secure sign-in for the DHLC community.</p>
        </div>

        <div className="premium-card" style={{ padding: '2.5rem' }}>
          {error && (
            <div style={{ padding: '1rem', background: 'rgba(244, 67, 54, 0.1)', border: '1px solid #f44336', borderRadius: '10px', color: '#f44336', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button 
            onClick={handleGoogleLogin} 
            disabled={loading}
            className="btn-ghost" 
            style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '1.5rem', background: 'white', color: 'black' }}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '20px' }} />
            {loading ? 'Connecting...' : 'Sign in with Google'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
             <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
             <span>OR USE EMAIL</span>
             <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} size={18} />
              <input 
                type="email" 
                placeholder="Church Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', outline: 'none' }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} size={18} />
              <input 
                type="password" 
                placeholder="Security Code" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', outline: 'none' }}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '1rem', justifyContent: 'center', fontSize: '1.1rem' }}>
              {loading ? 'Verifying...' : 'Sign In'} <ArrowRight size={20} />
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
          By signing in, markers and ministers are auto-verified based on the church roster.
        </p>
      </div>
    </div>
  );
};

export default Login;
