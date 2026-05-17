import React, { useState } from 'react';

function Alerts() {
  const [alerts] = useState([
    {id:1,type:'warning',title:'High CPU Alert',msg:'CPU crossed 60% threshold — Auto scaling triggered',time:'Today 11:23 AM',status:'Resolved'},
    {id:2,type:'info',title:'Scale Up Event',msg:'Tasks scaled from 1 to 2 — New container provisioned',time:'Today 11:24 AM',status:'Resolved'},
    {id:3,type:'info',title:'Scale Up Event',msg:'Tasks scaled from 2 to 3 — Max capacity reached',time:'Today 11:26 AM',status:'Resolved'},
    {id:4,type:'success',title:'Scale Down Event',msg:'CPU normalized — Tasks scaled down to 1',time:'Today 12:10 PM',status:'Resolved'},
    {id:5,type:'warning',title:'CPU Alert',msg:'CPU usage at 58% — Approaching threshold',time:'Today 14:30 PM',status:'Active'},
  ]);

  const colors = {warning:'#f59e0b',info:'#06b6d4',success:'#10b981',error:'#ef4444'};
  const icons = {warning:'⚠️',info:'ℹ️',success:'✅',error:'❌'};

  return (
    <div style={{padding:'40px 24px',maxWidth:'1200px',margin:'0 auto'}}>
      <h1 style={{fontFamily:'Orbitron,sans-serif',color:'#a855f7',marginBottom:'8px',fontSize:'1.8rem'}}>🔔 Alerts & Events</h1>
      <p style={{color:'#94a3b8',marginBottom:'40px'}}>SNS email alerts and scaling events log</p>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'20px',marginBottom:'40px'}}>
        {[
          {label:'Total Alerts',value:5,color:'#a855f7'},
          {label:'Active Alerts',value:1,color:'#f59e0b'},
          {label:'Resolved',value:4,color:'#10b981'},
          {label:'Email Sent',value:5,color:'#06b6d4'},
        ].map(s => (
          <div key={s.label} style={{background:'rgba(124,58,237,0.1)',border:'1px solid rgba(168,85,247,0.2)',borderRadius:'16px',padding:'24px',textAlign:'center'}}>
            <div style={{color:'#94a3b8',fontSize:'0.85rem',marginBottom:'8px'}}>{s.label}</div>
            <div style={{fontSize:'3rem',fontWeight:700,color:s.color,fontFamily:'Orbitron,sans-serif'}}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{background:'rgba(124,58,237,0.1)',border:'1px solid rgba(168,85,247,0.2)',borderRadius:'16px',padding:'24px',marginBottom:'24px'}}>
        <h3 style={{color:'#a855f7',marginBottom:'20px',fontFamily:'Orbitron,sans-serif',fontSize:'1rem'}}>SNS Configuration</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'16px'}}>
          {[
            {label:'Topic',value:'FYP-CPU-Alert'},
            {label:'Email',value:'kashishs2522@gmail.com'},
            {label:'Status',value:'✅ Confirmed'},
            {label:'Threshold',value:'CPU > 60%'},
          ].map(i => (
            <div key={i.label} style={{background:'rgba(124,58,237,0.08)',borderRadius:'8px',padding:'16px'}}>
              <div style={{color:'#94a3b8',fontSize:'0.8rem',marginBottom:'4px'}}>{i.label}</div>
              <div style={{color:'#a855f7',fontWeight:600,fontSize:'0.95rem'}}>{i.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
        {alerts.map(a => (
          <div key={a.id} style={{background:'rgba(124,58,237,0.08)',border:`1px solid ${colors[a.type]}33`,borderLeft:`4px solid ${colors[a.type]}`,borderRadius:'12px',padding:'20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'12px'}}>
            <div style={{display:'flex',gap:'16px',alignItems:'center'}}>
              <span style={{fontSize:'1.5rem'}}>{icons[a.type]}</span>
              <div>
                <div style={{fontWeight:700,color:colors[a.type],marginBottom:'4px'}}>{a.title}</div>
                <div style={{color:'#94a3b8',fontSize:'0.9rem'}}>{a.msg}</div>
                <div style={{color:'#64748b',fontSize:'0.8rem',marginTop:'4px'}}>{a.time}</div>
              </div>
            </div>
            <span style={{background: a.status==='Active' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)',color: a.status==='Active' ? '#f59e0b' : '#10b981',padding:'4px 12px',borderRadius:'50px',fontSize:'0.8rem',fontWeight:600,whiteSpace:'nowrap'}}>
              {a.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Alerts;
