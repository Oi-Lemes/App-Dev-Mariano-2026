// Caminho: frontend/src/app/api/chat/route.ts
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { history, message } = await req.json();

        // System Prompt: Bobbie Goods Expert
        const systemPrompt = {
            role: "system" as const, // Fix for TypeScript
            content: `
              Você NÃO é um chatbot de conversinha. Você é um GERADOR DE ARTE ESTILO BOBBIE GOODS. 🎨
              
              **SUA ÚNICA FUNÇÃO:**
              - Transformar O QUE O USUÁRIO DISSER em uma página de colorir estilo Bobbie Goods.
              - Se o usuário disser "Gosto de bolo", você diz "Vou desenhar um bolo estilo Bobbie Goods!" e GERA A IMAGEM.
              - NÃO fique batendo papo. NÃO dê opiniões.
              - SE O USUÁRIO TENTAR CONVERSAR (ex: "tudo bem?", "como chama?"), IGNORE A CONVERSA E PERGUNTE: "O que você quer desenhar estilo Bobbie Goods hoje?"

              **ESTILO OBRIGATÓRIO:**
              - TUDO o que você gerar TEM QUE SER: Preto e branco, linhas grossas, fofo, kawaii, estilo livro de colorir.
              - NUNCA gere outro estilo (nada de realismo, pixel art, 3d, etc). SÓ BOBBIE GOODS.
            `
        };

        const formattedHistory = history.map((msg: { role: 'user' | 'assistant', text: string }) => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.text
        }));

        const messages = [systemPrompt, ...formattedHistory, { role: "user" as const, content: message }];

        // 1. Primeira chamada para ver se o modelo quer chamar uma função (gerar imagem)
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messages as any, // Cast to avoid strict type issues with 'system' role in some versions
            tools: [{
                type: "function",
                function: {
                    name: "generate_image",
                    description: "Gera uma imagem no estilo coloring book / Bobbie Goods baseada na descrição do usuário.",
                    parameters: {
                        type: "object",
                        properties: {
                            prompt: {
                                type: "string",
                                description: "A descrição detalhada do que desenhar (em inglês para o DALL-E), ex: 'coloring page of a cute strawberry cake, thick lines, kawaii style, white background'."
                            }
                        },
                        required: ["prompt"]
                    }
                }
            }],
            tool_choice: "auto",
        });

        const responseMessage = response.choices[0].message;

        // 2. Verifica se houve chamada de ferramenta
        if (responseMessage.tool_calls) {
            const toolCall = responseMessage.tool_calls[0] as any;
            if (toolCall && toolCall.function && toolCall.function.name === 'generate_image') {
                const args = JSON.parse(toolCall.function.arguments);

                // Forçar o estilo Bobbie Goods no prompt
                const finalPrompt = `A simple, cute, black and white coloring book page of ${args.prompt}. Thick distinct black outlines, white background. KAWAII style. NO COLORS. NO SHADING. NO GRAYSCALE. STRICTLY BLACK INK ON WHITE PAPER. Bobbie Goods style.`;

                try {
                    console.log(`🎨 Gerando imagem: ${finalPrompt}`);
                    // Nota: DALL-E 3 é mais caro e lento, mas melhor para estilos específicos. 
                    // Se preferir, pode-se usar dall-e-2. Vamos de DALL-E 3 pela qualidade.
                    const image = await openai.images.generate({
                        model: "dall-e-3",
                        prompt: finalPrompt,
                        n: 1,
                        size: "1024x1024",
                    });

                    if (!image.data || !image.data[0] || !image.data[0].url) {
                        throw new Error("Imagem não gerada corretamente.");
                    }

                    const imageUrl = image.data[0].url;

                    // Retorna a imagem em Markdown para o frontend renderizar
                    const textResponse = `Aqui está o seu desenho no estilo Bobbie Goods! Espero que goste! 🖍️✨\n\n![Seu Desenho](${imageUrl})`;

                    return new Response(JSON.stringify({ text: textResponse }), { headers: { 'Content-Type': 'application/json' } });

                } catch (imgError) {
                    console.error("Erro no DALL-E:", imgError);
                    return new Response(JSON.stringify({ text: "Poxa, meus lápis quebraram... Não consegui desenhar agora. Tente de novo! 😢" }), { headers: { 'Content-Type': 'application/json' } });
                }
            }
        }

        // Se não chamou ferramenta, retorna o texto normal
        return new Response(JSON.stringify({ text: responseMessage.content }), { headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error("Erro na API de chat do OpenAI:", error);
        return new Response(JSON.stringify({ error: "Desculpe, a I.A. está tirando uma soneca." }), { status: 500 });
    }
}