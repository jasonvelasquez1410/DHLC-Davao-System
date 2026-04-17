import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../App';
import { 
  User, Award, Calendar, Clock, ShieldCheck, 
  ArrowRight, Download, Scan, CheckCircle2, 
  Star, Zap, Activity, QrCode
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const MemberDashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sample progress data - can be linked to Firestore later
  const progressItems = [
    { title: 'Foundations of Faith', status: 'completed', date: 'Mar 12, 2026' },
    { title: 'Divinity Level 1', status: 'in-progress', percent: 65 },
    { title: 'Ministry Training', status: 'locked' }
  ];

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.uid) return;
      try {
        const q = query(
          collection(db, 'attendance'), 
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        const snap = await getDocs(q);
        setHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user?.uid]);

  const downloadQR = () => {
    const canvas = document.getElementById("qr-canvas");
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${user?.name || 'Member'}_DHLC_ID.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="hero" style={{ paddingTop: '100px', display: 'block', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
          
          {/* Left Column: ID & Profile */}
          <div className="animate-fade-in">
            <div className="premium-card" style={{ textAlign: 'center', padding: '3rem 2rem', position: 'relative' }}>
               <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
                  <ShieldCheck className="text-primary" size={24} />
               </div>
               
               <div style={{ 
                 width: '120px', 
                 height: '120px', 
                 borderRadius: '50%', 
                 border: '4px solid var(--primary)', 
                 margin: '0 auto 1.5rem',
                 padding: '5px',
                 boxShadow: '0 0 30px var(--primary-glow)'
               }}>
                 <img 
                   src={user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'} 
                   alt="Profile" 
                   style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                 />
               </div>

               <h1 className="font-serif" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{user?.name || 'Vibrant Member'}</h1>
               <p style={{ color: 'var(--primary)', fontWeight: 'bold', letterSpacing: '2px', fontSize: '0.9rem', marginBottom: '2rem' }}>
                 {user?.role?.toUpperCase() || 'MEMBER'}
               </p>

               {/* Digital QR ID Section */}
               <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '24px', padding: '2rem', border: '1px solid var(--glass-border)', marginBottom: '2rem' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '1.5rem', fontWeight: 'bold' }}>SCAN FOR SERVICE ATTENDANCE</p>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '15px', display: 'inline-block', boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}>
                    <QRCodeCanvas id="qr-canvas" value={user?.uid || 'no-id'} size={160} />
                  </div>
                  <div style={{ marginTop: '1.5rem', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                     <button className="btn-primary" style={{ fontSize: '0.85rem', padding: '10px 20px', width: '100%' }} onClick={downloadQR}>
                        <Download size={16} /> DOWNLOAD DIGITAL ID
                     </button>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Column: Mission Progress & Activity */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="font-serif" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Zap className="text-primary" /> Mission Progress
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {progressItems.map((item, idx) => (
                <div key={idx} className="premium-card hover-effect" style={{ padding: '1.2rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: item.percent ? '1rem' : '0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {item.status === 'completed' ? <CheckCircle2 className="text-green-400" size={20} /> : 
                       item.status === 'locked' ? <ShieldCheck style={{ opacity: 0.3 }} size={20} /> :
                       <Activity className="text-primary" size={20} />}
                      <span style={{ fontWeight: '600', opacity: item.status === 'locked' ? 0.3 : 1 }}>{item.title}</span>
                    </div>
                    {item.date && <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{item.date}</span>}
                  </div>
                  
                  {item.percent && (
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${item.percent}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), #FFB733)', boxShadow: '0 0 15px var(--primary-glow)' }}></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Attendance History Segment */}
            <div className="premium-card" style={{ marginTop: '2.5rem', padding: '1.5rem' }}>
               <h3 className="font-serif" style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <Clock size={18} className="text-primary" /> Recent Services
               </h3>
               {history.length > 0 ? (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {history.map(record => (
                      <div key={record.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <span style={{ fontSize: '0.9rem' }}><b>{record.service}</b></span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{record.timestamp?.toDate().toLocaleDateString()}</span>
                      </div>
                    ))}
                 </div>
               ) : (
                 <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No attendance records found yet.</p>
               )}
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginTop: '2rem' }}>
               <div className="premium-card" style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                  <Calendar className="text-primary" style={{ margin: '0 auto 10px' }} size={24} />
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>12</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>SERVICES</div>
               </div>
               <div className="premium-card" style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(242,153,0,0.05)' }}>
                  <Star className="text-primary" style={{ margin: '0 auto 10px' }} size={24} />
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>GOLD</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>LEVEL</div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
