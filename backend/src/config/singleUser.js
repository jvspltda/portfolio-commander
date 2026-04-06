require('dotenv').config();

/** Único e-mail autorizado a usar o app (login e APIs protegidas). Sobrescreva com ALLOWED_USER_EMAIL se precisar. */
const DEFAULT_ALLOWED_EMAIL = 'jvsp.ltda2@gmail.com';

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

function getAllowedUserEmail() {
  const fromEnv = process.env.ALLOWED_USER_EMAIL;
  if (fromEnv && normalizeEmail(fromEnv)) {
    return normalizeEmail(fromEnv);
  }
  return DEFAULT_ALLOWED_EMAIL;
}

function isAllowedUserEmail(email) {
  return normalizeEmail(email) === getAllowedUserEmail();
}

module.exports = {
  getAllowedUserEmail,
  isAllowedUserEmail,
  DEFAULT_ALLOWED_EMAIL
};
