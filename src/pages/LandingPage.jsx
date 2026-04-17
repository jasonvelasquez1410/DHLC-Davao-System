import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Users, QrCode, Shield, ArrowRight, Cloud } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Hero Section */}
      <header className="hero">
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', alignItems: 'center', gap: '4rem' }}>
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <span style={{ padding: '0.4rem 1rem', background: 'rgba(242, 153, 0, 0.1)', color: 'var(--primary)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
                DHLC DAVAO CITY OFFICIAL PORTAL
              </span>
            </div>
            <h1 className="hero-title font-serif">
              Impact the World.<br />
              <span className="text-gradient">Empower the Soul.</span>
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)', marginBottom: '3rem', maxWidth: '600px' }}>
              Welcome to the Divine Healing Life-Changing Church Management System. Streamlining attendance, connection, and spiritual growth in Davao City.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <Link to="/login" className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                Join the Service <ArrowRight size={20} />
              </Link>
              <a href="https://www.facebook.com/dhlcdavaocity" target="_blank" rel="noreferrer" className="btn-ghost" style={{ padding: '1rem 2.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                Latest News
              </a>
            </div>
          </div>

          <div className="animate-fade-in" style={{ position: 'relative', animationDelay: '0.4s' }}>
            <div className="premium-card" style={{ padding: '0', overflow: 'hidden', border: 'none', boxShadow: '0 0 100px rgba(0, 45, 98, 0.5)' }}>
              <img 
                src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Church Community" 
                style={{ width: '100%', height: '500px', objectFit: 'cover', opacity: '0.8' }}
              />
              <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem' }}>
                <div className="premium-card" style={{ padding: '1.5rem', background: 'rgba(0, 18, 38, 0.8)', backdropFilter: 'blur(20px)' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '10px', color: 'black' }}>
                      <QrCode size={24} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0' }}>Smart Attendance</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0' }}>Fast QR-code check-ins for every service.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="section" style={{ background: 'var(--bg-darker)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Unified Ministry. Digital Grace.</h2>
            <p style={{ color: 'var(--text-dim)', maxWidth: '700px', margin: '0 auto' }}>
              Our system is designed to provide seamless interaction between the church leadership and the congregation.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="premium-card">
              <Users style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} size={40} />
              <h3>Member Portal</h3>
              <p style={{ color: 'var(--text-dim)' }}>Access your personal QR code, track your attendance history, and stay connected with your cell group.</p>
            </div>
            <div className="premium-card">
              <Shield style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} size={40} />
              <h3>Leader Control</h3>
              <p style={{ color: 'var(--text-dim)' }}>Dedicated portal for group leaders to manage their members and monitor growth metrics in real-time.</p>
            </div>
            <div className="premium-card">
              <CheckCircle style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} size={40} />
              <h3>Quick Scanning</h3>
              <p style={{ color: 'var(--text-dim)' }}>Ushers can scan member codes in seconds, automated attendance logging with zero paperwork.</p>
            </div>
            <div className="premium-card">
              <Cloud style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} size={40} />
              <h3>Global Sermon Drive</h3>
              <p style={{ color: 'var(--text-dim)' }}>Access recorded sermon videos from anywhere in the world. Specifically designed for our international members.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Facebook Feed Section */}
      <section className="section" id="announcements">
        <div className="container">
          <div className="premium-card" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '4rem', padding: '4rem', background: 'linear-gradient(135deg, rgba(0, 45, 98, 0.5), rgba(0, 0, 0, 0.8))' }}>
            <div style={{ flex: '1', minWidth: '300px' }}>
              <h2 className="font-serif" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Church <span className="text-gradient">Announcements</span></h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem', marginBottom: '2rem', lineHeight: '1.6' }}>
                Stay completely up to date. Every post, devotion, livestream, and announcement shared by the leadership team is automatically pushed to this live bulletin.
              </p>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '3rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '15px' }}>
                 <img src="/logo.jpg" alt="DHLC logo" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid var(--primary)' }} />
                 <div>
                   <h4 style={{ margin: 0, fontSize: '1.2rem' }}>DHLC Davao City</h4>
                   <p style={{ color: 'var(--primary)', margin: 0, fontSize: '0.9rem' }}>@dhlcdavaocity</p>
                 </div>
              </div>
              <a href="https://www.facebook.com/dhlcdavaocity" target="_blank" rel="noreferrer" className="btn-primary" style={{ background: '#1877F2', color: 'white', display: 'inline-flex', padding: '0.8rem 1.5rem', fontWeight: 'bold' }}>
                Follow Us on Facebook
              </a>
            </div>
            
            <div style={{ flex: '1', display: 'flex', justifyContent: 'center', background: 'white', borderRadius: '12px', padding: '10px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)', maxWidth: '100%', overflow: 'hidden' }}>
              {/* Official Facebook Page Plugin IFrame - Responsive */}
              <iframe 
                src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fdhlcdavaocity&tabs=timeline&width=500&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId" 
                width="100%" 
                height="500" 
                style={{ border: 'none', overflow: 'hidden', minWidth: '280px', maxWidth: '500px' }} 
                scrolling="no" 
                frameBorder="0" 
                allowFullScreen={true} 
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                title="DHLC Davao Facebook Feed"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '4rem 0', borderTop: '1px solid var(--glass-border)', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
          &copy; 2026 Divine Healing Life-Changing Church (DHLC) Davao City. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
