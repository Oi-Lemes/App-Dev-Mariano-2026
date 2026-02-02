
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const modules = await prisma.modulo.findMany({
            include: { aulas: true }
        });
        console.log("--- MODULES & LESSONS IN DB ---");
        modules.forEach(m => {
            console.log(`\nMODULE: [${m.id}] ${m.nome}`);
            if (m.aulas.length > 0) {
                m.aulas.forEach(a => {
                    console.log(`   - LESSON: [${a.id}] ${a.nome}`);
                    console.log(`     isImage: ${a.isImage}`);
                    console.log(`     videoUrl: ${a.videoUrl}`);
                    console.log(`     pdfUrl: ${a.pdfUrl}`);
                });
            } else {
                console.log("   (No lessons)");
            }
        });
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
