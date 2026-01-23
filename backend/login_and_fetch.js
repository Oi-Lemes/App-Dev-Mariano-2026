
// import fetch from 'node-fetch'; // Not needed in Node 18+

async function main() {
    const backendUrl = 'http://localhost:3001';

    // 1. Login
    console.log('Logging in...');
    const loginRes = await fetch(`${backendUrl}/auth/login-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '11932786835' })
    });

    if (!loginRes.ok) {
        console.error('Login failed:', await loginRes.text());
        return;
    }

    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Token acquired.');

    // 2. Fetch Modules
    console.log('Fetching modules...');
    const modulosRes = await fetch(`${backendUrl}/modulos`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!modulosRes.ok) {
        console.error('Fetch modules failed:', await modulosRes.text());
        return;
    }

    const modulos = await modulosRes.json();
    console.log(`Modules count: ${modulos.length}`);
    modulos.forEach(m => console.log(`- ${m.id}: ${m.nome}`));
    // 3. Fetch Module 14 (DC Comics)
    console.log('\nFetching Module 14 (DC Comics)...');
    const mod14Res = await fetch(`${backendUrl}/modulos/14`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!mod14Res.ok) {
        console.error('Fetch module 14 failed:', await mod14Res.text());
        return;
    }

    const mod14 = await mod14Res.json();
    console.log(`Module: ${mod14.nome}`);
    mod14.aulas.forEach(a => {
        console.log(`  - Aula ${a.id}: ${a.nome}`);
        console.log(`    Video/Image URL: ${a.videoUrl}`);
        console.log(`    Download URL: ${a.downloadUrl}`);
        console.log(`    IsImage: ${a.isImage}`);
    });
}

main().catch(console.error);
