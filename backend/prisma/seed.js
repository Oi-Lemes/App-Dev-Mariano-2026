import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Iniciando Seed Mestre REVISADO: Priorizando Capas dos Personagens...");

    // --- 1. LIMPEZA ---
    console.log("🧹 Limpando banco de dados...");
    await prisma.progresso.deleteMany({});
    await prisma.aula.deleteMany({});
    await prisma.modulo.deleteMany({});
    // await prisma.user.deleteMany({}); 
    console.log("✅ Banco limpo.");

    let globalModuleOrder = 1;

    // MAPA DE PRIORIDADE DE CAPAS (Main Character First)
    const COVER_PRIORITIES = {
        'Naruto': ['naruto_1.png', 'naruto', 'kakashi'],
        'Dragon_Ball': ['goku-dbz.png', 'goku', 'vegeta'],
        'Pokemon': ['pikachu', 'charizard', 'mewtwo'],
        'Super_Mario': ['mario', 'yoshi'],
        'Sonic': ['sonic', 'tails'],
        'DC_Comics': ['batman', 'superman', 'wonder'],
        'Marvel': ['homem de ferro', 'iron man', 'spider', 'capitao'],
        'Star_Wars': ['darth', 'vader', 'yoda'],
        'One_Piece': ['luffy', 'zoro', 'chopper'],
        'Harry_Potter': ['harry', 'hermione'],
        'Zelda': ['link', 'zelda']
    };

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

            // Lógica Inteligente de Capa
            let coverImage = `/uploads/papertoys/Organizados/${folder}/${files[0]}`; // Default: primeiro arquivo

            // Verifica prioridades
            const priorities = COVER_PRIORITIES[folder] || COVER_PRIORITIES[folder.replace(/ /g, '_')];
            if (priorities) {
                for (const keyword of priorities) {
                    const found = files.find(f => f.toLowerCase().includes(keyword.toLowerCase()));
                    if (found) {
                        coverImage = `/uploads/papertoys/Organizados/${folder}/${found}`;
                        break; // Achou o melhor, para.
                    }
                }
            }

            const modulo = await prisma.modulo.create({
                data: {
                    nome: modelName,
                    description: `Coleção completa de Paper Toys: ${modelName}`,
                    ordem: globalModuleOrder++,
                    imagem: coverImage
                }
            });

            console.log(`📦 Módulo Criado: ${modulo.nome} (${files.length} aulas) -> Capa: ${path.basename(coverImage)}`);

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
            // Tenta achar Homem Aranha ou Batman para capa, senão pega o primeiro
            let bonusCover = bonusFiles[0];
            const heroPriority = ['aranha', 'spider', 'batman', 'iron', 'ferro'];
            for (const p of heroPriority) {
                const found = bonusFiles.find(f => f.toLowerCase().includes(p));
                if (found) { bonusCover = found; break; }
            }

            const bonusModulo = await prisma.modulo.create({
                data: {
                    nome: "🎁 Bônus – Quebra Cabeça LEGO Heróis",
                    description: "Divirta-se montando quebra-cabeças incríveis!",
                    ordem: 900, // Ordem alta para ficar no final
                    imagem: `/uploads/quebra-cabeca/${bonusCover}`
                }
            });
            console.log(`🎁 Módulo Bônus Criado: ${bonusModulo.nome} -> Capa: ${bonusCover}`);

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
            ordem: 9999, // Bem no final
            imagem: '/img/certificate-cover.jpg'
        },
    });
    console.log('🏆 Módulo Certificado Criado (Fim da Lista).');

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