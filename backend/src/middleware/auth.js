const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/jwt');
const { getAllowedUserEmail } = require('../config/singleUser');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, getJwtSecret(), (err, user) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    const allowed = getAllowedUserEmail();
    const tokenEmail = user.email && String(user.email).trim().toLowerCase();
    if (!tokenEmail || tokenEmail !== allowed) {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };
