
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const phoneInput = '(11) 93278-6835';
    const cleanPhone = phoneInput.replace(/\D/g, ''); // 11932786835

    console.log(`Concedendo acesso para: ${phoneInput} -> ${cleanPhone}`);

    try {
        const user = await prisma.user.upsert({
            where: { phone: cleanPhone },
            update: {
                plan: 'premium',
                status: 'active',
                hasLiveAccess: true,
                hasNinaAccess: true,
                hasWalletAccess: true,
            },
            create: {
                phone: cleanPhone,
                email: `${cleanPhone}@user.com`,
                name: 'Usuário VIP',
                plan: 'premium',
                status: 'active',
                hasLiveAccess: true,
                hasNinaAccess: true,
                hasWalletAccess: true,
            },
        });
        console.log(`✅ Sucesso! Usuário ${user.name} liberado.`);
    } catch (e) {
        console.error('❌ Erro:', e);
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
