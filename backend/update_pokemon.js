import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

const TO_DELETE = [
    'pokeball', 'pokemon 1', 'pokemon 2', 'pokemon 3',
    'pokemon 4', 'pokemon 5', 'pokemon 7', 'pokemon 8'
];

async function main() {
    console.log("🚀 Atualizando Módulo Pokemon...");

    const moduleId = 73;

    // 1. Deletar Aulas Antigas
    console.log(`🗑️ Removendo aulas antigas: ${TO_DELETE.join(', ')}`);
    const deleteResult = await prisma.aula.deleteMany({
        where: {
            moduloId: moduleId,
            nome: { in: TO_DELETE }
        }
    });
    console.log(`✅ ${deleteResult.count} aulas removidas do banco.`);

    // 2. Mover Arquivos Novos
    const sourceDir = path.resolve(__dirname, '../pokemons');
    const destDir = path.resolve(__dirname, 'uploads/papertoys/Organizados/Pokemon');

    if (!fs.existsSync(sourceDir)) {
        console.error(`❌ Pasta de origem não encontrada: ${sourceDir}`);
        return;
    }
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    const files = fs.readdirSync(sourceDir).filter(f => f.match(/\.(png|jpg|jpeg)$/i));
    console.log(`📂 Encontrados ${files.length} novos arquivos na pasta 'pokemons'.`);

    let newCoverImage = null;

    for (const file of files) {
        const sourcePath = path.join(sourceDir, file);
        const destPath = path.join(destDir, file);

        // Copia (overwrite se existir)
        fs.copyFileSync(sourcePath, destPath);

        const nomeAula = file.replace(/\.(png|jpg|jpeg)/i, '').replace(/_/g, ' ');
        const downloadUrl = `/uploads/papertoys/Organizados/Pokemon/${file}`;

        // Verifica se já existe
        const exists = await prisma.aula.findFirst({
            where: { moduloId: moduleId, downloadUrl: downloadUrl }
        });

        if (!exists) {
            await prisma.aula.create({
                data: {
                    nome: nomeAula,
                    descricao: "Paper Toy Pokemon para montar!",
                    videoUrl: downloadUrl, // Preview
                    downloadUrl: downloadUrl,
                    isImage: true,
                    ordem: 99, // Vai para o fim
                    moduloId: moduleId
                }
            });
            console.log(`   ➕ Adicionado: ${nomeAula}`);
        } else {
            console.log(`   ℹ️ Já existe: ${nomeAula}`);
        }

        // Define Pikachu ou a primeira como capa
        if (file.toLowerCase().includes('pikachu') || !newCoverImage) {
            newCoverImage = downloadUrl;
        }
    }

    // 3. Atualizar Capa do Módulo
    if (newCoverImage) {
        await prisma.modulo.update({
            where: { id: moduleId },
            data: { imagem: newCoverImage }
        });
        console.log(`🖼️ Capa do módulo atualizada para: ${newCoverImage}`);
    }

    console.log("✨ Atualização Concluída!");
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
