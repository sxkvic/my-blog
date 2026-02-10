import express from 'express';
import { requireAuth, signVaultToken } from './auth.js';
import {
  createUser,
  listUsers,
  registerUser,
  updateUserPassword,
  verifyUserCredentials,
} from './db.js';

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body ?? {};
  const user = verifyUserCredentials(username, password);

  if (!user) {
    return res.status(401).json({ message: '用户名或密码错误' });
  }

  const token = signVaultToken(user);
  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  });
});

router.post('/register', (req, res) => {
  const created = registerUser(req.body ?? {});
  if (created.error === 'invalid_input') {
    return res.status(400).json({ message: 'username 必填，password 至少 8 位' });
  }
  if (created.error === 'username_exists') {
    return res.status(409).json({ message: '用户名已存在' });
  }

  return res.status(201).json(created);
});

router.get('/me', requireAuth, (req, res) => {
  return res.json({
    id: req.auth.userId,
    username: req.auth.username,
    role: req.auth.role,
  });
});

router.post('/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'currentPassword/newPassword 为必填字段' });
  }
  if (String(newPassword).length < 8) {
    return res.status(400).json({ message: '新密码至少 8 位' });
  }

  const result = updateUserPassword(req.auth.userId, currentPassword, newPassword);
  if (!result.ok) {
    return res.status(401).json({ message: '当前密码错误' });
  }

  return res.json({ ok: true });
});

router.get('/users', requireAuth, (req, res) => {
  if (req.auth.role !== 'admin') {
    return res.status(403).json({ message: '仅管理员可查看账号列表' });
  }
  return res.json(listUsers(req.auth));
});

router.post('/users', requireAuth, (req, res) => {
  if (req.auth.role !== 'admin') {
    return res.status(403).json({ message: '仅管理员可创建账号' });
  }

  const created = createUser(req.body ?? {}, req.auth);
  if (!created) {
    return res.status(403).json({ message: '无权限操作' });
  }
  if (created.error === 'invalid_input') {
    return res.status(400).json({ message: 'username 必填，password 至少 8 位' });
  }
  if (created.error === 'username_exists') {
    return res.status(409).json({ message: '用户名已存在' });
  }

  return res.status(201).json(created);
});

export default router;
