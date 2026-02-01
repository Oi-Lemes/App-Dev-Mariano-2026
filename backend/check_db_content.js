
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const modules = await prisma.modulo.findMany();
        console.log("--- MODULES IN DB ---");
        modules.forEach(m => console.log(`ID: ${m.id} | Name: ${m.nome}`));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
