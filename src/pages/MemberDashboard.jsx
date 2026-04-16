import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../App';
import { QRCodeCanvas } from 'qrcode.react';
import { User, Mail, Award, Calendar, ExternalLink, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';

const MemberDashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    family: user?.family || ''
  });

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.uid) return;
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
    fetchHistory();
  }, [user?.uid]);

  const downloadQR = () => {
    const canvas = document.getElementById("qr-canvas");
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${(user?.name || 'Member').replace(/\s+/g, '_')}_DHLC_ID.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  if (!user) return <div style={{ color: 'white', paddingTop: '150px', textAlign: 'center' }}>Please sign in to view your dashboard.</div>;

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px', color: 'white' }}>
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="font-serif" style={{ fontSize: '3rem' }}>Member <span className="text-gradient">Portal</span></h1>
            <p style={{ color: 'var(--text-dim)' }}>Welcome back, {user.name}. View your digital ID and attendance history.</p>
          </div>
          <div style={{ padding: '0.8rem 1.5rem', background: 'rgba(242, 153, 0, 0.1)', borderRadius: '15px', border: '1px solid var(--primary)' }}>
             <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Active Member</span>
          </div>
        </div>

        {/* PROFILE SECTION */}
        <div className="premium-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={20} color="var(--primary)" /> Profile Details
            </h3>
            <button className="btn-ghost" onClick={() => setEditingProfile(!editingProfile)} style={{ padding: '0.5rem 1rem' }}>
               {editingProfile ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {editingProfile ? (
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const userRef = doc(db, 'users', user.uid);
                await setDoc(userRef, profileData, { merge: true });
                setEditingProfile(false);
                alert("Profile Updated!");
              } catch (err) { alert("Error saving."); }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} placeholder="Full Name" style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }} />
                <input type="text" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} placeholder="Phone Number" style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }} />
              </div>
              <button type="submit" className="btn-primary" style={{ width: 'fit-content', padding: '0.6rem 2rem' }}>Save Changes</button>
            </form>
          ) : (
            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', opacity: 0.8 }}>
               <div><p style={{ fontSize: '0.7rem', color: 'var(--primary)', margin: 0 }}>FULL NAME</p><p style={{ fontWeight: 'bold' }}>{user.name}</p></div>
               <div><p style={{ fontSize: '0.7rem', color: 'var(--primary)', margin: 0 }}>EMAIL ADDRESS</p><p style={{ fontWeight: 'bold' }}>{user.email}</p></div>
               <div><p style={{ fontSize: '0.7rem', color: 'var(--primary)', margin: 0 }}>PHONE</p><p style={{ fontWeight: 'bold' }}>{user.phone || 'Not set'}</p></div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          {/* QR CODE ID CARD */}
          <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'linear-gradient(135deg, rgba(242,153,0,0.05), transparent)' }}>
            <div style={{ width: '60px', height: '60px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 10px 30px rgba(242,153,0,0.3)' }}>
               <QrCode color="black" size={30} />
            </div>
            <h2 className="font-serif">Attendance QR</h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '2rem' }}>Show this code to the attendant upon entry.</p>
            
            <div style={{ background: 'white', padding: '1.2rem', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
               <QRCodeCanvas id="qr-canvas" value={user.uid} size={180} />
            </div>
            
            <button onClick={downloadQR} className="btn-primary" style={{ marginTop: '2rem', width: '100%' }}>Download Digital ID</button>
          </div>

          {/* ATTENDANCE HISTORY */}
          <div className="premium-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                 <h3 style={{ margin: 0 }}>My History</h3>
                 <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Last 10 Records</span>
              </div>
              
              {history.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   {history.map(record => (
                     <div key={record.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div>
                           <p style={{ fontWeight: 'bold', margin: '0 0 0.2rem 0' }}>{record.service}</p>
                           <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>Davao Sanctuary</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                           <p style={{ color: '#2ecc71', fontWeight: 'bold', fontSize: '0.75rem' }}>PRESENT</p>
                           <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>{record.timestamp?.toDate().toLocaleDateString()}</p>
                        </div>
                     </div>
                   ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '4rem 0', opacity: 0.3 }}>
                   <Calendar size={40} style={{ marginBottom: '1rem' }} />
                   <p>No services attended yet.</p>
                </div>
              )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
