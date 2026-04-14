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
  const [activeTab, setActiveTab] = useState('scanner');
  const [members, setMembers] = useState([]);
  const [reports, setReports] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleScanSuccess = async (qrData) => {
    // Prevent multiple scans
    if (scanning === false) return; 
    
    setScanning(false);
    try {
      // Data scanned is the UID from MemberDashboard
      const userRef = doc(db, 'users', qrData);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        setScanResult({ success: false, message: 'Member ID not recognized' });
        return;
      }

      const user = { id: userSnap.id, ...userSnap.data() };
      
      // Save attendance
      await addDoc(collection(db, 'attendance'), {
        userId: user.id,
        userName: user.name,
        timestamp: serverTimestamp(),
        service: 'Sunday Main Service',
        location: 'Davao City Sanctuary'
      });

      setScanResult({ success: true, user });
      
      // Auto-clear success after 5 seconds to allow next scan
      setTimeout(() => setScanResult(null), 5000);
      
    } catch (err) {
      console.error(err);
      setScanResult({ success: false, message: 'Process error. Try again.' });
    }
  };

  const startScanner = () => {
    setScanning(true);
    setScanResult(null);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", { 
        fps: 15, 
        qrbox: { width: 280, height: 280 },
        aspectRatio: 1.0
      }, false);
      
      scanner.render((decodedText) => {
        scanner.clear();
        handleScanSuccess(decodedText);
      }, (err) => {
        // Handle error if needed
      });
    }, 200);
  };

  const filteredMembers = members.filter(m => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
      <div className="animate-fade-in">
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 className="font-serif" style={{ fontSize: '3rem' }}>Admin <span className="text-gradient">Hub</span></h1>
            <p style={{ color: 'var(--text-dim)' }}>Manage members, track growth, and oversee church operations.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <button className="btn-ghost" style={{ padding: '0.6rem 1.2rem' }}><Download size={18} /> Export Data</button>
             <button className="btn-primary" style={{ padding: '0.6rem 1.2rem' }}><PlusCircle size={18} /> New Member</button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
          <button 
            onClick={() => setActiveTab('scanner')} 
            className="nav-link" 
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: activeTab === 'scanner' ? 'var(--primary)' : 'var(--text-dim)', position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: activeTab === 'scanner' ? '700' : '400' }}
          >
            <Scan size={20} /> Attendance Scanner
            {activeTab === 'scanner' && <div style={{ position: 'absolute', bottom: '-17px', left: 0, width: '100%', height: '3px', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary-glow)' }}></div>}
          </button>
          <button 
            onClick={() => setActiveTab('members')} 
            className="nav-link" 
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: activeTab === 'members' ? 'var(--primary)' : 'var(--text-dim)', position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: activeTab === 'members' ? '700' : '400' }}
          >
            <Users size={20} /> Directory
            {activeTab === 'members' && <div style={{ position: 'absolute', bottom: '-17px', left: 0, width: '100%', height: '3px', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary-glow)' }}></div>}
          </button>
          <button 
            onClick={() => setActiveTab('reports')} 
            className="nav-link" 
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: activeTab === 'reports' ? 'var(--primary)' : 'var(--text-dim)', position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: activeTab === 'reports' ? '700' : '400' }}
          >
            <BarChart3 size={20} /> Analytics
            {activeTab === 'reports' && <div style={{ position: 'absolute', bottom: '-17px', left: 0, width: '100%', height: '3px', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary-glow)' }}></div>}
          </button>
        </div>

        {/* Content Area */}
        <div style={{ minHeight: '500px' }}>
          
          {activeTab === 'scanner' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
               <div className="premium-card" style={{ textAlign: 'center' }}>
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', padding: '1.2rem', background: 'rgba(242, 153, 0, 0.1)', borderRadius: '50%', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                      <Scan size={40} />
                    </div>
                    <h2>Entrance Check-in</h2>
                    <p style={{ color: 'var(--text-dim)', maxWidth: '400px', margin: '1rem auto' }}>
                      Activate your device camera to scan member QR codes. Attendance will be recorded instantly.
                    </p>
                  </div>

                  {!scanning && !scanResult && (
                    <button onClick={startScanner} className="btn-primary" style={{ padding: '1.5rem 3rem', fontSize: '1.2rem', borderRadius: '15px' }}>
                      <Scan size={24} /> START CAMERA
                    </button>
                  )}

                  {scanning && (
                    <div style={{ position: 'relative', width: '100%', maxWidth: '450px', margin: '0 auto' }}>
                      <div id="reader" style={{ borderRadius: '20px', overflow: 'hidden', border: '2px solid var(--primary)', background: 'black' }}></div>
                      <button onClick={() => setScanning(false)} className="btn-ghost" style={{ marginTop: '1.5rem', width: '100%' }}>Cancel Scan</button>
                    </div>
                  )}

                  {scanResult && (
                    <div style={{ 
                      padding: '2rem', 
                      borderRadius: '20px', 
                      background: scanResult.success ? 'rgba(76, 175, 80, 0.05)' : 'rgba(244, 67, 54, 0.05)', 
                      border: `1px solid ${scanResult.success ? '#4caf50' : '#f44336'}`,
                      animation: 'fadeIn 0.3s ease'
                    }}>
                      {scanResult.success ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                          <div className="checkmark-circle">
                            <Check size={50} />
                          </div>
                          <h2 style={{ color: '#4caf50' }}>Attendance Confirmed</h2>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                             <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                               <UserCheck size={30} />
                             </div>
                             <div style={{ textAlign: 'left' }}>
                               <p style={{ fontWeight: 'bold', fontSize: '1.4rem' }}>{scanResult.user.name}</p>
                               <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Email: {scanResult.user.email}</p>
                             </div>
                          </div>
                          <button onClick={() => { setScanResult(null); startScanner(); }} className="btn-primary" style={{ marginTop: '2rem' }}>Next Member</button>
                        </div>
                      ) : (
                        <div>
                          <X color="#f44336" size={40} style={{ marginBottom: '1rem' }} />
                          <h3 style={{ color: '#f44336' }}>Scan Failed</h3>
                          <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}>{scanResult.message}</p>
                          <button onClick={() => { setScanResult(null); startScanner(); }} className="btn-primary">Try Again</button>
                        </div>
                      )}
                    </div>
                  )}
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div className="premium-card">
                    <h3>Recent Check-ins</h3>
                    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {members.slice(0, 5).map(m => (
                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--glass)', borderRadius: '12px' }}>
                           <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <Check size={20} />
                           </div>
                           <div style={{ flex: 1 }}>
                             <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>{m.name}</p>
                             <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Arrived at 9:15 AM</p>
                           </div>
                           <ChevronRight size={16} color="var(--text-dim)" />
                        </div>
                      ))}
                    </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="premium-card">
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
                 <h2>Member Directory</h2>
                 <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                      <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} size={18} />
                      <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '0.8rem 1rem 0.8rem 3rem', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', width: '300px', outline: 'none' }} 
                      />
                    </div>
                    <button className="btn-ghost" style={{ padding: '0.8rem' }}><Filter size={18} /></button>
                 </div>
               </div>
               
               <div style={{ overflowX: 'auto' }}>
                 <table>
                   <thead>
                     <tr style={{ textAlign: 'left' }}>
                       <th>Name & Identity</th>
                       <th>Role</th>
                       <th>Cell Group</th>
                       <th>Status</th>
                       <th>Actions</th>
                     </tr>
                   </thead>
                   <tbody>
                     {filteredMembers.map(m => (
                       <tr key={m.id}>
                         <td>
                           <div>
                             <p style={{ fontWeight: '700' }}>{m.name}</p>
                             <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{m.email}</p>
                           </div>
                         </td>
                         <td>
                           <span style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', background: m.role === 'admin' ? 'rgba(242, 153, 0, 0.1)' : 'rgba(255,255,255,0.05)', color: m.role === 'admin' ? 'var(--primary)' : 'white', fontSize: '0.85rem', fontWeight: 'bold' }}>
                             {m.role?.toUpperCase()}
                           </span>
                         </td>
                         <td style={{ color: 'var(--text-dim)' }}>{m.groupId || 'Not Assigned'}</td>
                         <td><Check color="#4caf50" size={18} /></td>
                         <td>
                           <button className="btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Edit</button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="premium-card">
              <div style={{ marginBottom: '3rem' }}>
                 <h2>Ministry Analytics</h2>
                 <p style={{ color: 'var(--text-dim)' }}>Overview of attendance performance across all church cell groups.</p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                {reports.map(report => (
                  <div key={report.groupId} style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>GROUP NAME</p>
                          <h3 style={{ fontSize: '1.4rem' }}>{report.groupName}</h3>
                        </div>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(242, 153, 0, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <BarChart3 size={24} />
                        </div>
                     </div>
                     <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                           <span style={{ color: 'var(--text-dim)' }}>Attendance Rating</span>
                           <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>85%</span>
                        </div>
                        <div style={{ height: '8px', background: 'var(--glass)', borderRadius: '4px', overflow: 'hidden' }}>
                           <div style={{ width: '85%', height: '100%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary-glow)' }}></div>
                        </div>
                     </div>
                     <div style={{ display: 'flex', gap: '2rem' }}>
                        <div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>MEMBERS</p>
                          <p style={{ fontWeight: 'bold' }}>{report.memberCount}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>TOTAL LOGS</p>
                          <p style={{ fontWeight: 'bold' }}>{report.totalAttendances}</p>
                        </div>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
