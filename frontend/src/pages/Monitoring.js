import React, { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const API = 'http://localhost:5001';

export default function Monitoring() {
  const [metrics, setMetrics] = useState({ cpu: 0, memory: 0, runningTasks: 1, desiredTasks: 1 });
  const [cpuHistory, setCpuHistory] = useState([]);
  const [memHistory, setMemHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadTest, setLoadTest] = useState({ running: false, url: 'http://13.232.42.69:5000', requests: 10000, concurrency: 100, duration: 30 });
  const [loadMsg, setLoadMsg] = useState('');

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${API}/api/metrics`);
      const data = await res.json();
      setMetrics(data);
      const t = new Date().toLocaleTimeString('en-IN');
      setCpuHistory(p => [...p.slice(-20), { time: t, value: data.cpu }]);
      setMemHistory(p => [...p.slice(-20), { time: t, value: data.memory }]);
      setLoading(false);
    } catch { setLoading(false); }
  };

  useEffect(() => {
    fetchMetrics();
    const t = setInterval(fetchMetrics, 5000);
    return () => clearInterval(t);
  }, []);

  const startLoadTest = async () => {
    setLoadTest(p => ({ ...p, running: true }));
    setLoadMsg('');
    try {
      const res = await fetch(`${API}/api/load-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: loadTest.url, requests: loadTest.requests, concurrency: loadTest.concurrency, duration: loadTest.duration })
      });
      const data = await res.json();
      setLoadMsg(`✅ Load test started — ${data.requests} requests @ ${data.concurrency} concurrency on ${data.target}`);
    } catch { setLoadMsg('❌ Backend not reachable'); }
    setTimeout(() => setLoadTest(p => ({ ...p, running: false })), loadTest.duration * 1000);
  };

  const cpuColor = metrics.cpu > 60 ? '#ef4444' : metrics.cpu > 40 ? '#f59e0b' : '#10b981';

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'Orbitron,sans-serif', color: '#a855f7', fontSize: '1.8rem', marginBottom: '6px' }}>📊 Live Monitoring</h1>
          <p style={{ color: '#64748b' }}>Real-time metrics from AWS CloudWatch — auto refresh every 5s</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: loading ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', border: `1px solid ${loading ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`, borderRadius: '50px', padding: '8px 20px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: loading ? '#f59e0b' : '#10b981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ color: loading ? '#f59e0b' : '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>{loading ? 'Connecting...' : 'AWS CloudWatch Live'}</span>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px', marginBottom: '32px' }}>
        {[
          { label: 'CPU Usage', value: metrics.cpu, unit: '%', color: cpuColor, icon: '⚡' },
          { label: 'Memory Usage', value: metrics.memory, unit: '%', color: '#06b6d4', icon: '💾' },
          { label: 'Running Tasks', value: metrics.runningTasks, unit: '', color: '#10b981', icon: '🖥️' },
          { label: 'Desired Tasks', value: metrics.desiredTasks, unit: '', color: '#a855f7', icon: '🎯' },
        ].map(m => (
          <div key={m.label} style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '16px', padding: '24px', textAlign: 'center', transition: 'all 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 30px ${m.color}33`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{m.icon}</div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{m.label}</div>
            <div style={{ fontSize: '2.8rem', fontWeight: 700, color: m.color, fontFamily: 'Orbitron,sans-serif' }}>{m.value}{m.unit}</div>
          </div>
        ))}
      </div>

      {/* CPU Chart */}
      <div style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ color: '#a855f7', marginBottom: '20px', fontFamily: 'Orbitron,sans-serif', fontSize: '1rem' }}>⚡ CPU Utilization % — AWS CloudWatch</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={cpuHistory}>
            <defs>
              <linearGradient id="cpuG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(168,85,247,0.1)" />
            <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 9, fill: '#64748b' }} />
            <YAxis stroke="#475569" tick={{ fontSize: 9, fill: '#64748b' }} domain={[0, 100]} />
            <Tooltip contentStyle={{ background: '#0f0c29', border: '1px solid #a855f7', borderRadius: '8px', color: '#fff', fontSize: '0.8rem' }} />
            <Area type="monotone" dataKey="value" stroke="#a855f7" fill="url(#cpuG)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Memory Chart */}
      <div style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ color: '#06b6d4', marginBottom: '20px', fontFamily: 'Orbitron,sans-serif', fontSize: '1rem' }}>💾 Memory Utilization % — AWS CloudWatch</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={memHistory}>
            <defs>
              <linearGradient id="memG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.1)" />
            <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 9, fill: '#64748b' }} />
            <YAxis stroke="#475569" tick={{ fontSize: 9, fill: '#64748b' }} domain={[0, 100]} />
            <Tooltip contentStyle={{ background: '#0f0c29', border: '1px solid #06b6d4', borderRadius: '8px', color: '#fff', fontSize: '0.8rem' }} />
            <Area type="monotone" dataKey="value" stroke="#06b6d4" fill="url(#memG)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Load Test Panel */}
      <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px', padding: '28px' }}>
        <h3 style={{ color: '#ef4444', marginBottom: '6px', fontFamily: 'Orbitron,sans-serif', fontSize: '1rem' }}>🔥 Load Test — Trigger Auto Scaling</h3>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '20px' }}>Send real HTTP requests to spike CPU and trigger AWS Auto Scaling</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px', marginBottom: '20px' }}>
          {[
            { label: 'Target URL', key: 'url', type: 'text' },
            { label: 'Total Requests', key: 'requests', type: 'number' },
            { label: 'Concurrency', key: 'concurrency', type: 'number' },
            { label: 'Duration (sec)', key: 'duration', type: 'number' },
          ].map(f => (
            <div key={f.key}>
              <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>{f.label}</div>
              <input
                type={f.type}
                value={loadTest[f.key]}
                onChange={e => setLoadTest(p => ({ ...p, [f.key]: e.target.value }))}
                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#e2e8f0', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          ))}
        </div>
        <button onClick={loadTest.running ? undefined : startLoadTest} style={{
          background: loadTest.running ? 'rgba(100,116,139,0.3)' : 'linear-gradient(135deg,#dc2626,#ef4444)',
          border: 'none', borderRadius: '12px', padding: '14px 36px', color: '#fff', fontWeight: 700,
          cursor: loadTest.running ? 'not-allowed' : 'pointer', fontSize: '1rem',
          boxShadow: loadTest.running ? 'none' : '0 8px 25px rgba(239,68,68,0.4)', transition: 'all 0.3s'
        }}>
          {loadTest.running ? '⏳ Test Running...' : '🔥 Start Load Test'}
        </button>
        {loadMsg && <div style={{ marginTop: '14px', color: loadMsg.includes('✅') ? '#10b981' : '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>{loadMsg}</div>}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
