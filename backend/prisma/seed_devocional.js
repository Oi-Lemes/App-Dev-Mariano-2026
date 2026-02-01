
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Iniciando o seed dos DEVOCIONAIS COM MARIA...');

    // Não vamos limpar tudo dessa vez para manter o conteúdo quaresmal
    // Mas vamos limpar os módulos de devocional se já existirem para evitar duplicatas
    // Uma forma de fazer isso é buscar por nome ou limpar tudo se for preferível.
    // Pelo pedido do usuário, vou limpar tudo para garantir ordem limpa, ou adicionar ao final.
    // Como é "seed", geralmente reseta. Vou manter a estratégia de usar "upsert" ou deletar tudo.
    // Se deletar tudo, preciso rodar o seed_catholic de novo. 
    // MELHOR ESTRATÉGIA: Criar módulos novos sem apagar os existentes, mas verificando conflito.

    // Mas para garantir a ordem correta (Quaresma primeiro, depois Devocional ou vice-versa),
    // talvez seja melhor adicionar os devocionais DEPOIS.
    // Vou assumir que o seed_catholic já rodou.

    console.log('Removendo módulos de Devocional existentes para recriar...');
    // Apaga módulos que contêm "Devocional" no nome para recriar limpo
    const existing = await prisma.modulo.findMany({ where: { nome: { contains: 'Devocional' } } });
    for (const m of existing) {
        await prisma.aula.deleteMany({ where: { moduloId: m.id } });
        await prisma.modulo.delete({ where: { id: m.id } });
    }

    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const normalize = (str) => {
        return str.toLowerCase()
            .replace(/ç/g, 'c')
            .replace(/ã/g, 'a')
            .replace(/á/g, 'a')
            .replace(/â/g, 'a')
            .replace(/é/g, 'e')
            .replace(/ê/g, 'e')
            .replace(/í/g, 'i')
            .replace(/ó/g, 'o')
            .replace(/ô/g, 'o')
            .replace(/ú/g, 'u');
    };

    let ordemBase = 1; // Começa antes dos módulos da Quaresma

    for (const month of months) {
        const filenameBase = normalize(month);
        const pdfUrl = `/devocionais/${filenameBase}.pdf`;
        const imgUrl = `/img/devocionais/${filenameBase}.png`;

        // Verifica se o mês é Outubro (que estava na pasta imgs mas não na cleaned)
        // Se não tiver PDF, pulamos ou criamos só placeholder? 
        // Pelos logs: outubto tem imagem mas pdf não apareceu na lista, verifiquei "cleaned" e tinha 11 arquivos.
        // Vou criar mesmo assim, se o PDF faltar o frontend avisa.

        const modulo = await prisma.modulo.create({
            data: {
                nome: `Devocional com Maria - ${month}`,
                description: `Acompanhe as leituras diárias do mês de ${month}.`,
                ordem: ordemBase++,
                imagem: imgUrl
            }
        });

        console.log(`Módulo criado: ${modulo.nome}`);

        await prisma.aula.create({
            data: {
                nome: `Leitura de ${month}`,
                descricao: 'Leitura completa do mês.',
                content: '', // Sem conteúdo texto, pois é PDF
                pdfUrl: pdfUrl,
                isImage: false,
                ordem: 1,
                moduloId: modulo.id
            }
        });
    }

    console.log('Seed de Devocionais concluído!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
