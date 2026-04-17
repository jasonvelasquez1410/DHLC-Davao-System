import React, { useState } from 'react';
import { 
  Cloud, Video, FileText, Share2, ExternalLink, 
  Search, Shield, Users, Clock, Play, Plus, 
  File, Eye, Download, ChevronRight, CheckCircle2,
  HardDrive, Info, Settings, X
} from 'lucide-react';
import { useAuth } from '../App';

const CloudDrive = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  // Professional Ministry Resources
  const resources = [
    {
      id: 'f1',
      name: 'Sunday Sermon: Divine Healing 2026.docx',
      type: 'docx',
      category: 'sermons',
      owner: 'Head Pastor',
      date: '2 hours ago',
      size: '1.2 MB',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' // Placeholder for testing preview
    },
    {
      id: 'f2',
      name: 'Leadership Training Guide.pdf',
      type: 'pdf',
      category: 'resources',
      owner: 'Admin',
      date: 'Yesterday',
      size: '4.5 MB',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 'f3',
      name: 'Church Growth Analytics Q1.xlsx',
      type: 'xlsx',
      category: 'internal',
      owner: 'Accountant',
      date: '3 days ago',
      size: '850 KB',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
       id: 'f4',
       name: 'Global Outreach Mission Plan.pdf',
       type: 'pdf',
       category: 'sermons',
       owner: 'Rev. Regie',
       date: '5 days ago',
       size: '2.1 MB',
       url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    }
  ];

  const getFileIcon = (type) => {
    switch(type) {
      case 'pdf': return <FileText className="text-red-400" size={18} />;
      case 'docx': return <File className="text-blue-400" size={18} />;
      case 'xlsx': return <CheckCircle2 className="text-green-400" size={18} />;
      default: return <File size={18} />;
    }
  };

  const handlePreview = (file) => {
    // Generate Google Docs Viewer URL for universal viewing
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`;
    setSelectedFile({ ...file, viewerUrl });
  };

  const filteredDocs = resources.filter(doc => 
    (activeCategory === 'all' || doc.category === activeCategory) &&
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="hero" style={{ paddingTop: '100px', display: 'block', minHeight: '100vh' }}>
      {/* File Preview Modal */}
      {selectedFile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', flexDirection: 'column', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', padding: '0 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button onClick={() => setSelectedFile(null)} className="btn-ghost" style={{ padding: '8px' }}><X size={24} /></button>
              <h3 className="font-serif">{selectedFile.name}</h3>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
               <button className="btn-primary" style={{ padding: '8px 15px' }}><Download size={18} /> Download</button>
            </div>
          </div>
          <div style={{ flex: 1, background: 'white', borderRadius: '15px', overflow: 'hidden' }}>
            <iframe 
              src={selectedFile.viewerUrl} 
              style={{ width: '100%', height: '100%', border: 'none' }} 
              title="File Preview"
            />
          </div>
        </div>
      )}

      <div className="container" style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'var(--glass)', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--glass-border)', marginBottom: '1rem' }}>
              <Cloud size={16} className="text-primary" />
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--primary)' }}>SECURE MINISTRY DRIVE</span>
            </div>
            <h1 className="font-serif" style={{ fontSize: '3rem' }}>Church <span className="text-gradient">Expansion Drive</span></h1>
          </div>

          {/* Workspace Integration Card */}
          <div className="premium-card" style={{ padding: '1rem 1.5rem', background: 'rgba(66, 133, 244, 0.05)', border: '1px solid rgba(66, 133, 244, 0.2)', width: '320px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" width="20" alt="Drive" />
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Google Workspace</span>
              </div>
              <div style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(52, 168, 83, 0.2)', color: '#34A853', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={10} /> LINKED
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Integrated Account:</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                {user?.name?.[0] || 'U'}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: '500' }}>{user?.email || 'user@dhlc.com'}</div>
            </div>
          </div>
        </div>

        {/* Categories & Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['all', 'sermons', 'resources', 'internal'].map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={activeCategory === cat ? "btn-primary" : "btn-ghost"}
                style={{ padding: '8px 20px', fontSize: '0.9rem', textTransform: 'capitalize' }}
              >
                {cat}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative', width: '350px' }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} size={18} />
            <input 
              placeholder="Search documents..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '15px', outline: 'none' }}
            />
          </div>
        </div>

        {/* Main Drive Interface */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', marginBottom: '4rem' }}>
          
          {/* File Explorer */}
          <div className="premium-card" style={{ padding: '0' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h3 className="font-serif">Files & Resources</h3>
               {(user?.role === 'admin' || user?.role === 'leader') && (
                 <button className="btn-primary" style={{ padding: '8px 15px', fontSize: '0.85rem' }}>
                   <Plus size={16} /> Upload New
                 </button>
               )}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '1rem 1.5rem' }}>FILE NAME</th>
                    <th>MODIFIED</th>
                    <th>SIZE</th>
                    <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover-effect" style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '1.2rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                           <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             {getFileIcon(doc.type)}
                           </div>
                           <div>
                             <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{doc.name}</div>
                             <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>by {doc.owner}</div>
                           </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{doc.date}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{doc.size}</td>
                      <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                          <button onClick={() => handlePreview(doc)} className="btn-ghost" style={{ padding: '6px 12px', fontSize: '0.8rem' }}><Eye size={14} /> View</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredDocs.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                        <HardDrive size={40} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <p>No documents found in this category.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar Tools */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="premium-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.2rem', color: 'var(--primary)' }}>
                 <Info size={18} />
                 <h4 className="font-serif">Drive Info</h4>
              </div>
              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Total Storage:</span>
                  <span style={{ fontWeight: 'bold' }}>15 GB</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Used Storage:</span>
                  <span style={{ fontWeight: 'bold' }}>4.2 GB</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                   <div style={{ width: '28%', height: '100%', background: 'var(--primary)' }}></div>
                </div>
              </div>
            </div>

            <div className="premium-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.2rem' }}>
                 <Users size={18} className="text-secondary" />
                 <h4 className="font-serif">Shared Access</h4>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                Leaders and Ministers have full access to training materials. Sunday school markers have view-only access.
              </p>
              <button className="btn-ghost" style={{ width: '100%', fontSize: '0.85rem' }}>Manage Permissions</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CloudDrive;
