import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixQuizDb() {
    console.log('🔧 Verificando integridade do Quiz no Banco de Dados...');

    try {
        // 1. Garantir que o Módulo 102 existe (Quiz)
        const quizModule = await prisma.modulo.upsert({
            where: { id: 102 },
            update: {},
            create: {
                id: 102,
                nome: 'Avaliação Final',
                description: 'Complete o Quiz para receber seu certificado.',
                ordem: 100, // Final do curso
                imagem: 'https://placehold.co/600x400/eab308/ffffff?text=Quiz+Final'
            }
        });
        console.log(`✅ Módulo Quiz (102) verificado: ${quizModule.nome}`);

        // 2. Garantir que a Aula 999 existe (Lógica de Conclusão)
        const quizLesson = await prisma.aula.upsert({
            where: { id: 999 },
            update: {},
            create: {
                id: 999,
                nome: 'Avaliação Final (Sistema)',
                descricao: 'Aula lógica para registrar a conclusão do Quiz.',
                videoUrl: 'https://quiz-placeholder', // Não usado
                ordem: 1,
                moduloId: 102
            }
        });
        console.log(`✅ Aula Quiz (999) verificada: ${quizLesson.nome}`);

    } catch (error) {
        console.error('❌ Erro ao corrigir DB do Quiz:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixQuizDb();
