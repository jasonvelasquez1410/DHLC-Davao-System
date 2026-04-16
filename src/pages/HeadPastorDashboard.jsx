import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, limit, where } from 'firebase/firestore';
import { useAuth } from '../App';
import { 
  Activity, Users, Star, DollarSign, CheckCircle2, 
  TrendingUp, Calendar, AlertCircle, FileText, ChevronRight,
  Award, BookOpen, Phone, MapPin, UserPlus
} from 'lucide-react';

const HeadPastorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Real State for Live Data
  const [activityFeed, setActivityFeed] = useState([]);
  const [tithingData, setTithingData] = useState([]);
  const [ministers, setMinisters] = useState([]);
  const [miaMembers, setMiaMembers] = useState([]);
  const [stats, setStats] = useState({ members: 0, ministers: 0, attendance: 0 });
  const [loading, setLoading] = useState(true);

  // Determine permissions
  const isAccountant = user?.role === 'accountant';
  const isHeadPastor = user?.role === 'head_pastor' || user?.role === 'admin';

  useEffect(() => {
    // 1. Fetch Activity Feed (Live)
    const qActivity = query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(5));
    const unsubActivity = onSnapshot(qActivity, (snapshot) => {
      setActivityFeed(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 2. Fetch Ministers & Divinity Progress
    const qMinisters = query(collection(db, 'users'), where('role', 'in', ['leader', 'minister', 'head_pastor']));
    const unsubMinisters = onSnapshot(qMinisters, (snapshot) => {
      const ministerList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMinisters(ministerList);
      setStats(prev => ({ ...prev, ministers: ministerList.length }));
    });

    // 3. Fetch Tithing (Restricted to Pastor Gladys/Accountant/Admin)
    const qTithing = query(collection(db, 'tithing'), orderBy('date', 'desc'));
    const unsubTithing = onSnapshot(qTithing, (snapshot) => {
      setTithingData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 4. MIA Retention Logic (Live Calculation)
    // For now, we fetch from a 'mia_alerts' collection or calculate from attendance
    const qAttendance = query(collection(db, 'attendance_logs'), orderBy('timestamp', 'desc'));
    const unsubAttendance = onSnapshot(qAttendance, (snapshot) => {
      // Simple logic: If we had a full calculation engine, we'd compare dates here.
      // For the UI, we'll sync with a 'retention' collection.
      const logs = snapshot.docs.map(doc => doc.data());
      setStats(prev => ({ ...prev, attendance: logs.length, members: 284 })); // Placeholder for member count
    });

    return () => {
      unsubActivity();
      unsubMinisters();
      unsubTithing();
      unsubAttendance();
    };
  }, []);

  // Personalized Greeting Logic
  let displayName = user?.name?.split(' ')[0] || "Pastor";
  let title = isAccountant ? 'ACCOUNTANT / PASTOR' : 'HEAD PASTOR';

  if (user?.email === 'dhlc.minister@gmail.com') {
    displayName = "Pastor Glenn";
    title = "SENIOR HEAD PASTOR";
  } else if (user?.email === 'gmcebana.auditor@gmail.com') {
    displayName = "Pastor Gladys";
    title = "EXECUTIVE PASTOR / AUDITOR";
  }

  const totalTithes = tithingData.reduce((sum, record) => sum + (record.amount || 0), 0);

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Member Name,Date,Status,Amount\n";
    tithingData.forEach(record => {
      const status = record.tithed ? "Faithful" : "Pending";
      const amount = isAccountant && record.tithed ? record.amount : (record.tithed ? "Hidden" : "0");
      csvContent += `${record.name},${record.date},${status},${amount}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute("download", `DHLC_Tithing_Report_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
      <div className="animate-fade-in">
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="font-serif" style={{ fontSize: '3rem' }}>
              Command <span className="text-gradient">Center</span>
            </h1>
            <p style={{ color: 'var(--text-dim)' }}>
              {isAccountant ? "Financial Overview & Member Tracking" : "Church operations, global attendance, leadership, and ministry health."}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--glass)', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
             <img src={`https://ui-avatars.com/api/?name=${displayName}`} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
             <div>
               <p style={{ fontWeight: 'bold', lineHeight: '1' }}>{displayName}</p>
               <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                 {title}
               </p>
             </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', overflowX: 'auto' }}>
          <button 
            onClick={() => setActiveTab('overview')} 
            className="nav-link" 
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-dim)', position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: activeTab === 'overview' ? '700' : '400', whiteSpace: 'nowrap' }}
          >
            <Activity size={20} /> Ministry Health
            {activeTab === 'overview' && <div style={{ position: 'absolute', bottom: '-17px', left: 0, width: '100%', height: '3px', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary-glow)' }}></div>}
          </button>
          
          <button 
            onClick={() => setActiveTab('finances')} 
            className="nav-link" 
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: activeTab === 'finances' ? 'var(--primary)' : 'var(--text-dim)', position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: activeTab === 'finances' ? '700' : '400', whiteSpace: 'nowrap' }}
          >
            <DollarSign size={20} /> Tithing & Finances
            {activeTab === 'finances' && <div style={{ position: 'absolute', bottom: '-17px', left: 0, width: '100%', height: '3px', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary-glow)' }}></div>}
          </button>

          {!isAccountant && (
            <>
              <button 
                onClick={() => setActiveTab('leadership')} 
                className="nav-link" 
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: activeTab === 'leadership' ? 'var(--primary)' : 'var(--text-dim)', position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: activeTab === 'leadership' ? '700' : '400', whiteSpace: 'nowrap' }}
              >
                <Award size={20} /> Leadership Directory
                {activeTab === 'leadership' && <div style={{ position: 'absolute', bottom: '-17px', left: 0, width: '100%', height: '3px', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary-glow)' }}></div>}
              </button>
              
              <button 
                onClick={() => setActiveTab('retention')} 
                className="nav-link" 
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: activeTab === 'retention' ? 'var(--primary)' : 'var(--text-dim)', position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: activeTab === 'retention' ? '700' : '400', whiteSpace: 'nowrap' }}
              >
                <Users size={20} /> MIA Retention
                {activeTab === 'retention' && <div style={{ position: 'absolute', bottom: '-17px', left: 0, width: '100%', height: '3px', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary-glow)' }}></div>}
              </button>
            </>
          )}
        </div>

        {/* Content Area */}
        <div style={{ minHeight: '500px' }}>
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
               
               {/* Left Column: Vital Signs & Charts */}
               <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', gridColumn: 'span 2' }}>
                 
                 {/* Vital Signs Grid */}
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                   <div className="premium-card" style={{ padding: '1.5rem' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                       <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Total Members</p>
                       <Users size={18} color="var(--primary)" />
                     </div>
                     <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{stats.members}</h2>
                     <p style={{ color: '#4caf50', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                       <TrendingUp size={14} /> Global Growth Active
                     </p>
                   </div>
                   
                   <div className="premium-card" style={{ padding: '1.5rem' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                       <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Active Ministers</p>
                       <Star size={18} color="var(--primary)" />
                     </div>
                     <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{stats.ministers}</h2>
                     <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                       4 currently in training
                     </p>
                   </div>

                   <div className="premium-card" style={{ padding: '1.5rem' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                       <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Service Attendance</p>
                       <Calendar size={18} color="var(--primary)" />
                     </div>
                     <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{stats.attendance}</h2>
                     <p style={{ color: '#4caf50', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                       <TrendingUp size={14} /> Live Sync Active
                     </p>
                   </div>
                 </div>

                 {/* Ministry Health Section */}
                 <div className="premium-card">
                   <h3 style={{ marginBottom: '1.5rem' }}>Department Health</h3>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                     {[
                       { name: 'Youth Ministry', capacity: 90, color: '#4caf50' },
                       { name: 'Music Ministry', capacity: 60, color: 'var(--primary)' },
                       { name: 'Kids Ministry', capacity: 85, color: '#2196f3' }
                     ].map(dept => (
                       <div key={dept.name}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                           <span>{dept.name}</span>
                           <span style={{ color: dept.color }}>{dept.capacity}% Engaged</span>
                         </div>
                         <div style={{ height: '6px', background: 'var(--glass)', borderRadius: '3px', overflow: 'hidden' }}>
                           <div style={{ width: `${dept.capacity}%`, height: '100%', background: dept.color, boxShadow: `0 0 10px ${dept.color}80`, transition: 'width 1s ease-in-out' }}></div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>

               </div>

               {/* Right Column: Activity Feed & Alerts */}
               <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                 
                 {/* Live Activity Feed */}
                 <div className="premium-card">
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                     <Activity size={20} color="var(--primary)" />
                     <h3 style={{ margin: 0 }}>Live Activity</h3>
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                     {activityFeed.map(feed => (
                       <div key={feed.id} style={{ display: 'flex', gap: '1rem', borderLeft: '2px solid var(--primary)', paddingLeft: '1rem' }}>
                         <div>
                           <p style={{ fontSize: '0.9rem', marginBottom: '0.3rem', lineHeight: '1.4' }}>{feed.text}</p>
                           <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                             {feed.timestamp?.toDate ? feed.timestamp.toDate().toLocaleTimeString() : 'Just now'}
                           </span>
                         </div>
                       </div>
                     ))}
                     {activityFeed.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Waiting for global activity...</p>}
                   </div>
                   <button className="btn-ghost" style={{ width: '100%', marginTop: '1.5rem', padding: '0.5rem', fontSize: '0.9rem' }}>
                     View Full Log
                   </button>
                 </div>
               </div>
            </div>
          )}

          {/* TAB: FINANCES / TITHING */}
          {activeTab === 'finances' && (
            <div className="animate-fade-in premium-card">
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ marginBottom: '0.5rem' }}>Tithes & Offering Tracker</h2>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                    {isAccountant 
                      ? "Complete financial overview. Only you can see total amounts." 
                      : "Participation overview. You are viewing checkmarks only."}
                  </p>
                </div>
                
                {isAccountant && (
                  <div style={{ textAlign: 'right', background: 'rgba(76, 175, 80, 0.1)', padding: '1rem', borderRadius: '15px', border: '1px solid rgba(76, 175, 80, 0.3)' }}>
                    <p style={{ fontSize: '0.8rem', color: '#4caf50', fontWeight: 'bold', marginBottom: '0.3rem' }}>TOTAL TITHES (WEEKLY)</p>
                    <h2 style={{ color: '#4caf50', margin: 0 }}>₱{totalTithes.toLocaleString()}</h2>
                  </div>
                )}
              </div>

              <div style={{ overflowX: 'auto', marginTop: '2rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                      <th style={{ padding: '1rem', color: 'var(--text-dim)', fontWeight: 'normal' }}>Member Name</th>
                      <th style={{ padding: '1rem', color: 'var(--text-dim)', fontWeight: 'normal' }}>Date</th>
                      <th style={{ padding: '1rem', color: 'var(--text-dim)', fontWeight: 'normal', textAlign: 'center' }}>Status</th>
                      {isAccountant && (
                        <th style={{ padding: '1rem', color: 'var(--text-dim)', fontWeight: 'normal', textAlign: 'right' }}>Amount</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {tithingData.map((record) => (
                      <tr key={record.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', ':hover': { background: 'rgba(255,255,255,0.02)' } }}>
                        <td style={{ padding: '1rem', fontWeight: '600' }}>{record.name}</td>
                        <td style={{ padding: '1rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>{record.date}</td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          {record.tithed ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                              <CheckCircle2 size={16} /> Faithful
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Pending</span>
                          )}
                        </td>
                        {isAccountant && (
                          <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: record.tithed ? 'white' : 'var(--text-dim)' }}>
                            {record.tithed ? `₱${record.amount.toLocaleString()}` : '-'}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleExportCSV} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={18} /> Export Report
                </button>
              </div>

            </div>
          )}

          {/* TAB: LEADERSHIP DIRECTORY & DIVINITY TRACKER */}
          {activeTab === 'leadership' && !isAccountant && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ marginBottom: '0.5rem' }}>Leadership & Divinity Directory</h2>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Manage minister profiles, cell groups, and theological training progress.</p>
                </div>
                <button className="btn-primary" style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <UserPlus size={16} /> Add Leader
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {ministers.map(minister => (
                  <div key={minister.id} className="premium-card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                    {/* Minister Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ width: '50px', height: '50px', background: 'var(--glass)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        {minister.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.3rem 0' }}>{minister.name}</h3>
                        <p style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>{minister.role}</p>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          <Users size={12} /> {minister.cellGroup}
                        </span>
                      </div>
                    </div>
                    
                    {/* Contact Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={14} /> {minister.phone}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={14} /> {minister.family}</div>
                    </div>

                    {/* Divinity Class Tracker */}
                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                          <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                            <BookOpen size={14} color="var(--primary)" /> Divinity Class
                          </span>
                          <span style={{ fontSize: '0.85rem', color: minister.divinityProgress === 100 ? '#4caf50' : 'var(--text-dim)' }}>
                            {minister.divinityProgress}% Complete
                          </span>
                       </div>
                       <div style={{ height: '8px', background: 'var(--glass)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
                          <div style={{ 
                            width: `${minister.divinityProgress}%`, 
                            height: '100%', 
                            background: minister.divinityProgress === 100 ? '#4caf50' : 'var(--primary)', 
                            boxShadow: `0 0 10px ${minister.divinityProgress === 100 ? '#4caf50' : 'var(--primary-glow)'}`,
                            transition: 'width 1s ease-in-out' 
                          }}></div>
                       </div>
                       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {minister.finishedSubjects.map(subject => (
                            <span key={subject} style={{ background: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', border: '1px solid rgba(76, 175, 80, 0.2)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem' }}>
                              ✓ {subject}
                            </span>
                          ))}
                       </div>
                    </div>

                    {minister.divinityProgress === 100 && (
                      <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'rgba(76, 175, 80, 0.1)', border: '1px solid #4caf50', color: '#4caf50', padding: '1rem 1.5rem', transform: 'rotate(45deg)', fontSize: '0.7rem', fontWeight: 'bold', boxShadow: '0 0 15px rgba(76, 175, 80, 0.2)' }}>
                        CERTIFIED
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: MIA RETENTION SYSTEM */}
          {activeTab === 'retention' && !isAccountant && (
             <div className="animate-fade-in premium-card" style={{ border: '1px solid rgba(244, 67, 54, 0.3)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', color: '#f44336' }}>
               <AlertCircle size={24} />
               <h2 style={{ margin: 0, color: 'inherit' }}>"MIA" Retention System</h2>
             </div>
             <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '2rem', maxWidth: '600px' }}>
               Automated alerts for members who have missed 3 or more consecutive services. Delegate follow-up tasks to ministers to ensure strict member retention and care.
             </p>

             <div style={{ overflowX: 'auto' }}>
               <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                 <thead>
                   <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                     <th style={{ padding: '1rem', color: 'var(--text-dim)', fontWeight: 'normal' }}>Member Name</th>
                     <th style={{ padding: '1rem', color: 'var(--text-dim)', fontWeight: 'normal' }}>Last Seen</th>
                     <th style={{ padding: '1rem', color: 'var(--text-dim)', fontWeight: 'normal', textAlign: 'center' }}>Missed Services</th>
                     <th style={{ padding: '1rem', color: 'var(--text-dim)', fontWeight: 'normal' }}>Assigned Follow-up</th>
                     <th style={{ padding: '1rem', color: 'var(--text-dim)', fontWeight: 'normal', textAlign: 'right' }}>Action</th>
                   </tr>
                 </thead>
                 <tbody>
                   {miaMembers.map(member => (
                     <tr key={member.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                       <td style={{ padding: '1rem', fontWeight: 'bold' }}>{member.name}</td>
                       <td style={{ padding: '1rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>{member.lastSeen}</td>
                       <td style={{ padding: '1rem', textAlign: 'center' }}>
                         <span style={{ background: 'rgba(244, 67, 54, 0.1)', color: '#f44336', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid rgba(244, 67, 54, 0.3)' }}>
                           {member.consecutiveMisses} Weeks
                         </span>
                       </td>
                       <td style={{ padding: '1rem' }}>
                         {member.assignedTo ? (
                           <span style={{ fontSize: '0.85rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                             <CheckCircle2 size={14} /> Assigned to {member.assignedTo}
                           </span>
                         ) : (
                           <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Pending Assignment</span>
                         )}
                       </td>
                       <td style={{ padding: '1rem', textAlign: 'right' }}>
                         <button className="btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                           {member.assignedTo ? "Reassign" : "Assign Leader"}
                         </button>
                       </td>
                     </tr>
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

export default HeadPastorDashboard;
