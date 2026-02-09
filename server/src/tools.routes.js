import { randomUUID } from 'node:crypto';
import express from 'express';
import {
  createToolLink,
  deleteToolLink,
  listToolLinks,
  updateToolLink,
} from './db.js';

const router = express.Router();

const DEFAULT_CATEGORY = '实用工具';

function normalizeUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }
  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }
  return `https://${raw}`;
}

function normalizeIconText(value, fallbackName = '') {
  const raw = String(value || '').trim();
  if (!raw) {
    return String(fallbackName || '').trim().slice(0, 1).toUpperCase() || '工';
  }
  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }
  return raw.slice(0, 2);
}

router.get('/', (_req, res) => {
  res.json(listToolLinks());
});

router.post('/', (req, res) => {
  const payload = req.body ?? {};
  const name = String(payload.name || '').trim();
  const url = normalizeUrl(payload.url);

  if (!name || !url) {
    return res.status(400).json({ message: 'name/url 为必填字段' });
  }

  const created = createToolLink({
    id: payload.id || randomUUID(),
    name,
    url,
    description: String(payload.description || '暂无描述').trim() || '暂无描述',
    category: String(payload.category || DEFAULT_CATEGORY).trim() || DEFAULT_CATEGORY,
    iconText: normalizeIconText(payload.iconText, name),
    ownerUserId: req.auth.userId,
  });

  return res.status(201).json(created);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const payload = req.body ?? {};

  const updated = updateToolLink(
    id,
    {
      name: payload.name ? String(payload.name).trim() : undefined,
      url: payload.url ? normalizeUrl(payload.url) : undefined,
      description: payload.description ? String(payload.description).trim() : undefined,
      category: payload.category ? String(payload.category).trim() : undefined,
      iconText: payload.iconText ? normalizeIconText(payload.iconText) : undefined,
    },
    req.auth
  );

  if (!updated) {
    return res.status(404).json({ message: '工具不存在或无权限' });
  }

  return res.json(updated);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const deleted = deleteToolLink(id, req.auth);

  if (!deleted) {
    return res.status(404).json({ message: '工具不存在或无权限' });
  }

  return res.status(204).send();
});

export default router;
