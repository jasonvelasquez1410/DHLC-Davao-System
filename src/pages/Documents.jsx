import React, { useState, useEffect } from 'react';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../App';
import { 
  File, Folder, Upload, Download, Search, 
  Trash2, Filter, MoreVertical, FileText,
  Image as ImageIcon, FileArchive, Plus
} from 'lucide-react';

const categories = [
  'General', 'Legal', 'Finance', 'Music', 'Logistics', 'Multimedia', 'Pastoral'
];

const Documents = () => {
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('General');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDocs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `documents/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'documents'), {
        name: file.name,
        type: file.type,
        size: file.size,
        url: url,
        category: activeCategory,
        uploadedBy: user.name,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload file. Ensure you have permissions.");
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (type) => {
    if (type.includes('image')) return <ImageIcon size={20} className="text-secondary" />;
    if (type.includes('pdf')) return <FileText size={20} style={{ color: '#ff4444' }} />;
    if (type.includes('zip')) return <FileArchive size={20} style={{ color: '#f29900' }} />;
    return <File size={20} style={{ color: 'var(--text-dim)' }} />;
  };

  const filteredDocs = docs.filter(d => 
    d.category === activeCategory && 
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="hero" style={{ paddingTop: '100px', display: 'block' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h1 className="font-serif">Document <span className="text-gradient">Library</span></h1>
            <p style={{ color: 'var(--text-dim)' }}>Secure cloud management for DHLC official records.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label className="btn-primary" style={{ cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Upload size={18} /> {uploading ? 'Uploading...' : 'Upload File'}
              <input type="file" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
            </label>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
          
          {/* Sidebar Filters */}
          <aside>
            <div className="premium-card" style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Categories</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {categories.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)}
                    className="channel-btn"
                    style={{ 
                      background: activeCategory === cat ? 'linear-gradient(90deg, var(--glass-heavy), transparent)' : 'transparent',
                      color: activeCategory === cat ? 'var(--primary)' : 'var(--text-dim)',
                      borderLeft: activeCategory === cat ? '3px solid var(--primary)' : '3px solid transparent'
                    }}
                  >
                    <Folder size={18} /> {cat}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main>
            <div className="premium-card" style={{ padding: '0', background: 'rgba(0,0,0,0.1)' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input 
                    type="text" 
                    placeholder="Search documents..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'white' }}
                  />
                </div>
                <button className="btn-ghost" style={{ padding: '0.6rem 1.2rem' }}><Filter size={18} /> Filter</button>
              </div>

              <div style={{ padding: '1.5rem' }}>
                {filteredDocs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 0', opacity: 0.5 }}>
                    <Folder size={64} style={{ marginBottom: '1rem', color: 'var(--text-dim)' }} />
                    <p>No documents found in {activeCategory}.</p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                        <th style={{ padding: '1rem' }}>Name</th>
                        <th style={{ padding: '1rem' }}>Uploaded By</th>
                        <th style={{ padding: '1rem' }}>Date</th>
                        <th style={{ padding: '1rem' }}>Size</th>
                        <th style={{ padding: '1rem' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocs.map((doc) => (
                        <tr key={doc.id} style={{ borderBottom: '1px solid var(--glass-border)' }} className="hover-effect">
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {getFileIcon(doc.type)}
                              <span style={{ fontWeight: '500' }}>{doc.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{doc.uploadedBy}</td>
                          <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                            {doc.createdAt?.toDate ? doc.createdAt.toDate().toLocaleDateString() : '...'}
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                            {(doc.size / 1024 / 1024).toFixed(2)} MB
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <a href={doc.url} target="_blank" rel="noreferrer" className="btn-ghost" style={{ padding: '0.5rem' }} title="Download">
                                <Download size={18} />
                              </a>
                              <button className="btn-ghost" style={{ padding: '0.5rem', color: '#ff4444' }} title="Delete">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
};

export default Documents;
