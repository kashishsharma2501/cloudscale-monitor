import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API = 'http://localhost:5001';

function ServerCard({ id, status, cpu }) {
  const colors = { running:'#10b981', provisioning:'#f59e0b', stopping:'#ef4444', stopped:'#334155' };
  const glows = { running:'0 0 30px rgba(16,185,129,0.4)', provisioning:'0 0 30px rgba(245,158,11,0.4)', stopping:'0 0 30px rgba(239,68,68,0.4)', stopped:'none' };
  return (
    <div style={{
      background: status==='stopped' ? 'rgba(30,30,50,0.4)' : 'rgba(124,58,237,0.12)',
      border: `2px solid ${colors[status]}`, borderRadius:'16px', padding:'24px', textAlign:'center',
      transition:'all 0.6s cubic-bezier(0.34,1.56,0.64,1)',
      boxShadow: glows[status], opacity: status==='stopped' ? 0.35 : 1, position:'relative', overflow:'hidden'
    }}>
      <div style={{fontSize:'2.5rem', marginBottom:'10px', filter: status==='stopped'?'grayscale(1)':'none',
        animation: status==='running'?'serverPulse 3s ease-in-out infinite':'none'}}>🖥️</div>
      <div style={{fontFamily:'Orbitron,sans-serif', fontWeight:700, color:colors[status], fontSize:'0.95rem', marginBottom:'6px'}}>
        Server {id}
      </div>
      <div style={{display:'inline-flex', alignItems:'center', gap:'6px', background:`${colors[status]}22`, borderRadius:'50px', padding:'4px 12px', marginBottom:'10px'}}>
        <span style={{width:'6px', height:'6px', borderRadius:'50%', background:colors[status],
          animation: status==='running'?'pulse 2s infinite':'none', display:'inline-block'}}/>
        <span style={{color:colors[status], fontSize:'0.75rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'1px'}}>{status}</span>
      </div>
      {status !== 'stopped' && (
        <div style={{marginTop:'8px'}}>
          <div style={{color:'#64748b', fontSize:'0.7rem', marginBottom:'4px'}}>CPU</div>
          <div style={{background:'rgba(0,0,0,0.3)', borderRadius:'50px', height:'6px', overflow:'hidden'}}>
            <div style={{width:`${cpu}%`, height:'100%', background:`linear-gradient(90deg,${colors[status]},${colors[status]}88)`,
              borderRadius:'50px', transition:'width 1s ease'}}/>
          </div>
          <div style={{color:colors[status], fontSize:'0.8rem', fontWeight:700, marginTop:'4px'}}>{cpu}%</div>
        </div>
      )}
    </div>
  );
}

export default function Scaling() {
  const [metrics, setMetrics] = useState({ runningTasks:1, desiredTasks:1, cpu:0, memory:0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState([]);
  const [scaleMsg, setScaleMsg] = useState('');

  const addLog = (msg, type='info') =>
    setLog(p => [{time: new Date().toLocaleTimeString('en-IN'), msg, type}, ...p.slice(0,7)]);

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${API}/api/metrics`);
      const data = await res.json();
      setMetrics(data);
      setHistory(p => [...p.slice(-20), {
        time: new Date().toLocaleTimeString('en-IN'),
        cpu: data.cpu, tasks: data.runningTasks
      }]);
    } catch {}
  };

  useEffect(() => {
    fetchMetrics();
    const t = setInterval(fetchMetrics, 5000);
    return () => clearInterval(t);
  }, []);

  const scaleService = async (count) => {
    setLoading(true);
    setScaleMsg('');
    try {
      const res = await fetch(`${API}/api/scale`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ desired: count })
      });
      const data = await res.json();
      if(data.status === 'success') {
        addLog(`✅ Scaled to ${count} tasks — AWS ECS updating...`, 'success');
        setScaleMsg(`✅ Scaling to ${count} tasks triggered on AWS ECS`);
        setTimeout(fetchMetrics, 3000);
      } else {
        addLog(`❌ Scale failed: ${data.error}`, 'error');
        setScaleMsg(`❌ Error: ${data.error}`);
      }
    } catch {
      addLog('❌ Backend not reachable', 'error');
    }
    setLoading(false);
  };

  const runLoadTest = async () => {
    addLog('🔥 Load test started — sending requests to spike CPU', 'warning');
    try {
      await fetch(`${API}/api/load-test`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ url:'http://13.232.42.69:5000', requests:50000, concurrency:200, duration:60 })
      });
      addLog('📈 Requests firing — watch CPU rise in 2-3 min', 'info');
    } catch { addLog('❌ Load test failed', 'error'); }
  };

  // Build server cards from real task count
  const servers = [1,2,3].map(i => ({
    id: i,
    status: i <= metrics.runningTasks ? 'running' : 'stopped',
    cpu: i <= metrics.runningTasks ? parseFloat((metrics.cpu / metrics.runningTasks).toFixed(1)) : 0
  }));

  const cpuColor = metrics.cpu > 60 ? '#ef4444' : metrics.cpu > 40 ? '#f59e0b' : '#10b981';

  return (
    <div style={{padding:'40px 24px', maxWidth:'1200px', margin:'0 auto'}}>
      <style>{`
        @keyframes serverPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.4)}}
        @keyframes logSlide{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
      `}</style>

      {/* Header */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'16px', marginBottom:'36px'}}>
        <div>
          <h1 style={{fontFamily:'Orbitron,sans-serif', color:'#a855f7', fontSize:'1.8rem', marginBottom:'6px'}}>⚖️ Auto Scaling</h1>
          <p style={{color:'#64748b'}}>Real AWS ECS task management — live from ap-south-1</p>
        </div>
        <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
          <button onClick={runLoadTest} style={{background:'linear-gradient(135deg,#dc2626,#ef4444)', border:'none', borderRadius:'12px', padding:'12px 24px', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:'0.9rem', boxShadow:'0 8px 25px rgba(239,68,68,0.4)'}}>
            🔥 Start Load Test
          </button>
          {[1,2,3].map(n => (
            <button key={n} onClick={() => scaleService(n)} disabled={loading || metrics.desiredTasks===n}
              style={{background: metrics.desiredTasks===n ? 'rgba(168,85,247,0.4)' : 'rgba(124,58,237,0.2)',
                border:`1px solid ${metrics.desiredTasks===n ? '#a855f7' : 'rgba(168,85,247,0.3)'}`,
                borderRadius:'12px', padding:'12px 20px', color: metrics.desiredTasks===n ? '#a855f7' : '#94a3b8',
                fontWeight:700, cursor: loading ? 'not-allowed':'pointer', fontSize:'0.9rem', transition:'all 0.3s'}}>
              {n} Task{n>1?'s':''}
            </button>
          ))}
        </div>
      </div>

      {scaleMsg && (
        <div style={{background: scaleMsg.includes('✅') ? 'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)',
          border:`1px solid ${scaleMsg.includes('✅')?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.3)'}`,
          borderRadius:'12px', padding:'14px 20px', marginBottom:'24px',
          color: scaleMsg.includes('✅')?'#10b981':'#ef4444', fontWeight:600}}>
          {scaleMsg}
        </div>
      )}

      {/* Stats */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'16px', marginBottom:'28px'}}>
        {[
          {label:'Running Tasks', value:metrics.runningTasks, color:'#10b981'},
          {label:'Desired Tasks', value:metrics.desiredTasks, color:'#a855f7'},
          {label:'Min Replicas', value:1, color:'#06b6d4'},
          {label:'Max Replicas', value:3, color:'#f59e0b'},
          {label:'CPU Load', value:`${metrics.cpu}%`, color:cpuColor},
        ].map(s => (
          <div key={s.label} style={{background:'rgba(124,58,237,0.1)', border:'1px solid rgba(168,85,247,0.2)', borderRadius:'16px', padding:'20px', textAlign:'center'}}>
            <div style={{color:'#64748b', fontSize:'0.72rem', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'1px'}}>{s.label}</div>
            <div style={{fontSize:'2rem', fontWeight:900, color:s.color, fontFamily:'Orbitron,sans-serif'}}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Server Cards */}
      <div style={{background:'rgba(124,58,237,0.07)', border:'1px solid rgba(168,85,247,0.15)', borderRadius:'20px', padding:'28px', marginBottom:'24px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
          <h3 style={{color:'#a855f7', fontFamily:'Orbitron,sans-serif', fontSize:'0.95rem'}}>🖥️ ECS Task Fleet — Real AWS</h3>
          <span style={{color:'#64748b', fontSize:'0.8rem'}}>{metrics.runningTasks}/3 tasks running</span>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px'}}>
          {servers.map(s => <ServerCard key={s.id} {...s}/>)}
        </div>
      </div>

      {/* Chart + Log */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 320px', gap:'20px'}}>
        <div style={{background:'rgba(124,58,237,0.07)', border:'1px solid rgba(168,85,247,0.15)', borderRadius:'20px', padding:'24px'}}>
          <h3 style={{color:'#a855f7', marginBottom:'16px', fontFamily:'Orbitron,sans-serif', fontSize:'0.9rem'}}>📈 CPU & Task History</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="cpuG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(168,85,247,0.08)"/>
              <XAxis dataKey="time" stroke="#334155" tick={{fontSize:9, fill:'#64748b'}}/>
              <YAxis stroke="#334155" tick={{fontSize:9, fill:'#64748b'}} domain={[0,100]}/>
              <Tooltip contentStyle={{background:'#0f0c29', border:'1px solid #a855f7', borderRadius:'8px', color:'#fff', fontSize:'0.8rem'}}/>
              <Area type="monotone" dataKey="cpu" stroke="#a855f7" fill="url(#cpuG)" strokeWidth={2} dot={false} name="CPU %"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{background:'rgba(124,58,237,0.07)', border:'1px solid rgba(168,85,247,0.15)', borderRadius:'20px', padding:'24px'}}>
          <h3 style={{color:'#a855f7', marginBottom:'16px', fontFamily:'Orbitron,sans-serif', fontSize:'0.9rem'}}>📋 Event Log</h3>
          {log.length===0 && <div style={{color:'#334155', fontSize:'0.85rem', textAlign:'center', marginTop:'40px'}}>Scale karo ya load test chalaao</div>}
          {log.map((l,i) => {
            const c = {info:'#06b6d4', warning:'#f59e0b', success:'#10b981', error:'#ef4444'}[l.type];
            return (
              <div key={i} style={{borderLeft:`3px solid ${c}`, paddingLeft:'12px', marginBottom:'14px', animation:'logSlide 0.4s ease'}}>
                <div style={{color:'#475569', fontSize:'0.7rem'}}>{l.time}</div>
                <div style={{color:c, fontSize:'0.82rem', fontWeight:600, lineHeight:1.4}}>{l.msg}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
