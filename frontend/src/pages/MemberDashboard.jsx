import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

const MemberDashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const q = query(
        collection(db, 'attendance'), 
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(5)
      );
      const snap = await getDocs(q);
      setHistory(snap.docs.map(doc => doc.data()));
    };
    if (user?.uid) fetchHistory();
  }, [user?.uid]);

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '40px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Left: Profile Info */}
        <div className="premium-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black' }}>
              <User size={40} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.8rem' }}>{user.name}</h2>
              <p style={{ color: 'var(--primary)', fontWeight: '600' }}>Member</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-dim)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <Mail size={18} /> {user.email}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <Award size={18} /> Group: {user.groupId || 'Assigned soon'}
            </div>
          </div>
        </div>

        {/* Right: QR Code for Attendance */}
        <div className="premium-card" style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Your Attendance QR</h3>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '15px', display: 'inline-block', boxShadow: '0 0 20px var(--primary-glow)' }}>
            <QRCodeSVG 
              value={user.qrId} 
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          <p style={{ marginTop: '1.5rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
            Present this code to the usher when you arrive at church for automatic attendance check-in.
          </p>
        </div>

      </div>

      {/* Attendance History (Mock) */}
      <div className="premium-card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Recent Attendance</h3>
        <div style={{ borderTop: '1px solid var(--glass-border)' }}>
          {[1, 2, 3].map((_, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.2rem 0', borderBottom: '1px solid var(--glass-border)' }}>
              <div>
                <p style={{ fontWeight: '600' }}>Sunday Morning Service</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Main Sanctuary</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#4caf50', fontWeight: 'bold' }}>CHECKED IN</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Apr {10 - i}, 2026</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
