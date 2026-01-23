import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Adicionando Emoji no Módulo Bônus...");

    // Tenta encontrar pelo nome antigo ou aproximado
    const modulo = await prisma.modulo.findFirst({
        where: {
            nome: { contains: 'Quebra Cabeça LEGO', mode: 'insensitive' }
        }
    });

    if (!modulo) {
        console.error("❌ Módulo Bônus não encontrado.");
        return;
    }

    // Se já tem o emoji, não duplica
    if (modulo.nome.includes('🎁')) {
        console.log("⚠️ O módulo já possui emoji:", modulo.nome);
        return;
    }

    const novoNome = `🎁 ${modulo.nome}`;

    await prisma.modulo.update({
        where: { id: modulo.id },
        data: { nome: novoNome }
    });

    console.log(`✅ Nome atualizado para: "${novoNome}"`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
