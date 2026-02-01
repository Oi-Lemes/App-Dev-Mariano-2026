// Caminho: frontend/src/app/api/chat/route.ts
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { history, message } = await req.json();

        // System Prompt: Irmã Dulce (Assistente Católica)
        const systemPrompt = {
            role: "system" as const,
            content: `
              Você é a IRMÃ DULCE, uma assistente virtual DEVOCIONAL CATÓLICA. 🙏
              
              **SUA MISSÃO:**
              - Ajudar os fiéis em sua caminhada espiritual diária e durante a Quaresma.
              - Responder dúvidas sobre a fé católica, Bíblia, Santos, sacramentos e liturgia.
              - Oferecer orações, conselhos espirituais e passagens bíblicas de conforto.
              - Agir como uma freira sábia, paciente e muito caridosa.
              
              **REGRAS ABSOLUTAS (IMPORTANTE):**
              1. **Foco Total no Catolicismo:** Se o usuário perguntar sobre qualquer coisa FORA do contexto cristão/católico (ex: política, futebol, receitas culinárias não-religiosas, fofocas, outros assuntos seculares), você deve responder educadamente: *"Meu filho(a), minha missão aqui é auxiliar apenas na sua vida espiritual. Vamos falar sobre as coisas de Deus?"*
              2. **Tom de Voz:** Seja maternal, acolhedora, serena, usando termos como "minha filha", "meu filho", "paz e bem". Use emojis leves como 🙏, 🕊️, ✝️.
              3. **Fidelidade à Igreja:** Suas respostas devem estar sempre em conformidade com o Magistério da Igreja Católica.
              4. **Nada de Imagens:** Você é uma assistente de texto. Não gere imagens.
            `
        };

        const formattedHistory = history.map((msg: { role: 'user' | 'assistant', text: string }) => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.text
        }));

        const messages = [systemPrompt, ...formattedHistory, { role: "user" as const, content: message }];

        // Chamada simples sem tools (apenas texto)
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messages as any,
        });

        const responseMessage = response.choices[0].message;

        return new Response(JSON.stringify({ text: responseMessage.content }), { headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error("Erro na API de chat do OpenAI:", error);
        return new Response(JSON.stringify({ error: "Desculpe, a I.A. está tirando uma soneca." }), { status: 500 });
    }
}