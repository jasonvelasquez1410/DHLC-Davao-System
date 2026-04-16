import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc, orderBy, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../App';
import { 
  Users, Scan, BarChart3, Search, PlusCircle, Check, X, 
  UserCheck, Shield, ChevronRight, Filter, Download, Printer, UserCircle, Calendar, Clock, MapPin, Trash2
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QRCodeCanvas } from 'qrcode.react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('scanner');
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [showAddMember, setShowAddMember] = useState(false);
  const [showMemberID, setShowMemberID] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  
  // Form States
  const [newMemberData, setNewMemberData] = useState({ name: '', email: '', role: 'member', family: '' });
  const [newEventData, setNewEventData] = useState({ name: '', date: '', time: '', location: 'Davao Sanctuary' });
  const [currentEvent, setCurrentEvent] = useState({ name: 'Sunday Main Service', location: 'Davao Sanctuary' });
  const [addingMember, setAddingMember] = useState(false);
  const [addingEvent, setAddingEvent] = useState(false);

  // Dash Labels
  let dashboardTitle = "Admin Hub";
  let dashboardSubtitle = "Manage members, track growth, and oversee church operations.";
  if (user?.email === 'admin@dhlc.com') {
    dashboardTitle = "Head Pastor Dashboard";
  }

  // Moved fetchData OUT of useEffect so it can be called anywhere safely
  const fetchData = async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      setMembers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const eventsSnap = await getDocs(query(collection(db, 'events'), orderBy('date', 'asc')));
      setEvents(eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddingMember(true);
    try {
      const docRef = await addDoc(collection(db, 'users'), { ...newMemberData, createdAt: serverTimestamp(), status: 'active' });
      const newlyAdded = { id: docRef.id, ...newMemberData };
      setSelectedMember(newlyAdded);
      setShowAddMember(false);
      setShowMemberID(true);
      setNewMemberData({ name: '', email: '', role: 'member', family: '' });
      fetchData(); // Now using the shared function
    } catch (err) { 
      console.error(err);
      alert("Error adding member."); 
    } finally { setAddingMember(false); }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    setAddingEvent(true);
    try {
      await addDoc(collection(db, 'events'), { ...newEventData, createdAt: serverTimestamp() });
      setShowAddEvent(false);
      setNewEventData({ name: '', date: '', time: '', location: 'Davao Sanctuary' });
      fetchData();
    } catch (err) { alert("Error adding event."); } finally { setAddingEvent(false); }
  };

  const deleteEvent = async (id) => {
    if (window.confirm("Remove this event from schedule?")) {
      await deleteDoc(doc(db, 'events', id));
      fetchData();
    }
  };

  const handleScanSuccess = async (qrData) => {
    if (scanning === false) return; 
    setScanning(false);
    try {
      const userRef = doc(db, 'users', qrData);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        setScanResult({ success: false, message: 'Member ID not recognized' });
        return;
      }
      const scannedUser = { id: userSnap.id, ...userSnap.data() };
      await addDoc(collection(db, 'attendance'), {
        userId: scannedUser.id,
        userName: scannedUser.name,
        timestamp: serverTimestamp(),
        service: currentEvent.name,
        location: currentEvent.location
      });
      setScanResult({ success: true, user: scannedUser });
      setTimeout(() => setScanResult(null), 5000);
    } catch (err) {
      setScanResult({ success: false, message: 'Process error.' });
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      fetchData(); // Refresh list to show change
    } catch (err) {
      alert("Permission denied or update failed.");
    }
  };

  const startScanner = () => {
    setScanning(true);
    setScanResult(null);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", { fps: 15, qrbox: { width: 280, height: 280 } }, false);
      scanner.render((decodedText) => { scanner.clear(); handleScanSuccess(decodedText); }, () => {});
    }, 200);
  };

  const filteredMembers = members.filter(m => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px', color: 'white', minHeight: '100vh', background: 'transparent' }}>
      <div className="animate-fade-in">
        
        {/* MODAL: ADD MEMBER */}
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

        {/* MODAL: ADD EVENT */}
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

        {/* MODAL: VIEW QR ID */}
        {showMemberID && selectedMember && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.95)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="premium-card" style={{ maxWidth: '380px', textAlign: 'center', padding: '3rem 2rem', border: '2px solid var(--primary)', borderRadius: '30px' }}>
               <h2 className="font-serif">{selectedMember.name}</h2>
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
           <button onClick={() => setActiveTab('scanner')} style={{ padding: '1rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'scanner' ? '2px solid var(--primary)' : 'none', color: activeTab === 'scanner' ? 'white' : 'gray', cursor: 'pointer', fontWeight: 'bold' }}>SCANNER</button>
           <button onClick={() => setActiveTab('schedule')} style={{ padding: '1rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'schedule' ? '2px solid var(--primary)' : 'none', color: activeTab === 'schedule' ? 'white' : 'gray', cursor: 'pointer', fontWeight: 'bold' }}>SCHEDULE</button>
           <button onClick={() => setActiveTab('members')} style={{ padding: '1rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'members' ? '2px solid var(--primary)' : 'none', color: activeTab === 'members' ? 'white' : 'gray', cursor: 'pointer', fontWeight: 'bold' }}>DIRECTORY</button>
        </div>

        {/* SCANNER TAB */}
        {activeTab === 'scanner' && (
           <div style={{ textAlign: 'center' }}>
              <div className="premium-card" style={{ marginBottom: '2rem', textAlign: 'left', background: 'rgba(242,153,0,0.05)' }}>
                 <p style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 'bold' }}>ACTIVE BASIS:</p>
                 <h3 style={{ margin: 0 }}>{currentEvent.name} <span style={{ opacity: 0.5, fontWeight: 'normal' }}>@ {currentEvent.location}</span></h3>
              </div>
              {!scanning && <button onClick={startScanner} className="btn-primary" style={{ padding: '2rem 4rem', fontSize: '1.5rem', borderRadius: '20px' }}><Scan size={30} /> START SCANNER</button>}
              {scanning && <div id="reader" style={{ maxWidth: '450px', margin: '0 auto', border: '2px solid var(--primary)', borderRadius: '20px', overflow: 'hidden' }}></div>}
           </div>
        )}

        {/* SCHEDULE TAB */}
        {activeTab === 'schedule' && (
           <div className="premium-card">
              <h2 style={{ marginBottom: '2rem' }}>Church Calendar</h2>
              <div style={{ overflowX: 'auto' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ textAlign: 'left', opacity: 0.5, borderBottom: '1px solid rgba(255,255,255,0.05)' }}><th>DATE</th><th>EVENT</th><th>ACTION</th></tr></thead>
                    <tbody>
                       {events.map(e => (
                          <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                             <td style={{ padding: '1rem 0' }}>{e.date}</td>
                             <td>{e.name}</td>
                             <td><button onClick={() => deleteEvent(e.id)} className="btn-ghost" style={{ color: '#ff4d4d' }}><Trash2 size={16} /></button></td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

        {/* DIRECTORY TAB */}
        {activeTab === 'members' && (
           <div className="premium-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                 <div style={{ position: 'relative', width: '300px' }}><Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} size={18} /><input autoFocus placeholder="Search members..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '15px' }} /></div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ textAlign: 'left', opacity: 0.5, borderBottom: '1px solid rgba(255,255,255,0.05)' }}><th>NAME</th><th>ROLE / LEVEL</th><th>ACTION</th></tr></thead>
                    <tbody>
                       {filteredMembers.map(m => (
                          <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                             <td style={{ padding: '1rem 0' }}><b>{m.name}</b></td>
                             <td>
                                <select 
                                   value={m.role || 'member'} 
                                   onChange={(e) => handleUpdateRole(m.id, e.target.value)}
                                   style={{ background: 'rgba(242,153,0,0.1)', border: '1px solid rgba(242,153,0,0.2)', color: 'white', padding: '0.3rem', borderRadius: '5px', fontSize: '0.8rem' }}
                                   disabled={user.email !== 'admin@dhlc.com'}
                                >
                                   <option value="member">Member</option>
                                   <option value="leader">Leader</option>
                                   <option value="minister">Minister</option>
                                   <option value="admin">Admin Hub</option>
                                </select>
                             </td>
                             <td><button onClick={() => {setSelectedMember(m); setShowMemberID(true);}} className="btn-ghost" style={{ fontSize: '0.8rem' }}><Scan size={14} /> VIEW QR</button></td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
