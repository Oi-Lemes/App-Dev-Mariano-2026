const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'backend/uploads/papertoys/Organizados');

// Regras de proibição (Se estiver na Pasta X, não pode ter nome Y)
const BLACKLIST = {
    'Naruto': ['goku', 'dragon', 'ball', 'vegeta', 'luffy', 'one_piece', 'mario', 'sonic', 'pokemon', 'pikachu', 'zelda'],
    'Dragon_Ball': ['naruto', 'sasuke', 'luffy', 'one_piece', 'mario', 'sonic', 'pokemon', 'pikachu', 'zelda'],
    'Pokemon': ['digimon', 'agumon', 'naruto', 'goku', 'dragon', 'mario', 'sonic', 'zelda', 'link'],
    'Super_Mario': ['sonic', 'zelda', 'link', 'pokemon', 'naruto', 'goku'],
    'Sonic': ['mario', 'nintendo', 'pokemon', 'naruto'],
    'Zelda': ['mario', 'pokemon', 'naruto'],
    'One_Piece': ['naruto', 'bleach', 'dragon', 'goku'],
    'DC_Comics': ['marvel', 'spider', 'iron', 'hulk', 'thor'],
    'Marvel': ['batman', 'superman', 'wonder', 'flash', 'aquaman']
};

function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const folders = fs.readdirSync(dir);

    console.log("🔍 INICIANDO AUDITORIA SEMÂNTICA (NOMES ERRADOS)...");

    let suspectCount = 0;

    for (const folder of folders) {
        // Verificar se temos regras para essa pasta (ou nome parecido)
        // Normaliza: "Dragon_Ball" -> "Dragon_Ball"
        let ruleKey = Object.keys(BLACKLIST).find(k => folder.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(folder.toLowerCase()));

        if (ruleKey) {
            const forbiddenTerms = BLACKLIST[ruleKey];
            const folderPath = path.join(dir, folder);

            if (!fs.statSync(folderPath).isDirectory()) continue;

            const files = fs.readdirSync(folderPath);
            for (const file of files) {
                const lowerName = file.toLowerCase();

                // Verifica se o nome do arquivo contém termo proibido
                const offender = forbiddenTerms.find(term => lowerName.includes(term));

                if (offender) {
                    console.log(`\n⚠️ SUSPEITO DETECTADO NA PASTA [${folder}]:`);
                    console.log(`   Arquivo: ${file}`);
                    console.log(`   Motivo: Contém "${offender}" (Provável intruso de outra série)`);
                    suspectCount++;
                }
            }
        }
    }

    if (suspectCount === 0) {
        console.log("\n✅ Nenhum erro óbvio de nome encontrado nas pastas principais.");
    } else {
        console.log(`\n❌ Total de suspeitos encontrados: ${suspectCount}`);
    }
}

scanDir(baseDir);
