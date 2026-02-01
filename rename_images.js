
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'frontend/public/img/lessons');

if (fs.existsSync(targetDir)) {
    const files = fs.readdirSync(targetDir);
    files.forEach(file => {
        if (file.endsWith('img.png')) { // Matches "Janeiro img.png"
            let month = file.split(' ')[0].toLowerCase()
                .replace('ç', 'c')
                .replace('ã', 'a')
                .replace('õ', 'o');

            let cleanName = month + '.png'; // janeiro.png
            console.log(`Renaming ${file} -> ${cleanName}`);
            fs.renameSync(path.join(targetDir, file), path.join(targetDir, cleanName));
        }
    });
}
