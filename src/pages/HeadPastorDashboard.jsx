import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, limit, where, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { useAuth } from '../App';
import { 
  Activity, Users, Star, DollarSign, CheckCircle2, 
  TrendingUp, Calendar, AlertCircle, FileText, ChevronRight,
  Award, BookOpen, Phone, MapPin, UserPlus, Search, Filter, Plus, X
} from 'lucide-react';

const HeadPastorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data State
  const [activityFeed, setActivityFeed] = useState([]);
  const [tithingData, setTithingData] = useState([]);
  const [ministers, setMinisters] = useState([]);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({ members: 0, ministers: 0, attendance: 0 });
  
  // Finance Filters
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterRole, setFilterRole] = useState('all');
  const [financeSearch, setFinanceSearch] = useState('');
  
  // Accountant Tools
  const [showAddTithe, setShowAddTithe] = useState(false);
  const [newTithe, setNewTithe] = useState({ memberId: '', name: '', amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });

  const isAccountant = user?.role === 'accountant' || user?.email === 'gmcebana.auditor@gmail.com';
  const isHeadPastor = user?.role === 'admin' || user?.email === 'admin@dhlc.com';

  useEffect(() => {
    // 1. Fetch Users (for the Accountant to select from)
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMembers(userList);
      setMinisters(userList.filter(u => ['leader', 'minister'].includes(u.role)));
      setStats(prev => ({ ...prev, members: userList.length, ministers: userList.filter(u => ['leader', 'minister'].includes(u.role)).length }));
    });

    // 2. Fetch Tithing Records
    const qTithing = query(collection(db, 'tithes'), orderBy('timestamp', 'desc'));
    const unsubTithing = onSnapshot(qTithing, (snapshot) => {
      setTithingData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 3. Activity Feed
    const qActivity = query(collection(db, 'attendance'), orderBy('timestamp', 'desc'), limit(10));
    const unsubActivity = onSnapshot(qActivity, (snapshot) => {
      setActivityFeed(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubUsers();
      unsubTithing();
      unsubActivity();
    };
  }, []);

  const handleRecordTithe = async (e) => {
    e.preventDefault();
    if (!newTithe.memberId || !newTithe.amount) return;
    
    try {
      const selectedMember = members.find(m => m.id === newTithe.memberId);
      await addDoc(collection(db, 'tithes'), {
        ...newTithe,
        name: selectedMember.name,
        role: selectedMember.role,
        amount: parseFloat(newTithe.amount),
        recordedBy: user.email,
        timestamp: serverTimestamp(),
        verified: true
      });
      setShowAddTithe(false);
      setNewTithe({ memberId: '', name: '', amount: '', month: 4, year: 2026 });
    } catch (err) { alert("Error recording tithe."); }
  };

  const filteredFinance = tithingData.filter(record => {
    const matchMonth = record.month === parseInt(filterMonth);
    const matchYear = record.year === parseInt(filterYear);
    const matchRole = filterRole === 'all' || record.role === filterRole;
    const matchSearch = !financeSearch || record.name.toLowerCase().includes(financeSearch.toLowerCase());
    return matchMonth && matchYear && matchRole && matchSearch;
  });

  const totalTithes = filteredFinance.reduce((sum, r) => sum + (r.amount || 0), 0);
  const displayName = isAccountant ? "Pastora Gladys" : "Pastor Glenn";

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
      <div className="animate-fade-in">
        
        {/* MODAL: RECORD TITHE (Accountant Only) */}
        {showAddTithe && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="premium-card" style={{ maxWidth: '450px', width: '100%', border: '1px solid var(--primary)' }}>
               <h2 className="font-serif" style={{ marginBottom: '1.5rem' }}>Record Tithe Verification</h2>
               <form onSubmit={handleRecordTithe} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <select value={newTithe.memberId} onChange={(e) => setNewTithe({...newTithe, memberId: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: '#001a33', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '10px' }}>
                    <option value="">Select Member/Leader</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                  </select>
                  <input type="number" placeholder="Amount (₱)" value={newTithe.amount} onChange={(e) => setNewTithe({...newTithe, amount: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: '#001a33', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '10px' }} required />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                     <select value={newTithe.month} onChange={(e) => setNewTithe({...newTithe, month: e.target.value})} style={{ padding: '0.8rem', background: '#001a33', color: 'white', borderRadius: '10px' }}>
                        {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('en', {month: 'long'})}</option>)}
                     </select>
                     <input type="number" placeholder="Year" value={newTithe.year} onChange={(e) => setNewTithe({...newTithe, year: e.target.value})} style={{ padding: '0.8rem', background: '#001a33', color: 'white', borderRadius: '10px' }} />
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: '1rem' }}>Verify & Record</button>
                  <button type="button" onClick={() => setShowAddTithe(false)} className="btn-ghost">Cancel</button>
               </form>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="font-serif" style={{ fontSize: '3rem' }}>Leadership <span className="text-gradient">Hub</span></h1>
            <p style={{ color: 'var(--text-dim)' }}>DHLC Ministry Oversight & Faithfulness Ledger</p>
          </div>
          <div style={{ background: 'var(--glass)', padding: '0.5rem 1rem', borderRadius: '30px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <Calendar size={18} className="text-primary" /> <span style={{ fontWeight: 'bold' }}>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
           <button onClick={() => setActiveTab('overview')} style={{ padding: '1rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'overview' ? '2px solid var(--primary)' : 'none', color: activeTab === 'overview' ? 'white' : 'gray', cursor: 'pointer', fontWeight: 'bold' }}>MINISTRY OVERVIEW</button>
           <button onClick={() => setActiveTab('finances')} style={{ padding: '1rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'finances' ? '2px solid var(--primary)' : 'none', color: activeTab === 'finances' ? 'white' : 'gray', cursor: 'pointer', fontWeight: 'bold' }}>FINANCIAL VERIFICATION</button>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
           <div className="animate-fade-in">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                 <div className="premium-card" style={{ textAlign: 'center' }}>
                    <Users className="text-primary" style={{ margin: '0 auto 15px' }} />
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.members}</div>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>GLOBAL MEMBERSHIP</p>
                 </div>
                 <div className="premium-card" style={{ textAlign: 'center' }}>
                    <Activity className="text-primary" style={{ margin: '0 auto 15px' }} />
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{activityFeed.length}</div>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>RECENT SCANS</p>
                 </div>
              </div>

              <div className="premium-card">
                 <h3 className="font-serif" style={{ marginBottom: '1.5rem' }}>Recent Ministry Activity</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {activityFeed.map(feed => (
                      <div key={feed.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}>
                        <span><b>{feed.userName}</b> checked into {feed.service}</span>
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{feed.timestamp?.toDate().toLocaleTimeString()}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        )}

        {/* FINANCES TAB */}
        {activeTab === 'finances' && (
           <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                 <div>
                    <h2 className="font-serif">Faithfulness Ledger</h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                       {isAccountant ? "Access Level: FULL LEDGER (Pastora Gladys)" : "Access Level: VERIFICATION ONLY (Pastor Glenn)"}
                    </p>
                 </div>
                 {isAccountant && (
                    <button onClick={() => setShowAddTithe(true)} className="btn-primary" style={{ padding: '0.8rem 1.5rem' }}><Plus size={18} /> Record Tithe</button>
                 )}
              </div>

              {/* Filters */}
              <div className="premium-card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Filter size={16} className="text-primary" /> <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>FILTERS:</span>
                 </div>
                 <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} style={{ padding: '0.5rem', background: '#001a33', color: 'white', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                    {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('en', {month: 'long'})}</option>)}
                 </select>
                 <input type="number" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} style={{ width: '80px', padding: '0.5rem', background: '#001a33', color: 'white', borderRadius: '8px', border: '1px solid var(--glass-border)' }} />
                 <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} style={{ padding: '0.5rem', background: '#001a33', color: 'white', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                    <option value="all">All Levels</option>
                    <option value="leader">Leaders Only</option>
                    <option value="member">Members Only</option>
                 </select>
                 <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} size={16} />
                    <input placeholder="Search faithful name..." value={financeSearch} onChange={(e) => setFinanceSearch(e.target.value)} style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 30px', background: '#001a33', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '8px' }} />
                 </div>
                 {isAccountant && (
                    <div style={{ padding: '0.5rem 1rem', background: 'rgba(76, 175, 80, 0.1)', borderRadius: '10px', color: '#4caf50', fontWeight: 'bold' }}>
                       MONTH TOTAL: ₱{totalTithes.toLocaleString()}
                    </div>
                 )}
              </div>

              <div className="premium-card" style={{ padding: 0 }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                       <tr style={{ textAlign: 'left', opacity: 0.5, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <th style={{ padding: '1.5rem' }}>NAME</th>
                          <th>CATEGORY</th>
                          <th style={{ textAlign: 'center' }}>FAITHFUL STATUS</th>
                          {isAccountant && <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>AMOUNT (₱)</th>}
                       </tr>
                    </thead>
                    <tbody>
                       {filteredFinance.map(record => (
                         <tr key={record.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '1.2rem 1.5rem' }}><b>{record.name}</b></td>
                            <td><span style={{ fontSize: '0.75rem', background: 'rgba(242,153,0,0.1)', color: 'var(--primary)', padding: '3px 10px', borderRadius: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>{record.role}</span></td>
                            <td style={{ textAlign: 'center' }}>
                               <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#2ecc71', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                  <CheckCircle2 size={24} /> Verified
                               </div>
                            </td>
                            {isAccountant && (
                               <td style={{ textAlign: 'right', paddingRight: '1.5rem', fontWeight: 'bold', fontSize: '1.1rem', color: '#4caf50' }}>
                                  ₱{record.amount.toLocaleString()}
                               </td>
                            )}
                         </tr>
                       ))}
                       {filteredFinance.length === 0 && (
                          <tr><td colSpan={isAccountant ? 4 : 3} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>No verified records found for this period.</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default HeadPastorDashboard;
