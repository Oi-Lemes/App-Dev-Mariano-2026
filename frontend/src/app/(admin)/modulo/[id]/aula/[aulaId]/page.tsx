"use client";
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Inline Icons to avoid installing new dependencies
const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// Configuração do Worker do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.js`;

export default function AulaPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.id as string;
  const aulaId = params.aulaId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aulaAtual, setAulaAtual] = useState<any>(null);
  const [modulo, setModulo] = useState<any>(null);
  const [aulasConcluidas, setAulasConcluidas] = useState<string[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // PDF Viewer States
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageWidth, setPageWidth] = useState<number>(600);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const isConcluida = aulasConcluidas.includes(aulaId);
  const aulaIndex = modulo?.aulas?.findIndex((a: any) => a.id === aulaId) ?? -1;
  const isUltimaAulaDoModulo = modulo?.aulas && aulaIndex === modulo.aulas.length - 1;
  const isModuloConcluido = modulo?.aulas?.every((a: any) => aulasConcluidas.includes(a.id));

  const getFullUrl = (path: string | null | undefined) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://app-dev-mariano-2026.onrender.com';
    return `${backend}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/login');
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://app-dev-mariano-2026.onrender.com';

      // 1. Buscar Módulo
      const resModulo = await fetch(`${backendUrl}/modulos/${moduleId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!resModulo.ok) {
        console.error(`Erro ao buscar módulo: ${resModulo.status}`);
        throw new Error(`Módulo não encontrado (Status: ${resModulo.status})`);
      }
      const moduloData = await resModulo.json();
      setModulo(moduloData);

      // 2. Buscar Aula
      const resAula = await fetch(`${backendUrl}/aulas/${aulaId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!resAula.ok) {
        console.error(`Erro ao buscar aula ${aulaId}: ${resAula.status}`);
        throw new Error(`Aula não encontrada (ID: ${aulaId}, Status: ${resAula.status})`);
      }
      const aulaData = await resAula.json();
      setAulaAtual(aulaData);

      // 3. Buscar Progresso do Usuário
      const resUser = await fetch(`${backendUrl}/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (resUser.ok) {
        const userData = await resUser.json();
        // Assumindo que userData.aulasConcluidas é um array de IDs
        setAulasConcluidas(userData.aulasConcluidas || []);
      } else {
        console.warn(`Erro ao buscar usuário: ${resUser.status}`);
      }

    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  }, [moduleId, aulaId, router]);

  // Responsive Width Logic with ResizeObserver - Simplified
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoadingPdf(false);
  };

  useEffect(() => {
    const container = document.getElementById('pdf-wrapper');
    if (!container) return;

    const updateWidth = () => {
      if (container) {
        setPageWidth(container.clientWidth);
      }
    };

    // Initial width
    updateWidth();

    const observer = new ResizeObserver(() => {
      updateWidth();
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [isLoadingPdf]);

  // Download PDF Blob
  useEffect(() => {
    if (aulaId && aulaAtual?.pdfUrl) {
      setIsLoadingPdf(true);
      setPdfError(null); // Reset error on new download attempt
      setDownloadProgress(0);
      setPdfBlob(null);

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
          setPdfBlob(xhr.response);
          // Loading state stays true until Document renders first page (onDocumentLoadSuccess)
        } else {
          console.error("Erro ao baixar PDF:", xhr.status);
          setPdfError("Falha ao baixar o arquivo PDF. Verifique sua conexão.");
          setIsLoadingPdf(false);
        }
      };

      xhr.onerror = () => {
        console.error("Erro de rede XHR");
        setPdfError("Erro de rede ao tentar baixar o PDF.");
        setIsLoadingPdf(false);
      };

      xhr.send();

      return () => {
        xhr.abort();
      };
    } else {
      setIsLoadingPdf(false);
    }
  }, [aulaId, aulaAtual?.pdfUrl]);


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
    <div className="w-full">
      <nav className="mb-4 px-4 max-w-5xl mx-auto mt-6">
        <Link href={`/modulo/${moduleId}`} className="text-blue-400 hover:underline text-sm md:text-base flex items-center gap-2">
          &larr; Voltar para {modulo.nome}
        </Link>
      </nav>

      <main className="w-full">
        {aulaAtual.pdfUrl ? (
          <div id="pdf-wrapper" className="w-full relative bg-gray-900 flex flex-col items-center min-h-screen">

            {/* Erro no Download */}
            {pdfError && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 bg-gray-900">
                <div className="text-red-400 text-xl font-bold mb-4">⚠️ {pdfError}</div>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors"
                >
                  Recarregar Página
                </button>
              </div>
            )}
            {/* ÁREA DE CONTEÚDO (VÍDEO OU PDF) */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-amber-100">
              {isVideo && aulaAtual.videoUrl ? (
                <div className="relative aspect-video bg-black">
                  <iframe
                    src={getFullUrl(aulaAtual.videoUrl.includes('?') ? `${aulaAtual.videoUrl}&playsinline=1` : `${aulaAtual.videoUrl}?playsinline=1`)}
                    className="absolute inset-0 w-full h-full"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                    title={aulaAtual.nome}
                    frameBorder="0"
                    scrolling="no"
                  />
                </div>
              ) : aulaAtual.pdfUrl ? (
                <div className="flex flex-col h-[80vh] bg-stone-100">
                  {/* GOOGLE DRIVE PDF VIEWER */}
                  {isGoogleDrive(aulaAtual.pdfUrl) ? (
                    <div className="w-full h-full flex flex-col">
                      <iframe
                        src={aulaAtual.pdfUrl.replace('/view', '/preview')}
                        className="w-full h-full border-0"
                        title="Leitura Devocional"
                        allow="autoplay"
                      ></iframe>
                      <div className="p-4 bg-amber-50 text-center text-sm text-stone-600">
                        Se o PDF não carregar, <a href={aulaAtual.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-amber-700 font-bold underline">clique aqui para abrir</a>.
                      </div>
                    </div>
                  ) : (
                    /* LOCAL / REACT-PDF VIEWER (FALLBACK) */
                    <div className="relative flex-1 overflow-auto flex justify-center p-4">
                      {/* Error in Download */}
                      {pdfError && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 bg-gray-900">
                          <div className="text-red-400 text-xl font-bold mb-4">⚠️ {pdfError}</div>
                          <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors"
                          >
                            Recarregar Página
                          </button>
                        </div>
                      )}

                      {/* Loading State Overlay (Download Phase) */}
                      {!pdfBlob && !pdfError && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-gray-900/90 backdrop-blur-sm">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
                          <p className="text-amber-100 font-serif text-lg animate-pulse mb-2">Baixando devocional...</p>
                          <div className="w-64 bg-gray-800 rounded-full h-1.5 overflow-hidden border border-white/10">
                            <div className="bg-amber-500 h-full transition-all duration-300 ease-out" style={{ width: `${downloadProgress}%` }}></div>
                          </div>
                        </div>
                      )}

                      {pdfBlob && (
                        <Document
                          file={pdfBlob}
                          onLoadSuccess={onDocumentLoadSuccess}
                          loading={
                            <div className="flex flex-col items-center py-20">
                              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mb-2"></div>
                              <span className="text-gray-400">Renderizando...</span>
                            </div>
                          }
                          error={
                            <div className="flex flex-col items-center justify-center p-8 text-red-500">
                              <p className="font-bold mb-2">Não foi possível carregar o PDF.</p>
                              <button onClick={() => window.open(getFullUrl(aulaAtual.pdfUrl!), '_blank')} className="mt-4 px-4 py-2 bg-amber-600 rounded text-white text-sm">
                                Abrir Externamente
                              </button>
                            </div>
                          }
                          className="flex flex-col items-center w-full"
                        >
                          {Array.from(new Array(numPages), (el, index) => (
                            <Page
                              key={`page_${index + 1}`}
                              pageNumber={index + 1}
                              width={800} // Valor fixo seguro ou responsivo se tiver hook de window
                              className="mb-4 shadow-lg min-h-[500px]"
                              renderTextLayer={false}
                              renderAnnotationLayer={false}
                            />
                          ))}
                        </Document>
                      )}
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {
              aulaAtual.content ? (
                <div className="max-w-5xl mx-auto px-4">
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

            {/* --- Area de Download para Paper Toys --- */}
            {aulaAtual.isImage && aulaAtual.downloadUrl && (
              <div className="flex justify-center mt-8">
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
              <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-lg text-center mt-6">
                <h3 className="font-bold text-lg">Parabéns!</h3>
                <p className="text-sm">Você concluiu o {modulo.nome}. Redirecionando para o Início...</p>
              </div>
            )}

            {feedbackMessage && (
              <div className={`px-4 py-3 rounded-lg text-center mt-4 ${isRedirecting ? 'bg-yellow-900/50 border border-yellow-700 text-yellow-300' : ''}`}>
                <p>{feedbackMessage}</p>
              </div>
            )}

            {/* Botão Próximo */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 p-4 mt-8 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
              <button
                onClick={handleProximo}
                disabled={isRedirecting}
                className="w-full sm:w-auto px-8 py-3 rounded-full font-semibold text-base transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/30 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
              >
                <span>{isUltimaAulaDoModulo ? 'Concluir Estudo' : 'Próxima'}</span>
                {!isUltimaAulaDoModulo && <ArrowRightIcon />}
              </button>
            </div>
          </main>
          </div>
  );
}