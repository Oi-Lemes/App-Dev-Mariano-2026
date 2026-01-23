
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const phone = '(11) 9327-86835';
    // Gerando um email único baseado no telefone para satisfazer a constraint unique
    const email = 'user_11932786835@example.com'; 

    console.log(`Concedendo acesso ao número: ${phone}...`);

    try {
        const user = await prisma.user.upsert({
            where: { phone: phone },
            update: {
                status: 'active',
                plan: 'premium',
                hasLiveAccess: true,
                hasNinaAccess: true,
                hasWalletAccess: true,
            },
            create: {
                phone: phone,
                email: email,
                name: 'Aluno VIP',
                status: 'active',
                plan: 'premium',
                hasLiveAccess: true,
                hasNinaAccess: true,
                hasWalletAccess: true,
            },
        });
        console.log('✅ Acesso concedido com sucesso para:', user.phone);
        console.log('Detalhes:', user);
    } catch (error) {
        console.error('❌ Erro ao conceder acesso:', error);
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
