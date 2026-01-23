import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const modulos = await prisma.modulo.findMany({
        where: { nome: { contains: 'Pokemon', mode: 'insensitive' } }
    });
    console.log("Modules found:", modulos);

    if (modulos.length > 0) {
        const aulas = await prisma.aula.findMany({
            where: { moduloId: modulos[0].id }
        });
        console.log("Lessons in first module:", aulas.map(a => a.nome));
    }
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
