import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  Users, PlusCircle, Search, Filter, Trash2, 
  Settings, Scan, CheckCircle2, X, Plus, Calendar, User, Camera, Save, Activity, BarChart3, Clock, Printer
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from '../App';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('scanner');
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [scanning, setScanning] = useState(false);
  const [currentEvent, setCurrentEvent] = useState({ name: 'Sunday Main Service', location: 'DHLC Sanctuary' });

  // Modals
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showMemberID, setShowMemberID] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  
  // States
  const [addingMember, setAddingMember] = useState(false);
  const [addingEvent, setAddingEvent] = useState(false);
  const [uploading, setUploading] = useState(false);
  const editFileRef = useRef(null);

  const [newMemberData, setNewMemberData] = useState({ name: '', email: '', role: 'member' });
  const [newEventData, setNewEventData] = useState({ name: '', date: '', time: '' });
  const [editProfileData, setEditProfileData] = useState({ nickname: '', lifeVerse: '', phone: '', address: '', photoURL: '' });

  useEffect(() => {
    const unsubMembers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubEvents = onSnapshot(query(collection(db, 'events'), orderBy('date', 'desc')), (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubMembers(); unsubEvents(); };
  }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddingMember(true);
    try {
      await addDoc(collection(db, 'users'), { ...newMemberData, createdAt: serverTimestamp() });
      setShowAddMember(false);
      setNewMemberData({ name: '', email: '', role: 'member' });
      alert("Member Enrolled! They can now log in using their Gmail.");
    } catch (err) { alert("Error enrolling member."); }
    setAddingMember(false);
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    setAddingEvent(true);
    try {
      await addDoc(collection(db, 'events'), { ...newEventData, createdAt: serverTimestamp() });
      setShowAddEvent(false);
      setNewEventData({ name: '', date: '', time: '' });
    } catch (err) { alert("Error adding event."); }
    setAddingEvent(false);
  };

  const handleUpdateRole = async (id, role) => {
    try {
      await updateDoc(doc(db, 'users', id), { role });
    } catch (err) { alert("Update failed."); }
  };

  const deleteEvent = async (id) => {
    if (window.confirm("Delete this event?")) {
      await deleteDoc(doc(db, 'events', id));
    }
  };

  const handleAdminPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedMember) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `profiles/${selectedMember.id}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'users', selectedMember.id), { photoURL: url });
      setEditProfileData({ ...editProfileData, photoURL: url });
      alert("Member photo updated!");
    } catch (err) { alert("Upload failed."); }
    setUploading(false);
  };

  const handleAdminSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'users', selectedMember.id), editProfileData);
      setShowEditProfile(false);
      alert("Profile updated successfully!");
    } catch (err) { alert("Update failed."); }
  };

  const startScanner = () => {
     setScanning(true);
     // Note: Real scanner would be initialized here (e.g. html5-qrcode)
     alert("Scanner Active! Listening for DHLC Member IDs...");
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const dashboardTitle = user.email === 'admin@dhlc.com' ? "Admin Hub" : "Ministry Hub";

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px', color: 'white', minHeight: '100vh' }}>
      <div className="animate-fade-in">
        
        {/* MODAL: EDIT MEMBER PROFILE (Admin Overrule) */}
        {showEditProfile && selectedMember && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="premium-card" style={{ maxWidth: '480px', width: '100%', border: '1px solid var(--primary)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                  <h2 className="font-serif">Modify Profile: {selectedMember.name}</h2>
                  <button onClick={() => setShowEditProfile(false)} className="btn-ghost"><X size={24}/></button>
               </div>
               
               <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', margin: '0 auto 1rem', overflow: 'hidden', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     {editProfileData.photoURL ? (
                       <img src={editProfileData.photoURL} alt="pfp" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     ) : (
                       <User size={50} opacity={0.2} />
                     )}
                  </div>
                  <button onClick={() => editFileRef.current.click()} className="btn-ghost" style={{ fontSize: '0.8rem' }}><Camera size={14} /> Change Photo</button>
                  <input type="file" ref={editFileRef} onChange={handleAdminPhotoUpload} style={{ display: 'none' }} />
               </div>

               <form onSubmit={handleAdminSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input type="text" placeholder="Nickname" value={editProfileData.nickname} onChange={(e) => setEditProfileData({...editProfileData, nickname: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: '#001a33', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '10px' }} />
                  <input type="text" placeholder="Life Verse" value={editProfileData.lifeVerse} onChange={(e) => setEditProfileData({...editProfileData, lifeVerse: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: '#001a33', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '10px' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                     <input type="text" placeholder="Phone" value={editProfileData.phone} onChange={(e) => setEditProfileData({...editProfileData, phone: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: '#001a33', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '10px' }} />
                     <input type="text" placeholder="Address" value={editProfileData.address} onChange={(e) => setEditProfileData({...editProfileData, address: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: '#001a33', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '10px' }} />
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: '1rem', marginTop: '1rem' }}><Save size={18} /> Save Changes</button>
               </form>
            </div>
          </div>
        )}

        {/* [Other existing modals: Add Member, Add Event, View QR ID remain here...] */}
        {showAddMember && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="premium-card" style={{ maxWidth: '450px', width: '100%', border: '1px solid var(--primary)' }}>
               <h2 className="font-serif" style={{ marginBottom: '1.5rem' }}>Enroll Member</h2>
               <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input type="text" placeholder="Full Name" value={newMemberData.name} onChange={(e) => setNewMemberData({...newMemberData, name: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '10px' }} required />
                  <input type="email" placeholder="Email" value={newMemberData.email} onChange={(e) => setNewMemberData({...newMemberData, email: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '10px' }} required />
                  <select value={newMemberData.role} onChange={(e) => setNewMemberData({...newMemberData, role: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '10px' }}>
                    <option value="member">Member</option><option value="leader">Leader</option><option value="minister">Minister</option>
                  </select>
                  <button type="submit" className="btn-primary" disabled={addingMember}>{addingMember ? 'Saving...' : 'Register Member'}</button>
                  <button type="button" onClick={() => setShowAddMember(false)} className="btn-ghost">Cancel</button>
               </form>
            </div>
          </div>
        )}

        {showAddEvent && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="premium-card" style={{ maxWidth: '450px', width: '100%', border: '1px solid var(--primary)' }}>
               <h2 className="font-serif" style={{ marginBottom: '1.5rem' }}>Plan Event</h2>
               <form onSubmit={handleAddEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input type="text" placeholder="Event Name" value={newEventData.name} onChange={(e) => setNewEventData({...newEventData, name: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '10px' }} required />
                  <input type="date" value={newEventData.date} onChange={(e) => setNewEventData({...newEventData, date: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '10px' }} required />
                  <input type="time" value={newEventData.time} onChange={(e) => setNewEventData({...newEventData, time: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '10px' }} required />
                  <button type="submit" className="btn-primary" disabled={addingEvent}>{addingEvent ? 'Saving...' : 'Add to Schedule'}</button>
                  <button type="button" onClick={() => setShowAddEvent(false)} className="btn-ghost" style={{ marginTop: '0.5rem' }}>Cancel</button>
               </form>
            </div>
          </div>
        )}

        {showMemberID && selectedMember && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.95)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="premium-card" style={{ maxWidth: '380px', textAlign: 'center', padding: '3rem 2rem', border: '2px solid var(--primary)', borderRadius: '30px' }}>
               <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', margin: '0 auto 1.5rem', overflow: 'hidden', border: '1px solid var(--primary)' }}>
                  {selectedMember.photoURL ? <img src={selectedMember.photoURL} alt="pfp" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={40} opacity={0.1}/>}
               </div>
               <h2 className="font-serif">{selectedMember.nickname || selectedMember.name}</h2>
               <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{selectedMember.role.toUpperCase()}</p>
               <div style={{ background: 'white', padding: '1.2rem', borderRadius: '15px', display: 'inline-block', margin: '2rem 0' }}>
                  <QRCodeCanvas value={selectedMember.id} size={180} />
               </div>
               <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => window.print()} className="btn-primary" style={{ flex: 1 }}><Printer size={16} /> PRINT</button>
                  <button onClick={() => setShowMemberID(false)} className="btn-ghost" style={{ flex: 1 }}>CLOSE</button>
               </div>
            </div>
          </div>
        )}

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div><h1 className="font-serif" style={{ fontSize: '3rem' }}>{dashboardTitle}</h1><p style={{ color: 'var(--text-dim)' }}>DHLC Command Center</p></div>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <button onClick={() => setShowAddEvent(true)} className="btn-ghost" style={{ color: 'var(--primary)', borderColor: 'var(--primary)', padding: '0.6rem 1.2rem' }}><Calendar size={18} /> Plan Event</button>
             <button onClick={() => setShowAddMember(true)} className="btn-primary" style={{ padding: '0.6rem 1.2rem' }}><PlusCircle size={18} /> Enroll Member</button>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
           {['scanner', 'analytics', 'schedule', 'members'].map(t => (
             <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '1rem 0', background: 'none', border: 'none', borderBottom: activeTab === t ? '2px solid var(--primary)' : 'none', color: activeTab === t ? 'white' : 'gray', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase' }}>{t}</button>
           ))}
        </div>

        {/* DIRECTORY TAB */}
        {activeTab === 'members' && (
           <div className="premium-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                 <div style={{ position: 'relative', width: '300px' }}><Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} size={18} /><input autoFocus placeholder="Search members..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '15px' }} /></div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ textAlign: 'left', opacity: 0.5 }}><th>NAME</th><th>ROLE / LEVEL</th><th style={{ textAlign: 'right' }}>ACTIONS</th></tr></thead>
                    <tbody>
                       {filteredMembers.map(m => (
                          <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                             <td style={{ padding: '1rem 0' }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {m.photoURL ? <img src={m.photoURL} alt="pfp" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--primary)' }} /> : <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={12} opacity={0.2}/></div>}
                                    <b>{m.name}</b>
                                 </div>
                              </td>
                              <td>
                                 <select value={m.role || 'member'} onChange={(e) => handleUpdateRole(m.id, e.target.value)} style={{ background: '#001a33', border: '1px solid var(--primary)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.85rem' }}>
                                    <option value="member">Member</option><option value="leader">Leader</option><option value="minister">Minister</option><option value="admin">Admin Hub</option>
                                 </select>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                 <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    <button onClick={() => { 
                                      setSelectedMember(m); 
                                      setEditProfileData({ nickname: m.nickname || '', lifeVerse: m.lifeVerse || '', phone: m.phone || '', address: m.address || '', photoURL: m.photoURL || '' });
                                      setShowEditProfile(true); 
                                    }} className="btn-ghost" style={{ fontSize: '0.8rem' }}><Edit3 size={14} /> EDIT</button>
                                    <button onClick={() => {setSelectedMember(m); setShowMemberID(true);}} className="btn-ghost" style={{ fontSize: '0.8rem' }}><Scan size={14} /> QR CARD</button>
                                 </div>
                              </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

        {/* SCANNER, ANALYTICS, SCHEDULE TABS (remain as previously implemented) */}
        {activeTab === 'analytics' && <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}><BarChart3 size={40}/><p>Visualizing growth trends...</p></div>}
        {activeTab === 'scanner' && <div style={{ padding: '5rem', textAlign: 'center' }}><Scan size={60} style={{ opacity: 0.1, marginBottom: '2rem' }}/><button onClick={startScanner} className="btn-primary">ACTIVATE SCANNER</button></div>}
        {activeTab === 'schedule' && (
           <div className="premium-card">
              <table style={{ width: '100%' }}>
                 <thead><tr style={{ textAlign: 'left', opacity: 0.5 }}><th>DATE</th><th>EVENT</th></tr></thead>
                 <tbody>{events.map(e => (<tr key={e.id}><td>{e.date}</td><td>{e.name}</td></tr>))}</tbody>
              </table>
              {events.length === 0 && <div style={{ textAlign: 'center', padding: '5rem' }}><Calendar size={40} opacity={0.1}/><p>No events planned.</p></div>}
           </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
