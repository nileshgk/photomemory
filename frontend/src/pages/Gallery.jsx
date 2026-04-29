/**
 * PHOTOMEMORY PRO - DYNAMIC GUEST GALLERY
 * ---------------------------------------------------------
 * PURPOSE: Displays biometric-matched photos to the authenticated guest.
 * UI PATTERN: Implementation of "Skeleton Screens" and "Conditional Watermarking."
 */

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * DATA HYDRATION:
   * On component mount, we retrieve the JWT from localStorage and request 
   * matched photos. The backend handles the AI-filtering logic.
   */
  useEffect(() => {
    const fetchPhotos = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/photos/me`, {
          // JWT is passed here to identify the user biometrically on the server
          headers: { Authorization: `Bearer ${token}` }
        });
        setPhotos(res.data);
      } catch (err) {
        console.error("Authorization check failed - Session likely expired.");
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, []);

  return (
    <div className="min-h-screen bg-brand-zinc-950 text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER: High-contrast typography with custom 'text-stroke' from index.css */}
        <header className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-zinc-800 pb-8">
          <div>
            <h1 className="text-6xl font-black italic uppercase tracking-tighter">
              Captured <span className="text-red-600 text-stroke">View</span>
            </h1>
            <p className="text-zinc-500 font-mono text-xs mt-2 tracking-widest uppercase">
              AI-IDENTIFIED MATCHES: {photos.length} // SESSION: SECURE
            </p>
          </div>
          
          {/* SESSION MANAGEMENT: Simple logout by clearing the JWT */}
          <button 
            onClick={() => {localStorage.clear(); window.location.reload();}} 
            className="mt-4 md:mt-0 px-6 py-2 border border-zinc-800 text-[10px] font-bold tracking-widest hover:bg-red-600 hover:border-red-600 transition-all uppercase"
          >
            Terminate Session
          </button>
        </header>

        {/* LOADING STATE: Uses the 'shimmer' animation defined in index.css */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-square bg-zinc-900 shimmer rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {photos.map(photo => (
              <div key={photo.id} className="relative group bg-zinc-900 overflow-hidden border border-zinc-800 hover:border-red-600 transition-all duration-500">
                
                {/* IMAGE RENDERING: Grayscale by default, transitions to color on hover */}
                <img 
                  src={photo.url} 
                  className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition duration-700 ease-in-out" 
                  alt="Matched Moment"
                />

                {/* PAY-TO-UNLOCK OVERLAY: Only shows if 'hasPaid' is false */}
                {!photo.hasPaid && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-[10px] font-black tracking-[0.3em] mb-4 text-zinc-400">ENCRYPTED PREVIEW</p>
                    <button className="bg-white text-black px-8 py-3 font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
                      Unlock Moment
                    </button>
                  </div>
                )}

                {/* METADATA: Styled with low opacity to match the Operator aesthetic */}
                <div className="absolute bottom-4 left-4 opacity-30 text-[9px] font-mono uppercase tracking-tighter">
                  ID: {photo.id.toString().padStart(6, '0')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
