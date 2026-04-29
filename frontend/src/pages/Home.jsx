/**
 * PHOTOMEMORY PRO - CENTRAL GATEWAY
 * ---------------------------------------------------------
 * PURPOSE: Primary landing page to bifurcate traffic between 
 * Photographers (Operators) and Guests (Entities).
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  const [eventCode, setEventCode] = useState('');
  const navigate = useNavigate();

  const handleGuestEntry = () => {
    if (!eventCode) return;
    /**
     * LOGIC SHIFT: Instead of going directly to the gallery, 
     * we save the eventCode to sessionStorage and send them to Register.
     * This ensures they enroll their face before seeing photos.
     */
    sessionStorage.setItem('pendingEventCode', eventCode.toUpperCase());
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-brand-zinc-950 text-white flex flex-col items-center justify-center p-6">
      
      {/* HERO SECTION: High-impact minimalist branding */}
      <div className="text-center mb-16">
        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter text-stroke uppercase animate-pulse-slow">
          Photo<span className="text-red-600">Memory</span>
        </h1>
        <p className="text-zinc-500 font-mono text-xs md:text-sm tracking-[0.3em] uppercase mt-4">
          Instant Biometric Asset Distribution // Ver 1.0
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        
        {/* OPERATOR ACCESS: For Photographers */}
        <Link 
          to="/upload" 
          className="glass-panel p-10 flex flex-col items-center justify-center border border-zinc-800 hover:border-red-600 transition-all group"
        >
          <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">📸</div>
          <h2 className="text-xl font-black uppercase tracking-widest">Operator</h2>
          <p className="text-[10px] text-zinc-500 mt-2 text-center uppercase">Upload Assets & Manage Event QR</p>
        </Link>

        {/* ENTITY ACCESS: For Guests */}
        <div className="glass-panel p-10 border border-zinc-800 flex flex-col items-center justify-center">
          <div className="text-3xl mb-4">👤</div>
          <h2 className="text-xl font-black uppercase tracking-widest mb-6">Guest</h2>
          
          <div className="flex w-full gap-2">
            <input 
              type="text" 
              placeholder="EVENT CODE" 
              className="flex-1 bg-zinc-900 border border-zinc-800 p-3 text-xs focus:border-red-600 outline-none uppercase font-bold tracking-widest"
              value={eventCode}
              onChange={(e) => setEventCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGuestEntry()}
            />
            <button 
              onClick={handleGuestEntry}
              className="bg-red-600 px-6 py-3 font-black text-xs hover:bg-red-700 transition-all active:scale-95"
            >
              FIND
            </button>
          </div>
          <p className="text-[9px] text-zinc-600 mt-4 uppercase font-bold tracking-tighter">
            Face enrollment required for identity matching
          </p>
        </div>

      </div>

      {/* SYSTEM STATUS FOOTER */}
      <footer className="fixed bottom-8 w-full px-12 flex justify-between items-center opacity-30">
        <div className="flex gap-4 items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-mono tracking-widest uppercase">System: Operational</span>
        </div>
        <span className="text-[10px] font-mono tracking-widest uppercase">© 2026 PM_PRO_CORE</span>
      </footer>

    </div>
  );
}
