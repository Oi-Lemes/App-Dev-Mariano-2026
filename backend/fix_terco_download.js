
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Buscando a aula do Terço...');
    const aula = await prisma.aula.findFirst({
        where: { nome: { contains: 'Rezar o Terço' } }
    });

    if (!aula) {
        console.error('❌ Aula não encontrada!');
        return;
    }

    const updated = await prisma.aula.update({
        where: { id: aula.id },
        data: {
            downloadUrl: null // REMOVE O BOTÃO DE DOWNLOAD
        }
    });

    console.log('✅ Botão de download removido com sucesso!');
    console.log(`   Aula: ${updated.nome}`);
    console.log(`   DownloadURL: ${updated.downloadUrl}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
