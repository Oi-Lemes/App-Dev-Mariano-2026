import axios from 'axios';

// CREDENCIAIS EXATAS DO SCRIPT PHP
const API_KEY = 'sk_5801a6ec5051bf1cf144155ddada51120b2d1dda4d03cb2df454fb4eab9a78a9';
const PRODUCT_HASH = 'prod_0bc162e2175f527f'; // Do PHP
const URL = 'https://multi.paradisepags.com/api/v1/transaction.php';

async function run() {
    // DADOS MOCKADOS VÁLIDOS (Igual ao PHP)
    const payload = {
        amount: 1490, // R$ 14,90
        description: 'Certificado',
        reference: `CKO-DEBUG-${Date.now()}`,
        checkoutUrl: 'https://areamembrosplantascompletinho.vercel.app',
        productHash: PRODUCT_HASH,
        customer: {
            name: 'Teste Debug',
            email: 'teste@debug.com',
            document: '42879052882', // CPF Válido
            phone: '11999999999'
        },
        orderbump: []
    };

    console.log('--- ENVIANDO PAYLOAD ---');
    console.log(JSON.stringify(payload, null, 2));

    try {
        const res = await axios.post(URL, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-API-Key': API_KEY
            }
        });
        console.log('--- SUCESSO ---');
        console.log(JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.log('--- ERRO ---');
        if (err.response) {
            console.log('Status:', err.response.status);
            console.log('Data:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.log(err.message);
        }
    }
}

run();
