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
  const [timeLeft, setTimeLeft] = useState<string>('--:--');
  const [progress, setProgress] = useState(100); // 100% to 0%
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate QR Code Image
  useEffect(() => {
    if (pixData?.pix_qr_code) {
      QRCode.toDataURL(pixData.pix_qr_code, {
        width: 300,
        margin: 2,
        color: {
          dark: '#0f172a', // Slate 900
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error("Erro ao gerar QR Code:", err));
    }
  }, [pixData]);

  // Timer Logic
  useEffect(() => {
    if (isOpen && pixData?.expiration_date) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const end = new Date(pixData.expiration_date!).getTime();
        const distance = end - now;

        // If expired
        if (distance < 0) {
          setTimeLeft("00:00");
          setProgress(0);
          if (timerRef.current) clearInterval(timerRef.current);
          return;
        }

        // Calculation
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

        // Progress Bar Calculation (Assuming 30 min default window if total duration unkown, 
        // OR calculate based on creation if we had it. For now, decay from current check)
        // Simplification: Loop seconds for visual effect or just purely explicit time
        // Let's rely on explicit time.
      };

      updateTimer(); // Initial call
      timerRef.current = setInterval(updateTimer, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, pixData]);

  // Polling for Payment Status
  useEffect(() => {
    const checkStatus = async () => {
      if (!pixData?.hash) return;

      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ||
          process.env.NEXT_PUBLIC_BACKEND_URL ||
          'https://backend-plants-image-latest.onrender.com';

        const url = `${apiUrl}/verificar-status-paradise/${pixData.hash}?_=${Date.now()}`;

        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status === 'paid' || data.payment_status === 'paid' || data.status === 'approved') {
            onPaymentSuccess();
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
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
      setCopyButtonText('Copiado! ✅');
      setTimeout(() => setCopyButtonText('Copiar código PIX'), 2000);
    }
  };

  if (!isOpen || !pixData) return null;

  const isAnalysis = pixData.status === 'analysis' || !pixData.pix_qr_code;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header com Gradiente */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 pt-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('/img/pattern.png')] opacity-10"></div>

              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h3 className="text-2xl font-bold text-white mb-1 relative z-10">
                {isAnalysis ? 'Pagamento em Análise' : 'Pagamento via PIX'}
              </h3>
              <p className="text-blue-100 text-sm relative z-10">
                {isAnalysis ? 'Aguarde um momento...' : 'Escaneie o QR Code ou copie o código'}
              </p>

              {/* Timer Badge */}
              {!isAnalysis && (
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full mt-4 border border-white/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-white font-mono font-bold tracking-wider">{timeLeft}</span>
                </div>
              )}
            </div>

            <div className="p-6">
              {/* Valor em Destaque */}
              <div className="text-center mb-6">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Valor Total</p>
                <p className="text-4xl font-black text-gray-900 tracking-tight">
                  {pixData.amount_paid
                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pixData.amount_paid / 100)
                    : isAnalysis ? 'R$ --,--' : 'R$ Error'}
                </p>
              </div>

              {/* QR Code */}
              {!isAnalysis && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex justify-center mb-6"
                >
                  <div className="p-3 bg-white border-2 border-indigo-100 rounded-2xl shadow-sm">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="QR Code PIX" className="w-48 h-48 object-contain rounded-lg" />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">
                        <span className="text-xs text-gray-400">Gerando QR...</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Copia e Cola */}
              {!isAnalysis && (
                <div className="space-y-3">
                  <div className="relative group">
                    <input
                      type="text"
                      readOnly
                      value={pixData.pix_qr_code || ''}
                      className="w-full pl-4 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      onClick={(e) => e.currentTarget.select()}
                    />
                    <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none"></div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopyPix}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                  >
                    {!copyButtonText.includes('Copiado') && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    )}
                    <span>{copyButtonText}</span>
                  </motion.button>
                </div>
              )}

              {/* Footer */}
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Ambiente Seguro. Liberação Imediata.</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}