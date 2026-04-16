import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../App';
import { 
  Send, Hash, Users, MessageSquare, Video, 
  MoreVertical, Phone, Paperclip, Smile, Plus,
  Info, Bell, UserCircle, Settings, Music, Wrench, File,
  Shield, Camera, Heart, Briefcase, Coffee, Baby, Download
} from 'lucide-react';

const ShieldCheckIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

const baseChannels = [
  { id: 'general', name: 'General', icon: Hash, roles: ['admin', 'leader', 'member'] },
  { id: 'levitical-ministers', name: 'Levitical Ministers', icon: ShieldCheckIcon, roles: ['admin', 'leader'] },
  { id: 'music-dept', name: 'Music Department', icon: Music, roles: ['admin', 'leader'] },
  { id: 'multimedia-dept', name: 'Multimedia Dept', icon: Camera, roles: ['admin', 'leader'] },
  { id: 'logistics-engineering', name: 'Logistics/Engineering', icon: Wrench, roles: ['admin', 'leader'] },
  { id: 'finance-hr', name: 'Finance & HR', icon: Briefcase, roles: ['admin', 'leader'] },
  { id: 'security-custodial', name: 'Security & Custodial', icon: Shield, roles: ['admin', 'leader'] },
  { id: 'hospitality-food', name: 'Hospitality & Food', icon: Coffee, roles: ['admin', 'leader'] },
  { id: 'healthcare-dept', name: 'Healthcare Dept', icon: Heart, roles: ['admin', 'leader'] },
  { id: 'childrens-dept', name: "Children's Dept", icon: Baby, roles: ['admin', 'leader'] }
];

const Discuss = () => {
  const { user } = useAuth();
  
  // Filter base channels by role first
  const allowedBaseChannels = baseChannels.filter(c => c.roles.includes(user.role));
  
  const [channels, setChannels] = useState(baseChannels);
  const [activeChannel, setActiveChannel] = useState(allowedBaseChannels[0] || baseChannels[0]);
  const [isDM, setIsDM] = useState(false);
  const [activeDMUser, setActiveDMUser] = useState(null);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef();

  // Fetch Dynamic Channels from Firestore
  useEffect(() => {
    const q = query(collection(db, 'channels'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbChannels = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        name: doc.data().name, 
        icon: Hash, 
        roles: doc.data().roles || ['admin', 'leader', 'member'] 
      }));
      setChannels(prev => {
        const ids = new Set(baseChannels.map(c => c.id));
        const filteredPrev = prev.filter(c => ids.has(c.id));
        return [...filteredPrev, ...dbChannels];
      });
    });
    return () => unsubscribe();
  }, []);

  // Fetch Roster
  useEffect(() => {
    const fetchUsers = async () => {
      const q = query(collection(db, 'users'));
      const snap = await getDocs(q);
      setActiveUsers(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() })).filter(u => u.uid !== user.uid));
    };
    fetchUsers();
  }, [user.uid]);

  // Unified Message Fetching (Channel OR DM)
  useEffect(() => {
    let q;
    if (isDM && activeDMUser) {
      const dmId = [user.uid, activeDMUser.uid].sort().join('_');
      q = query(
        collection(db, 'messages'),
        where('dmId', '==', dmId),
        orderBy('createdAt', 'asc')
      );
    } else if (activeChannel) {
      q = query(
        collection(db, 'messages'),
        where('channelId', '==', activeChannel.id),
        orderBy('createdAt', 'asc')
      );
    }

    if (!q) return;

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, (error) => {
      console.error("Firestore Error:", error);
      const fallbackQ = query(collection(db, 'messages'), orderBy('createdAt', 'asc'), limit(50));
      getDocs(fallbackQ).then(snap => {
         const msgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
         if (isDM) {
           const dmId = [user.uid, activeDMUser.uid].sort().join('_');
           setMessages(msgs.filter(m => m.dmId === dmId));
         } else {
           setMessages(msgs.filter(m => m.channelId === activeChannel.id));
         }
      });
    });
    return () => unsubscribe();
  }, [activeChannel?.id, isDM, activeDMUser?.uid]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const messageData = {
      text: newMessage,
      senderId: user.uid,
      senderName: user.name,
      senderPhoto: user.photoURL || null,
      createdAt: serverTimestamp()
    };

    if (isDM) {
      messageData.dmId = [user.uid, activeDMUser.uid].sort().join('_');
      messageData.recipientId = activeDMUser.uid;
    } else {
      messageData.channelId = activeChannel.id;
    }

    await addDoc(collection(db, 'messages'), messageData);
    setNewMessage('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `chat/${isDM ? 'dm' : activeChannel.id}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const messageData = {
        text: `Shared a file: ${file.name}`,
        fileUrl: url,
        fileName: file.name,
        fileType: file.type,
        senderId: user.uid,
        senderName: user.name,
        senderPhoto: user.photoURL || null,
        createdAt: serverTimestamp(),
        isFile: true
      };

      if (isDM) {
        messageData.dmId = [user.uid, activeDMUser.uid].sort().join('_');
      } else {
        messageData.channelId = activeChannel.id;
      }

      await addDoc(collection(db, 'messages'), messageData);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const startCall = () => {
    const roomId = isDM 
      ? `DHLC-Private-${[user.uid, activeDMUser.uid].sort().join('-')}`
      : `DHLC-Davao-${activeChannel.id}`;
      
    const jitsiUrl = `https://meet.jit.si/${roomId}`;
    
    const callMsg = {
      text: `🚀 STARTED VIDEO CALL: ${jitsiUrl}`,
      senderId: user.uid,
      senderName: user.name,
      senderPhoto: user.photoURL || null,
      createdAt: serverTimestamp(),
      isCall: true
    };
    
    if (isDM) callMsg.dmId = [user.uid, activeDMUser.uid].sort().join('_');
    else callMsg.channelId = activeChannel.id;

    addDoc(collection(db, 'messages'), callMsg);
    window.open(jitsiUrl, '_blank');
  };

  const selectDM = (u) => {
    setIsDM(true);
    setActiveDMUser(u);
  };

  const selectChannel = (c) => {
    setIsDM(false);
    setActiveDMUser(null);
    setActiveChannel(c);
  };

  return (
    <div className="discuss-container">
      {/* Sidebar (Left) */}
      <aside className="chat-sidebar">
        <div style={{ overflowY: 'auto', height: '100%' }}>
          <h2 className="font-serif" style={{ marginBottom: '1.5rem' }}>Discuss</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Departments</p>
            {channels.filter(c => c.roles.includes(user.role)).map(channel => (
              <button key={channel.id} onClick={() => selectChannel(channel)} className={`channel-btn ${!isDM && activeChannel.id === channel.id ? 'active' : ''}`}>
                <channel.icon size={16} /> {channel.name}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Chat Area (Center) */}
      <main className="chat-main">
        <header className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.5rem', background: 'var(--glass)', borderRadius: '10px', color: 'var(--primary)' }}>
              {isDM ? <UserCircle size={20} /> : (activeChannel ? <activeChannel.icon size={20} /> : <Hash size={20}/>)}
            </div>
            <div>
              <h3 style={{ margin: 0 }}>{isDM ? activeDMUser.name : (activeChannel ? activeChannel.name : 'Select Channel')}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0 }}>{isDM ? 'Private Conversation' : 'Department Thread'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-ghost" style={{ padding: '0.5rem' }} onClick={startCall} title="Video Call"><Video size={18} /></button>
          </div>
        </header>

        <div className="messages-area">
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', opacity: 0.5 }}>
              <MessageSquare size={48} style={{ marginBottom: '1rem' }} />
              <p>No messages here yet. Start the conversation!</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', gap: '1rem', alignSelf: msg.senderId === user.uid ? 'flex-end' : 'flex-start', maxWidth: '80%', marginBottom: '1rem' }}>
              {msg.senderId !== user.uid && (
                <img src={msg.senderPhoto || `https://ui-avatars.com/api/?name=${msg.senderName}`} className="user-avatar" style={{ width: '32px', height: '32px' }} alt="" />
              )}
              <div className={`message-bubble ${msg.senderId === user.uid ? 'mine' : ''}`}>
                <div className="message-info">
                  <span style={{ fontWeight: 700 }}>{msg.senderName}</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}</span>
                </div>
                {msg.isFile ? (
                  <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Download size={20} />
                    <a href={msg.fileUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>{msg.fileName}</a>
                  </div>
                ) : msg.isCall ? (
                  <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', border: '1px solid var(--primary)' }}>
                    <p style={{ marginBottom: '8px' }}>🚀 Video Call Link Provided</p>
                    <a href={msg.text.split(': ')[1]} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>JOIN NOW</a>
                  </div>
                ) : <p style={{ fontSize: '0.9rem' }}>{msg.text}</p>}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSendMessage}>
          <label className="btn-ghost">
            <Paperclip size={18} />
            <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploading} />
          </label>
          <input type="text" className="chat-input" placeholder={`Message ${isDM ? activeDMUser.name : '#' + (activeChannel?.name || '...')}`} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} disabled={uploading} />
          <button type="submit" className="btn-primary" style={{ padding: '0.8rem' }} disabled={uploading}><Send size={18} /></button>
        </form>
      </main>

      {/* Roster & Info Side (Right) */}
      <aside className="chat-notification-sidebar">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
          <Users size={18} /> Active Roster
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {activeUsers.map((u) => (
            <button key={u.uid} onClick={() => selectDM(u)} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              background: activeDMUser?.uid === u.uid ? 'rgba(242, 153, 0, 0.1)' : 'transparent',
              border: 'none',
              padding: '8px',
              borderRadius: '10px',
              width: '100%',
              cursor: 'pointer',
              textAlign: 'left',
              color: 'white',
              transition: '0.2s'
            }}>
               <img src={u.photoURL || `https://ui-avatars.com/api/?name=${u.name}`} className="user-avatar" style={{ width: '28px', height: '28px', border: activeDMUser?.uid === u.uid ? '2px solid var(--primary)' : 'none' }} alt="" />
               <div style={{ flex: 1 }}>
                 <p style={{ fontWeight: '500', fontSize: '0.8rem', margin: 0 }}>{u.name}</p>
                 <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', margin: 0 }}>{u.role}</p>
               </div>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default Discuss;
