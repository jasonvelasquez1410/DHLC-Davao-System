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

  useEffect(() => {
    const fetchUsers = async () => {
      const q = query(collection(db, 'users'), where('role', 'in', ['admin', 'leader']));
      const snap = await getDocs(q);
      setActiveUsers(snap.docs.map(doc => doc.data()));
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!activeChannel) return;
    // Query without 'where' first if index might be missing, 
    // but in production 'where-orderBy' is best.
    // Adding try-catch or simplified query for robustness
    const q = query(
      collection(db, 'messages'),
      orderBy('createdAt', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(m => m.channelId === activeChannel.id); // Client-side filter as fallback for missing index
      
      setMessages(msgs);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, (error) => {
      console.error("Firestore Error in Discuss:", error);
    });
    return () => unsubscribe();
  }, [activeChannel.id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await addDoc(collection(db, 'messages'), {
      text: newMessage,
      channelId: activeChannel.id,
      senderId: user.uid,
      senderName: user.name,
      senderPhoto: user.photoURL || null,
      createdAt: serverTimestamp()
    });
    setNewMessage('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `chat/${activeChannel.id}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'messages'), {
        text: `Shared a file: ${file.name}`,
        fileUrl: url,
        fileName: file.name,
        fileType: file.type,
        channelId: activeChannel.id,
        senderId: user.uid,
        senderName: user.name,
        senderPhoto: user.photoURL || null,
        createdAt: serverTimestamp(),
        isFile: true
      });
    } catch (err) {
      console.error(err);
      alert("Attachment failed. Try a smaller file.");
    } finally {
      setUploading(false);
    }
  };

  const createChannel = async () => {
    const name = prompt("Enter Custom Group Name:");
    if (!name) return;
    await addDoc(collection(db, 'channels'), {
      name: name,
      createdBy: user.uid,
      roles: ['admin', 'leader', 'member'],
      createdAt: serverTimestamp()
    });
  };

  const startCall = () => {
    const jitsiUrl = `https://meet.jit.si/DHLC-Davao-${activeChannel.id}-${Math.floor(Math.random() * 1000)}`;
    addDoc(collection(db, 'messages'), {
      text: `🚀 STARTED VIDEO CALL: ${jitsiUrl}`,
      channelId: activeChannel.id,
      senderId: user.uid,
      senderName: user.name,
      senderPhoto: user.photoURL || null,
      createdAt: serverTimestamp(),
      isCall: true
    });
    window.open(jitsiUrl, '_blank');
  };

  return (
    <div className="discuss-container">
      {/* Sidebar (Left) */}
      <aside className="chat-sidebar">
        <div style={{ overflowY: 'auto', height: '100%' }}>
          <h2 className="font-serif" style={{ marginBottom: '1.5rem' }}>Discuss</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
               <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Departments</p>
               {(user.role === 'admin' || user.role === 'leader') && (
                 <button onClick={createChannel} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}><Plus size={16}/></button>
               )}
            </div>
            {channels.filter(c => c.roles.includes(user.role)).map(channel => (
              <button key={channel.id} onClick={() => setActiveChannel(channel)} className={`channel-btn ${activeChannel.id === channel.id ? 'active' : ''}`}>
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
              <activeChannel.icon size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>{activeChannel.name}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0 }}>Official Department Thread</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-ghost" style={{ padding: '0.5rem' }} onClick={startCall} title="Start Group Call"><Video size={18} /></button>
            <button className="btn-ghost" style={{ padding: '0.5rem' }}><Settings size={18} /></button>
          </div>
        </header>

        <div className="messages-area">
          {messages.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', gap: '1rem', alignSelf: msg.senderId === user.uid ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
              {msg.senderId !== user.uid && (
                <img src={msg.senderPhoto || `https://ui-avatars.com/api/?name=${msg.senderName}`} className="user-avatar" style={{ width: '32px', height: '32px' }} alt="" />
              )}
              <div className={`message-bubble ${msg.senderId === user.uid ? 'mine' : ''}`}>
                <div className="message-info">
                  <span style={{ fontWeight: 700 }}>{msg.senderName}</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}</span>
                </div>
                {msg.isFile ? (
                  <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'var(--primary-glow)', padding: '8px', borderRadius: '8px' }}>
                       {msg.fileType?.includes('image') ? <Camera size={20} /> : <File size={20} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px', wordBreak: 'break-all' }}>{msg.fileName}</p>
                      <a href={msg.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Download size={14} /> Download File
                      </a>
                    </div>
                  </div>
                ) : msg.isCall ? (
                  <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', border: '1px solid var(--primary)' }}>
                    <p style={{ marginBottom: '8px', fontSize: '0.85rem' }}>🎥 {msg.senderName} started a Video Call</p>
                    <a href={msg.text.split(': ')[1]} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'inline-block' }}>JOIN CALL</a>
                  </div>
                ) : <p style={{ fontSize: '0.9rem' }}>{msg.text}</p>}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSendMessage}>
          <label style={{ cursor: 'pointer' }} className="btn-ghost" title="Attach Media">
            <Paperclip size={18} />
            <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploading} />
          </label>
          <input type="text" className="chat-input" placeholder={uploading ? "Uploading media..." : `Message #${activeChannel.name}`} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} disabled={uploading} />
          <button type="submit" className="btn-primary" style={{ padding: '0.8rem' }} disabled={uploading}><Send size={18} /></button>
        </form>
      </main>

      {/* Roster & Info Side (Right) */}
      <aside className="chat-notification-sidebar">
        <div className="guide-card" style={{ marginBottom: '1.5rem', background: 'rgba(242, 153, 0, 0.05)', border: '1px solid var(--glass-border)' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px', fontSize: '0.9rem' }}>
            <Info size={16} color="var(--primary)" /> Minister Guide
          </h4>
          <p style={{ fontSize: '0.75rem' }}>• Use the **Paperclip** to share files/media.</p>
          <p style={{ fontSize: '0.75rem' }}>• Files are auto-stored in the church library.</p>
          <p style={{ fontSize: '0.75rem' }}>• Click Video icon for instant group meetings.</p>
        </div>

        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', color: 'var(--text-dim)' }}>
          <Users size={18} /> Active Roster
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
          {activeUsers.map((u, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <div style={{ position: 'relative' }}>
                 <img src={u.photoURL || `https://ui-avatars.com/api/?name=${u.name}`} className="user-avatar" style={{ width: '28px', height: '28px' }} alt="" />
                 <div style={{ position: 'absolute', bottom: 0, right: 0, width: '6px', height: '6px', background: '#4caf50', borderRadius: '50%', border: '2px solid var(--bg-dark)' }}></div>
               </div>
               <div>
                 <p style={{ fontWeight: '500', fontSize: '0.8rem', marginBottom: '0' }}>{u.name}</p>
                 <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{u.role}</p>
               </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto' }}>
           <div className="premium-card" style={{ padding: '1rem', background: 'rgba(0, 45, 98, 0.4)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Logged in as:</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.name}`} className="user-avatar" style={{ width: '24px', height: '24px' }} alt="" />
                <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{user.name}</span>
              </div>
           </div>
        </div>
      </aside>
    </div>
  );
};

export default Discuss;
