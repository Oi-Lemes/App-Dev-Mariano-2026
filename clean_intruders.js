const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const baseDir = path.join(__dirname, 'backend/uploads/papertoys/Organizados');

function getFileHash(filePath) {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        return hashSum.digest('hex');
    } catch (e) { return null; }
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

// Padrões de nomes genéricos que queremos eliminar SE forem duplicatas
const GENERIC_PATTERNS = [
    /pokemon[ _-]?\d+/i,
    /drag[aã]o[ _-]?ball[ _-]?\d+/i,
    /naruto[ _-]?\d+/i,
    /image\d+/i,
    /untitled/i,
    /descarga/i,
    /unknown/i
];

function isGeneric(name) {
    return GENERIC_PATTERNS.some(p => name.match(p));
}

console.log("🧹 INICIANDO LIMPEZA BASEADA EM CONTEÚDO VISUAL (HASH)...");

const allFiles = scanDir(baseDir);
const hashGroups = {};

// Agrupa por conteúdo visual (Hash)
allFiles.forEach(f => {
    if (!f.hash) return;
    if (!hashGroups[f.hash]) hashGroups[f.hash] = [];
    hashGroups[f.hash].push(f);
});

let deletedCount = 0;

for (const hash in hashGroups) {
    const group = hashGroups[hash];

    // Só nos interessa se houver duplicata (mesma imagem em mais de um lugar)
    if (group.length > 1) {
        const folders = [...new Set(group.map(f => f.folder))];

        // Só é problema se estiver em pastas diferentes (cross-contamination)
        // Ex: Zelda Link na pasta Pokemon
        if (folders.length > 1) {
            console.log(`\n🔍 Conflito Visual Detectado:`);

            // Decidir quem deletar
            // Estratégia: Salvar o que tem nome "Bom" (Específico) e deletar o "Genérico"

            const generics = group.filter(f => isGeneric(f.name));
            const specifics = group.filter(f => !isGeneric(f.name));

            if (generics.length > 0 && specifics.length > 0) {
                // Tem um nome bom e um ruim. Matar o ruim.
                generics.forEach(badFile => {
                    console.log(`❌ DELETANDO INTRUSO: [${badFile.folder}] ${badFile.name}`);
                    console.log(`   (Conteúdo idêntico ao original: [${specifics[0].folder}] ${specifics[0].name})`);
                    try {
                        fs.unlinkSync(badFile.path);
                        deletedCount++;
                    } catch (e) {
                        console.error("   Erro ao deletar:", e.message);
                    }
                });
            } else if (specifics.length === 0) {
                // Todos são genéricos? (ex: pokemon_1 vs desenho_1)
                // Deleta todos menos um (o primeiro da lista) para não ter duplicata
                // Ou melhor: se pastas diferentes, deletar o que parece estar na pasta errada? Dificil saber.
                // Mas, vamos assumir que o "Pokemon_x" na pasta Pokemon deve ficar se o outro for "Desenho_x" na pasta Desenho?
                // Não, o usuario disse que "Pokemon_x" ERA o intruso (era hellboy).
                // Então, na duvida, se todos são genéricos, mantemos 1 e apagamos o resto?
                // Vamos ser conservadores: Se não tem específico, não deleta AUTO.
                console.log("⚠️  Ambos nomes genéricos, pulando deleção automática para segurança.");
                group.forEach(f => console.log(`   - [${f.folder}] ${f.name}`));
            }
        }
    }
}

console.log(`\n✨ Limpeza Concluída. Total de arquivos removidos: ${deletedCount}`);
