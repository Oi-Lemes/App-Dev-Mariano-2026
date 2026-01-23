"use client";
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Tipos
interface Aula {
  id: number;
  nome: string;
  videoUrl?: string;
  downloadUrl?: string;
  isImage?: boolean; // Novo campo
}
interface Modulo {
  id: number;
  nome: string;
  aulas: Aula[];
}

// --- Componentes de Ícone ---
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

export default function AulaPage() {
  const params = useParams();
  const router = useRouter();
  const { id: moduleId, aulaId } = params;

  const [modulo, setModulo] = useState<Modulo | null>(null);
  const [aulasConcluidas, setAulasConcluidas] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const fetchData = useCallback(async () => {
    setError(null);
    const token = localStorage.getItem('token');
    if (!token || !moduleId) {
      router.push('/');
      return;
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://moldes.onrender.com';

      const [moduloRes, progressoRes] = await Promise.all([
        fetch(`${backendUrl}/modulos/${moduleId}`, { headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-store' }),
        fetch(`${backendUrl}/progresso`, { headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-store' })
      ]);

      if (!moduloRes.ok) {
        const errorData = await moduloRes.json();
        throw new Error(errorData.message || 'Falha ao carregar o módulo.');
      }

      setModulo(await moduloRes.json());
      setAulasConcluidas(await progressoRes.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [moduleId, router]);

  useEffect(() => {
    fetchData();
  }, [moduleId, aulaId, fetchData]);

  useEffect(() => {
    const handleStorageChange = () => {
      fetchData();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchData]);

  const aulaAtual = modulo?.aulas.find(a => a.id.toString() === aulaId);
  const aulaIndex = modulo?.aulas.findIndex(a => a.id.toString() === aulaId) ?? -1;
  const isUltimaAulaDoModulo = aulaIndex !== -1 && aulaIndex === (modulo?.aulas.length ?? 0) - 1;
  const isConcluida = aulaAtual ? aulasConcluidas.includes(aulaAtual.id) : false;
  const isModuloConcluido = modulo ? modulo.aulas.every(a => aulasConcluidas.includes(a.id)) : false;

  const handleMarcarComoConcluida = async () => {
    if (!aulaAtual) return;
    setFeedbackMessage(null);
    const token = localStorage.getItem('token');
    if (!token) return;

    const novoStatus = !isConcluida;

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://moldes.onrender.com';
      await fetch(`${backendUrl}/aulas/concluir`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ aulaId: aulaAtual.id, completed: novoStatus })
      });

      if (novoStatus) {
        setAulasConcluidas(prev => [...prev, aulaAtual.id]);
      } else {
        setAulasConcluidas(prev => prev.filter(id => id !== aulaAtual.id));
      }

      const now = Date.now().toString();
      localStorage.setItem('aula_concluida', now);
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error("Erro ao alterar status da aula:", error);
    }
  };

  const handleProximo = () => {
    setFeedbackMessage(null);

    if (modulo && !isUltimaAulaDoModulo) {
      const proximaAula = modulo.aulas[aulaIndex + 1];
      router.push(`/modulo/${moduleId}/aula/${proximaAula.id}`);
    } else if (modulo) {
      const moduloCompleto = modulo.aulas.every(a => aulasConcluidas.includes(a.id));

      if (moduloCompleto) {
        router.push('/dashboard');
      } else {
        const primeiraAulaNaoConcluida = modulo.aulas.find(a => !aulasConcluidas.includes(a.id));
        if (primeiraAulaNaoConcluida) {
          setFeedbackMessage(`Aguarde... você precisa concluir a aula "${primeiraAulaNaoConcluida.nome}".`);
          setIsRedirecting(true);
          setTimeout(() => {
            router.push(`/modulo/${moduleId}/aula/${primeiraAulaNaoConcluida.id}`);
          }, 3000);
        } else {
          router.push('/dashboard');
        }
      }
    }
  };

  const isVideo = aulaAtual?.videoUrl?.includes('wistia') || aulaAtual?.videoUrl?.includes('youtube');

  // Constrói URL completa se for local
  const getFullUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://moldes.onrender.com'}${url}`;
  };

  const previewUrl = getFullUrl(aulaAtual?.videoUrl ? encodeURI(aulaAtual.videoUrl) : '');

  // Transform /uploads/... to /secure-download/... for progressive limit
  let downloadUrl = getFullUrl(aulaAtual?.downloadUrl);
  const secureDownloadPath = aulaAtual?.downloadUrl?.startsWith('/uploads/') || aulaAtual?.isImage
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://moldes.onrender.com'}/secure-download/${aulaAtual?.id}`
    : downloadUrl;

  const handleSecureDownload = async () => {
    if (!aulaAtual) return;
    setFeedbackMessage(null);
    setError(null);

    // Se for link externo, abre direto
    if (!aulaAtual.downloadUrl?.startsWith('/uploads/') && !aulaAtual.isImage) {
      window.open(downloadUrl, '_blank');
      if (!isConcluida) handleMarcarComoConcluida();
      return;
    }

    try {
      const token = localStorage.getItem('token');

      // IPHONE FIX: Usar navegação direta com Token na URL
      // O fetch + blob é bloqueado frequentemente no iOS (assíncrono)
      // O Backend foi atualizado para aceitar ?token=...

      const targetUrl = `${secureDownloadPath}${secureDownloadPath.includes('?') ? '&' : '?'}token=${token}`;

      // Se for mobile, melhor window.location
      window.location.href = targetUrl;

      // Delay para marcar como concluída (já que perdemos o callback do fetch)
      setTimeout(() => {
        if (!isConcluida) handleMarcarComoConcluida();
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div></div>;
  }

  if (error || !modulo || !aulaAtual) {
    return (
      <div className="text-center p-4">
        <h1 className="text-2xl md:text-3xl font-bold text-red-400">Ocorreu um Erro</h1>
        <p className="mt-2 text-white">{error || "Não foi possível carregar as informações da aula."}</p>
        <Link href="/dashboard" className="text-blue-400 hover:underline mt-4 block">
          Voltar para o Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      <nav className="mb-4 md:mb-6 mt-12 md:mt-0">
        <Link href={`/modulo/${moduleId}`} className="text-blue-400 hover:underline text-sm md:text-base">
          &larr; Voltar para as aulas do {modulo.nome}
        </Link>
      </nav>
      <header className="mb-4 md:mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{aulaAtual.nome}</h1>
      </header>
      <main className="space-y-6">

        <div className="bg-gray-900 rounded-lg overflow-hidden shadow-2xl border border-gray-800">
          {aulaAtual.isImage ? (
            <div className="flex justify-center items-center p-4 bg-gray-800/50">
              {/* Imagem do Paper Toy */}
              <img
                src={previewUrl}
                alt={aulaAtual.nome}
                className="max-h-[70vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          ) : (
            /* Lógica Antiga de Vídeo (Fallback) */
            aulaAtual.videoUrl ? (
              isVideo ? (
                <div className="w-full aspect-video bg-transparent">
                  <iframe
                    src={aulaAtual.videoUrl.includes('?') ? `${aulaAtual.videoUrl}&playsinline=1` : `${aulaAtual.videoUrl}?playsinline=1`}
                    title={aulaAtual.nome}
                    allow="autoplay; fullscreen; picture-in-picture"
                    frameBorder="0"
                    scrolling="no"
                    className="w-full h-full"
                  ></iframe>
                </div>
              ) : (
                <iframe src={aulaAtual.videoUrl} title={aulaAtual.nome} frameBorder="0" className="w-full h-[75vh] bg-white"></iframe>
              )
            ) : (
              <div className="flex items-center justify-center w-full aspect-video bg-gray-900">
                <p className="text-gray-400">Conteúdo indisponível para esta aula.</p>
              </div>
            )
          )}
        </div>

        {/* --- Area de Download para Paper Toys --- */}
        {aulaAtual.isImage && aulaAtual.downloadUrl && (
          <div className="flex justify-center">
            <button
              onClick={handleSecureDownload}
              className="flex items-center gap-2 px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg rounded-full shadow-lg hover:shadow-yellow-500/50 transition-all transform hover:-translate-y-1 cursor-pointer"
            >
              <DownloadIcon />
              BAIXAR ARQUIVO (PDF/IMAGEM)
            </button>
          </div>
        )}

        {isUltimaAulaDoModulo && isModuloConcluido && (
          <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-lg text-center">
            <h3 className="font-bold text-lg">Parabéns!</h3>
            <p className="text-sm">Você concluiu o {modulo.nome}. Redirecionando para o Início...</p>
          </div>
        )}
        {feedbackMessage && (
          <div className={`px-4 py-3 rounded-lg text-center ${isRedirecting ? 'bg-yellow-900/50 border border-yellow-700 text-yellow-300' : ''}`}>
            <p>{feedbackMessage}</p>
          </div>
        )}

        {/* Botão Manual Removido para forçar progresso via Download */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
          <button
            onClick={handleProximo}
            disabled={isRedirecting}
            className="w-full sm:w-auto px-8 py-3 rounded-full font-semibold text-base transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/30 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
          >
            <span>{isUltimaAulaDoModulo ? 'Finalizar Módulo' : 'Próxima'}</span>
            {!isUltimaAulaDoModulo && <ArrowRightIcon />}
          </button>
        </div>
      </main>
    </div>
  );
}