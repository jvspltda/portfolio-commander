require('dotenv').config();

let cachedSecret;

function getJwtSecret() {
  if (cachedSecret) return cachedSecret;

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production');
    }
    console.warn(
      '[security] JWT_SECRET is not set; using an insecure development default. Set JWT_SECRET for any shared or deployed environment.'
    );
    cachedSecret = 'dev-insecure-jwt-secret-do-not-use-in-production';
    return cachedSecret;
  }

  cachedSecret = secret;
  return cachedSecret;
}

module.exports = { getJwtSecret };
