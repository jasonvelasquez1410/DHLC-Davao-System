import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../App';
import { 
  Send, Hash, Users, MessageSquare, Video, 
  MoreVertical, Phone, Paperclip, Smile 
} from 'lucide-react';

const channels = [
  { id: 'general', name: 'General', icon: Hash, roles: ['admin', 'leader', 'member'] },
  { id: 'leadership', name: 'Ministers & Leaders', icon: ShieldCheckIcon, roles: ['admin', 'leader'] },
  { id: 'announcements', name: 'Pastoral Announcements', icon: MessageSquare, roles: ['admin'] }
];

// Helper for Lucide icons that might be missing
const ShieldCheckIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

const Discuss = () => {
  const { user } = useAuth();
  const [activeChannel, setActiveChannel] = useState(channels[0]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef();

  useEffect(() => {
    if (!activeChannel) return;

    const q = query(
      collection(db, 'messages'),
      where('channelId', '==', activeChannel.id),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [activeChannel]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msgData = {
      text: newMessage,
      channelId: activeChannel.id,
      senderId: user.uid,
      senderName: user.name,
      createdAt: serverTimestamp()
    };

    setNewMessage('');
    await addDoc(collection(db, 'messages'), msgData);
  };

  const startCall = () => {
    const roomName = `DHLC-Davao-${activeChannel.id}-${Math.floor(Math.random() * 1000)}`;
    const jitsiUrl = `https://meet.jit.si/${roomName}`;
    
    // Send a message about the call
    addDoc(collection(db, 'messages'), {
      text: `🚀 I started a Video Call! Click to join: ${jitsiUrl}`,
      channelId: activeChannel.id,
      senderId: user.uid,
      senderName: user.name,
      createdAt: serverTimestamp(),
      isCall: true
    });

    window.open(jitsiUrl, '_blank');
  };

  return (
    <div className="discuss-container">
      {/* Sidebar */}
      <aside className="chat-sidebar">
        <div>
          <h2 className="font-serif" style={{ marginBottom: '2rem' }}>Discuss</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: '1rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Channels</p>
            {channels.filter(c => c.roles.includes(user.role)).map(channel => (
              <button 
                key={channel.id} 
                onClick={() => setActiveChannel(channel)}
                className={`channel-btn ${activeChannel.id === channel.id ? 'active' : ''}`}
              >
                <channel.icon size={18} /> {channel.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
           <div className="premium-card" style={{ padding: '1rem', background: 'rgba(242, 153, 0, 0.05)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Ministry Roster</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>18 Ministers Online</p>
           </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="chat-main">
        <header className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.5rem', background: 'var(--glass)', borderRadius: '10px', color: 'var(--primary)' }}>
              <activeChannel.icon size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>{activeChannel.name}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>Official church discussion thread</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-ghost" style={{ padding: '0.6rem' }} onClick={startCall} title="Start Video Call">
              <Video size={20} />
            </button>
            <button className="btn-ghost" style={{ padding: '0.6rem' }}>
              <Phone size={20} />
            </button>
            <button className="btn-ghost" style={{ padding: '0.6rem' }}>
              <MoreVertical size={20} />
            </button>
          </div>
        </header>

        <div className="messages-area">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-bubble ${msg.senderId === user.uid ? 'mine' : ''}`}>
              <div className="message-info">
                <span style={{ fontWeight: 700, color: msg.senderId === user.uid ? 'var(--primary)' : 'white' }}>{msg.senderName}</span>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>
                  {msg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div style={{ fontSize: '0.95rem' }}>
                {msg.isCall ? (
                  <a href={msg.text.split(': ')[1]} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                    JOIN VIDEO CALL NOW
                  </a>
                ) : msg.text}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSendMessage}>
          <button type="button" className="btn-ghost" style={{ padding: '0.6rem' }}><Paperclip size={20} /></button>
          <input 
            type="text" 
            className="chat-input" 
            placeholder={`Message #${activeChannel.name}`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="button" className="btn-ghost" style={{ padding: '0.6rem' }}><Smile size={20} /></button>
          <button type="submit" className="btn-primary" style={{ padding: '0.8rem' }}><Send size={20} /></button>
        </form>
      </main>
    </div>
  );
};

export default Discuss;
