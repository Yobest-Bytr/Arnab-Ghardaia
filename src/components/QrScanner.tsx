"use client";

import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera } from 'lucide-react';

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScanSuccess }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scannerRef.current.render(onScanSuccess, (error) => {
      // console.warn(error);
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => console.error("Failed to clear scanner", error));
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="relative rounded-[2rem] overflow-hidden border-2 border-indigo-500/30 bg-black/40">
      <div id="qr-reader" className="w-full" />
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
        <div className="w-64 h-64 border-2 border-indigo-400 rounded-3xl border-dashed opacity-40" />
        <p className="mt-6 text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-2">
          <Camera size={14} /> Align Neural ID Tag
        </p>
      </div>
    </div>
  );
};

export default QrScanner;