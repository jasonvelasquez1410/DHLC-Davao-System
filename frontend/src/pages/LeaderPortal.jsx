import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

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
          const memQ = query(collection(db, 'users'), where('leaderId', '==', user.uid));
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
    fetchGroup();
  }, [user.uid]);

  if (loading) return <div className="hero">Loading Group Data...</div>;

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '40px' }}>
      
      {/* Header Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ color: 'var(--primary)' }}><Users size={32} /></div>
          <div>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Members</p>
            <h3 style={{ fontSize: '1.5rem' }}>{group?.members?.length || 0}</h3>
          </div>
        </div>
        <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ color: '#4caf50' }}><TrendingUp size={32} /></div>
          <div>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Avg. Attendance</p>
            <h3 style={{ fontSize: '1.5rem' }}>84%</h3>
          </div>
        </div>
        <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ color: 'var(--primary)' }}><Award size={32} /></div>
          <div>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Training Status</p>
            <h3 style={{ fontSize: '1.5rem', color: user.trainingCompleted ? '#4caf50' : '#ff9800' }}>
              {user.trainingCompleted ? 'Completed' : 'In Progress'}
            </h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Member List */}
        <div className="premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2>My Group: {group?.name}</h2>
            <button className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
              <UserPlus size={18} /> Add New
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-dim)' }}>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>Joined Date</th>
                <th style={{ padding: '1rem' }}>Last Attended</th>
                <th style={{ padding: '1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {group?.members?.map(member => (
                <tr key={member.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{member.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-dim)' }}>
                    {new Date(member.assignedAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-dim)' }}>2 days ago</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', padding: '0.2rem 0.6rem', borderRadius: '5px', fontSize: '0.8rem' }}>
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Small Progress / Notification Sidebar */}
        <div className="premium-card">
          <h3 style={{ marginBottom: '1.5rem' }}>Leader Tasks</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
              <CheckCircle2 color="#4caf50" size={20} />
              <p style={{ fontSize: '0.9rem' }}>Follow up with Maria Santos</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
              <XCircle color="#ff5252" size={20} />
              <p style={{ fontSize: '0.9rem' }}>Complete Leadership Level 2</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LeaderPortal;
