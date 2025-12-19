
import axios from 'axios';
import 'dotenv/config';

// --- CONFIGURAÇÃO ---
// --- CONFIGURAÇÃO ---
const WEBHOOK_URL = 'https://areamembrosplantascompletinho.onrender.com/webhook/paradise';
// IMPORTANT: Use o hash que está no seu .env ou que você configurou no Render
const PRODUCT_HASH = process.env.PARADISE_PRODUCT_HASH || 'prod_372117ff2ba365a1';

// --- DADOS DO TESTE ---
// ⚠️ COLOQUE SEU TELFONE ABAIXO PARA LIBERAR O ACESSO NO SITE DE VERDADE ⚠️
const MEU_TELEFONE = '11999999999'; // <-- DIGITE SEU NÚMERO AQUI (IGUAL AO DO LOGIN)

const TEST_PAYLOAD = {
    event: 'purchase.approved',
    product: {
        hash: PRODUCT_HASH,
        name: 'Curso Segredos da Floresta (Teste Manual)'
    },
    client: {
        name: 'Cliente Teste Manual',
        email: 'teste@manual.com',
        phone: MEU_TELEFONE,
        cpf: '000.000.000-00'
    }
};

console.log('🚀 Enviando Webhook Simulado para:', WEBHOOK_URL);
console.log('📦 Payload:', JSON.stringify(TEST_PAYLOAD, null, 2));

try {
    const response = await axios.post(WEBHOOK_URL, TEST_PAYLOAD);
    console.log('\n✅ Sucesso! Resposta do Servidor:', response.data);
    console.log('Agora tente logar com o telefone:', TEST_PAYLOAD.client.phone);
} catch (error) {
    console.error('\n❌ Erro ao enviar:', error.message);
    if (error.code === 'ECONNREFUSED') {
        console.error('Dica: Verifique se o servidor backend está rodando na porta 3001!');
    }
}
