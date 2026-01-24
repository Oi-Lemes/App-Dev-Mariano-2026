import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const total = await prisma.aula.count();
    const modules = await prisma.modulo.count();
    console.log(`📊 TOTAL DB STATS:`);
    console.log(`   - Módulos: ${modules}`);
    console.log(`   - Aulas (Paper Toys): ${total}`);
    console.log(`   - Peso de 1 aula: ${(100 / total).toFixed(4)}%`);
    console.log(`   - Aulas para pegar 1%: ${Math.ceil(total / 100)}`);
}

main()
    .finally(async () => await prisma.$disconnect());
