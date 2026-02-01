
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o seed ATUALIZADO (v3 - modules) do Itinerário Quaresmal...');

  console.log('Limpando aulas e módulos antigos...');
  await prisma.progresso.deleteMany({});
  await prisma.aula.deleteMany({});
  await prisma.modulo.deleteMany({});

  // Helper para facilitar paths
  const lessonImg = (name) => `/img/lessons/${name}`;
  const moduleImg = (name) => `/img/modules/${name}`;

  const modulos = [
    {
      nome: '🎁 Bônus - Capítulo 1 - O Significado da Quaresma',
      description: 'Entenda o tempo litúrgico de conversão e penitência.',
      ordem: 101,
      imagem: moduleImg('lent.png'),
      aulas: [
        {
          nome: '1.1 O Que é a Quaresma?',
          descricao: 'Definição e propósito.',
          videoUrl: lessonImg('desert.png'),
          isImage: true,
          content: `**1.1 O Que é a Quaresma?**

A Quaresma é um tempo litúrgico de 40 dias que antecede a Páscoa do Senhor, dedicado à penitência, ao jejum, à esmola e à oração. Instituído pela Igreja desde os primeiros séculos do Cristianismo, este período convida os fiéis a uma profunda reflexão sobre a Paixão, Morte e Ressurreição de Jesus Cristo.

A palavra "Quaresma" vem do latim *Quadragesima*, que significa "quadragésimo", referindo-se ao número de dias que compõem esse tempo sagrado. Desde a Quarta-feira de Cinzas até a Quinta-feira Santa, a Igreja nos exorta a intensificar nossas práticas espirituais, imitando o exemplo de Cristo, que passou 40 dias no deserto em oração e jejum.

**1.2 A Origem Bíblica dos 40 Dias**

O número 40 possui um significado especial na Sagrada Escritura. Ele simboliza um tempo de provação, purificação e preparação espiritual. Vemos esse número em diversos momentos-chave da história da salvação:

*   O Dilúvio durou 40 dias e 40 noites, purificando a terra (Gn 7,12).
*   Moisés jejuou por 40 dias no Monte Sinai antes de receber as Tábuas da Lei (Ex 34,28).
*   O povo de Israel peregrinou por 40 anos no deserto antes de entrar na Terra Prometida (Nm 14,33).
*   O Profeta Elias caminhou 40 dias e 40 noites até o Monte Horeb (1Rs 19,8).
*   Nosso Senhor Jesus Cristo permaneceu 40 dias no deserto, jejuando e resistindo às tentações de Satanás (Mt 4,2).

A Igreja, seguindo essa tradição bíblica, instituiu a Quaresma como um tempo de renovação espiritual e conversão, preparando os corações para o grande mistério da Redenção.`
        },
        {
          nome: '1.3 Tradição e Pilares',
          descricao: 'Jejum, Esmola e Oração.',
          videoUrl: lessonImg('rosary.png'),
          isImage: true,
          content: `**1.3 Tradição e Ensinamentos da Igreja**

Desde os tempos apostólicos, os cristãos dedicavam-se a um período de penitência antes da celebração da Páscoa. No século IV, o Concílio de Nicéia (325 d.C.) oficializou a prática da Quaresma como preparação para os fiéis que desejavam receber os Sacramentos da Iniciação Cristã na Vigília Pascal.

Os Santos Padres ensinaram que a Quaresma deve ser vivida com fervor, disciplina e amor a Deus. São Leão Magno (†461) exortava os cristãos a não apenas se absterem de alimentos, mas também dos pecados: "É inútil retirar o alimento do corpo, se não retiramos os vícios da alma."

O Catecismo da Igreja Católica (§540, §1438) reforça a importância desse período: "Os tempos e dias de penitência ao longo do ano litúrgico (Quaresma, cada sexta-feira em memória da morte do Senhor) são momentos fortes da prática penitencial da Igreja."

**1.4 Os Três Pilares da Quaresma**

A Igreja propõe três práticas fundamentais para uma Quaresma autêntica:

1.  **Jejum e Abstinência:** O jejum é a privação voluntária de alimentos ou outros bens materiais, em sinal de humildade e penitência. A abstinência, por sua vez, é a renúncia a certos alimentos, como a carne, tradicionalmente observada às sextas-feiras da Quaresma.
2.  **Oração:** A Quaresma é um tempo de intensa vida espiritual. Além das orações pessoais e comunitárias, os fiéis são chamados a práticas como: O Santo Rosário, meditando os Mistérios Dolorosos; A Via Sacra, relembrando os passos de Cristo até o Calvário; A Leitura da Sagrada Escritura, especialmente os Evangelhos.
3.  **Esmola e Caridade:** A verdadeira conversão quaresmal nos impulsiona à caridade. A esmola não se refere apenas a dinheiro, mas a ações concretas de amor ao próximo, como ajudar os pobres, visitar os enfermos e perdoar os inimigos.`
        },
        {
          nome: '1.5 Propósitos para uma Quaresma Frutuosa',
          descricao: 'Como viver bem este tempo.',
          videoUrl: lessonImg('desert.png'),
          isImage: true,
          content: `**1.4 Sentido do Jejum, Esmola e Oração**

A prática desses três pilares nos permite crescer na santidade: O jejum purifica o corpo e disciplina os sentidos. A oração eleva a alma a Deus e fortalece a fé. A esmola nos desprende dos bens materiais e nos torna mais generosos. Nosso Senhor nos ensina que essas práticas devem ser feitas com humildade e discrição, e não para receber elogios:

"Quando deres esmola, não saiba a tua mão esquerda o que faz a direita. Quando orares, entra no teu quarto e, fechando a porta, ora a teu Pai em segredo. Quando jejuares, não mostres um rosto triste, para que não pareça aos homens que jejuas." (Mt 6,3-6.16)

**1.5 Propósitos para uma Quaresma Frutuosa**

Para bem viver este tempo sagrado, recomenda-se:

*   Fazer uma confissão bem preparada, limpando a alma dos pecados.
*   Assumir um propósito concreto de penitência, como renunciar a algo que afasta de Deus.
*   Aprofundar-se na leitura espiritual, como os Evangelhos da Paixão e a Imitação de Cristo.
*   Rezar pelas intenções da Santa Igreja e pela conversão dos pecadores.

A Quaresma é uma caminhada rumo à conversão verdadeira. É o tempo de abandonar o pecado, carregar a cruz com Cristo e preparar-se dignamente para celebrar Sua gloriosa Ressurreição.`
        }
      ]
    },
    {
      nome: '🎁 Bônus - Capítulo 2 - A Quarta-feira de Cinzas',
      description: 'O Início do Caminho de Conversão.',
      ordem: 102,
      imagem: moduleImg('ashes.png'),
      aulas: [
        {
          nome: '2.1 O Significado das Cinzas',
          descricao: 'Origem e Tradição.',
          videoUrl: lessonImg('ash.png'),
          isImage: true,
          content: `**2.1 O Significado da Quarta-feira de Cinzas**

A Quarta-feira de Cinzas marca o início da Quaresma, um tempo de penitência e conversão. Nesse dia, a Igreja nos convida a refletir sobre a nossa condição humana e a necessidade de nos voltarmos para Deus com um coração contrito. Durante a Santa Missa, as cinzas são impostas sobre os fiéis enquanto o sacerdote pronúncia: "Lembra-te que és pó e ao pó hás de voltar." (Gn 3,19) ou "Convertei-vos e crede no Evangelho." (Mc 1,15). Esse gesto simples, mas profundamente significativo, nos recorda a finitude da vida terrena e a necessidade de nos prepararmos para a eternidade.

**2.2 A Origem e a Tradição das Cinzas**

O uso das cinzas como símbolo de penitência tem raízes no Antigo Testamento. Os israelitas costumavam cobrir-se de cinzas e vestir-se com trajes simples como sinal de arrependimento:
* Os ninivitas se cobriram de cinzas após a pregação de Jonas (Jn 3,5-6).
* Jó, ao reconhecer sua miséria, sentou-se sobre as cinzas (Jó 42,6).
* Daniel orou e jejuou vestido de saco e coberto de cinzas (Dn 9,3).

Na Igreja primitiva, os penitentes públicos cobriam-se de cinzas ao iniciar sua caminhada de purificação espiritual. No século XI, o Papa Urbano II oficializou a Quarta-feira de Cinzas como o início da Quaresma, tornando essa tradição universal.

**2.3 O Sentido Espiritual das Cinzas**

A imposição das cinzas nos ensina três grandes lições:
* **Humildade:** Lembra-nos de nossa fragilidade e da necessidade de confiar em Deus.
* **Conversão:** Chama-nos a abandonar o pecado e viver segundo o Evangelho.
* **Preparação:** Convida-nos a trilhar um caminho de renovação espiritual até a Páscoa. As cinzas, portanto, não são um mero ritual externo, mas um sinal de compromisso interior com a santidade.`
        },
        {
          nome: '2.4 Jejum e Abstinência nas Cinzas',
          descricao: 'Regras e reflexão.',
          videoUrl: lessonImg('fasting.png'),
          isImage: true,
          content: `**2.4 O Jejum e a Abstinência na Quarta-feira de Cinzas**

A Igreja prescreve o jejum e a abstinência de carne como parte essencial desse dia de penitência.

*   **Jejum:** Permitida apenas uma refeição completa e pequenas porções ao longo do dia.
*   **Abstinência:** Proibição do consumo de carne vermelha e branca (exceto peixe).

**Quem deve cumprir essas práticas?**
O jejum é obrigatório para católicos entre 18 e 59 anos. A abstinência é obrigatória a partir dos 14 anos. Pessoas doentes, idosos e gestantes podem ser dispensados. Essas práticas nos ajudam a disciplinar o corpo e fortalecer o espírito, tornando-nos mais sensíveis à graça de Deus.

**2.5 Propósitos para a Quaresma**

A Quarta-feira de Cinzas é o momento ideal para estabelecer propósitos espirituais para viver bem a Quaresma. Algumas sugestões incluem:
*   **Rezar mais:** Dedicar um tempo especial ao Santo Rosário e à Via Sacra.
*   **Jejuar não só de alimentos:** mas também de vícios: Menos redes sociais, menos televisão, menos conversas fúteis.
*   **Praticar caridade:** Ajudar os necessitados, perdoar as ofensas e fazer pequenas renúncias pelo próximo.
*   **Confessar-se regularmente:** A confissão nos devolve a graça santificante e nos fortalece na caminhada quaresmal.

**2.6 Reflexão para a Quarta-feira de Cinzas**

Como dizia São João Crisóstomo: "Não basta jejuar da comida. Devemos jejuar dos pecados."

A Quaresma é um caminho espiritual rumo à Páscoa. A Igreja nos convida a começar essa jornada com um coração aberto à transformação.
Perguntas para meditação:
*   O que preciso mudar em minha vida espiritual?
*   Como posso viver melhor a oração, o jejum e a caridade?
*   Estou verdadeiramente disposto a trilhar esse caminho de conversão?

A conversão não acontece de um dia para o outro, mas exige esforço, renúncia e amor por Deus. "Agora é o tempo favorável, agora é o dia da salvação!" (2 Cor 6,2)`
        }
      ]
    },
    {
      nome: '🎁 Bônus - Capítulo 3 - O Caminho da Penitência',
      description: 'A Confissão e a Graça da Reconciliação.',
      ordem: 103,
      imagem: moduleImg('penance.png'),
      aulas: [
        {
          nome: '3.1 A Necessidade da Penitência',
          descricao: 'O sacramento da Confissão.',
          videoUrl: lessonImg('confession.png'),
          isImage: true,
          content: `**3.1 A Necessidade da Penitência**

A Quaresma é um tempo de arrependimento e conversão. Jesus iniciou Sua missão pública com as palavras: "Convertei-vos e crede no Evangelho." (Mc 1,15). A penitência não é apenas um ato exterior, mas um movimento interior da alma, um desejo sincero de abandonar o pecado e buscar a santidade. A Confissão Sacramental é o caminho instituído por Cristo para que possamos nos reconciliar com Deus e recomeçar nossa caminhada espiritual com um coração purificado.

**3.2 O Sacramento da Confissão: Instituição Divina**

Nosso Senhor Jesus Cristo concedeu à Igreja o poder de perdoar os pecados quando disse aos Apóstolos: "Recebei o Espírito Santo. A quem perdoardes os pecados, ser-lhes-ão perdoados; a quem os retiverdes, ser-lhes-ão retidos." (Jo 20,22-23). Desde os tempos apostólicos, os cristãos confessavam seus pecados para obter o perdão e a paz da alma. A Confissão não é uma invenção humana, mas um Sacramento instituído por Cristo para a nossa salvação.

**3.3 Os Efeitos da Confissão**

O Sacramento da Reconciliação traz graças abundantes para a alma penitente:
*   Perdão dos pecados mortais e veniais.
*   Restauração da graça santificante perdida pelo pecado grave.
*   Paz interior e fortalecimento contra futuras tentações.
*   Aumento das virtudes e do amor a Deus.

Santo Afonso de Ligório afirmava: "Não há maior alegria para uma alma do que ouvir as palavras do sacerdote: 'Eu te absolvo dos teus pecados'."`
        },
        {
          nome: '3.4 Como Fazer uma Boa Confissão?',
          descricao: 'Passos e Exame de Consciência.',
          videoUrl: lessonImg('confession.png'),
          isImage: true,
          content: `**3.4 Como Fazer uma Boa Confissão?**

Para receber bem esse Sacramento, devemos seguir cinco passos fundamentais:
1.  **Exame de Consciência:** Revisar os pecados cometidos desde a última confissão, à luz dos Dez Mandamentos e dos ensinamentos da Igreja.
2.  **Arrependimento Sincero:** Reconhecer o mal cometido e sentir verdadeira dor por ter ofendido a Deus.
3.  **Propósito de Emenda:** Decidir firmemente evitar o pecado e as ocasiões que levam a ele.
4.  **Confissão ao Sacerdote:** Declarar os pecados de maneira clara, humilde e sincera, sem esconder nada por vergonha ou medo.
5.  **Cumprimento da Penitência:** Aceitar e realizar a penitência dada pelo sacerdote como sinal de reparação e desejo de mudança.

**Dica Espiritual:** Antes de confessar-se, peça a ajuda do Espírito Santo e de Nossa Senhora para ter um coração contrito e uma confissão bem feita.

**3.5 O Perigo de Adiar a Confissão**

Infelizmente, muitos fiéis evitam a Confissão por medo ou vergonha. Porém, não há pecado que Deus não possa perdoar, desde que haja arrependimento sincero. Nunca devemos adiar a Confissão, especialmente se estivermos em pecado mortal! São João Maria Vianney advertia: "O demônio faz de tudo para afastar uma alma da Confissão, porque sabe que ali ela recupera a graça de Deus."

**3.7 Exame de Consciência**

(Aqui é apresentado um resumo. Recomenda-se ler as páginas 17-35 do PDF original para o exame completo detalhado dos mandamentos).

**Breve Guia para Exame:**
*   I Mandamento: Negligenciei a oração? Duvidei da fé?
*   II Mandamento: Usei o nome de Deus em vão? Blasfemei?
*   III Mandamento: Faltei à Missa aos domingos? Trabalhei sem necessidade?
*   IV Mandamento: Desobedeci ou desrespeitei meus pais?
*   V Mandamento: Guardei ódio, desejei mal ou causei dano a alguém?
*   VI e IX Mandamentos: Consenti em pensamentos ou atos impuros?
*   VII e X Mandamentos: Roubei ou desejei bens alheios? Fui desonesto?
*   VIII Mandamento: Menti, fiz fofoca ou julguei o próximo?

Após o exame, ore: "Senhor Deus onipotente... concedei-me luz abundante para conhecer todas as faltas e pecados..."`
        }
      ]
    }, {
      nome: '🎁 Bônus - Capítulo 4 - O Jejum e a Abstinência',
      description: 'A Disciplina do Corpo.',
      ordem: 104,
      imagem: moduleImg('fasting.png'),
      aulas: [
        {
          nome: '4.1 Significado e Origem',
          descricao: 'Por que jejuamos?',
          videoUrl: lessonImg('fasting.png'),
          isImage: true,
          content: `**4.1 O Significado do Jejum e da Abstinência**

Desde os tempos bíblicos, o jejum e a abstinência são práticas espirituais essenciais para fortalecer a alma e disciplinar o corpo. Durante a Quaresma, a Igreja nos convida a intensificar essas penitências, unindo nossos sacrifícios à Paixão de Cristo. Nosso Senhor deu o exemplo ao jejuar 40 dias e 40 noites no deserto.

"Jesus jejuou quarenta dias e quarenta noites, e por fim teve fome." (Mt 4,2)

**4.2 O Jejum na Sagrada Escritura**
*   Moisés jejuou 40 dias antes de receber as Tábuas da Lei.
*   Elias jejuou 40 dias antes de encontrar Deus.
*   Daniel jejuou em penitência.
*   Os Apóstolos jejuavam antes de decisões importantes.

**4.3 Diferença Entre Jejum e Abstinência**
*   **Jejum:** Redução da alimentação (uma refeição completa e duas menores).
*   **Abstinência:** Proibição de carne (vermelha ou branca, exceto peixe).

**4.4 O Valor Espiritual do Jejum**
O jejum não é apenas privação, mas renúncia para:
*   Vencer as tentações e fortalecer a vontade.
*   Reparar pelos pecados.
*   Criar espaço para Deus.
*   Aumentar o espírito de caridade.`
        },
        {
          nome: '4.5 Como Viver um Jejum Frutuoso',
          descricao: 'Tipos de Jejum.',
          videoUrl: lessonImg('fasting.png'),
          isImage: true,
          content: `**4.5 Como Viver um Jejum Frutuoso?**

O verdadeiro jejum não se limita à comida. Podemos jejuar de muitas outras formas:
*   **Jejum das palavras:** Falar menos e escutar mais.
*   **Jejum das distrações:** Reduzir o uso de redes sociais e TV.
*   **Jejum das queixas:** Aceitar os desafios com paciência.
*   **Jejum do egoísmo:** Ajudar mais o próximo.

São João Crisóstomo nos recorda: "O jejum da boca deve ser acompanhado pelo jejum dos olhos, dos ouvidos, dos pés, das mãos e de todas as partes do corpo."

**4.6 O Jejum e a Cruz de Cristo**
Todo sacrifício tem valor quando unido à Cruz de Nosso Senhor. Quando sentimos fome, lembramos do sofrimento de Cristo e oferecemos em reparação.

"Aquele que quiser vir após mim, renuncie a si mesmo, tome a sua cruz e siga-me." (Mt 16,24).

**4.7 Propósitos para o Jejum**
*   Escolher um tipo de jejum adequado.
*   Oferecer o sacrifício por uma intenção específica (conversão, pecadores).
*   Viver o jejum com alegria e fé, sem murmuração.`
        }
      ]
    },
    {
      nome: '🎁 Bônus - Capítulo 5 - A Oração na Quaresma',
      description: 'Aproximando-se de Deus.',
      ordem: 105,
      imagem: moduleImg('prayer.png'),
      aulas: [
        {
          nome: '5.1 Importância e Tipos',
          descricao: 'Vida de oração.',
          videoUrl: lessonImg('rosary.png'),
          isImage: true,
          content: `**5.1 A Importância da Oração na Quaresma**

A Quaresma é um tempo de conversão e renovação espiritual, e a oração é o caminho mais seguro para fortalecer a nossa relação com Deus. Durante esses 40 dias, somos chamados a intensificar nossa vida de oração, buscando maior intimidade com o Senhor. Jesus nos deixou o exemplo: "Retirava-se para lugares desertos e ali orava." (Lc 5,16).

**5.2 Os Três Tipos de Oração**
A tradição da Igreja ensina três formas essenciais:
1.  **Oração Vocal:** Feita com palavras (Pai-Nosso, Terço).
2.  **Oração Mental (Meditação):** Reflexão sobre passagens bíblicas.
3.  **Oração Contemplativa:** Silêncio interior, permitindo Deus falar.

São João Crisóstomo: "Nada é mais poderoso do que a oração; ela torna possível o que é impossível."`
        },
        {
          nome: '5.3 Orações Tradicionais',
          descricao: 'Práticas quaresmais.',
          videoUrl: lessonImg('rosary.png'),
          isImage: true,
          content: `**5.3 As Orações Tradicionais da Quaresma**

Durante a Quaresma, recomenda-se:
*   **O Santo Rosário:** Especialmente os Mistérios Dolorosos.
*   **A Via Sacra:** Percorrendo os passos de Cristo até o Calvário.
*   **Ofício das Dores de Nossa Senhora.**
*   **Salmo 50 (Miserere):** Oração de arrependimento.
*   **Ato de Contrição.**

**5.4 Como Melhorar a Vida de Oração?**
*   Criar um horário fixo.
*   Oferecer momentos de silêncio.
*   Rezar diante do Santíssimo.
*   Usar a Bíblia para meditar a Paixão.

São Padre Pio dizia: "A oração é a melhor arma que possuímos. É a chave que abre o Coração de Deus."

**5.5 Oração e Penitência**
A oração unida ao jejum é poderosa. "Vigiai e orai". A Quaresma nos ensina que não basta pedir, é preciso mudar e se oferecer a Ele.`
        }
      ]
    }, {
      nome: '🎁 Bônus - Capítulo 6 - A Caridade',
      description: 'O Chamado à Caridade.',
      ordem: 106,
      imagem: moduleImg('charity.png'),
      aulas: [
        {
          nome: '6.2 O Que é a Esmola?',
          descricao: 'Muito além do dinheiro.',
          videoUrl: lessonImg('charity.png'),
          isImage: true,
          content: `**Capítulo 6. O Chamado à Caridade na Quaresma**

"Em verdade vos digo, todas as vezes que fizestes isso a um dos menores de meus irmãos, foi a mim que o fizestes." (Mt 25,40).

A esmola é um dos três pilares da Quaresma. Segundo a Igreja, ela é:
*   Um ato de justiça (devolver o que pertence ao próximo).
*   Um ato de caridade (expressão de amor).
*   Um meio de conversão (vencer o egoísmo).

São João Crisóstomo: "Não dar esmola dos próprios bens é o mesmo que roubá-los dos pobres."`
        },
        {
          nome: '6.3 Obras de Misericórdia',
          descricao: 'Corporais e Espirituais.',
          videoUrl: lessonImg('charity.png'),
          isImage: true,
          content: `**6.3 As Obras de Misericórdia**

**Corporais (Corpo):**
1. Dar de comer a quem tem fome.
2. Dar de beber a quem tem sede.
3. Vestir os nus.
4. Dar pousada aos peregrinos.
5. Assistir aos enfermos.
6. Visitar os presos.
7. Sepultar os mortos.

**Espirituais (Alma):**
1. Ensinar os ignorantes.
2. Dar bom conselho.
3. Corrigir os que erram.
4. Consolar os aflitos.
5. Perdoar as ofensas.
6. Suportar com paciência as fraquezas do próximo.
7. Rezar pelos vivos e mortos.

**Dica:** Escolha uma obra para praticar toda semana.`
        },
        {
          nome: '6.4 Como Viver a Caridade?',
          descricao: 'Prática diária.',
          videoUrl: lessonImg('charity.png'),
          isImage: true,
          content: `**6.4 Como Viver a Caridade na Quaresma?**
*   Ajudar os pobres com doações ou visitas.
*   Perdoar quem nos ofendeu.
*   Dedicar tempo a um idoso ou doente.
*   Ser paciente na família.
*   Rezar pelos perseguidores.

**6.5 O Perigo do Apego**
A esmola ajuda a vencer a cobiça. "Não ajunteis tesouros na terra... Ajuntai tesouros no céu."

**6.6 Propósitos**
*   Doar parte do que ganha.
*   Evitar gastos supérfluos e doar esse dinheiro.
*   Voluntariado.

"A caridade é o grande motor da santidade." (São Vicente de Paulo)`
        }
      ]
    }, {
      nome: '🎁 Bônus - Capítulo 7 - Paixão de Cristo',
      description: 'Meditações sobre o Amor Redentor.',
      ordem: 107,
      imagem: moduleImg('passion.png'),
      aulas: [
        {
          nome: '7.1 O Mistério da Paixão',
          descricao: 'Meditando as Dores.',
          videoUrl: lessonImg('passion.png'),
          isImage: true,
          content: `**7.1 O Mistério da Paixão de Cristo**
A Paixão é o centro da Quaresma. Por meio do sofrimento e morte de Cristo fomos redimidos. "Cristo padeceu por vós, deixando-vos o exemplo." (1Pd 2,21).

**7.2 A Paixão no Plano da Salvação**
Deus amou tanto o mundo que enviou seu Filho. Cristo assumiu nossos pecados.

**7.3 As Dores de Cristo**
Cinco grandes sofrimentos para meditar:
1.  Agonia no Getsêmani (Lc 22,44).
2.  Flagelação (Mt 27,26).
3.  Coroação de Espinhos (Mt 27,29).
4.  Carregamento da Cruz (Jo 19,17).
5.  Crucificação e Morte (Mt 27,50).`
        },
        {
          nome: '7.4 As Sete Palavras e Maria',
          descricao: 'Palavras na Cruz e Dores de Maria.',
          videoUrl: lessonImg('passion.png'),
          isImage: true,
          content: `**7.4 As Sete Últimas Palavras de Cristo na Cruz**
1. "Pai, perdoa-lhes..." (Lc 23,34)
2. "Hoje estarás comigo no Paraíso." (Lc 23,43)
3. "Mulher, eis aí o teu filho." (Jo 19,26-27)
4. "Meu Deus, Meu Deus, por que Me abandonaste?" (Mt 27,46)
5. "Tenho sede." (Jo 19,28)
6. "Tudo está consumado." (Jo 19,30)
7. "Pai, em Tuas mãos entrego o Meu Espírito." (Lc 23,46)

**7.5 As Dores de Nossa Senhora**
Maria participou do sofrimento. Medite suas 7 dores: Profecia de Simeão, Fuga para o Egito, Perda no Templo, Encontro no Calvário, Crucificação, Descida da Cruz, Sepultamento.

**7.6 Como Meditar?**
Ler os Evangelhos, participar da Via Sacra, oferecer sacrifícios. "Cada pensamento sobre a Paixão deve nos transformar em um novo ato de amor." (Santa Teresinha).`
        }
      ]
    }, {
      nome: '🎁 Bônus - Capítulo 8 - Semana Santa',
      description: 'O Coração da Quaresma.',
      ordem: 108,
      imagem: moduleImg('holyweek.png'),
      aulas: [
        {
          nome: '8. Semana Santa: Celebrações',
          descricao: 'Do Domingo de Ramos à Páscoa.',
          videoUrl: lessonImg('palms.png'),
          isImage: true,
          content: `**8.1 Importância**
É o ápice do ano litúrgico. Acompanhamos os últimos momentos de Jesus.

**8.2 Domingo de Ramos:** Entrada triunfal em Jerusalém. "Hosana ao Filho de Davi". Acolhemos Jesus como Rei.

**8.3 Segunda, Terça e Quarta-feira Santa:** Dias de reflexão. Quarta-feira de Trevas (traição de Judas).

**8.4 Quinta-feira Santa:** Instituição da Eucaristia e do Sacerdócio na Última Ceia. Lava-pés (serviço). Translado do Santíssimo.

**8.5 Sexta-feira Santa:** Paixão e Morte. Dia de jejum e abstinência. Celebração da Paixão, Adoração da Cruz e Via Sacra. "Tudo está consumado!".

**8.6 Sábado Santo:** Vigília Pascal. Bênção do Fogo Novo, Proclamação do Exsultet. A espera da Ressurreição.

**8.7 Domingo de Páscoa:** A Vitória de Cristo! "Eu sou a Ressurreição e a Vida". Renovamos a alegria cristã.`
        }
      ]
    }, {
      nome: '🎁 Bônus - Capítulo 10 - Orações',
      description: 'Orações e Devoções.',
      ordem: 110,
      imagem: moduleImg('prayers.png'),
      aulas: [
        {
          nome: 'Orações Essenciais',
          descricao: 'Para o dia a dia.',
          videoUrl: lessonImg('rosary.png'),
          isImage: true,
          content: `**Orações para a Quaresma e para a Vida**

**Pai Nosso**
Pai nosso, que estais no Céu...

**Ave Maria**
Ave Maria cheia de graça...

**Credo**
Creio em Deus Pai Todo-Poderoso...

**Salve Rainha**
Salve Rainha, Mãe de misericórdia...

**Ato de Contrição**
Meu Deus, porque sois infinitamente bom e amável, pesa-me de Vos ter ofendido...

**Alma de Cristo**
Alma de Cristo, santificai-me. Corpo de Cristo, salvai-me...

**Oração a São Miguel Arcanjo**
São Miguel Arcanjo, defendei-nos no combate...`
        },
        {
          nome: 'Santo Rosário e Via Sacra',
          descricao: 'Devoções Marianas e da Paixão.',
          videoUrl: lessonImg('rosary.png'),
          isImage: true,
          content: `**O Santo Rosário**
Contemplamos a vida de Cristo com Maria. Na Quaresma, foco nos Mistérios Dolorosos (Agonia, Flagelação, Coroação de Espinhos, Cruz, Morte).

**A Via Sacra**
As 14 estações do caminho da Cruz. Rezar meditando cada passo, oferecendo reparação.
1. Jesus condenado à morte.
2. Jesus carrega a cruz.
3. Jesus cai pela primeira vez.
4. Jesus encontra Sua Mãe.
5. Simão Cireneu ajuda Jesus.
6. Verônica enxuga o rosto de Jesus.
7. Jesus cai pela segunda vez.
8. Jesus consola as mulheres.
9. Jesus cai pela terceira vez.
10. Jesus é despido.
11. Jesus é pregado na cruz.
12. Jesus morre na cruz.
13. Jesus é descido da cruz.
14. Jesus é sepultado.`
        }
      ]
    },
    {
      nome: 'Terço',
      description: 'Aprenda a rezar e meditar os mistérios da nossa fé.',
      ordem: 200,
      imagem: '/uploads/terco.png',
      aulas: [
        {
          nome: 'Como Rezar o Terço',
          descricao: 'Guia ilustrado com orações e mistérios.',
          videoUrl: '/uploads/terco.png',
          isImage: true, // Use image preview logic
          pdfUrl: '/uploads/imgs/o_terco.pdf', // Nome seguro (sem espaços/acentos)
          downloadUrl: '/uploads/imgs/o_terco.pdf',
          content: `**O Santo Rosário**
          
O Rosário é uma das orações mais queridas da Igreja e um poderoso instrumento de conversão. Ao recitar as Ave-Marias, meditamos os mistérios da vida de Jesus e de Maria.

**Como Rezar:**
1.  Comece com o Sinal da Cruz e o Credo.
2.  Reze um Pai-Nosso, três Ave-Marias e um Glória.
3.  Contemple os Mistérios (Gozosos, Dolorosos, Gloriosos ou Luminosos) a cada dezena.
4.  Ao final, reze a Salve Rainha.

Você pode visualizar o guia completo acima ou baixar o PDF clicando no botão abaixo.`
        }
      ]
    }
  ]; // Fim do array modulos

  for (const moduloData of modulos) {
    const modulo = await prisma.modulo.create({
      data: {
        nome: moduloData.nome,
        description: moduloData.description,
        ordem: moduloData.ordem,
        imagem: moduloData.imagem,
      },
    });

    console.log(`Módulo criado: ${modulo.nome}`);

    for (const aulaData of moduloData.aulas) {
      await prisma.aula.create({
        data: {
          nome: aulaData.nome,
          descricao: aulaData.descricao,
          content: aulaData.content,
          videoUrl: aulaData.videoUrl, // Agora temos URLs reais
          isImage: aulaData.isImage || false, // Default
          ordem: moduloData.aulas.indexOf(aulaData) + 1,
          moduloId: modulo.id,
        },
      });
    }
  }

  console.log('Seed COMPLETO v3 concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
