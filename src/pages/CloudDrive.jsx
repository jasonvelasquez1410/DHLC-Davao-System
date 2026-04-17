import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../lib/firebase';
import { 
  Cloud, Video, FileText, Share2, ExternalLink, 
  Search, Shield, Users, Clock, Play, Plus, 
  File, Eye, Download, ChevronRight, CheckCircle2,
  HardDrive, Info, Settings, X, Upload
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../App';

const CloudDrive = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Google API Settings
  const CLIENT_ID = "695103836847-jason-project.apps.googleusercontent.com"; // Placeholder
  const API_KEY = "AIzaSyDBWurvGNq_ld0BMqUlhzs0sKRrU8CBUD8";

  // Load Real-Time Data & Scripts
  useEffect(() => {
    // 1. Live Firestore Sync
    const q = query(collection(db, 'resources'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setResources(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // 2. Load Google Picker Scripts
    const loadScripts = () => {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => window.gapi.load('picker');
        document.body.appendChild(script);

        const gisScript = document.createElement('script');
        gisScript.src = 'https://accounts.google.com/gsi/client';
        document.body.appendChild(gisScript);
    };
    loadScripts();

    return () => unsub();
  }, []);

  const handleOpenPicker = () => {
    try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/drive.readonly',
            callback: (response) => {
                if (response.access_token) {
                    const picker = new window.google.picker.PickerBuilder()
                        .addView(window.google.picker.ViewId.DOCS)
                        .setOAuthToken(response.access_token)
                        .setDeveloperKey(API_KEY)
                        .setCallback(async (data) => {
                            if (data.action === window.google.picker.Action.PICKED) {
                                const doc = data.docs[0];
                                await addDoc(collection(db, 'resources'), {
                                    name: `[DRIVE] ${doc.name}`,
                                    type: 'gdoc',
                                    category: 'resources',
                                    owner: user.name,
                                    date: 'Imported',
                                    size: 'Cloud Link',
                                    url: doc.url,
                                    timestamp: serverTimestamp()
                                });
                            }
                        })
                        .build();
                    picker.setVisible(true);
                }
            },
        });
        tokenClient.requestAccessToken();
    } catch (e) {
        alert("Google services are loading. Please try again in 3 seconds.");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `cloud_drive/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, 'resources'), {
        name: file.name,
        type: file.name.split('.').pop().toLowerCase(),
        category: 'resources',
        owner: user.name,
        date: 'Just now',
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        url: downloadURL,
        timestamp: serverTimestamp()
      });
      alert("Success! Your file is now available in the church drive.");
    } catch (err) {
      alert("Error: Storage permissions or quota exceeded.");
    } finally {
      setUploading(false);
    }
  };

  const filteredResources = resources.filter(res => {
    const matchesSearch = res.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || res.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const isLeader = user?.role === 'admin' || user?.role === 'leader';
  const getDocTypeIcon = (type) => {
    if (['docx', 'doc'].includes(type)) return <FileText size={20} color="#2b579a" />;
    if (['xlsx', 'xls', 'csv'].includes(type)) return <Share2 size={20} color="#217346" />;
    if (['pdf'].includes(type)) return <File size={20} color="#e74c3c" />;
    return <File size={20} color="var(--primary)" />;
  };

  return (
    <div className="hero" style={{ paddingTop: '100px', display: 'block', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* MODAL: PREVIEW */}
        {selectedFile && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 10000, display: 'flex', flexDirection: 'column', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
               <h3 style={{ color: 'white', margin: 0 }}>{selectedFile.name}</h3>
               <button onClick={() => setSelectedFile(null)} className="btn-ghost" style={{ padding: '10px' }}><X size={24} /></button>
            </div>
            <div style={{ flex: 1, background: '#1a1a1a', borderRadius: '12px', overflow: 'hidden' }}>
               <iframe 
                 src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedFile.url)}&embedded=true`}
                 style={{ width: '100%', height: '100%', border: 'none' }}
                 title="Preview"
               />
            </div>
          </div>
        )}

        {/* HEADER */}
        <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '0.5rem' }}>
               <Cloud size={20} /> <span style={{ fontWeight: 'bold', letterSpacing: '1px', fontSize: '0.8rem' }}>CHURCH CONTENT ECOSYSTEM</span>
            </div>
            <h1 className="font-serif" style={{ fontSize: '3rem', margin: 0 }}>Expansion <span className="text-gradient">Drive</span></h1>
            <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>Secure minister-led document management system.</p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            {isLeader && (
              <>
                <button className="btn-ghost" onClick={handleOpenPicker} style={{ padding: '0.8rem 1.5rem' }}><HardDrive size={18} /> Import from Drive</button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
                <button 
                  className="btn-primary" 
                  onClick={() => fileInputRef.current?.click()} 
                  style={{ padding: '0.8rem 1.5rem', opacity: uploading ? 0.7 : 1 }}
                  disabled={uploading}
                >
                  {uploading ? 'Processing...' : <><Upload size={18} /> Upload New</>}
                </button>
              </>
            )}
          </div>
        </div>

        {/* MAIN INTERFACE */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 3fr', gap: '2.5rem' }}>
          
          {/* Filters */}
          <div className="animate-fade-in">
             <div className="premium-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ position: 'relative', marginBottom: '2rem' }}>
                   <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} size={18} />
                   <input 
                     type="text" placeholder="Search resources..." 
                     value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                     style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 40px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '12px' }}
                   />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                   {['all', 'sermons', 'resources', 'internal'].map(cat => (
                     <button key={cat} onClick={() => setActiveCategory(cat)}
                       style={{ 
                         textAlign: 'left', padding: '12px 15px', borderRadius: '10px', background: activeCategory === cat ? 'rgba(242,153,0,0.1)' : 'transparent', color: activeCategory === cat ? 'var(--primary)' : 'var(--text-dim)', border: 'none', cursor: 'pointer', fontWeight: activeCategory === cat ? 'bold' : 'normal', textTransform: 'capitalize', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                       }}
                     >
                       {cat} {activeCategory === cat && <ChevronRight size={16} />}
                     </button>
                   ))}
                </div>
             </div>

             <div className="premium-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(242,153,0,0.05), transparent)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}><Shield size={20} className="text-primary" /><h4 style={{ margin: 0 }}>Security Shield</h4></div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: '1.5' }}>Files are encrypted and stored in the church private cloud cloud.</p>
                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', background: '#2ecc71', borderRadius: '50%', boxShadow: '0 0 10px #2ecc71' }}></div><span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>ENCRYPTED SYNC ACTIVE</span></div>
             </div>
          </div>

          {/* TABLE */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
             <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                      <tr style={{ textAlign: 'left', opacity: 0.5, fontSize: '0.8rem', letterSpacing: '1px' }}>
                         <th style={{ padding: '1.5rem' }}>RESOURCE NAME</th>
                         <th>CATEGORY</th>
                         <th>OWNER</th>
                         <th>STATUS</th>
                         <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>ACTIONS</th>
                      </tr>
                   </thead>
                   <tbody>
                      {filteredResources.map(res => (
                        <tr key={res.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s' }}>
                           <td style={{ padding: '1.2rem 1.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                 {getDocTypeIcon(res.type)}
                                 <b>{res.name}</b>
                              </div>
                           </td>
                           <td style={{ fontSize: '0.85rem' }}><span style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', textTransform: 'capitalize' }}>{res.category}</span></td>
                           <td style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{res.owner}</td>
                           <td style={{ fontSize: '0.85rem' }}><span style={{ color: '#2ecc71', display: 'flex', alignItems: 'center', gap: '5px' }}><CheckCircle2 size={14} /> Ready</span></td>
                           <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                 <button className="btn-ghost" onClick={() => setSelectedFile(res)} style={{ padding: '8px', borderRadius: '50%' }}><Eye size={18} /></button>
                                 <a href={res.url} target="_blank" rel="noreferrer" className="btn-ghost" style={{ padding: '8px', borderRadius: '50%' }}><ExternalLink size={18} /></a>
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
                {filteredResources.length === 0 && !loading && (
                   <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                      <Info size={40} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                      <p>Church drive is currently empty.</p>
                   </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CloudDrive;
