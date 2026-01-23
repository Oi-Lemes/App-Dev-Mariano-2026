import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Iniciando Seed do Bônus: Quebra Cabeça LEGO...");

    // 1. Criar o Módulo
    const nomeModulo = "Bônus – Quebra Cabeça LEGO Heróis";
    const imagemCapa = "/img/capa-quebra-cabeca.jpg";

    // Verificar se já existe para não duplicar
    let modulo = await prisma.modulo.findFirst({
        where: { nome: nomeModulo }
    });

    if (!modulo) {
        modulo = await prisma.modulo.create({
            data: {
                nome: nomeModulo,
                description: "Divirta-se montando quebra-cabeças incríveis dos seus heróis favoritos!",
                ordem: 99, // Fica lá no final
                imagem: imagemCapa
            }
        });
        console.log(`✅ Módulo Criado: ${modulo.nome} (ID: ${modulo.id})`);
    } else {
        console.log(`ℹ️ Módulo já existe: ${modulo.nome} (ID: ${modulo.id})`);
    }

    // 2. Ler os arquivos da pasta
    const folderPath = path.join(__dirname, 'uploads', 'quebra-cabeca');

    if (!fs.existsSync(folderPath)) {
        console.error(`❌ Erro: Pasta não encontrada: ${folderPath}`);
        return;
    }

    const files = fs.readdirSync(folderPath).filter(f => f.toLowerCase().endsWith('.png') || f.toLowerCase().endsWith('.jpg'));
    console.log(`📂 Encontrados ${files.length} arquivos para cadastrar.`);

    // 3. Cadastrar as Aulas
    let ordemAula = 1;
    for (const file of files) {
        const nomeAula = file.replace(/\.(png|jpg|jpeg)/i, '').replace(/_/g, ' '); // Remove extensão e underlines
        const fileUrl = `/uploads/quebra-cabeca/${file}`;

        // Verifica se a aula já existe no módulo
        const aulaExistente = await prisma.aula.findFirst({
            where: {
                moduloId: modulo.id,
                downloadUrl: fileUrl
            }
        });

        if (!aulaExistente) {
            await prisma.aula.create({
                data: {
                    nome: nomeAula,
                    descricao: "Baixe a imagem para imprimir e montar seu quebra-cabeça!",
                    videoUrl: fileUrl, // Usa a mesma imagem como preview
                    downloadUrl: fileUrl,
                    isImage: true,
                    ordem: ordemAula,
                    moduloId: modulo.id
                }
            });
            console.log(`   ➕ Aula adicionada: ${nomeAula}`);
        } else {
            console.log(`   ℹ️ Aula já existe: ${nomeAula}`);
        }
        ordemAula++;
    }

    console.log("✨ Seed Concluído com Sucesso!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
