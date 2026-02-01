"use client";
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

// Tipos
interface Aula {
  id: number;
  nome: string;
  videoUrl?: string;
  pdfUrl?: string; // Content fix
  downloadUrl?: string;
  isImage?: boolean; // Novo campo
  content?: string; // Conteúdo em texto
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

  const [isLoadingPdf, setIsLoadingPdf] = useState(true); // Loading visual min
  const [pdfLoaded, setPdfLoaded] = useState(false); // Evento real do iframe
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
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://app-dev-mariano-2026.onrender.com';

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

  const [downloadProgress, setDownloadProgress] = useState(0);
  const [pdfObjectUrl, setPdfObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (aulaId && aulaAtual?.pdfUrl) {
      setIsLoadingPdf(true);
      setDownloadProgress(0);
      setPdfObjectUrl(null);

      const url = getFullUrl(aulaAtual.pdfUrl);
      const xhr = new XMLHttpRequest();

      xhr.open('GET', url, true);
      xhr.responseType = 'blob';

      xhr.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setDownloadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const blob = xhr.response;
          const blobUrl = URL.createObjectURL(blob);
          setPdfObjectUrl(blobUrl);
          setIsLoadingPdf(false);
        } else {
          // Fallback em caso de erro no blob
          console.error("Erro ao baixar PDF via Blob, usando URL direta");
          setPdfObjectUrl(url);
          setIsLoadingPdf(false);
        }
      };

      xhr.onerror = () => {
        console.error("Erro XHR, usando URL direta");
        setPdfObjectUrl(url);
        setIsLoadingPdf(false);
      };

      xhr.send();

      return () => {
        xhr.abort();
        // Nota: Revogar o ObjectURL aqui pode quebrar se o comp desmontar rápido, 
        // mas idealmente deveríamos limpar.
        // if (pdfObjectUrl) URL.revokeObjectURL(pdfObjectUrl);
      };
    } else {
      setIsLoadingPdf(false);
    }
  }, [aulaId, aulaAtual?.pdfUrl]); // Re-run if ID or URL changes

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
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://app-dev-mariano-2026.onrender.com';
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

  const handleProximo = async () => {
    setFeedbackMessage(null);

    // 1. Força a conclusão da aula atual se ainda não estiver concluída
    if (aulaAtual && !isConcluida) {
      await handleMarcarComoConcluida();
    }

    // Pequeno delay para garantir que o state atualizou ou que o usuário perceba a ação
    setTimeout(() => {
      if (modulo && !isUltimaAulaDoModulo) {
        const proximaAula = modulo.aulas[aulaIndex + 1];
        router.push(`/modulo/${moduleId}/aula/${proximaAula.id}`);
      } else if (modulo) {
        // Verifica se TODAS estão concluídas (agora incluindo esta última)
        // Mas como o state 'aulasConcluidas' pode nao ter atualizado ainda neste ciclo,
        // podemos confiar que se esta era a única que faltava, agora está ok.

        router.push('/dashboard');
      }
    }, 500);
  };

  const isVideo = aulaAtual?.videoUrl?.includes('wistia') || aulaAtual?.videoUrl?.includes('youtube');

  // Constrói URL completa se for local
  const getFullUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://app-dev-mariano-2026.onrender.com'}${url}`;
  };

  const previewUrl = getFullUrl(aulaAtual?.videoUrl ? encodeURI(aulaAtual.videoUrl) : '');

  // Transform /uploads/... to /secure-download/... for progressive limit
  let downloadUrl = getFullUrl(aulaAtual?.downloadUrl);
  const secureDownloadPath = aulaAtual?.downloadUrl?.startsWith('/uploads/') || aulaAtual?.isImage
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://app-dev-mariano-2026.onrender.com'}/secure-download/${aulaAtual?.id}`
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

        {aulaAtual.pdfUrl ? (
          <div className="w-full bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-white/10 relative flex flex-col">

            {/* Mobile Actions Header */}
            <div className="bg-gray-800/80 backdrop-blur p-3 flex justify-between items-center md:hidden border-b border-white/10">
              <span className="text-xs text-gray-400">PDF Reader</span>
              <button
                onClick={() => window.open(getFullUrl(aulaAtual.pdfUrl), '_blank')}
                className="text-xs bg-amber-600/20 text-amber-500 px-3 py-1.5 rounded-full hover:bg-amber-600/30 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Baixar / Abrir Externo
              </button>
            </div>

            <div className="w-full h-[75vh] md:h-[85vh] relative bg-gray-900 overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch' }}>
                {/* Real Loading State Overlay */}
                {(isLoadingPdf || !pdfObjectUrl) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-30 p-6 text-center">
                    <div className="w-full max-w-xs bg-gray-800 rounded-full h-2.5 mb-4 border border-white/10 overflow-hidden">
                      <div 
                        className="bg-amber-500 h-2.5 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                        style={{ width: `${downloadProgress}%` }}
                      ></div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-amber-500 font-bold text-xl">{Math.round(downloadProgress)}%</span>
                        <p className="text-gray-400 text-sm animate-pulse">Carregando em alta velocidade...</p>
                    </div>
                  </div>
                )}

                {pdfObjectUrl && (
                    <iframe
                    src={`${pdfObjectUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                    className="w-full h-full block"
                    allowFullScreen
                    title="Devocional"
                    style={{ border: 'none', minHeight: '100%' }}
                    />
                )}
            </div>
                    ></div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-amber-500 font-bold text-xl">{Math.round(downloadProgress)}%</span>
                    <p className="text-gray-400 text-sm animate-pulse">Carregando seu devocional em alta velocidade...</p>
                  </div>
                </div >
              )
}

{
  pdfObjectUrl && (
    <iframe
      src={`${pdfObjectUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
      className="w-full h-full"
      allowFullScreen
      title="Devocional"
      style={{ border: 'none' }}
    />
  )
}
            </div >
          </div >
        ) : aulaAtual.videoUrl && aulaAtual.isImage ? (
  <div className="w-full relative rounded-xl overflow-hidden shadow-2xl mb-8 border border-white/10 group">
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none" />
    <img
      src={getFullUrl(aulaAtual.videoUrl)}
      alt={aulaAtual.nome}
      className="w-full h-auto object-contain transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
    />
  </div>
) : null
        }

{
  aulaAtual.content ? (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-xl shadow-2xl text-gray-100">
      <div className="prose prose-invert prose-lg max-w-none font-light tracking-wide">
        <ReactMarkdown
          components={{
            h1: ({ node, ...props }) => <h1 className="font-serif text-amber-500/90 text-3xl mb-6 border-b border-white/10 pb-4" {...props} />,
            h2: ({ node, ...props }) => <h2 className="font-serif text-amber-200/90 text-2xl mt-8 mb-4" {...props} />,
            p: ({ node, ...props }) => <p className="leading-loose text-gray-200 mb-4" {...props} />,
            strong: ({ node, ...props }) => <strong className="text-amber-100 font-semibold" {...props} />
          }}
        >
          {aulaAtual.content}
        </ReactMarkdown>
      </div>
    </div>
  ) : aulaAtual.isImage ? (
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
    ) : null
  )
}


{/* --- Area de Download para Paper Toys --- */ }
{
  aulaAtual.isImage && aulaAtual.downloadUrl && (
    <div className="flex justify-center">
      <button
        onClick={handleSecureDownload}
        className="flex items-center gap-2 px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg rounded-full shadow-lg hover:shadow-yellow-500/50 transition-all transform hover:-translate-y-1 cursor-pointer"
      >
        <DownloadIcon />
        BAIXAR ARQUIVO (PDF/IMAGEM)
      </button>
    </div>
  )
}

{
  isUltimaAulaDoModulo && isModuloConcluido && (
    <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-lg text-center">
      <h3 className="font-bold text-lg">Parabéns!</h3>
      <p className="text-sm">Você concluiu o {modulo.nome}. Redirecionando para o Início...</p>
    </div>
  )
}
{
  feedbackMessage && (
    <div className={`px-4 py-3 rounded-lg text-center ${isRedirecting ? 'bg-yellow-900/50 border border-yellow-700 text-yellow-300' : ''}`}>
      <p>{feedbackMessage}</p>
    </div>
  )
}

{/* Botão Manual Removido para forçar progresso via Download */ }
<div className="flex flex-col sm:flex-row items-center justify-end gap-4 p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
  <button
    onClick={handleProximo}
    disabled={isRedirecting}
    className="w-full sm:w-auto px-8 py-3 rounded-full font-semibold text-base transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/30 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
  >
    <span>{isUltimaAulaDoModulo ? 'Concluir Estudo' : 'Próxima'}</span>
    {!isUltimaAulaDoModulo && <ArrowRightIcon />}
  </button>
</div>
      </main >
    </div >
  );
}