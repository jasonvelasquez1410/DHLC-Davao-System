import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, getDocs, limit, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../App';
import { 
  Send, Hash, Users, MessageSquare, Video, 
  Phone, Paperclip, Smile, Plus, Info, Bell, BellOff,
  UserCircle, Settings, Music, Wrench, File, Star,
  Shield, Camera, Heart, Briefcase, Coffee, Baby, Download, X, Search
} from 'lucide-react';

const ShieldCheckIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

const baseChannels = [
  { id: 'general', name: 'General', icon: Hash, roles: ['admin', 'leader', 'member'] },
  { id: 'levitical-ministers', name: 'Levitical Ministers', icon: ShieldCheckIcon, roles: ['admin', 'leader'] },
  { id: 'music-dept', name: 'Music Department', icon: Music, roles: ['admin', 'leader'] },
  { id: 'multimedia-dept', name: 'Multimedia Dept', icon: Camera, roles: ['admin', 'leader'] },
  { id: 'kids-dept', name: 'Kids Ministry', icon: Baby, roles: ['admin', 'leader'] },
  { id: 'logistics-dept', name: 'Logistics & Engineering', icon: Wrench, roles: ['admin', 'leader'] },
  { id: 'security-dept', name: 'Security & Custodial', icon: Shield, roles: ['admin', 'leader'] },
  { id: 'finance-hr', name: 'Finance & HR', icon: Briefcase, roles: ['admin', 'leader'] }
];

const Discuss = () => {
  const { user } = useAuth();
  const [channels, setChannels] = useState(baseChannels);
  const [activeTab, setActiveTab] = useState({ type: 'channel', id: 'general' });
  const [activeConversation, setActiveConversation] = useState(baseChannels[0]);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [recentDMs, setRecentDMs] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  const scrollRef = useRef();

  useEffect(() => {
    const fetchUsers = async () => {
      const q = query(collection(db, 'users'));
      const snap = await getDocs(q);
      const usersList = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() })).filter(u => u.uid !== user.uid);
      setAllUsers(usersList);
      setRecentDMs(usersList.slice(0, 5));
    };
    fetchUsers();
  }, [user.uid]);

  useEffect(() => {
    let q;
    if (activeTab.type === 'dm') {
      const dmId = [user.uid, activeTab.id].sort().join('_');
      q = query(collection(db, 'messages'), where('dmId', '==', dmId), orderBy('createdAt', 'asc'));
    } else {
      q = query(collection(db, 'messages'), where('channelId', '==', activeTab.id), orderBy('createdAt', 'asc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsubscribe();
  }, [activeTab, user.uid]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg = {
      text: newMessage,
      senderId: user.uid,
      senderName: user.name,
      senderPhoto: user.photoURL || null,
      createdAt: serverTimestamp()
    };
    if (activeTab.type === 'dm') msg.dmId = [user.uid, activeTab.id].sort().join('_');
    else msg.channelId = activeTab.id;

    await addDoc(collection(db, 'messages'), msg);
    setNewMessage('');
  };

  const startMeeting = () => {
    const roomId = activeTab.type === 'dm' ? `DHLC-Private-${[user.uid, activeTab.id].sort().join('-')}` : `DHLC-Davao-${activeTab.id}`;
    window.open(`https://meet.jit.si/${roomId}`, '_blank');
  };

  const selectChat = (type, id, data) => {
    setActiveTab({ type, id });
    setActiveConversation(data);
    setShowUserSearch(false);
    if (type === 'dm' && !recentDMs.find(u => u.uid === id)) {
      setRecentDMs([data, ...recentDMs]);
    }
  };

  const [showEmojis, setShowEmojis] = useState(false);
  const emojis = ['🙌', '❤️', '🔥', '😂', '🙏', '✨', '👍', '😊', '⛪', '🎸', '📢', '✅'];

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojis(false);
  };

  return (
    <div className="discuss-container" style={{ background: '#001226', height: '100vh', display: 'flex', overflow: 'hidden', paddingTop: '80px' }}>
      
      {/* ODOO SIDEBAR */}
      <aside className="odoo-sidebar" style={{ width: '300px', borderRight: '1px solid rgba(255,255,255,0.05)', background: '#000d1a', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
           <h2 className="font-serif" style={{ fontSize: '1.5rem' }}>Discuss</h2>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '1rem' }}>
           <div style={{ marginBottom: '2rem' }}>
              <button className="sidebar-link active"><Info size={18} /> Inbox</button>
              <button className="sidebar-link"><Star fill="none" size={18} /> Starred</button>
           </div>
           <div style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', textTransform: 'uppercase', padding: '0 0.5rem' }}>Departments</p>
              {channels.map(c => (
                <button key={c.id} onClick={() => selectChat('channel', c.id, c)} className={`sidebar-item ${activeTab.type === 'channel' && activeTab.id === c.id ? 'active' : ''}`}>
                   <Hash size={16} /> {c.name}
                </button>
              ))}
           </div>
           <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem', marginBottom: '0.8rem' }}>
                 <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', textTransform: 'uppercase' }}>Direct Messages</p>
                 <Plus size={16} className="pointer" style={{ color: 'var(--primary)' }} onClick={() => setShowUserSearch(true)} />
              </div>
              {recentDMs.map(u => (
                <button key={u.uid} onClick={() => selectChat('dm', u.uid, u)} className={`sidebar-item ${activeTab.type === 'dm' && activeTab.id === u.uid ? 'active' : ''}`}>
                   <img src={u.photoURL || `https://ui-avatars.com/api/?name=${u.name}`} style={{ width: '24px', borderRadius: '50%' }} alt="" />
                   {u.name}
                </button>
              ))}
           </div>
        </div>
      </aside>

      {/* SEARCH OVERLAY */}
      {showUserSearch && (
        <div style={{ position: 'fixed', top: '120px', left: '320px', width: '400px', background: '#002244', zIndex: 6000, borderRadius: '15px', border: '1px solid var(--primary)', padding: '1.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>
             <Search size={20} color="var(--primary)" />
             <input autoFocus placeholder="Find member..." value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.1rem', outline: 'none', width: '100%' }} />
             <X size={20} className="pointer" onClick={() => setShowUserSearch(false)} />
           </div>
           <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {allUsers.filter(u => u.name.toLowerCase().includes(userSearchTerm.toLowerCase())).map(u => (
                <div key={u.uid} onClick={() => selectChat('dm', u.uid, u)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', borderRadius: '10px', cursor: 'pointer' }} className="search-result-item">
                   <img src={u.photoURL || `https://ui-avatars.com/api/?name=${u.name}`} style={{ width: '32px', borderRadius: '50%' }} alt="" />
                   <p style={{ margin:0 }}>{u.name}</p>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* MAIN CHAT AREA */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#001a33' }}>
         <header style={{ padding: '1.2rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#001226', minHeight: '80px' }}>
            <h2 style={{ margin: 0 }}>{activeConversation?.name}</h2>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
               <button onClick={startMeeting} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.2rem', borderRadius: '30px' }}>
                 <Video size={20} /> <b>START VIDEO CALL</b>
               </button>
               <button onClick={() => setIsMuted(!isMuted)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                 {isMuted ? <BellOff size={22} color="var(--text-dim)" /> : <Bell size={22} color="var(--primary)" />}
               </button>
               <button onClick={() => setShowSettings(!showSettings)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><Settings size={22} /></button>
            </div>
         </header>

         <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem' }}>
            {messages.map((m) => (
              <div key={m.id} style={{ display: 'flex', gap: '1.2rem', marginBottom: '2rem', alignSelf: m.senderId === user.uid ? 'flex-end' : 'flex-start' }}>
                 <img src={m.senderPhoto || `https://ui-avatars.com/api/?name=${m.senderName}`} style={{ width: '40px', height: '40px', borderRadius: '12px' }} alt="" />
                 <div style={{ background: m.senderId === user.uid ? 'rgba(242, 153, 0, 0.1)' : 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '15px' }}>
                    <p style={{ margin: '0 0 0.4rem 0', fontWeight: 'bold', fontSize: '0.8rem' }}>{m.senderName}</p>
                    <p style={{ margin: 0 }}>{m.text}</p>
                 </div>
              </div>
            ))}
            <div ref={scrollRef} />
         </div>

         {/* SETTINGS MODAL (RESTORED) */}
         {showSettings && (
           <div style={{ position: 'fixed', top: '120px', right: '30px', width: '320px', background: '#002d5a', borderRadius: '20px', border: '2px solid var(--primary)', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.8)', zIndex: 7000 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Chat Settings</h3>
                <X size={20} className="pointer" onClick={() => setShowSettings(false)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Desktop Notifications</span><input type="checkbox" checked={!isMuted} readOnly /></div>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Show Online Status</span><input type="checkbox" checked readOnly /></div>
                 <button className="btn-ghost" onClick={() => setShowSettings(false)} style={{ width: '100%', marginTop: '1rem' }}>Close</button>
              </div>
           </div>
         )}

         {/* EMOJI SELECTOR */}
         {showEmojis && (
           <div style={{ position: 'absolute', bottom: '100px', left: '2rem', background: '#002244', border: '1px solid var(--primary)', borderRadius: '15px', padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', zIndex: 6500, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              {emojis.map(e => (
                <button key={e} onClick={() => addEmoji(e)} style={{ background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', padding: '0.5rem' }}>{e}</button>
              ))}
           </div>
         )}

         <form onSubmit={handleSendMessage} style={{ padding: '1.5rem 2.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
            <button type="button" onClick={() => setShowEmojis(!showEmojis)} className="btn-ghost" style={{ padding: '0.8rem', borderRadius: '50%' }}><Smile size={24} /></button>
            <input 
              placeholder="Type your message..." 
              value={newMessage} 
              onChange={(e) => setNewMessage(e.target.value)} 
              style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.2rem', borderRadius: '15px', color: 'white' }}
            />
            <button type="submit" className="btn-primary" style={{ width: '55px', height: '55px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F29900', border: 'none', cursor: 'pointer' }}>
               <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
         </form>
      </main>

      <style jsx>{`
        .sidebar-link { width: 100%; display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; border: none; background: transparent; color: rgba(255,255,255,0.6); cursor: pointer; border-radius: 8px; font-weight: 500; }
        .sidebar-link.active { background: rgba(242, 153, 0, 0.1); color: var(--primary); }
        .sidebar-item { width: 100%; display: flex; align-items: center; gap: 12px; padding: 0.6rem 0.8rem; border: none; background: transparent; color: rgba(255,255,255,0.5); cursor: pointer; border-radius: 8px; font-size: 0.85rem; }
        .sidebar-item.active { background: rgba(242, 153, 0, 0.15); color: white; font-weight: bold; }
        .search-result-item:hover { background: rgba(242, 153, 0, 0.2); }
        .pointer { cursor: pointer; }
      `}</style>
    </div>
  );
};

export default Discuss;
