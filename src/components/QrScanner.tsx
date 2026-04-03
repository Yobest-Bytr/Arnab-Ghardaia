"use client";

import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, RefreshCw } from 'lucide-react';

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScanSuccess }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "qr-reader-element";

  useEffect(() => {
    const startScanner = async () => {
      try {
        // Create instance
        const html5QrCode = new Html5Qrcode(containerId);
        scannerRef.current = html5QrCode;

        const config = { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0 
        };

        // Start scanning
        await html5QrCode.start(
          { facingMode: "environment" }, 
          config, 
          (decodedText) => {
            // On success
            html5QrCode.stop().then(() => {
              onScanSuccess(decodedText);
            }).catch(err => {
              console.error("Failed to stop scanner", err);
              onScanSuccess(decodedText);
            });
          },
          undefined // On error (ignore noisy frame errors)
        );
      } catch (err) {
        console.error("Unable to start scanner", err);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(startScanner, 500);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error("Cleanup stop failed", err));
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="relative rounded-[2.5rem] overflow-hidden border-2 border-indigo-500/30 bg-black shadow-2xl aspect-square max-w-md mx-auto">
      <div id={containerId} className="w-full h-full" />
      
      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
        <div className="w-64 h-64 border-2 border-indigo-400 rounded-3xl border-dashed opacity-40 animate-pulse" />
        <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-2">
          <div className="px-4 py-2 bg-indigo-600/80 backdrop-blur-md rounded-full flex items-center gap-2">
            <RefreshCw size={14} className="animate-spin text-white" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Searching for Neural ID</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrScanner;