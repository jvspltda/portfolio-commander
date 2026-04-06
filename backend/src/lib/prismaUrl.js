/**
 * Supabase pooler (PgBouncer) + Prisma: sem ?pgbouncer=true pode dar 42P05
 * ("prepared statement s0 already exists"), sobretudo na porta 6543 (Transaction).
 * @see https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#pgbouncer
 */
function withPgBouncerParam(url) {
  if (!url || typeof url !== 'string') return url;
  if (!/pooler\.supabase\.(com|io)/i.test(url)) return url;
  if (/[?&]pgbouncer\s*=\s*true/i.test(url)) return url;
  return url.includes('?') ? `${url}&pgbouncer=true` : `${url}?pgbouncer=true`;
}

module.exports = { withPgBouncerParam };
