import React, { useState, useEffect, useRef } from 'react';
import { db, storage, auth } from '../lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../App';
import { 
  User, Award, Star, Shield, Clock, 
  ChevronRight, Camera, Edit3, Heart, 
  MapPin, Phone, Mail, Save, X, Settings
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const MemberDashboard = () => {
  const { user } = useAuth();
  const [memberData, setMemberData] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Edit State
  const [editData, setEditData] = useState({
    nickname: '',
    lifeVerse: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (!user?.id) return;
    const unsub = onSnapshot(doc(db, 'users', user.id), (docS) => {
      const data = docS.data();
      setMemberData(data);
      setEditData({
        nickname: data.nickname || '',
        lifeVerse: data.lifeVerse || '',
        phone: data.phone || '',
        address: data.address || ''
      });
    });
    return () => unsub();
  }, [user]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `profiles/${user.id}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'users', user.id), { photoURL: url });
      alert("Profile photo updated! You look great! 🕊️");
    } catch (err) {
      alert("Upload failed. Please check image size.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'users', user.id), editData);
      setShowEdit(false);
      alert("Ministry Profile Saved!");
    } catch (err) { alert("Update failed."); }
  };

  if (!memberData) return <div style={{ padding: '100px', textAlign: 'center' }}>Syncing with Heaven... 🕊️</div>;

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
      <div className="animate-fade-in">
        
        {/* PROFILE HEADER SECTION */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', marginBottom: '4rem', alignItems: 'center' }}>
           <div style={{ textAlign: 'center', position: 'relative' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                 <div style={{ 
                    width: '220px', height: '220px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--primary), #FFD700)', padding: '5px', boxShadow: '0 0 30px rgba(242,153,0,0.3)', marginBottom: '1.5rem', overflow: 'hidden'
                 }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#001a33', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       {memberData.photoURL ? (
                         <img src={memberData.photoURL} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                       ) : (
                         <User size={80} style={{ opacity: 0.1 }} />
                       )}
                    </div>
                 </div>
                 <button 
                   onClick={() => fileInputRef.current.click()}
                   style={{ position: 'absolute', bottom: '25px', right: '15px', background: 'var(--primary)', border: 'none', color: 'black', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }}
                 >
                    <Camera size={20} />
                 </button>
                 <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} style={{ display: 'none' }} accept="image/*" />
              </div>
              <h1 className="font-serif" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{memberData.name}</h1>
              <span style={{ color: 'var(--primary)', fontWeight: 'bold', letterSpacing: '2px', fontSize: '0.8rem' }}>{memberData.role.toUpperCase()} • DHLC DAVAO CITY</span>
           </div>

           <div className="premium-card" style={{ padding: '2.5rem', background: 'var(--glass)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                 <h2 className="font-serif" style={{ margin: 0 }}>Ministry Profile</h2>
                 <button onClick={() => setShowEdit(true)} className="btn-ghost" style={{ padding: '8px 15px', borderRadius: '20px' }}><Edit3 size={16} /> Edit Profile</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><Heart size={18} className="text-primary" /> <span><b>Life Verse:</b> {memberData.lifeVerse || 'Add your favorite scripture...'}</span></div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><Star size={18} className="text-primary" /> <span><b>Nickname:</b> {memberData.nickname || memberData.name.split(' ')[0]}</span></div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><Phone size={18} className="text-primary" /> <span><b>Contact:</b> {memberData.phone || 'Enter phone number...'}</span></div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><MapPin size={18} className="text-primary" /> <span><b>Address:</b> {memberData.address || 'Enter residence...'}</span></div>
              </div>
           </div>
        </div>

        {/* PROGRESS & ID SECTION */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
           
           {/* DIGITAL ID CARD (UPGRADED WITH PHOTO) */}
           <div className="premium-card hover-effect" style={{ background: 'linear-gradient(135deg, #001a33, #002b4d)', border: '1px solid var(--primary)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'rgba(242,153,0,0.05)', borderRadius: '50%' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                 <img src="/logo.png" alt="DHLC" style={{ height: '35px', filter: 'brightness(0) invert(1)' }} />
                 <span style={{ fontSize: '0.65rem', letterSpacing: '2px', opacity: 0.5 }}>OFFICIAL MEMBER PASS</span>
              </div>
              
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2.5rem' }}>
                 <div style={{ width: '85px', height: '85px', borderRadius: '15px', border: '1px solid var(--primary)', overflow: 'hidden' }}>
                    {memberData.photoURL ? (
                      <img src={memberData.photoURL} alt="ID" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={30} opacity={0.1}/></div>
                    )}
                 </div>
                 <div>
                    <h3 className="font-serif" style={{ fontSize: '1.6rem', marginBottom: '0.2rem' }}>{memberData.nickname || memberData.name}</h3>
                    <p style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.75rem', letterSpacing: '1px' }}>{memberData.role.toUpperCase()}</p>
                 </div>
              </div>

              <div style={{ background: 'white', padding: '15px', borderRadius: '15px', display: 'flex', justifyContent: 'center', marginBottom: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.4)' }}>
                 <QRCodeCanvas value={memberData.id} size={130} />
              </div>
              <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                 <p style={{ fontSize: '0.6rem', letterSpacing: '1px', opacity: 0.5 }}>IDENTIFICATION SECURE • SCAN FOR SERVICE & EVENTS</p>
              </div>
           </div>

           {/* GROWTH STEPS */}
           <div className="premium-card">
              <h3 className="font-serif" style={{ marginBottom: '2rem' }}>Spiritual Growth Tracking</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                 {[
                   { title: 'New Believer', icon: <Award size={20} />, completed: true, date: 'Mar 2026' },
                   { title: 'Divinity Class I', icon: <Star size={20} />, completed: true, date: 'Apr 2026' },
                   { title: 'Worker Trainee', icon: <Shield size={20} />, completed: false, date: 'Ongoing' }
                 ].map((step, i) => (
                   <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', opacity: step.completed ? 1 : 0.4 }}>
                      <div style={{ 
                        width: '50px', height: '50px', borderRadius: '12px', background: step.completed ? 'rgba(242,153,0,0.1)' : 'rgba(255,255,255,0.05)', color: step.completed ? 'var(--primary)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>{step.icon}</div>
                      <div style={{ flex: 1 }}>
                         <h4 style={{ margin: 0 }}>{step.title}</h4>
                         <p style={{ fontSize: '0.75rem', opacity: 0.5, margin: 0 }}>{step.date}</p>
                      </div>
                      {step.completed && <CheckCircle2 size={20} color="#2ecc71" />}
                   </div>
                 ))}
              </div>
           </div>

        </div>

        {/* MODAL: EDIT PROFILE */}
        {showEdit && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
             <div className="premium-card" style={{ maxWidth: '450px', width: '100%', border: '1px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                   <h2 className="font-serif">Personalize Membership</h2>
                   <button onClick={() => setShowEdit(false)} className="btn-ghost"><X size={20}/></button>
                </div>
                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                   <div>
                      <label style={{ fontSize: '0.75rem', opacity: 0.5, marginBottom: '5px', display: 'block' }}>NICKNAME / MINISTRY NAME</label>
                      <input type="text" value={editData.nickname} onChange={(e) => setEditData({...editData, nickname: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: '#001a33', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '10px' }} placeholder="E.g. Bro Jason" />
                   </div>
                   <div>
                      <label style={{ fontSize: '0.75rem', opacity: 0.5, marginBottom: '5px', display: 'block' }}>LIFE VERSE (SCRIPTURE)</label>
                      <input type="text" value={editData.lifeVerse} onChange={(e) => setEditData({...editData, lifeVerse: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: '#001a33', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '10px' }} placeholder="E.g. Jeremiah 29:11" />
                   </div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', opacity: 0.5, marginBottom: '5px', display: 'block' }}>CONTACT #</label>
                        <input type="text" value={editData.phone} onChange={(e) => setEditData({...editData, phone: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: '#001a33', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '10px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', opacity: 0.5, marginBottom: '5px', display: 'block' }}>ADDRESS</label>
                        <input type="text" value={editData.address} onChange={(e) => setEditData({...editData, address: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: '#001a33', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '10px' }} />
                      </div>
                   </div>
                   <button type="submit" className="btn-primary" style={{ padding: '1rem', marginTop: '1rem' }}><Save size={18} /> Update My Profile</button>
                </form>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MemberDashboard;
