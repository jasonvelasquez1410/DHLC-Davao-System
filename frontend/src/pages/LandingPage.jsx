import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Users, QrCode, Shield, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="container animate-fade-in">
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
            Divine Healing Life-Changing Church
          </h1>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'white', fontStyle: 'italic' }}>Davao City</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)', maxWidth: '700px', margin: '0 auto 2rem' }}>
            Transforming church engagement through modern technology. Manage members, track attendance, and empower leaders with DHLC Davao's smart ecosystem.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/login" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              Access Portal <ArrowRight />
            </Link>
            <a href="#features" className="btn-secondary" style={{ padding: '1rem 2rem', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', textDecoration: 'none' }}>
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '5rem 0', background: 'rgba(0,0,0,0.2)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>Core System Features</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            
            <div className="premium-card">
              <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}><QrCode size={40} /></div>
              <h3>Smart Attendance</h3>
              <p style={{ color: 'var(--text-dim)' }}>Seamless QR scanning for ushers to record attendance in seconds with real-time feedback.</p>
            </div>

            <div className="premium-card">
              <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}><Users size={40} /></div>
              <h3>Leader Portals</h3>
              <p style={{ color: 'var(--text-dim)' }}>Empower your leaders to manage their groups, track growth, and monitor training completion.</p>
            </div>

            <div className="premium-card">
              <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}><Shield size={40} /></div>
              <h3>Role-Based Access</h3>
              <p style={{ color: 'var(--text-dim)' }}>Secure data management with granular permissions for admins, leaders, and members.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '3rem 0', borderTop: '1px solid var(--glass-border)', textAlign: 'center', color: 'var(--text-dim)' }}>
        <p>© 2026 Divine Healing Life-Changing Church - Davao City. Powered by Innovation.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
