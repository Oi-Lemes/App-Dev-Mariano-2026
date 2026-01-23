const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const baseDir = path.join(__dirname, 'backend/uploads/papertoys/Organizados');

function getFileHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

function scanDir(dir, fileList = []) {
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
                    hash: getFileHash(filePath),
                    size: fs.statSync(filePath).size
                });
            }
        }
    });
    return fileList;
}

try {
    console.log("🔍 Iniciando Auditoria Visual (Hash) das Imagens...");
    const allFiles = scanDir(baseDir);

    // Agrupar por Hash
    const hashGroups = {};
    allFiles.forEach(f => {
        if (!hashGroups[f.hash]) hashGroups[f.hash] = [];
        hashGroups[f.hash].push(f);
    });

    let duplicatesFound = 0;

    // Verificar duplicatas entre pastas diferentes
    for (const hash in hashGroups) {
        const group = hashGroups[hash];
        if (group.length > 1) {
            // Verificar se estão em pastas diferentes
            const folders = [...new Set(group.map(f => f.folder))];
            if (folders.length > 1) {
                console.log(`\n⚠️ IMAGEM DUPLICADA EM PASTAS DIFERENTES (INTRUSO DETECTADO):`);
                console.log(`   Tamanho: ${group[0].size} bytes`);
                group.forEach(f => {
                    console.log(`   - ${f.folder} / ${f.name}`);
                });
                duplicatesFound++;
            }
        }
    }

    if (duplicatesFound === 0) {
        console.log("\n✅ Nenhuma imagem duplicada encontrada entre categorias diferentes.");
    } else {
        console.log(`\n❌ Encontrados ${duplicatesFound} casos de imagens repetidas/fora do lugar.`);
    }

} catch (error) {
    console.error("Erro na auditoria:", error);
}
