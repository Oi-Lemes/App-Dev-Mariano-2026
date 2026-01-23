
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function verifyImages() {
    console.log("Iniciando verificação de imagens...");

    // Buscar todas as aulas que deveriam ser imagens
    const aulas = await prisma.aula.findMany({
        where: {
            isImage: true
        },
        include: {
            modulo: true
        }
    });

    console.log(`Verificando ${aulas.length} aulas marcadas como imagem...`);
    let missingCount = 0;

    for (const aula of aulas) {
        // O caminho no banco geralmente começa com /uploads/
        // Vamos normalizar para o caminho do sistema de arquivos
        const webPath = aula.downloadUrl || aula.videoUrl;

        if (!webPath) {
            console.log(`[ALERTA] Aula ${aula.id} (${aula.nome}) no módulo ${aula.modulo.nome} não tem URL definida.`);
            continue;
        }

        // Remover '/uploads' do início se existir para montar o caminho absoluto
        // O servidor serve arquivos de backend/uploads
        // webPath ex: /uploads/papertoys/Organizados/DC_Comics/batman.png

        const relativePath = webPath.startsWith('/uploads') ? webPath.substring(8) : webPath;
        const fullPath = path.join(__dirname, 'uploads', relativePath);
        // Nota: webPath pode ter encoded URI se foi salvo assim, mas geralmente no banco está "cru" ou com espaços.
        // O fs.existsSync precisa do caminho decodificado (com espaços reais).

        const decodedPath = decodeURI(fullPath);

        if (!fs.existsSync(decodedPath)) {
            missingCount++;
            console.log(`[FALTANDO] Modulo: ${aula.modulo.nome} | Aula: ${aula.nome}`);
            console.log(`   - Caminho BD: ${webPath}`);
            console.log(`   - Tentou ler: ${decodedPath}`);

            // Tentar encontrar arquivo similar (case insensitive search no diretório pai)
            const dir = path.dirname(decodedPath);
            const filename = path.basename(decodedPath);

            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir);
                const match = files.find(f => f.toLowerCase() === filename.toLowerCase());
                if (match) {
                    console.log(`   - SUGESTÃO: Arquivo existe com caixa diferente: ${match}`);
                } else {
                    console.log(`   - ERRO: Arquivo realmente não encontrado na pasta.`);
                }
            } else {
                console.log(`   - ERRO: A pasta do arquivo também não existe: ${dir}`);
            }
            console.log('-------------------------------------------');
        }
    }

    console.log(`Verificação concluída. ${missingCount} imagens faltando de ${aulas.length}.`);
}

verifyImages()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
