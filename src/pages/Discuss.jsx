import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, getDocs, limit, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../App';
import { 
  Send, Hash, Users, MessageSquare, Video, 
  Phone, Paperclip, Smile, Plus, Info, Bell, BellOff,
  Settings, Music, Wrench, File, Star,
  Shield, Camera, Heart, Briefcase, Baby, Download, X, Search, Menu
} from 'lucide-react';

const DHLC_NAVY = '#001a33';
const DHLC_GOLD = '#F29900';
const DHLC_DARKER = '#000d1a';

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

const ShieldCheckIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

const Discuss = () => {
  const { user } = useAuth();
  const [channels] = useState(baseChannels);
  const [activeTab, setActiveTab] = useState({ type: 'channel', id: 'general' });
  const [activeConversation, setActiveConversation] = useState(baseChannels[0]);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 768);

  const scrollRef = useRef();

  useEffect(() => {
    if (!user?.uid) return;
    const userRef = doc(db, 'users', user.uid);
    updateDoc(userRef, { lastActive: serverTimestamp(), isOnline: true }).catch(() => {});
    
    const q = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(q, (snap) => {
      setAllUsers(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() })).filter(u => u.uid !== user.uid));
    });
    return () => {
      unsubscribeUsers();
      updateDoc(userRef, { isOnline: false }).catch(() => {});
    };
  }, [user?.uid]);

  // ULTIMATE FAIL-SAFE MESSAGE ENGINE
  useEffect(() => {
    if (!user?.uid) return;
    
    // We use a query that REQUIRES ZERO INDEXES for maximum reliability
    const fallbackQ = query(collection(db, 'messages'), limit(200)); 
    
    const unsubscribe = onSnapshot(fallbackQ, (snapshot) => {
      let filtered = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // MANUALLY FILTER AND SORT IN MEMORY (INDEX-INDEPENDENT)
      if (activeTab.type === 'dm') {
        const dmId = [user.uid, activeTab.id].sort().join('_');
        filtered = filtered.filter(m => m.dmId === dmId);
      } else {
        filtered = filtered.filter(m => m.channelId === activeTab.id);
      }

      // Sort by timestamp
      filtered.sort((a, b) => (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0) - (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0));
      
      setMessages(filtered);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
    });

    return () => unsubscribe();
  }, [activeTab, user?.uid]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.uid) return;

    try {
      const msg = {
        text: newMessage,
        senderId: user.uid,
        senderName: user.name || 'Admin',
        senderPhoto: user.photoURL || null,
        createdAt: serverTimestamp()
      };
      if (activeTab.type === 'dm') msg.dmId = [user.uid, activeTab.id].sort().join('_');
      else msg.channelId = activeTab.id;

      await addDoc(collection(db, 'messages'), msg);
      setNewMessage('');
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleStartVideo = () => {
    // Generate a unique room name based on the chat ID for privacy
    const roomId = activeTab.type === 'dm' 
      ? `DHLC_DAVAO_DM_${[user.uid, activeTab.id].sort().join('_')}`
      : `DHLC_DAVAO_CHANNEL_${activeTab.id}`;
    
    const jitsiUrl = `https://meet.jit.si/${roomId}#config.startWithAudioMuted=true&config.startWithVideoMuted=false`;
    window.open(jitsiUrl, '_blank');
  };

  const selectChat = (type, id, data) => {
    setActiveTab({ type, id });
    setActiveConversation(data);
    setShowUserSearch(false);
    if (window.innerWidth <= 768) setShowSidebar(false);
  };

  const [showEmojis, setShowEmojis] = useState(false);
  const emojis = ['🙌', '❤️', '🔥', '😂', '🙏', '✨', '👍', '😊', '⛪', '🎸', '📢', '✅'];

  return (
    <div style={{ background: DHLC_NAVY, height: '100vh', display: 'flex', overflow: 'hidden', paddingTop: '80px', color: 'white', fontFamily: "sans-serif" }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: showSidebar ? '300px' : '0px', minWidth: showSidebar ? '300px' : '0', background: DHLC_DARKER, borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', transition: '0.3s ease', overflow: 'hidden', position: window.innerWidth <= 768 ? 'fixed' : 'relative', height: '100%', zIndex: 1000 }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>DISCUSS</h2></div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '1rem' }}>
           <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '1rem', padding: '0 0.5rem' }}>Departments</p>
           {channels.map(c => (
             <button key={c.id} onClick={() => selectChat('channel', c.id, c)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '0.7rem 0.8rem', border: 'none', background: activeTab.id === c.id ? 'rgba(242, 153, 0, 0.1)' : 'transparent', color: activeTab.id === c.id ? 'white' : 'rgba(255,255,255,0.5)', cursor: 'pointer', borderRadius: '8px', marginBottom: '2px', textAlign: 'left' }}>
                <Hash size={16} /> {c.name}
             </button>
           ))}
           <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>Direct Messages</p>
              <Plus size={16} style={{ color: DHLC_GOLD, cursor: 'pointer' }} onClick={() => setShowUserSearch(true)} />
           </div>
           {allUsers.map(u => (
             <button key={u.uid} onClick={() => selectChat('dm', u.uid, u)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '0.7rem 0.8rem', border: 'none', background: activeTab.id === u.uid ? 'rgba(242, 153, 0, 0.1)' : 'transparent', color: activeTab.id === u.uid ? 'white' : 'rgba(255,255,255,0.5)', cursor: 'pointer', borderRadius: '8px', marginBottom: '2px', textAlign: 'left' }}>
                <div style={{ position: 'relative' }}>
                  <img src={u.photoURL || `https://ui-avatars.com/api/?name=${u.name}&background=random`} style={{ width: '28px', height: '28px', borderRadius: '50%' }} alt="" />
                  <div style={{ position: 'absolute', bottom: -1, right: -1, width: '8px', height: '8px', background: u.isOnline ? '#2ecc71' : 'gray', borderRadius: '50%', border: '2px solid '+DHLC_DARKER }}></div>
                </div>
                <span>{u.name}</span>
             </button>
           ))}
        </div>
      </aside>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: DHLC_NAVY }}>
         <header style={{ padding: '1.2rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: DHLC_DARKER, borderBottom: '1px solid rgba(255,255,255,0.05)', minHeight: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <button onClick={() => setShowSidebar(!showSidebar)} style={{ background: 'none', border: 'none', color: DHLC_GOLD, cursor: 'pointer', display: window.innerWidth <= 768 ? 'block' : 'none' }}><Menu size={24} /></button>
               <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{activeConversation?.name?.toUpperCase()}</h2>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
               <button onClick={handleStartVideo} style={{ background: DHLC_GOLD, border: 'none', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.75rem' }}>START VIDEO CALL</button>
               <button onClick={() => setShowSettings(!showSettings)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><Settings size={20} /></button>
            </div>
         </header>

         <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', opacity: 0.2, marginTop: '4rem' }}>
                <MessageSquare size={60} style={{ marginBottom: '1rem' }} />
                <h3>No messages yet...</h3>
              </div>
            )}
            {messages.map(m => (
              <div key={m.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: m.senderId === user.uid ? 'flex-end' : 'flex-start' }}>
                 {m.senderId !== user.uid && <img src={m.senderPhoto || `https://ui-avatars.com/api/?name=${m.senderName}`} style={{ width: '32px', height: '32px', borderRadius: '8px' }} alt="" />}
                 <div style={{ background: m.senderId === user.uid ? 'rgba(242, 153, 0, 0.1)' : 'rgba(255,255,255,0.05)', padding: '0.8rem 1.2rem', borderRadius: '15px', maxWidth: '70%', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ margin: '0 0 0.3rem 0', fontWeight: 'bold', fontSize: '0.7rem', color: DHLC_GOLD }}>{m.senderName}</p>
                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.4' }}>{m.text}</p>
                 </div>
              </div>
            ))}
            <div ref={scrollRef} />
         </div>

         <form onSubmit={handleSendMessage} style={{ padding: '1.5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1rem', alignItems: 'center', background: DHLC_DARKER }}>
            <button type="button" onClick={() => setShowEmojis(!showEmojis)} style={{ background: 'none', border: 'none', color: DHLC_GOLD, cursor: 'pointer' }}><Smile size={24} /></button>
            <input placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: 'none', padding: '1rem 1.5rem', borderRadius: '15px', color: 'white', outline: 'none' }} />
            <button type="submit" style={{ width: '50px', height: '50px', borderRadius: '50%', background: DHLC_GOLD, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <svg viewBox="0 0 24 24" width="22" height="22" stroke="white" strokeWidth="3" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
            </button>
         </form>
      </main>

      {/* SEARCH BOX */}
      {showUserSearch && (
        <div style={{ position: 'fixed', top: '120px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '400px', background: DHLC_DARKER, zIndex: 3000, borderRadius: '20px', border: '2px solid '+DHLC_GOLD, padding: '1.5rem' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>
             <Search size={22} color={DHLC_GOLD} /><input autoFocus placeholder="Find member..." value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} style={{ background: 'none', border: 'none', color: 'white', outline: 'none', width: '100%' }} /><X size={22} style={{ cursor: 'pointer' }} onClick={() => setShowUserSearch(false)} />
           </div>
           <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {allUsers.filter(u => u.name.toLowerCase().includes(userSearchTerm.toLowerCase())).map(u => (
                <div key={u.uid} onClick={() => selectChat('dm', u.uid, u)} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '0.8rem', cursor: 'pointer' }}>
                   <img src={u.photoURL || `https://ui-avatars.com/api/?name=${u.name}`} style={{ width: '32px', height: '32px', borderRadius: '50%' }} alt="" />
                   <span style={{ fontWeight: 'bold' }}>{u.name}</span>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default Discuss;
