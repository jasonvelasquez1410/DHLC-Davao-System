import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../App';
import { QRCodeCanvas } from 'qrcode.react';
import { User, Mail, Award, Calendar, ExternalLink, QrCode } from 'lucide-react';

const MemberDashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, 'attendance'), 
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(10)
        );
        const snap = await getDocs(q);
        setHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    if (user?.uid) fetchHistory();
  }, [user?.uid]);

  const downloadQR = () => {
    const canvas = document.getElementById("qr-canvas");
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${user.name.replace(/\s+/g, '_')}_DHLC_Attendance_QR.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <h1 className="font-serif" style={{ fontSize: '3rem' }}>Member <span className="text-gradient">Portal</span></h1>
            <p style={{ color: 'var(--text-dim)' }}>Welcome back, {user.name}. Your spiritual journey is our priority.</p>
          </div>
          <div style={{ padding: '0.8rem 1.5rem', background: 'var(--glass)', borderRadius: '15px', border: '1px solid var(--glass-border)' }}>
             <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Status: Active Member</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
          
          {/* Profile Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="premium-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2.5rem' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--secondary), var(--bg-dark))', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', boxShadow: '0 0 20px var(--primary-glow)' }}>
                  <User size={50} />
                </div>
                <div>
                  <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{user.name}</h2>
                  <p style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={16} /> {user.email}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px solid var(--glass-border)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>CELL GROUP</p>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={18} color="var(--primary)" /> {user.groupId || 'Assigning...'}
                  </h4>
                </div>
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px solid var(--glass-border)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>MEMBER SINCE</p>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={18} color="var(--primary)" /> 2024
                  </h4>
                </div>
              </div>
            </div>

            <div className="premium-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3>Recent Attendance</h3>
                <Link to="#" style={{ color: 'var(--primary)', fontSize: '0.9rem', textDecoration: 'none' }}>View All</Link>
              </div>
              
              {history.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {history.map((record) => (
                    <div key={record.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                      <div>
                        <p style={{ fontWeight: '600' }}>{record.service || 'Sunday Service'}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Checked in by Church Admin</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ color: '#4caf50', fontSize: '0.8rem', fontWeight: 'bold' }}>SUCCESS</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{record.timestamp?.toDate().toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                  No attendance records found yet.
                </div>
              )}
            </div>
          </div>

          {/* QR Code Section */}
          <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(242, 153, 0, 0.1)', borderRadius: '50%', color: 'var(--primary)', marginBottom: '1rem' }}>
                <QrCode size={32} />
              </div>
              <h2 className="font-serif">Attendance QR</h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', maxWidth: '300px', margin: '1rem auto' }}>
                Scan this code at the usher's station when you enter the church.
              </p>
            </div>

            <div className="qr-container" style={{ background: 'white', padding: '1rem', borderRadius: '15px' }}>
              <QRCodeCanvas 
                id="qr-canvas"
                value={user.uid} // Using UID as the QR identifier
                size={220}
                level="H"
                marginSize={4}
                fgColor="#001226"
              />
            </div>

            <div style={{ marginTop: '2rem', width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Unique ID: {user.uid.substring(0, 10)}...
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', width: '100%' }}>
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={downloadQR}>
                 Save as Image
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
