
import { execSync } from 'child_process';

console.log("🚀 Iniciando Seed Mestre do ITINERÁRIO QUARESMAL...");

try {
    console.log("---------------------------------------------------------");
    console.log("✝️  Rodando seed católica (Itinerário e Bônus)...");
    execSync('node prisma/seed_catholic.js', { stdio: 'inherit' });

    console.log("---------------------------------------------------------");
    console.log("🙏 Rodando seed devocional (Meses)...");
    execSync('node prisma/seed_devocional.js', { stdio: 'inherit' });

    console.log("---------------------------------------------------------");
    console.log("✅ SEED COMPLETO! O banco de dados está 100% atualizado com o Itinerário Quaresmal.");
} catch (error) {
    console.error("❌ Erro ao rodar os seeds:", error);
    process.exit(1);
}