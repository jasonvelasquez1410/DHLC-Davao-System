import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('members');
  const [members, setMembers] = useState([]);
  const [reports, setReports] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const usersSnap = await getDocs(collection(db, 'users'));
      setMembers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const attendanceSnap = await getDocs(collection(db, 'attendance'));
      const attendanceData = attendanceSnap.docs.map(doc => doc.data());
      
      const groupsSnap = await getDocs(collection(db, 'groups'));
      const groupsData = groupsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const reportData = groupsData.map(group => {
        const groupMembers = usersSnap.docs.filter(u => u.data().groupId === group.id);
        const totalLogins = attendanceData.filter(a => groupMembers.some(m => m.id === a.userId)).length;
        return {
          groupId: group.id,
          groupName: group.name,
          memberCount: groupMembers.length,
          totalAttendances: totalLogins
        };
      });
      setReports(reportData);
    };
    fetchData();
  }, []);

  const handleScanSuccess = async (qrId) => {
    setScanning(false);
    try {
      const q = query(collection(db, 'users'), where('qrId', '==', qrId));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        setScanResult({ success: false, message: 'Member not found' });
        return;
      }

      const user = { id: snap.docs[0].id, ...snap.docs[0].data() };
      await addDoc(collection(db, 'attendance'), {
        userId: user.id,
        timestamp: serverTimestamp(),
        service: 'Sunday Service',
        scannedBy: 'Admin'
      });

      setScanResult({ success: true, user });
    } catch (err) {
      setScanResult({ success: false, message: 'Scan failed' });
    }
  };

  const startScanner = () => {
    setScanning(true);
    setScanResult(null);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
      scanner.render(handleScanSuccess, (err) => {});
    }, 100);
  };

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '40px' }}>
      
      {/* Sidebar / Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '1rem' }}>
        <button onClick={() => setActiveTab('members')} className={`btn-primary ${activeTab !== 'members' ? 'btn-secondary-style' : ''}`} style={activeTab !== 'members' ? secondaryBtnStyle : {}}>
          <Users size={18} /> Member Management
        </button>
        <button onClick={() => setActiveTab('scanner')} className={`btn-primary ${activeTab !== 'scanner' ? 'btn-secondary-style' : ''}`} style={activeTab !== 'scanner' ? secondaryBtnStyle : {}}>
          <Scan size={18} /> Attendance Scanner
        </button>
        <button onClick={() => setActiveTab('reports')} className={`btn-primary ${activeTab !== 'reports' ? 'btn-secondary-style' : ''}`} style={activeTab !== 'reports' ? secondaryBtnStyle : {}}>
          <BarChart3 size={18} /> Attendance Reports
        </button>
      </div>

      {/* Content Area */}
      <div className="animate-fade-in">
        
        {activeTab === 'members' && (
          <div className="premium-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h2>All Members</h2>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <Search style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} size={16} />
                  <input type="text" placeholder="Search members..." style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '10px' }} />
                </div>
                <button className="btn-primary" style={{ padding: '0.5rem 1rem' }}><PlusCircle size={18} /> Add Member</button>
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-dim)', borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '1rem' }}>Name</th>
                  <th style={{ padding: '1rem' }}>Role</th>
                  <th style={{ padding: '1rem' }}>Group</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 'bold' }}>{m.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{m.email}</div>
                    </td>
                    <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{m.role}</td>
                    <td style={{ padding: '1rem' }}>{m.groupId || 'Unassigned'}</td>
                    <td style={{ padding: '1rem' }}><span style={{ color: '#4caf50' }}>● Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'scanner' && (
          <div className="premium-card" style={{ textAlign: 'center' }}>
            <h2>QR Attendance Scanner</h2>
            <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>Scan a member's QR code to record their attendance.</p>
            
            {scanResult && (
              <div style={{ marginBottom: '2rem', padding: '1.5rem', borderRadius: '15px', background: scanResult.success ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)', border: `1px solid ${scanResult.success ? '#4caf50' : '#f44336'}` }}>
                {scanResult.success ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#4caf50', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                      <Check size={32} />
                    </div>
                    <h3 style={{ color: '#4caf50' }}>Check-in Successful!</h3>
                    <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{scanResult.user.name}</p>
                    <p style={{ fontSize: '0.9rem' }}>Role: {scanResult.user.role}</p>
                  </div>
                ) : (
                  <p style={{ color: '#f44336' }}>{scanResult.message}</p>
                )}
                <button onClick={() => setScanResult(null)} className="btn-primary" style={{ marginTop: '1rem', padding: '0.5rem 1.5rem' }}>Close</button>
              </div>
            )}

            {!scanning && !scanResult && (
              <button onClick={startScanner} className="btn-primary" style={{ padding: '2rem 4rem', fontSize: '1.5rem', borderRadius: '20px' }}>
                <Scan size={32} /> START SCANNING
              </button>
            )}

            {scanning && (
              <div id="reader" style={{ width: '100%', maxWidth: '500px', margin: '0 auto', overflow: 'hidden', borderRadius: '20px', border: '2px solid var(--primary)' }}></div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
            <div className="premium-card">
              <h2>Group Attendance Performance</h2>
              <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {reports.map(report => {
                  const percentage = report.memberCount > 0 ? (report.totalAttendances / (report.memberCount * 5)) * 100 : 0; // simplified
                  return (
                    <div key={report.groupId}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 'bold' }}>{report.groupName}</span>
                        <span style={{ color: 'var(--primary)' }}>{Math.round(percentage)}% Attendance</span>
                      </div>
                      <div style={{ height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(percentage, 100)}%`, height: '100%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary-glow)' }}></div>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
                        {report.memberCount} members • {report.totalAttendances} total logins recorded
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

const secondaryBtnStyle = {
  background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-dim)',
  border: '1px solid var(--glass-border)'
};

export default AdminDashboard;
