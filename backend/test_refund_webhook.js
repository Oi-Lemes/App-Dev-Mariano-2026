
import axios from 'axios';

// URL do servidor (ajuste se não estiver rodando na porta 3001)
const API_URL = 'http://localhost:3001/webhook/paradise-reembolso';

// Payload simulando o que o Gateway enviaria
// Baseado na estrutura comum de checkouts: client/customer com phone
const refundPayload = {
    event: 'purchase.refunded',
    date: new Date().toISOString(),
    client: {
        name: 'Cliente Teste Reembolso',
        email: 'teste@reembolso.com',
        phone: '5511999998888', // Telefone que deve ser banido
        cpf: '123.456.789-00'
    },
    product: {
        id: '12345',
        name: 'Curso Saberes da Floresta'
    }
};

async function simulateRefund() {
    try {
        console.log('📡 Enviando simulação de reembolso para:', API_URL);
        console.log('📦 Payload:', JSON.stringify(refundPayload, null, 2));

        const response = await axios.post(API_URL, refundPayload);

        console.log('\n✅ Resposta do Servidor:', response.status);
        console.log('📝 Dados:', response.data);

        console.log('\n--- VERIFICAÇÃO ---');
        console.log('Se o servidor retornou 200, vá no banco de dados e verifique se o usuário com telefone 11999998888 ficou com status "refunded" e plan "banned".');

    } catch (error) {
        if (error.response) {
            console.error('❌ Erro na resposta:', error.response.status, error.response.data);
        } else {
            console.error('❌ Erro na requisição:', error.message);
        }
    }
}

simulateRefund();
