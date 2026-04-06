const parsed = Number(process.env.USD_BRL);
const USD_BRL_RATE = Number.isFinite(parsed) && parsed > 0 ? parsed : 5.43;

module.exports = { USD_BRL: USD_BRL_RATE };
