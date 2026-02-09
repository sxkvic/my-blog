import { randomUUID } from 'node:crypto';
import express from 'express';
import {
  createMemoTask,
  deleteMemoTask,
  updateMemoTask,
  listMemoTasks,
} from './db.js';

const router = express.Router();

const PRIORITY = new Set(['高', '中', '低']);
const STATUS = new Set(['todo', 'done']);
const CATEGORY = new Set(['日常', '技术', '内容', '游戏']);

router.get('/', (req, res) => {
  res.json(listMemoTasks(req.auth));
});

router.post('/', (req, res) => {
  const payload = req.body ?? {};

  if (!payload.title || !payload.date) {
    return res.status(400).json({ message: 'title/date 为必填字段' });
  }

  const created = createMemoTask({
    id: payload.id || randomUUID(),
    title: String(payload.title).trim(),
    details: String(payload.details || '暂无备注').trim() || '暂无备注',
    date: payload.date,
    priority: PRIORITY.has(payload.priority) ? payload.priority : '中',
    status: STATUS.has(payload.status) ? payload.status : 'todo',
    category: CATEGORY.has(payload.category) ? payload.category : '日常',
    ownerUserId: req.auth.userId,
  });

  return res.status(201).json(created);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const payload = req.body ?? {};

  const updated = updateMemoTask(
    id,
    {
      title: payload.title,
      details: payload.details,
      date: payload.date,
      priority: PRIORITY.has(payload.priority) ? payload.priority : undefined,
      status: STATUS.has(payload.status) ? payload.status : undefined,
      category: CATEGORY.has(payload.category) ? payload.category : undefined,
    },
    req.auth
  );

  if (!updated) {
    return res.status(404).json({ message: '待办不存在或无权限' });
  }

  return res.json(updated);
});

router.patch('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body ?? {};

  if (!STATUS.has(status)) {
    return res.status(400).json({ message: 'status 必须为 todo 或 done' });
  }

  const updated = updateMemoTask(id, { status }, req.auth);
  if (!updated) {
    return res.status(404).json({ message: '待办不存在或无权限' });
  }

  return res.json(updated);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const deleted = deleteMemoTask(id, req.auth);

  if (!deleted) {
    return res.status(404).json({ message: '待办不存在或无权限' });
  }

  return res.status(204).send();
});

export default router;
