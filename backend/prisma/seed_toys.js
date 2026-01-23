
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ajuste o caminho para apontar para a pasta onde você moveu os arquivos
// backend/prisma/ -> backend/uploads/papertoys/Organizados
const TOYS_ROOT = path.join(__dirname, '..', 'uploads', 'papertoys', 'Organizados');
const BASE_URL_PREFIX = '/uploads/papertoys/Organizados';

async function main() {
    console.log('🚀 Iniciando Seed de Paper Toys...');

    if (!fs.existsSync(TOYS_ROOT)) {
        console.error(`❌ Pasta não encontrada: ${TOYS_ROOT}`);
        process.exit(1);
    }

    // 1. Limpar Banco
    console.log('🧹 Limpando módulos e aulas antigos...');
    await prisma.progresso.deleteMany({});
    await prisma.aula.deleteMany({});
    await prisma.modulo.deleteMany({});
    console.log('✅ Banco limpo.');

    // 2. Ler Pastas (Categorias -> Módulos)
    const categorias = fs.readdirSync(TOYS_ROOT).filter(file => {
        return fs.statSync(path.join(TOYS_ROOT, file)).isDirectory();
    });

    console.log(`📦 Encontradas ${categorias.length} categorias.`);

    let ordemModulo = 1;

    for (const categoria of categorias) {
        const catPath = path.join(TOYS_ROOT, categoria);
        const files = fs.readdirSync(catPath).filter(f => f.match(/\.(jpg|jpeg|png|webp|gif)$/i)); // Só imagens

        if (files.length === 0) continue;

        // Tenta achar uma imagem de capa para o módulo
        // Pega a primeira imagem encontrada na pasta
        const capaFile = files.find(f => f.match(/\.(jpg|jpeg|png|webp)$/i)) || files[0];
        const capaUrl = `${BASE_URL_PREFIX}/${categoria}/${capaFile}`;

        // Cria o Módulo
        const modulo = await prisma.modulo.create({
            data: {
                nome: categoria.replace(/_/g, ' '), // Ex: DC_Comics -> DC Comics
                description: `Coleção de Paper Toys: ${categoria.replace(/_/g, ' ')}`,
                ordem: ordemModulo++,
                imagem: capaUrl
            }
        });

        console.log(`  📂 Módulo Criado: ${modulo.nome} (ID: ${modulo.id}) - ${files.length} arquivos`);

        let ordemAula = 1;
        const aulasData = [];

        for (const file of files) {
            // Ignora arquivos de sistema
            if (file === 'Thumbs.db' || file === '.DS_Store') continue;

            const filePath = path.join(catPath, file);
            const relativeUrl = `${BASE_URL_PREFIX}/${categoria}/${file}`;

            // Verifica tipo de arquivo para definir isImage
            const isImage = !!file.match(/\.(jpg|jpeg|png|webp|gif)$/i);

            aulasData.push({
                nome: file.replace(/\.[^/.]+$/, "").replace(/_/g, ' '), // Remove extensão e _
                descricao: `Paper Toy: ${file}`,
                videoUrl: relativeUrl, // Usamos o videoUrl como Preview/Source visual
                downloadUrl: relativeUrl, // Mesmo link para download
                isImage: isImage,
                ordem: ordemAula++,
                moduloId: modulo.id
            });
        }

        if (aulasData.length > 0) {
            await prisma.aula.createMany({ data: aulasData });
        }
    }

    console.log('🏁 Seed Finalizado com Sucesso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
