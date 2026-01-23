const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const baseDir = path.join(__dirname, 'backend/uploads/papertoys/Organizados');
const reportFile = path.join(__dirname, 'audit_report.txt');

function getFileHash(filePath) {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        return hashSum.digest('hex');
    } catch (e) {
        return null;
    }
}

function scanDir(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            scanDir(filePath, fileList);
        } else {
            if (file.match(/\.(png|jpg|jpeg)$/i)) {
                fileList.push({
                    path: filePath,
                    name: file,
                    folder: path.basename(dir),
                    hash: getFileHash(filePath)
                });
            }
        }
    });
    return fileList;
}

const LOG = [];
function log(msg) {
    console.log(msg);
    LOG.push(msg);
}

try {
    log("🔍 INICIANDO AUDITORIA COMPLETA DE INTEGRIDADE...");
    const allFiles = scanDir(baseDir);
    log(`📂 Total de Arquivos Escaneados: ${allFiles.length}`);

    // 1. ANÁLISE DE DUPLICATAS ENTRE MÓDULOS (INTRUSOS)
    log("\n--- 1. BUSCA POR INTRUSOS (Arquivos Iguais em Pastas Diferentes) ---");
    const hashGroups = {};
    allFiles.forEach(f => {
        if (!f.hash) return;
        if (!hashGroups[f.hash]) hashGroups[f.hash] = [];
        hashGroups[f.hash].push(f);
    });

    let duplicatesFound = 0;
    for (const hash in hashGroups) {
        const group = hashGroups[hash];
        if (group.length > 1) {
            const folders = [...new Set(group.map(f => f.folder))];
            if (folders.length > 1) {
                // Se tem pastas diferentes, é suspeito!
                log(`\n🔴 ALERTA DE INTRUSO DETECTADO (Mesma imagem em lugares diferentes):`);
                group.forEach(f => {
                    log(`   - [${f.folder}] ${f.name}`);
                });
                duplicatesFound++;
            }
        }
    }

    if (duplicatesFound === 0) log("✅ Nenhum 'impostor' visual encontrado entre módulos.");

    // 2. ANÁLISE DE NOMES GENÉRICOS (LIXO)
    log("\n--- 2. ARQUIVOS COM NOMES GENÉRICOS (Limpeza Recomendada) ---");
    // Regex para achar nomes tipo "pokemon 3", "dragao_ball_12", "image001"
    const genericPatterns = [
        /pokemon[ _-]?\d+/i,
        /drag[aã]o[ _-]?ball[ _-]?\d+/i,
        /naruto[ _-]?\d+/i,
        /image\d+/i,
        /untitled/i
    ];

    const generics = allFiles.filter(f => genericPatterns.some(p => f.name.match(p)));

    // Agrupar por pasta
    const genericByFolder = {};
    generics.forEach(f => {
        if (!genericByFolder[f.folder]) genericByFolder[f.folder] = [];
        genericByFolder[f.folder].push(f.name);
    });

    if (Object.keys(genericByFolder).length > 0) {
        for (const folder in genericByFolder) {
            log(`\n📂 Pasta: ${folder}`);
            log(`   ⚠️  Arquivos Genéricos: ${genericByFolder[folder].join(', ')}`);
        }
    } else {
        log("✅ Nenhum nome genérico suspeito encontrado.");
    }

    fs.writeFileSync(reportFile, LOG.join('\n'));
    log(`\n✅ Relatório salvo em: ${reportFile}`);

} catch (error) {
    log("Erro fatal na auditoria: " + error.message);
}
