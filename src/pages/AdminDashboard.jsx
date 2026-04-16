import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../App';
import { 
  Users, Scan, BarChart3, Search, PlusCircle, Check, X, 
  UserCheck, Shield, ChevronRight, Filter, Download 
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('scanner');
  const [members, setMembers] = useState([]);
  const [reports, setReports] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New Member Modal State
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberData, setNewMemberData] = useState({ name: '', email: '', role: 'member', family: '' });
  const [addingMember, setAddingMember] = useState(false);

  // Personalized Greeting Logic
  let dashboardTitle = "Admin Hub";
  let dashboardSubtitle = "Manage members, track growth, and oversee church operations.";
  let displayName = user?.name?.split(' ')[0] || "Admin";

  if (user?.email === 'dhlc.minister@gmail.com') {
    dashboardTitle = "Head Pastor Command Center";
    dashboardSubtitle = "Welcome back, Pastor Glenn. Oversee your flock and ministry health.";
    displayName = "Pastor Glenn";
  } else if (user?.email === 'gmcebana.auditor@gmail.com') {
    dashboardTitle = "Executive Pastor Dashboard";
    dashboardSubtitle = "Welcome back, Pastor Gladys. Oversee church operations and audits.";
    displayName = "Pastor Gladys";
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
      await addDoc(collection(db, 'users'), {
        ...newMemberData,
        createdAt: serverTimestamp(),
        status: 'active'
      });
      setShowAddMember(false);
      setNewMemberData({ name: '', email: '', role: 'member', family: '' });
      // Refresh list
      const usersSnap = await getDocs(collection(db, 'users'));
      setMembers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      alert("New member successfully enrolled!");
    } catch (err) {
      console.error(err);
      alert("Error adding member.");
    } finally {
      setAddingMember(false);
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
        service: 'Sunday Main Service',
        location: 'Davao City Sanctuary'
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

  const filteredMembers = members.filter(m => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
      <div className="animate-fade-in">
        
        {/* New Member Enrollment Modal */}
        {showAddMember && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <div className="premium-card animate-scale-in" style={{ maxWidth: '500px', width: '100%', border: '1px solid var(--primary)', position: 'relative' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h2 className="font-serif">Enroll <span className="text-gradient">Member</span></h2>
                  <button onClick={() => setShowAddMember(false)} className="btn-ghost" style={{ padding: '0.4rem' }}><X size={20} /></button>
               </div>
               
               <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.4rem', display: 'block' }}>Full Name</label>
                    <input type="text" value={newMemberData.name} onChange={(e) => setNewMemberData({...newMemberData, name: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '10px' }} required placeholder="John Doe" />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.4rem', display: 'block' }}>Email Address</label>
                    <input type="email" value={newMemberData.email} onChange={(e) => setNewMemberData({...newMemberData, email: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '10px' }} required placeholder="john@example.com" />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.4rem', display: 'block' }}>Role</label>
                    <select value={newMemberData.role} onChange={(e) => setNewMemberData({...newMemberData, role: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '10px' }}>
                      <option value="member">Member</option>
                      <option value="leader">Leader</option>
                      <option value="minister">Minister</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.4rem', display: 'block' }}>Family Household</label>
                    <input type="text" value={newMemberData.family} onChange={(e) => setNewMemberData({...newMemberData, family: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '10px' }} placeholder="e.g. Ebana Family" />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={addingMember}>
                      {addingMember ? 'Saving...' : 'Register Member'}
                    </button>
                    <button type="button" onClick={() => setShowAddMember(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
                  </div>
               </form>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="font-serif" style={{ fontSize: '3rem' }}>
              {dashboardTitle.split(' ').map((word, i, arr) => 
                i === arr.length - 1 ? <span key={i} className="text-gradient">{word}</span> : `${word} `
              )}
            </h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>{dashboardSubtitle}</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
             <button className="btn-ghost" style={{ padding: '0.6rem 1.2rem' }}><Download size={18} /> Export Data</button>
             <button onClick={() => setShowAddMember(true)} className="btn-primary" style={{ padding: '0.6rem 1.2rem' }} id="new-member-btn">
               <PlusCircle size={18} /> New Member
             </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
          <button onClick={() => setActiveTab('scanner')} className={`nav-link ${activeTab === 'scanner' ? 'active' : ''}`} style={{ border: 'none', background: 'none', cursor: 'pointer', color: activeTab === 'scanner' ? 'var(--primary)' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 'bold' }}>
            <Scan size={20} /> Attendance Scanner
          </button>
          <button onClick={() => setActiveTab('members')} className={`nav-link ${activeTab === 'members' ? 'active' : ''}`} style={{ border: 'none', background: 'none', cursor: 'pointer', color: activeTab === 'members' ? 'var(--primary)' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 'bold' }}>
            <Users size={20} /> Directory
          </button>
          <button onClick={() => setActiveTab('reports')} className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`} style={{ border: 'none', background: 'none', cursor: 'pointer', color: activeTab === 'reports' ? 'var(--primary)' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 'bold' }}>
            <BarChart3 size={20} /> Analytics
          </button>
        </div>

        {/* Content Area */}
        <div style={{ minHeight: '500px' }}>
          {activeTab === 'scanner' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
               <div className="premium-card" style={{ textAlign: 'center' }}>
                  <div style={{ marginBottom: '2rem' }}>
                    <Scan size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                    <h2>Attendance Check-in</h2>
                    <p style={{ color: 'var(--text-dim)' }}>Scan member QR codes to record attendance.</p>
                  </div>
                  {!scanning && !scanResult && <button onClick={startScanner} className="btn-primary">START SCANNER</button>}
                  {scanning && <div id="reader" style={{ maxWidth: '400px', margin: '0 auto' }}></div>}
                  {scanResult && <div style={{ padding: '1rem', background: 'var(--glass)', borderRadius: '15px' }}>{scanResult.success ? 'Success!' : scanResult.message}</div>}
               </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="premium-card">
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                 <h2>Directory</h2>
                 <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '0.6rem 1rem', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'white' }} />
               </div>
               <div style={{ overflowX: 'auto' }}>
                 <table>
                   <thead><tr style={{ textAlign: 'left' }}><th>Name</th><th>Role</th><th>Household</th><th>Actions</th></tr></thead>
                   <tbody>
                     {filteredMembers.map(m => (
                       <tr key={m.id}><td>{m.name}</td><td>{m.role}</td><td>{m.family}</td><td><button className="btn-ghost">Edit</button></td></tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
