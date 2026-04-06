function parseIdParam(raw) {
  const id = Number.parseInt(String(raw), 10);
  if (!Number.isInteger(id) || id < 1) return null;
  return id;
}

function parseFiniteNumber(value, { min = -Infinity, allowZero = true } = {}) {
  const n = typeof value === 'number' ? value : Number.parseFloat(String(value));
  if (!Number.isFinite(n)) return null;
  if (!allowZero && n === 0) return null;
  if (n < min) return null;
  return n;
}

module.exports = { parseIdParam, parseFiniteNumber };
