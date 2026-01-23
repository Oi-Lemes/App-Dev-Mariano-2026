import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Iniciando Seed Mestre: Sincronizando Banco de Dados com Arquivos...");

    // --- 1. LIMPEZA ---
    console.log("🧹 Limpando banco de dados...");
    await prisma.progresso.deleteMany({});
    await prisma.aula.deleteMany({});
    await prisma.modulo.deleteMany({});
    // await prisma.user.deleteMany({}); // Manter usuários se possível, ou descomentar se quiser reset total
    console.log("✅ Banco limpo.");

    let globalModuleOrder = 1;

    // --- 2. MÓDULOS PRINCIPAIS (PAPERTOYS) ---
    const baseDir = path.join(__dirname, '../uploads/papertoys/Organizados');

    if (fs.existsSync(baseDir)) {
        const folders = fs.readdirSync(baseDir).filter(f => fs.statSync(path.join(baseDir, f)).isDirectory());
        console.log(`📂 Encontradas ${folders.length} categorias em 'Organizados'.`);

        for (const folder of folders) {
            const folderPath = path.join(baseDir, folder);
            const files = fs.readdirSync(folderPath).filter(f => f.match(/\.(png|jpg|jpeg)$/i));

            if (files.length === 0) {
                console.log(`⚠️ Ignorando pasta vazia: ${folder}`);
                continue;
            }

            // Nome formatado: "DC_Comics" -> "DC Comics"
            const modelName = folder.replace(/_/g, ' ');

            // Primeira imagem serve de capa (ou tenta achar uma "capa" se houver lógica, mas vamos usar a primeira random file)
            // Se houver pikachu no pokemon, preferir
            let coverImage = `/uploads/papertoys/Organizados/${folder}/${files[0]}`;
            if (folder.toLowerCase() === 'pokemon') {
                const pikachu = files.find(f => f.toLowerCase().includes('pikachu'));
                if (pikachu) coverImage = `/uploads/papertoys/Organizados/${folder}/${pikachu}`;
            }

            const modulo = await prisma.modulo.create({
                data: {
                    nome: modelName,
                    description: `Coleção completa de Paper Toys: ${modelName}`,
                    ordem: globalModuleOrder++,
                    imagem: coverImage
                }
            });

            console.log(`📦 Módulo Criado: ${modulo.nome} (${files.length} aulas)`);

            let aulaOrder = 1;
            for (const file of files) {
                const aulaName = file.replace(/\.(png|jpg|jpeg)/i, '').replace(/_/g, ' ');
                const fileUrl = `/uploads/papertoys/Organizados/${folder}/${file}`;

                await prisma.aula.create({
                    data: {
                        nome: aulaName,
                        descricao: "Baixe, imprima e monte!",
                        videoUrl: fileUrl, // Preview
                        downloadUrl: fileUrl,
                        isImage: true,
                        ordem: aulaOrder++,
                        moduloId: modulo.id
                    }
                });
            }
        }
    } else {
        console.error(`❌ Diretório base não encontrado: ${baseDir}`);
    }

    // --- 3. BÔNUS (QUEBRA-CABEÇA) ---
    const bonusDir = path.join(__dirname, '../uploads/quebra-cabeca');
    if (fs.existsSync(bonusDir)) {
        const bonusFiles = fs.readdirSync(bonusDir).filter(f => f.match(/\.(png|jpg|jpeg)$/i));

        if (bonusFiles.length > 0) {
            const bonusModulo = await prisma.modulo.create({
                data: {
                    nome: "🎁 Bônus – Quebra Cabeça LEGO Heróis",
                    description: "Divirta-se montando quebra-cabeças incríveis!",
                    ordem: 900, // Ordem alta para ficar no final
                    imagem: `/uploads/quebra-cabeca/${bonusFiles[0]}` // Pega o primeiro como capa
                }
            });
            console.log(`🎁 Módulo Bônus Criado: ${bonusModulo.nome}`);

            let bonusOrder = 1;
            for (const file of bonusFiles) {
                const aulaName = file.replace(/\.(png|jpg|jpeg)/i, '').replace(/_/g, ' ');
                const fileUrl = `/uploads/quebra-cabeca/${file}`;

                await prisma.aula.create({
                    data: {
                        nome: aulaName,
                        descricao: "Imprima e monte o quebra-cabeça!",
                        videoUrl: fileUrl,
                        downloadUrl: fileUrl,
                        isImage: true,
                        ordem: bonusOrder++,
                        moduloId: bonusModulo.id
                    }
                });
            }
        }
    }

    // --- 4. CERTIFICADO ---
    await prisma.modulo.create({
        data: {
            nome: 'EMISSÃO DO CERTIFICADO',
            description: 'Parabéns! Conclua o curso para emitir seu certificado.',
            ordem: 999,
            imagem: '/img/certificate-cover.jpg' // Imagem genérica ou uma que exista. Se não existir, vai ficar quebrado, ideal checar. 
            // Vamos usar uma imagem de placeholder se não tivermos certeza, mas o frontend pode ter fallback.
        },
    });
    console.log('🏆 Módulo Certificado Criado.');

    console.log("✨ Seed Mestre Concluído!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });