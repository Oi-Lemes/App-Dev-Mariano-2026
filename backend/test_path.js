import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('__dirname:', __dirname);

const downloadUrl = '/uploads/quebra-cabeca/Aquaman LEGO.png';
const stripped = downloadUrl.replace(/^[\\\/]/, '');
console.log('Stripped URL:', stripped);

console.log('Testing WITH leading slash:');
const filePathSlash = path.join(__dirname, downloadUrl);
console.log('Resolved FilePath (Slash):', filePathSlash);

if (fs.existsSync(filePathSlash)) {
    console.log('✅ File EXISTS!');
} else {
    console.log('❌ File NOT FOUND!');
}
