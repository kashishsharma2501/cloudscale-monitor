import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Monitoring from './pages/Monitoring';
import Scaling from './pages/Scaling';
import Alerts from './pages/Alerts';
import CICD from './pages/CICD';
import './index.css';

function App() {
  return (
    <Router>
      <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0a0015 0%,#1a0035 50%,#0a0015 100%)'}}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/scaling" element={<Scaling />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/cicd" element={<CICD />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
