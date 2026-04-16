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
  const [uploading, setUploading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  const scrollRef = useRef();

  // 1. Fetch Users Roster
  useEffect(() => {
    const fetchUsers = async () => {
      const q = query(collection(db, 'users'));
      const snap = await getDocs(q);
      const usersList = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() })).filter(u => u.uid !== user.uid);
      setAllUsers(usersList);
      
      // Initially, let's say the top 3 are "Recent DMs" for the Odoo look
      setRecentDMs(usersList.slice(0, 5));
    };
    fetchUsers();
  }, [user.uid]);

  // 2. Dynamic Messages Engine (Odoo-style DM vs Channel Logic)
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
    }, (error) => {
      console.warn("Index needed, falling back to memory filter.");
      const fallbackQ = query(collection(db, 'messages'), orderBy('createdAt', 'asc'), limit(100));
      getDocs(fallbackQ).then(snap => {
        const msgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (activeTab.type === 'dm') {
          const dmId = [user.uid, activeTab.id].sort().join('_');
          setMessages(msgs.filter(m => m.dmId === dmId));
        } else {
          setMessages(msgs.filter(m => m.channelId === activeTab.id));
        }
      });
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

    if (activeTab.type === 'dm') {
      msg.dmId = [user.uid, activeTab.id].sort().join('_');
      msg.recipientId = activeTab.id;
    } else {
      msg.channelId = activeTab.id;
    }

    await addDoc(collection(db, 'messages'), msg);
    setNewMessage('');
  };

  const startMeeting = () => {
    const roomId = activeTab.type === 'dm' 
      ? `DHLC-Private-${[user.uid, activeTab.id].sort().join('-')}`
      : `DHLC-Davao-${activeTab.id}`;
    const url = `https://meet.jit.si/${roomId}`;
    
    const callMsg = {
      text: `🚀 INVITED YOU TO A MEETING: ${url}`,
      senderId: user.uid,
      senderName: user.name,
      senderPhoto: user.photoURL || null,
      createdAt: serverTimestamp(),
      isCall: true,
      callUrl: url
    };
    if (activeTab.type === 'dm') callMsg.dmId = [user.uid, activeTab.id].sort().join('_');
    else callMsg.channelId = activeTab.id;

    addDoc(collection(db, 'messages'), callMsg);
    window.open(url, '_blank');
  };

  const selectChat = (type, id, data) => {
    setActiveTab({ type, id });
    setActiveConversation(data);
    setShowUserSearch(false);
    if (type === 'dm' && !recentDMs.find(u => u.uid === id)) {
      setRecentDMs([data, ...recentDMs]);
    }
  };

  return (
    <div className="discuss-container" style={{ background: '#001226', height: '100vh', display: 'flex', overflow: 'hidden' }}>
      
      {/* ODOO SIDEBAR */}
      <aside className="odoo-sidebar" style={{ width: '300px', borderRight: '1px solid rgba(255,255,255,0.05)', background: '#000d1a', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
           <h2 className="font-serif" style={{ fontSize: '1.5rem', margin: 0 }}>Discuss</h2>
        </div>
        
        <div style={{ overflowY: 'auto', flex: 1, padding: '1rem' }}>
           {/* Navigation Items Like Odoo */}
           <div style={{ marginBottom: '2rem' }}>
              <button className="sidebar-link active"><Info size={18} /> Inbox</button>
              <button className="sidebar-link"><Star fill="none" size={18} /> Starred</button>
           </div>

           {/* Channels Section */}
           <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem', marginBottom: '0.8rem' }}>
                 <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', textTransform: 'uppercase' }}>Channels</p>
                 <Plus size={16} className="pointer" style={{ color: 'var(--primary)' }} />
              </div>
              {channels.filter(c => c.roles.includes(user.role)).map(c => (
                <button key={c.id} onClick={() => selectChat('channel', c.id, c)} className={`sidebar-item ${activeTab.type === 'channel' && activeTab.id === c.id ? 'active' : ''}`}>
                   <Hash size={16} /> {c.name}
                </button>
              ))}
           </div>

           {/* Direct Messages Section */}
           <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem', marginBottom: '0.8rem' }}>
                 <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', textTransform: 'uppercase' }}>Direct Messages</p>
                 <Plus size={16} className="pointer" style={{ color: 'var(--primary)' }} onClick={() => setShowUserSearch(true)} />
              </div>
              {recentDMs.map(u => (
                <button key={u.uid} onClick={() => selectChat('dm', u.uid, u)} className={`sidebar-item ${activeTab.type === 'dm' && activeTab.id === u.uid ? 'active' : ''}`}>
                   <div style={{ position: 'relative' }}>
                     <img src={u.photoURL || `https://ui-avatars.com/api/?name=${u.name}`} style={{ width: '24px', borderRadius: '50%' }} alt="" />
                     <div style={{ position: 'absolute', bottom: 0, right: 0, width: '6px', height: '6px', background: '#4caf50', borderRadius: '50%', border: '1px solid #000d1a' }}></div>
                   </div>
                   {u.name}
                </button>
              ))}
           </div>
        </div>
      </aside>

      {/* SEARCH OVERLAY (Odoo Style) */}
      {showUserSearch && (
        <div style={{ position: 'fixed', top: '100px', left: '320px', width: '400px', background: '#002244', zIndex: 100, borderRadius: '15px', border: '1px solid var(--primary)', padding: '1.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: '1rem', mb: '1rem' }}>
             <Search size={20} color="var(--primary)" />
             <input autoFocus placeholder="Search members to chat..." value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.1rem', outline: 'none', width: '100%' }} />
             <X size={20} className="pointer" onClick={() => setShowUserSearch(false)} />
           </div>
           <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {allUsers.filter(u => u.name.toLowerCase().includes(userSearchTerm.toLowerCase())).map(u => (
                <div key={u.uid} onClick={() => selectChat('dm', u.uid, u)} className="search-result-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', borderRadius: '10px', cursor: 'pointer', transition: '0.2s' }}>
                   <img src={u.photoURL || `https://ui-avatars.com/api/?name=${u.name}`} style={{ width: '32px', borderRadius: '50%' }} alt="" />
                   <div>
                     <p style={{ fontWeight: 'bold', margin:0 }}>{u.name}</p>
                     <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', margin:0 }}>{u.role}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* MAIN CHAT AREA */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#001a33' }}>
         <header style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#001226' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <h3 style={{ margin: 0 }}>{activeConversation?.name}</h3>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
               <button onClick={startMeeting} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }} title="Private Video Call"><Video size={20} /></button>
               <button onClick={() => setIsMuted(!isMuted)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                 {isMuted ? <BellOff size={20} color="var(--text-dim)" /> : <Bell size={20} color="var(--primary)" />}
               </button>
               <button onClick={() => setShowSettings(!showSettings)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><Settings size={20} /></button>
            </div>
         </header>

         <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '10rem 0', opacity: 0.2 }}>
                <MessageSquare size={80} style={{ marginBottom: '1.5rem' }} />
                <h3>No messages yet. Say hello!</h3>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignSelf: m.senderId === user.uid ? 'flex-end' : 'flex-start' }}>
                 <img src={m.senderPhoto || `https://ui-avatars.com/api/?name=${m.senderName}`} style={{ width: '36px', height: '36px', borderRadius: '10px' }} alt="" />
                 <div>
                    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'baseline', marginBottom: '0.3rem' }}>
                       <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{m.senderName}</span>
                       <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>{m.createdAt?.toDate ? m.createdAt.toDate().toLocaleTimeString() : '...'}</span>
                    </div>
                    {m.isCall ? (
                      <div className="call-invite" style={{ background: 'rgba(242, 153, 0, 0.1)', border: '1px solid var(--primary)', padding: '1rem', borderRadius: '12px', display: 'inline-block' }}>
                        <p style={{ margin: '0 0 0.8rem 0', fontSize: '0.85rem' }}>Meeting starting now...</p>
                        <a href={m.callUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', textDecoration: 'none' }}>JOIN MEETING</a>
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.95rem', margin: 0, color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>{m.text}</p>
                    )}
                 </div>
              </div>
            ))}
            <div ref={scrollRef} />
         </div>

         {/* SETTINGS MODAL */}
         {showSettings && (
           <div style={{ position: 'fixed', top: '80px', right: '20px', width: '300px', background: '#002d5a', borderRadius: '15px', border: '1px solid var(--glass-border)', padding: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 100 }}>
              <h3 style={{ marginBottom: '1rem' }}>Chat Settings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem' }}>Desktop Notifications</span>
                    <input type="checkbox" checked={!isMuted} readOnly />
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem' }}>Email Digests</span>
                    <input type="checkbox" />
                 </div>
                 <button className="btn-ghost" style={{ marginTop: '1rem', width: '100%', borderColor: '#f44336', color: '#f44336' }}>Close Chat</button>
              </div>
           </div>
         )}

         <form onSubmit={handleSendMessage} style={{ padding: '1.5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1rem' }}>
            <label className="btn-ghost" style={{ padding: '0.8rem' }}><Paperclip size={20} /><input type="file" style={{ display: 'none' }} /></label>
            <input 
              className="chat-input" 
              placeholder={`Message ${activeConversation?.name}...`} 
              value={newMessage} 
              onChange={(e) => setNewMessage(e.target.value)} 
              style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem 1.2rem', borderRadius: '12px', color: 'white', outline: 'none' }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0 1.5rem' }}><Send size={20} /></button>
         </form>
      </main>

      <style jsx>{`
        .sidebar-link {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0.8rem 1rem;
          border: none;
          background: transparent;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          border-radius: 8px;
          transition: 0.2s;
          font-weight: 500;
        }
        .sidebar-link.active {
          background: rgba(242, 153, 0, 0.1);
          color: var(--primary);
        }
        .sidebar-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0.6rem 0.8rem;
          border: none;
          background: transparent;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          border-radius: 8px;
          transition: 0.2s;
          font-size: 0.85rem;
          margin-bottom: 2px;
        }
        .sidebar-item:hover {
          background: rgba(255,255,255,0.03);
          color: white;
        }
        .sidebar-item.active {
          background: rgba(242, 153, 0, 0.15);
          color: white;
          font-weight: bold;
        }
        .pointer { cursor: pointer; }
        .search-result-item:hover {
          background: rgba(242, 153, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Discuss;
