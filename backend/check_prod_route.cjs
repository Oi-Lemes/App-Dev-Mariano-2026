const axios = require('axios');

const url = 'https://areamembrosplantascompletinho.onrender.com/gerar-pix-certificado-final';

console.log(`Checking URL: ${url}`);

axios.post(url, {})
    .then(response => {
        console.log('Response Status:', response.status);
        console.log('Response Data:', response.data);
    })
    .catch(error => {
        if (error.response) {
            console.log('Response Status:', error.response.status);
            console.log('Response Data:', error.response.data);
            if (error.response.status === 404) {
                console.log('CONCLUSION: Route NOT found. Backend NOT updated yet.');
            } else if (error.response.status === 401 || error.response.status === 403) {
                console.log('CONCLUSION: Route EXISTS (Auth error expected). Backend IS updated.');
            } else {
                console.log('CONCLUSION: Unexpected status.');
            }
        } else {
            console.log('Error:', error.message);
        }
    });
