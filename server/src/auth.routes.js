import express from 'express';
import { requireVaultAuth, signVaultToken } from './auth.js';
import { updateAdminPassword, verifyAdminCredentials } from './db.js';

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body ?? {};

  if (!verifyAdminCredentials(username, password)) {
    return res.status(401).json({ message: '用户名或密码错误' });
  }

  const token = signVaultToken(username);
  return res.json({ token, username });
});

router.get('/me', requireVaultAuth, (req, res) => {
  return res.json({ username: req.auth.sub, scope: req.auth.scope });
});

router.post('/change-password', requireVaultAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'currentPassword/newPassword 为必填字段' });
  }
  if (String(newPassword).length < 8) {
    return res.status(400).json({ message: '新密码至少 8 位' });
  }

  const result = updateAdminPassword(req.auth.sub, currentPassword, newPassword);
  if (!result.ok) {
    return res.status(401).json({ message: '当前密码错误' });
  }

  return res.json({ ok: true });
});

export default router;
