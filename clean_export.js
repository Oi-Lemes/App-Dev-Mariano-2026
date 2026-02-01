const fs = require('fs');
const path = require('path');

const exportDir = path.join(process.env.USERPROFILE, 'Desktop', 'Pappertoys_Project_Export');
const backendDir = path.join(exportDir, 'backend');
const frontendDir = path.join(exportDir, 'frontend');

console.log(`🧹 Iniciando Limpeza Profunda em: ${exportDir}`);

// 1. CLEAN BACKEND (server.js)
const serverJsPath = path.join(backendDir, 'server.js');
if (fs.existsSync(serverJsPath)) {
    let content = fs.readFileSync(serverJsPath, 'utf8');

    // Remove MOCK_MODULOS
    // Regex agressivo para pegar do const até o fim do array ]
    content = content.replace(/const MOCK_MODULOS = \[\s*\{[\s\S]*?\}\s*\];/g, '// MOCK_MODULOS REMOVIDO (Conteúdo Antigo)\nconst MOCK_MODULOS = [];');

    // Remove Rotas de Certificado (Bloco inteiro)
    content = content.replace(/\/\/ --- ROTA DE GERAÇÃO DE CERTIFICADO ---[\s\S]*?\/\/ --- ROTA DE DEBUG: RENOMEAR ARQUIVO ---/g, '// --- ROTA DE CERTIFICADO REMOVIDA ---\n\n// --- ROTA DE DEBUG: RENOMEAR ARQUIVO ---');
    content = content.replace(/\/\/ ROTA DEDICADA PARA CERTIFICADO \(FIX FINAL\)[\s\S]*?\/\/ --- ROTA DE DEBUG ---/g, '// --- ROTA PIX CERTIFICADO REMOVIDA ---\n\n// --- ROTA DE DEBUG ---');

    fs.writeFileSync(serverJsPath, content);
    console.log("✅ Backend: MOCK_MODULOS e Rotas de Certificado/Plantas removidos.");
}

// 2. DELETE LEFTOVER FOLDERS
const certAssets = path.join(backendDir, 'gerador_certificado');
if (fs.existsSync(certAssets)) {
    fs.rmSync(certAssets, { recursive: true, force: true });
    console.log("✅ Backend: Pasta 'gerador_certificado' deletada.");
}

// 3. SCAN FRONTEND STRINGS
function scanReplace(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (file === 'node_modules' || file === '.next' || file === '.git') return;
            scanReplace(filePath);
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
                let fContent = fs.readFileSync(filePath, 'utf8');
                let modified = false;

                // Substituições simples de strings visíveis
                if (fContent.includes('Plantas Medicinais')) {
                    fContent = fContent.replace(/Plantas Medicinais/g, 'Paper Toys Exclusivos');
                    modified = true;
                }
                if (fContent.includes('Saberes da Floresta')) {
                    fContent = fContent.replace(/Saberes da Floresta/g, 'Mundo dos Paper Toys');
                    modified = true;
                }
                if (fContent.includes('ervas')) {
                    fContent = fContent.replace(/ervas/gi, 'modelos'); // Cuidado com contexto, mas "ervas" no plural geralmente é safe
                    modified = true;
                }

                if (modified) {
                    fs.writeFileSync(filePath, fContent);
                    console.log(`✅ Frontend: Strings limpas em ${file}`);
                }
            }
        }
    });
}

console.log("🔍 Escaneando Frontend por termos de 'Plantas'...");
scanReplace(frontendDir);

console.log("✨ Limpeza Concluída! O projeto agora é 100% Paper Toys.");
