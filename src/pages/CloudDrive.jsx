import React, { useState } from 'react';
import { 
  Cloud, Video, FileText, Share2, ExternalLink, 
  Search, Shield, Users, Clock, Play
} from 'lucide-react';
import { useAuth } from '../App';

const CloudDrive = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data reflecting the user's description
  const driveSections = [
    {
      id: 'sermons',
      title: 'Recorded Sermon Videos',
      description: 'Weekly sermons shared with our local and international members.',
      icon: <Video className="text-primary" size={24} />,
      link: '#', // TODO: User to provide actual Google Drive link
      count: '48 Videos',
      tag: 'Public to Members'
    },
    {
      id: 'resources',
      title: 'Ministry Resources',
      description: 'Training materials for leaders and divinity class students.',
      icon: <FileText style={{ color: '#4285F4' }} size={24} />,
      link: '#',
      count: '15 Folders',
      tag: 'Leaders Only'
    },
    {
      id: 'media',
      title: 'Church Media Kit',
      description: 'Official logos, background loops, and presentation templates.',
      icon: <Share2 style={{ color: '#34A853' }} size={24} />,
      link: '#',
      count: '120+ Assets',
      tag: 'Internal'
    }
  ];

  return (
    <div className="hero" style={{ paddingTop: '100px', display: 'block', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '10px', 
            background: 'var(--glass)', 
            padding: '8px 16px', 
            borderRadius: '20px', 
            border: '1px solid var(--glass-border)',
            marginBottom: '1rem'
          }}>
            <Cloud size={18} className="text-secondary" />
            <span style={{ fontSize: '0.9rem', letterSpacing: '1px', color: 'var(--primary)' }}>DHLC CLOUD ECOSYSTEM</span>
          </div>
          <h1 className="font-serif" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            Unified <span className="text-gradient">Cloud Drive</span>
          </h1>
          <p style={{ color: 'var(--text-dim)', maxWidth: '600px', margin: '0 auto' }}>
            Access our sermon archives and ministry resources powered by Google Workspace integration.
          </p>
        </div>

        {/* Featured Video Section - Specific for the user's request */}
        <div className="premium-card" style={{ marginBottom: '3rem', padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div style={{ color: 'var(--primary)', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Play size={16} /> LATEST SERMON
            </div>
            <h2 className="font-serif">Connecting Our Global Family</h2>
            <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              We've centralized our sermon video archives on Google Drive to ensure our members in far and international places stay connected with the word from Davao.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ExternalLink size={18} /> Open Sermon Drive
              </button>
              <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Share2 size={18} /> Share Link
              </button>
            </div>
          </div>
          <div style={{ 
            aspectRatio: '16/9', 
            background: 'url("https://images.unsplash.com/photo-1510253687831-0f982d7862fc?auto=format&fit=crop&w=800&q=80")',
            backgroundSize: 'cover',
            borderRadius: '15px',
            border: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            cursor: 'pointer'
          }}>
             <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', borderRadius: '15px' }}></div>
             <div style={{ 
               width: '60px', 
               height: '60px', 
               borderRadius: '50%', 
               background: 'var(--primary)', 
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center',
               color: 'white',
               zIndex: 2,
               boxShadow: '0 0 30px var(--primary)'
             }}>
               <Play size={30} fill="currentColor" />
             </div>
          </div>
        </div>

        {/* Main Drive Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
          {driveSections.map((section) => (
            <div key={section.id} className="premium-card hover-effect" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ width: '50px', height: '50px', background: 'var(--glass-heavy)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyCenter: 'center', padding: '12px' }}>
                  {section.icon}
                </div>
                <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', height: 'fit-content', padding: '4px 10px', borderRadius: '10px', color: 'var(--text-dim)' }}>
                  {section.tag}
                </span>
              </div>
              <h3 className="font-serif" style={{ marginBottom: '0.5rem' }}>{section.title}</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '1.5rem', minHeight: '3rem' }}>
                {section.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  <Clock size={14} /> {section.count}
                </div>
                <button className="btn-ghost" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>
                  Go to Folder
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Integration Footer */}
        <div className="premium-card" style={{ textAlign: 'center', padding: '2rem', background: 'rgba(15, 157, 88, 0.05)', border: '1px solid rgba(15, 157, 88, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', opacity: 0.7, marginBottom: '1rem' }}>
            {/* Google Apps Icons Placeholder-ish style */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)' }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" width="20" alt="Drive" /> Drive
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)' }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/0/01/Google_Docs_logo_%282014-2020%29.svg" width="18" alt="Docs" /> Docs
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)' }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg" width="18" alt="Sheets" /> Sheets
            </div>
          </div>
          <p style={{ fontSize: '0.85rem' }}>Verified workspace connection. All files are encrypted and managed by DHLC Admin.</p>
        </div>

      </div>
    </div>
  );
};

export default CloudDrive;
