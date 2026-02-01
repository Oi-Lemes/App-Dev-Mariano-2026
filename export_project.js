const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceDir = __dirname;
// Define export destination (Desktop is safer/easier to find)
const exportDir = path.join(process.env.USERPROFILE, 'Desktop', 'Pappertoys_Project_Export');

console.log(`🚀 Iniciando Exportação para: ${exportDir}`);

// 1. Criar pasta de destino
if (fs.existsSync(exportDir)) {
    console.log("⚠️ Pasta de destino já existe. Limpando...");
    fs.rmSync(exportDir, { recursive: true, force: true });
}
fs.mkdirSync(exportDir, { recursive: true });

// Helper para copiar diretórios ignorando node_modules e .git
function copyRecursive(src, dest) {
    if (!fs.existsSync(src)) return;
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        if (src.endsWith('node_modules') || src.endsWith('.git') || src.endsWith('.next') || src.endsWith('.vscode')) return;

        if (!fs.existsSync(dest)) fs.mkdirSync(dest);
        fs.readdirSync(src).forEach(child => {
            copyRecursive(path.join(src, child), path.join(dest, child));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

console.log("📦 Copiando Backend (com Uploads)...");
copyRecursive(path.join(sourceDir, 'backend'), path.join(exportDir, 'backend'));

console.log("📦 Copiando Frontend (Código Limpo)...");
copyRecursive(path.join(sourceDir, 'frontend'), path.join(exportDir, 'frontend'));

// Copiar arquivos raiz importantes
const rootFiles = ['package.json', '.gitignore', 'README.md'];
rootFiles.forEach(f => {
    const srcPath = path.join(sourceDir, f);
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, path.join(exportDir, f));
    }
});

console.log("✨ Exportação Concluída!");
