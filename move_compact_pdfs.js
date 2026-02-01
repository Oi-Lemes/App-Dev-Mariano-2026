
import fs from 'fs';
import path from 'path';

const sourceDir = path.join(process.cwd(), 'cleaned', 'compactado');
const targetDir = path.join(process.cwd(), 'frontend', 'public', 'devocionais');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// Map filenames to target normalized names
const fileMapping = {
    'Devocional 2026 JANEIRO-compactado.pdf': 'janeiro.pdf',
    'Devocional 2026 FEVEREIRO-compactado.pdf': 'fevereiro.pdf',
    'Devocional 2026 MARÇO-compactado.pdf': 'marco.pdf',
    'Devocional 2026 ABRIL-compactado.pdf': 'abril.pdf',
    'Devocional 2026 MAIO-compactado.pdf': 'maio.pdf',
    'Devocional 2026 JUNHO-compactado.pdf': 'junho.pdf',
    'Devocional 2026 JULHO-compactado.pdf': 'julho.pdf',
    'Devocional 2026 AGOSTO-compactado.pdf': 'agosto.pdf',
    'Devocional 2026 SETEMBRO-compactado.pdf': 'setembro.pdf',
    'Devocional 2026 NOVEMBRO-compactado.pdf': 'novembro.pdf',
    'Devocional 2026 DEZEMBRO-compactado.pdf': 'dezembro.pdf',
    // Outubro seems missing, but if it appears:
    'Devocional 2026 OUTUBRO-compactado.pdf': 'outubro.pdf'
};

console.log(`Processing files from ${sourceDir} to ${targetDir}...`);

fs.readdirSync(sourceDir).forEach(file => {
    if (fileMapping[file]) {
        const sourcePath = path.join(sourceDir, file);
        const targetPath = path.join(targetDir, fileMapping[file]);

        fs.copyFileSync(sourcePath, targetPath);
        console.log(`✅ Moved: ${file} -> ${fileMapping[file]}`);
    } else {
        console.log(`⚠️ Skipped unknown file: ${file}`);
    }
});

console.log('Done!');
