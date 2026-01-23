import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const aulas = await prisma.aula.findMany({
        take: 10,
        where: { isImage: true },
        select: { id: true, nome: true, downloadUrl: true }
    });
    console.log(aulas);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
