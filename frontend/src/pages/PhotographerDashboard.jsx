/**
 * PHOTOMEMORY PRO - PHOTOGRAPHER OPERATIONS CONSOLE
 * ---------------------------------------------------------
 * PURPOSE: Event management and bulk asset ingestion.
 * ARCHITECTURE: Implements client-side direct-to-S3 uploads to offload 
 * server bandwidth and improve scalability.
 */

import React, { useState } from 'react';
import axios from 'axios';

export default function PhotographerDashboard() {
    const [eventCode, setEventCode] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [loading, setLoading] = useState(false);

    /**
     * QR GENERATION
     * Hits the backend to generate a Base64 QR code string. 
     * This QR points guests to the application with the eventCode pre-filled.
     */
    const generateQR = async () => {
        if (!eventCode) return;
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/generate-qr/${eventCode}`);
            setQrCode(data.qrData);
        } catch (err) {
            console.error("QR Generation failed:", err);
            alert("Error generating QR");
        }
    };

    /**
     * MULTI-STAGE UPLOAD HANDLER
     * 1. Requests a 'Presigned URL' from the backend for each file.
     * 2. Uses a 'PUT' request to upload the binary file directly to S3.
     * 3. S3 triggers the Lambda worker (already audited) automatically upon completion.
     */
    const handleUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!eventCode) return alert("Please enter an Event Code first");
        
        setLoading(true);
        try {
            for (let file of files) {
                // STAGE 1: Get Authorization for this specific file name/type
                const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload-url`, {
                    fileName: file.name, 
                    fileType: file.type, 
                    eventCode
                });
                
                // STAGE 2: Execute Direct Upload to Cloud Storage
                // Note: We use the raw 'file' object in the body for binary transfer.
                await axios.put(data.uploadUrl, file, { 
                    headers: { 'Content-Type': file.type } 
                });
            }
            alert("Upload Complete. AI indexing started in background.");
        } catch (err) {
            console.error("Batch Upload Error:", err);
            alert("Upload failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-zinc-950 text-white p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 border-b border-zinc-800 pb-6">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter">
                        Operator <span className="text-red-600">Console</span>
                    </h1>
                    <p className="text-zinc-500 font-mono text-xs mt-2 uppercase tracking-widest">
                        Status: Authorized // Upload Engine: Active
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Section: Event Controls */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="glass-panel p-6 rounded-xl border border-zinc-800">
                            <label className="block text-[10px] font-bold tracking-widest text-zinc-500 mb-2 uppercase">Assignment Code</label>
                            <input 
                                type="text" 
                                placeholder="E.G. WEDDING_2026" 
                                className="w-full bg-zinc-900 border border-zinc-800 p-4 text-sm focus:border-red-600 outline-none transition-all uppercase font-bold tracking-widest" 
                                onChange={e => setEventCode(e.target.value)} 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={generateQR} 
                                className="bg-white text-black p-4 font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all text-xs"
                            >
                                Generate QR
                            </button>
                            <label className={`p-4 text-center cursor-pointer font-black uppercase tracking-widest text-xs transition-all border ${loading ? 'bg-zinc-800 border-zinc-700 text-zinc-500' : 'bg-zinc-900 border-zinc-800 hover:border-red-600 text-white'}`}>
                                {loading ? "Uploading..." : "Batch Upload"}
                                <input type="file" multiple className="hidden" onChange={handleUpload} disabled={loading} />
                            </label>
                        </div>
                    </div>

                    {/* Right Section: QR Visual Output */}
                    <div className="flex flex-col items-center justify-center glass-panel p-8 rounded-xl border border-zinc-800 min-h-[300px]">
                        {qrCode ? (
                            <div className="text-center">
                                <div className="bg-white p-4 rounded-lg mb-6 inline-block">
                                    <img src={qrCode} alt="QR" className="w-40 h-40" />
                                </div>
                                <button 
                                    onClick={() => window.print()} 
                                    className="block w-full text-[10px] font-bold tracking-widest text-zinc-500 hover:text-red-600 uppercase"
                                >
                                    Print Event Card
                                </button>
                            </div>
                        ) : (
                            <p className="text-zinc-700 font-black text-center text-sm uppercase tracking-tighter">
                                QR Preview <br /> Unavailable
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
