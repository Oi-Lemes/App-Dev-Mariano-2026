
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

    console.log(`✅ Aula encontrada: ${aula.nome} (ID: ${aula.id})`);
    console.log(`   PDF Atual: ${aula.pdfUrl}`);

    const updated = await prisma.aula.update({
        where: { id: aula.id },
        data: {
            pdfUrl: '/uploads/imgs/o_terco.pdf',
            downloadUrl: '/uploads/imgs/o_terco.pdf'
        }
    });

    console.log('✅ Aula ATUALIZADA com sucesso!');
    console.log(`   Novo PDF: ${updated.pdfUrl}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
