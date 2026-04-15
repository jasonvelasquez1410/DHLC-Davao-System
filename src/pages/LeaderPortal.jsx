import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../App';
import { 
  Users, TrendingUp, Award, UserPlus, 
  CheckCircle2, XCircle, LayoutDashboard, 
  Calendar, MessageSquare, QrCode
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const LeaderPortal = () => {
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const q = query(collection(db, 'groups'), where('leaderId', '==', user.uid));
        const snap = await getDocs(q);
        
        if (!snap.empty) {
          const groupData = { id: snap.docs[0].id, ...snap.docs[0].data() };
          const memQ = query(collection(db, 'users'), where('groupId', '==', groupData.id));
          const memSnap = await getDocs(memQ);
          const members = memSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          setGroup({ ...groupData, members });
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    if (user?.uid) fetchGroup();
  }, [user?.uid]);

  const downloadQR = () => {
    const canvas = document.getElementById("leader-qr");
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${user.name.replace(/\s+/g, '_')}_DHLC_Leader_QR.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  if (loading) return (
    <div className="hero" style={{ justifyContent: 'center' }}>
      <h2 className="text-gradient">Synching Group Wisdom...</h2>
    </div>
  );

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
      <div className="animate-fade-in">
        
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <h1 className="font-serif" style={{ fontSize: '3rem' }}>Leader <span className="text-gradient">Portal</span></h1>
            <p style={{ color: 'var(--text-dim)' }}>Equipping you to lead the {group?.name || 'Assigned'} cell group with excellence.</p>
          </div>
          <button className="btn-primary"><UserPlus size={18} /> Add Member</button>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(242, 153, 0, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={30} />
            </div>
            <div>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>TOTAL MEMBERS</p>
              <h3 style={{ fontSize: '1.8rem' }}>{group?.members?.length || 0}</h3>
            </div>
          </div>
          <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={30} />
            </div>
            <div>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>AVG. ATTENDANCE</p>
              <h3 style={{ fontSize: '1.8rem' }}>88%</h3>
            </div>
          </div>
          <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(33, 150, 243, 0.1)', color: '#2196f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={30} />
            </div>
            <div>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>TRAINING LEVEL</p>
              <h3 style={{ fontSize: '1.8rem' }}>Gold</h3>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          
          {/* Member List */}
          <div className="premium-card">
            <h3 style={{ marginBottom: '2rem' }}>Group Roster</h3>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr style={{ textAlign: 'left' }}>
                    <th>Name</th>
                    <th>Attendance Rate</th>
                    <th>Last Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {group?.members?.map(member => (
                    <tr key={member.id}>
                      <td>
                        <p style={{ fontWeight: '700' }}>{member.name}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{member.email}</p>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '6px', background: 'var(--glass)', borderRadius: '3px', width: '60px' }}>
                             <div style={{ width: '90%', height: '100%', background: 'var(--primary)', borderRadius: '3px' }}></div>
                          </div>
                          <span style={{ fontSize: '0.8rem' }}>90%</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>3 days ago</td>
                      <td>
                         <button className="btn-ghost" style={{ padding: '0.4rem 0.8rem' }}><MessageSquare size={14} /></button>
                      </td>
                    </tr>
                  ))}
                  {!group?.members?.length && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '3rem' }}>No members assigned to this group yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
             <div className="premium-card">
                <h3>Weekly Action Items</h3>
                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                   <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <CheckCircle2 color="#4caf50" size={20} style={{ marginTop: '2px' }} />
                      <p style={{ fontSize: '0.9rem' }}>Follow up with new members from last Sunday.</p>
                   </div>
                   <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <Calendar color="var(--primary)" size={20} style={{ marginTop: '2px' }} />
                      <p style={{ fontSize: '0.9rem' }}>Prepare for Wednesday Mid-week Service.</p>
                   </div>
                   <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <XCircle color="#f44336" size={20} style={{ marginTop: '2px' }} />
                      <p style={{ fontSize: '0.9rem' }}>Submit monthly growth report (Overdue).</p>
                   </div>
                </div>
             </div>

             <div className="premium-card" style={{ background: 'linear-gradient(135deg, var(--secondary), var(--bg-dark))' }}>
                <h3 style={{ color: 'var(--primary)' }}>Leadership Tip</h3>
                <p style={{ fontSize: '0.95rem', margin: '1rem 0', fontStyle: 'italic' }}>
                  "Leadership is not about being in charge. It is about taking care of those in your charge."
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                   <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>— DHLC Leadership Manuel</span>
                </div>
             </div>

             <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <QrCode size={18} color="var(--primary)" /> Leader Check-In QR
                </h3>
                <div style={{ background: 'white', padding: '1rem', borderRadius: '15px', display: 'inline-block' }}>
                   <QRCodeCanvas 
                     id="leader-qr"
                     value={user.uid}
                     size={200}
                     level="H"
                     fgColor="#001226"
                   />
                </div>
                <button className="btn-ghost" style={{ marginTop: '1.5rem', width: '100%' }} onClick={downloadQR}>
                   Save QR as PNG
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LeaderPortal;
