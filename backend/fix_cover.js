import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔧 Corrigindo capa do módulo bônus...");

    // Busca o módulo pelo nome
    const modulo = await prisma.modulo.findFirst({
        where: { nome: "Bônus – Quebra Cabeça LEGO Heróis" }
    });

    if (modulo) {
        // Atualiza a imagem
        await prisma.modulo.update({
            where: { id: modulo.id },
            data: { imagem: "/img/capa-quebra-cabeca-v2.jpg" }
        });
        console.log(`✅ Capa atualizada para: /img/capa-quebra-cabeca.jpg (Módulo ID: ${modulo.id})`);
    } else {
        console.log("❌ Módulo não encontrado!");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
