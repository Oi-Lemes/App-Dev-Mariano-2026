'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';

export default function FixPokemonPage() {
    const { user } = useUser();
    const [files, setFiles] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [renaming, setRenaming] = useState<{ [key: string]: boolean }>({});
    const [newNames, setNewNames] = useState<{ [key: string]: string }>({});

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    const fetchFiles = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await fetch(`${backendUrl}/debug/list-files/Pokemon`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setFiles(data);
        } catch (e) {
            console.error(e);
            alert('Erro ao buscar arquivos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleRename = async (oldName: string) => {
        const newName = newNames[oldName];
        if (!newName) return alert('Digite um novo nome');

        // Ensure extension
        const ext = oldName.split('.').pop();
        const finalName = newName.endsWith(`.${ext}`) ? newName : `${newName}.${ext}`;

        if (!confirm(`Tem certeza que quer renomear "${oldName}" para "${finalName}"?`)) return;

        setRenaming(prev => ({ ...prev, [oldName]: true }));
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${backendUrl}/debug/rename-file`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    category: 'Pokemon',
                    oldName,
                    newName: finalName
                })
            });

            if (res.ok) {
                alert('Renomeado com sucesso!');
                await fetchFiles();
                setNewNames(prev => ({ ...prev, [oldName]: '' })); // Clear input
            } else {
                const err = await res.json();
                alert('Erro: ' + err.error);
            }
        } catch (e) {
            console.error(e);
            alert('Erro de conexão');
        } finally {
            setRenaming(prev => ({ ...prev, [oldName]: false }));
        }
    };

    if (loading) return <div className="text-white p-10">Carregando...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 ml-80">
            <h1 className="text-3xl font-bold mb-8 text-yellow-400">Arrumar Módulo Pokemon</h1>
            <p className="mb-6 text-gray-300">
                Identifique as imagens erradas e renomeie-as. <br />
                <b>Nota:</b> Após renomear tudo, avise a IA para atualizar o banco de dados.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {files.map(file => (
                    <div key={file} className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col items-center">
                        {/* Imagem com encodeURI para garantir que carregue mesmo com espaços */}
                        <img
                            src={`${backendUrl}/uploads/papertoys/Organizados/Pokemon/${encodeURI(file)}`}
                            alt={file}
                            className="h-48 object-contain mb-4 rounded"
                        />

                        <div className="w-full">
                            <p className="text-sm text-gray-400 mb-1">Nome Atual:</p>
                            <div className="bg-black/30 p-2 rounded mb-3 text-center break-all font-mono text-sm">
                                {file}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Novo nome (ex: pikachu)"
                                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white focus:outline-none focus:border-yellow-500"
                                    value={newNames[file] || ''}
                                    onChange={e => setNewNames(prev => ({ ...prev, [file]: e.target.value }))}
                                />
                                <button
                                    onClick={() => handleRename(file)}
                                    disabled={renaming[file]}
                                    className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded font-bold transition-colors disabled:opacity-50"
                                >
                                    {renaming[file] ? '...' : 'Salvar'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
