
const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'cleaned/compactado');
const targetDir = path.join(__dirname, 'frontend/public/devocionais');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

const files = fs.readdirSync(sourceDir);

files.forEach(file => {
    if (file.endsWith('.pdf')) {
        let month = file.toUpperCase().match(/2026 ([A-ZÇÃÕ]+)-COMPACTADO/);
        if (month && month[1]) {
            let cleanName = month[1].toLowerCase()
                .replace('ç', 'c')
                .replace('ã', 'a')
                .replace('õ', 'o')
                + '.pdf';

            console.log(`Moving ${file} -> ${cleanName}`);
            fs.copyFileSync(path.join(sourceDir, file), path.join(targetDir, cleanName));
        }
    }
});
