import React, { useState, useEffect } from 'react';

function AnimatedBg() {
  const particles = Array.from({length: 30}, (_, i) => i);
  return (
    <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:0,overflow:'hidden'}}>
      {particles.map(i => (
        <div key={i} style={{
          position:'absolute',
          width: Math.random()*4+1+'px',
          height: Math.random()*4+1+'px',
          background:'rgba(168,85,247,0.4)',
          borderRadius:'50%',
          left: Math.random()*100+'%',
          top: Math.random()*100+'%',
          animation: `float ${Math.random()*10+8}s ease-in-out infinite`,
          animationDelay: Math.random()*5+'s',
        }}/>
      ))}
    </div>
  );
}

function MetricCard({ value, label, color, icon, suffix='' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const target = parseFloat(value);
    if(isNaN(target)) { setDisplay(value); return; }
    let start = 0;
    const step = target / 40;
    const t = setInterval(() => {
      start += step;
      if(start >= target) { setDisplay(value); clearInterval(t); }
      else setDisplay(Math.floor(start)+suffix);
    }, 30);
    return () => clearInterval(t);
  }, [value, suffix]);

  return (
    <div style={{
      background:'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(6,182,212,0.05))',
      border:'1px solid rgba(168,85,247,0.25)',
      borderRadius:'20px', padding:'28px', textAlign:'center',
      transition:'all 0.3s', cursor:'default', position:'relative', overflow:'hidden'
    }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow=`0 20px 40px rgba(124,58,237,0.3)`; }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}>
      <div style={{position:'absolute',top:0,right:0,width:'80px',height:'80px',background:`radial-gradient(circle,${color}22,transparent)`,borderRadius:'0 20px 0 80px'}}/>
      <div style={{fontSize:'2.2rem',marginBottom:'10px'}}>{icon}</div>
      <div style={{fontSize:'2.8rem',fontWeight:900,color,fontFamily:'Orbitron,sans-serif',letterSpacing:'2px'}}>{display}</div>
      <div style={{color:'#94a3b8',fontSize:'0.85rem',marginTop:'8px',textTransform:'uppercase',letterSpacing:'1px'}}>{label}</div>
    </div>
  );
}

export default function Home() {
  const [time, setTime] = useState(new Date());
  const [ping, setPing] = useState(12);

  useEffect(() => {
    const t1 = setInterval(() => setTime(new Date()), 1000);
    const t2 = setInterval(() => setPing(Math.floor(Math.random()*20+8)), 3000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  return (
    <div style={{minHeight:'100vh',position:'relative'}}>
      <AnimatedBg/>
      <div style={{position:'relative',zIndex:1,padding:'50px 24px',maxWidth:'1200px',margin:'0 auto'}}>

        {/* Hero */}
        <div style={{textAlign:'center',marginBottom:'70px'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'rgba(168,85,247,0.1)',border:'1px solid rgba(168,85,247,0.3)',borderRadius:'50px',padding:'6px 18px',marginBottom:'24px',fontSize:'0.8rem',color:'#a855f7',letterSpacing:'2px',textTransform:'uppercase'}}>
            ⚡ Cloud Infrastructure Platform
          </div>
          <h1 style={{fontSize:'clamp(2.2rem,5vw,4rem)',fontWeight:900,fontFamily:'Orbitron,sans-serif',background:'linear-gradient(135deg,#a855f7 0%,#06b6d4 50%,#a855f7 100%)',backgroundSize:'200%',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',lineHeight:1.15,marginBottom:'20px',animation:'gradientShift 4s linear infinite'}}>
            CloudScale Monitor
          </h1>
          <p style={{color:'#94a3b8',fontSize:'1.1rem',maxWidth:'580px',margin:'0 auto 32px',lineHeight:1.7}}>
            Intelligent auto-scaling infrastructure with real-time observability, powered by AWS ECS & CloudWatch
          </p>
          <div style={{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'50px',padding:'10px 24px'}}>
              <span style={{width:'8px',height:'8px',borderRadius:'50%',background:'#10b981',boxShadow:'0 0 10px #10b981',display:'inline-block',animation:'pulse 2s infinite'}}></span>
              <span style={{color:'#10b981',fontWeight:600,fontSize:'0.9rem'}}>All Systems Operational</span>
            </div>
            <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'rgba(6,182,212,0.1)',border:'1px solid rgba(6,182,212,0.3)',borderRadius:'50px',padding:'10px 24px'}}>
              <span style={{color:'#06b6d4',fontWeight:600,fontSize:'0.9rem'}}>🌐 Ping: {ping}ms</span>
            </div>
          </div>
          <div style={{color:'#475569',fontSize:'0.8rem',marginTop:'16px'}}>{time.toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})} IST</div>
        </div>

        {/* Metric Cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'20px',marginBottom:'60px'}}>
          <MetricCard value="3" suffix="" label="Max Replicas" color="#a855f7" icon="⚡"/>
          <MetricCard value="60" suffix="%" label="Scale Threshold" color="#06b6d4" icon="🎯"/>
          <MetricCard value="99.9" suffix="%" label="Uptime SLA" color="#10b981" icon="✅"/>
          <MetricCard value="358" suffix="" label="Req / sec" color="#f59e0b" icon="🚀"/>
        </div>

        {/* Feature Cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:'20px',marginBottom:'50px'}}>
          {[
            {icon:'📊',title:'Real-time Monitoring',desc:'Live CPU and memory metrics from AWS CloudWatch with automatic refresh every 3 seconds',color:'#a855f7'},
            {icon:'⚖️',title:'Auto Scaling',desc:'Dynamically provisions containers from 1→3 replicas using Target Tracking policy on CPU load',color:'#06b6d4'},
            {icon:'🔔',title:'Instant Alerts',desc:'Proactive SNS email notifications triggered when CPU breaches the 60% threshold',color:'#10b981'},
            {icon:'🐳',title:'Containerized',desc:'Fully Dockerized microservice on AWS Fargate — zero server management, pure serverless',color:'#f59e0b'},
          ].map(f => (
            <div key={f.title} style={{
              background:'rgba(124,58,237,0.07)',
              border:'1px solid rgba(168,85,247,0.12)',
              borderRadius:'20px', padding:'28px', transition:'all 0.3s',
              borderTop:`3px solid ${f.color}44`
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=f.color+'66'; e.currentTarget.style.background='rgba(124,58,237,0.13)'; e.currentTarget.style.transform='translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(168,85,247,0.12)'; e.currentTarget.style.background='rgba(124,58,237,0.07)'; e.currentTarget.style.transform='translateY(0)'; }}>
              <div style={{fontSize:'2rem',marginBottom:'14px'}}>{f.icon}</div>
              <h3 style={{color:f.color,marginBottom:'10px',fontWeight:700,fontSize:'1.05rem'}}>{f.title}</h3>
              <p style={{color:'#64748b',fontSize:'0.88rem',lineHeight:1.7}}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Infra Table */}
        <div style={{background:'rgba(124,58,237,0.07)',border:'1px solid rgba(168,85,247,0.15)',borderRadius:'20px',padding:'32px'}}>
          <h3 style={{color:'#a855f7',marginBottom:'24px',fontFamily:'Orbitron,sans-serif',fontSize:'0.95rem',letterSpacing:'1px'}}>⚙️ Infrastructure Stack</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'14px'}}>
            {[
              {k:'Region',v:'ap-south-1 — Mumbai'},
              {k:'Compute',v:'AWS Fargate (Serverless)'},
              {k:'Orchestration',v:'Amazon ECS'},
              {k:'Load Balancer',v:'Application Load Balancer'},
              {k:'Scaling Policy',v:'Target Tracking — CPU'},
              {k:'Monitoring',v:'AWS CloudWatch'},
              {k:'Alerts',v:'AWS SNS'},
              {k:'Container Registry',v:'Amazon ECR'},
            ].map(i => (
              <div key={i.k} style={{background:'rgba(124,58,237,0.08)',borderRadius:'12px',padding:'14px 18px',borderLeft:'3px solid rgba(168,85,247,0.4)'}}>
                <div style={{color:'#475569',fontSize:'0.72rem',marginBottom:'4px',textTransform:'uppercase',letterSpacing:'1.5px'}}>{i.k}</div>
                <div style={{color:'#e2e8f0',fontWeight:600,fontSize:'0.9rem'}}>{i.v}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
      <style>{`
        @keyframes gradientShift { 0%{background-position:0%} 100%{background-position:200%} }
        @keyframes float { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-20px) scale(1.1)} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
      `}</style>
    </div>
  );
}
