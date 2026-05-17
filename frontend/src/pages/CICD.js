import React, { useState } from 'react';

const STAGES = [
  { id:'code',    icon:'📝', label:'Code Push',      desc:'GitHub pe commit push hota hai',         color:'#a855f7', duration:1500 },
  { id:'build',   icon:'🔨', label:'Build',           desc:'npm run build — React app compile',      color:'#06b6d4', duration:2000 },
  { id:'test',    icon:'🧪', label:'Test',            desc:'Unit tests & lint checks run hote hain', color:'#f59e0b', duration:1800 },
  { id:'docker',  icon:'🐳', label:'Docker Image',   desc:'Docker image build & tag hoti hai',      color:'#3b82f6', duration:2200 },
  { id:'ecr',     icon:'📦', label:'Push to ECR',    desc:'Image Amazon ECR registry pe push',      color:'#8b5cf6', duration:1800 },
  { id:'ecs',     icon:'🚀', label:'ECS Deploy',     desc:'New task definition register & deploy',  color:'#10b981', duration:2500 },
  { id:'live',    icon:'✅', label:'Live!',           desc:'App is live on AWS Fargate',             color:'#10b981', duration:500  },
];

function StageCard({ stage, status }) {
  const c = { idle:'#334155', running: stage.color, done:'#10b981', error:'#ef4444' };
  const color = c[status];
  return (
    <div style={{
      background: status==='idle' ? 'rgba(30,30,50,0.4)' : `${stage.color}15`,
      border: `2px solid ${status==='idle' ? '#1e293b' : color}`,
      borderRadius:'16px', padding:'20px', textAlign:'center',
      transition:'all 0.5s cubic-bezier(0.34,1.56,0.64,1)',
      boxShadow: status==='running' ? `0 0 25px ${stage.color}55` : 'none',
      transform: status==='running' ? 'scale(1.05)' : 'scale(1)',
      opacity: status==='idle' ? 0.4 : 1,
      position:'relative', overflow:'hidden',
    }}>
      {status==='running' && (
        <div style={{position:'absolute',top:0,left:'-100%',width:'100%',height:'100%',
          background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)',
          animation:'shimmer 1s infinite'}}/>
      )}
      <div style={{fontSize:'2rem', marginBottom:'8px',
        animation: status==='running' ? 'bounce 0.6s infinite alternate' : 'none'
      }}>{stage.icon}</div>
      <div style={{fontWeight:700, color, fontSize:'0.85rem', marginBottom:'4px', fontFamily:'Orbitron,sans-serif'}}>{stage.label}</div>
      <div style={{color:'#475569', fontSize:'0.72rem', lineHeight:1.4}}>{stage.desc}</div>
      {status==='done' && <div style={{color:'#10b981',fontSize:'1.2rem',marginTop:'6px'}}>✓</div>}
      {status==='running' && (
        <div style={{marginTop:'8px',display:'flex',justifyContent:'center',gap:'4px'}}>
          {[0,1,2].map(i=>(
            <div key={i} style={{width:'6px',height:'6px',borderRadius:'50%',background:stage.color,
              animation:`dot 0.8s ${i*0.2}s infinite alternate`}}/>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CICD() {
  const [running, setRunning] = useState(false);
  const [statuses, setStatuses] = useState(Object.fromEntries(STAGES.map(s=>[s.id,'idle'])));
  const [log, setLog] = useState([]);
  const [done, setDone] = useState(false);
  const [commitMsg, setCommitMsg] = useState('feat: update auto-scaling threshold');

  const addLog = (msg, type='info') =>
    setLog(p=>[{time:new Date().toLocaleTimeString('en-IN'),msg,type},...p.slice(0,9)]);

  const runPipeline = async () => {
    if(running) return;
    setRunning(true); setDone(false);
    setStatuses(Object.fromEntries(STAGES.map(s=>[s.id,'idle'])));
    setLog([]);
    addLog(`🔀 Pipeline triggered — "${commitMsg}"`, 'info');

    for(let i=0; i<STAGES.length; i++) {
      const s = STAGES[i];
      setStatuses(p=>({...p,[s.id]:'running'}));
      addLog(`▶ ${s.label} started...`, 'info');
      await new Promise(r=>setTimeout(r, s.duration));
      setStatuses(p=>({...p,[s.id]:'done'}));
      addLog(`✅ ${s.label} completed`, 'success');
    }

    setDone(true); setRunning(false);
    addLog('🎉 Deployment successful — App is LIVE!', 'success');
  };

  const reset = () => {
    setRunning(false); setDone(false);
    setStatuses(Object.fromEntries(STAGES.map(s=>[s.id,'idle'])));
    setLog([]);
  };

  return (
    <div style={{padding:'40px 24px',maxWidth:'1200px',margin:'0 auto'}}>
      <style>{`
        @keyframes shimmer{0%{left:-100%}100%{left:200%}}
        @keyframes bounce{from{transform:translateY(0)}to{transform:translateY(-6px)}}
        @keyframes dot{from{opacity:0.2;transform:scale(0.8)}to{opacity:1;transform:scale(1.2)}}
        @keyframes logIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
      `}</style>

      {/* Header */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:'16px',marginBottom:'36px'}}>
        <div>
          <h1 style={{fontFamily:'Orbitron,sans-serif',color:'#a855f7',fontSize:'1.8rem',marginBottom:'6px'}}>🔄 CI/CD Pipeline</h1>
          <p style={{color:'#64748b'}}>Simulated GitHub → Docker → ECR → ECS deployment flow</p>
        </div>
        <div style={{display:'flex',gap:'12px',alignItems:'center',flexWrap:'wrap'}}>
          <input
            value={commitMsg}
            onChange={e=>setCommitMsg(e.target.value)}
            placeholder="Commit message..."
            style={{background:'rgba(124,58,237,0.1)',border:'1px solid rgba(168,85,247,0.3)',
              borderRadius:'10px',padding:'10px 16px',color:'#e2e8f0',fontSize:'0.85rem',
              width:'260px',outline:'none'}}
          />
          <button onClick={running ? undefined : runPipeline} style={{
            background: running ? 'rgba(100,116,139,0.2)' : 'linear-gradient(135deg,#7c3aed,#a855f7)',
            border:'none',borderRadius:'12px',padding:'12px 28px',color:'#fff',fontWeight:700,
            cursor: running ? 'not-allowed' : 'pointer',fontSize:'0.95rem',
            boxShadow: running ? 'none' : '0 8px 25px rgba(124,58,237,0.4)',transition:'all 0.3s'
          }}>{running ? '⏳ Deploying...' : '🚀 Deploy'}</button>
          <button onClick={reset} style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',
            borderRadius:'12px',padding:'12px 20px',color:'#ef4444',fontWeight:700,cursor:'pointer'}}>↺ Reset</button>
        </div>
      </div>

      {/* Pipeline stages grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'10px',marginBottom:'24px'}}>
        {STAGES.map((s,i)=>(
          <React.Fragment key={s.id}>
            <StageCard stage={s} status={statuses[s.id]}/>
            {i < STAGES.length-1 && (
              <div style={{display:'none'}}/>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Arrow flow */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'4px',marginBottom:'28px',flexWrap:'wrap'}}>
        {STAGES.map((s,i)=>(
          <React.Fragment key={s.id}>
            <div style={{
              background: statuses[s.id]==='done' ? s.color : statuses[s.id]==='running' ? s.color+'88' : '#1e293b',
              borderRadius:'8px', padding:'6px 14px', fontSize:'0.75rem', fontWeight:700,
              color: statuses[s.id]==='idle' ? '#334155' : '#fff',
              transition:'all 0.4s',
              boxShadow: statuses[s.id]==='running' ? `0 0 15px ${s.color}66` : 'none',
              animation: statuses[s.id]==='running' ? 'pulse 1s infinite' : 'none'
            }}>{s.icon} {s.label}</div>
            {i < STAGES.length-1 && (
              <div style={{color: statuses[s.id]==='done' ? '#a855f7' : '#1e293b', fontSize:'1.2rem', transition:'color 0.4s'}}>→</div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Success Banner */}
      {done && (
        <div style={{background:'rgba(16,185,129,0.1)',border:'2px solid rgba(16,185,129,0.4)',
          borderRadius:'16px',padding:'20px',textAlign:'center',marginBottom:'24px',
          animation:'logIn 0.5s ease'}}>
          <div style={{fontSize:'2rem',marginBottom:'8px'}}>🎉</div>
          <div style={{color:'#10b981',fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:'1.1rem'}}>
            Deployment Successful!
          </div>
          <div style={{color:'#64748b',fontSize:'0.85rem',marginTop:'4px'}}>
            App is live on AWS Fargate — ECS updated with new task definition
          </div>
        </div>
      )}

      {/* Log */}
      <div style={{background:'rgba(0,0,0,0.3)',border:'1px solid rgba(168,85,247,0.15)',borderRadius:'16px',padding:'20px'}}>
        <h3 style={{color:'#a855f7',fontFamily:'Orbitron,sans-serif',fontSize:'0.85rem',marginBottom:'14px'}}>📋 Pipeline Logs</h3>
        {log.length===0 && <div style={{color:'#334155',fontSize:'0.85rem',textAlign:'center',padding:'20px 0'}}>Press 🚀 Deploy to start pipeline</div>}
        {log.map((l,i)=>{
          const c={info:'#06b6d4',success:'#10b981',warning:'#f59e0b',error:'#ef4444'}[l.type];
          return (
            <div key={i} style={{display:'flex',gap:'12px',marginBottom:'8px',animation:'logIn 0.3s ease',borderLeft:`3px solid ${c}`,paddingLeft:'12px'}}>
              <span style={{color:'#475569',fontSize:'0.7rem',whiteSpace:'nowrap'}}>{l.time}</span>
              <span style={{color:c,fontSize:'0.82rem'}}>{l.msg}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
