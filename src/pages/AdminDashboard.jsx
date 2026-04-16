import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../App';
import { 
  Users, Scan, BarChart3, Search, PlusCircle, Check, X, 
  UserCheck, Shield, ChevronRight, Filter, Download, Printer, UserCircle
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QRCodeCanvas } from 'qrcode.react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('scanner');
  const [members, setMembers] = useState([]);
  const [reports, setReports] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Member ID Modal State
  const [showAddMember, setShowAddMember] = useState(false);
  const [showMemberID, setShowMemberID] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  
  const [newMemberData, setNewMemberData] = useState({ name: '', email: '', role: 'member', family: '' });
  const [addingMember, setAddingMember] = useState(false);

  // Dash Labels
  let dashboardTitle = "Admin Hub";
  let dashboardSubtitle = "Manage members, track growth, and oversee church operations.";
  
  if (user?.email === 'dhlc.minister@gmail.com') {
    dashboardTitle = "Head Pastor Command Center";
    dashboardSubtitle = "Welcome back, Pastor Glenn. Oversee your flock and ministry health.";
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        setMembers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const attendanceSnap = await getDocs(collection(db, 'attendance'));
        const attendanceData = attendanceSnap.docs.map(doc => doc.data());
        
        const groupsSnap = await getDocs(collection(db, 'groups'));
        const groupsData = groupsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const reportData = groupsData.map(group => {
          const groupMembers = usersSnap.docs.filter(u => u.data().groupId === group.id);
          const totalLogins = attendanceData.filter(a => a.userId && groupMembers.some(m => m.id === a.userId)).length;
          return {
            groupId: group.id,
            groupName: group.name,
            memberCount: groupMembers.length,
            totalAttendances: totalLogins
          };
        });
        setReports(reportData);
      } catch (err) {
        console.error("Error fetching admin data:", err);
      }
    };
    fetchData();
  }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddingMember(true);
    try {
      const docRef = await addDoc(collection(db, 'users'), {
        ...newMemberData,
        createdAt: serverTimestamp(),
        status: 'active'
      });
      // Show ID immediately after add
      const newlyAdded = { id: docRef.id, ...newMemberData };
      setSelectedMember(newlyAdded);
      setShowAddMember(false);
      setShowMemberID(true);
      setNewMemberData({ name: '', email: '', role: 'member', family: '' });
      // Refresh list
      const usersSnap = await getDocs(collection(db, 'users'));
      setMembers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
      alert("Error adding member.");
    } finally {
      setAddingMember(false);
    }
  };

  const [currentEvent, setCurrentEvent] = useState({ name: 'Sunday Main Service', location: 'Davao Sanctuary' });
  const [editingEvent, setEditingEvent] = useState(false);

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

  const startScanner = () => {
    setScanning(true);
    setScanResult(null);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", { fps: 15, qrbox: { width: 280, height: 280 } }, false);
      scanner.render((decodedText) => {
        scanner.clear();
        handleScanSuccess(decodedText);
      }, () => {});
    }, 200);
  };

  const openID = (m) => {
    setSelectedMember(m);
    setShowMemberID(true);
  };

  const filteredMembers = members.filter(m => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
      <div className="animate-fade-in">
        
        {/* NEW MEMBER MODAL */}
        {showAddMember && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <div className="premium-card animate-scale-in" style={{ maxWidth: '500px', width: '100%', border: '1px solid var(--primary)', position: 'relative' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h2 className="font-serif">Enroll <span className="text-gradient">Member</span></h2>
                  <button onClick={() => setShowAddMember(false)} className="btn-ghost"><X size={20} /></button>
               </div>
               <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <input type="text" value={newMemberData.name} onChange={(e) => setNewMemberData({...newMemberData, name: e.target.value})} placeholder="Full Name" style={{ width: '100%', padding: '0.8rem', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '10px' }} required />
                  <input type="email" value={newMemberData.email} onChange={(e) => setNewMemberData({...newMemberData, email: e.target.value})} placeholder="Email Address" style={{ width: '100%', padding: '0.8rem', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '10px' }} required />
                  <select value={newMemberData.role} onChange={(e) => setNewMemberData({...newMemberData, role: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '10px' }}>
                    <option value="member">Member</option>
                    <option value="leader">Leader</option>
                    <option value="minister">Minister</option>
                    <option value="admin">Admin</option>
                  </select>
                  <input type="text" value={newMemberData.family} onChange={(e) => setNewMemberData({...newMemberData, family: e.target.value})} placeholder="Family/Household" style={{ width: '100%', padding: '0.8rem', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '10px' }} />
                  <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={addingMember}>
                    {addingMember ? 'Saving...' : 'Register & Generate ID'}
                  </button>
               </form>
            </div>
          </div>
        )}

        {/* DIGITAL ID MODAL / QR CODE GENERATOR */}
        {showMemberID && selectedMember && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(15px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <div className="premium-card animate-scale-in" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '3rem 2rem', border: '2px solid var(--primary)', borderRadius: '30px', position: 'relative' }}>
               <button onClick={() => setShowMemberID(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
               
               <div style={{ marginBottom: '2rem' }}>
                  <div style={{ width: '100px', height: '100px', background: 'var(--primary)', borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid rgba(255,255,255,0.1)' }}>
                     <UserCheck size={50} color="black" />
                  </div>
                  <h2 className="font-serif" style={{ marginBottom: '0.5rem' }}>{selectedMember.name}</h2>
                  <p style={{ color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>{selectedMember.role}</p>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Member since {new Date().getFullYear()}</p>
               </div>

               <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', display: 'inline-block', marginBottom: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                  <QRCodeCanvas value={selectedMember.id} size={200} level="H" />
               </div>

               <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '2rem' }}>Member ID: {selectedMember.id}</p>

               <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => window.print()} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Printer size={18} /> PRINT ID
                  </button>
                  <button onClick={() => setShowMemberID(false)} className="btn-ghost" style={{ flex: 1 }}>CLOSE</button>
               </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap' }}>
          <div>
            <h1 className="font-serif" style={{ fontSize: '3rem' }}>{dashboardTitle}</h1>
            <p style={{ color: 'var(--text-dim)' }}>{dashboardSubtitle}</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <button onClick={() => setShowAddMember(true)} className="btn-primary"><PlusCircle size={18} /> Enroll Member</button>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
           <button onClick={() => setActiveTab('scanner')} style={{ padding: '1rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'scanner' ? '2px solid var(--primary)' : 'none', color: activeTab === 'scanner' ? 'white' : 'gray', cursor: 'pointer', fontWeight: 'bold' }}>SCANNER</button>
           <button onClick={() => setActiveTab('members')} style={{ padding: '1rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'members' ? '2px solid var(--primary)' : 'none', color: activeTab === 'members' ? 'white' : 'gray', cursor: 'pointer', fontWeight: 'bold' }}>DIRECTORY</button>
        </div>

        {activeTab === 'scanner' && (
           <div>
              <div className="premium-card" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(242, 153, 0, 0.05)', border: '1px dashed var(--primary)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                       <p style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 'bold', margin: '0 0 0.2rem 0' }}>CURRENT CHECK-IN EVENT</p>
                       <h3 style={{ margin: 0 }}>{currentEvent.name} <span style={{ opacity: 0.5, fontSize: '0.8rem', fontWeight: 'normal' }}>@ {currentEvent.location}</span></h3>
                    </div>
                    <button onClick={() => setEditingEvent(!editingEvent)} className="btn-ghost" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>{editingEvent ? 'Close' : 'Change Event'}</button>
                 </div>
                 
                 {editingEvent && (
                    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                       <div style={{ display: 'flex', gap: '1rem' }}>
                          <input type="text" value={currentEvent.name} onChange={(e) => setCurrentEvent({...currentEvent, name: e.target.value})} placeholder="Event Name (e.g. Divinity Night)" style={{ flex: 2, padding: '0.8rem', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '10px' }} />
                          <input type="text" value={currentEvent.location} onChange={(e) => setCurrentEvent({...currentEvent, location: e.target.value})} placeholder="Location" style={{ flex: 1, padding: '0.8rem', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '10px' }} />
                       </div>
                       <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <p style={{ fontSize: '0.8rem', width: '100%', marginBottom: '0.2rem', opacity: 0.5 }}>Quick Presets:</p>
                          <button onClick={() => setCurrentEvent({name: 'Sunday Main Service', location: 'Davao Sanctuary'})} className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>Sunday Service</button>
                          <button onClick={() => setCurrentEvent({name: 'Midweek Prayer', location: 'Davao Sanctuary'})} className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>Midweek Prayer</button>
                          <button onClick={() => setCurrentEvent({name: 'Divinity Night', location: 'Training Hall'})} className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>Divinity Night</button>
                          <button onClick={() => setCurrentEvent({name: 'Special Event', location: 'Davao Sanctuary'})} className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>Special Event</button>
                       </div>
                    </div>
                 )}
              </div>

              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                 {!scanning && (
                    <div style={{ opacity: scanResult ? 1 : 0.8, transition: '0.5s' }}>
                       {scanResult && (
                          <div style={{ marginBottom: '2rem', padding: '2rem', background: scanResult.success ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)', border: '1px solid ' + (scanResult.success ? '#2ecc71' : '#e74c3c'), borderRadius: '20px' }}>
                             {scanResult.success ? (
                                <div>
                                   <Check size={40} color="#2ecc71" style={{ marginBottom: '1rem' }} />
                                   <h2 style={{ margin: 0 }}>Confirmed Check-in</h2>
                                   <p style={{ fontSize: '1.2rem', margin: '0.5rem 0' }}><b>{scanResult.user.name}</b></p>
                                   <p style={{ opacity: 0.6 }}>Recorded for {currentEvent.name}</p>
                                </div>
                             ) : (
                                <div><X size={40} color="#e74c3c" /><p>{scanResult.message}</p></div>
                             )}
                          </div>
                       )}
                       <button onClick={startScanner} className="btn-primary" style={{ padding: '2rem 4rem', fontSize: '1.5rem', borderRadius: '20px', boxShadow: '0 20px 50px rgba(242, 153, 0, 0.3)' }}><Scan size={30} /> START SCANNER</button>
                       <p style={{ marginTop: '1.5rem', color: 'var(--text-dim)' }}>Ready to record attendance for: <b>{currentEvent.name}</b></p>
                    </div>
                 )}
                 {scanning && (
                    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                       <div id="reader" style={{ border: '2px solid var(--primary)', borderRadius: '20px', overflow: 'hidden' }}></div>
                       <button onClick={() => setScanning(false)} className="btn-ghost" style={{ marginTop: '2rem' }}>Cancel Scanning</button>
                    </div>
                 )}
              </div>
           </div>
        )}

        {activeTab === 'members' && (
           <div className="premium-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                 <div style={{ position: 'relative', width: '300px' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} size={18} />
                    <input autoFocus placeholder="Search members..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '15px', color: 'white' }} />
                 </div>
              </div>
              <table>
                 <thead><tr style={{ textAlign: 'left', opacity: 0.5 }}><th>NAME</th><th>ROLE</th><th>HOUSEHOLD</th><th>ACTION</th></tr></thead>
                 <tbody>
                    {filteredMembers.map(m => (
                       <tr key={m.id}>
                          <td style={{ padding: '1rem 0' }}><b>{m.name}</b></td>
                          <td><span style={{ fontSize: '0.7rem', background: 'rgba(242, 153, 0, 0.1)', color: 'var(--primary)', padding: '0.3rem 0.6rem', borderRadius: '5px' }}>{m.role?.toUpperCase()}</span></td>
                          <td>{m.family}</td>
                          <td><button onClick={() => openID(m)} className="btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}><Scan size={14} /> VIEW QR ID</button></td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
