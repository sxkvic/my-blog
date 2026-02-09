import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-me';
const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

export function signVaultToken(username) {
  return jwt.sign(
    { sub: username, scope: 'game-vault' },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES_IN }
  );
}

export function requireVaultAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const [scheme, token] = auth.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: '未授权访问，请先登录游戏仓' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.auth = payload;
    return next();
  } catch {
    return res.status(401).json({ message: '登录已失效，请重新登录' });
  }
}
