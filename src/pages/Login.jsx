import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../App';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

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
        setLoading(false);
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = { uid: user.uid, ...userDoc.data() };
        login(userData);
        // Redirect based on role
        if (userData.role === 'admin') navigate('/admin');
        else if (userData.role === 'leader') navigate('/leader');
        else navigate('/member');
      } else {
        // Default login if no firestore doc yet
        const defaultData = { uid: user.uid, email: user.email, role: 'member', name: 'Member' };
        login(defaultData);
        navigate('/member');
      }
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
          <h2 className="font-serif" style={{ fontSize: '2.5rem' }}>Portal <span className="text-gradient">Login</span></h2>
          <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>Secure access for members and leadership.</p>
        </div>

        <div className="premium-card" style={{ padding: '3rem' }}>
          {error && (
            <div style={{ padding: '1rem', background: 'rgba(244, 67, 54, 0.1)', border: '1px solid #f44336', borderRadius: '10px', color: '#f44336', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} size={20} />
              <input 
                type="email" 
                placeholder="Church Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '1.2rem 1rem 1.2rem 3.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '15px', color: 'white', fontSize: '1rem', outline: 'none' }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} size={20} />
              <input 
                type="password" 
                placeholder="Security Code" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '1.2rem 1rem 1.2rem 3.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '15px', color: 'white', fontSize: '1rem', outline: 'none' }}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '1.2rem', justifyContent: 'center', fontSize: '1.1rem', marginTop: '1rem' }}>
              {loading ? 'Verifying...' : 'Enter Sanctuary'} <ArrowRight size={20} />
            </button>
          </form>

          <div style={{ marginTop: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              <ShieldCheck size={16} color="var(--primary)" /> Encrypted Connection
            </div>
            <a href="https://www.facebook.com/dhlcdavaocity" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.85rem', textDecoration: 'none' }}>
              Need help? Visit our FB Page
            </a>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>Contact Church Office</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
