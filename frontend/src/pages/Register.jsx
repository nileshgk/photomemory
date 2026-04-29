/**
 * PHOTOMEMORY PRO - BIOMETRIC ENROLLMENT COMPONENT
 * ---------------------------------------------------------
 * PURPOSE: Captures user metadata and a live facial sample.
 * TECHNOLOGY: MediaDevices API + Canvas HTML5 + AWS Rekognition.
 */

import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  // 1. HARDWARE INITIALIZATION
  // Requests access to the user's front-facing camera on component mount.
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      })
      .catch(err => {
        console.error("Camera access denied:", err);
        setCameraActive(false);
      });
  }, []);

  // 2. BIOMETRIC CAPTURE & SUBMISSION
  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.fullName) {
      alert("All identity fields are required.");
      return;
    }

    setLoading(true);
    try {
      /**
       * CANVAS SNAPSHOT:
       * Since we can't send a live stream to the backend, we draw 
       * the current video frame onto a hidden canvas and export it 
       * as a Base64 string for AWS Rekognition.
       */
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      
      // Export as JPEG with 80% quality to balance speed and AI accuracy
      const selfieBase64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        ...formData,
        selfieBase64
      });

      navigate('/login');
    } catch (err) {
      console.error("Registration Error:", err);
      alert("AI Face Indexing failed. Ensure your face is clearly lit and centered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-zinc-950 text-white flex flex-col items-center justify-center p-4">
      {/* Container with custom glassmorphism effect defined in index.css */}
      <div className="w-full max-w-md space-y-8 glass-panel p-8 rounded-2xl border border-zinc-800">
        <header className="text-center">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">
            Establish <span className="text-red-600">Identity</span>
          </h1>
          <p className="text-zinc-500 text-xs font-mono tracking-widest uppercase">
            Biometric Enrollment v1.0
          </p>
        </header>
        
        {/* CAMERA VIEWPORT */}
        <div className="relative mx-auto w-64 h-64 overflow-hidden rounded-full border-4 border-zinc-800 shadow-[0_0_30px_rgba(255,0,0,0.1)]">
          {cameraActive ? (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                className="w-full h-full object-cover grayscale brightness-110" 
              />
              {/* LASER SCAN: Pure CSS animation to indicate AI activity */}
              <div className="scan-line"></div> 
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600 text-xs text-center p-4">
              PERMIT CAMERA ACCESS TO CONTINUE
            </div>
          )}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600/20 text-red-500 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest animate-pulse border border-red-600/30">
            ENCRYPTED LINK
          </div>
        </div>

        {/* INPUT FIELDS: Utilizing Zinc-900 palette for high-contrast dark mode */}
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="FULL NAME" 
            className="w-full bg-zinc-900/50 border border-zinc-800 p-4 text-sm focus:outline-none focus:border-red-600 transition-all uppercase font-bold tracking-wider" 
            onChange={e => setFormData({...formData, fullName: e.target.value})} 
          />
          <input 
            type="email" 
            placeholder="EMAIL ADDRESS" 
            className="w-full bg-zinc-900/50 border border-zinc-800 p-4 text-sm focus:outline-none focus:border-red-600 transition-all font-bold tracking-wider" 
            onChange={e => setFormData({...formData, email: e.target.value})} 
          />
          <input 
            type="password" 
            placeholder="PASSWORD" 
            className="w-full bg-zinc-900/50 border border-zinc-800 p-4 text-sm focus:outline-none focus:border-red-600 transition-all font-bold tracking-wider" 
            onChange={e => setFormData({...formData, password: e.target.value})} 
          />
        </div>

        <button 
          onClick={handleRegister} 
          disabled={loading || !cameraActive}
          className={`w-full py-4 font-black transition-all uppercase tracking-[0.2em] shadow-lg ${
            loading ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white active:scale-95'
          }`}
        >
          {loading ? 'INDEXING...' : 'INITIALIZE PROFILE'}
        </button>

        <p className="text-center text-zinc-600 text-[10px] tracking-widest uppercase font-bold">
          Already Enrolled? <Link to="/login" className="text-white hover:text-red-600 transition-colors">Authorize Here</Link>
        </p>
      </div>
      
      <footer className="mt-8 opacity-20 pointer-events-none">
        <h2 className="text-6xl font-black italic text-stroke">PHOTOMEMORY</h2>
      </footer>
    </div>
  );
};

export default Register;
