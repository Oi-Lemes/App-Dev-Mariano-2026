
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'teste@catolico.com';
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (!existingUser) {
        await prisma.user.create({
            data: {
                email,
                name: 'Usuário Teste',
                password: '123', // Em produção deveria ser hash, mas para dev local ok
                plan: 'premium',
                hasLiveAccess: true,
                hasNinaAccess: true,
                hasWalletAccess: true,
            },
        });
        console.log('Usuário teste criado: teste@catolico.com / 123');
    } else {
        console.log('Usuário teste já existe.');
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
