
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Buscando a aula do Terço...');
    const aula = await prisma.aula.findFirst({
        where: { nome: { contains: 'Rezar o Terço' } }
    });

    if (!aula) {
        console.error('❌ Aula não encontrada!');
        return;
    }

    const rosaryContent = `
# Como Rezar o Santo Rosário

O Rosário é uma das orações mais poderosas da nossa fé. Abaixo, você encontra o passo a passo completo para rezá-lo.

## 1. Sinal da Cruz
Em nome do Pai, do Filho e do Espírito Santo. Amém.

## 2. Oferecimento
Divino Jesus, nós Vos oferecemos este Terço que vamos rezar, meditando nos mistérios da Vossa Redenção. Concedei-nos, por intercessão da Virgem Maria, Mãe de Deus e nossa Mãe, as virtudes que nos são necessárias para bem rezá-lo e a graça de ganharmos as indulgências desta santa devoção.

## 3. Credo (Creio)
Creio em Deus Pai Todo-Poderoso, Criador do céu e da terra; e em Jesus Cristo, seu único Filho, nosso Senhor; que foi concebido pelo poder do Espírito Santo; nasceu da Virgem Maria, padeceu sob Pôncio Pilatos, foi crucificado, morto e sepultado; desceu à mansão dos mortos; ressuscitou ao terceiro dia; subiu aos céus, está sentado à direita de Deus Pai todo-poderoso, donde há de vir a julgar os vivos e os mortos. Creio no Espírito Santo, na Santa Igreja Católica, na comunhão dos santos, na remissão dos pecados, na ressurreição da carne, na vida eterna. Amém.

## 4. Pai Nosso
Pai Nosso que estais nos Céus, santificado seja o vosso Nome, venha a nós o vosso Reino, seja feita a vossa vontade assim na terra como no Céu. O pão nosso de cada dia nos dai hoje, perdoai-nos as nossas ofensas assim como nós perdoamos a quem nos tem ofendido, e não nos deixeis cair em tentação, mas livrai-nos do Mal. Amém.

## 5. Três Ave-Marias
(Pelas virtudes teologais: Fé, Esperança e Caridade)
Ave Maria, cheia de graça, o Senhor é convosco, bendita sois vós entre as mulheres e bendito é o fruto do vosso ventre, Jesus. Santa Maria, Mãe de Deus, rogai por nós pecadores, agora e na hora da nossa morte. Amém.

## 6. Glória
Glória ao Pai e ao Filho e ao Espírito Santo. Como era no princípio, agora e sempre. Amém.

## 7. Mistérios do Rosário
A cada mistério, reza-se:
- 1 Pai Nosso
- 10 Ave Marias
- 1 Glória
- Jaculatória: "Ó meu Jesus, perdoai-nos, livrai-nos do fogo do inferno, levai as almas todas para o céu e socorrei principalmente as que mais precisarem."

### Mistérios Gozosos (Segundas e Sábados)
1. A Anunciação do Anjo a Maria.
2. A Visitação de Maria a sua prima Santa Isabel.
3. O Nascimento de Jesus em Belém.
4. A Apresentação do Menino Jesus no Templo.
5. A Perda e o Encontro do Menino Jesus no Templo.

### Mistérios Dolorosos (Terças e Sextas)
1. A Agonia de Jesus no Horto das Oliveiras.
2. A Flagelação de Jesus atado à coluna.
3. A Coroação de Espinhos.
4. Jesus carrega a Cruz até o Calvário.
5. A Crucificação e Morte de Jesus.

### Mistérios Gloriosos (Quartas e Domingos)
1. A Ressurreição de Jesus.
2. A Ascensão de Jesus ao Céu.
3. A Vinda do Espírito Santo sobre os Apóstolos.
4. A Assunção de Maria ao Céu.
5. A Coroação de Maria como Rainha do Céu e da Terra.

### Mistérios Luminosos (Quintas)
1. O Batismo de Jesus no Rio Jordão.
2. As Bodas de Caná.
3. O Anúncio do Reino de Deus e convite à conversão.
4. A Transfiguração de Jesus.
5. A Instituição da Eucaristia.

## 8. Salve Rainha
Salve, Rainha, Mãe de misericórdia, vida, doçura e esperança nossa, salve! A vós bradamos, os degredados filhos de Eva; a vós suspiramos, gemendo e chorando neste vale de lágrimas. Eia, pois, advogada nossa, esses vossos olhos misericordiosos a nós volvei, e depois deste desterro mostrai-nos Jesus, bendito fruto do vosso ventre, ó clemente, ó piedosa, ó doce sempre Virgem Maria.
Rogai por nós, Santa Mãe de Deus, para que sejamos dignos das promessas de Cristo. Amém.
`;

    const updated = await prisma.aula.update({
        where: { id: aula.id },
        data: {
            pdfUrl: null, // REMOVE O PDF DA TELA
            videoUrl: '/uploads/imgs/diagrama_terco.png', // NOVA IMAGEM DIAGRAMA
            content: rosaryContent,
            isImage: true
        }
    });

    console.log('✅ Conteúdo do Terço atualizado com sucesso!');
    console.log('   PDF removido, Imagem Diagrama definida e Texto Transcrito.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
