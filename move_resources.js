
const fs = require('fs');
const path = require('path');

const pdfSource = 'c:\\Users\\pedro\\Downloads\\Aplicativo Itinerário Quaresmal\\Itinerário Quaresmal\\cleaned';
const imgSource = 'c:\\Users\\pedro\\Downloads\\Aplicativo Itinerário Quaresmal\\Itinerário Quaresmal\\imgs';

const pdfDest = 'c:\\Users\\pedro\\Downloads\\Aplicativo Itinerário Quaresmal\\Itinerário Quaresmal\\frontend\\public\\devocionais';
const imgDest = 'c:\\Users\\pedro\\Downloads\\Aplicativo Itinerário Quaresmal\\Itinerário Quaresmal\\frontend\\public\\img\\devocionais';

if (!fs.existsSync(pdfDest)) fs.mkdirSync(pdfDest, { recursive: true });
if (!fs.existsSync(imgDest)) fs.mkdirSync(imgDest, { recursive: true });

// Map month names to normalize
const normalize = (str) => {
    return str.toLowerCase()
        .replace(/ç/g, 'c')
        .replace(/ã/g, 'a')
        .replace(/á/g, 'a')
        .replace(/â/g, 'a')
        .replace(/é/g, 'e')
        .replace(/ê/g, 'e')
        .replace(/í/g, 'i')
        .replace(/ó/g, 'o')
        .replace(/ô/g, 'o')
        .replace(/ú/g, 'u')
        .replace(/\s+/g, '_'); // Replace spaces with underscores if any remaining
};

const mapMonth = (filename) => {
    const list = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    for (const m of list) {
        // Simple check if the normalized filename contains the month
        if (normalize(filename).includes(m)) return m;
    }
    return null;
};

// Process PDFs
fs.readdirSync(pdfSource).forEach(file => {
    if (file.endsWith('.pdf')) {
        const month = mapMonth(file);
        if (month) {
            const newName = `${month}.pdf`;
            fs.copyFileSync(path.join(pdfSource, file), path.join(pdfDest, newName));
            console.log(`Copied PDF: ${file} -> ${newName}`);
        } else {
            console.warn(`Could not identify month for PDF: ${file}`);
        }
    }
});

// Process Images
fs.readdirSync(imgSource).forEach(file => {
    if (file.endsWith('.png') || file.endsWith('.jpg')) {
        const month = mapMonth(file);
        if (month) {
            const newName = `${month}.png`; // Assuming PNG, but check could be better. The list showed PNGs.
            fs.copyFileSync(path.join(imgSource, file), path.join(imgDest, newName));
            console.log(`Copied Image: ${file} -> ${newName}`);
        } else {
            console.warn(`Could not identify month for Image: ${file}`);
        }
    }
});
