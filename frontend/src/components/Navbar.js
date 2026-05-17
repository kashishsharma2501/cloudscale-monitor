import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const links = [
    { path: '/', label: 'Home' },
    { path: '/monitoring', label: 'Monitoring' },
    { path: '/scaling', label: 'Scaling' },
    { path: '/alerts', label: 'Alerts' },
    { path: '/cicd', label: 'CI/CD' },
  ];
  return (
    <nav style={{position:'sticky',top:0,zIndex:100,background:'rgba(10,0,21,0.95)',borderBottom:'1px solid rgba(168,85,247,0.3)',padding:'0 24px',display:'flex',alignItems:'center',justifyContent:'space-between',height:'64px',backdropFilter:'blur(10px)'}}>
      <div style={{fontFamily:'Orbitron,sans-serif',fontSize:'1.2rem',fontWeight:900,color:'#a855f7',textShadow:'0 0 20px rgba(168,85,247,0.5)'}}>
        ⚡ CloudScale
      </div>
      <div style={{display:'flex',gap:'8px'}} className="hide-mobile">
        {links.map(l => (
          <Link key={l.path} to={l.path} style={{
            padding:'8px 20px',borderRadius:'8px',textDecoration:'none',fontWeight:600,fontSize:'0.95rem',transition:'all 0.3s',
            background: loc.pathname===l.path ? 'rgba(124,58,237,0.4)' : 'transparent',
            color: loc.pathname===l.path ? '#a855f7' : '#94a3b8',
            border: loc.pathname===l.path ? '1px solid rgba(168,85,247,0.5)' : '1px solid transparent'
          }}>
            {l.label}
          </Link>
        ))}
      </div>
      <button onClick={() => setOpen(!open)} style={{display:'none',background:'none',border:'none',color:'#a855f7',fontSize:'1.5rem',cursor:'pointer'}} className="show-mobile">☰</button>
      {open && (
        <div style={{position:'absolute',top:'64px',left:0,right:0,background:'rgba(10,0,21,0.98)',padding:'16px',display:'flex',flexDirection:'column',gap:'8px',borderBottom:'1px solid rgba(168,85,247,0.3)'}}>
          {links.map(l => (
            <Link key={l.path} to={l.path} onClick={() => setOpen(false)} style={{padding:'12px 20px',borderRadius:'8px',textDecoration:'none',fontWeight:600,color: loc.pathname===l.path ? '#a855f7' : '#94a3b8'}}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
