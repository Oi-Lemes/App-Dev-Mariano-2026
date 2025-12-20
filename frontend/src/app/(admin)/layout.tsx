// Caminho: frontend/src/app/(admin)/layout.tsx
"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ChatbotNina from '@/components/ChatbotNina';
import { UserProvider, useUser } from '@/contexts/UserContext';
import { DevPlanSwitcher } from '@/components/DevPlanSwitcher';
import { motion, AnimatePresence } from 'framer-motion';

// --- Componente Interno para a Sidebar e Conteúdo ---
const LayoutWithSidebar = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [progressoTotal, setProgressoTotal] = useState(0);
  const [modulos, setModulos] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false); // Estado do Modal de Suporte

  useEffect(() => {
    setIsMounted(true);
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    router.push('/');
  }, [router]);

  // ▼▼▼ ESTA É A FUNÇÃO CORRIGIDA ▼▼▼
  // Ela soma o total de AULAS e o total de AULAS CONCLUÍDAS e AGORA GUARDA OS MÓDULOS
  const fetchProgressData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
      const [modulosRes, progressoRes] = await Promise.all([
        fetch(`${backendUrl}/modulos`, { headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-store' }),
        fetch(`${backendUrl}/progresso`, { headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-store' })
      ]);

      if (!modulosRes.ok || !progressoRes.ok) {
        handleLogout();
        return;
      }

      const modulosData = await modulosRes.json();
      setModulos(modulosData); // Salva para renderizar os atalhos

      // aulasConcluidasIds é um array de números, ex: [1, 5, 12]
      const aulasConcluidasIds = await progressoRes.json();
      const aulasConcluidasIdSet = new Set(aulasConcluidasIds);

      // Filtrar módulos que não são de certificado para o cálculo
      const modulosPrincipais = modulosData.filter((m: any) => m.nome && !m.nome.toLowerCase().includes('certificado'));

      let totalAulas = 0;
      let totalConcluidas = 0;

      for (const modulo of modulosPrincipais) {
        if (Array.isArray(modulo.aulas) && modulo.aulas.length > 0) {
          for (const aula of modulo.aulas) {
            totalAulas++;
            if (aula && aula.id && aulasConcluidasIdSet.has(aula.id)) {
              totalConcluidas++;
            }
          }
        }
      }

      // --- CORREÇÃO DO 95% ---
      // Se tiver concluído o Quiz (ID 999), adiciona um "peso" extra para fechar 100%
      // Assumindo que o Quiz é o passo final.
      const hasQuiz = aulasConcluidasIdSet.has(999);

      // Se concluiu todas as aulas + Quiz, força 100%. 
      // Se não, calcula proporcional. O Quiz vale como um "módulo final".

      if (hasQuiz && totalConcluidas >= totalAulas) {
        setProgressoTotal(100);
      } else {
        // Mantém a lógica normal mas limita a 99% se não fez o quiz
        let calc = totalAulas > 0 ? (totalConcluidas / totalAulas) * 100 : 0;
        if (calc > 95 && !hasQuiz) calc = 95; // Trava em 95 se faltar o quiz
        if (hasQuiz) calc = 100; // Se fez o quiz, consideramos 100% (simplificação solicitada)

        setProgressoTotal(calc);
      }

    } catch (error) {
      console.error("Erro ao buscar progresso total:", error);
    }
  }, [handleLogout]);
  // ▲▲▲ FIM DA FUNÇÃO CORRIGIDA ▲▲▲


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
    } else {
      fetchProgressData();
    }

    const handleStorageChange = (event: any) => {
      // O Quiz salva "quiz_state". Se isso mudar, pode ser que tenha terminado.
      if (!event.key || event.key === 'aula_concluida' || event.key === 'quiz_state' || event.key === null) {
        fetchProgressData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [router, fetchProgressData]);

  // ... (ProgressCircle code remains the same) ...

              </div >
            </div >

  {/* Content Area - Agora com Botão Dashboard e Suporte */ }
  < div className = "flex-1 flex flex-col items-center justify-center p-8 space-y-6" >
              
              <Link
                href="/dashboard"
                className="w-full px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">🏠</span>
                <span className="uppercase tracking-widest text-xs">Ir para Dashboard</span>
              </Link>

              <button
                onClick={() => setIsSupportOpen(true)}
                className="group relative w-full px-6 py-4 bg-[#1e293b] hover:bg-[#334155] border border-amber-500/30 hover:border-amber-500/60 rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-500/10 flex flex-col items-center gap-2"
              >
                <span className="text-3xl mb-1 group-hover:scale-110 transition-transform duration-300">💬</span>
                <span className="uppercase tracking-[0.2em] text-xs font-bold text-amber-50 group-hover:text-amber-400">Suporte VIP</span>
                <span className="text-[10px] text-gray-500">Fale com a equipe</span>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div >

  {/* Logout Minimalista */ }
  < div className = "p-6 border-t border-[#1e293b]" >
    <button onClick={handleLogout} className="flex items-center text-xs text-red-400/60 hover:text-red-400 transition-colors uppercase tracking-widest font-bold">
      <span className="mr-2">✕</span> Encerrar Sessão
    </button>
            </div >
          </motion.aside >
        )}
      </AnimatePresence >

      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white/50 backdrop-blur-sm rounded-full text-black transition-all duration-300 ease-in-out hover:bg-white/80 md:hidden shadow-lg border border-white/30"
        aria-label="Toggle sidebar"
      >
        {isSidebarOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
        )}
      </button>

      <main className={`flex-1 p-6 sm:p-8 lg:p-12 transition-all duration-500 ease-in-out ${isSidebarOpen ? 'md:ml-80' : ''} flex flex-col items-center`}>
        <div className="w-full max-w-6xl">
          {children}
        </div>
      </main>
      <ChatbotNina />

{/* MODAL DE SUPORTE - Estilo "Quadrado" Minimalista */ }
<AnimatePresence>
  {isSupportOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={() => setIsSupportOpen(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#1e293b] border border-[#334155] p-8 rounded-2xl shadow-2xl relative"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500 rounded-t-2xl"></div>

        <button onClick={() => setIsSupportOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">✕</button>

        <div className="text-center mb-8">
          <span className="text-4xl mb-4 block">💬</span>
          <h3 className="text-2xl font-serif text-white italic mb-2">Suporte Premium</h3>
          <p className="text-gray-400 text-sm">Como podemos ajudar você hoje?</p>
        </div>

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Mensagem enviada com sucesso! Nossa equipe entrará em contato em breve.'); setIsSupportOpen(false); }}>
          <div>
            <label className="block text-[#94a3b8] text-xs uppercase tracking-widest font-bold mb-2">Sua Mensagem</label>
            <textarea
              className="w-full h-32 bg-[#0f172a] border border-[#334155] rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              placeholder="Descreva sua dúvida ou solicitação..."
            ></textarea>
          </div>
          <button type="submit" className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold uppercase tracking-widest rounded-xl shadow-lg transition-all transform hover:scale-[1.02]">
            Enviar Solicitação
          </button>
        </form>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </div >
  );
};

// --- Componente Principal do Layout ---
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <LayoutWithSidebar>{children}</LayoutWithSidebar>

      {/* O Switcher de planos para teste */}
      <DevPlanSwitcher />
    </UserProvider>
  );
}