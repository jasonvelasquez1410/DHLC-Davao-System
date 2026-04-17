import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, limit, where, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { useAuth } from '../App';
import { 
  Activity, Users, Star, DollarSign, CheckCircle2, 
  TrendingUp, Calendar, AlertCircle, FileText, ChevronRight,
  Award, BookOpen, Phone, MapPin, UserPlus, Search, Filter, Plus, X, Download, PieChart
} from 'lucide-react';

const HeadPastorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data State
  const [activityFeed, setActivityFeed] = useState([]);
  const [tithingData, setTithingData] = useState([]);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({ members: 0, ministers: 0, attendance: 0 });
  
  // Finance Filters
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterRole, setFilterRole] = useState('all');
  const [financeSearch, setFinanceSearch] = useState('');
  
  // Accountant Tools
  const [showAddTithe, setShowAddTithe] = useState(false);
  const [newTithe, setNewTithe] = useState({ memberId: '', name: '', amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), fundType: 'General Tithe' });

  const isAccountant = user?.role === 'accountant' || user?.email === 'gmcebana.auditor@gmail.com' || user?.email === 'jasonvelasquez1410@gmail.com' || user?.role === 'admin';

  // Constants
  const MONTHLY_GOAL = 50000; // Example goal, can be customized
  const FUND_TYPES = ['General Tithe', 'Mission Fund', 'Building Fund', 'Love Offering', 'Other'];

  useEffect(() => {
    // 1. Fetch Users (Filter out the Architect/Admin for clean ministry data)
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const userList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.email !== 'jasonvelasquez1410@gmail.com' && u.email !== 'admin@dhlc.com');
      
      setMembers(userList);
      setStats(prev => ({ ...prev, members: userList.length, ministers: userList.filter(u => ['leader', 'minister'].includes(u.role)).length }));
    });

    // 2. Fetch Tithing Records
    const qTithing = query(collection(db, 'tithes'), orderBy('timestamp', 'desc'));
    const unsubTithing = onSnapshot(qTithing, (snapshot) => {
      setTithingData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 3. Activity Feed (Attendance)
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
      setNewTithe({ memberId: '', name: '', amount: '', month: new Date().getMonth() + 1, year: 2026, fundType: 'General Tithe' });
      alert("Successful! Financial record added to the ledger.");
    } catch (err) { alert("Error recording record."); }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Name', 'Role', 'Category', 'Amount (PHP)'];
    const rows = filteredFinance.map(r => [
      `${r.month}/${r.year}`,
      r.name,
      r.role,
      r.fundType,
      r.amount
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DHLC_Finance_Report_${filterMonth}_${filterYear}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const filteredFinance = tithingData.filter(record => {
    const matchMonth = record.month === parseInt(filterMonth);
    const matchYear = record.year === parseInt(filterYear);
    const matchRole = filterRole === 'all' || record.role === filterRole;
    const matchSearch = !financeSearch || record.name.toLowerCase().includes(financeSearch.toLowerCase());
    return matchMonth && matchYear && matchRole && matchSearch;
  });

  const totalTithes = filteredFinance.reduce((sum, r) => sum + (r.amount || 0), 0);
  const goalProgress = (totalTithes / MONTHLY_GOAL) * 100;

  // Calculate Breakdown
  const breakdown = FUND_TYPES.reduce((acc, type) => {
    acc[type] = filteredFinance.filter(r => r.fundType === type).reduce((sum, r) => sum + (r.amount || 0), 0);
    return acc;
  }, {});

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
      <div className="animate-fade-in">
        
        {/* MODAL: RECORD FINANCE */}
        {showAddTithe && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="premium-card" style={{ maxWidth: '450px', width: '100%', border: '1px solid var(--primary)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                 <h2 className="font-serif">New Ledger Entry</h2>
                 <button onClick={() => setShowAddTithe(false)} className="btn-ghost"><X size={20}/></button>
               </div>
               
               <form onSubmit={handleRecordTithe} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '5px', display: 'block' }}>MEMBER / LEADER</label>
                    <select value={newTithe.memberId} onChange={(e) => setNewTithe({...newTithe, memberId: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: '#001a33', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '10px' }} required>
                      <option value="">Select giver...</option>
                      {members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '5px', display: 'block' }}>FUND CATEGORY</label>
                      <select value={newTithe.fundType} onChange={(e) => setNewTithe({...newTithe, fundType: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: '#001a33', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '10px' }}>
                        {FUND_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '5px', display: 'block' }}>AMOUNT (₱)</label>
                      <input type="number" placeholder="0.00" value={newTithe.amount} onChange={(e) => setNewTithe({...newTithe, amount: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: '#001a33', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '10px' }} required />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                     <select value={newTithe.month} onChange={(e) => setNewTithe({...newTithe, month: e.target.value})} style={{ padding: '0.8rem', background: '#001a33', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                        {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('en', {month: 'long'})}</option>)}
                     </select>
                     <input type="number" placeholder="Year" value={newTithe.year} onChange={(e) => setNewTithe({...newTithe, year: e.target.value})} style={{ padding: '0.8rem', background: '#001a33', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '10px' }} />
                  </div>
                  
                  <button type="submit" className="btn-primary" style={{ padding: '1.2rem', marginTop: '1rem' }}>
                    <CheckCircle2 size={18} /> Record & Sync to Ledger
                  </button>
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
          <div style={{ display: 'flex', gap: '1rem' }}>
             <div style={{ background: 'var(--glass)', padding: '0.5rem 1rem', borderRadius: '30px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={18} className="text-primary" /> <span style={{ fontWeight: 'bold' }}>{new Date(0, filterMonth - 1).toLocaleString('en', {month: 'long'})} {filterYear}</span>
             </div>
             {isAccountant && (
               <button onClick={exportToCSV} className="btn-ghost" style={{ borderRadius: '30px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <Download size={18} /> Export Report
               </button>
             )}
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
           <div className="premium-card" style={{ textAlign: 'center' }}>
              <Users className="text-primary" style={{ margin: '0 auto 15px' }} />
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.members}</div>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', letterSpacing: '1px' }}>CHURCH CENSUS</p>
           </div>
           
           <div className="premium-card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                   <DollarSign className="text-primary" style={{ marginBottom: '10px' }} />
                   <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', margin: 0 }}>MINISTRY GOAL PROGRESS</p>
                   <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>₱{totalTithes.toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>{Math.round(goalProgress)}%</div>
                   <p style={{ fontSize: '0.65rem', opacity: 0.5 }}>OF GOAL</p>
                </div>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                 <div style={{ width: `${Math.min(goalProgress, 100)}%`, height: '100%', background: 'linear-gradient(to right, #f29900, #FFD700)', boxShadow: '0 0 10px var(--primary-glow)' }}></div>
              </div>
           </div>

           <div className="premium-card">
              <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginBottom: '1rem' }}>FUND DISTRIBUTION</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 {Object.entries(breakdown).filter(([_, val]) => val > 0).map(([key, val]) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                       <span style={{ opacity: 0.6 }}>{key}</span>
                       <span style={{ fontWeight: 'bold' }}>₱{val.toLocaleString()}</span>
                    </div>
                 ))}
                 {Object.values(breakdown).every(v => v === 0) && <p style={{ opacity: 0.3, fontSize: '0.8rem' }}>No categorized funds yet.</p>}
              </div>
           </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
           <button onClick={() => setActiveTab('overview')} style={{ padding: '1rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'overview' ? '2px solid var(--primary)' : 'none', color: activeTab === 'overview' ? 'white' : 'gray', cursor: 'pointer', fontWeight: 'bold' }}>ACTIVITY MONITOR</button>
           <button onClick={() => setActiveTab('finances')} style={{ padding: '1rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'finances' ? '2px solid var(--primary)' : 'none', color: activeTab === 'finances' ? 'white' : 'gray', cursor: 'pointer', fontWeight: 'bold' }}>FAITHFULNESS LEDGER</button>
        </div>

        {/* FEED TAB */}
        {activeTab === 'overview' && (
           <div className="animate-fade-in premium-card">
              <h3 className="font-serif" style={{ marginBottom: '1.5rem' }}>Live Ministry Feed</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {activityFeed.map(feed => (
                   <div key={feed.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                     <div>
                       <CheckCircle2 size={16} style={{ color: '#2ecc71', marginRight: '10px' }} />
                       <span><b>{feed.userName}</b> presence verified at <b>{feed.service}</b></span>
                     </div>
                     <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{feed.timestamp?.toDate().toLocaleTimeString()}</span>
                   </div>
                 ))}
                 {activityFeed.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.3 }}>Monitoring church activity...</div>}
              </div>
           </div>
        )}

        {/* LEDGER TAB */}
        {activeTab === 'finances' && (
           <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                 <div>
                    <h2 className="font-serif">Accounting Ledger</h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                       {isAccountant ? "Access Level: FULL RECORDING (Accountant)" : "Access Level: VERIFICATION GRID (Head Pastor)"}
                    </p>
                 </div>
                 {isAccountant && (
                    <button onClick={() => setShowAddTithe(true)} className="btn-primary" style={{ padding: '0.8rem 2rem' }}><Plus size={18} /> Record New Entry</button>
                 )}
              </div>

              {/* Filters */}
              <div className="premium-card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Filter size={16} className="text-primary" /> <span style={{ fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px' }}>FILTERS:</span>
                 </div>
                 <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} style={{ padding: '0.6rem 1rem', background: '#001a33', color: 'white', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                    {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('en', {month: 'long'})}</option>)}
                 </select>
                 <input type="number" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} style={{ width: '90px', padding: '0.6rem 1rem', background: '#001a33', color: 'white', borderRadius: '10px', border: '1px solid var(--glass-border)' }} />
                 <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} style={{ padding: '0.6rem 1rem', background: '#001a33', color: 'white', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                    <option value="all">All Roles</option>
                    <option value="leader">Leaders</option>
                    <option value="member">Members</option>
                 </select>
                 <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} size={16} />
                    <input placeholder="Search faithful name..." value={financeSearch} onChange={(e) => setFinanceSearch(e.target.value)} style={{ width: '100%', padding: '0.6rem 1.5rem 0.6rem 35px', background: '#001a33', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '10px' }} />
                 </div>
              </div>

              <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                       <tr style={{ textAlign: 'left', opacity: 0.5, fontSize: '0.75rem', letterSpacing: '1px' }}>
                          <th style={{ padding: '1.5rem' }}>NAME</th>
                          <th>CATEGORY</th>
                          <th>FUND TYPE</th>
                          <th style={{ textAlign: 'center' }}>FAITHFUL STATUS</th>
                          {isAccountant && <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>AMOUNT (₱)</th>}
                       </tr>
                    </thead>
                    <tbody>
                       {filteredFinance.map(record => (
                         <tr key={record.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', background: record.recordedBy === 'auto' ? 'rgba(242,153,0,0.02)' : 'transparent' }}>
                            <td style={{ padding: '1.2rem 1.5rem' }}><b>{record.name}</b></td>
                            <td><span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>{record.role}</span></td>
                            <td><span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 'bold' }}>{record.fundType?.toUpperCase()}</span></td>
                            <td style={{ textAlign: 'center' }}>
                               <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#2ecc71', fontWeight: 'bold', fontSize: '1rem' }}>
                                  <CheckCircle2 size={18} /> Verified
                               </div>
                            </td>
                            {isAccountant && (
                               <td style={{ textAlign: 'right', paddingRight: '1.5rem', fontWeight: '900', fontSize: '1.1rem', color: '#4caf50' }}>
                                  ₱{record.amount.toLocaleString()}
                                </td>
                            )}
                         </tr>
                       ))}
                       {filteredFinance.length === 0 && (
                          <tr><td colSpan={isAccountant ? 5 : 4} style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                            <AlertCircle size={40} style={{ margin: '0 auto 15px', opacity: 0.2 }} />
                            No church records found for this period.
                          </td></tr>
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
