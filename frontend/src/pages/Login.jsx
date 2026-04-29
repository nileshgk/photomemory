/**
 * PHOTOMEMORY PRO - SECURE ACCESS GATEWAY
 * ---------------------------------------------------------
 * PURPOSE: Authenticates existing users and manages JWT session tokens.
 * SECURITY: Uses local storage for token persistence; triggers navigate 
 * to protected routes upon successful auth.
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * AUTHENTICATION HANDLER
   * Sends credentials to the backend /login endpoint.
   * On success, saves the JWT to local storage for use in the Gallery.
   */
  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password });
      
      // DEVOPS NOTE: Securely store the token for Authorization headers
      localStorage.setItem('token', res.data.token);
      
      // Redirect to the biometric-matched gallery
      navigate('/gallery');
    } catch (err) {
      // Generalizing error messages for security (prevents account harvesting)
      alert("Authorization failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-zinc-950 text-white flex flex-col items-center justify-center p-4">
      {/* GLASS PANEL: Utilizes the backdrop-blur utility defined in index.css 
         to create a frosted-glass effect over the deep zinc background.
      */}
      <div className="w-full max-w-sm p-10 glass-panel rounded-2xl shadow-2xl border border-zinc-800">
        
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">
            System <span className="text-red-600">Access</span>
          </h2>
          <p className="text-[10px] text-zinc-500 font-mono tracking-widest mt-1 uppercase">
            Secure Biometric Gateway
          </p>
        </div>

        <div className="space-y-4">
          {/* Identity Email Input */}
          <input 
            type="email" 
            placeholder="IDENTITY EMAIL" 
            className="w-full bg-zinc-900/50 border border-zinc-800 p-4 text-sm focus:outline-none focus:border-red-600 transition-all font-bold tracking-wider" 
            onChange={e => setEmail(e.target.value)} 
          />
          
          {/* Access Key (Password) Input */}
          <input 
            type="password" 
            placeholder="ACCESS KEY" 
            className="w-full bg-zinc-900/50 border border-zinc-800 p-4 text-sm focus:outline-none focus:border-red-600 transition-all font-bold tracking-wider" 
            onChange={e => setPassword(e.target.value)} 
          />
        </div>

        {/* INTERACTION: The button switches from white-on-black to red-on-white 
           to signify active authorization state.
        */}
        <button 
          onClick={handleLogin} 
          disabled={loading}
          className="w-full bg-white text-black mt-8 py-4 font-black hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest active:scale-95"
        >
          {loading ? 'AUTHORIZING...' : 'VERIFY IDENTITY'}
        </button>

        <p className="mt-8 text-center text-zinc-600 text-[10px] font-bold tracking-widest uppercase">
          New Entity? <Link to="/register" className="text-red-600 hover:underline">Enroll Face</Link>
        </p>
      </div>

      {/* Decorative Branding with text-stroke utility from index.css */}
      <footer className="mt-12 opacity-10 pointer-events-none">
        <h2 className="text-5xl font-black italic text-stroke uppercase">PhotoMemory</h2>
      </footer>
    </div>
  );
};

export default Login;
