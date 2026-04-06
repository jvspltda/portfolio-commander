/**
 * Produção: aplica migrations antes do servidor.
 * O build Docker / rede de CI costuma não alcançar o Postgres (P1001); no runtime do Railway sim.
 */
const { execSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');

require('dotenv').config({ path: path.join(root, '.env') });

if (!process.env.DATABASE_URL || !String(process.env.DATABASE_URL).trim()) {
  console.error(
    'FATAL: DATABASE_URL não definida. No Railway: Variables → DATABASE_URL.'
  );
  process.exit(1);
}

if (!process.env.DIRECT_URL || !String(process.env.DIRECT_URL).trim()) {
  console.error(
    'FATAL: DIRECT_URL não definida. No Railway: URI Direct (db.xxx.supabase.co:5432). Igual a DATABASE_URL se não usar pooler.'
  );
  process.exit(1);
}

try {
  console.log('[start-prod] prisma migrate deploy…');
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: process.env,
    cwd: root
  });
} catch {
  console.error(
    '[start-prod] migrate deploy falhou. Confira DATABASE_URL, Supabase ativo (não pausado) e rede.'
  );
  process.exit(1);
}

require(path.join(root, 'src', 'server.js'));
