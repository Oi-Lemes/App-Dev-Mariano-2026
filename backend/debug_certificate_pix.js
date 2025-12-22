import axios from 'axios';

// HARDCODED TO MATCH PHP SCRIPT EXACTLY
const PARADISE_API_TOKEN = 'sk_5801a6ec5051bf1cf144155ddada51120b2d1dda4d03cb2df454fb4eab9a78a9';

// HASH FROM certificados/page.tsx
const CERTIFICATE_HASH = 'prod_0bc162e2175f527f';
const BASE_AMOUNT = 1490; // 14.90
const PRODUCT_TITLE = 'Certificado Debug';

const paymentPayload = {
    amount: BASE_AMOUNT,
    description: PRODUCT_TITLE,
    reference: `CKO-DEBUG-CERT-${Date.now()}`,
    checkoutUrl: 'https://debug.local',
    productHash: CERTIFICATE_HASH,
    orderbump: [],
    customer: {
        name: 'Debug Certificate User',
        email: 'debug_cert@test.com',
        document: '42879052882', // Valid CPF
        phone: '11999999999'
    }
};

console.log('--- TESTANDO PIX CERTIFICADO ---');
console.log('URL: https://multi.paradisepags.com/api/v1/transaction.php');
console.log('Hash Usado:', CERTIFICATE_HASH);
console.log('Payload:', JSON.stringify(paymentPayload, null, 2));

async function run() {
    try {
        const response = await axios.post('https://multi.paradisepags.com/api/v1/transaction.php', paymentPayload, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-API-Key': PARADISE_API_TOKEN
            }
        });

        console.log('\n--- SUCESSO ---');
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log('\n--- ERRO ---');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log(error.message);
        }
    }
}

run();
