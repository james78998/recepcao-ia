const jwt = require('jsonwebtoken');

function adminAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: true, message: 'Token não fornecido.' });
  }

  try {
    const payload = jwt.verify(authHeader.slice(7), process.env.ADMIN_JWT_SECRET);
    req.adminUser = { id: payload.sub, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: true, message: 'Token inválido ou expirado.' });
  }
}

module.exports = adminAuthMiddleware;
