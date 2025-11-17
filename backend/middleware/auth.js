const jwt = require('jsonwebtoken')

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Token requerido' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = payload
    next()
  } catch (e) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

function requireAdmin(req, res, next) {
  try{
    const payload = req.user || (jwt.verify((req.headers.authorization||'').split(' ')[1] || '', process.env.JWT_SECRET || 'secret'))
    if (payload.role_name === 'admin' || payload.role_id === 1) return next();
    return res.status(403).json({ message: 'Solo administradores' });
  } catch(e){
    return res.status(401).json({ message: 'Token inválido' });
  }
}

module.exports = { requireAuth, requireAdmin }
