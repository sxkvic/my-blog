import { randomUUID } from 'node:crypto';
import express from 'express';
import {
  createGameAccount,
  deleteGameAccount,
  listGameAccounts,
  updateGameAccount,
} from './db.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json(listGameAccounts(req.auth));
});

router.post('/', (req, res) => {
  const payload = req.body ?? {};

  if (!payload.game || !payload.account || !payload.password) {
    return res.status(400).json({ message: 'game/account/password 为必填字段' });
  }

  const created = createGameAccount({
    id: payload.id || randomUUID(),
    game: payload.game,
    server: payload.server || '未填写',
    account: payload.account,
    password: payload.password,
    role: payload.role || '未分类',
    lastLogin: payload.lastLogin || new Date().toISOString().slice(0, 10),
    notes: payload.notes || '暂无心得',
    ownerUserId: req.auth.userId,
  });

  return res.status(201).json(created);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const payload = req.body ?? {};

  const updated = updateGameAccount(id, payload, req.auth);
  if (!updated) {
    return res.status(404).json({ message: '账号不存在或无权限' });
  }

  return res.json(updated);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const deleted = deleteGameAccount(id, req.auth);

  if (!deleted) {
    return res.status(404).json({ message: '账号不存在或无权限' });
  }

  return res.status(204).send();
});

export default router;
