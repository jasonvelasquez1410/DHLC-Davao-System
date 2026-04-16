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

const ShieldCheckIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

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

  // 1. Presence Heartbeat & Fetch Users
  useEffect(() => {
    const userRef = doc(db, 'users', user.uid);
    updateDoc(userRef, { lastActive: serverTimestamp(), isOnline: true });
    
    // Heartbeat every 2 mins
    const heartbeat = setInterval(() => {
      updateDoc(userRef, { lastActive: serverTimestamp(), isOnline: true });
    }, 120000);

    const q = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(q, (snap) => {
      setAllUsers(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() })).filter(u => u.uid !== user.uid));
    });

    return () => {
      clearInterval(heartbeat);
      unsubscribeUsers();
      updateDoc(userRef, { isOnline: false });
    };
  }, [user.uid]);

  // 2. Chat Logic
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

  const selectChat = (type, id, data) => {
    setActiveTab({ type, id });
    setActiveConversation(data);
    setShowUserSearch(false);
    if (window.innerWidth <= 768) setShowSidebar(false);
  };

  const [showEmojis, setShowEmojis] = useState(false);
  const emojis = ['🙌', '❤️', '🔥', '😂', '🙏', '✨', '👍', '😊', '⛪', '🎸', '📢', '✅'];

  return (
    <div style={{ background: DHLC_NAVY, height: '100vh', display: 'flex', overflow: 'hidden', paddingTop: '100px', color: 'white', fontFamily: "'Outfit', sans-serif" }}>
      
      {/* SIDEBAR (Responsive) */}
      <aside style={{ 
        width: showSidebar ? '300px' : '0px', 
        minWidth: showSidebar ? '300px' : '0px',
        borderRight: '1px solid rgba(255,255,255,0.05)', 
        background: DHLC_DARKER, 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        position: window.innerWidth <= 768 ? 'fixed' : 'relative',
        height: '100%',
        zIndex: 2000
      }}>
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
           <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 900, color: 'white' }}>DISCUSS</h2>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '1rem' }}>
           <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '0.8rem 1rem', border: 'none', background: 'rgba(242, 153, 0, 0.1)', color: DHLC_GOLD, cursor: 'pointer', borderRadius: '8px', fontWeight: '900', marginBottom: '2rem' }}><Info size={18} /> INBOX</button>
           
           <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase', padding: '0 0.5rem', marginBottom: '0.8rem', letterSpacing: '1px' }}>Department Groups</p>
           {channels.map(c => (
             <button key={c.id} onClick={() => selectChat('channel', c.id, c)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '0.7rem 0.8rem', border: 'none', background: activeTab.id === c.id ? 'rgba(242, 153, 0, 0.15)' : 'transparent', color: activeTab.id === c.id ? 'white' : 'rgba(255,255,255,0.5)', cursor: 'pointer', borderRadius: '8px', marginBottom: '2px', transition: '0.2s' }}>
                <Hash size={16} /> {c.name.toUpperCase()}
             </button>
           ))}

           <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem', marginBottom: '0.8rem' }}>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Direct Messages</p>
              <Plus size={16} style={{ color: DHLC_GOLD, cursor: 'pointer' }} onClick={() => setShowUserSearch(true)} />
           </div>
           {allUsers.slice(0, 10).map(u => (
             <button key={u.uid} onClick={() => selectChat('dm', u.uid, u)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '0.7rem 0.8rem', border: 'none', background: activeTab.id === u.uid ? 'rgba(242, 153, 0, 0.15)' : 'transparent', color: activeTab.id === u.uid ? 'white' : 'rgba(255,255,255,0.5)', cursor: 'pointer', borderRadius: '8px', marginBottom: '2px' }}>
                <div style={{ position: 'relative' }}>
                  <img src={u.photoURL || `https://ui-avatars.com/api/?name=${u.name}&background=random`} style={{ width: '28px', height: '28px', borderRadius: '50%' }} alt="" />
                  <div style={{ 
                    position: 'absolute', bottom: -2, right: -2, width: '10px', height: '10px', 
                    background: u.isOnline ? '#2ecc71' : '#95a5a6', 
                    borderRadius: '50%', border: '2px solid '+DHLC_DARKER 
                  }}></div>
                </div>
                <span style={{ fontSize: '0.9rem' }}>{u.name}</span>
             </button>
           ))}
        </div>
      </aside>

      {/* MAIN CHAT */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: DHLC_NAVY, position: 'relative' }}>
         <header style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: DHLC_DARKER, borderBottom: '1px solid rgba(255,255,255,0.05)', minHeight: '80px', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <button onClick={() => setShowSidebar(!showSidebar)} style={{ background: 'none', border: 'none', color: DHLC_GOLD, cursor: 'pointer', display: window.innerWidth <= 768 ? 'block' : 'none' }}><Menu size={24} /></button>
               <h2 style={{ margin: 0, fontWeight: 900, letterSpacing: '-0.5px' }}>{activeConversation?.name?.toUpperCase()}</h2>
            </div>
            <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
               <button onClick={() => window.open(`https://meet.jit.si/DHLC-${activeTab.id}`, '_blank')} style={{ background: DHLC_GOLD, border: 'none', padding: '0.6rem 1.2rem', borderRadius: '30px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transform: 'scale(0.95)' }}>
                  <Video size={18} color="black" /> <span style={{ color: 'black', fontSize: '0.8rem' }}>START CALL</span>
               </button>
               <button onClick={() => setShowSettings(!showSettings)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}><Settings size={22} /></button>
            </div>
         </header>

         {/* Messages Panel */}
         <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
            {messages.map((m) => (
              <div key={m.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignSelf: m.senderId === user.uid ? 'flex-end' : 'flex-start' }}>
                 <img src={m.senderPhoto || `https://ui-avatars.com/api/?name=${m.senderName}`} style={{ width: '36px', height: '36px', borderRadius: '10px', marginTop: '4px' }} alt="" />
                 <div style={{ background: m.senderId === user.uid ? 'rgba(242, 153, 0, 0.08)' : 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.05)', maxWidth: '400px' }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: '900', fontSize: '0.75rem', color: DHLC_GOLD }}>{m.senderName.toUpperCase()}</p>
                    <p style={{ margin: 0, lineHeight: 1.5, fontSize: '0.95rem' }}>{m.text}</p>
                 </div>
              </div>
            ))}
            <div ref={scrollRef} />
         </div>

         {/* SETTINGS POPUP */}
         {showSettings && (
           <div style={{ position: 'fixed', top: '120px', right: '30px', width: '320px', background: DHLC_DARKER, borderRadius: '20px', border: '2px solid '+DHLC_GOLD, padding: '2rem', boxShadow: '0 30px 60px rgba(0,0,0,0.8)', zIndex: 8000 }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: DHLC_GOLD }}>SETTINGS</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>NOTIFICATIONS</span><input type="checkbox" checked readOnly /></div>
                 <button onClick={() => setShowSettings(false)} style={{ background: DHLC_GOLD, border: 'none', padding: '0.8rem', borderRadius: '10px', fontWeight: 'bold', marginTop: '1rem' }}>CLOSE</button>
              </div>
           </div>
         )}

         {/* FOOTER INPUT */}
         <form onSubmit={handleSendMessage} style={{ padding: '1.5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1rem', alignItems: 'center', background: DHLC_DARKER }}>
            <button type="button" onClick={() => setShowEmojis(!showEmojis)} style={{ background: 'none', border: 'none', color: DHLC_GOLD, cursor: 'pointer' }}><Smile size={24} /></button>
            <input 
              placeholder="Start typing..." 
              value={newMessage} 
              onChange={(e) => setNewMessage(e.target.value)} 
              style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: 'none', padding: '1rem 1.5rem', borderRadius: '12px', color: 'white', outline: 'none' }}
            />
            <button type="submit" style={{ width: '52px', height: '52px', borderRadius: '50%', background: DHLC_GOLD, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
               <svg viewBox="0 0 24 24" width="24" height="24" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '3px' }}>
                 <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
               </svg>
            </button>
         </form>

         {/* EMOJI MENU */}
         {showEmojis && (
           <div style={{ position: 'absolute', bottom: '100px', left: '2rem', background: DHLC_DARKER, border: '1px solid '+DHLC_GOLD, borderRadius: '15px', padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', zIndex: 6000 }}>
              {emojis.map(e => (
                <button key={e} onClick={() => { setNewMessage(prev => prev + e); setShowEmojis(false); }} style={{ background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer' }}>{e}</button>
              ))}
           </div>
         )}
      </main>

      {/* SEARCH BOX */}
      {showUserSearch && (
        <div style={{ position: 'fixed', top: '120px', left: window.innerWidth > 768 ? '320px' : '20px', right: window.innerWidth > 768 ? 'auto' : '20px', width: window.innerWidth > 768 ? '400px' : 'calc(100% - 40px)', background: DHLC_DARKER, zIndex: 9000, borderRadius: '20px', border: '2px solid '+DHLC_GOLD, padding: '1.5rem', boxShadow: '0 30px 60px rgba(0,0,0,0.8)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>
             <Search size={22} color={DHLC_GOLD} />
             <input autoFocus placeholder="Find member..." value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.1rem', outline: 'none', width: '100%' }} />
             <X size={22} style={{ cursor: 'pointer' }} onClick={() => setShowUserSearch(false)} />
           </div>
           <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {allUsers.filter(u => u.name.toLowerCase().includes(userSearchTerm.toLowerCase())).map(u => (
                <div key={u.uid} onClick={() => selectChat('dm', u.uid, u)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', borderRadius: '12px', cursor: 'pointer', transition: '0.2s' }}>
                   <img src={u.photoURL || `https://ui-avatars.com/api/?name=${u.name}`} style={{ width: '32px', height: '32px', borderRadius: '50%' }} alt="" />
                   <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 'bold' }}>{u.name}</span>
                    <span style={{ fontSize: '0.7rem', color: u.isOnline ? '#2ecc71' : 'gray' }}>{u.isOnline ? 'Online now' : 'Offline'}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default Discuss;
