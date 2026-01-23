
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const oldPhone = '(11) 9327-86835';
    const newPhone = '11932786835';

    console.log(`Atualizando telefone de '${oldPhone}' para '${newPhone}'...`);

    try {
        const user = await prisma.user.updateMany({
            where: { phone: oldPhone },
            data: { phone: newPhone },
        });

        if (user.count > 0) {
            console.log('✅ Usuário atualizado com sucesso!');
        } else {
            console.log('⚠️ Usuário não encontrado com o formato antigo.');
            // Tenta ver se já está atualizado ou se não existe
            const check = await prisma.user.findFirst({ where: { phone: newPhone } });
            if (check) {
                console.log('ℹ️ O usuário já estava com o formato correto.');
            } else {
                console.error('❌ Usuário realmente não encontrado.');
            }
        }
    } catch (error) {
        console.error('❌ Erro ao atualizar:', error);
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
