import axios from 'axios';

async function checkStatus() {
    console.log('🔍 Verificando status do backend de produção...');
    const url = 'https://areamembrosplantascompletinho.onrender.com/modulos';
    const fixUrl = 'https://areamembrosplantascompletinho.onrender.com/api/fix-quiz-db';

    try {
        console.log(`📡 Pinging ${url}...`);
        // Precisamos de um token válido para /modulos, mas se der 401 Unauthorized, 
        // significa que a rota EXISTE (o que é bom). Se der 404, ela não existe (ruim).
        await axios.get(url).catch(err => {
            if (err.response) {
                console.log(`✅ Resposta recebida: ${err.response.status} ${err.response.statusText}`);
                if (err.response.status === 404) {
                    console.error('❌ CRÍTICO: Rota /modulos ainda retorna 404 Not Found.');
                } else if (err.response.status === 401) {
                    console.log('✅ SUCESSO: Rota /modulos existe (retornou 401 pois sem token).');
                }
            } else {
                console.error('❌ Erro de conexão:', err.message);
            }
        });

        console.log(`\n📡 Pinging ${fixUrl}...`);
        const fixRes = await axios.get(fixUrl);
        console.log('✅ Rota de Correção (Fix DB) respondeu:', fixRes.status);
        console.log('   Mensagem:', fixRes.data);

    } catch (error) {
        console.error('❌ Erro geral:', error.message);
    }
}

checkStatus();
