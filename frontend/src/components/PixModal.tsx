import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'framer-motion';

interface PixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  pixData: {
    hash?: string;
    pix_qr_code: string | null;
    expiration_date?: string | null;
    amount_paid?: number;
    status?: string;
    message?: string;
  } | null;
}

export function PixModal({ isOpen, onClose, onPaymentSuccess, pixData }: PixModalProps) {
  const [copyButtonText, setCopyButtonText] = useState('Copiar código PIX');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [timeLeft, setTimeLeft] = useState<string>('15:00'); // Default start
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate QR Code Image (Dark Theme optimized)
  useEffect(() => {
    if (pixData?.pix_qr_code) {
      QRCode.toDataURL(pixData.pix_qr_code, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000', // Black dots
          light: '#ffffff', // White background (standard for QR reader compatibility)
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error("Erro ao gerar QR Code:", err));
    }
  }, [pixData]);

  // Timer Logic - Robust Fallback
  useEffect(() => {
    if (isOpen) {
      // Use backend date OR fallback to 15 mins from now
      const targetDate = pixData?.expiration_date
        ? new Date(pixData.expiration_date).getTime()
        : new Date().getTime() + 15 * 60 * 1000;

      const updateTimer = () => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
          setTimeLeft("00:00");
          if (timerRef.current) clearInterval(timerRef.current);
          return;
        }

        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      };

      updateTimer(); // Immediate call
      timerRef.current = setInterval(updateTimer, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, pixData]);

  // Polling for Status
  useEffect(() => {
    const checkStatus = async () => {
      if (!pixData?.hash) return;
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://backend-plants-image-latest.onrender.com';
        const url = `${apiUrl}/verificar-status-paradise/${pixData.hash}?_=${Date.now()}`;

        const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'paid' || data.payment_status === 'paid' || data.status === 'approved') {
            onPaymentSuccess();
          }
        }
      } catch (error) {
        console.error('Status Check Error:', error);
      }
    };

    if (isOpen && pixData?.hash) {
      checkStatus();
      intervalRef.current = setInterval(checkStatus, 3000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOpen, pixData, onPaymentSuccess]);

  const handleCopyPix = () => {
    if (pixData?.pix_qr_code) {
      navigator.clipboard.writeText(pixData.pix_qr_code);
      setCopyButtonText('Copiado! 📋');
      setTimeout(() => setCopyButtonText('Copiar código PIX'), 2000);
    }
  };

  if (!isOpen || !pixData) return null;

  const isAnalysis = pixData.status === 'analysis' || !pixData.pix_qr_code;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop Escuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-white"
          >
            {/* Header Dark Mode */}
            <div className="bg-slate-900 p-6 pb-4 text-center border-b border-slate-800 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h3 className="text-xl font-bold text-white mb-1">
                {isAnalysis ? 'Analisando Pagamento...' : 'Finalizar Pagamento'}
              </h3>

              {!isAnalysis && (
                <div className="flex justify-center items-center gap-2 mt-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <p className="text-emerald-400 font-mono font-medium text-lg tracking-widest bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/20">
                    {timeLeft}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 pt-6">
              {/* Valor */}
              <div className="text-center mb-8">
                <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-2">Total a Pagar</p>
                <p className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">
                  {pixData.amount_paid
                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pixData.amount_paid / 100)
                    : 'R$ --,--'}
                </p>
              </div>

              {/* QR Code Container */}
              {!isAnalysis && (
                <div className="flex justify-center mb-8">
                  <div className="p-3 bg-white rounded-xl shadow-lg ring-4 ring-slate-800">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="QR Code PIX" className="w-48 h-48 object-contain" />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg">
                        <span className="text-xs">Gerando QR...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              {!isAnalysis && (
                <div className="space-y-3">
                  <div className="relative group">
                    <input
                      type="text"
                      readOnly
                      value={pixData.pix_qr_code || ''}
                      className="w-full pl-4 pr-12 py-3 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all truncate"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 01-2-2V6" /></svg>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: '#059669' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopyPix}
                    className="w-full py-4 bg-emerald-600 text-white font-bold rounded-lg shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 border border-emerald-500/20"
                  >
                    {!copyButtonText.includes('Copiado') && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    )}
                    <span>{copyButtonText}</span>
                  </motion.button>
                </div>
              )}

              <p className="text-[10px] text-slate-500 mt-6 text-center">
                Pagamento processado em ambiente seguro.<br />A liberação ocorre em poucos segundos após o pagamento.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}